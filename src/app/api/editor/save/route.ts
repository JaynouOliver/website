import { findFileBySlug, isProd, POSTS_DIR, regenIndex, writePost } from "@/lib/editor-fs";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (isProd()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const p = await req.json();
  const slug = String(p.slug || "").trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and dashes only." }, { status: 400 });
  }
  if (!p.title || !p.date) {
    return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
  }
  // If renaming (or the post lived in a file not named after its slug), remove the old file.
  const prevSlug = String(p.prevSlug || "");
  if (prevSlug) {
    const old = findFileBySlug(prevSlug);
    if (old && old !== slug + ".ts") fs.unlinkSync(path.join(POSTS_DIR, old));
  }
  writePost({ slug, title: p.title, date: p.date, summary: p.summary || "", image: p.image || "", body: p.body || "" });
  regenIndex();
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(req: NextRequest) {
  if (isProd()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const slug = req.nextUrl.searchParams.get("slug") || "";
  const f = findFileBySlug(slug);
  if (!f) return NextResponse.json({ error: "post not found" }, { status: 404 });
  fs.unlinkSync(path.join(POSTS_DIR, f));
  regenIndex();
  return NextResponse.json({ ok: true });
}
