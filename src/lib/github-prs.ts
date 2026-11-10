// Server-side: the user's recent pull requests, with "closed" PRs that actually
// landed counted as merged.
//
// Some projects (PyTorch, for one) never press GitHub's merge button: a bot
// rebases the PR onto main as a commit like "... (#196979)" and closes the PR.
// GitHub then reports it as closed, not merged. For each closed PR we check:
//   1. a "Merged" label (PyTorch's merge bot adds one), else
//   2. a commit on the repo's default branch referencing "(#N)" that hasn't
//      been reverted (commit search only covers the default branch).
// Everything is unauthenticated (public data only) and cached, so visitors
// never hit GitHub's rate limits directly.

export type PRState = "merged" | "open" | "closed";
export type PR = {
  title: string;
  url: string;
  repo: string;
  number: number;
  created: string;
  state: PRState;
  landed?: boolean; // merged by commit (rebase/bot), not GitHub's merge button
};

const GH = "https://api.github.com";
const HEADERS = { Accept: "application/vnd.github+json", "User-Agent": "subhrokomol-portfolio" };
const MAX_COMMIT_CHECKS = 8; // commit search allows 10 unauthenticated requests per minute

type SearchItem = {
  title: string;
  html_url: string;
  number: number;
  state: "open" | "closed";
  created_at: string;
  repository_url: string;
  labels?: { name: string }[];
  pull_request?: { merged_at: string | null };
};

async function landedOnMain(repo: string, number: number): Promise<boolean | null> {
  const q = `repo:${repo} "#${number}"`;
  const r = await fetch(`${GH}/search/commits?per_page=20&q=${encodeURIComponent(q)}`, {
    headers: HEADERS,
    // A closed PR's fate rarely changes; recheck once a day.
    next: { revalidate: 86400 },
  });
  if (!r.ok) return null; // rate-limited or unavailable: leave it as closed
  const data = (await r.json()) as { items?: { commit: { message: string } }[] };
  const ref = new RegExp(`\\(#${number}\\)|/pull/${number}\\b`);
  let landed = 0;
  let reverted = 0;
  for (const it of data.items || []) {
    const msg = it.commit.message;
    if (!ref.test(msg)) continue;
    if (/^Revert\b/i.test(msg)) reverted++;
    else landed++;
  }
  return landed > reverted;
}

export async function getPRs(user: string): Promise<PR[]> {
  const q = `type:pr author:${user}`;
  const r = await fetch(`${GH}/search/issues?sort=created&order=desc&per_page=100&q=${encodeURIComponent(q)}`, {
    headers: HEADERS,
    next: { revalidate: 3600 },
  });
  if (!r.ok) throw new Error("GitHub search failed: " + r.status);
  const items = ((await r.json()) as { items?: SearchItem[] }).items || [];

  const prs: PR[] = items.map((it) => ({
    title: it.title,
    url: it.html_url,
    repo: it.repository_url.split("/repos/")[1] || "",
    number: it.number,
    created: it.created_at,
    state: it.pull_request?.merged_at ? "merged" : it.state,
  }));

  let checks = 0;
  for (let i = 0; i < prs.length; i++) {
    const pr = prs[i];
    if (pr.state !== "closed") continue;
    if (items[i].labels?.some((l) => l.name === "Merged")) {
      pr.state = "merged";
      pr.landed = true;
      continue;
    }
    if (checks >= MAX_COMMIT_CHECKS) continue;
    checks++;
    if (await landedOnMain(pr.repo, pr.number)) {
      pr.state = "merged";
      pr.landed = true;
    }
  }
  return prs;
}
