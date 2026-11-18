// Server-side: the user's recent pull requests, with "closed" PRs that actually
// landed counted as merged.
//
// Some projects (PyTorch, for one) never press GitHub's merge button: a bot
// rebases the PR onto main as a commit like "... (#196979)" and closes the PR.
// GitHub then reports it as closed, not merged. For each closed PR we check:
//   1. a "Merged" label (PyTorch's merge bot adds one), else
//   2. a commit on the repo's default branch referencing "(#N)" that hasn't
//      been reverted (commit search only covers the default branch), else
//   3. a commit there that I authored with the PR's title: maintainers
//      sometimes cherry-pick a PR by hand and close it (Graphify does).
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
  landed?: boolean; // merged by commit (rebase/bot/cherry-pick), not GitHub's merge button
  how?: "rebased" | "cherry-picked";
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

type Commit = { commit: { message: string; committer?: { date?: string } } };

async function searchCommits(q: string): Promise<Commit[] | null> {
  const r = await fetch(`${GH}/search/commits?per_page=50&sort=committer-date&order=desc&q=${encodeURIComponent(q)}`, {
    headers: HEADERS,
    // A closed PR's fate rarely changes; recheck once a day.
    next: { revalidate: 86400 },
  });
  if (!r.ok) return null; // rate-limited or unavailable: leave it as closed
  return ((await r.json()) as { items?: Commit[] }).items || [];
}

// "fix(x): do the thing (#123)" -> "fix(x): do the thing"
const norm = (s: string) => s.split("\n")[0].replace(/\s*\(#\d+\)\s*$/, "").replace(/\s+/g, " ").trim().toLowerCase();

// How a closed PR reached the default branch, if it did:
//   "rebased"       a commit there references the PR ("(#N)" or its URL)
//   "cherry-picked" a commit there, authored by me after the PR was opened,
//                   has the PR's title (maintainers cherry-picked it by hand)
function landedIn(commits: Commit[], pr: PR): "rebased" | "cherry-picked" | null {
  const ref = new RegExp(`\\(#${pr.number}\\)|/pull/${pr.number}\\b`);
  let landed = 0, reverted = 0, picked = false;
  for (const it of commits) {
    const msg = it.commit.message;
    if (ref.test(msg)) {
      if (/^Revert\b/i.test(msg)) reverted++;
      else landed++;
    } else if (norm(msg) === norm(pr.title) && (it.commit.committer?.date || "") >= pr.created) picked = true;
  }
  return landed > reverted ? "rebased" : picked ? "cherry-picked" : null;
}

export async function getPRs(user: string): Promise<PR[]> {
  const q = `type:pr author:${user}`;
  const r = await fetch(`${GH}/search/issues?sort=created&order=desc&per_page=100&q=${encodeURIComponent(q)}`, {
    headers: HEADERS,
    next: { revalidate: 3600 },
  });
  if (!r.ok) throw new Error("GitHub search failed: " + r.status);
  const items = ((await r.json()) as { items?: SearchItem[] }).items || [];

  // Only contributions to other people's projects: skip PRs in my own repos.
  const own = (it: SearchItem) => it.repository_url.split("/repos/")[1]?.split("/")[0].toLowerCase() === user.toLowerCase();
  const kept = items.filter((it) => !own(it));
  const prs: PR[] = kept.map((it) => ({
    title: it.title,
    url: it.html_url,
    repo: it.repository_url.split("/repos/")[1] || "",
    number: it.number,
    created: it.created_at,
    state: it.pull_request?.merged_at ? "merged" : it.state,
  }));

  // Commit search allows 10 unauthenticated requests a minute, so: one search
  // per repo for commits I authored (covers both cases for most projects),
  // then a per-PR search for the PR number if that found nothing.
  let checks = 0;
  const mine = new Map<string, Commit[] | null>();
  for (let i = 0; i < prs.length; i++) {
    const pr = prs[i];
    if (pr.state !== "closed") continue;
    if (kept[i].labels?.some((l) => l.name === "Merged")) {
      pr.state = "merged";
      pr.landed = true;
      pr.how = "rebased";
      continue;
    }
    if (!mine.has(pr.repo)) {
      if (checks >= MAX_COMMIT_CHECKS) continue;
      checks++;
      mine.set(pr.repo, await searchCommits(`repo:${pr.repo} author:${user}`));
    }
    let how = landedIn(mine.get(pr.repo) || [], pr);
    if (!how && checks < MAX_COMMIT_CHECKS) {
      checks++;
      how = landedIn((await searchCommits(`repo:${pr.repo} "#${pr.number}"`)) || [], pr) === "rebased" ? "rebased" : null;
    }
    if (how) {
      pr.state = "merged";
      pr.landed = true;
      pr.how = how;
    }
  }
  return prs;
}
