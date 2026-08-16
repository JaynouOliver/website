"use client";

import { fmtDate } from "@/lib/md";
import { useEffect, useState } from "react";

type PR = { title: string; url: string; repo: string; date: string; dot: string };

// Recent pull requests, pulled live from the GitHub search API — the list grows on its own.
export default function GitHubPRs({ user, count = 8 }: { user: string; count?: number }) {
  const [prs, setPrs] = useState<PR[]>([]);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  useEffect(() => {
    if (!user) { setState("error"); return; }
    (async () => {
      try {
        const r = await fetch(
          "https://api.github.com/search/issues?q=type:pr+author:" +
            encodeURIComponent(user) + "&sort=created&order=desc&per_page=" + count
        );
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        setPrs(
          (data.items || []).map((it: any) => {
            const merged = it.pull_request && it.pull_request.merged_at;
            const state = merged ? "merged" : it.state;
            return {
              title: it.title,
              url: it.html_url,
              repo: (it.repository_url || "").split("/repos/")[1] || "",
              date: fmtDate(it.created_at),
              dot: state === "merged" ? "#8250df" : state === "open" ? "#1a7f37" : "#cf222e",
            };
          })
        );
        setState("done");
      } catch {
        setState("error");
      }
    })();
  }, [user, count]);

  if (state === "loading")
    return <p style={{ color: "var(--faint)", fontSize: 14 }}>Fetching pull requests…</p>;
  if (state === "error")
    return (
      <p style={{ color: "var(--faint)", fontSize: 14 }}>
        Couldn&apos;t reach GitHub right now — see everything on{" "}
        <a href={"https://github.com/" + user} target="_blank" rel="noopener">my profile</a>.
      </p>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {prs.map((pr) => (
        <a key={pr.url} href={pr.url} target="_blank" rel="noopener" className="pf-prrow">
          <span style={{ width: 8, height: 8, borderRadius: 999, background: pr.dot, flex: "none" }} />
          <span style={{ fontWeight: 600, fontSize: 14.5, flex: 1, minWidth: 200 }}>{pr.title}</span>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>{pr.repo}</span>
          <span style={{ color: "var(--faint)", fontSize: 13, whiteSpace: "nowrap" }}>{pr.date}</span>
        </a>
      ))}
    </div>
  );
}
