import { sourceOf, type Beat, type Ev, type IpInfo } from "@/lib/analytics/shared";

// Turns the raw event list from /api/analytics/data into page views, sessions,
// visitors and the numbers the dashboard shows. Pure functions, no React.

export type Data = {
  now: number;
  events: Ev[];
  beats?: Record<string, Beat>;
  ipinfo: Record<string, IpInfo>;
  owners: string[];
  xips: string[];
  labels: Record<string, string>;
  myIp: string;
  truncated?: boolean;
};

export type PV = Ev & {
  key: string; // visitor key: the visitor id, or "ip:<address>" for old visits
  sid: string; // session key
  src: string; // where the session came from
  dur: number; // engaged ms on this page (0 if unknown)
  org?: string;
  clicks: Ev[];
};

export type Session = { id: string; key: string; start: number; end: number; pvs: PV[]; src: string; ms: number };

export type Visitor = {
  key: string;
  vid?: string;
  ips: string[];
  first: number;
  last: number;
  sessions: Session[];
  pvs: number;
  days: number; // distinct days seen
  ms: number;
  co?: string; rg?: string; ci?: string;
  org?: string; info?: IpInfo;
  b?: string; o?: string; d?: string; m?: string; ov?: string;
  ping?: number; // last heartbeat: the tab was still open then
  moves: Ev[]; // times the open tab showed up on a different network
  src: string; // how they first arrived
  bot: boolean;
  mine: boolean;
  clicks: number;
};

export type Model = { pvs: PV[]; sessions: Session[]; visitors: Map<string, Visitor>; hiddenMine: number; hiddenBots: number };

const IDLE = 30 * 60 * 1000;
export const DAY = 864e5;
const dayOf = (t: number) => { const d = new Date(t); return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); };

