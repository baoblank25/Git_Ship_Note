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
        system_prompt = """You are a professional technical writer specializing in creating clean, user-friendly changelogs.

Your task is to analyze git commit history and create a changelog that:

1. **Categorizes commits** into:
   - Features: New functionality, capabilities, or additions
   - Fixes: Bug fixes, error corrections, or patches
   - Improvements: Enhancements, optimizations, or refactoring
   - Documentation: Docs, README, or comment updates
   - Other (vague commit message): Configuration, dependencies, or miscellaneous changes that lack clear description

2. **Filters out noise**:
   - Ignore: merge commits, version bumps, "WIP" commits
   - Ignore: trivial updates like "fix typo", "update .gitignore"
   - Ignore: developer-only changes that don't affect users

3. **Writes clearly**:
   - Use plain, non-technical language
   - Focus on WHAT changed and WHY it matters to users
   - Keep descriptions concise (1-2 lines max)
   - Remove commit hashes and technical jargon
   - Include the commit date/time next to each change

4. **Formats in Markdown**:
Features:
Brief description of what was added (Nov 4, 10:00 AM)

Fixes:
Brief description of what was fixed (Nov 3, 2:30 PM)

Improvements:
Brief description of what was improved (Nov 2, 4:15 PM)

Documentation:
Brief description of documentation changes (Nov 1, 9:00 AM)

Other (vague commit message):
Brief description of other changes (Oct 31, 3:45 PM)

text

**Important Rules:**
- Only include categories that have actual content
- If there are no meaningful changes, say "No significant changes"
- Group similar commits together
- Be concise and user-focused
- Use bullet points, not numbered lists
- Always include the date and time in parentheses after each bullet point"""

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
commit 0b79cedf367caaf9e897b9eff74c079a4c71f897 (HEAD -> main)
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:24:30 2025 -0700

    ai_service changes

commit 5e0314ddd2a0e3d8712917994ceaab64c36328ff
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:11:56 2025 -0700

    new changes

commit 9916615ff239e6f5521f84f876ba1f988be36405
:
commit 0b79cedf367caaf9e897b9eff74c079a4c71f897 (HEAD -> main)
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:24:30 2025 -0700

    ai_service changes

commit 5e0314ddd2a0e3d8712917994ceaab64c36328ff
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:11:56 2025 -0700

    new changes

commit 9916615ff239e6f5521f84f876ba1f988be36405
Author: Devashish Shrestha <shresthdevashish@gmail.com>
Date:   Sat Nov 8 14:53:45 2025 -0700

    backend setup

commit 1702dfb171c088ec035852eb283a0b21695fdf07
Author: Devashish Shrestha <shresthdevashish@gmail.com>
Date:   Sat Nov 8 14:22:57 2025 -0700

    add .gitignore

commit b861efb151dba23bbbc0184b4a509d413ef04c69
Author: Devashish Shrestha <shresthdevashish@gmail.com>
:
commit 0b79cedf367caaf9e897b9eff74c079a4c71f897 (HEAD -> main)
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:24:30 2025 -0700

    ai_service changes

commit 5e0314ddd2a0e3d8712917994ceaab64c36328ff
Author: Brian Bao Hoang <brianhoang1225@gmail.com>
Date:   Sat Nov 8 15:11:56 2025 -0700

    new changes

commit 9916615ff239e6f5521f84f876ba1f988be36405
"""
    
    result = service.generate_changelog(sample_log)
    print(result["changelog"] if result["success"] else result["error"])