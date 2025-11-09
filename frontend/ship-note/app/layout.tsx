import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShipNote - Transform Commits Into Beautiful Changelogs",
  description:
    "ShipNote converts technical git commits into user-friendly release notes in seconds. Perfect for developers, product managers, and technical writers.",
  keywords: [
    "git",
    "changelog",
    "release notes",
    "AI",
    "Claude",
    "developer tools",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