export function build(data: Data, opts: { showMine: boolean; showBots: boolean }): Model {
  const owners = new Set(data.owners), xips = new Set(data.xips);
  const dur = new Map<string, { ms: number; sc?: number }>();
  const clicks = new Map<string, Ev[]>();
  for (const e of data.events) {
    if (e.k === "d" && e.i) {
      const cur = dur.get(e.i);
      if (!cur || (e.ms || 0) > cur.ms) dur.set(e.i, { ms: e.ms || 0, sc: Math.max(e.sc || 0, cur?.sc || 0) });
    } else if (e.k === "c" && e.i) {
      (clicks.get(e.i) ?? (clicks.set(e.i, []), clicks.get(e.i)!)).push(e);
    }
  }

  let hiddenMine = 0, hiddenBots = 0;
  const all: PV[] = [];
  for (const e of data.events) {
    if (e.k !== "p") continue;
    const mine = (!!e.v && owners.has(e.v)) || (!!e.ip && xips.has(e.ip));
    if (mine && !opts.showMine) { hiddenMine++; continue; }
    if (e.bot && !opts.showBots) { hiddenBots++; continue; }
    const d = e.i ? dur.get(e.i) : undefined;
    all.push({
      ...e,
      key: e.v || "ip:" + (e.ip || "unknown"),
      sid: "", src: "",
      dur: d?.ms || 0, sc: d?.sc,
      org: e.ip ? data.ipinfo[e.ip]?.org : undefined,
      clicks: (e.i && clicks.get(e.i)) || [],
    });
  }
  all.sort((a, b) => a.t - b.t);

  // Sessions: the tracker's session id, or 30-minute gaps for old visits.
  const sessions = new Map<string, Session>();
  const lastSeen = new Map<string, { t: number; n: number }>();
  for (const p of all) {
    if (p.s) p.sid = p.s;
    else {
      const l = lastSeen.get(p.key);
      const n = !l ? 0 : p.t - l.t > IDLE ? l.n + 1 : l.n;
      lastSeen.set(p.key, { t: p.t, n });
      p.sid = p.key + "#" + n;
    }
    let s = sessions.get(p.sid);
    if (!s) sessions.set(p.sid, (s = { id: p.sid, key: p.key, start: p.t, end: p.t, pvs: [], src: sourceOf(p), ms: 0 }));
    s.pvs.push(p);
    s.end = Math.max(s.end, p.t + p.dur);
    p.src = s.src;
  }
  for (const s of sessions.values()) {
    const engaged = s.pvs.reduce((n, p) => n + p.dur, 0);
    s.ms = engaged || (s.pvs.length > 1 ? s.pvs[s.pvs.length - 1].t - s.start : 0);
  }

  const visitors = new Map<string, Visitor>();
  for (const s of sessions.values()) {
    let v = visitors.get(s.key);
    const f = s.pvs[0];
    if (!v) {
      visitors.set(s.key, (v = {
        key: s.key, vid: f.v, ips: [], first: s.start, last: s.start, sessions: [], pvs: 0, days: 0, ms: 0,
        src: s.src, bot: false, mine: false, clicks: 0, moves: [],
      }));
    }
    v.sessions.push(s);
    v.pvs += s.pvs.length;
    v.ms += s.ms;
    for (const p of s.pvs) {
      if (p.ip && !v.ips.includes(p.ip)) v.ips.push(p.ip);
      if (p.t >= v.last) {
        v.last = p.t;
        v.co = p.co ?? v.co; v.rg = p.rg ?? v.rg; v.ci = p.ci ?? v.ci;
        v.b = p.b ?? v.b; v.o = p.o ?? v.o; v.d = p.d ?? v.d; v.m = p.m ?? v.m; v.ov = p.ov ?? v.ov;
        if (p.ip && data.ipinfo[p.ip]) { v.info = data.ipinfo[p.ip]; v.org = v.info.org; }
      }
      if (p.bot) v.bot = true;
      if ((p.v && owners.has(p.v)) || (p.ip && xips.has(p.ip))) v.mine = true;
      v.clicks += p.clicks.length;
    }
  }
  // Heartbeats: where a still-open tab was last seen, and its network changes.
  for (const e of data.events) if (e.k === "h" && e.v) visitors.get(e.v)?.moves.push(e);
  for (const [vid, b] of Object.entries(data.beats || {})) {
    const v = visitors.get(vid);
    if (!v) continue;
    v.ping = b.t;
    if (b.t > v.last) {
      v.co = b.co ?? v.co; v.rg = b.rg ?? v.rg; v.ci = b.ci ?? v.ci;
      if (b.ip) { if (!v.ips.includes(b.ip)) v.ips.push(b.ip); if (data.ipinfo[b.ip]) { v.info = data.ipinfo[b.ip]; v.org = v.info.org; } }
    }
  }
  for (const v of visitors.values()) { v.moves.sort((a, b) => a.t - b.t); v.days = new Set(v.sessions.flatMap((s) => s.pvs.map((p) => dayOf(p.t)))).size; }

  return { pvs: all, sessions: Array.from(sessions.values()), visitors, hiddenMine, hiddenBots };
}

/* ---------- filters ---------- */

export type FilterKey = "page" | "source" | "country" | "city" | "device" | "model" | "browser" | "os" | "network";
export type Filters = Partial<Record<FilterKey, string>>;

export const field: Record<FilterKey, (p: PV) => string> = {
  page: (p) => p.p || "/",
  source: (p) => p.src,
  country: (p) => p.co || "",
  city: (p) => (p.ci ? p.ci + (p.co ? ", " + p.co : "") : ""),
  device: (p) => p.d || "",
  model: (p) => p.m || "",
  browser: (p) => p.b || "",
  os: (p) => p.o || "",
  network: (p) => p.org || "",
};

export function applyFilters(pvs: PV[], f: Filters): PV[] {
  const keys = Object.keys(f) as FilterKey[];
  return keys.length ? pvs.filter((p) => keys.every((k) => field[k](p) === f[k])) : pvs;
}

/* ---------- numbers ---------- */

export type Stats = { visitors: number; pageviews: number; sessions: number; bounce: number; avgMs: number; newVisitors: number; returning: number };

export function stats(pvs: PV[], m: Model, from: number): Stats {
  const keys = new Set<string>(), sids = new Map<string, number>();
  for (const p of pvs) { keys.add(p.key); sids.set(p.sid, (sids.get(p.sid) || 0) + 1); }
  const byId = new Map(m.sessions.map((s) => [s.id, s]));
  let bounces = 0, ms = 0;
  for (const [id, n] of sids) { if (n === 1) bounces++; ms += byId.get(id)?.ms || 0; }
  let returning = 0;
  for (const k of keys) { const v = m.visitors.get(k); if (v && v.first < from) returning++; }
  return {
    visitors: keys.size, pageviews: pvs.length, sessions: sids.size,
    bounce: sids.size ? bounces / sids.size : 0, avgMs: sids.size ? ms / sids.size : 0,
    newVisitors: keys.size - returning, returning,
  };
}

