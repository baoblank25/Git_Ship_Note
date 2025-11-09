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
    
    def get_commits(self, repo_path: str, from_ref: Optional[str] = None, to_ref: str = 'HEAD', limit: int = 50) -> List[Dict]:
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
            repo = Repo(repo_path)
            if from_ref:
                commit_range = f"{from_ref}..{to_ref}"
            else:
                commit_range = to_ref
            commits = []
            for commit in repo.iter_commits(commit_range, max_count=limit):
                commit_date = datetime.fromtimestamp(commit.committed_date).strftime('%b %d, %I:%M %p')
                commits.append({
                    "hash": commit.hexsha[:7],
                    "message": commit.message.strip(),
                    "author": commit.author.name,
                    "date": commit_date,
                    "files_changed": len(commit.stats.files)
                })
            return commits
        except Exception as e:
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
