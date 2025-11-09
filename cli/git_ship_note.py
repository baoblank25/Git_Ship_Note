#!/usr/bin/env python3

import subprocess
import requests
import argparse
import tempfile
import shutil
import os
import sys
import stat
from rich.console import Console

console = Console()

API_URL = os.getenv("GITSCRIBE_API", "http://localhost:5000")

def clone_repo(git_url, depth=100):
    temp_dir = tempfile.mkdtemp(prefix="gitscribe_repo_")
    console.print(f"Cloning repository (last {depth} commits)...")
    result = subprocess.run(
        ["git", "clone", "--depth", str(depth), git_url, temp_dir],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0:
        console.print(f"Git clone failed:\n{result.stderr}")
        remove_readonly_and_delete(temp_dir)
        sys.exit(1)
    console.print("Repository cloned successfully")
    return temp_dir

def get_raw_git_log(repo_path, limit=100):
    console.print(f"Reading up to last {limit} commits...")
    
    # Get commit info with files changed
    cmd = [
        "git", "-C", repo_path, "log", f"-{limit}",
        '--pretty=format:%h|%cd|%an|%s',
        '--date=format:%b %d, %I:%M %p',
        '--name-status'  # Shows file changes (A=added, M=modified, D=deleted)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        console.print("Failed to get git log")
        sys.exit(1)
    
    # Count actual commits retrieved
    commits = [line for line in result.stdout.strip().split('\n') if '|' in line]
    actual_count = len(commits)
    
    console.print(f"{actual_count} commit{'s' if actual_count != 1 else ''} extracted")
    return result.stdout.strip(), actual_count

def generate_changelog(raw_log, api_url):
    console.print("Sending commit data to AI backend for changelog generation...")
    try:
        response = requests.post(
            url=f"{api_url}/api/generate-from-text",
            json={"git_log_text": raw_log},
            timeout=90
        )
    except requests.RequestException as e:
        console.print(f"Failed to reach backend API: {e}")
        sys.exit(1)

    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            console.print("Changelog generated successfully!\n")
            return data.get("notes")
        else:
            console.print(f"API error: {data.get('error')}")
            sys.exit(1)
    else:
        console.print(f"Request failed with status code {response.status_code}")
        sys.exit(1)

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def remove_readonly_and_delete(path):
    shutil.rmtree(path, onerror=remove_readonly)

def display_changelog_terminal(changelog_text, commit_count):
    """Display changelog in terminal with colors and formatting"""
    
    # Simple big yellow title with commit count
    console.print("\n")
    console.print("[bold yellow]" + "="*70 + "[/bold yellow]")
    console.print("[bold yellow]                            CHANGELOG                              [/bold yellow]")
    console.print(f"[bold yellow]                      (Last {commit_count} commit{'s' if commit_count != 1 else ''})                     [/bold yellow]")
    console.print("[bold yellow]" + "="*70 + "[/bold yellow]")
    console.print("\n")
    
    # Parse and display sections with colors
    lines = changelog_text.strip().split('\n')
    
    section_colors = {
        'Features': 'green',
        'Fixes': 'red',
        'Improvements': 'blue',
        'Documentation': 'cyan',
        'Deletions': 'magenta',
        'Other': 'yellow'
    }
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Section headers
        if line.startswith('## '):
            section_name = line.replace('##', '').strip().rstrip(':')
            color = 'white'
            
            # Find matching color
            for key, col in section_colors.items():
                if key.lower() in section_name.lower():
                    color = col
                    break
            
            # Simple section header without lines
            console.print(f"\n[bold {color}]*** {section_name.upper()} ***[/bold {color}]\n")
        
        # Bullet points
        elif line.startswith('- '):
            item = line[2:].strip()
            
            # Highlight timestamps in yellow
            if '(' in item and ')' in item:
                parts = item.rsplit('(', 1)
                text_part = parts[0].strip()
                time_part = '(' + parts[1]
                console.print(f"  [white]•[/white] {text_part} [bold yellow]{time_part}[/bold yellow]")
            else:
                console.print(f"  [white]•[/white] {item}")
            
            # Add extra space after each bullet point
            console.print()
    
    console.print("\n" + "="*70 + "\n")

def format_changelog_md(changelog_text, commit_count):
    """Format changelog for markdown file"""
    formatted = "# CHANGELOG\n\n"
    formatted += f"*Last {commit_count} commit{'s' if commit_count != 1 else ''}*\n\n"
    formatted += "---\n\n"
    
    # Parse and format
    lines = changelog_text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Section headers
        if line.startswith('## '):
            section_name = line.replace('##', '').strip().rstrip(':')
            formatted += f"\n### {section_name.upper()}\n\n"
        
        # Bullet points with extra spacing
        elif line.startswith('- '):
            formatted += line + "\n\n"
    
    return formatted

def save_to_temp_markdown(changelog_text, commit_count):
    """Save changelog to temporary markdown file and open it"""
    markdown_content = format_changelog_md(changelog_text, commit_count)
    
    with tempfile.NamedTemporaryFile('w', delete=False, suffix=".md", encoding='utf-8') as tmp:
        tmp.write(markdown_content)
        filepath = tmp.name
    
    console.print(f"[green]Changelog saved to temporary file: {filepath}[/green]")
    console.print("[blue]Opening file...[/blue]")
    
    # Open the file in default editor or VS Code
    try:
        subprocess.run(["code", filepath], check=True)
    except FileNotFoundError:
        if sys.platform.startswith("win"):
            os.startfile(filepath)
        elif sys.platform.startswith("darwin"):
            subprocess.call(["open", filepath])
        else:
            subprocess.call(["xdg-open", filepath])

def ask_save_to_file():
    """Ask user if they want to save changelog to markdown file"""
    while True:
        response = console.input("\n[cyan]Do you want to create a Markdown file for better visibility? (yes/no):[/cyan] ").strip().lower()
        if response in ['yes', 'y']:
            return True
        elif response in ['no', 'n']:
            return False
        else:
            console.print("[red]Please enter 'yes' or 'no'[/red]")

def get_commit_count():
    """Ask user how many commits to analyze (1-100)"""
    while True:
        try:
            response = console.input("[cyan]How many commits do you want to analyze? (1-100, default 50):[/cyan] ").strip()
            if not response:
                return 50  # Default
            count = int(response)
            if 1 <= count <= 100:
                return count
            else:
                console.print("[red]Please enter a number between 1 and 100[/red]")
        except ValueError:
            console.print("[red]Please enter a valid number[/red]")

def main():
    parser = argparse.ArgumentParser(description="GitScribe CLI - Generate a changelog from a GitHub repo URL")
    parser.add_argument("-u", "--url", type=str, help="GitHub repository URL to clone and analyze")
    parser.add_argument("-n", "--limit", type=int, help="Number of recent commits to include (1-100)")
    parser.add_argument("--api-url", type=str, default=API_URL, help="Backend API URL (default http://localhost:5000)")
    parser.add_argument("--keep-temp", action="store_true", help="Keep temporary cloned repository (for debugging)")
    args = parser.parse_args()

    git_url = args.url
    if not git_url:
        git_url = console.input("Enter GitHub repository URL: ").strip()
        if not git_url:
            console.print("GitHub repository URL is required!")
            sys.exit(1)

    # Get commit count from user if not provided via CLI arg
    commit_limit = args.limit if args.limit else get_commit_count()

    repo_path = clone_repo(git_url, depth=commit_limit)

    try:
        raw_log, commit_count = get_raw_git_log(repo_path, commit_limit)
        changelog = generate_changelog(raw_log, args.api_url)
        display_changelog_terminal(changelog, commit_count)
        
        # Ask user if they want to save to file
        if ask_save_to_file():
            save_to_temp_markdown(changelog, commit_count)
        else:
            console.print("[blue]Exiting without saving file.[/blue]")
            
    finally:
        if not args.keep_temp:
            console.print("Cleaning up temporary repository clone...")
            remove_readonly_and_delete(repo_path)
        else:
            console.print(f"Temporary repository kept at: {repo_path}")

if __name__ == "__main__":
    main()
