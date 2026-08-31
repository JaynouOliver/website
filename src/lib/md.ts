// Tiny markdown renderer for blog post bodies. No dependencies.
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function mdInline(s: string): string {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  // Internal links (starting with /) open in the same tab; external ones in a new tab.
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, href) =>
    href.startsWith("/")
      ? '<a href="' + href + '">' + text + "</a>"
      : '<a href="' + href + '" target="_blank" rel="noopener">' + text + "</a>"
  );
  return s;
}

// Local images route through Vercel's optimizer (resized + WebP + CDN); all
// body images lazy-load so they never block the initial page render.
function imgTag(src: string, alt = ""): string {
  const attrs = ' loading="lazy" decoding="async" alt="' + esc(alt) + '"';
  if (src.startsWith("/")) {
    return '<img src="/_next/image?url=' + encodeURIComponent(src) + '&w=1200&q=75"' + attrs + ">";
  }
  return '<img src="' + esc(src) + '"' + attrs + ">";
}

export function mdToHtml(md: string): string {
  const lines = md.replace(/\r/g, "").split("\n");
  let html = "";
  let para: string[] = [];
  let list: string[] | null = null;
  let code: string[] | null = null;
  const flushP = () => { if (para.length) { html += "<p>" + mdInline(para.join(" ")) + "</p>"; para = []; } };
  const flushL = () => { if (list) { html += "<ul>" + list.map(x => "<li>" + mdInline(x) + "</li>").join("") + "</ul>"; list = null; } };
  for (const raw of lines) {
    const l = raw;
    if (code !== null) {
      if (l.trim().startsWith("```")) { html += "<pre><code>" + esc(code.join("\n")) + "</code></pre>"; code = null; }
      else code.push(l);
      continue;
    }
    if (l.trim().startsWith("```")) { flushP(); flushL(); code = []; continue; }
    const t = l.trim();
    if (!t) { flushP(); flushL(); continue; }
    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (img) {
      flushP(); flushL();
      html += "<figure>" + imgTag(img[2], img[1]) + (img[1] ? "<figcaption>" + esc(img[1]) + "</figcaption>" : "") + "</figure>";
      continue;
    }
    // A bare URL or local /path on its own line renders as a centered image — just paste it between two paragraphs.
    if (/^https?:\/\/\S+$/.test(t) || /^\/\S+\.(png|jpe?g|gif|webp|avif|svg)$/i.test(t)) {
      flushP(); flushL();
      html += "<figure>" + imgTag(t) + "</figure>";
      continue;
    }
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushP(); flushL(); const n = Math.min(h[1].length + 1, 5); html += "<h" + n + ">" + mdInline(h[2]) + "</h" + n + ">"; continue; }
    if (t.startsWith("> ")) { flushP(); flushL(); html += "<blockquote>" + mdInline(t.slice(2)) + "</blockquote>"; continue; }
    if (t.startsWith("- ")) { flushP(); if (!list) list = []; list.push(t.slice(2)); continue; }
    flushL(); para.push(t);
  }
  flushP(); flushL();
  if (code) html += "<pre><code>" + esc(code.join("\n")) + "</code></pre>";
  return html;
}

export function fmtDate(s: string): string {
  const d = new Date(s);
  if (isNaN(+d)) return s || "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
