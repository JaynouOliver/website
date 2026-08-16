# Portfolio

Static site + two Vercel serverless functions. Everything on the main page renders from `content.md`; blog posts are markdown files in `blog/`.

## Deploy on Vercel

1. Push this folder's contents to the repo root.
2. Import the repo in Vercel (Framework preset: **Other**, no build step, output dir = root).
3. Storage -> Create -> **KV** (free) -> connect to the project.
4. Settings -> Environment Variables -> `DASH_PASSWORD` = your analytics password.
5. Deploy. Visits log automatically; dashboard at `/analytics.html`.

## Editing content

- `content.md` — name, tagline, experience, projects, research, socials, blog list.
- `blog/*.md` — one file per post (title/date/image/summary front matter, then markdown).
