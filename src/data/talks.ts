// "Talks & travels" — the scroll-driven globe section on the homepage.
// One entry per stop, oldest first: the globe flies from `home` to each stop
// as its card scrolls into view. Photos live in public/talks/. Photos that are
// not yours need a `credit` (author + license) and `creditHref` (source page).
// Markdown links and **bold** work in `body` and `about`.

export type TalkPhoto = { src: string; alt: string; credit?: string; creditHref?: string };

export type Talk = {
  id: string;
  event: string;
  city: string;
  country: string;
  flag: string; // ISO country code; file in public/flags/<code>.svg
  lat: number;
  lon: number;
  date: string; // display text
  roles: string[]; // shown as chips
  title?: string; // talk / poster / paper title
  with?: string; // co-speakers / co-authors
  about: string; // one line on what the event is
  body: string[]; // what I did there — one paragraph per item
  photos: TalkPhoto[];
  tallPhotos?: boolean; // taller photo slots, for portrait shots
  links: { label: string; href: string }[];
};

export const home = { city: "Kolkata", flag: "in", lat: 22.57, lon: 88.36 };

export const talks: Talk[] = [
  {
    id: "scipy-2024",
    event: "SciPy 2024",
    city: "Tacoma",
    country: "USA",
    flag: "us",
    lat: 47.25,
    lon: -122.44,
    date: "Jul 2024",
    roles: ["Paper"],
    title: "Mamba Models a possible replacement for Transformers?",
    with: "with Rounak Sen and Saikrishna Devendiran",
    about: "The Python in Science Conference, where the scientific Python community meets every summer.",
    body: [
      "Our paper puts Mamba's state-space models side by side with Transformers: how the architectures differ, how they perform, and the mechanisms underneath. It's published in the Proceedings of the 23rd Python in Science Conference.",
    ],
    photos: [
      {
        src: "/talks/tacoma-convention-center.webp",
        alt: "Greater Tacoma Convention Center with a Tacoma Link streetcar passing",
        credit: "Steve Morgan, CC BY-SA 3.0",
        creditHref: "https://commons.wikimedia.org/wiki/File:Greater_Tacoma_Convention_%26_Trade_Center_with_Tacoma_Link_streetcar_passing.jpg",
      },
    ],
    links: [
      { label: "Read the paper", href: "https://doi.org/10.25080/XHDR4700" },
      { label: "Blog post", href: "/blog/scipy-2024-paper" },
    ],
  },
  {
    id: "pycon-us-2026",
    event: "PyCon US 2026",
    city: "Long Beach",
    country: "USA",
    flag: "us",
    lat: 33.77,
    lon: -118.19,
    date: "May 2026",
    roles: ["Poster", "Scholarship"],
    title: "Cost & Energy of Everyday LLM Workloads: A Visual Field Guide for Python Developers",
    with: "with Shivay Lamba",
    about: "The world's largest Python conference, and my first PyCon.",
    body: [
      "We profiled everyday LLM calls (chat completions, summarization, classification, RAG queries and batch embeddings) across model sizes, then turned the hidden numbers into visuals: latency waterfalls, cost per 1,000 tokens, and CPU vs GPU energy. Everything is plain pandas and matplotlib, so anyone can plug in their own endpoint and regenerate the charts.",
      "Off the poster floor: meeting the community, meeting Python's creator, and a weekend in Laguna Beach.",
    ],
    photos: [
      { src: "/talks/pycon-us-poster.webp", alt: "Subhro standing next to his poster at PyCon US 2026" },
      { src: "/talks/pycon-us-entrance.webp", alt: "Subhro at the PyCon US 2026 entrance in Long Beach" },
    ],
    links: [
      { label: "Poster page", href: "https://us.pycon.org/2026/schedule/presentation/91/" },
      { label: "Blog post", href: "/blog/pyconusa26" },
    ],
  },
  {
    id: "pycon-jp-2026",
    event: "PyCon JP 2026",
    city: "Hiroshima",
    country: "Japan",
    flag: "jp",
    lat: 34.39,
    lon: 132.45,
    date: "Aug 2026",
    roles: ["Scholarship"],
    about: "Japan's largest international Python conference, held at the International Conference Center Hiroshima, inside Peace Memorial Park.",
    body: [
      "My first PyCon JP: I attended on a scholarship, joining Japan's Python community in Hiroshima, a world away from Kolkata.",
    ],
    tallPhotos: true,
    photos: [
      { src: "/talks/pycon-jp-hiroshima.webp", alt: "Subhro in a PyCon JP 2026 t-shirt outside the International Conference Center Hiroshima" },
      {
        src: "/talks/hiroshima-peace-park.webp",
        alt: "The cenotaph in Hiroshima Peace Memorial Park, next to the conference venue",
        credit: "TimMilesWright, CC0",
        creditHref: "https://commons.wikimedia.org/wiki/File:Hiroshima_Peace_Memorial_Park_cenotaph.jpg",
      },
    ],
    links: [{ label: "PyCon JP 2026", href: "https://2026.pycon.jp/en/" }],
  },
  {
    id: "mcp-shanghai-2026",
    event: "MCP Dev Summit Shanghai",
    city: "Shanghai",
    country: "China",
    flag: "cn",
    lat: 31.24,
    lon: 121.5,
    date: "Sep 2026",
    roles: ["Speaker", "Scholarship"],
    title: "How We Built Reliable and Self-Evolving Agent Skills",
    with: "with Jayita Bhattacharyya · Agentic Engineering track",
    about: "AGNTCon + MCPCon China, the Linux Foundation's summit for the Model Context Protocol and agentic AI.",
    body: [
      "Almost every layer of an agent stack is prompt-driven, and hand-tuning prompts against a non-deterministic model doesn't scale. We showed how agents can **learn from their own mistakes**: reflection-driven prompting that evolves behavior without RL or fine-tuning, with evaluations and feedback loops to measure which change actually made the system better.",
    ],
    photos: [
      {
        src: "/talks/shanghai-pudong.webp",
        alt: "Shanghai International Convention Center below the Oriental Pearl Tower in Pudong",
        credit: "Hermann Luyken, CC0",
        creditHref: "https://commons.wikimedia.org/wiki/File:2014.11.16.151057_Shanghai_International_Conference_Center_Oriental_Pearl_Tower_Shanghai.jpg",
      },
    ],
    links: [
      { label: "Session page", href: "https://www.lfopensource.cn/mcp-dev-summit-shanghai/program/schedule/?id=1244038" },
      {
        label: "Slides",
        href: "https://sessionize.com/download/iflauwse~HTPwKyC1WDLGuNRmD3qUJa.pdf~agntcon-mcpcon-china-2026_jayita-suvro_talk.pptx.pdf",
      },
    ],
  },
];

// Shown under the journey.
export const alsoNote =
  "Also: merged PRs in PyTorch, vLLM and other major repos, and a poster at the PyTorch Conference.";
