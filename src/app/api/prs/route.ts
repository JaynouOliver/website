import { DATA } from "@/data/resume";
import { getPRs } from "@/lib/github-prs";

// Cached for an hour; see src/lib/github-prs.ts for how landed PRs are detected.
export const revalidate = 3600;

export async function GET() {
  try {
    const prs = await getPRs(DATA.githubUsername);
    return Response.json({ prs });
  } catch {
    return Response.json({ prs: null }, { status: 502 });
  }
}
