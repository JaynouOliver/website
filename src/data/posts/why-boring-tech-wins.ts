import type { Post } from "./types";

export const post: Post = {
  slug: "why-boring-tech-wins",
  title: "Why boring technology keeps winning",
  date: "2026-07-18",
  summary: "The most reliable systems I have worked on were built from the dullest parts. That is not an accident.",
  image: "",
  body: `
Every few months a new database, framework, or runtime promises to change everything. And every few months the systems that quietly keep working are the ones built on Postgres, plain HTTP, and a queue.

## Innovation tokens are real

You get maybe two or three genuinely novel choices per system before the operational cost eats you. Spend them where your product is actually different — not on the parts your users never see.

- Choose the tool your team can debug at 3am.
- Prefer one database you understand over three you don't.
- New tech must beat the incumbent by a lot, not by a little.

## What "boring" buys you

Boring tools have known failure modes. When Postgres misbehaves, the answer is on page one of the search results. When your six-month-old streaming framework misbehaves, the answer is in a GitHub issue with no replies.

> Reliability is mostly the absence of surprises.

That is the whole argument. Pick surprises deliberately, in the one place they pay for themselves.
`,
};
