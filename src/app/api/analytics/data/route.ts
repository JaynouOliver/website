import { clientIp, COOKIE, cookieOk, KEYS, MAX_EVENTS, parse, store } from "@/lib/analytics/server";
import { parseUa, type Beat, type Ev, type IpInfo } from "@/lib/analytics/shared";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type OldVisit = { ip?: string; city?: string; region?: string; country?: string; path?: string; ua?: string; lat?: number | string; lon?: number | string; t: number };

// Newest-first lists: read in chunks until we pass the cutoff.
// Vercel caps a function's response at 4.5 MB; stop well before that.
const MAX_BYTES = 3_200_000;

async function readSince<T extends { t: number }>(key: string, cutoff: number, max: number, budget: { left: number }): Promise<T[]> {
  const out: T[] = [];
  const CHUNK = 1000;
  for (let start = 0; start < max; start += CHUNK) {
    const raw = await store!.lrange(key, start, start + CHUNK - 1);
    let done = raw.length < CHUNK;
    for (const r of raw) {
      const e = parse<T>(r);
      if (!e || typeof e.t !== "number") continue;
      if (e.t < cutoff) { done = true; continue; }
      out.push(e);
      budget.left -= typeof r === "string" ? r.length : 220;
    }
    if (done || budget.left < 0) break;
  }
  return out;
}

// GET ?days=30 (0 = everything) -> events plus the lookup tables the dashboard needs.
export async function GET(req: NextRequest) {
  if (!process.env.DASH_PASSWORD || !store) return NextResponse.json({ error: "not configured" }, { status: 503 });
  if (!cookieOk((await cookies()).get(COOKIE)?.value)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const days = Math.max(0, Math.min(3650, Number(req.nextUrl.searchParams.get("days")) || 0));
  const now = Date.now();
  const cutoff = days ? now - days * 864e5 : 0;
  const budget = { left: MAX_BYTES };

  const events = await readSince<Ev>(KEYS.events, cutoff, MAX_EVENTS, budget);
  const old = budget.left > 0 ? await readSince<OldVisit>(KEYS.legacy, cutoff, 10000, budget) : [];
  const [owners, xips, labels, rawBeats] = await Promise.all([
    store.smembers(KEYS.owners),
    store.smembers(KEYS.xips),
    store.hgetall(KEYS.labels),
    store.hgetall(KEYS.beats),
  ]);
  const beats: Record<string, Beat> = {};
  for (const [k, v] of Object.entries(rawBeats || {})) { const b = parse<Beat>(v); if (b && b.t >= cutoff) beats[k] = b; }

  for (const v of old) {
    const ua = parseUa(v.ua || "");
    const la = Number(v.lat), lo = Number(v.lon);
    const ok = (s?: string) => (s && s !== "—" ? s : undefined);
    events.push({
      k: "p", t: v.t, ip: v.ip, p: v.path || "/", co: ok(v.country), rg: ok(v.region), ci: ok(v.city),
      la: isFinite(la) && la ? la : undefined, lo: isFinite(lo) && lo ? lo : undefined,
      b: ua.b || undefined, o: ua.o || undefined, d: ua.d || undefined, ...(ua.bot && v.ua ? { bot: 1 as const } : {}), old: 1,
    });
  }

  const ips = Array.from(new Set([...events.map((e) => e.ip), ...Object.values(beats).map((b) => b.ip)].filter((x): x is string => !!x)));
  const ipinfo: Record<string, IpInfo> = {};
  for (let i = 0; i < ips.length; i += 200) {
    const part = ips.slice(i, i + 200);
    const got = await store.hmget(KEYS.ipinfo, part);
    if (got) for (const ip of part) { const info = parse<IpInfo>(got[ip]); if (info) ipinfo[ip] = info; }
  }

  const names: Record<string, string> = {};
  for (const [k, v] of Object.entries(labels || {})) if (v != null) names[k] = String(v);

  return NextResponse.json({ now, events, beats, ipinfo, owners, xips, labels: names, myIp: clientIp(req.headers), truncated: budget.left < 0 }, { headers: { "Cache-Control": "no-store" } });
}
