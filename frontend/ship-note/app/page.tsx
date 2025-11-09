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
  Home as HomeIcon,
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
import { toast, Toaster } from "sonner";
import { GitHubConnectModal } from "@/components/GitHubConnectModal";
import { About } from "@/components/About";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"home" | "about">("home");
  const [gitLog, setGitLog] = useState("");
  const [changelog, setChangelog] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("gitscribe-theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gitscribe-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gitscribe-theme", "light");
    }
  }, [isDarkMode]);

  const handleGenerate = async () => {
    if (!gitLog.trim()) {
      toast.error("Please paste your git log first");
      return;
    }

    setIsGenerating(true);
    setChangelog("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/generate-from-text",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ git_log_text: gitLog }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setChangelog(data.notes);
        toast.success("Changelog generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate changelog");
      }
    } catch (error) {
      toast.error("Cannot connect to backend. Is it running?");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGitLog("");
    setChangelog("");
  };

  const exampleCommits = `feat: add real-time collaboration support
fix: resolve authentication timeout issue
perf: optimize image loading with lazy loading`;

  const handleUseExample = () => {
    setGitLog(exampleCommits);
    setChangelog("");
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-all duration-500">
        {/* Ambient background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl relative z-10">
          {/* Header */}
          <header className="mb-12">
            <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GitScribe
                </h1>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage("home")}
                    variant={currentPage === "home" ? "default" : "ghost"}
                    size="sm"
                  >
                    <HomeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">Home</span>
                  </Button>
                  <Button
                    onClick={() => setCurrentPage("about")}
                    variant={currentPage === "about" ? "default" : "ghost"}
                    size="sm"
                  >
                    <Info className="w-4 h-4" />
                    <span className="hidden sm:inline ml-2">About</span>
                  </Button>
                </div>
                <Button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  variant="ghost"
                  size="sm"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </nav>

            {currentPage === "home" && (
              <div className="text-center mt-16 mb-12">
                <div className="inline-block mb-4 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    ✨ AI-Powered Changelog
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-200 dark:to-slate-100 bg-clip-text text-transparent">
                  Transform Commits Into
                  <br />
                  Beautiful Changelogs
                </h2>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                  GitScribe converts technical git commits into user-friendly
                  release notes in seconds.
                </p>
              </div>
            )}
          </header>

          {currentPage === "about" ? (
            <About />
          ) : (
            <>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Card */}
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-2xl rounded-2xl border-2 border-slate-200 dark:border-slate-800">
                  <CardHeader className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <CardTitle className="flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Input Commits
                    </CardTitle>
                    <CardDescription>
                      Paste git commits or connect GitHub
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <Button
                      onClick={() => setIsGitHubModalOpen(true)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Github className="w-4 h-4" />
                      {isGitHubConnected
                        ? `Connected as ${githubUsername}`
                        : "Connect GitHub"}
                    </Button>
                    <Textarea
                      value={gitLog}
                      onChange={(e) => setGitLog(e.target.value)}
                      placeholder="Paste your git commits here..."
                      className="min-h-[320px] font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !gitLog.trim()}
                        className="flex-1"
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
                      <Button onClick={handleClear} variant="outline">
                        Clear
                      </Button>
                      <Button onClick={handleUseExample} variant="outline">
                        Example
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Card */}
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-2xl rounded-2xl border-2 border-slate-200 dark:border-slate-800">
                  <CardHeader className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
                    <CardTitle className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Generated Changelog
                    </CardTitle>
                    <CardDescription>
                      User-friendly release notes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center min-h-[320px]">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-slate-500">Generating...</p>
                      </div>
                    ) : changelog ? (
                      <div className="min-h-[320px]">
                        <pre className="whitespace-pre-wrap text-sm bg-slate-50 dark:bg-slate-950 p-6 rounded-lg border-2">
                          {changelog}
                        </pre>
                        <Separator className="my-4" />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(changelog);
                            toast.success("Copied to clipboard!");
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          📋 Copy to Clipboard
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[320px] text-slate-400">
                        <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                        <p>Your changelog will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

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
                  toast.success("Commits loaded!");
                }}
              />
            </>
          )}

          <footer className="mt-16 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Built with ❤️ using Next.js, Claude AI & Tailwind CSS
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
