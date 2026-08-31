import { isProd, PUBLIC_DIR } from "@/lib/editor-fs";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";

// Photos come off phones at 5MB+ — resize to web resolution (max 1600px) and
// recompress on upload so heavy originals never enter the repo.
async function compress(buf: Uint8Array, name: string): Promise<Uint8Array> {
  const ext = path.extname(name).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return buf;
  try {
    const img = sharp(buf).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
    if (ext === ".png") return await img.png().toBuffer();
    if (ext === ".webp") return await img.webp({ quality: 80 }).toBuffer();
    return await img.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  } catch {
    return buf; // not a decodable image — keep the original bytes
  }
}

export async function POST(req: NextRequest) {
  if (isProd()) return NextResponse.json({ error: "not found" }, { status: 404 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  let buf: Uint8Array = Buffer.from(await file.arrayBuffer());
  // sanitize: lowercase, spaces/symbols -> dashes, keep the extension
  let name = (file.name || "image.png").toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  if (!/\.(png|jpe?g|gif|webp|avif|svg)$/.test(name)) name += ".png";
  buf = await compress(buf, name);
  let target = path.join(PUBLIC_DIR, name);
  let n = 1;
  while (fs.existsSync(target)) {
    const ext = path.extname(name);
    target = path.join(PUBLIC_DIR, name.slice(0, -ext.length) + "-" + n++ + ext);
  }
  fs.writeFileSync(target, buf);
  return NextResponse.json({ path: "/" + path.basename(target) });
}
