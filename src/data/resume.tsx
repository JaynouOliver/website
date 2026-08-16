import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

// ══ YOUR PORTFOLIO, ONE FILE ══
// Everything on the site renders from this object. Edit and save — the dev
// server hot-reloads. Images: drop files in public/ and reference "/file.png".
// Blog posts live in src/data/posts/ — one TS file per post.
export const DATA = {
  name: "Suvrakamal Das",
  nickname: "Subhro", // shown in the "hi, i'm ..." greeting
  initials: "SD",
  url: "https://suvrakamaldas.online", // used for SEO metadata — set to your deployed URL
  location: "Kolkata, India",
  locationLink: "https://www.google.com/maps/place/kolkata",
  // Shown under "hi, i'm ..." on the homepage. Markdown links work: [word](https://url)
  description:
    "Machine Learning Engineer, I love building things around ML. I am active on [Twitter](https://x.com/SuvrakamalD). Read my latest [research](https://doi.org/10.25080/XHDR4700).",
  summary:
    "I'm a certified TensorFlow ML Engineer, and have publications at the SciPyConf. Read my latest research - [here](https://doi.org/10.25080/XHDR4700)",
  avatarUrl: "/dp.jpg", // your photo — file lives in public/
  githubUsername: "JaynouOliver", // recent PRs are pulled live from GitHub for this user
  writingTagline: "Notes on systems, ML, and things I broke on purpose.",
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

  work: [
    {
      company: "Mattoboard",
      href: "https://mattoboard.com/",
      badges: [],
      location: "Remote",
      title: "Software Engineer",
      logoUrl: "/logo.png",
      start: "January 2026",
      end: "Present",
      // Bullet points shown on the site. Markdown links work in each point.
      points: [
        "Delivered product finder and similarity search — users find products by image or text, powered by cosine similarity over embeddings.",
        "Built image upload matching: the system finds the best matching product from the database for any uploaded photo.",
        "Work on the React frontend fixing bugs and improving UX, focused on the AI features of the software.",
      ],
    },
  ],
  education: [
    {
      school: "Academy of Technology",
      href: "",
      degree: "Bachelor of Technology in Computer Science and Business and Systems",
      logoUrl: "/images.jpeg",
      start: "",
      end: "",
    },
  ],
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
  // Papers and publications. meta = venue/year shown on the right.
  research: [
    {
      title: "Publication at SciPy Conference — accepted paper",
      meta: "SciPy 2024",
      link: "https://doi.org/10.25080/XHDR4700",
    },
    {
      title: "Poster: Real-time multi-hop reasoning with Nvidia cuGraphs",
      meta: "PyTorch Conference 2025",
      link: "https://pytorch.org",
    },
  ],
  // Talks, conferences, and community — rendered as a simple list.
  talks: [
    {
      title: "Poster accepted at PyTorch Conference 2025",
      meta: "September 2025 · California, USA",
      description:
        "Research on real-time multi-hop reasoning with Nvidia cuGraphs — optimized graph traversal for multi-hop reasoning in LLMs using GPU acceleration.",
      link: "https://pytorch.org",
    },
    {
      title: "AI session on trans-tokenization",
      meta: "March 2025 · Remote, India",
      description: "Conducted a session on trans-tokenization for large language models.",
      link: "",
    },
    {
      title: "Kubecon India",
      meta: "Dec 11–12, 2024 · Delhi, India",
      description: "Got a scholarship to attend Kubecon India.",
      link: "",
    },
    {
      title: "Speaker at FOSS Kolkata",
      meta: "October 2024 · Kolkata, India",
      description:
        "Talk on trans-tokenization for monolingual LLMs — fine-tuning, adapting trans-tokenization to existing methods, and building your own tokenizer.",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:7248060113524031488/",
    },
    {
      title: "SciPy Conference",
      meta: "July 8–14, 2024 · Tacoma, WA, USA",
      description: "My paper was accepted at this conference.",
      link: "https://doi.org/10.25080/XHDR4700",
    },
    {
      title: "Talk: MLOps on cloud-native technologies",
      meta: "May 2024 · Kolkata, India",
      description:
        "End-to-end ML pipelines with Kubeflow — an end-to-end MLOps project walkthrough.",
      link: "",
    },
    {
      title: "Talk on entrepreneurship",
      meta: "April 2024 · Kolkata, India",
      description:
        "How we raised funds for our startup with the initial MVP and scaled it for customers.",
      link: "https://www.linkedin.com/posts/academy-of-technology_a-special-talk-on-how-to-build-prize-winning-activity-7184774748038467584-P74E",
    },
    {
      title: "Hack The North",
      meta: "September 14–16, 2023 · Waterloo, Ontario",
      description:
        "Scholarship to attend Hack the North, Canada's largest hackathon, organized by the University of Waterloo.",
      link: "",
    },
  ],
};
