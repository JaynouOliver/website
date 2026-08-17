"use client";

import PillSelect from "@/components/ui/pill-select";
import { fmtDate, mdToHtml } from "@/lib/md";
import { useEffect, useRef, useState } from "react";

type Draft = { slug: string; title: string; date: string; summary: string; image: string; body: string };
const EMPTY: Draft = { slug: "", title: "", date: "", summary: "", image: "", body: "" };

const pill: React.CSSProperties = {
  padding: "7px 15px", font: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--text)",
  background: "transparent", border: "1px solid var(--line)", borderRadius: 999, cursor: "pointer",
};
const ghost: React.CSSProperties = {
  border: "none", background: "transparent", font: "inherit", color: "var(--muted)",
  cursor: "pointer", fontSize: 13.5, padding: "6px 10px", borderRadius: 8,
};
const bare: React.CSSProperties = {
  border: "none", background: "transparent", outline: "none", font: "inherit",
  color: "var(--text)", width: "100%", padding: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export default function EditorClient({ initialPosts }: { initialPosts: Draft[] }) {
  const [drafts, setDrafts] = useState(initialPosts);
  const [cur, setCur] = useState<Draft>({ ...EMPTY });
  const [prevSlug, setPrevSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const grow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(() => { grow(titleRef.current); }, [cur.title, mode]);
  useEffect(() => { grow(bodyRef.current); }, [cur.body, mode]);
  useEffect(() => {
    if (!cur.date) setCur((c) => ({ ...c, date: new Date().toISOString().slice(0, 10) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const words = cur.body.trim() ? cur.body.trim().split(/\s+/).length : 0;

  function load(slug: string) {
    setStatus(""); setMode("write");
    const d = drafts.find((x) => x.slug === slug);
    if (!d) {
      setCur({ ...EMPTY, date: new Date().toISOString().slice(0, 10) });
      setPrevSlug(""); setSlugTouched(false);
      return;
    }
    setCur({ ...d, body: d.body.trim() });
    setPrevSlug(d.slug); setSlugTouched(true);
  }

  function insertAtCursor(text: string) {
    const ta = bodyRef.current;
    setCur((c) => {
      if (!ta || mode !== "write") return { ...c, body: c.body + text };
      const s = ta.selectionStart ?? c.body.length;
      const e = ta.selectionEnd ?? c.body.length;
      return { ...c, body: c.body.slice(0, s) + text + c.body.slice(e) };
    });
  }

  async function upload(file: File, asCover: boolean) {
    setBusy(true); setStatus("Uploading " + file.name + "…");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/editor/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      if (asCover) setCur((c) => ({ ...c, image: data.path }));
      else insertAtCursor("\n\n" + data.path + "\n\n");
      setStatus("Uploaded to public" + data.path);
    } catch (e: any) { setStatus("Upload failed: " + e.message); }
    setBusy(false);
  }

  async function save() {
    if (!cur.title.trim()) { setStatus("Give it a title first."); return; }
    setBusy(true); setStatus("Saving…");
    try {
      const slug = cur.slug || slugify(cur.title);
      const payload = { ...cur, slug, prevSlug };
      const r = await fetch("/api/editor/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setCur((c) => ({ ...c, slug }));
      setPrevSlug(slug);
      setDrafts((ds) => [...ds.filter((d) => d.slug !== prevSlug && d.slug !== slug), { ...payload }]
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)));
      setStatus("Saved — live locally at /blog/" + slug + ". Publish when ready.");
    } catch (e: any) { setStatus("Save failed: " + e.message); }
    setBusy(false);
  }

  async function remove() {
    if (!prevSlug) return;
    setBusy(true); setStatus("Deleting…");
    try {
      const r = await fetch("/api/editor/save?slug=" + encodeURIComponent(prevSlug), { method: "DELETE" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setDrafts((ds) => ds.filter((d) => d.slug !== prevSlug));
      load(""); setStatus("Deleted. Publish to make it live.");
    } catch (e: any) { setStatus("Delete failed: " + e.message); }
    setBusy(false);
  }

  async function publish() {
    setBusy(true); setStatus("Publishing (git commit + push)…");
    try {
      const r = await fetch("/api/editor/publish", { method: "POST" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setStatus(data.message);
    } catch (e: any) { setStatus("Publish failed: " + e.message); }
    setBusy(false);
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--dock)", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <PillSelect
            value={prevSlug}
            onValueChange={load}
            allLabel="✍️ New draft"
            options={drafts.map((d) => ({ value: d.slug, label: d.title || d.slug }))}
          />
          <span style={{ marginLeft: "auto", color: "var(--faint)", fontSize: 13 }}>{words} words</span>
          <div style={{ display: "flex", gap: 4, padding: 3, border: "1px solid var(--line)", borderRadius: 999 }}>
            {(["write", "preview"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                style={{ padding: "5px 13px", font: "inherit", fontSize: 13, fontWeight: 600, border: "none", borderRadius: 999, cursor: "pointer",
                  color: mode === m ? "var(--bg)" : "var(--muted)", background: mode === m ? "var(--text)" : "transparent" }}>
                {m === "write" ? "Write" : "Preview"}
              </button>
            ))}
          </div>
          <button style={pill} disabled={busy} onClick={save}>Save</button>
          <button style={{ ...pill, color: "var(--bg)", background: "var(--text)", border: "none" }} disabled={busy} onClick={publish}>
            Publish
          </button>
          {prevSlug && <button style={{ ...ghost, color: "#cf222e" }} disabled={busy} onClick={remove}>Delete</button>}
        </div>
        {status && (
          <p style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 8px", fontSize: 13, color: "var(--muted)" }}>{status}</p>
        )}
      </div>

      {/* document */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(28px,5vw,56px) 24px 160px" }}>
        {mode === "write" ? (
          <>
            {/* cover + toolbar row */}
            {cur.image ? (
              <div style={{ position: "relative", marginBottom: 26 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cur.image} alt="" style={{ width: "100%", borderRadius: 14, display: "block" }} />
                <button onClick={() => setCur((c) => ({ ...c, image: "" }))}
                  style={{ ...ghost, position: "absolute", top: 10, right: 10, background: "var(--dock)", backdropFilter: "blur(10px)", borderRadius: 999, color: "var(--text)" }}>
                  ✕ Remove cover
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, marginBottom: 18 }}>
                <label style={ghost}>
                  🖼 Add cover
                  <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, true); e.target.value = ""; }} />
                </label>
                <input
                  style={{ ...bare, width: 220, fontSize: 13.5, color: "var(--muted)" }}
                  placeholder="…or paste cover /path or URL"
                  value={cur.image}
                  onChange={(e) => setCur((c) => ({ ...c, image: e.target.value }))}
                />
                <label style={ghost}>
                  📷 Insert image
                  <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, false); e.target.value = ""; }} />
                </label>
              </div>
            )}

            <textarea
              ref={titleRef}
              rows={1}
              value={cur.title}
              onChange={(e) => {
                const v = e.target.value.replace(/\n/g, "");
                setCur((c) => ({ ...c, title: v, slug: !slugTouched && !prevSlug ? slugify(v) : c.slug }));
              }}
              placeholder="Article title…"
              style={{ ...bare, fontSize: "clamp(30px,5vw,40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, resize: "none", overflow: "hidden", marginBottom: 10 }}
            />
            <input
              value={cur.summary}
              onChange={(e) => setCur((c) => ({ ...c, summary: e.target.value }))}
              placeholder="Add a subtitle…"
              style={{ ...bare, fontSize: 18, color: "var(--muted)", marginBottom: 12 }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 26, fontSize: 13, color: "var(--faint)", fontFamily: "ui-monospace,Menlo,monospace" }}>
              <span>/blog/</span>
              <input
                value={cur.slug}
                onChange={(e) => { setSlugTouched(true); setCur((c) => ({ ...c, slug: slugify(e.target.value) })); }}
                placeholder="slug"
                style={{ ...bare, width: 220, fontSize: 13, color: "var(--faint)", fontFamily: "inherit" }}
              />
              <input
                type="date"
                value={cur.date}
                onChange={(e) => setCur((c) => ({ ...c, date: e.target.value }))}
                style={{ ...bare, width: 140, fontSize: 13, color: "var(--faint)", fontFamily: "inherit", colorScheme: "light dark" }}
              />
            </div>

            <textarea
              ref={bodyRef}
              value={cur.body}
              onChange={(e) => setCur((c) => ({ ...c, body: e.target.value }))}
              onDrop={(e) => { const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith("image/")) { e.preventDefault(); upload(f, false); } }}
              placeholder={"Start writing… markdown works:\n\n## A heading\n- a bullet\n**bold**, `code`, [a link](https://example.com)\n\nDrop an image here, or paste an image URL / /path on its own line."}
              style={{ ...bare, fontSize: 17, lineHeight: 1.75, resize: "none", overflow: "hidden", minHeight: 320 }}
            />
          </>
        ) : (
          <article>
            {cur.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cur.image} alt="" style={{ width: "100%", borderRadius: 16, marginBottom: 32 }} />
            )}
            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(30px,5vw,42px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
              {cur.title || "Untitled"}
            </h1>
            <p style={{ margin: "0 0 30px", color: "var(--faint)", fontSize: 14 }}>{fmtDate(cur.date)}</p>
            <div className="md-body" dangerouslySetInnerHTML={{ __html: mdToHtml(cur.body) }} />
          </article>
        )}
      </main>
    </div>
  );
}
