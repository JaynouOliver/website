"use client";

import { fmtDate } from "@/lib/md";
import type { PR } from "@/lib/github-prs";
import Link from "next/link";
import { useEffect, useState } from "react";

// Recent pull requests from /api/prs (server-cached; PRs that landed as a
// rebased commit count as merged; ones closed without landing are tagged). Optional filters: `states` keeps only those
// states, `year` keeps only PRs created that year. `summary` shows totals.

const MergedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
  </svg>
);
const OpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
  </svg>
);
const ClosedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.251 2.251 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.273a.75.75 0 0 1 1.06 0l.97.97.97-.97a.748.748 0 0 1 1.265.332.75.75 0 0 1-.205.729l-.97.97.97.97a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-.97-.97-.97.97a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l.97-.97-.97-.97a.75.75 0 0 1 0-1.06ZM2.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0ZM3.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9.5 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
  </svg>
);

const ICON = { merged: <MergedIcon />, open: <OpenIcon />, closed: <ClosedIcon /> };
const LABEL = { merged: "Merged", open: "Open", closed: "Closed" };

export default function GitHubPRs({
  user,
  count = 8,
  showMoreHref,
  states,
  year,
  summary,
  filter,
}: {
  user: string;
  count?: number;
  showMoreHref?: string;
  states?: PR["state"][];
  year?: number;
  summary?: boolean;
  filter?: boolean; // show All / Merged / Open buttons above the list
}) {
  const [all, setAll] = useState<PR[] | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [tab, setTab] = useState<"all" | "merged" | "open">("all");

  useEffect(() => {
    let alive = true;
    fetch("/api/prs")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: { prs: PR[] | null }) => {
        if (!alive) return;
        if (!d.prs) throw new Error("no data");
        setAll(d.prs);
        setStatus("done");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, []);

  if (status === "loading")
    return (
      <div className="pf-prlist" aria-busy="true">
        {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <div key={i} className="pf-pr pf-pr-skeleton" />
        ))}
      </div>
    );
  if (status === "error" || !all)
    return (
      <p style={{ color: "var(--faint)", fontSize: 14 }}>
        Couldn&apos;t reach GitHub right now. See everything on{" "}
        <a href={"https://github.com/" + user} target="_blank" rel="noopener">
          my profile
        </a>
        .
      </p>
    );

  const filtered = all.filter(
    (pr) => (!states || states.includes(pr.state)) && (!year || new Date(pr.created).getFullYear() === year),
  );
  const shown = filtered.filter((p) => tab === "all" || p.state === tab).slice(0, count);
  const merged = filtered.filter((p) => p.state === "merged").length;
  const open = filtered.filter((p) => p.state === "open").length;
  const closed = filtered.filter((p) => p.state === "closed").length;
  const repos = new Set(filtered.map((p) => p.repo)).size;

  return (
    <div>
      {summary && (
        <div className="pf-prstats">
          {!filter && (
            <>
              <span>
                <b>{merged}</b> merged
              </span>
              <span>
                <b>{open}</b> open
              </span>
            </>
          )}
          {closed > 0 && (
            <span>
              <b>{closed}</b> closed, not merged
            </span>
          )}
          <span>
            <b>{repos}</b> repos
          </span>
        </div>
      )}
      {filter && (
        <div className="pf-seg" role="group" aria-label="Filter pull requests">
          {([["all", "All", filtered.length], ["merged", "Merged", merged], ["open", "Open", open]] as const).map(([id, label, n]) => (
            <button key={id} className={tab === id ? "is-on" : ""} aria-pressed={tab === id} onClick={() => setTab(id)}>
              {label} <span>{n}</span>
            </button>
          ))}
        </div>
      )}
      <div className="pf-prlist">
        {shown.length === 0 && <p style={{ color: "var(--faint)", fontSize: 14, margin: "14px 0" }}>Nothing here yet.</p>}
        {shown.map((pr) => {
          const owner = pr.repo.split("/")[0];
          return (
            <a key={pr.url} href={pr.url} target="_blank" rel="noopener" className="pf-pr">
              <span className={"pf-pr-state is-" + pr.state} title={LABEL[pr.state]}>
                {ICON[pr.state]}
              </span>
              <span className="pf-pr-main">
                <span className="pf-pr-title">{pr.title}</span>
                <span className="pf-pr-meta">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={"https://github.com/" + owner + ".png?size=40"} alt="" width={16} height={16} loading="lazy" />
                  <span className="pf-pr-repo">{pr.repo}</span>
                  <span>#{pr.number}</span>
                  <span>{fmtDate(pr.created)}</span>
                  {pr.state === "closed" && (
                    <span className="pf-pr-closed" title="Closed on GitHub without being merged, and its change is not on the project's main branch">
                      closed, not merged
                    </span>
                  )}
                  {pr.landed && (
                    <span
                      className="pf-pr-landed"
                      title={
                        pr.how === "cherry-picked"
                          ? "Closed on GitHub, but the maintainers cherry-picked the commit onto main with my authorship"
                          : "Closed on GitHub, but its commit landed on main (rebased by the project's merge bot)"
                      }
                    >
                      {pr.how === "cherry-picked" ? "cherry-picked to main" : "landed on main"}
                    </span>
                  )}
                </span>
              </span>
            </a>
          );
        })}
      </div>
      {showMoreHref && shown.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <Link href={showMoreHref} className="pf-btn">
            Show more →
          </Link>
        </div>
      )}
    </div>
  );
}
