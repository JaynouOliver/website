import { DATA } from "@/data/resume";
import { getPRs } from "@/lib/github-prs";

// Cached for 10 minutes, so a PR that is merged or closed shows up quickly; see src/lib/github-prs.ts for how landed PRs are detected.
export const revalidate = 600;

export async function GET() {
  try {
    const prs = await getPRs(DATA.githubUsername);
    return Response.json({ prs });
  } catch {
    return Response.json({ prs: null }, { status: 502 });
  }
}
