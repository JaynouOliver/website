// ══ YOUR BLOG, ONE FILE PER POST ══
// To add a post:
//   1. Copy any file in this folder (e.g. latency-budget.ts) to a new file.
//   2. Edit slug/title/date/summary/image and write the body in markdown.
//   3. Import it below and add it to the list. Done — it appears everywhere.
import type { Post } from "./types";
import { post as whyBoringTechWins } from "./why-boring-tech-wins";
import { post as raftFromScratch } from "./raft-from-scratch";
import { post as latencyBudget } from "./latency-budget";

export type { Post };

export const posts: Post[] = [
  whyBoringTechWins,
  raftFromScratch,
  latencyBudget,
].sort((a, b) => +new Date(b.date) - +new Date(a.date));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
