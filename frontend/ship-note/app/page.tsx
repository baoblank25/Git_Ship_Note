"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  Sparkles,
  Loader2,
  Terminal,
  Download,
  Moon,
  Sun,
  Github,
  Info,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { GitHubConnectModal } from "@/components/GitHubConnectModal";
import { About } from "@/components/About";
import { generateFromText, checkHealth, generateFromGitHub } from "@/lib/api";
import {
  getAccessToken,
  isValidGitHubUrl,
  isGitHubConnected as checkGitHubConnection,
  getUserInfo,
} from "@/lib/github";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [currentPage, setCurrentPage] = useState<"home" | "about">("about");
  const [gitLog, setGitLog] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [isGeneratingFromGitHub, setIsGeneratingFromGitHub] = useState(false);

  // Initialize and persist theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("shipnote-theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("shipnote-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("shipnote-theme", "light");
    }
  }, [isDarkMode]);

  // Check for existing GitHub connection on mount
  useEffect(() => {
    if (checkGitHubConnection()) {
      const userInfo = getUserInfo();
      if (userInfo && userInfo.username) {
        setIsGitHubConnected(true);
        setGithubUsername(userInfo.username);
        console.log("✅ GitHub connection restored:", userInfo.username);
      }
    }
  }, []);

  // Check backend health on component mount
  useEffect(() => {
    const verifyBackendConnection = async () => {
      try {
        await checkHealth();
        console.log("✅ Backend connection successful");
      } catch (error) {
        console.error("❌ Backend connection failed:", error);
        toast.error(
          "Could not connect to backend. Make sure Flask server is running on port 5000."
        );
      }
    };

    verifyBackendConnection();
  }, []);

  const handleGenerate = async () => {
    if (!gitLog.trim()) {
      toast.error("Please paste your git log first");
      return;
    }

    setIsGenerating(true);
    setChangelog("");

    try {
      // Call the real backend API to generate changelog
      const result = await generateFromText(gitLog);

      if (result.success && result.notes) {
        setChangelog(result.notes);
        toast.success("Changelog generated successfully with AI!");
      } else {
        throw new Error(result.error || "Failed to generate changelog");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate changelog";
      toast.error(errorMessage);
      console.error("Changelog generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGitLog("");
    setChangelog("");
  };

  const exampleCommits = `feat(api): add new endpoint for user preferences
BREAKING CHANGE: new response format requires client update

fix(auth): ensure proper token refresh on session timeout
refs #123

style(ui): improve button hover states and focus rings
- Update primary button gradients
- Add keyboard focus styles

chore(deps): bump typescript from 4.9.4 to 4.9.5

build(docker): optimize image size and build time
- Use multi-stage builds
- Add layer caching

test(api): add integration tests for auth flow
Closes #456

refactor(core): simplify state management logic
Co-authored-by: Jane Doe <jane@example.com>

docs(readme): update installation steps
- Add development setup guide
- Include troubleshooting section`;

  const handleUseExample = () => {
    setGitLog(exampleCommits);
    setChangelog("");
  };

  const handleGenerateFromGitHub = async () => {
    if (!githubRepoUrl.trim()) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    if (!isValidGitHubUrl(githubRepoUrl)) {
      toast.error(
        "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)"
      );
      return;
    }

    if (!isGitHubConnected) {
      toast.error("Please connect your GitHub account first");
      setIsGitHubModalOpen(true);
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error(
        "GitHub access token not found. Please reconnect your account."
      );
      setIsGitHubConnected(false);
      return;
    }

    setIsGeneratingFromGitHub(true);
    setChangelog("");

    try {
      const result = await generateFromGitHub(accessToken, githubRepoUrl);

      if (result.success && result.notes) {
        setChangelog(result.notes);
        toast.success(
          `Generated changelog from ${result.commit_count} commits!`
        );
      } else {
        throw new Error(
          result.error || "Failed to generate changelog from GitHub"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate changelog from GitHub";
      toast.error(errorMessage);
      console.error("GitHub changelog generation error:", error);
    } finally {
      setIsGeneratingFromGitHub(false);
    }
  };

  const handleDownloadCLI = () => {
    const cliScript = `#!/bin/bash
# ShipNote CLI - Changelog Generator
# Usage: ./shipnote.sh [--since <commit-hash>] [--output <file>]

set -e

SINCE_COMMIT=""
OUTPUT_FILE="CHANGELOG.md"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --since)
      SINCE_COMMIT="$2"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --help)
      echo "ShipNote CLI - Generate user-friendly changelogs from git commits"
      echo ""
      echo "Usage: ./shipnote.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --since <commit>    Generate changelog since this commit (default: last tag)"
      echo "  --output <file>     Output file (default: CHANGELOG.md)"
      echo "  --help             Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run './shipnote.sh --help' for usage information"
      exit 1
      ;;
  esac
done

# Determine the starting point for the changelog
if [ -z "$SINCE_COMMIT" ]; then
  # Get the last tag
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
  if [ -z "$LAST_TAG" ]; then
    echo "No tags found. Generating changelog for all commits..."
    SINCE_COMMIT=""
  else
    echo "Generating changelog since last tag: $LAST_TAG"
    SINCE_COMMIT="$LAST_TAG"
  fi
fi

# Get git log
if [ -z "$SINCE_COMMIT" ]; then
  GIT_LOG=$(git log --pretty=format:"%s" --no-merges)
else
  GIT_LOG=$(git log "$SINCE_COMMIT"..HEAD --pretty=format:"%s" --no-merges)
fi

if [ -z "$GIT_LOG" ]; then
  echo "No commits found."
  exit 1
fi

echo "Found $(echo "$GIT_LOG" | wc -l) commits"
echo ""
echo "Git commits:"
echo "$GIT_LOG"
echo ""
echo "================================"
echo ""
echo "To generate an AI-powered changelog, visit:"
echo "https://your-shipnote-url.com"
echo ""
echo "Or set up the ShipNote API integration:"
echo "1. Install dependencies: npm install @anthropic-ai/sdk"
echo "2. Set your ANTHROPIC_API_KEY environment variable"
echo "3. Use the ShipNote API to generate the changelog"
echo ""
echo "Commits have been saved to: git-log.txt"
echo "$GIT_LOG" > git-log.txt
echo ""
echo "Next steps:"
echo "1. Copy the contents of git-log.txt"
echo "2. Paste into ShipNote web interface"
echo "3. Generate your changelog"
echo "4. Save to $OUTPUT_FILE"
`;

    const blob = new Blob([cliScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shipnote.sh";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CLI script downloaded! Run: chmod +x shipnote.sh");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-all duration-500">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl relative z-10">
        {/* Modern Navigation Header */}
        <header className="mb-12 animate-fade-in">
          <nav className="glass-card rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                ShipNote
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage("home")}
                  variant={currentPage === "home" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 hover-lift"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                <Button
                  onClick={() => setCurrentPage("about")}
                  variant={currentPage === "about" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2 hover-lift"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">About</span>
                </Button>
              </div>
              <Button
                onClick={() => setIsDarkMode(!isDarkMode)}
                variant="ghost"
                size="sm"
                className={`gap-2 transition-all duration-300 ${
                  isDarkMode
                    ? "text-slate-700 dark:text-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-lg"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-900 hover:text-white hover:shadow-lg hover:shadow-slate-900/20"
                }`}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </Button>
            </div>
          </nav>

          {/* Hero Section for Home */}
          {currentPage === "home" && (
            <div className="text-center mt-16 mb-12 animate-slide-up">
              <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-full border border-blue-500/20">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  ✨ AI-Powered Changelog Generation
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-200 dark:to-slate-100 bg-clip-text text-transparent leading-tight">
                Transform Commits Into
                <br />
                Beautiful Changelogs
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                ShipNote converts technical git commits into user-friendly
                release notes in seconds. Perfect for developers, product
                managers, and technical writers.
              </p>
            </div>
          )}
        </header>

        {currentPage === "about" ? (
          <About />
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-8 animate-scale-in items-start">
              {/* Input Section */}
              <Card className="glass-card shadow-2xl rounded-2xl overflow-hidden border-2 self-start">
                <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
                  <CardTitle className="flex items-center gap-3 dark:text-slate-100">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Input Commits</span>
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    Paste git commits or connect GitHub to auto-fetch
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="mb-4">
                    <Button
                      onClick={() => setIsGitHubModalOpen(true)}
                      variant="outline"
                      size="default"
                      className="w-full gap-2 hover-lift border-2"
                    >
                      <Github className="w-4 h-4" />
                      {isGitHubConnected ? (
                        <span>
                          Connected as <strong>{githubUsername}</strong>
                        </span>
                      ) : (
                        <>Connect GitHub</>
                      )}
                    </Button>
                    {isGitHubConnected && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                        ✓ Pull commits directly from your repositories
                      </p>
                    )}
                  </div>
                  <Textarea
                    value={gitLog}
                    onChange={(e) => setGitLog(e.target.value)}
                    placeholder={`Paste your git logs here (one commit per line):

a83b1c9 feat: add real-time collaboration support
f2e4d8a fix: resolve authentication timeout issue  
c9b7f3e perf: optimize image loading with lazy loading
d1a6e4f docs: update API documentation
...`}
                    className="min-h-[320px] font-mono text-sm bg-slate-50 dark:bg-slate-950 border-2 rounded-xl focus:outline-none transition-all"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !gitLog.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-lift"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      disabled={isGenerating}
                      className="hover-lift border-2"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleUseExample}
                      variant="outline"
                      disabled={isGenerating}
                      className="hover-lift border-2"
                    >
                      Example
                    </Button>
                  </div>

                  {/* GitHub Repository URL Section */}
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      Or fetch from GitHub Repository
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={githubRepoUrl}
                        onChange={(e) => setGithubRepoUrl(e.target.value)}
                        placeholder="https://github.com/owner/repository"
                        disabled={isGeneratingFromGitHub || !isGitHubConnected}
                        className="flex-1 font-mono text-sm border-2 rounded-lg"
                      />
                      <Button
                        onClick={handleGenerateFromGitHub}
                        disabled={
                          isGeneratingFromGitHub ||
                          !githubRepoUrl.trim() ||
                          !isGitHubConnected
                        }
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover-lift"
                      >
                        {isGeneratingFromGitHub ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Github className="w-4 h-4 mr-2" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                    {!isGitHubConnected && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ Connect your GitHub account above to use this feature
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Output Section */}
              <Card className="glass-card shadow-2xl rounded-2xl overflow-hidden border-2 min-h-[740px]">
                <CardHeader className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent">
                  <CardTitle className="flex items-center gap-3 dark:text-slate-100">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>Generated Changelog</span>
                  </CardTitle>
                  <CardDescription className="dark:text-slate-400">
                    User-friendly release notes ready to share
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  {isGenerating || isGeneratingFromGitHub ? (
                    <div className="flex flex-col items-center justify-center min-h-[320px] text-slate-400 dark:text-slate-500">
                      <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600 dark:text-blue-400" />
                      <p className="animate-pulse">
                        Generating your changelog...
                      </p>
                    </div>
                  ) : changelog ? (
                    <div className="min-h-[320px] p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 rounded-xl border-2 dark:border-slate-800 shadow-inner">
                      <div className="prose prose-sm max-w-none">
                        {changelog.split("\n\n").map((section, index) => (
                          <div
                            key={index}
                            className="mb-6 last:mb-0 animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {section.split("\n").map((line, lineIndex) => {
                              if (
                                line.startsWith("✨") ||
                                line.startsWith("🐛") ||
                                line.startsWith("⚡") ||
                                line.startsWith("🔧")
                              ) {
                                return (
                                  <h3
                                    key={lineIndex}
                                    className="mb-3 text-lg text-slate-900 dark:text-slate-100"
                                  >
                                    {line}
                                  </h3>
                                );
                              }
                              return line ? (
                                <p
                                  key={lineIndex}
                                  className="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed"
                                >
                                  {line}
                                </p>
                              ) : null;
                            })}
                          </div>
                        ))}
                      </div>
                      <Separator className="my-6 dark:bg-slate-700" />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(changelog);
                          toast.success("Copied to clipboard!");
                        }}
                        variant="outline"
                        size="default"
                        className="w-full hover-lift border-2"
                      >
                        📋 Copy to Clipboard
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[320px] text-slate-400 dark:text-slate-500 text-center p-6">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
                        <Sparkles className="w-12 h-12 opacity-50" />
                      </div>
                      <p className="text-lg mb-2">Ready to generate</p>
                      <p className="text-sm">
                        Paste commits and click Generate to create your
                        changelog
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* GitHub Connect Modal */}
            <GitHubConnectModal
              isOpen={isGitHubModalOpen}
              onClose={() => setIsGitHubModalOpen(false)}
              onConnect={(username) => {
                setIsGitHubConnected(true);
                setGithubUsername(username);
                setIsGitHubModalOpen(false);
              }}
              onDisconnect={() => {
                setIsGitHubConnected(false);
                setGithubUsername("");
              }}
              isConnected={isGitHubConnected}
              onFetchCommits={(commits) => {
                setGitLog(commits);
                setIsGitHubModalOpen(false);
                toast.success("Commits loaded from GitHub!");
              }}
            />

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12 animate-fade-in">
              {/* CLI Download Section */}
              <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-700 dark:from-slate-600 dark:to-slate-800 rounded-xl">
                      <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-900 dark:text-slate-100 mb-2">
                        Command Line Tool
                      </h3>
                      <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          Extract commits directly from your local repository with
                          our CLI tool. Works seamlessly with your existing git
                          workflow.
                        </p>
                        <div className="pt-2">
                          <Button
                            onClick={handleDownloadCLI}
                            size="sm"
                            className="gap-2 hover-lift bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Download CLI
                          </Button>
                        </div>
                        <a
                          href="https://docs.github.com/en/github-cli/github-cli/quickstart"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          GitHub CLI Quickstart Guide
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-900 dark:text-slate-100 mb-2">
                        Pro Tips
                      </h3>
                      <div className="space-y-4">
                        <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-2 leading-relaxed">
                          <li>
                            • Follow conventional commits format:
                            <br />
                            <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">type(scope): description</code>
                            <br />
                            <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">BREAKING CHANGE: description</code>
                          </li>
                          <li>
                            • Add detailed body and reference issues with keywords:
                            <br />
                            <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">refs #123</code> or <code className="bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">Closes #456</code>
                          </li>
                          <li>
                            • Common types: feat, fix, docs, style, refactor, test, chore, build
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 text-center animate-fade-in">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Built with ❤️ using Next.js, React, TypeScript, Tailwind CSS, and
            Claude AI
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2025 ShipNote. Transform commits into beautiful changelogs.
          </p>
        </footer>
      </div>
    </div>
  );
}
