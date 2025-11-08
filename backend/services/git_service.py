"""
Git Service
===========
This service handles all Git repository operations.
It reads commit history from local Git repositories.
"""

from git import Repo
from datetime import datetime
from typing import List, Dict, Optional


class GitService:
    """
    Service for interacting with Git repositories.
    Uses GitPython library to read commit history.
    """
    
    def get_commits(self, repo_path: str, from_ref: Optional[str] = None, to_ref: str = 'HEAD') -> List[Dict]:
        """
        Fetch commits from a Git repository.
        
        Args:
            repo_path: Path to the local git repository
            from_ref: Starting commit/tag (optional, e.g., "v1.0.0")
            to_ref: Ending commit/tag (default: "HEAD")
        
        Returns:
            List of commit dictionaries with hash, message, author, date, etc.
        
        Example:
            commits = git_service.get_commits("/path/to/repo", "v1.0.0", "HEAD")
        """
        try:
            # Open the Git repository
            repo = Repo(repo_path)
            
            # Build commit range string
            # If from_ref is provided: "from_ref..to_ref" (e.g., "v1.0.0..HEAD")
            # If not provided: just "to_ref" (e.g., "HEAD")
            if from_ref:
                commit_range = f"{from_ref}..{to_ref}"
            else:
                commit_range = to_ref
            
            # Extract commits
            commits = []
            for commit in repo.iter_commits(commit_range, max_count=100):
                # Convert each Git commit into a dictionary
                commits.append({
                    "hash": commit.hexsha[:7],  # Short hash (first 7 characters)
                    "message": commit.message.strip(),  # Commit message
                    "author": commit.author.name,  # Author name
                    "date": datetime.fromtimestamp(commit.committed_date).isoformat(),  # ISO date format
                    "files_changed": len(commit.stats.files)  # Number of files modified
                })
            
            return commits
            
        except Exception as e:
            # Re-raise with more context
            raise Exception(f"Failed to fetch commits from {repo_path}: {str(e)}")


# Test code (only runs when you execute this file directly)
if __name__ == "__main__":
    print("Testing GitService...")
    
    # Example: Read commits from the current repository
    git_service = GitService()
    
    try:
        # Get last 5 commits from current directory
        commits = git_service.get_commits(".", to_ref="HEAD")
        print(f"\nFound {len(commits)} commits:")
        
        for commit in commits[:5]:  # Show first 5
            print(f"  {commit['hash']}: {commit['message'][:50]}...")
    
    except Exception as e:
        print(f"Error: {e}")
