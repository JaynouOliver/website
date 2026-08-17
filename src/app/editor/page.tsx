import { posts } from "@/data/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EditorClient from "./editor-client";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Local-only writing interface. Exists only under `npm run dev` — in
// production this route is a 404, so nothing to secure.
export default function EditorPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <EditorClient initialPosts={posts.map((p) => ({ ...p, image: p.image || "" }))} />;
}
