"use client";

import type { Quest } from "@/data/quests";
import Link from "next/link";
import { useState } from "react";

type Draft = Quest & { pointsText: string };
const EMPTY: Draft = { company: "", href: "", title: "", logoUrl: "", location: "", start: "", end: "Present", points: [], pointsText: "" };

const field: React.CSSProperties = {
  boxSizing: "border-box", width: "100%", padding: "9px 12px", font: "inherit", fontSize: 14,
  color: "var(--text)", background: "var(--soft)", border: "1px solid var(--line)", borderRadius: 10,
};
const pill: React.CSSProperties = {
  padding: "7px 15px", font: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--text)",
  background: "transparent", border: "1px solid var(--line)", borderRadius: 999, cursor: "pointer",
};
const ghost: React.CSSProperties = {
  border: "none", background: "transparent", font: "inherit", color: "var(--muted)",
  cursor: "pointer", fontSize: 13.5, padding: "6px 10px", borderRadius: 8,
};

export default function QuestsClient({ initialQuests }: { initialQuests: Quest[] }) {
  const [drafts, setDrafts] = useState<Draft[]>(
    initialQuests.map((q) => ({ ...q, pointsText: q.points.join("\n") }))
  );
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (i: number, k: keyof Draft, v: string) =>
    setDrafts((ds) => ds.map((d, j) => (j === i ? { ...d, [k]: v } : d)));
  const move = (i: number, dir: -1 | 1) =>
    setDrafts((ds) => {
      const j = i + dir;
      if (j < 0 || j >= ds.length) return ds;
      const next = [...ds];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function uploadLogo(i: number, file: File) {
    setBusy(true); setStatus("Uploading logo…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/editor/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      update(i, "logoUrl", data.path);
      setStatus("Logo uploaded to public" + data.path);
    } catch (e: any) { setStatus("Upload failed: " + e.message); }
    setBusy(false);
  }

  async function doSave(): Promise<boolean> {
    const payload = drafts.map(({ pointsText, ...q }) => ({
      ...q,
      points: pointsText.split("\n").map((p) => p.replace(/^-\s*/, "").trim()).filter(Boolean),
    }));
    const r = await fetch("/api/editor/quests", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quests: payload }),
    });
    const data = await r.json();
    if (!r.ok) { setStatus("Save failed: " + data.error); return false; }
    return true;
  }

  async function save() {
    setBusy(true); setStatus("Saving…");
    try { if (await doSave()) setStatus("Saved — check the homepage. Publish when ready."); }
    catch (e: any) { setStatus("Save failed: " + e.message); }
    setBusy(false);
  }

  async function publish() {
    setBusy(true);
    try {
      setStatus("Saving…");
      if (!(await doSave())) { setBusy(false); return; }
      setStatus("Publishing (git commit + push)…");
      const r = await fetch("/api/editor/publish", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setStatus(data.message);
    } catch (e: any) { setStatus("Publish failed: " + e.message); }
    setBusy(false);
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--dock)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link href="/editor" style={{ ...ghost, textDecoration: "none" }}>← Posts</Link>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Main quests</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={pill} disabled={busy} onClick={() => setDrafts((ds) => [{ ...EMPTY }, ...ds])}>+ Add quest</button>
            <button style={pill} disabled={busy} onClick={save}>Save</button>
            <button style={{ ...pill, color: "var(--bg)", background: "var(--text)", border: "none" }} disabled={busy} onClick={publish}>Publish</button>
          </div>
        </div>
        {status && <p style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 8px", fontSize: 13, color: "var(--muted)" }}>{status}</p>}
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 160px", display: "flex", flexDirection: "column", gap: 18 }}>
        {drafts.length === 0 && <p style={{ color: "var(--faint)" }}>No quests yet — add one.</p>}
        {drafts.map((d, i) => (
          <section key={i} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              {d.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 999, objectFit: "contain", background: "#fff", border: "1px solid var(--line)", padding: 4, flex: "none" }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--soft)", border: "1px solid var(--line)", flex: "none" }} />
              )}
              <label style={ghost}>
                Upload logo
                <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(i, f); e.target.value = ""; }} />
              </label>
              <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
                <button style={ghost} disabled={busy || i === 0} onClick={() => move(i, -1)} title="Move up">↑</button>
                <button style={ghost} disabled={busy || i === drafts.length - 1} onClick={() => move(i, 1)} title="Move down">↓</button>
                <button style={{ ...ghost, color: "#cf222e" }} disabled={busy} onClick={() => setDrafts((ds) => ds.filter((_, j) => j !== i))}>Delete</button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 10 }}>
              <input style={field} placeholder="Company" value={d.company} onChange={(e) => update(i, "company", e.target.value)} />
              <input style={field} placeholder="Role (e.g. Software Engineer)" value={d.title} onChange={(e) => update(i, "title", e.target.value)} />
              <input style={field} placeholder="Company URL (https://…)" value={d.href} onChange={(e) => update(i, "href", e.target.value)} />
              <input style={field} placeholder="Logo: /file.png or https://…" value={d.logoUrl} onChange={(e) => update(i, "logoUrl", e.target.value)} />
              <input style={field} placeholder="Start (e.g. January 2026)" value={d.start} onChange={(e) => update(i, "start", e.target.value)} />
              <input style={field} placeholder="End (e.g. Present)" value={d.end} onChange={(e) => update(i, "end", e.target.value)} />
            </div>
            <textarea
              style={{ ...field, minHeight: 96, resize: "vertical", lineHeight: 1.6 }}
              placeholder={"Bullet points — one per line. Markdown links work:\nShipped [feature X](https://example.com) reducing load times 40%."}
              value={d.pointsText}
              onChange={(e) => update(i, "pointsText", e.target.value)}
            />
          </section>
        ))}
      </main>
    </div>
  );
}
