# ShipNote

ShipNote is an AI-powered changelog generator that transforms git commits into user-friendly release notes. It uses Claude AI to create clean, categorized changelogs that anyone can understand.

## Features

- Web application for pasting git logs and generating changelogs
- GitHub integration to fetch commits directly from repositories
- VS Code extension for generating changelogs from your workspace
- AI-powered categorization (Features, Fixes, Improvements, Documentation, etc.)
- Dark mode support
- Real-time changelog generation

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (version 16 or higher)
- Python (version 3.8 or higher)
- Git
- A text editor or IDE
- An Anthropic API key (for Claude AI)
- GitHub OAuth App credentials (for GitHub integration)

## Project Structure

```
ShipNote/
├── backend/           # Flask backend server
├── frontend/          # Next.js frontend application
│   └── ship-note/
├── cli/              # Command-line tools
└── extension/        # VS Code extension files
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

```env
# Anthropic API Key (Required)
# Get your API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# GitHub OAuth Credentials (Required for GitHub integration)
# Create a GitHub OAuth App at: https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

#### How to Get API Keys

**Anthropic API Key:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

**GitHub OAuth App:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: ShipNote
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/github/callback
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret
7. Paste both into your `.env` file

#### Start the Backend Server

```bash
python app.py
```

The backend server will start on http://localhost:5000

You should see output confirming:
- API key loaded successfully
- GitHub OAuth configured successfully

### 2. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend/ship-note
```

#### Install Node Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend/ship-note` directory with the following content:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# GitHub OAuth Client ID (must match backend .env)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

Make sure the `NEXT_PUBLIC_GITHUB_CLIENT_ID` matches the `GITHUB_CLIENT_ID` from your backend `.env` file.

#### Start the Frontend Server

```bash
npm run dev
```

The frontend will start on http://localhost:3000

### 3. Verify Installation

1. Open your browser and go to http://localhost:3000
2. You should see the ShipNote interface
3. Try connecting your GitHub account
4. Paste some git commits or fetch from a repository
5. Click "Generate" to create a changelog

## Using the Web Application

### Method 1: Paste Git Logs

1. Open your terminal in any git repository
2. Run: `git log --oneline`
3. Copy the output
4. Paste it into the "Input Commits" text area in ShipNote
5. Click "Generate" to create your changelog

### Method 2: GitHub Integration

1. Click "Connect GitHub" button
2. Authorize ShipNote to access your repositories
3. Enter a GitHub repository URL (e.g., https://github.com/username/repo)
4. Click the green "Generate" button
5. Or select a repository from the list in the GitHub modal
6. Choose a commit range (Last Week, Last 2 Weeks, Last Month, or All Commits)
7. Click "Fetch Commits" to generate the changelog

## Using the VS Code Extension

GitHub Repo of the Extension: https://github.com/baoblank25/extension

### Installation

1. Open VS Code
2. Go to the Extensions marketplace
3. Search for "GitShipNote" or "ShipNote"
4. Click Install

Or install directly from the marketplace:
https://marketplace.visualstudio.com/items?itemName=BrianBaoHoang.gitshipnote

### Configuration

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for "ShipNote"
3. Configure the backend API URL if different from default:
   - API URL: http://localhost:5000

### Using the Extension

1. Open a git repository in VS Code
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Type "ShipNote: Generate Changelog"
4. Select the commit range or enter custom dates
5. The extension will generate a changelog and save it to your workspace

Alternatively:
1. Right-click in the Explorer view
2. Select "Generate Changelog with ShipNote"
3. Follow the prompts to customize the output

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'git'`
**Solution:** Install GitPython: `pip install GitPython`

**Problem:** Backend won't start
**Solution:** Check that your `.env` file exists and has valid API keys

**Problem:** `TypeError: Client.__init__() got an unexpected keyword argument 'proxies'`
**Solution:** Downgrade httpx: `pip install httpx==0.27.2`

### Frontend Issues

**Problem:** "Failed to fetch" error when generating
**Solution:** Make sure the backend server is running on port 5000

**Problem:** GitHub connection not working
**Solution:** Verify your GitHub OAuth credentials match in both `.env` and `.env.local` files

**Problem:** Changes not reflecting
**Solution:** Restart both frontend and backend servers

### GitHub Integration Issues

**Problem:** "Access token not found"
**Solution:** Reconnect your GitHub account and try again

**Problem:** "Unknown" authors in changelog
**Solution:** Make sure you're using the latest version and the backend server has been restarted

## Development

### Backend Development

The backend uses Flask and includes:
- `services/ai_service.py` - Handles Claude AI integration
- `services/git_service.py` - Processes local git repositories
- `services/github_service.py` - Handles GitHub API and OAuth
- `app.py` - Main Flask application with API endpoints

### Frontend Development

The frontend uses Next.js 16 with TypeScript and includes:
- `app/page.tsx` - Main application page
- `components/GitHubConnectModal.tsx` - GitHub integration modal
- `lib/api.ts` - API client functions
- `lib/github.ts` - GitHub OAuth utilities

## API Endpoints

- `GET /health` - Health check
- `POST /api/generate-notes` - Generate changelog from commits array
- `POST /api/generate-from-text` - Generate from pasted git log text
- `POST /api/github/auth` - GitHub OAuth authentication
- `POST /api/github/repositories` - Get user repositories
- `POST /api/github/commits` - Fetch repository commits
- `POST /api/github/generate-from-url` - Generate changelog from GitHub URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub: https://github.com/baoblank25/Git_Ship_Note/issues
- Check existing documentation in this README

## Acknowledgments

- Built with Claude AI by Anthropic
- Uses Next.js, Flask, and GitPython
- GitHub API integration for seamless repository access


