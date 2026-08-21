import { isProd } from "@/lib/editor-fs";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const QUESTS_FILE = path.join(process.cwd(), "src", "data", "quests.ts");

// Rewrites src/data/quests.ts from the editor's quest list.
export async function POST(req: NextRequest) {
  if (isProd()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { quests } = await req.json();
  if (!Array.isArray(quests)) return NextResponse.json({ error: "bad payload" }, { status: 400 });
  for (const q of quests) {
    if (!q.company || !q.title) {
      return NextResponse.json({ error: "Every quest needs at least a company and a role." }, { status: 400 });
    }
  }
  const clean = quests.map((q: any) => ({
    company: String(q.company || ""),
    href: String(q.href || ""),
    title: String(q.title || ""),
    logoUrl: String(q.logoUrl || ""),
    location: String(q.location || ""),
    start: String(q.start || ""),
    end: String(q.end || ""),
    points: (q.points || []).map((p: any) => String(p)).filter((p: string) => p.trim()),
  }));
  const content = `// Main quests (work experience). Edited by /editor/quests (dev-only, regenerates
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

export const quests: Quest[] = ${JSON.stringify(clean, null, 2)};
`;
  fs.writeFileSync(QUESTS_FILE, content);
  return NextResponse.json({ ok: true });
}
