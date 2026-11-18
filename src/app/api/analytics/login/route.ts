import { clientIp, COOKIE, COOKIE_MAX_AGE, passwordOk, sessionToken, store } from "@/lib/analytics/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST { password } -> sets a 30-day httpOnly cookie. DELETE -> logs out.
// The password is DASH_PASSWORD (Vercel -> Settings -> Environment Variables).
export async function POST(req: NextRequest) {
  if (!process.env.DASH_PASSWORD || !store) return NextResponse.json({ error: "not configured" }, { status: 503 });

  // At most 8 tries per IP every 10 minutes.
  const tries = "an:login:" + clientIp(req.headers);
  const n = await store.incr(tries);
  if (n === 1) await store.expire(tries, 600);
  if (n > 8) return NextResponse.json({ error: "too many tries" }, { status: 429 });

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!passwordOk(body.password || "")) return NextResponse.json({ error: "wrong password" }, { status: 401 });

  (await cookies()).set(COOKIE, sessionToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(COOKIE);
  return NextResponse.json({ ok: true });
}
