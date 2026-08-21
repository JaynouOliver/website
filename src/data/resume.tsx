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
  location: "Kolkata, India",
  locationLink: "https://www.google.com/maps/place/kolkata",
  // Shown under "hi, i'm ..." on the homepage. Markdown links work: [word](https://url)
  description:
    "TLDR: Suvrakamal Das is a software engineer and entrepreneur, [here's](/blog/life-story) my life so far in a nutshell. I work on the conjunction of AI and hardware. I spoke at a couple of conferences and have a few publications. Find me on [X](https://x.com/SuvrakamalD).",
  summary:
    "I'm a certified TensorFlow ML Engineer, and have publications at the SciPyConf. Read my latest research - [here](https://doi.org/10.25080/XHDR4700)",
  avatarUrl: "/me.jpg", // your photo — file lives in public/
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
  projects: [
    {
      title: "Transtokenization",
      href: "https://github.com/JaynouOliver/Mistral-7B-v0.3-transtokenized-Hindi",
      dates: "",
      active: true,
      description:
        "Adapted Mistral-7B from English to Hindi through tokenizer reconfiguration and cross-lingual token mapping — better perplexity, BLEU, and CHRF without full retraining.",
      technologies: ["Python", "PyTorch", "LLMs"],
      links: [
        {
          type: "Source",
          href: "https://github.com/JaynouOliver/Mistral-7B-v0.3-transtokenized-Hindi",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "AI Agent based Pull Request Reviewer",
      href: "https://github.com/JaynouOliver/pr-ai-agent",
      dates: "",
      active: true,
      description:
        "Autonomous code review agent for GitHub pull requests. Celery workers with Redis as broker, built on CrewAI over the OpenAI API — receives, analyzes, and reviews code as structured JSON.",
      technologies: ["Python", "Celery", "Redis", "CrewAI"],
      links: [
        {
          type: "Source",
          href: "https://github.com/JaynouOliver/pr-ai-agent",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "Digital Divide AI",
      href: "https://www.digitaldivide.ai/about",
      dates: "",
      active: true,
      description:
        "Collaboration between XRI Global and the University of Arizona: real-time visibility into AI model capabilities across the world's languages, starting with foundational technology support for all languages.",
      technologies: ["Next.js", "AI evaluation"],
      links: [
        {
          type: "Website",
          href: "https://www.digitaldivide.ai/about",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/XRILLC/inclusiveai-app",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
    {
      title: "AI based changelog",
      href: "https://github.com/JaynouOliver/changelog",
      dates: "",
      active: true,
      description:
        "Developer tool that AI-generates changelogs on release, wired together with GitHub Actions, the GitHub API, and the OpenAI API — with a manual override when you want it.",
      technologies: ["GitHub Actions", "OpenAI API"],
      links: [
        {
          type: "Website",
          href: "https://changelog.suvrakamaldas.online/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/JaynouOliver/changelog",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  // Research, talks, and conferences now live as blog posts in src/data/posts/ —
  // one TS file each, listed under "Research and International presentations".
};
