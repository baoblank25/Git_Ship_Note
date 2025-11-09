"use client";

import { useState } from "react";
import { X, Github, GitBranch, Calendar, Loader2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  lastCommit: string;
}

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  onFetchCommits: (commits: string) => void;
}

export function GitHubConnectModal({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  isConnected,
  onFetchCommits,
}: GitHubConnectModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("2-weeks");
  const [isFetching, setIsFetching] = useState(false);

  // Mock repositories data
  const mockRepositories: Repository[] = [
    {
      id: "1",
      name: "awesome-app",
      fullName: "yourname/awesome-app",
      description: "A full-stack web application built with React and Node.js",
      stars: 142,
      lastCommit: "2 hours ago",
    },
    {
      id: "2",
      name: "design-system",
      fullName: "yourname/design-system",
      description: "Reusable component library with Tailwind CSS",
      stars: 89,
      lastCommit: "1 day ago",
    },
    {
      id: "3",
      name: "api-gateway",
      fullName: "yourname/api-gateway",
      description: "Microservices API gateway with authentication",
      stars: 56,
      lastCommit: "3 days ago",
    },
    {
      id: "4",
      name: "ml-pipeline",
      fullName: "yourname/ml-pipeline",
      description: "Machine learning data processing pipeline",
      stars: 34,
      lastCommit: "1 week ago",
    },
  ];

  const handleConnect = async () => {
    setIsAuthenticating(true);
    // Simulate OAuth flow
    setTimeout(() => {
      onConnect("yourname");
      setIsAuthenticating(false);
      toast.success("GitHub account connected!");
    }, 1500);
  };

  const handleDisconnect = () => {
    onDisconnect();
    setSelectedRepo(null);
    toast.success("GitHub account disconnected");
  };

  const handleFetchCommits = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository");
      return;
    }

    setIsFetching(true);

    // Simulate fetching commits from GitHub
    setTimeout(() => {
      const mockCommits = generateMockCommits(dateRange);
      onFetchCommits(mockCommits);
      setIsFetching(false);
    }, 1000);
  };

  const generateMockCommits = (range: string): string => {
    const commits = [
      "feat: (ui) add dark mode support with theme toggle",
      "fix: (auth) resolve session timeout on mobile devices",
      "perf: optimize image loading with lazy loading",
      "feat: (api) implement rate limiting middleware",
      "fix: (db) resolve n+1 query issue in user profiles",
      "docs: update API documentation with new endpoints",
      "refactor: extract common validation logic",
      "feat: (dashboard) add analytics charts with recharts",
      "fix: (forms) prevent double submission on slow connections",
      "perf: reduce bundle size by 25% with code splitting",
      "feat: (notifications) add real-time push notifications",
      "fix: (ui) correct mobile menu overlay z-index",
      "test: add integration tests for authentication flow",
      "chore: upgrade dependencies to latest versions",
      "feat: (search) implement advanced filtering options",
    ];

    // Return different subsets based on date range
    if (range === "1-week") {
      return commits.slice(0, 8).join("\n");
    } else if (range === "2-weeks") {
      return commits.slice(0, 12).join("\n");
    } else if (range === "1-month") {
      return commits.join("\n");
    }

    return commits.slice(0, 12).join("\n");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-slate-800 dark:border-slate-700 animate-scale-in rounded-2xl border-2">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-slate-900 dark:text-slate-100 text-xl">
                  GitHub Integration
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect your account to fetch commits automatically
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Authentication Section */}
          {!isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="text-slate-900 dark:text-slate-100 mb-2">
                  Connect Your GitHub Account
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Authorize GitScribe to access your repositories and pull
                  commit history. We only request read-only access to your
                  repositories.
                </p>
                <Button
                  onClick={handleConnect}
                  disabled={isAuthenticating}
                  className="w-full gap-2"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      Connect with GitHub
                    </>
                  )}
                </Button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Demo Mode:</strong> This is using mock GitHub
                  authentication. Real OAuth integration requires a secure
                  backend (e.g., Supabase) to handle tokens safely.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connected Status */}
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-green-900 dark:text-green-100 mb-1">
                    Connected as yourname
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    You can now pull commits from your repositories
                  </p>
                </div>
                <Button onClick={handleDisconnect} variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>

              {/* Repository Selection */}
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Select Repository
                </label>
                <div className="grid gap-2">
                  {mockRepositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo.id)}
                      className={`p-4 text-left border rounded-lg transition-all ${
                        selectedRepo === repo.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-500"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <GitBranch className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            <span className="text-slate-900 dark:text-slate-100">
                              {repo.fullName}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {repo.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                            <span>⭐ {repo.stars}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {repo.lastCommit}
                            </span>
                          </div>
                        </div>
                        {selectedRepo === repo.id && (
                          <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Commit Range
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "1-week", label: "Last Week" },
                    { value: "2-weeks", label: "Last 2 Weeks" },
                    { value: "1-month", label: "Last Month" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value)}
                      className={`p-3 text-sm rounded-lg border transition-all ${
                        dateRange === option.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fetch Button */}
              <Button
                onClick={handleFetchCommits}
                disabled={!selectedRepo || isFetching}
                className="w-full gap-2"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching Commits...
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    Fetch Commits
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
