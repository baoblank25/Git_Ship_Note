/**
 * API Service for communicating with the Flask backend
 * Handles all HTTP requests to the ShipNote backend API
 */

// Type definitions matching backend responses
export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GenerateNotesResponse {
  success: boolean;
  notes?: string;
  error?: string;
  commit_count?: number;
}

export interface FetchCommitsResponse {
  success: boolean;
  commits?: Commit[];
  error?: string;
  from_ref?: string;
  to_ref?: string;
}

export interface GenerateFromRepoResponse {
  success: boolean;
  notes?: string;
  commits?: Commit[];
  error?: string;
  commit_count?: number;
}

export interface GenerateFromTextResponse {
  success: boolean;
  notes?: string;
  error?: string;
  commit_count?: number;
}

export interface GitHubUser {
  username: string;
  name: string;
  avatar_url: string;
  email: string;
}

export interface GitHubAuthResponse {
  success: boolean;
  access_token?: string;
  user?: GitHubUser;
  error?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  url: string;
  clone_url: string;
  stars: number;
  updated_at: string;
}

export interface GitHubRepositoriesResponse {
  success: boolean;
  repositories?: GitHubRepository[];
  error?: string;
}

export interface GitHubCommitsResponse {
  success: boolean;
  commits?: Commit[];
  count?: number;
  error?: string;
}

export interface ParseUrlResponse {
  success: boolean;
  owner?: string;
  repo?: string;
  error?: string;
}

export interface GenerateFromGitHubResponse {
  success: boolean;
  commits?: Commit[];
  notes?: string;
  commit_count?: number;
  error?: string;
}

// Get the API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("Backend health check failed");
  }
  return response.json();
}

/**
 * Generate release notes from an array of commits
 * @param commits - Array of commit objects with hash, message, author, date
 * @param fromRef - Starting reference (optional)
 * @param toRef - Ending reference (default: 'HEAD')
 */
export async function generateNotes(
  commits: Commit[],
  fromRef?: string,
  toRef?: string
): Promise<GenerateNotesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      commits,
      from_ref: fromRef,
      to_ref: toRef || "HEAD",
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch commits from a local git repository
 * @param repoPath - Absolute path to the git repository
 * @param fromRef - Starting reference (optional)
 * @param toRef - Ending reference (default: 'HEAD')
 */
export async function fetchCommits(
  repoPath: string,
  fromRef?: string,
  toRef?: string
): Promise<FetchCommitsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/fetch-commits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo_path: repoPath,
      from_ref: fromRef,
      to_ref: toRef || "HEAD",
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Generate release notes directly from a repository path
 * This combines fetchCommits and generateNotes in one call
 * @param repoPath - Absolute path to the git repository
 * @param fromRef - Starting reference (optional)
 * @param toRef - Ending reference (default: 'HEAD')
 */
export async function generateFromRepo(
  repoPath: string,
  fromRef?: string,
  toRef?: string
): Promise<GenerateFromRepoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-from-repo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo_path: repoPath,
      from_ref: fromRef,
      to_ref: toRef || "HEAD",
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Generate release notes from raw git log text
 * @param gitLogText - Raw text output from `git log` command
 */
export async function generateFromText(
  gitLogText: string
): Promise<GenerateFromTextResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-from-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      git_log_text: gitLogText,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * ========================================
 * GITHUB OAUTH FUNCTIONS
 * ========================================
 */

/**
 * Exchange GitHub OAuth code for access token
 * @param code - OAuth code from GitHub callback
 */
export async function authenticateGitHub(
  code: string
): Promise<GitHubAuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/github/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Authentication failed" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Get user's GitHub repositories
 * @param accessToken - GitHub access token
 */
export async function getGitHubRepositories(
  accessToken: string
): Promise<GitHubRepositoriesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/github/repositories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ access_token: accessToken }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to fetch repositories" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch commits from a GitHub repository
 * @param accessToken - GitHub access token
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param since - Start date (ISO 8601 format, optional)
 * @param until - End date (ISO 8601 format, optional)
 * @param limit - Maximum number of commits (default: 100)
 */
export async function fetchGitHubCommits(
  accessToken: string,
  owner: string,
  repo: string,
  since?: string,
  until?: string,
  limit?: number
): Promise<GitHubCommitsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/github/commits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: accessToken,
      owner,
      repo,
      since,
      until,
      limit,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to fetch commits" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Parse a GitHub URL to extract owner and repo
 * @param url - GitHub repository URL
 */
export async function parseGitHubUrl(url: string): Promise<ParseUrlResponse> {
  const response = await fetch(`${API_BASE_URL}/api/github/parse-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Invalid GitHub URL" }));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Complete workflow: Parse URL → Fetch commits → Generate changelog
 * @param accessToken - GitHub access token
 * @param repoUrl - GitHub repository URL
 * @param since - Start date (ISO 8601 format, optional)
 * @param until - End date (ISO 8601 format, optional)
 * @param limit - Maximum number of commits (default: 100)
 */
export async function generateFromGitHub(
  accessToken: string,
  repoUrl: string,
  since?: string,
  until?: string,
  limit?: number
): Promise<GenerateFromGitHubResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/github/generate-from-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          repo_url: repoUrl,
          since,
          until,
          limit,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Failed to generate from GitHub" }));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Could not connect to backend server. Please ensure the Flask server is running on port 5000."
      );
    }
    throw error;
  }
}
