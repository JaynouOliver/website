import { isProd, PUBLIC_DIR } from "@/lib/editor-fs";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (isProd()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  // sanitize: lowercase, spaces/symbols -> dashes, keep the extension
  let name = (file.name || "image.png").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  if (!/\.(png|jpe?g|gif|webp|avif|svg)$/.test(name)) name += ".png";
  let target = path.join(PUBLIC_DIR, name);
  let n = 1;
  while (fs.existsSync(target)) {
    const ext = path.extname(name);
    target = path.join(PUBLIC_DIR, name.slice(0, -ext.length) + "-" + n++ + ext);
  }
  fs.writeFileSync(target, buf);
  return NextResponse.json({ path: "/" + path.basename(target) });
}
