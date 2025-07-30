# Daily Work Log Desktop App

A cross-platform desktop application built with Tauri and React that helps you track daily work achievements using AI-powered organization.

## Features

- **Split-panel interface**: Input on the left, live worklog preview on the right
- **AI-powered organization**: Uses OpenAI GPT-4o to intelligently group and timestamp entries
- **Secure API key storage**: Uses your system's keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **Smart report generation**: Create date-range reports in multiple formats (Executive, Detailed, Chronological, Accomplishments)
- **Export functionality**: Download reports as Markdown files or copy to clipboard
- **Local storage**: All data stays on your machine
- **Automatic backups**: Creates timestamped backups before each update
- **One-click undo**: Restore previous versions instantly
- **Markdown format**: Your worklog is saved as readable Markdown

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://rustup.rs/) (latest stable)
- [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) for your platform
- OpenAI API key

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your OpenAI API key:**
   - Launch the app with `npm run tauri dev`
   - Go to the **Settings** tab
   - Enter your OpenAI API key (it will be securely stored in your system keychain)
   
   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. **Run in development mode:**
   ```bash
   npm run tauri dev
   ```

4. **Build for production:**
   ```bash
   npm run tauri build
   ```

## Usage

### Daily Input Mode
1. **Add 1-3 work achievements** in the text area, one per line
2. **Click "Add to Worklog"** to process your entries with AI
3. **View the updated worklog** in the right panel immediately
4. **Use "Undo Last"** if you need to revert changes

### Report Generation Mode
1. **Click "Generate Reports"** tab in the header
2. **Select date range** (or click "Set Last 6 Months" for quick setup)
3. **Choose report style**:
   - **Executive Summary**: High-level achievements for leadership
   - **Detailed Report**: Comprehensive view with technical details
   - **Chronological**: Month-by-month progression timeline
   - **Major Accomplishments**: Focus on significant wins only
4. **Click "Generate Report"** to create your summary
5. **Copy or Download** the generated report as needed

## File Structure

```
worklog-app/
├── src/
│   ├── components/
│   │   ├── PromptInput.tsx    # Daily input form
│   │   ├── WorklogViewer.tsx  # Markdown viewer
│   │   ├── ReportGenerator.tsx # Report creation
│   │   └── Settings.tsx       # Secure API key management
│   ├── lib/
│   │   └── fileUtils.ts       # Tauri API interactions
│   └── App.tsx                # Main application layout
└── src-tauri/
    └── src/
        └── main.rs            # Rust backend with OpenAI integration
```

**Data Storage:**
- Worklog file: System app data directory (e.g., `~/Library/Application Support/com.worklog.app/worklog.md`)
- Backups: Same directory under `backups/` folder
- API key: Secure OS keychain storage

## How It Works

1. **Input Processing**: Your daily entries are sent to OpenAI GPT-4o along with your current worklog
2. **AI Organization**: The AI intelligently groups similar tasks and adds timestamps to existing entries
3. **Backup Creation**: Before any changes, a timestamped backup is created
4. **File Update**: The updated worklog replaces the current file
5. **Live Preview**: The right panel automatically refreshes to show changes

## Configuration

- **OpenAI Model**: Uses GPT-4o by default (configurable in `src-tauri/src/main.rs`)
- **File Locations**: Worklog and backups stored in `assets/` directory
- **Window Size**: 1200x800px with 800x600px minimum (configurable in `tauri.conf.json`)

## Troubleshooting

- **"Failed to create backup directory"**: Check write permissions in the app directory
- **OpenAI API errors**: Verify your API key and check your usage limits
- **Build issues**: Ensure all Tauri prerequisites are installed for your platform

## Security

- **API keys**: Stored securely in OS keychain (encrypted)
  - macOS: Keychain Access
  - Windows: Windows Credential Manager  
  - Linux: Secret Service (GNOME Keyring)
- **Data privacy**: All processing happens locally except OpenAI API calls
- **No telemetry**: No data collection or tracking

## License

This project is built for personal use. Modify and distribute as needed.