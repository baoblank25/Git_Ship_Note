from flask import Flask, request, jsonify
from flask_cors import CORS
from services.git_service import GitService
from services.ai_service import AIService
from services.github_service import GitHubService
import os
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing) allows Next.js frontend (running on a different port) to call this API
CORS(app)

# Initialize services
# GitService: Handles reading git repositories
# AIService: Handles AI generation with Claude
# GitHubService: Handles GitHub OAuth and API interactions
git_service = GitService()
ai_service = AIService()
github_service = GitHubService()


# Server Running Endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """
    The CORE endpoint of ShipNote!
    
    This endpoint takes a list of commits and generates a clean, categorized changelog.
    
    Expected JSON input:
    {
        "commits": [
            {
                "hash": "a83b1c9",
                "message": "fix(auth): resolve password reset token bug",
                "author": "John Doe",
                "date": "2024-11-08T10:30:00"
            },
            ...
        ],
        "from": "v1.0.0",  # Optional: starting reference
        "to": "HEAD"        # Optional: ending reference
    }
    
    Returns JSON:
    {
        "success": true,
        "notes": "# Release Notes\n\n## ✨ New Features\n- Added dark mode..."
    }
    """
    return jsonify({"status": "healthy"}), 200


# Main CHANGELOG Generation Endpoint
@app.route('/api/generate-notes', methods=['POST']) 
def generate_notes():
    try:
        # Extract data from the incoming request
        data = request.json
        commits = data.get('commits', [])
        from_ref = data.get('from', None)
        to_ref = data.get('to', 'HEAD')
        
        # Validation: Make sure we have commits to process
        if not commits:
            return jsonify({
                "success": False,
                "error": "No commits provided"
            }), 400
        
        # Call our AI service to generate the release notes
        # This is where the magic happens - Claude reads the commits
        # and turns them into human-readable notes
        release_notes = ai_service.generate_release_notes(commits, from_ref, to_ref)
        
        # Return success response with the generated notes
        return jsonify({
            "success": True,
            "notes": release_notes,
            "commit_count": len(commits)
        }), 200
        
    except Exception as e:
        # If anything goes wrong, return an error response
        print(f"Error in generate_notes: {str(e)}")  # Log to console for debugging
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    

@app.route('/api/fetch-commits', methods=['POST'])
def fetch_commits():
    """
    This endpoint reads commits directly from a local git repository.
    Useful for the CLI tool that has direct access to the repo.
    
    Expected JSON input:
    {
        "repo_path": "/path/to/repo",
        "from": "v1.0.0",  # Optional: starting commit/tag
        "to": "HEAD"       # Optional: ending commit/tag
    }
    
    Returns JSON:
    {
        "success": true,
        "commits": [
            {
                "hash": "a83b1c9",
                "message": "fix(auth): resolve password reset token bug",
                "author": "John Doe",
                "date": "2024-11-08T10:30:00",
                "files_changed": 3
            },
            ...
        ]
    }
    """

    try:
        # Extract parameters from request
        data = request.json
        repo_path = data.get('repo_path')
        from_ref = data.get('from', None)
        to_ref = data.get('to', 'HEAD')
        
        # Validation: Ensure repo path is provided
        if not repo_path:
            return jsonify({
                "success": False,
                "error": "Repository path is required"
            }), 400
        
        # Use GitService to extract commits from the repository
        commits = git_service.get_commits(repo_path, from_ref, to_ref)
        
        # Return the commits
        return jsonify({
            "success": True,
            "commits": commits,
            "count": len(commits)
        }), 200
        
    except Exception as e:
        # Handle errors (e.g., invalid repo path, git errors)
        print(f"Error in fetch_commits: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    

# Combined Endpoint: FETCH + GENERATE
@app.route('/api/generate-from-repo', methods=['POST'])
def generate_from_repo():
    try:
        data = request.json
        repo_path = data.get('repo_path')
        from_ref = data.get('from', None)
        to_ref = data.get('to', 'HEAD')
        limit = data.get('limit', 50)  # NEW: Accept limit parameter (default 50)
        
        if not repo_path:
            return jsonify({"success": False, "error": "Repository path is required"}), 400
        
        # Pass limit to git_service
        commits = git_service.get_commits(repo_path, from_ref, to_ref, limit=limit)
        
        if not commits:
            return jsonify({"success": False, "error": "No commits found in the specified range"}), 400
        
        release_notes = ai_service.generate_release_notes(commits, from_ref, to_ref)
        
        return jsonify({
            "success": True,
            "commits": commits,
            "notes": release_notes,
            "commit_count": len(commits)
        }), 200
        
    except Exception as e:
        print(f"Error in generate_from_repo: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
    

# Quick PASTE ENDPOINT (For Website)
@app.route('/api/generate-from-text', methods=['POST'])
def generate_from_text():
    """
    Simplified endpoint for the website where users paste raw git log text.
    
    Expected JSON input:
    {
        "git_log_text": "a83b1c9 fix(auth): resolve password reset token bug\nb1d4e2a feat(ui): add new dark mode toggle\n..."
    }
    
    Returns JSON:
    {
        "success": true,
        "notes": "# Release Notes\n\n..."
    }
    """
    try:
        data = request.json
        git_log_text = data.get('git_log_text', '')
        
        if not git_log_text.strip():
            return jsonify({
                "success": False,
                "error": "No git log text provided"
            }), 400
        
        # Parse the raw text into commit objects
        # Each line is assumed to be: <hash> <message>
        commits = []
        for idx, line in enumerate(git_log_text.strip().split('\n')):
            line = line.strip()
            if not line:
                continue
            
            # Try to extract hash and message
            parts = line.split(' ', 1)
            if len(parts) >= 2:
                hash_val = parts[0]
                message = parts[1]
            else:
                # If no hash detected, treat entire line as message
                hash_val = f"commit-{idx}"
                message = line
            
            commits.append({
                "hash": hash_val,
                "message": message,
                "author": "Unknown",
                "date": ""
            })
        
        if not commits:
            return jsonify({
                "success": False,
                "error": "Could not parse any commits from the provided text"
            }), 400
        
        # Generate release notes
        release_notes = ai_service.generate_release_notes(commits, None, 'HEAD')
        
        return jsonify({
            "success": True,
            "notes": release_notes,
            "commit_count": len(commits)
        }), 200
        
    except Exception as e:
        print(f"Error in generate_from_text: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ===========================
# GITHUB OAUTH ENDPOINTS
# ===========================

@app.route('/api/github/auth', methods=['POST'])
def github_auth():
    """
    Exchange GitHub OAuth code for access token.
    
    Expected JSON input:
    {
        "code": "github_oauth_code"
    }
    
    Returns JSON:
    {
        "success": true,
        "access_token": "gho_...",
        "user": {
            "username": "johndoe",
            "name": "John Doe",
            "avatar_url": "https://...",
            "email": "john@example.com"
        }
    }
    """
    try:
        data = request.json
        code = data.get('code')
        
        if not code:
            return jsonify({
                "success": False,
                "error": "OAuth code is required"
            }), 400
        
        # Exchange code for access token
        token_result = github_service.exchange_code_for_token(code)
        
        if not token_result.get('success'):
            return jsonify(token_result), 400
        
        access_token = token_result.get('access_token')
        
        # Get user information
        user_result = github_service.get_user_info(access_token)
        
        if not user_result.get('success'):
            return jsonify({
                "success": False,
                "error": "Failed to fetch user information"
            }), 400
        
        return jsonify({
            "success": True,
            "access_token": access_token,
            "user": {
                "username": user_result.get('username'),
                "name": user_result.get('name'),
                "avatar_url": user_result.get('avatar_url'),
                "email": user_result.get('email')
            }
        }), 200
        
    except Exception as e:
        print(f"Error in github_auth: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/github/repositories', methods=['POST'])
def get_github_repositories():
    """
    Get user's GitHub repositories.
    
    Expected JSON input:
    {
        "access_token": "gho_..."
    }
    
    Returns JSON:
    {
        "success": true,
        "repositories": [
            {
                "id": 123456,
                "name": "my-repo",
                "full_name": "username/my-repo",
                "description": "A cool project",
                "private": false,
                "url": "https://github.com/username/my-repo",
                "stars": 42,
                "updated_at": "2024-01-15T10:30:00Z"
            },
            ...
        ]
    }
    """
    try:
        data = request.json
        access_token = data.get('access_token')
        
        if not access_token:
            return jsonify({
                "success": False,
                "error": "Access token is required"
            }), 400
        
        result = github_service.get_user_repositories(access_token)
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        print(f"Error in get_github_repositories: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/github/commits', methods=['POST'])
def fetch_github_commits():
    """
    Fetch commits from a GitHub repository using OAuth token.
    
    Expected JSON input:
    {
        "access_token": "gho_...",
        "owner": "username",
        "repo": "repository-name",
        "since": "2024-01-01T00:00:00Z",  # Optional
        "until": "2024-12-31T23:59:59Z",  # Optional
        "limit": 100  # Optional, default 100
    }
    
    Returns JSON:
    {
        "success": true,
        "commits": [
            {
                "hash": "a83b1c9",
                "message": "fix(auth): resolve password reset token bug",
                "author": "John Doe",
                "date": "2024-11-08T10:30:00Z",
                "url": "https://github.com/owner/repo/commit/..."
            },
            ...
        ],
        "count": 42
    }
    """
    try:
        data = request.json
        access_token = data.get('access_token')
        owner = data.get('owner')
        repo = data.get('repo')
        since = data.get('since')
        until = data.get('until')
        limit = data.get('limit', 100)
        
        if not access_token:
            return jsonify({
                "success": False,
                "error": "Access token is required"
            }), 400
        
        if not owner or not repo:
            return jsonify({
                "success": False,
                "error": "Owner and repository name are required"
            }), 400
        
        result = github_service.fetch_repo_commits(
            access_token, owner, repo, since, until, limit
        )
        
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        print(f"Error in fetch_github_commits: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/github/parse-url', methods=['POST'])
def parse_github_url():
    """
    Parse a GitHub repository URL to extract owner and repo name.
    
    Expected JSON input:
    {
        "url": "https://github.com/owner/repo"
    }
    
    Returns JSON:
    {
        "success": true,
        "owner": "owner",
        "repo": "repo"
    }
    """
    try:
        data = request.json
        url = data.get('url')
        
        if not url:
            return jsonify({
                "success": False,
                "error": "URL is required"
            }), 400
        
        parsed = github_service.parse_github_url(url)
        
        if not parsed:
            return jsonify({
                "success": False,
                "error": "Invalid GitHub URL format"
            }), 400
        
        return jsonify({
            "success": True,
            "owner": parsed['owner'],
            "repo": parsed['repo']
        }), 200
        
    except Exception as e:
        print(f"Error in parse_github_url: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/github/generate-from-url', methods=['POST'])
def generate_from_github_url():
    """
    Complete workflow: Parse GitHub URL → Fetch commits → Generate changelog.
    
    Expected JSON input:
    {
        "access_token": "gho_...",
        "repo_url": "https://github.com/owner/repo",
        "since": "2024-01-01T00:00:00Z",  # Optional
        "until": "2024-12-31T23:59:59Z",  # Optional
        "limit": 100  # Optional
    }
    
    Returns JSON:
    {
        "success": true,
        "commits": [...],
        "notes": "# Release Notes\n\n...",
        "commit_count": 42
    }
    """
    try:
        data = request.json
        access_token = data.get('access_token')
        repo_url = data.get('repo_url')
        since = data.get('since')
        until = data.get('until')
        limit = data.get('limit', 100)
        
        if not access_token:
            return jsonify({
                "success": False,
                "error": "Access token is required"
            }), 400
        
        if not repo_url:
            return jsonify({
                "success": False,
                "error": "Repository URL is required"
            }), 400
        
        # Step 1: Parse the GitHub URL
        parsed = github_service.parse_github_url(repo_url)
        if not parsed:
            return jsonify({
                "success": False,
                "error": "Invalid GitHub URL format"
            }), 400
        
        owner = parsed['owner']
        repo = parsed['repo']
        
        # Step 2: Fetch commits from GitHub
        commits_result = github_service.fetch_repo_commits(
            access_token, owner, repo, since, until, limit
        )
        
        if not commits_result.get('success'):
            return jsonify(commits_result), 400
        
        commits = commits_result.get('commits', [])
        
        if not commits:
            return jsonify({
                "success": False,
                "error": "No commits found in the specified range"
            }), 400
        
        # Step 3: Generate release notes from commits
        release_notes = ai_service.generate_release_notes(commits, since, until or 'HEAD')
        
        # Step 4: Return everything
        return jsonify({
            "success": True,
            "commits": commits,
            "notes": release_notes,
            "commit_count": len(commits)
        }), 200
        
    except Exception as e:
        print(f"Error in generate_from_github_url: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    

# Run The Server
if __name__ == '__main__':
    # Check if API key is configured
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("WARNING: ANTHROPIC_API_KEY not found in .env file!")
        print("Please create a .env file with your Claude API key.")
    else:
        print("API key loaded successfully")
    
    # Check if GitHub OAuth is configured
    if not os.getenv('GITHUB_CLIENT_ID') or not os.getenv('GITHUB_CLIENT_SECRET'):
        print("WARNING: GitHub OAuth not configured!")
        print("Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env file.")
    else:
        print("GitHub OAuth configured successfully")

    print("\nShipNote Backend starting...")
    print("API available at: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("\n")
    app.run(debug=True, port=5000)
