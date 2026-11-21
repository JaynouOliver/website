// The site as plain Markdown, for AI agents and crawlers.
//
// Everything here is generated from the same data the pages use (resume.tsx,
// quests.ts, talks.ts, posts/), so a new blog post, talk or job shows up in
// /llms.txt, /llms-full.txt, /agent and the .md page copies with no extra step.
//
// Served by: src/app/llms.txt, src/app/llms-full.txt, src/app/md/[...path]
// (rewritten from /index.md, /blog/<slug>.md, ...; see next.config.mjs).

import { posts, type Post } from "@/data/posts";
import { DATA } from "@/data/resume";
import { alsoNote, talks } from "@/data/talks";
import { getPRs } from "@/lib/github-prs";
import { ALT_NAMES, SITE } from "@/lib/seo";

const abs = (u: string) => (u.startsWith("/") ? SITE + u : u);
// Site-relative links and images -> absolute, so the text works out of context.
const absLinks = (md: string) => md.replace(/\]\((\/[^)\s]*)\)/g, (_m, u) => "](" + SITE + u + ")");
const social = DATA.contact.social;

export function profileMd(): string {
  return [
    `# ${DATA.name}`,
    "",
    `> ${DATA.seoDescription}`,
    "",
    `- Name: ${DATA.name} (also written ${ALT_NAMES.join(", ")})`,
    `- Role: ${DATA.role}`,
    `- Current job: ${DATA.work[0].title} at ${DATA.work[0].company} (since ${DATA.work[0].start})`,
    `- Based in: ${DATA.location}`,
    `- Website: ${SITE}`,
    `- GitHub: ${social.GitHub.url}`,
    `- LinkedIn: ${social.LinkedIn.url}`,
    `- X: ${social.X.url}`,
    `- Email: ${DATA.contact.email}`,
    "",
    absLinks(DATA.description),
  ].join("\n");
}

export function workMd(): string {
  return [
    "## Work experience",
    ...DATA.work.map((j) =>
      ["", `### ${j.title}, ${j.company} (${j.start} to ${j.end})`, `${j.location} · ${j.href}`, "", ...j.points.map((p) => "- " + absLinks(p))].join("\n"),
    ),
  ].join("\n");
}

export function projectMd(): string {
  const p = DATA.project;
  return [
    `## Project: ${p.name}`,
    "",
    `${p.tagline} ${p.kicker}.`,
    "",
    p.pitch,
    "",
    ...p.highlights.map((h) => `- **${h.title}:** ${h.body}`),
    "",
    ...p.stats.map((s) => `- ${s.value}: ${s.label}`),
    "",
    p.note,
    "",
    `- Built with: ${p.technologies.join(", ")}`,
    `- Demo: ${p.demo}`,
    `- Source: ${p.source}`,
  ].join("\n");
}

const STATUS = { upcoming: "accepted, upcoming", missed: "accepted, did not attend" } as const;

export function talksMd(): string {
  return [
    "## Talks, papers and conferences",
    "",
    "Latest first.",
    ...talks.map((t) =>
      [
        "",
        `### ${t.event}, ${t.city}, ${t.country} (${t.date})`,
        `${t.roles.join(", ")}${t.status ? " · " + STATUS[t.status] : ""}`,
        ...(t.title ? ["", `"${t.title}" ${t.with || ""}`.trim()] : []),
        "",
        t.about,
        "",
        ...t.body.map(absLinks),
        ...(t.links.length ? ["", ...t.links.map((l) => `- [${l.label}](${abs(l.href)})`)] : []),
      ].join("\n"),
    ),
    "",
    alsoNote,
  ].join("\n");
}

export async function openSourceMd(): Promise<string> {
  const head = ["## Open source", "", `Pull requests by [@${DATA.githubUsername}](${social.GitHub.url}) to other people's projects. Live list: ${SITE}/open-source`];
  try {
    const prs = (await getPRs(DATA.githubUsername)).filter((p) => p.state !== "closed").slice(0, 40);
    return [
      ...head,
      "",
      ...prs.map((p) => `- [${p.title}](${p.url}) · ${p.repo}#${p.number} · ${p.state}${p.how === "cherry-picked" ? " (cherry-picked to main)" : p.landed ? " (landed on main)" : ""} · ${p.created.slice(0, 10)}`),
    ].join("\n");
  } catch {
    return head.join("\n"); // GitHub unavailable: keep the pointer to the live page
  }
}

