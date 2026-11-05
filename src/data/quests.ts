// Main quests (work experience). Edited by /editor/quests (dev-only, regenerates
// this file on save) — hand-editing works too. Markdown links work in points.
export type Quest = {
  company: string;
  href: string;
  title: string;
  logoUrl: string;
  location: string;
  start: string;
  end: string;
  points: string[];
};

export const quests: Quest[] = [
  {
    "company": "Mattoboard",
    "href": "https://mattoboard.com/",
    "title": "Machine Learning Engineer",
    "logoUrl": "https://cdn.prod.website-files.com/6356a1df0f3a7a17f96d4ecd/64b41675fb16b8a60739a570_LOGO-Symbol-BLACK-WEB.png",
    "location": "Remote",
    "start": "Oct 2025",
    "end": "Present",
    "points": [
      "**Product Finder** — built the pipeline that takes a room photo and returns the exact materials in it: fine-tuned YOLO segmentation, per-segment metadata extraction, then hybrid search (vector similarity + metadata filters with fallback) over an optimized product table, replacing LLM re-ranking at about $0.02 per material.",
      "**Similarity Search API** — a \"more like this\" API on Postgres with pgvector HNSW that returns similar materials and products in under 300 ms worldwide, with post-search diversification (over-fetch top 100, group by parent product) so results aren't just color variants.",
      "**Image Upscaler** — fine-tuned a GAN-based upscaler on 30K+ Topaz-upscaled images to fix the grainy texture that builds up after 3–5 AI edits, replacing a third-party API costing about $0.10 per image across a 1M+ image pipeline.",
      "**Segmentation Model** — built the labeled dataset and trained a custom YOLO segmentation model that isolates chairs, curtains, floors and other items in room photos, handling edge cases general-purpose models miss.",
      "**Model Inference** — deployed the YOLO and GAN models for GPU inference on Modal.",
      "**Ownership** — worked directly under the CTO with no manager above me, owning features from design to production, including UI changes."
    ]
  },
  {
    "company": "XRI Global AI",
    "href": "https://www.xriglobal.ai/",
    "title": "AI Engineer",
    "logoUrl": "https://www.google.com/s2/favicons?domain=xriglobal.ai&sz=128",
    "location": "Tennessee, USA · Remote",
    "start": "Oct 2024",
    "end": "Apr 2025",
    "points": [
      "**Dashboard & Data Integration** — built a full-stack language technology dashboard for African language data (BLEU/chrF++ charts, Leaflet.js maps, REST APIs, PySpark), improving data accessibility by 40% with automated database backups.",
      "**LLM Trans-tokenization** — developed a cross-lingual vocabulary transfer strategy to adapt Mistral-7B to new languages, reaching 87% accuracy on Hindi–English translation with better BLEU, perplexity and chrF than the base models. Built token alignment with SMT tools and fine-tuned on low-resource languages across Latin and non-Latin scripts."
    ]
  },
  {
    "company": "ProjectX.Cloud (YC P26)",
    "href": "https://projectx.cloud/",
    "title": "Machine Learning Engineer",
    "logoUrl": "/projectx-cloud-logo.jpeg",
    "location": "Hyderabad, India",
    "start": "Oct 2022",
    "end": "Oct 2024",
    "points": [
      "**RAG System** — built a production RAG chatbot (Python, FastAPI, LangChain, Chroma DB) over 1,000+ documents, with Redis caching and Celery background tasks.",
      "**Impact** — improved chat response time 1.5× through RAG optimization; a PR agent detected 80% of code quality issues on a prototype platform handling 500 daily user queries.",
      "**Performance** — cut API response times by 45% with caching and async processing under concurrent load.",
      "**Early-stage ownership** — all-hands role in the company's earliest days, covering engineering and the business side of building a startup."
    ]
  }
];
