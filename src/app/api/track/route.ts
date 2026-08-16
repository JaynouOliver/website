import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Logs one visit. IP/geo come from Vercel's request headers in production.
export async function GET(req: NextRequest) {
  if (!redis) return NextResponse.json({ ok: false });
  try {
    const h = req.headers;
    const visit = {
      ip: (h.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown",
      city: decodeURIComponent(h.get("x-vercel-ip-city") || "") || "—",
      region: h.get("x-vercel-ip-country-region") || "",
      country: h.get("x-vercel-ip-country") || "—",
      path: req.nextUrl.searchParams.get("p") || "/",
      ua: (h.get("user-agent") || "").slice(0, 120),
      t: Date.now(),
    };
    await redis.lpush("visits", JSON.stringify(visit));
    await redis.ltrim("visits", 0, 9999); // keep the latest 10k
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
