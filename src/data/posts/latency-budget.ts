import type { Post } from "./types";

export const post: Post = {
  slug: "latency-budget",
  title: "Give every request a latency budget",
  date: "2026-02-11",
  summary: "p99 problems are rarely one slow thing. They are ten fine things with no budget.",
  image: "https://picsum.photos/seed/latency/1200/630",
  body: `
When a request is slow, teams hunt for the one slow component. Usually there isn't one. There are ten components each taking a reasonable 30ms, and nobody ever added them up.

https://picsum.photos/seed/latency-inline/900/500

## Budgets change conversations

Once the checkout path had a written budget — 250ms total, itemized per hop — every design review got sharper. "This adds a network call" stopped being an abstract concern and became "this spends 15% of the budget."

- Write the budget down, per hop, in the design doc.
- Alert on budget violations per component, not just on the total.
- Treat retries as spending the budget twice.

## The tail is the product

Averages flatter you. Your p50 user had a fine experience either way; your p99 user is deciding whether to come back. Budget for the tail and the average takes care of itself.
`,
};
