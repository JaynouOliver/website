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
  role: "Machine Learning Engineer", // shown under the greeting
  location: "Kolkata, India",
  locationLink: "https://www.google.com/maps/place/kolkata",
  // Shown under "hi, i'm ..." on the homepage. Markdown links work: [word](https://url)
  description:
    "I ship AI systems into production and work directly with stakeholders: fine-tuned vision models, retrieval and similarity search, API integrations and GPU inference. Merged PRs in PyTorch and vLLM, spoke at PyCon, published at SciPy. [Here's](/blog/life-story) my journey in a nutshell — or find me on [X](https://x.com/SuvrakamalD).",
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
        "Production-grade backend that automates pull request analysis and code quality checks — FastAPI + Celery workers with Redis, AI-based issue detection (CrewAI over the OpenAI API), background processing and caching for consistent performance under load.",
      technologies: ["Python", "FastAPI", "Celery", "Redis", "CrewAI"],
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
  // Shown in "Talks & awards". Markdown links work in title/note.
  awards: [
    { title: "MCP Dev Summit Shanghai", note: "Scholarship to speak", place: "Shanghai, China", date: "Sep 2026" },
    { title: "PyCon JP", note: "Scholarship to attend", place: "Hiroshima, Japan", date: "Aug 2026" },
    { title: "PyCon US", note: "Scholarship to attend; posters presented", place: "Long Beach, USA", date: "May 2026" },
    { title: "[Mamba Models a Replacement for Transformers](https://doi.org/10.25080/XHDR4700)", note: "Paper at SciPy 2024", place: "Washington, USA", date: "Aug 2024" },
    { title: "Open source", note: "Merged PRs in PyTorch, vLLM and other major repos; PyTorch Conference poster", place: "", date: "" },
  ],
  education: [
    { school: "Academy of Technology", degree: "BTech — Computer Science and Business Systems", place: "Aedconagar, India" },
  ],
  // Research, talks, and conferences now live as blog posts in src/data/posts/ —
  // one TS file each, listed under "Research and International presentations".
};
