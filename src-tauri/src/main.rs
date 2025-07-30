#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde_json::json;
use std::fs;
use regex::Regex;
use chrono::NaiveDate;
use keyring::Entry;
use tauri::api::path;


// Helper function to get OpenAI API key from secure storage
fn get_openai_key() -> Result<String, String> {
    let entry = Entry::new("worklog-app", "openai_key")
        .map_err(|e| format!("Failed to access keyring: {}", e))?;
    
    entry.get_password()
        .map_err(|_| "OpenAI API key not found. Please set it in Settings.".to_string())
}

#[tauri::command]
async fn save_openai_key(api_key: String) -> Result<(), String> {
    let entry = Entry::new("worklog-app", "openai_key")
        .map_err(|e| format!("Failed to access keyring: {}", e))?;
    
    entry.set_password(&api_key)
        .map_err(|e| format!("Failed to save API key: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn get_openai_key_status() -> Result<bool, String> {
    let entry = Entry::new("worklog-app", "openai_key")
        .map_err(|e| format!("Failed to access keyring: {}", e))?;
    
    // Check if key exists (don't return the actual key)
    Ok(entry.get_password().is_ok())
}

#[tauri::command]
async fn delete_openai_key() -> Result<(), String> {
    let entry = Entry::new("worklog-app", "openai_key")
        .map_err(|e| format!("Failed to access keyring: {}", e))?;
    
    entry.delete_password()
        .map_err(|e| format!("Failed to delete API key: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn process_worklog(entries: Vec<String>) -> Result<(), String> {
    // Get API key from secure storage
    let api_key = get_openai_key()?;
    
    // Use app data directory to avoid triggering rebuilds
    let app_data_dir = path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app data directory")?;
    let worklog_path = app_data_dir.join("worklog.md");
    let backup_dir = app_data_dir.join("backups");

    // Ensure backup directory exists
    if let Err(e) = fs::create_dir_all(&backup_dir) {
        return Err(format!("Failed to create backup directory: {}", e));
    }

    // Read current worklog
    let current_log = match fs::read_to_string(&worklog_path) {
        Ok(content) => content,
        Err(_) => "# Daily Work Log\n\nThis is your worklog file where daily achievements will be tracked and organized.\n".to_string(),
    };

    // Create backup with timestamp
    let timestamp = chrono::Local::now().format("%Y-%m-%dT%H-%M-%S");
    let backup_path = backup_dir.join(format!("worklog-{}.md", timestamp));
    if let Err(e) = fs::write(&backup_path, &current_log) {
        return Err(format!("Failed to create backup: {}", e));
    }

    let system_prompt = r#"
        You are an AI journaling assistant that maintains a yearly worklog in Markdown format.

        You will receive:
        1. A list of new work wins (tasks, accomplishments)
        2. The current worklog

        Update the worklog as follows:

        - Group all tasks under relevant **topic headers** (e.g., "Products", "Get Started Page", etc.).
        - If a topic already exists in the log, append the new entries to that section.
        - If the topic is new, create a new section header and add entries underneath it.
        - For each entry:
        - Use the exact phrasing provided by the user.
        - Add the current date in parentheses at the end, like (Jul 29, 2025).
        - Do not group tasks under "Today's entries" or any date-based header.
        - Do not generate summaries or sub-bullets.
        - Maintain a clean, organized, topical structure.

        Only return the full updated Markdown document.
        "#;


    let user_prompt = format!(
        "Here is the current worklog:\n\n{}\n\nHere are new work entries to add:\n\n{}",
        current_log,
        entries.join("\n")
    );

    // Make OpenAI API call with timeout
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    let request_body = json!({
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.1
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("OpenAI API request failed: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error: {}", error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    let updated_markdown = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("Invalid response format from OpenAI")?;

    // Write updated worklog
    fs::write(&worklog_path, updated_markdown)
        .map_err(|e| format!("Failed to write updated worklog: {}", e))?;

    Ok(())
}


#[tauri::command]
async fn read_worklog() -> Result<String, String> {
    let app_data_dir = path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app data directory")?;
    let worklog_path = app_data_dir.join("worklog.md");
    
    match fs::read_to_string(&worklog_path) {
        Ok(content) => Ok(content),
        Err(_) => {
            // Create default worklog if it doesn't exist
            let default_content = "# Daily Work Log\n\nThis is your worklog file where daily achievements will be tracked and organized.\n";
            let _ = fs::create_dir_all(&app_data_dir);
            let _ = fs::write(&worklog_path, default_content);
            Ok(default_content.to_string())
        }
    }
}

#[tauri::command]
async fn undo_last_change() -> Result<(), String> {
    let app_data_dir = path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app data directory")?;
    let backup_dir = app_data_dir.join("backups");
    let worklog_path = app_data_dir.join("worklog.md");

    // Find the most recent backup
    let mut backup_files = fs::read_dir(backup_dir)
        .map_err(|e| format!("Failed to read backup directory: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.extension()? == "md" && path.file_name()?.to_str()?.starts_with("worklog-") {
                Some(path)
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    backup_files.sort_by(|a, b| {
        fs::metadata(b)
            .and_then(|m| m.modified())
            .unwrap_or(std::time::UNIX_EPOCH)
            .cmp(&fs::metadata(a)
                .and_then(|m| m.modified())
                .unwrap_or(std::time::UNIX_EPOCH))
    });

    if let Some(most_recent_backup) = backup_files.first() {
        let backup_content = fs::read_to_string(most_recent_backup)
            .map_err(|e| format!("Failed to read backup file: {}", e))?;
        
        fs::write(&worklog_path, backup_content)
            .map_err(|e| format!("Failed to restore from backup: {}", e))?;
        
        // Remove the backup file we just used
        fs::remove_file(most_recent_backup)
            .map_err(|e| format!("Failed to remove used backup: {}", e))?;
        
        Ok(())
    } else {
        Err("No backup files found".to_string())
    }
}

#[tauri::command]
async fn generate_summary_report(
    start_date: String,
    end_date: String, 
    report_style: String
) -> Result<String, String> {
    // Get API key from secure storage
    let api_key = get_openai_key()?;

    // Read current worklog
    let app_data_dir = path::app_data_dir(&tauri::Config::default())
        .ok_or("Failed to get app data directory")?;
    let worklog_path = app_data_dir.join("worklog.md");
    let current_log = match fs::read_to_string(&worklog_path) {
        Ok(content) => content,
        Err(_) => return Err("Worklog file not found. Please add some entries first.".to_string()),
    };

    // Parse dates
    let start_date = NaiveDate::parse_from_str(&start_date, "%Y-%m-%d")
        .map_err(|_| "Invalid start date format. Use YYYY-MM-DD.".to_string())?;
    let end_date = NaiveDate::parse_from_str(&end_date, "%Y-%m-%d")
        .map_err(|_| "Invalid end date format. Use YYYY-MM-DD.".to_string())?;

    // Filter worklog entries by date range
    let filtered_content = filter_worklog_by_date_range(&current_log, start_date, end_date)?;
    
    if filtered_content.trim().is_empty() {
        return Err("No entries found in the specified date range.".to_string());
    }

    // Create report-specific system prompt based on style
    let system_prompt = match report_style.as_str() {
        "executive" => {
            "You are creating an executive summary report. Focus on high-level achievements, major milestones, and strategic accomplishments. Group by themes/projects and highlight business impact. Keep it concise and professional for leadership review."
        },
        "detailed" => {
            "You are creating a detailed report. Organize all entries by category/project, maintain specific details, and present a comprehensive view of all work completed. Include technical details and maintain the original structure while improving readability."
        },
        "chronological" => {
            "You are creating a chronological report. Organize entries by month, showing progression over time. Within each month, group by theme/project. This should tell the story of work evolution during the specified period."
        },
        "accomplishments" => {
            "You are creating an accomplishments-focused report. Filter and highlight only major achievements, completed projects, successful launches, and significant milestones. Ignore routine tasks and focus on impactful wins."
        },
        _ => {
            "You are creating a summary report. Organize the content logically by theme/project and present it in a clear, professional format suitable for review purposes."
        }
    };

    let user_prompt = format!(
        "Please create a {} summary report for the period from {} to {}.\n\nHere is the filtered worklog content:\n\n{}\n\nGenerate a well-formatted, professional report in Markdown format.",
        report_style, start_date, end_date, filtered_content
    );

    // Make OpenAI API call with timeout
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    let request_body = json!({
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": 4000,
        "temperature": 0.1
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("OpenAI API request failed: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error: {}", error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    let report = response_json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or("Invalid response format from OpenAI")?;

    Ok(report.to_string())
}

fn filter_worklog_by_date_range(content: &str, start_date: NaiveDate, end_date: NaiveDate) -> Result<String, String> {
    // Regex to match dates in parentheses like (Jul 29, 2025) or (July 29, 2025)
    let date_regex = Regex::new(r"\(([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})\)")
        .map_err(|_| "Failed to compile date regex".to_string())?;
    
    let mut filtered_lines = Vec::new();
    let mut current_section = String::new();
    let mut section_has_valid_dates = false;
    
    for line in content.lines() {
        // Check if this is a header line (starts with #)
        if line.starts_with('#') {
            // Save previous section if it had valid dates
            if section_has_valid_dates && !current_section.trim().is_empty() {
                filtered_lines.push(current_section.clone());
            }
            // Start new section
            current_section = format!("{}\n", line);
            section_has_valid_dates = false;
        } else {
            // Add line to current section
            current_section.push_str(&format!("{}\n", line));
            
            // Check if this line contains a date in our range
            if let Some(captures) = date_regex.captures(line) {
                let month_str = &captures[1];
                let day: u32 = captures[2].parse().unwrap_or(1);
                let year: i32 = captures[3].parse().unwrap_or(2025);
                
                // Convert month name to number
                let month = match month_str.to_lowercase().as_str() {
                    "jan" | "january" => 1,
                    "feb" | "february" => 2,
                    "mar" | "march" => 3,
                    "apr" | "april" => 4,
                    "may" => 5,
                    "jun" | "june" => 6,
                    "jul" | "july" => 7,
                    "aug" | "august" => 8,
                    "sep" | "september" => 9,
                    "oct" | "october" => 10,
                    "nov" | "november" => 11,
                    "dec" | "december" => 12,
                    _ => continue,
                };
                
                if let Some(entry_date) = NaiveDate::from_ymd_opt(year, month, day) {
                    if entry_date >= start_date && entry_date <= end_date {
                        section_has_valid_dates = true;
                    }
                }
            }
        }
    }
    
    // Don't forget the last section
    if section_has_valid_dates && !current_section.trim().is_empty() {
        filtered_lines.push(current_section);
    }
    
    Ok(filtered_lines.join("\n"))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            process_worklog,
            read_worklog,
            undo_last_change,
            generate_summary_report,
            save_openai_key,
            get_openai_key_status,
            delete_openai_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}