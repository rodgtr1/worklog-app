# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run tauri dev` - Start development server with hot reload
- `npm run build` - Build TypeScript and frontend assets  
- `npm run tauri build` - Build production desktop app

### Project Setup
- `npm install` - Install dependencies
- API key must be configured through the Settings tab (uses OS keychain storage)

## Architecture Overview

This is a **Tauri + React desktop application** for tracking daily work achievements with AI-powered organization.

### Core Architecture Pattern
- **Split-panel desktop UI**: Input form (left) + live worklog viewer (right)
- **Tauri bridge**: React frontend invokes Rust backend functions via `@tauri-apps/api`
- **AI processing pipeline**: User entries → OpenAI GPT-4o → organized markdown output
- **Secure credential storage**: API keys stored in OS keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)

### Key Data Flow
1. User enters 1-3 work wins in PromptInput component
2. Frontend calls `processWorklog()` Tauri command
3. Rust backend retrieves API key from keyring, calls OpenAI API
4. AI organizes entries by topic, adds timestamps, returns updated markdown
5. System creates timestamped backup, writes new worklog.md
6. WorklogViewer auto-refreshes to show changes

### Critical File Relationships

**Frontend Components (`src/components/`)**:
- `App.tsx` - Main layout with tab navigation (Input/Reports/Settings)
- `PromptInput.tsx` - Daily input form, validates API key presence
- `WorklogViewer.tsx` - Markdown renderer using react-markdown
- `ReportGenerator.tsx` - Date-range report generation with 4 styles
- `Settings.tsx` - Secure API key management interface

**Backend Integration (`src/lib/fileUtils.ts`)**:
- Wraps all Tauri invoke calls to Rust backend
- Functions: `processWorklog`, `generateSummaryReport`, `readWorklog`, `undoLastChange`
- Keychain functions: `saveOpenAIKey`, `getOpenAIKeyStatus`, `deleteOpenAIKey`

**Rust Backend (`src-tauri/src/main.rs`)**:
- OpenAI API integration with GPT-4o model
- Secure keyring storage using `keyring` crate
- File operations: worklog.md management, timestamped backups
- Date-range filtering for reports using regex parsing
- All API calls include 30-second timeout

### Security Architecture
- **OS-level credential storage**: Uses keyring crate for secure API key storage
- **Restricted filesystem access**: Tauri config limits scope to `assets/**` and system dirs
- **Content Security Policy**: Restricts resource loading to prevent XSS
- **Input validation**: API key format validation on frontend and backend

### Data Storage
- **Main worklog**: `assets/worklog.md` (markdown format)
- **Backups**: `assets/backups/worklog-YYYY-MM-DDTHH-MM-SS.md`
- **API keys**: OS keychain with service name "worklog-app"

### Important Configuration Notes
- OpenAI model configured in Rust backend (currently GPT-4o)
- Tauri security permissions in `tauri.conf.json` (filesystem, CSP, shell access)
- Window size: 1200x800px default, 800x600px minimum
- The README.md mentions "Show Diffs" functionality but this has been removed from the current codebase