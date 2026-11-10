import GitHubPRs from "@/components/github-prs";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Open source",
  description: `Pull requests by ${DATA.name} — merged, open, and closed.`,
};

export default function OpenSourcePage() {
  const gh = "https://github.com/" + DATA.githubUsername;
  return (
    <main className="pf-main pf-main-blog">
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--muted)", textDecoration: "none", marginBottom: 28 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Home
      </Link>
      <h1 style={{ margin: "0 0 8px", fontSize: "clamp(32px,5.5vw,44px)", fontWeight: 700, letterSpacing: "-0.03em" }}>
        Open source
      </h1>
      <p style={{ margin: "0 0 20px", color: "var(--muted)", fontSize: 16 }}>
        Merged and open pull requests from 2026 by{" "}
        <a href={gh} target="_blank" rel="noopener">@{DATA.githubUsername}</a>. Some projects, PyTorch among them, land
        changes by rebasing them onto main and closing the PR; those count as merged here and are marked{" "}
        <span className="pf-pr-landed">landed on main</span>.
      </p>
      <GitHubPRs user={DATA.githubUsername} count={100} states={["merged", "open"]} year={2026} summary />
    </main>
  );
}
