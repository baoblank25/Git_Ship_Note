"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateGitHub } from "@/lib/api";
import {
  storeAccessToken,
  storeUserInfo,
  extractOAuthCode,
} from "@/lib/github";
import { Loader2 } from "lucide-react";

export default function GitHubCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract the OAuth code from URL
        const code = extractOAuthCode(window.location.href);

        if (!code) {
          setStatus("error");
          setErrorMessage("No authorization code received from GitHub");
          return;
        }

        // Exchange code for access token
        const response = await authenticateGitHub(code);

        if (response.success && response.access_token && response.user) {
          // Store the token and user info
          storeAccessToken(response.access_token);
          storeUserInfo(response.user);

          setStatus("success");

          // Redirect back to main page after 1 second
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          setStatus("error");
          setErrorMessage(
            response.error || "Failed to authenticate with GitHub"
          );
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Authentication failed"
        );
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Connecting to GitHub...</h1>
            <p className="text-muted-foreground">
              Please wait while we authenticate your account
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-500">
              Successfully Connected!
            </h1>
            <p className="text-muted-foreground">
              Redirecting you back to ShipNote...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-6 w-6 text-red-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-500">
              Connection Failed
            </h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Return to ShipNote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
