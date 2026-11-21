import { NextResponse, type NextRequest } from "next/server";

// Serves the blog on its own subdomain (e.g. blog.subhrokomol.in).
//
// Off until BLOG_HOST is set (Vercel → Settings → Environment Variables), so
// the site works the same before the domain exists. Once it's set:
//   blog.example.com/            → shows /blog
//   blog.example.com/<slug>      → shows /blog/<slug>
//   blog.example.com/blog/<slug> → redirects to /<slug> (clean URLs)
//   example.com/blog/<slug>      → redirects to blog.example.com/<slug>
//
// Also: the *.vercel.app copies of the site (preview and the project's default
// domain) are marked noindex, so Google only lists www.subhrokomol.in.
const AI_AGENT =
  /ChatGPT-User|OAI-SearchBot|GPTBot|Claude-User|Claude-SearchBot|ClaudeBot|anthropic-ai|Perplexity-User|PerplexityBot|meta-externalagent|meta-externalfetcher|MistralAI|cohere-ai|YouBot|DuckAssistBot|Amazonbot|Applebot-Extended|Bytespider|CCBot/i;

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host.endsWith(".vercel.app")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
  }

  // AI agents get the Markdown copy of a page (src/lib/agent-md.ts) at the
  // page's normal address, so they never need to know about /llms.txt:
  //   - a known AI agent's user-agent (ChatGPT, Claude, Perplexity, ...), or
  //   - "Accept: text/markdown" without text/html.
  // Search engines (Googlebot, Bingbot) are deliberately not on the list: they
  // must see the same HTML as people. /?agent=1 shows the Markdown view to anyone.
  const path = request.nextUrl.pathname;
  if (path === "/" && request.nextUrl.searchParams.get("agent") === "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/agent";
    url.search = "";
    return NextResponse.rewrite(url);
  }
  const hasMd = path === "/" || path === "/blog" || path === "/open-source" || /^\/blog\/[^/.]+$/.test(path);
  if (hasMd) {
    const accept = request.headers.get("accept") || "";
    const wantsMd = /text\/markdown/i.test(accept) && !/text\/html/i.test(accept);
    if (wantsMd || AI_AGENT.test(request.headers.get("user-agent") || "")) {
      const url = request.nextUrl.clone();
      url.pathname = "/md" + (path === "/" ? "/full" : path); // the homepage answers with the whole site
      return NextResponse.rewrite(url);
    }
  }

  const blogHost = process.env.BLOG_HOST;
  if (!blogHost) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const onBlog = host === blogHost.toLowerCase();

  if (!onBlog) {
    if (pathname === "/blog" || pathname.startsWith("/blog/")) {
      return NextResponse.redirect(new URL("https://" + blogHost + (pathname.slice(5) || "/")), 308);
    }
    return NextResponse.next();
  }

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    // Build from BLOG_HOST: behind a proxy, nextUrl can carry an internal host.
    return NextResponse.redirect(new URL("https://" + blogHost + (pathname.slice(5) || "/") + request.nextUrl.search), 308);
  }
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/blog" : "/blog" + pathname;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};
