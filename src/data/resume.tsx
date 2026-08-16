import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Suvrakamal Das",
  initials: "SD",
  url: "https://dillion.io",
  location: "San Francisco, CA",
  locationLink: "https://www.google.com/maps/place/sanfrancisco",
  description:
    "Machine Learning Engineer, I love building things around ML. I am active on Twitter. Read my latest research",
  summary:
    "I'm a certified TensorFlow ML Engineer, and have publications at the SciPyConf. Read my latest research - [here](https://doi.org/10.25080/XHDR4700)",
  avatarUrl: "/dp.jpg",
  skills: [
   "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Tableau", "Power BI", "SQL", "Python", "C++", "Typescript", "Node.js", "Go", "Java", "AWS (Sagemaker, Lambda)", "GCP (Vertex AI, Dialogflow CX)", "Postgres", "Docker", "Kubernetes", "Scrum", "Jenkins", "CICD", "React", "Next.js"
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
      description:
        "Delivered features like product finder and similarity search where users can find products by image or text. Also delivered a feature where users can upload a product image and the system will find the best matching product from the database. Similarity search shows similar products by using cosine similarity. In frontend, I work on react and fix bugs and improve the overall user experience. My work is mostly focussed on the AI features the software.",
    },
  ],
  education: [
    {
      school: "Academy of Technology",
      href: "",
      degree: "Bachelor of Technology in Computer Science and Business and Systems",
      logoUrl: "images.jpeg",
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
        "Adapted Mistral-7B LLM from English to Hindi through innovative tokenizer reconfiguration and cross-lingual token mapping. Implemented subword unit alignment for better coverage and fine-tuned with Hindi data, achieving significant improvements in perplexity, BLEU, and CHRF scores without full retraining.",
      technologies: [
        
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/JaynouOliver/Mistral-7B-v0.3-transtokenized-Hindi",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "https://img.freepik.com/free-photo/digital-art-with-urban-landscape-architecture_23-2151065739.jpg?t=st=1743341918~exp=1743345518~hmac=5e9c5a92461c22814eff83bf00d7de8d918f640e4354539e6536989e49e57bcb&w=996",
      video:
        "",
    },
    {
      title: "AI Agent based Pull Request Reviewer",
      href: "https://github.com/JaynouOliver/pr-ai-agent",
      dates: "",
      active: true,
      description:
        "An autonomous code review agent system that uses AI to analyze GitHub pull requests. Made with Celery worker and Redis as broker for efficient API handling. It is based on CrewAI on top of OpenAI API that receives , analyzes code and outputs responses in JSON format.",
      technologies: [
        
      ],
      links: [
        
        {
          type: "Source",
          href: "https://github.com/JaynouOliver/pr-ai-agent",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "https://i.snap.as/yTqEGPkt.jpg",
      video: "",
    },
    {
      title: "Digital Divide AI",
      href: "https://www.digitaldivide.ai/about",
      dates: "",
      active: true,
      description:
        "The digitaldivide.ai project is a collaborative initiative between XRI Global and students at the University of Arizona. Our mission is to provide real-time visibility into AI model capabilities across the world's languages. We believe that bridging the digital divide begins with establishing foundational technology support for all languages.",
      technologies: [
        
      ],
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
      image: "https://jamesgmartin.center/wp-content/uploads/2020/07/AdobeStock_358873178-1024x532.jpeg",
      video: "",
    },
    {
      title: "AI based changelog",
      href: "https://github.com/JaynouOliver/changelog",
      dates: "",
      active: true,
      description:
        "A developer-facing tool that allows devs to quickly AI-generate a changelog. Provides a unique flow with github actions, github api, openai api, and json files to help generate changelog automatically on publish a release, also keeping the option to add things manually.",
      technologies: [
        
      ],
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
      image: "https://platform.theverge.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/10724411/nino4.jpg?quality=90&strip=all&crop=0%2C0%2C100%2C100&w=750",
      video:
        "",
    },
  ],
  hackathons: [
    
    {
      title: "Hack The North",
      dates: "September 14th - 16th, 2023",
      location: "Waterloo, Ontario",
      description:
        "I got a scholarship to attend Hack the North, Canada's largest hackathon organized by University of Waterloo",
      image:
        "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/hack-the-north.png",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Delivered a speech around entrepreneurship. ",
      dates: "April, 2024",
      location: "Kolkata, India",
      description:
        "I talked about how we raised funds for our startup with the initial MVP and scaled it for customers. https://www.linkedin.com/posts/academy-of-technology_a-special-talk-on-how-to-build-prize-winning-activity-7184774748038467584-P74E?utm_source=share&utm_medium=member_desktop&rcm=ACoAADb5VDMBBWBtC1aB-Mu0CuCEosyNC9Wd73g",
      image:
        "data:image/jpeg;base64,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",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Yet another talk around machine learning operations on cloud-native technologies.  ",
      dates: "May, 2024",
      location: "Kolkata, India",
      description:
        "Here I discussed around machine learning operations creating entire pipelines of machine learning using Kubeflow and talking about an end-to-end ML Ops project. ",
      image:
        "data:image/png;base64,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",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Tensorflow Certfication",
      dates: "May, 2024",
      location: "",
      description:
        "",
      image:
        "data:image/png;base64,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",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "SciPy Conference",
      dates: "July 8th - 14th, 2024",
      location: "Tacoma, WA, USA",
      description:
        "My paper was accepted in this conference", 
      image:
        "https://images.squarespace-cdn.com/content/v1/6596dfc539fa52603ef8b8d4/277ecf67-8dd4-401f-a74c-df3574adf1d1/SCIPY-2024-no-textArtboard%2B1%403x.png?format=1500w",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Speaker at FOSS Kolkata",
      dates: "October 2024",
      location: "Kolkata, India",
      description:
        "I delivered a speech around trans tokenization on large language models (monolingual). I spoke about fine-tuning adapting trans tokenization to your existing methods. Also talked about making your individual tokenizer. (https://www.linkedin.com/feed/update/urn:li:activity:7248060113524031488/)", 
      image:
        "https://avatars.githubusercontent.com/u/61445214?s=280&v=4",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Kubecon India",
      dates: "Dec 11th - 12th, 2024",
      location: "Delhi, India",
      description:
        "Got a scholarship to attend Kubecon India", 
      image:
        "https://pbs.twimg.com/profile_images/913421906157592576/NmxUeefn_400x400.jpg",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Conducted an AI session around trans-tokenization  ",
      dates: "March, 2025",
      location: "Remote, India",
      description:
        "Trans-tokenization topic. ", 
      image:
        "https://media.licdn.com/dms/image/v2/C560BAQH5oTSsgxrumw/company-logo_200_200/company-logo_200_200/0/1631268024002?e=2147483647&v=beta&t=PkEEmCLuYHqCLJV-VF7uyeKkNBHiCSMAf62ZFoviJTk",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },
    {
      title: "Poster: Accepted in PyTorch Conference 2025",
      dates: "September 2025",
      location: "California, USA",
      description:
        "Presenting research on 'Real-time multi-hop reasoning with Nvidia cuGraphs' at PyTorch Conference 2025. The work demonstrates optimized graph traversal techniques for complex reasoning tasks using GPU acceleration, significantly improving inference speed for multi-hop reasoning in large language models.", 
      image:
        "https://pytorch.org/assets/images/pytorch-logo.png",
      mlh: "https://s3.amazonaws.com/logged-assets/trust-badge/2019/mlh-trust-badge-2019-white.svg",
      links: [],
    },

    
    
    
  ],
} as const;
