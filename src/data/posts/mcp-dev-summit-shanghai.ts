import type { Post } from "./types";

export const post: Post = {
  slug: "mcp-dev-summit-shanghai",
  title: "Speaking at MCP Dev Summit Shanghai",
  date: "2026-09-10",
  summary: "Our talk on agents that get better from their own mistakes.",
  image: "/talks/shanghai-cover.webp",
  body: `
In September I spoke at MCP Dev Summit Shanghai (AGNTCon + MCPCon China), the Linux Foundation's conference for the Model Context Protocol and agent tooling. It ran on September 6 and 7 at the Shanghai International Convention Center in Pudong, and I went on a scholarship to speak.

![Shanghai International Convention Center, Pudong. Photo: Hermann Luyken, CC0](/talks/shanghai-pudong.webp)

## The talk

Jayita Bhattacharyya and I gave "How We Built Reliable and Self-Evolving Agent Skills" in the Agentic Engineering track, on the second day.

![On stage with the title slide](/talks/shanghai-stage.webp)

We started from a simple problem. Almost every layer of an agent runs on prompts: the skills, the tool descriptions, the MCP servers, the orchestration around them. Prompts are easy to write, but the outputs are unreliable, and tuning them by hand against a non-deterministic model is slow guesswork.

What we talked about instead is reflection. The agent looks at where it went wrong and rewrites its own instructions, so it gets better turn by turn, without RL or fine-tuning.

The hard part is knowing whether a change actually helped. So the loop needs evaluations and feedback built in, to measure which edit improved the whole system and which one didn't.

![The room during the talk](/talks/shanghai-room.webp)

The [slides](https://sessionize.com/download/iflauwse~HTPwKyC1WDLGuNRmD3qUJa.pdf~agntcon-mcpcon-china-2026_jayita-suvro_talk.pptx.pdf) and the [session page](https://www.lfopensource.cn/mcp-dev-summit-shanghai/program/schedule/?id=1244038) are online.
`,
};
