export type Post = {
  slug: string;     // becomes the URL: /blog/<slug>
  title: string;
  date: string;     // "2026-05-02" — used for sorting and display
  summary: string;  // one or two lines shown in lists
  image?: string;   // optional cover image: a URL, or "/my-image.png" for a file in public/
  body: string;     // markdown: ## headings, - bullets, **bold**, `code`, ```fences```, [links](url), ![images](url)
};
