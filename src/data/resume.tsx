import { Icons } from "@/components/icons";
import { quests } from "@/data/quests";
import { HomeIcon, NotebookIcon } from "lucide-react";

// ══ YOUR PORTFOLIO, ONE FILE ══
// Everything on the site renders from this object. Edit and save — the dev
// server hot-reloads. Images: drop files in public/ and reference "/file.png".
// Blog posts live in src/data/posts/ — one TS file per post.
export const DATA = {
  name: "Suvrakamal Das",
  nickname: "Subhro", // shown in the "hi, i'm ..." greeting
  initials: "SD",
  url: "https://subhrokomol.in", // used for SEO metadata — set to your deployed URL
  role: "AI Engineer", // shown under the greeting
  location: "Kolkata, India",
  locationLink: "https://www.google.com/maps/place/kolkata",
  // Shown under "hi, i'm ..." on the homepage. Markdown links work: [word](https://url)
  description:
    "I build AI agents: the skills they learn, the orchestration that runs them, and the infra underneath. Merged PRs in PyTorch and vLLM, spoke at PyCon and MCP Dev Summit, published at SciPy. [Here's](/blog/life-story) my journey in a nutshell — or find me on [X](https://x.com/SuvrakamalD).",
  summary:
    "I'm a certified TensorFlow ML Engineer, and have publications at the SciPyConf. Read my latest research - [here](https://doi.org/10.25080/XHDR4700)",
  avatarUrl: "/me.jpg", // your photo — file lives in public/
  heroImage: "/me-golden-gate.webp", // big photo at the top of the homepage (portrait works best)
  heroImageAlt: "Subhro at the Golden Gate Bridge",
  githubUsername: "JaynouOliver", // recent PRs are pulled live from GitHub for this user
  blogTagline: "Papers, talks, conferences, and notes.",
  skills: [
    "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Tableau", "Power BI", "SQL", "Python", "C++", "Typescript", "Node.js", "Go", "Java", "AWS (Sagemaker, Lambda)", "GCP (Vertex AI, Dialogflow CX)", "Postgres", "Docker", "Kubernetes", "Scrum", "Jenkins", "CICD", "React", "Next.js",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "subhrokomol@gmail.com",
    tel: "",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/JaynouOliver/",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/suvrakamaldas/",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/SuvrakamalD",
        icon: Icons.x,
        navbar: true,
      },
      Youtube: {
        name: "Youtube",
        url: "https://www.youtube.com/@SuvrakamalD",
        icon: Icons.youtube,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "#",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  // Main quests moved to src/data/quests.ts — edit there or via /editor/quests.
  work: quests,
  // The one featured project on the homepage. Markdown links/bold work in text fields.
  project: {
    name: "Meld",
    logo: "/meld-mark.svg",
    kicker: "Built for the Meta AI Developer Hackathon",
    tagline: "Slack and Jira in one app, with AI agents as teammates.",
    pitch:
      "Teams decide things in chat and track them in tickets, and the work gets lost in between. In Meld, agents sit in your channels and keep the work up to date on their own: \"I'll do it by Friday\" becomes a ticket, \"it's up for review\" moves one, and a decision that gets reopened is linked back to where and why it was made.",
    image: "/meld-preview.webp",
    imageAlt: "Meld: Atlas logs a pricing decision in #product and updates ticket ORB-5, next to a mission tracking the paid-plans launch",
    highlights: [
      { title: "Listens, then acts", body: "Commitments become tickets, progress said in chat moves them, small talk is ignored. Every change comes with **Undo**." },
      { title: "Remembers decisions", body: "Reopen a settled question and Atlas replies with who decided, when, why, and a link to the original thread." },
      { title: "Missions, not just tickets", body: "Give it a goal: it plans the tickets, runs check-ins, re-plans when work slips and asks you only when a call is needed." },
      { title: "Bring your own agent", body: "Any MCP client (Claude Code, Codex, Cursor) joins as a workspace member with an inbox, channels and ticket access." },
    ],
    stats: [
      { value: "~1 s", label: "to read every message (Muse Spark 1.2)" },
      { value: "32 / 32", label: "agent eval cases passing" },
      { value: "31 → 8 s", label: "mission planning, tuned per call" },
    ],
    note: "Agents only see what the person asking can see, so roles and permissions carry over to every action.",
    technologies: ["Next.js 16", "TypeScript", "Meta Model API", "Supabase", "React Query", "MCP", "SwiftUI (Mac)"],
    demo: "https://meld-fawn.vercel.app",
    source: "https://github.com/JaynouOliver/Meld",
  },
  // Research, talks, and conferences now live as blog posts in src/data/posts/ —
  // one TS file each, listed under "Research and International presentations".
};
