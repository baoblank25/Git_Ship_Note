"use client";

import { Sparkles, Github, Terminal, Zap, Clock, Code } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";

export function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-6 animate-slide-up">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full border border-blue-500/20">
          <span className="text-sm text-blue-600 dark:text-blue-400">
            About ShipNote
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-slate-100 dark:via-blue-200 dark:to-slate-100 bg-clip-text text-transparent">
          Bridge the Gap Between
          <br />
          Technical Commits and User Communication
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Transform technical git commits into beautiful, user-friendly
          changelogs powered by AI.
        </p>
      </div>

      {/* About ShipNote - Combined Problem & Vision */}
      <Card className="glass-card rounded-2xl border-2 overflow-hidden">
        <CardContent className="pt-8 p-8">
          <h2 className="text-slate-900 dark:text-slate-100 mb-6 text-2xl">
            Our Mission
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Developer-focused git commit messages like{" "}
              <code className="bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                fix: (db) resolve n+1 query on user_model
              </code>{" "}
              are essential for technical teams but meaningless to end users.
              When it&apos;s time to write release notes or communicate updates,
              developers spend valuable time manually translating these
              technical messages into user-friendly language.
            </p>
            <p>
              ShipNote aims to be the go-to tool for developers who want to
              maintain transparency with their users without sacrificing
              development time. We believe that every software release deserves
              beautiful, understandable release notes—and that creating them
              should be effortless.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              By combining the power of AI with seamless Git integration,
              ShipNote automatically transforms your raw git logs into polished,
              categorized &quot;What&apos;s New&quot; changelogs that your users
              will actually understand and appreciate, making it easier than
              ever to bridge the gap between technical development and user
              communication.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <div className="space-y-6">
        <h2 className="text-slate-900 dark:text-slate-100 text-2xl text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden group">
            <CardContent className="pt-8 p-6 text-center">
              <div className="mx-auto p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl w-fit mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Terminal className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-3 text-lg">
                1. Input Commits
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste your git log output, download our CLI tool, or connect
                your GitHub account to automatically pull commits from your
                repositories.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden group">
            <CardContent className="pt-8 p-6 text-center">
              <div className="mx-auto p-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-2xl w-fit mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-3 text-lg">
                2. AI Processing
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Claude AI analyzes your commits, understands the context, and
                categorizes them into user-friendly sections like Features, Bug
                Fixes, and Performance.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden group">
            <CardContent className="pt-8 p-6 text-center">
              <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl w-fit mb-4 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 mb-3 text-lg">
                3. Get Changelog
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Receive a beautifully formatted, emoji-enhanced changelog ready
                to share with your users in release notes, documentation, or
                announcements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Features */}
      <div className="space-y-6">
        <h2 className="text-slate-900 dark:text-slate-100 text-2xl text-center">
          Key Features
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden">
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                    GitHub Integration
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Connect your GitHub account to pull commits directly from
                    your repositories with customizable date ranges.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden">
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg shadow-yellow-500/30">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                    Smart Categorization
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    AI automatically groups commits into logical categories: New
                    Features, Bug Fixes, Performance, and more.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden">
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                    Save Time
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    What used to take 30+ minutes of manual writing now takes
                    seconds. Focus on building, not documenting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden">
            <CardContent className="pt-6 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                    CLI Tool
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Download our bash script to extract and format commits
                    directly from your local repositories.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Use Cases */}
      <Card className="glass-card rounded-2xl border-2 overflow-hidden">
        <CardContent className="pt-8 p-8">
          <h2 className="text-slate-900 dark:text-slate-100 mb-6 text-2xl text-center">
            Perfect For
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <span className="text-2xl">📦</span>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                  Release Notes
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generate professional release notes for every version of your
                  software, keeping users informed of improvements.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                  Product Updates
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Create &quot;What&apos;s New&quot; announcements for mobile
                  apps, web apps, or SaaS products that users actually want to
                  read.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                  Documentation
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Maintain up-to-date changelog documentation for open source
                  projects or internal team communication.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">💼</span>
              <div>
                <h3 className="text-slate-900 dark:text-slate-100 mb-2 text-lg">
                  Stakeholder Updates
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Quickly summarize development progress for product managers,
                  clients, or non-technical stakeholders.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="glass-card rounded-2xl border-2 overflow-hidden">
        <CardContent className="pt-8 p-8">
          <h2 className="text-slate-900 dark:text-slate-100 mb-6 text-2xl text-center">
            Built With
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { name: "React", color: "from-cyan-500 to-blue-500" },
              { name: "TypeScript", color: "from-blue-600 to-blue-700" },
              { name: "Tailwind CSS", color: "from-sky-500 to-cyan-500" },
              { name: "Claude AI", color: "from-purple-500 to-purple-600" },
              { name: "Lucide Icons", color: "from-orange-500 to-red-500" },
              { name: "GitHub API", color: "from-slate-600 to-slate-700" },
            ].map((tech) => (
              <span
                key={tech.name}
                className={`px-4 py-2 bg-gradient-to-r ${tech.color} text-white rounded-full text-sm shadow-lg hover-lift`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Powered By Acknowledgments */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="pt-8 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                <Github className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 text-xl">
                Powered by GitHub
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              ShipNote leverages the GitHub API to seamlessly connect to your
              repositories and pull commit history, making changelog generation
              effortless.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift rounded-2xl border-2 overflow-hidden bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-slate-800">
          <CardContent className="pt-8 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <Image
                  src="/images/ClaudeAI.png"
                  alt="Claude AI Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 text-xl">
                Powered by Claude
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Anthropic&apos;s Claude AI intelligently analyzes commit messages
              and transforms them into user-friendly, categorized changelogs
              with natural language.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
