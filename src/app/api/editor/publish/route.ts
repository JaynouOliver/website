import { isProd } from "@/lib/editor-fs";
import { execSync } from "child_process";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Commits everything and pushes — Vercel picks it up and deploys.
export async function POST() {
  if (isProd()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const run = (cmd: string) =>
    execSync(cmd, { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  try {
    const status = run("git status --porcelain");
    if (!status.trim()) {
      return NextResponse.json({ ok: true, message: "Nothing new to publish — everything is already committed." });
    }
    run("git add -A");
    run('git commit -m "blog: publish from local editor"');
    const out = run("git push origin main");
    return NextResponse.json({ ok: true, message: "Pushed — Vercel is deploying (~1 min).", detail: out.slice(-400) });
  } catch (e: any) {
    return NextResponse.json({ error: (e.stderr || e.message || "publish failed").slice(-600) }, { status: 500 });
  }
}
