import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Returns logged visits, password-protected.
// Set DASH_PASSWORD in Vercel -> Project -> Settings -> Environment Variables.
export async function GET(req: NextRequest) {
  if (!process.env.DASH_PASSWORD || !redis) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const key =
    req.nextUrl.searchParams.get("key") ||
    (req.headers.get("authorization") || "").replace("Bearer ", "");
  if (key !== process.env.DASH_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const raw = await redis.lrange("visits", 0, 4999);
  const visits = raw.map((v) => (typeof v === "string" ? JSON.parse(v) : v));
  return NextResponse.json({ visits });
}
