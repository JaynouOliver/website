// ══ YOUR BLOG, ONE FILE PER POST ══
// Research, talks, and writing all live here as standard posts.
// To add one:
//   1. Copy any file in this folder to a new file.
//   2. Edit slug/title/date/summary/image and write the body in markdown.
//   3. Import it below and add it to the list. Done — it appears everywhere.
import type { Post } from "./types";
import { post as whyBoringTechWins } from "./why-boring-tech-wins";
import { post as raftFromScratch } from "./raft-from-scratch";
import { post as latencyBudget } from "./latency-budget";
import { post as scipy2024Paper } from "./scipy-2024-paper";
import { post as pytorch2025Poster } from "./pytorch-2025-poster";
import { post as transtokenizationSession } from "./transtokenization-session";
import { post as kubeconIndia2024 } from "./kubecon-india-2024";
import { post as fossKolkataTalk } from "./foss-kolkata-talk";
import { post as mlopsCloudNativeTalk } from "./mlops-cloud-native-talk";
import { post as entrepreneurshipTalk } from "./entrepreneurship-talk";
import { post as hackTheNorth2023 } from "./hack-the-north-2023";
import { post as lifeStory } from "./life_story";

export type { Post };

export const posts: Post[] = [
  
  whyBoringTechWins,
  raftFromScratch,
  latencyBudget,
  scipy2024Paper,
  pytorch2025Poster,
  transtokenizationSession,
  kubeconIndia2024,
  fossKolkataTalk,
  mlopsCloudNativeTalk,
  entrepreneurshipTalk,
  hackTheNorth2023,
  lifeStory,
].sort((a, b) => +new Date(b.date) - +new Date(a.date));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
