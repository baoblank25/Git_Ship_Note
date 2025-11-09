"""
GitHub Service for ShipNote
Handles GitHub API interactions including OAuth and repository operations
"""

import requests
import os
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()


class GitHubService:
    def __init__(self):
        self.client_id = os.getenv("GITHUB_CLIENT_ID")
        self.client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        self.api_base = "https://api.github.com"
        
        if not self.client_id or not self.client_secret:
            print("WARNING: GitHub OAuth credentials not configured")
            print("Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env file")
    
    def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """
        Exchange OAuth code for access token
        
        Args:
            code: The OAuth code from GitHub callback
            
        Returns:
            Dict with access_token and token_type
        """
        url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            result = response.json()
            
            if "access_token" in result:
                return {
                    "success": True,
                    "access_token": result["access_token"],
                    "token_type": result.get("token_type", "bearer")
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error_description", "Failed to get access token")
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """
        Get authenticated user's information
        
        Args:
            access_token: GitHub access token
            
        Returns:
            Dict with user information
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        try:
            response = requests.get(f"{self.api_base}/user", headers=headers)
            response.raise_for_status()
            user_data = response.json()
            
            return {
                "success": True,
                "username": user_data.get("login"),
                "name": user_data.get("name"),
                "avatar_url": user_data.get("avatar_url"),
                "email": user_data.get("email")
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_user_repositories(self, access_token: str, per_page: int = 30) -> Dict[str, Any]:
        """
        Get user's repositories
        
        Args:
            access_token: GitHub access token
            per_page: Number of repos per page
            
        Returns:
            Dict with list of repositories
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        try:
            response = requests.get(
                f"{self.api_base}/user/repos",
                headers=headers,
                params={"per_page": per_page, "sort": "updated"}
            )
            response.raise_for_status()
            repos_data = response.json()
            
            repositories = []
            for repo in repos_data:
                repositories.append({
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo.get("description", ""),
                    "private": repo["private"],
                    "url": repo["html_url"],
                    "clone_url": repo["clone_url"],
                    "stars": repo["stargazers_count"],
                    "updated_at": repo["updated_at"]
                })
            
            return {
                "success": True,
                "repositories": repositories
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def fetch_repo_commits(self, access_token: str, owner: str, repo: str, 
                          since: Optional[str] = None, until: Optional[str] = None,
                          limit: int = 100) -> Dict[str, Any]:
        """
        Fetch commits from a GitHub repository
        
        Args:
            access_token: GitHub access token
            owner: Repository owner
            repo: Repository name
            since: ISO 8601 date string (optional)
            until: ISO 8601 date string (optional)
            limit: Maximum number of commits to fetch
            
        Returns:
            Dict with list of commits
        """
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        params = {"per_page": min(limit, 100)}
        if since:
            params["since"] = since
        if until:
            params["until"] = until
        
        try:
            response = requests.get(
                f"{self.api_base}/repos/{owner}/{repo}/commits",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            commits_data = response.json()
            
            commits = []
            for commit in commits_data:
                commit_obj = commit.get("commit", {})
                
                # Try to get author name from multiple sources
                author_name = "Unknown"
                
                # First try: GitHub user (authenticated author)
                if commit.get("author") and commit["author"].get("login"):
                    author_name = commit["author"]["login"]
                # Second try: Git commit author name
                elif commit_obj.get("author") and commit_obj["author"].get("name"):
                    author_name = commit_obj["author"]["name"]
                # Third try: Committer if author not available
                elif commit_obj.get("committer") and commit_obj["committer"].get("name"):
                    author_name = commit_obj["committer"]["name"]
                
                commits.append({
                    "hash": commit["sha"][:7],  # Short hash
                    "message": commit_obj.get("message", ""),
                    "author": author_name,
                    "date": commit_obj.get("author", {}).get("date", ""),
                    "url": commit.get("html_url", "")
                })
            
            return {
                "success": True,
                "commits": commits,
                "count": len(commits)
            }
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return {
                    "success": False,
                    "error": "Repository not found or you don't have access"
                }
            elif e.response.status_code == 403:
                return {
                    "success": False,
                    "error": "Access forbidden. Check your permissions."
                }
            else:
                return {
                    "success": False,
                    "error": f"GitHub API error: {str(e)}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def parse_github_url(self, url: str) -> Optional[Dict[str, str]]:
        """
        Parse GitHub repository URL to extract owner and repo name
        
        Args:
            url: GitHub repository URL
            
        Returns:
            Dict with owner and repo, or None if invalid
        """
        # Remove trailing slashes and .git
        url = url.rstrip('/').replace('.git', '')
        
        # Handle different GitHub URL formats
        # https://github.com/owner/repo
        # github.com/owner/repo
        # git@github.com:owner/repo
        
        if 'github.com' not in url:
            return None
        
        # Extract the path after github.com
        if 'github.com/' in url:
            parts = url.split('github.com/')[-1].split('/')
        elif 'github.com:' in url:
            parts = url.split('github.com:')[-1].split('/')
        else:
            return None
        
        if len(parts) >= 2:
            return {
                "owner": parts[0],
                "repo": parts[1]
            }
        
        return None
