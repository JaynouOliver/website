// Shared by the tracker, the API routes and the dashboard: the event shape and
// the pure helpers (user-agent parsing, traffic-source naming).
//
// Events are stored as compact JSON in one Redis list (newest first). Three
// kinds: "p" page view, "d" time-on-page for a page view, "c" link click,
// "h" a still-open tab was seen on a new network (see heartbeat in the tracker).

export type Ev = {
  k: "p" | "d" | "c" | "h";
  t: number; // ms timestamp (server clock)
  i?: string; // page-view id, links "d" and "c" events to their page view
  v?: string; // visitor id (random, kept in the browser's localStorage)
  s?: string; // session id (new after 30 min idle)
  ip?: string;
  p?: string; // path
  r?: string; // external referrer, "host/path"
  us?: string; // utm_source (or ?ref=)
  um?: string; // utm_medium
  uc?: string; // utm_campaign
  co?: string; // country code
  rg?: string; // region code
  ci?: string; // city
  la?: number;
  lo?: number;
  tz?: string;
  b?: string; // browser
  o?: string; // operating system
  d?: string; // Desktop | Mobile | Tablet
  bot?: 1;
  m?: string; // device model, where the browser tells (Android Chrome: "Pixel 9")
  ov?: string; // OS version, where the browser tells
  sw?: number; // screen width
  l?: string; // language
  n?: 1; // first page view ever for this visitor
  ns?: 1; // first page view of a session
  ms?: number; // "d": engaged time on the page
  sc?: number; // "d": max scroll depth, 0-100
  h?: string; // "c": link target
  x?: string; // "c": link text
  old?: 1; // converted from the pre-2026-11 "visits" list (no visitor id)
};

export type IpInfo = {
  org?: string; // organisation / company that owns the address
  isp?: string;
  as?: string;
  dom?: string;
  mob?: boolean; // mobile carrier
  prx?: boolean; // VPN / proxy
  host?: boolean; // data centre
};

const BOT_RE =
  /bot|crawl|spider|slurp|curl|wget|python|httpx|axios|node-fetch|go-http|java\/|headless|lighthouse|pagespeed|preview|scrape|monitor|uptime|facebookexternalhit|embedly|whatsapp|telegram|discord|vercel-screenshot|gptbot|claudebot|perplexity|bytespider|semrush|ahrefs/i;

export function parseUa(ua: string): { b: string; o: string; d: string; bot: boolean } {
  if (!ua) return { b: "", o: "", d: "", bot: true };
  const bot = BOT_RE.test(ua);
  const o = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /cros/i.test(ua)
        ? "ChromeOS"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /windows/i.test(ua)
            ? "Windows"
            : /linux|x11/i.test(ua)
              ? "Linux"
              : "";
  const b = /linkedinapp/i.test(ua)
    ? "LinkedIn app"
    : /instagram/i.test(ua)
      ? "Instagram app"
      : /fban|fbav|fb_iab/i.test(ua)
        ? "Facebook app"
        : /twitter/i.test(ua)
          ? "X app"
          : /edg(e|a|ios)?\//i.test(ua)
            ? "Edge"
            : /opr\/|opera/i.test(ua)
              ? "Opera"
              : /samsungbrowser/i.test(ua)
                ? "Samsung Internet"
                : /firefox|fxios/i.test(ua)
                  ? "Firefox"
                  : /chrome|crios|chromium/i.test(ua)
                    ? "Chrome"
                    : /safari/i.test(ua)
                      ? "Safari"
                      : "";
  const d = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? "Tablet" : /mobi|iphone|ipod|android/i.test(ua) ? "Mobile" : "Desktop";
  return { b, o, d, bot };
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)yandex\./, "Yandex"],
  [/(^|\.)baidu\.com$/, "Baidu"],
  [/linkedin\.com$|lnkd\.in$/, "LinkedIn"],
  [/^t\.co$|twitter\.com$|(^|\.)x\.com$/, "X"],
  [/github\.com$|githubusercontent\.com$/, "GitHub"],
  [/news\.ycombinator\.com$/, "Hacker News"],
  [/reddit\.com$/, "Reddit"],
  [/youtube\.com$|youtu\.be$/, "YouTube"],
  [/facebook\.com$|fb\.com$/, "Facebook"],
  [/instagram\.com$/, "Instagram"],
  [/sessionize\.com$/, "Sessionize"],
  [/linuxfoundation\.org$/, "Linux Foundation"],
  [/pycon\.(org|jp)$/, "PyCon"],
  [/chatgpt\.com$|openai\.com$/, "ChatGPT"],
  [/perplexity\.ai$/, "Perplexity"],
  [/claude\.ai$/, "Claude"],
  [/gemini\.google\.com$/, "Gemini"],
  [/mail\.google\.com$|outlook\.(live|office)\.com$/, "Email"],
  [/whatsapp\.com$/, "WhatsApp"],
  [/t\.me$|telegram\.org$/, "Telegram"],
];

// Human name for where a visit came from: UTM tag first, then the referrer.
export function sourceOf(e: { r?: string; us?: string }): string {
  if (e.us) {
    const u = e.us.toLowerCase();
    const hit = SOURCES.find(([, name]) => name.toLowerCase() === u || name.toLowerCase().replace(/\s/g, "") === u);
    return hit ? hit[1] : e.us;
  }
  if (!e.r) return "Direct";
  const host = e.r.split("/")[0].replace(/^www\./, "").toLowerCase();
  for (const [re, name] of SOURCES) if (re.test(host)) return name;
  return host;
}

// Latest heartbeat per visitor: proof the tab is still open, and from where.
export type Beat = { t: number; ip?: string; co?: string; rg?: string; ci?: string; la?: number; lo?: number; n?: number };

export const clip = (s: unknown, n: number): string | undefined => {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t ? t.slice(0, n) : undefined;
};
