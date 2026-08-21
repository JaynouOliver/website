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
    "title": "Software Engineer",
    "logoUrl": "https://cdn.prod.website-files.com/6356a1df0f3a7a17f96d4ecd/64b41675fb16b8a60739a570_LOGO-Symbol-BLACK-WEB.png",
    "location": "Remote",
    "start": "October 2025",
    "end": "Present",
    "points": [
      "Delivered product finder and similarity search — users find products by image or text, powered by cosine similarity over embeddings.",
      "Built image upload matching: the system finds the best matching product from the database for any uploaded photo.",
      "Work on the React frontend fixing bugs and improving UX, focused on the AI features of the software."
    ]
  }
];
