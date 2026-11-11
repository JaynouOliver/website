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
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  if (host.endsWith(".vercel.app")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex");
    return res;
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
