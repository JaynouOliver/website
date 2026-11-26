/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Markdown copies of pages for AI agents: /index.md, /blog/<slug>.md, ...
  // (generated in src/lib/agent-md.ts, served by src/app/md/[...path]).
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/index.md", destination: "/md/index" },
        { source: "/blog.md", destination: "/md/blog" },
        { source: "/open-source.md", destination: "/md/open-source" },
        { source: "/blog/:slug([^/]+)\\.md", destination: "/md/blog/:slug" },
      ],
    };
  },
};

export default nextConfig;
