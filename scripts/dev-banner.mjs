// Printed by `npm run dev` before Next.js starts — a map of where to edit things.
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

console.log(`
${bold("✏️  Edit your site (local-only, 404 in production):")}
   ${cyan("http://localhost:3000/editor")}          ${dim("→ write, edit & publish blog posts")}
   ${cyan("http://localhost:3000/editor/quests")}   ${dim("→ edit Main quests (work experience)")}

${bold("📁 Data files (hand-editing hot-reloads too):")}
   ${cyan("src/data/resume.tsx")}     ${dim("→ name, tagline, avatar, socials, projects")}
   ${cyan("src/data/quests.ts")}      ${dim("→ Main quests data")}
   ${cyan("src/data/posts/*.ts")}     ${dim("→ one file per blog post")}
   ${cyan("public/")}                 ${dim("→ images (lowercase names, reference as /file.jpg)")}

${bold("📄 Pages:")} ${cyan("/")}  ${cyan("/blog")}  ${cyan("/open-source")}   ${dim("(/analytics works on the live site)")}
${dim("Publish = the editor's Publish button, or: git add -A && git commit && git push")}
`);
