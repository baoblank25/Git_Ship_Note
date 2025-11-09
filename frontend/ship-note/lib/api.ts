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
