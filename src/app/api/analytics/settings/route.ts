import { COOKIE, cookieOk, ensureIpInfo, KEYS, store } from "@/lib/analytics/server";
import { clip } from "@/lib/analytics/shared";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Small edits from the dashboard, all behind the login cookie:
//   { action: "owner",  vid, on }   mark / unmark a visitor id as me
//   { action: "xip",    ip, on }    hide / show an IP
//   { action: "mynet",  ip }        stop treating a network as mine
//   { action: "label",  key, name } name a visitor ("" removes the name)
//   { action: "lookup", ips }       fill in missing network names (max 20 per call)
export async function POST(req: NextRequest) {
  if (!process.env.DASH_PASSWORD || !store) return NextResponse.json({ error: "not configured" }, { status: 503 });
  if (!cookieOk((await cookies()).get(COOKIE)?.value)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const b = (await req.json().catch(() => ({}))) as { action?: string; vid?: string; ip?: string; key?: string; name?: string; on?: boolean; ips?: string[] };
  const vid = clip(b.vid, 40), ip = clip(b.ip, 60), key = clip(b.key, 70);

  if (b.action === "owner" && vid) await (b.on === false ? store.srem(KEYS.owners, vid) : store.sadd(KEYS.owners, vid));
  else if (b.action === "xip" && ip) await (b.on === false ? store.srem(KEYS.xips, ip) : store.sadd(KEYS.xips, ip));
  else if (b.action === "mynet" && ip) await store.hdel(KEYS.myips, ip);
  else if (b.action === "label" && key) {
    const name = clip(b.name, 60);
    await (name ? store.hset(KEYS.labels, { [key]: name }) : store.hdel(KEYS.labels, key));
  } else if (b.action === "lookup" && Array.isArray(b.ips)) {
    for (const x of b.ips.slice(0, 20)) if (typeof x === "string") await ensureIpInfo(x.slice(0, 60));
  } else return NextResponse.json({ error: "bad request" }, { status: 400 });

  return NextResponse.json({ ok: true });
}
