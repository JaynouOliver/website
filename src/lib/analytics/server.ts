import { redis } from "@/lib/redis";
import { createHmac, timingSafeEqual } from "crypto";
import type { Ev, IpInfo } from "./shared";

// Server side of the visitor analytics: storage, the dashboard login, and the
// one-time lookup of who owns an IP address.
//
// Storage is the Upstash Redis attached to the Vercel project (free tier).
// Without it, `ANALYTICS_MEMORY=1` keeps everything in memory for local dev.

export const KEYS = {
  events: "an:ev", // list of Ev, newest first
  legacy: "visits", // the old list, read-only now
  ipinfo: "an:ip", // hash: ip -> IpInfo
  owners: "an:owners", // set of my own visitor ids
  xips: "an:xips", // set of IPs to hide
  labels: "an:labels", // hash: visitor key -> name I gave them
  beats: "an:hb", // hash: visitor id -> Beat (last heartbeat)
};
export const MAX_EVENTS = 30000;

type Store = {
  lpush(key: string, value: string): Promise<unknown>;
  ltrim(key: string, start: number, stop: number): Promise<unknown>;
  lrange(key: string, start: number, stop: number): Promise<unknown[]>;
  hget(key: string, field: string): Promise<unknown>;
  hset(key: string, kv: Record<string, string>): Promise<unknown>;
  hdel(key: string, field: string): Promise<unknown>;
  hmget(key: string, fields: string[]): Promise<Record<string, unknown> | null>;
  hgetall(key: string): Promise<Record<string, unknown> | null>;
  sadd(key: string, member: string): Promise<unknown>;
  srem(key: string, member: string): Promise<unknown>;
  smembers(key: string): Promise<string[]>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
};

function memoryStore(): Store {
  const g = globalThis as unknown as { __anMem?: { l: Map<string, string[]>; h: Map<string, Map<string, string>>; s: Map<string, Set<string>>; n: Map<string, number> } };
  const m = (g.__anMem ??= { l: new Map(), h: new Map(), s: new Map(), n: new Map() });
  const list = (k: string) => m.l.get(k) ?? (m.l.set(k, []), m.l.get(k)!);
  const hash = (k: string) => m.h.get(k) ?? (m.h.set(k, new Map()), m.h.get(k)!);
  const set = (k: string) => m.s.get(k) ?? (m.s.set(k, new Set()), m.s.get(k)!);
  return {
    async lpush(k, v) { list(k).unshift(v); },
    async ltrim(k, a, b) { m.l.set(k, list(k).slice(a, b + 1)); },
    async lrange(k, a, b) { return list(k).slice(a, b + 1); },
    async hget(k, f) { return hash(k).get(f) ?? null; },
    async hset(k, kv) { for (const [f, v] of Object.entries(kv)) hash(k).set(f, v); },
    async hdel(k, f) { hash(k).delete(f); },
    async hmget(k, fs) { return Object.fromEntries(fs.map((f) => [f, hash(k).get(f) ?? null])); },
    async hgetall(k) { return Object.fromEntries(hash(k)); },
    async sadd(k, v) { set(k).add(v); },
    async srem(k, v) { set(k).delete(v); },
    async smembers(k) { return Array.from(set(k)); },
    async incr(k) { const n = (m.n.get(k) || 0) + 1; m.n.set(k, n); return n; },
    async expire() {},
  };
}

// Upstash's client is variadic where this interface takes arrays.
const r = redis;
const upstash: Store | null = r && {
  lpush: (k, v) => r.lpush(k, v),
  ltrim: (k, a, b) => r.ltrim(k, a, b),
  lrange: (k, a, b) => r.lrange(k, a, b),
  hget: (k, f) => r.hget(k, f),
  hset: (k, kv) => r.hset(k, kv),
  hdel: (k, f) => r.hdel(k, f),
  hmget: (k, fs) => (fs.length ? r.hmget(k, ...fs) : Promise.resolve(null)),
  hgetall: (k) => r.hgetall(k),
  sadd: (k, v) => r.sadd(k, v),
  srem: (k, v) => r.srem(k, v),
  smembers: async (k) => (await r.smembers(k)).map(String),
  incr: (k) => r.incr(k),
  expire: (k, s) => r.expire(k, s),
};

export const store: Store | null = upstash
  ? upstash
  : process.env.ANALYTICS_MEMORY === "1" && process.env.NODE_ENV !== "production"
    ? memoryStore()
    : null;

// Upstash hands back parsed JSON; the memory store hands back strings.
export function parse<T>(v: unknown): T | null {
  if (v == null) return null;
  if (typeof v !== "string") return v as T;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

export async function pushEvent(ev: Ev) {
  if (!store) return;
  await store.lpush(KEYS.events, JSON.stringify(ev));
  if (Math.random() < 0.05) await store.ltrim(KEYS.events, 0, MAX_EVENTS - 1);
}

/* ---------- dashboard login ---------- */

export const COOKIE = "pf_dash";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// The cookie holds a keyed hash of the password, never the password itself.
export function sessionToken(): string | null {
  const pw = process.env.DASH_PASSWORD;
  return pw ? createHmac("sha256", pw).update("pf-dash-v1").digest("hex") : null;
}
export function passwordOk(pw: string): boolean {
  const real = process.env.DASH_PASSWORD;
  return !!real && typeof pw === "string" && same(pw, real);
}
export function cookieOk(value: string | undefined): boolean {
  const token = sessionToken();
  return !!token && !!value && same(value, token);
}

export function clientIp(h: Headers): string {
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/* ---------- who owns an IP ---------- */

const PRIVATE = /^(unknown|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1|fc|fd|fe80)/i;

// Looked up once per new IP and cached. ip-api.com is free for non-commercial
// use (45 lookups a minute, plain HTTP); ipwho.is is the HTTPS fallback.
export async function ensureIpInfo(ip: string) {
  if (!store || !ip || PRIVATE.test(ip) || process.env.ANALYTICS_NO_LOOKUP === "1") return;
  if (await store.hget(KEYS.ipinfo, ip)) return;
  let info: IpInfo | null = null;
  try {
    const r = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,isp,org,as,mobile,proxy,hosting`, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    const d = await r.json();
    if (d.status === "success") info = { org: d.org || d.isp, isp: d.isp, as: d.as, mob: !!d.mobile, prx: !!d.proxy, host: !!d.hosting };
  } catch {}
  if (!info) {
    try {
      const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(2500), cache: "no-store" });
      const d = await r.json();
      if (d.success) info = { org: d.connection?.org || d.connection?.isp, isp: d.connection?.isp, as: d.connection?.asn ? "AS" + d.connection.asn : undefined, dom: d.connection?.domain };
    } catch {}
  }
  if (info) await store.hset(KEYS.ipinfo, { [ip]: JSON.stringify(info) });
}
