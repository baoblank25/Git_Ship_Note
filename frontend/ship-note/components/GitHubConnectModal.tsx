"use client";

import { useState, useEffect } from "react";
import { X, Github, GitBranch, Calendar, Loader2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import {
  initiateGitHubOAuth,
  isGitHubConnected,
  getUserInfo,
  disconnectGitHub,
  getAccessToken,
} from "@/lib/github";
import {
  getGitHubRepositories,
  GitHubRepository,
  fetchGitHubCommits,
} from "@/lib/api";

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
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState("2-weeks");
  const [isFetching, setIsFetching] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [username, setUsername] = useState("");

  // Check if user is connected on component mount
  useEffect(() => {
    if (isOpen && isGitHubConnected() && !isConnected) {
      const userInfo = getUserInfo();
      if (userInfo) {
        onConnect(userInfo.username);
      }
    }
  }, [isOpen, isConnected, onConnect]);

  // Fetch repositories when modal opens and user is connected
  useEffect(() => {
    const fetchRepositories = async () => {
      if (isOpen && isConnected) {
        const userInfo = getUserInfo();
        if (userInfo) {
          setUsername(userInfo.username);
        }

        const accessToken = getAccessToken();
        if (!accessToken) {
          toast.error("Access token not found. Please reconnect.");
          return;
        }

        setIsLoadingRepos(true);
        try {
          const response = await getGitHubRepositories(accessToken);
          if (response.success && response.repositories) {
            setRepositories(response.repositories);
          } else {
            throw new Error(response.error || "Failed to fetch repositories");
          }
        } catch (error) {
          console.error("Error fetching repositories:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to fetch repositories"
          );
        } finally {
          setIsLoadingRepos(false);
        }
      }
    };

    fetchRepositories();
  }, [isOpen, isConnected]);

  const handleConnect = () => {
    try {
      // Redirect to GitHub OAuth - this will redirect user to GitHub
      initiateGitHubOAuth();
    } catch (error) {
      console.error("OAuth initiation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start GitHub OAuth"
      );
    }
  };

  const handleDisconnect = () => {
    disconnectGitHub(); // Clear localStorage
    onDisconnect();
    setSelectedRepo(null);
    setRepositories([]);
    setUsername("");
    toast.success("GitHub account disconnected");
  };

  const handleFetchCommits = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository");
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      toast.error("Access token not found. Please reconnect.");
      return;
    }

    // Find the selected repository
    const repo = repositories.find((r) => r.id === selectedRepo);
    if (!repo) {
      toast.error("Repository not found");
      return;
    }

    // Parse owner and repo name from full_name
    const [owner, repoName] = repo.full_name.split("/");

    setIsFetching(true);

    try {
      // Calculate date range
      let since: string | undefined;
      const now = new Date();

      if (dateRange === "1-week") {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        since = oneWeekAgo.toISOString();
      } else if (dateRange === "2-weeks") {
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);
        since = twoWeeksAgo.toISOString();
      } else if (dateRange === "1-month") {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        since = oneMonthAgo.toISOString();
      }
      // For "all", since remains undefined

      // Fetch commits from GitHub
      const response = await fetchGitHubCommits(
        accessToken,
        owner,
        repoName,
        since,
        undefined, // until (optional)
        dateRange === "all" ? 1000 : 100 // Higher limit for all commits
      );

      if (response.success && response.commits) {
        // Format commits for display
        const formattedCommits = response.commits
          .map((commit) => commit.message)
          .join("\n");

        onFetchCommits(formattedCommits);
        toast.success(
          `Fetched ${response.commits.length} commits from ${repo.name}`
        );
      } else {
        throw new Error(response.error || "Failed to fetch commits");
      }
    } catch (error) {
      console.error("Error fetching commits:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch commits"
      );
    } finally {
      setIsFetching(false);
    }
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
                  Authorize ShipNote to access your repositories and pull commit
                  history. We only request read-only access to your
                  repositories.
                </p>
                <Button onClick={handleConnect} className="w-full gap-2">
                  <Github className="w-4 h-4" />
                  Connect with GitHub
                </Button>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Secure OAuth:</strong> This uses real GitHub OAuth
                  authentication. You&apos;ll be redirected to GitHub to
                  authorize ShipNote.
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
                    Connected as {username || "user"}
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
                {isLoadingRepos ? (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading repositories...</span>
                  </div>
                ) : repositories.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center text-slate-600 dark:text-slate-400">
                    No repositories found
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {repositories.map((repo) => (
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
                                {repo.full_name}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {repo.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                              <span>⭐ {repo.stars}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(repo.updated_at).toLocaleDateString()}
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
                )}
              </div>

              {/* Date Range Selection */}
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Commit Range
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
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
                <div className="flex justify-center">
                  <button
                    onClick={() => setDateRange("all")}
                    className={`p-3 text-sm rounded-lg border transition-all w-full max-w-xs ${
                      dateRange === "all"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    All Commits
                  </button>
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
