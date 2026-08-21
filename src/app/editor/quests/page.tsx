import { quests } from "@/data/quests";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QuestsClient from "./quests-client";

export const metadata: Metadata = {
  title: "Main quests editor",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function QuestsEditorPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <QuestsClient initialQuests={quests.map((q) => ({ ...q }))} />;
}