export function postsIndexMd(): string {
  return ["## Writing", "", ...posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}.md) (${p.date}): ${p.summary}`)].join("\n");
}

// A post body: bare image lines become Markdown images, links become absolute.
function bodyMd(body: string): string {
  return absLinks(
    body
      .trim()
      .split("\n")
      .map((l) => (/^(\/|https?:\/\/)\S+\.(png|jpe?g|webp|gif|svg)$/i.test(l.trim()) ? `![](${abs(l.trim())})` : l))
      .join("\n"),
  );
}

// `level` is the heading level of the post title; headings inside the body are
// pushed below it so a post nests cleanly inside a longer document.
export function postMd(p: Post, level = 1): string {
  const body = bodyMd(p.body).replace(/^(#{1,6}) /gm, (_m, h: string) => "#".repeat(Math.min(6, Math.max(level + 1, h.length + level - 1))) + " ");
  return [`${"#".repeat(level)} ${p.title}`, "", `By ${DATA.name} · ${p.date} · ${SITE}/blog/${p.slug}`, "", `> ${p.summary}`, "", body].join("\n");
}

/* ---------- the published files ---------- */

// /llms.txt: a short index, in the llmstxt.org layout.
export function llmsTxt(): string {
  return [
    `# ${DATA.name}`,
    "",
    `> ${DATA.seoDescription}`,
    "",
    `This is the personal site of ${DATA.name} (also written ${ALT_NAMES.join(", ")}), ${DATA.role} based in ${DATA.location}. Every page has a Markdown copy: add \`.md\` to its address. The whole site in one file is at ${SITE}/llms-full.txt.`,
    "",
    "## About",
    "",
    `- [Everything in one file](${SITE}/llms-full.txt): profile, work, project, talks, open source and every blog post`,
    `- [Profile and work](${SITE}/index.md): who he is, what he builds, experience, featured project, talks`,
    `- [Open source](${SITE}/open-source.md): merged and open pull requests (PyTorch, vLLM and others)`,
    "",
    "## Writing",
    "",
    ...posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}.md): ${p.summary} (${p.date})`),
    "",
    "## Elsewhere",
    "",
    `- [GitHub](${social.GitHub.url})`,
    `- [LinkedIn](${social.LinkedIn.url})`,
    `- [X](${social.X.url})`,
    "",
    "## Optional",
    "",
    `- [Sitemap](${SITE}/sitemap.xml)`,
    `- [Human-readable site](${SITE})`,
  ].join("\n") + "\n";
}

// /index.md: the homepage.
export function homeMd(): string {
  return [profileMd(), workMd(), projectMd(), talksMd(), postsIndexMd()].join("\n\n") + "\n";
}

// /llms-full.txt: everything.
export async function llmsFull(): Promise<string> {
  return (
    [
      profileMd(),
      workMd(),
      projectMd(),
      talksMd(),
      await openSourceMd(),
      "## Blog posts (full text)",
      ...posts.map((p) => postMd(p, 3)),
    ].join("\n\n") + "\n"
  );
}

// Markdown for a path like "index", "blog", "blog/<slug>", "open-source".
export async function pageMd(path: string): Promise<string | null> {
  if (path === "index" || path === "") return homeMd();
  if (path === "blog") return [`# Writing by ${DATA.name}`, "", ...posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}.md) (${p.date}): ${p.summary}`)].join("\n") + "\n";
  if (path === "open-source") return `# ${DATA.name}\n\n` + (await openSourceMd()) + "\n";
  if (path.startsWith("blog/")) {
    const p = posts.find((x) => x.slug === path.slice(5));
    return p ? postMd(p) + "\n" : null;
  }
  return null;
}
