from flask import Flask, request, jsonify
from flask_cors import CORS
# from services.git_service import GitService
from services.ai_service import AIService
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
# git_service = GitService()
ai_service = AIService()


# Server Running Endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """
    The CORE endpoint of GitScribe!
    
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
    """
    Convenience endpoint that combines fetch_commits + generate_notes.
    The CLI tool can call this single endpoint to do everything in one request.
    
    Expected JSON input:
    {
        "repo_path": "/path/to/repo",
        "from": "v1.0.0",
        "to": "HEAD"
    }
    
    Returns JSON:
    {
        "success": true,
        "commits": [...],
        "notes": "# Release Notes\n\n..."
    }
    """
    try:
        data = request.json
        repo_path = data.get('repo_path')
        from_ref = data.get('from', None)
        to_ref = data.get('to', 'HEAD')
        
        if not repo_path:
            return jsonify({
                "success": False,
                "error": "Repository path is required"
            }), 400
        
        # Step 1: Fetch commits from the repository
        commits = git_service.get_commits(repo_path, from_ref, to_ref)
        
        if not commits:
            return jsonify({
                "success": False,
                "error": "No commits found in the specified range"
            }), 400
        
        # Step 2: Generate release notes from those commits
        release_notes = ai_service.generate_release_notes(commits, from_ref, to_ref)
        
        # Step 3: Return both commits and notes
        return jsonify({
            "success": True,
            "commits": commits,
            "notes": release_notes,
            "commit_count": len(commits)
        }), 200
        
    except Exception as e:
        print(f"Error in generate_from_repo: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    

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
    

# Run The Server
if __name__ == '__main__':
    # Check if API key is configured
    if not os.getenv('ANTHROPIC_API_KEY'):
        print("WARNING: ANTHROPIC_API_KEY not found in .env file!")
        print("Please create a .env file with your Claude API key.")
    else:
        print("API key loaded successfully")

    print("\nShipNote Backend starting...")
    print("API available at: http://localhost:5000")
    print("Health check: http://localhost:5000/health")
    print("\n")
    app.run(debug=True, port=5000)