export type Bucket = { t: number; label: string; visitors: number; pageviews: number };

export function series(pvs: PV[], from: number, to: number, hourly: boolean): Bucket[] {
  const step = hourly ? 36e5 : DAY;
  const start = new Date(from);
  if (hourly) start.setMinutes(0, 0, 0); else start.setHours(0, 0, 0, 0);
  const out: (Bucket & { keys: Set<string> })[] = [];
  for (let t = start.getTime(); t <= to; ) {
    const d = new Date(t);
    out.push({
      t, visitors: 0, pageviews: 0, keys: new Set(),
      label: hourly ? d.toLocaleTimeString("en-US", { hour: "numeric" }) : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
    if (hourly) t += step; else { d.setDate(d.getDate() + 1); t = d.getTime(); }
    if (out.length > 400) break;
  }
  let j = 0;
  for (const p of pvs) {
    if (p.t < out[0]?.t) continue;
    while (j + 1 < out.length && out[j + 1].t <= p.t) j++;
    const b = out[j];
    if (!b) break;
    b.pageviews++; b.keys.add(p.key);
  }
  return out.map(({ keys, ...b }) => ({ ...b, visitors: keys.size }));
}

export type Row = { name: string; visitors: number; views: number };

export function breakdown(pvs: PV[], get: (p: PV) => string, limit = 8): { rows: Row[]; total: number } {
  const m = new Map<string, { keys: Set<string>; views: number }>();
  for (const p of pvs) {
    const name = get(p);
    if (!name) continue;
    const r = m.get(name) ?? (m.set(name, { keys: new Set(), views: 0 }), m.get(name)!);
    r.keys.add(p.key); r.views++;
  }
  const rows = Array.from(m, ([name, r]) => ({ name, visitors: r.keys.size, views: r.views })).sort((a, b) => b.visitors - a.visitors || b.views - a.views);
  return { rows: rows.slice(0, limit), total: rows.length };
}

export function clickBreakdown(pvs: PV[], limit = 8): Row[] {
  const m = new Map<string, { keys: Set<string>; views: number }>();
  for (const p of pvs) for (const c of p.clicks) {
    const name = (c.h || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
    const r = m.get(name) ?? (m.set(name, { keys: new Set(), views: 0 }), m.get(name)!);
    r.keys.add(p.key); r.views++;
  }
  return Array.from(m, ([name, r]) => ({ name, visitors: r.keys.size, views: r.views })).sort((a, b) => b.views - a.views).slice(0, limit);
}

/* ---------- formatting ---------- */

export function fmtDur(ms: number): string {
  if (!ms || ms < 1000) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m " + String(s % 60).padStart(2, "0") + "s";
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
}

export function ago(t: number, now: number): string {
  const d = now - t;
  if (d < 6e4) return "just now";
  if (d < 36e5) return Math.round(d / 6e4) + "m ago";
  if (d < DAY) return Math.round(d / 36e5) + "h ago";
  if (d < 30 * DAY) return Math.round(d / DAY) + "d ago";
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const when = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const flag = (cc?: string) => (cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "");

let names: Intl.DisplayNames | null = null;
export function countryName(cc: string): string {
  try {
    names ??= new Intl.DisplayNames(["en"], { type: "region" });
    return names.of(cc) || cc;
  } catch {
    return cc;
  }
}

// "Tab open" = a heartbeat within the last 7 minutes (they arrive every 5).
export const tabOpen = (v: { ping?: number }, now: number) => !!v.ping && now - v.ping < 7 * 60 * 1000;
export const lastSeen = (v: { last: number; ping?: number }) => Math.max(v.last, v.ping || 0);

export const place = (v: { ci?: string; rg?: string; co?: string }) => [v.ci, v.rg, v.co].filter(Boolean).join(", ") || "Unknown location";
