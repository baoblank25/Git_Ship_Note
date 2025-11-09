import anthropic
import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY not found. "
                "Please set it in your .env file or environment variables. "
                "Get your API key from: https://console.anthropic.com/"
            )
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
    
    def generate_release_notes(self, commits: list, from_ref: str = None, to_ref: str = 'HEAD') -> str:
        """
        Generate release notes from a list of commits.
        This method is called by app.py endpoints.
        
        Args:
            commits: List of commit dictionaries with hash, message, author, date
            from_ref: Starting reference (optional)
            to_ref: Ending reference
            
        Returns:
            Markdown-formatted release notes as a string
        """
        # Format commits into readable text
        commit_text = "\n".join([
            f"- {commit['hash']}: {commit['message']} (by {commit.get('author', 'Unknown')})"
            for commit in commits
        ])
        
        # Use the existing generate_changelog method
        git_log = f"Commits from {from_ref or 'start'} to {to_ref}:\n\n{commit_text}"
        result = self.generate_changelog(git_log)
        
        if result['success']:
            return result['changelog']
        else:
            raise Exception(result['error'])
        
    def generate_changelog(self, git_log: str) -> Dict[str, Any]:
        system_prompt = """You are a professional technical writer who creates simple, easy-to-read changelogs.

Your task is to analyze git commits and create a changelog that anyone can understand:

1. **Categorize commits** into:
   - Features: New stuff added
   - Fixes: Bugs that were fixed
   - Improvements: Things that work better now
   - Deletions: Things that were removed
   - Documentation: Updates to docs or comments
   - Other (vague commit message): Config changes or unclear updates

2. **Skip the noise**:
   - Ignore: merge commits, version bumps, "WIP" commits
   - Ignore: trivial stuff like "fix typo", "update .gitignore"
   - Ignore: developer-only changes that don't affect users

3. **Write simply with file information**:
   - Each item should be 1-2 lines with easy-to-understand language
   - **Always mention which file(s) were changed, added, or deleted** (if available in the commit info)
   - Format file mentions like: "in `filename.py`" or "to `folder/file.js`"
   - Use simple, everyday words - avoid technical jargon
   - Focus on WHAT changed in plain English
   - For features: say what new thing was added and which files
   - For fixes: say what problem was solved and which files were fixed
   - For improvements: say what got better and which files were updated
   - For deletions: say what was removed (files or features)
   - Remove commit hashes
   - **Always include the author name** from the commit
   - Include the date and time

4. **Format with spacing**:
## Features:
- Added new login system in `auth.py` - by John Doe (Nov 4, 10:00 AM)

- Created dark mode toggle in `settings.js` - by Jane Smith (Nov 4, 9:30 AM)

## Fixes:
- Fixed password bug in `auth.py` - by John Doe (Nov 3, 2:30 PM)

- Resolved crash in `app.js` - by Bob Johnson (Nov 3, 1:15 PM)

## Improvements:
- Faster loading in `index.html` - by Jane Smith (Nov 2, 4:15 PM)

- Better error messages in `api.py` - by John Doe (Nov 2, 2:00 PM)

## Deletions:
- Removed old config file `old_config.json` - by Bob Johnson (Nov 1, 3:00 PM)

- Deleted unused feature from `legacy.py` - by Jane Smith (Nov 1, 2:00 PM)

## Documentation:
- Updated README.md with installation guide - by Jane Smith (Nov 1, 9:00 AM)

## Other (vague commit message):
- Updated dependencies in `package.json` - by John Doe (Oct 31, 3:45 PM)

**Important Rules:**
- Only include categories that have items
- **Always mention the file name(s) affected** when available
- Use simple, everyday language - no technical terms
- Keep it short (1-2 lines max per item)
- Use bullet points, not numbers
- **Add a blank line after each bullet point**
- **Always include " - by <Author Name>" before the timestamp**
- Always include the date and time in parentheses
- Make it easy for anyone to understand
- For deletions, clearly state what file or feature was removed"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                temperature=0.3,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": f"Here is the git log to convert into a changelog:\n\n{git_log}"
                    }
                ]
            )
            
            changelog = message.content[0].text
            total_tokens = message.usage.input_tokens + message.usage.output_tokens
            
            return {
                "success": True,
                "changelog": changelog,
                "tokens_used": total_tokens,
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens
            }
            
        except anthropic.APIError as e:
            return {
                "success": False,
                "error": f"API Error: {str(e)}",
                "changelog": None,
                "tokens_used": 0
            }
        except anthropic.APIConnectionError as e:
            return {
                "success": False,
                "error": f"Connection Error: Unable to reach Claude API. Check your internet connection.",
                "changelog": None,
                "tokens_used": 0
            }
        except anthropic.RateLimitError as e:
            return {
                "success": False,
                "error": f"Rate Limit Error: Too many requests. Please try again later.",
                "changelog": None,
                "tokens_used": 0
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}",
                "changelog": None,
                "tokens_used": 0
            }

if __name__ == "__main__":
    service = AIService()
    
    sample_log = """
commit 0b79cedf367caaf9e897b9eff74c079a4c71f897 (HEAD -> main)
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:24:30 2025 -0700

    ai_service changes

M       services/ai_service.py

commit 5e0314ddd2a0e3d8712917994ceaab64c36328ff
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:11:56 2025 -0700

    new changes

A       cli/new_feature.py
"""
    
    result = service.generate_changelog(sample_log)
    print(result["changelog"] if result["success"] else result["error"])
