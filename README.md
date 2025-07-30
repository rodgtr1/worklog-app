# Daily Work Log Desktop App

A cross-platform desktop application built with Tauri and React that helps you track daily work achievements using AI-powered organization.

## Features

- **Split-panel interface**: Input on the left, live worklog preview on the right
- **AI-powered organization**: Uses OpenAI GPT-4o to intelligently group and timestamp entries
- **Smart diff preview**: Optional "Show Diffs" mode with red/green change visualization and approve/reject workflow
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
   ```bash
   cp .env.example .env
   # Edit .env and add: OPENAI_API_KEY=your_key_here
   ```
   
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
1. **Toggle "Show Diffs"** if you want to preview changes before applying
2. **Add 1-3 work achievements** in the text area, one per line
3. **Click "Preview Changes" or "Add to Worklog"** based on your diff setting
4. **If using Show Diffs**: Review red/green changes, then click "✅ Apply Changes" or "❌ Reject Changes"
5. **View the updated worklog** in the right panel
6. **Use "Undo Last"** if you need to revert changes

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
├── assets/
│   ├── worklog.md          # Your main worklog file
│   └── backups/            # Timestamped backup files
├── src/
│   ├── components/
│   │   ├── PromptInput.tsx # Left panel input form
│   │   └── WorklogViewer.tsx # Right panel markdown viewer
│   ├── lib/
│   │   └── fileUtils.ts    # Tauri API interactions
│   └── App.tsx             # Main application layout
└── src-tauri/
    └── src/
        └── main.rs         # Rust backend with OpenAI integration
```

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

- API keys are stored locally in browser localStorage
- All data processing happens locally except for OpenAI API calls
- No telemetry or data collection

## License

This project is built for personal use. Modify and distribute as needed.