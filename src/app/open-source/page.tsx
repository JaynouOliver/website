import GitHubPRs from "@/components/github-prs";
import { DATA } from "@/data/resume";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Open source",
  description: `Pull requests by ${DATA.name} — merged, open, and closed.`,
};

const dot = (color: string) => ({
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: 999,
  background: color,
  marginRight: 6,
});

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
      <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: 16 }}>
        All pull requests by{" "}
        <a href={gh} target="_blank" rel="noopener">@{DATA.githubUsername}</a>, pulled live from GitHub.
      </p>
      <p style={{ margin: "0 0 30px", color: "var(--faint)", fontSize: 13.5, display: "flex", flexWrap: "wrap", gap: "4px 18px" }}>
        <span><span style={dot("#8250df")} />Merged</span>
        <span><span style={dot("#1a7f37")} />Open</span>
        <span><span style={dot("#cf222e")} />Closed</span>
      </p>
      <GitHubPRs user={DATA.githubUsername} count={100} />
    </main>
  );
}
