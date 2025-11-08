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
        
    def generate_changelog(self, git_log: str) -> Dict[str, Any]:
        system_prompt = """
        You are a professional technical writer specializing in creating clean, user-friendly changelogs.

        Your task is to analyze git commit history and create a changelog that:

        1. **Categorizes commits** into:
        - 🎉 Features: New functionality, capabilities, or additions
        - 🐛 Fixes: Bug fixes, error corrections, or patches
        - ⚡ Improvements: Enhancements, optimizations, or refactoring
        - 📚 Documentation: Docs, README, or comment updates
        - 🔧 Other: Configuration, dependencies, or miscellaneous changes

        2. **Filters out noise**:
        - Ignore: merge commits, version bumps, "WIP" commits
        - Ignore: trivial updates like "fix typo", "update .gitignore"
        - Ignore: developer-only changes that don't affect users

        3. **Writes clearly**:
        - Use plain, non-technical language
        - Focus on WHAT changed and WHY it matters to users
        - Keep descriptions concise (1-2 lines max)
        - Remove commit hashes and technical jargon

        4. **Formats in Markdown**:
        🎉 Features
        Brief description of what was added

        🐛 Fixes
        Brief description of what was fixed

        ⚡ Improvements
        Brief description of what was improved

        text

        **Important Rules:**
        - Only include categories that have actual content
        - If there are no meaningful changes, say "No significant changes"
        - Group similar commits together
        - Be concise and user-focused
        - Use bullet points, not numbered lists"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
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
        commit abc123
        Author: Dev <dev@example.com>
        Date: Mon Nov 4 10:00:00 2024

            Add user authentication

        commit def456
        Author: Dev <dev@example.com>
        Date: Mon Nov 4 09:00:00 2024

        Fix login bug where password wasn't validating
        """
    
    result = service.generate_changelog(sample_log)
    print(result["changelog"] if result["success"] else result["error"])