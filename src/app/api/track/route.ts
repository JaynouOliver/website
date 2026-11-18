import { clientIp, ensureIpInfo, KEYS, parse, pushEvent, store } from "@/lib/analytics/server";
import { clip, parseUa, type Beat, type Ev } from "@/lib/analytics/shared";
import { after, NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Receives events from the tracker (src/components/visit-tracker.tsx).
// Location comes from Vercel's request headers; nothing is looked up in the
// request path, so the response is immediate.

const ID = /^[a-z0-9-]{6,40}$/i;
const id = (v: unknown) => (typeof v === "string" && ID.test(v) ? v : undefined);
const num = (v: unknown, max: number) => (typeof v === "number" && isFinite(v) && v >= 0 ? Math.min(Math.round(v), max) : undefined);

function geo(h: Headers): Partial<Ev> {
  const la = parseFloat(h.get("x-vercel-ip-latitude") || "");
  const lo = parseFloat(h.get("x-vercel-ip-longitude") || "");
  let ci = h.get("x-vercel-ip-city") || "";
  try {
    ci = decodeURIComponent(ci);
  } catch {}
  return {
    co: h.get("x-vercel-ip-country") || undefined,
    rg: h.get("x-vercel-ip-country-region") || undefined,
    ci: ci || undefined,
    la: isFinite(la) ? la : undefined,
    lo: isFinite(lo) ? lo : undefined,
    tz: h.get("x-vercel-ip-timezone") || undefined,
  };
}

export async function POST(req: NextRequest) {
  if (!store) return new NextResponse(null, { status: 204 });
  try {
    // Same-site only: other sites can't post events here.
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) return new NextResponse(null, { status: 204 });

    const text = await req.text();
    if (text.length > 2000) return new NextResponse(null, { status: 204 });
    const b = JSON.parse(text) as Record<string, unknown>;
    const h = req.headers;
    // Local testing only (in-memory store): lets a seed script backdate events.
    const backdate = process.env.ANALYTICS_MEMORY === "1" && process.env.NODE_ENV !== "production" ? Number(h.get("x-test-time")) : 0;
    const t = backdate || Date.now();
    const ip = clientIp(h);

    if (b.k === "d") {
      const i = id(b.i);
      const ms = num(b.ms, 6 * 3600 * 1000);
      if (i && ms !== undefined) await pushEvent({ k: "d", t, i, ms, sc: num(b.sc, 100) });
    } else if (b.k === "c") {
      const hh = clip(b.h, 200);
      if (hh) await pushEvent({ k: "c", t, i: id(b.i), v: id(b.v), s: id(b.s), ip, p: clip(b.p, 200), h: hh, x: clip(b.x, 60) });
    } else if (b.k === "h") {
      // Heartbeat from a tab that is still open. Keep only the latest per
      // visitor, and log an event when it shows up on a different network.
      const v = id(b.v);
      if (v) {
        const prev = parse<Beat>(await store.hget(KEYS.beats, v));
        const g = geo(h);
        const beat: Beat = { t, ip, co: g.co, rg: g.rg, ci: g.ci, la: g.la, lo: g.lo, n: (prev?.n || 0) + 1 };
        await store.hset(KEYS.beats, { [v]: JSON.stringify(beat) });
        if (prev && prev.ip && prev.ip !== ip) {
          await pushEvent({ k: "h", t, v, s: id(b.s), ip, ...g });
          after(() => ensureIpInfo(ip));
        }
      }
    } else if (b.k === "p") {
      const ua = parseUa(h.get("user-agent") || "");
      const ev: Ev = {
        k: "p", t, i: id(b.i), v: id(b.v), s: id(b.s), ip,
        p: clip(b.p, 200) || "/",
        r: clip(b.r, 200), us: clip(b.us, 60), um: clip(b.um, 60), uc: clip(b.uc, 60),
        ...geo(h),
        b: ua.b || undefined, o: ua.o || undefined, d: ua.d || undefined,
        m: clip(b.m, 40), ov: clip(b.ov, 20),
        sw: num(b.sw, 20000), l: clip(b.l, 12),
      };
      if (!ev.tz) ev.tz = clip(b.tz, 40);
      if (ua.bot || b.wd === 1) ev.bot = 1;
      if (b.n === 1) ev.n = 1;
      if (b.ns === 1) ev.ns = 1;
      await pushEvent(ev);
      // Once per session, after the response: find out who owns this IP.
      if (ev.ns || !ev.v) after(() => ensureIpInfo(ip));
    }
  } catch {}
  return new NextResponse(null, { status: 204 });
}

// Old tracker (cached pages from before 2026-11): GET /api/track?p=/path
export async function GET(req: NextRequest) {
  if (!store) return new NextResponse(null, { status: 204 });
  try {
    const h = req.headers;
    const ua = parseUa(h.get("user-agent") || "");
    const ip = clientIp(h);
    const ev: Ev = { k: "p", t: Date.now(), ip, p: clip(req.nextUrl.searchParams.get("p"), 200) || "/", ...geo(h), b: ua.b || undefined, o: ua.o || undefined, d: ua.d || undefined };
    if (ua.bot) ev.bot = 1;
    await pushEvent(ev);
    after(() => ensureIpInfo(ip));
  } catch {}
  return new NextResponse(null, { status: 204 });
}
