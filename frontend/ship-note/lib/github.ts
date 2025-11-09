/**
 * GitHub OAuth Helper Utilities
 * Manages OAuth flow, token storage, and GitHub URL operations
 */

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";
const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const REDIRECT_URI = `${
  typeof window !== "undefined" ? window.location.origin : ""
}/auth/github/callback`;

// LocalStorage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "github_access_token",
  USER_INFO: "github_user_info",
  CONNECTED: "github_connected",
};

/**
 * Initiate GitHub OAuth flow
 * Redirects user to GitHub authorization page
 */
export function initiateGitHubOAuth(): void {
  if (!GITHUB_CLIENT_ID) {
    console.error("GitHub Client ID not configured");
    throw new Error(
      "GitHub OAuth not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID in .env.local"
    );
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "repo read:user user:email",
    state: generateRandomState(),
  });

  const authUrl = `${GITHUB_AUTH_URL}?${params.toString()}`;
  window.location.href = authUrl;
}

/**
 * Generate a random state parameter for OAuth security
 */
function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Store GitHub access token in localStorage
 */
export function storeAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CONNECTED, "true");
  }
}

/**
 * Get stored GitHub access token
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  return null;
}

/**
 * Store GitHub user information
 */
export function storeUserInfo(user: {
  username: string;
  name: string;
  avatar_url: string;
  email: string;
}): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
  }
}

/**
 * Get stored GitHub user information
 */
export function getUserInfo(): {
  username: string;
  name: string;
  avatar_url: string;
  email: string;
} | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
}

/**
 * Check if user is connected to GitHub
 */
export function isGitHubConnected(): boolean {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem(STORAGE_KEYS.CONNECTED) === "true" &&
      !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  }
  return false;
}

/**
 * Disconnect from GitHub (clear stored data)
 */
export function disconnectGitHub(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.CONNECTED);
  }
}

/**
 * Parse GitHub repository URL
 * Supports formats:
 * - https://github.com/owner/repo
 * - github.com/owner/repo
 * - git@github.com:owner/repo
 */
export function parseGitHubUrl(url: string): {
  owner: string;
  repo: string;
} | null {
  // Remove trailing slashes and .git
  const cleanUrl = url
    .trim()
    .replace(/\/$/, "")
    .replace(/\.git$/, "");

  if (!cleanUrl.includes("github.com")) {
    return null;
  }

  // Handle different formats
  let owner: string;
  let repo: string;

  if (cleanUrl.includes("github.com/")) {
    // https://github.com/owner/repo or github.com/owner/repo
    const parts = cleanUrl.split("github.com/")[1].split("/");
    if (parts.length < 2) return null;
    owner = parts[0];
    repo = parts[1];
  } else if (cleanUrl.includes("github.com:")) {
    // git@github.com:owner/repo
    const parts = cleanUrl.split("github.com:")[1].split("/");
    if (parts.length < 2) return null;
    owner = parts[0];
    repo = parts[1];
  } else {
    return null;
  }

  return { owner, repo };
}

/**
 * Validate GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}

/**
 * Format GitHub URL to standard format
 */
export function formatGitHubUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

/**
 * Extract OAuth code from URL callback
 */
export function extractOAuthCode(url: string): string | null {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("code");
}

/**
 * Check if current URL is OAuth callback
 */
export function isOAuthCallback(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/auth/github/callback";
}
