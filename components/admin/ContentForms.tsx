"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentKey, SiteContent } from "@/lib/types";

const TABS: { key: ContentKey; label: string; hint: string }[] = [
  { key: "hero", label: "Hero", hint: "Headline, CTA, technical strip" },
  { key: "philosophy", label: "Philosophy", hint: "Statement, stats, principles" },
  { key: "contact", label: "Contact", hint: "Details, socials, footer" },
  { key: "nav", label: "Navigation", hint: "Brand, links, header CTA" },
];

type Status = { kind: "ok" | "err"; msg: string } | null;

/* ------------------------------- primitives ------------------------------- */

function Field({
  label,
  value,
  onChange,
  textarea,
  hint,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {textarea ? (
        <textarea
          className="admin-textarea"
          rows={rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="mt-1.5 font-mono text-[9px] text-steel">{hint}</p>}
    </div>
  );
}

function PairRow({
  label,
  left,
  right,
  onLeft,
  onRight,
  onRemove,
  leftPlaceholder,
  rightPlaceholder,
}: {
  label: string;
  left: string;
  right: string;
  onLeft: (v: string) => void;
  onRight: (v: string) => void;
  onRemove: () => void;
  leftPlaceholder?: string;
  rightPlaceholder?: string;
}) {
  return (
    <div className="flex items-end gap-2 border-b border-white/5 pb-3 last:border-b-0">
      <span className="w-6 shrink-0 pb-2.5 font-mono text-[9px] text-steel">{label}</span>
      <input
        className="admin-input"
        value={left}
        placeholder={leftPlaceholder}
        onChange={(e) => onLeft(e.target.value)}
      />
      <input
        className="admin-input"
        value={right}
        placeholder={rightPlaceholder}
        onChange={(e) => onRight(e.target.value)}
      />
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 px-2 py-2.5 font-mono text-[11px] text-steel transition-colors hover:text-red-400"
        aria-label="Remove row"
      >
        ✕
      </button>
    </div>
  );
}

/* ------------------------------- main form ------------------------------- */

export default function ContentForms({
  initial,
  initialTab = "hero",
}: {
  initial: SiteContent;
  initialTab?: ContentKey;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<ContentKey>(initialTab);
  const [drafts, setDrafts] = useState<SiteContent>(initial);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  // Immutably patch one section of one content document.
  const patch = <K extends ContentKey>(key: K, updater: (prev: SiteContent[K]) => SiteContent[K]) =>
    setDrafts((prev) => ({ ...prev, [key]: updater(prev[key]) }));

  async function save() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: tab, value: drafts[tab] }),
      });
      const data = await res.json().catch(() => ({}));
      setStatus(
        res.ok
          ? { kind: "ok", msg: `${tab} saved — live on the site` }
          : { kind: "err", msg: data.error || "Save failed" }
      );
      if (res.ok) router.refresh();
    } catch {
      setStatus({ kind: "err", msg: "Network error" });
    }
    setBusy(false);
  }

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setStatus(null);
            }}
            className={`border px-4 py-2.5 font-mono text-[10px] uppercase tracking-brutal transition-colors ${
              tab === t.key
                ? "border-paper bg-paper text-ink"
                : "border-white/15 text-steel hover:border-white/40 hover:text-paper"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold uppercase tracking-tight">{active.label}</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-steel">
            {active.hint}
          </p>
        </div>
        <span className="hidden font-mono text-[10px] text-steel sm:block">
          settings.key = “{tab}”
        </span>
      </div>

      {/* -------------------------------- HERO -------------------------------- */}
      {tab === "hero" && (
        <div className="admin-card flex flex-col gap-6 p-5 sm:p-6">
          <Field
            label="Eyebrow"
            value={drafts.hero.eyebrow}
            onChange={(v) => patch("hero", (p) => ({ ...p, eyebrow: v }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Field
                key={i}
                label={`Headline line ${i + 1}${i === 2 ? " (accent)" : ""}`}
                value={drafts.hero.lines[i] ?? ""}
                onChange={(v) =>
                  patch("hero", (p) => {
                    const lines = [...p.lines] as SiteContent["hero"]["lines"];
                    lines[i] = v;
                    return { ...p, lines };
                  })
                }
                hint={i === 2 ? "First word rendered italic" : undefined}
              />
            ))}
          </div>
          <Field
            label="Subheadline"
            textarea
            rows={3}
            value={drafts.hero.sub}
            onChange={(v) => patch("hero", (p) => ({ ...p, sub: v }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="CTA label"
              value={drafts.hero.cta}
              onChange={(v) => patch("hero", (p) => ({ ...p, cta: v }))}
            />
            <Field
              label="Coordinates"
              value={drafts.hero.coords}
              onChange={(v) => patch("hero", (p) => ({ ...p, coords: v }))}
            />
            <Field
              label="Bottom-left label"
              value={drafts.hero.metaLeft}
              onChange={(v) => patch("hero", (p) => ({ ...p, metaLeft: v }))}
            />
            <Field
              label="Bottom-right label"
              value={drafts.hero.metaRight}
              onChange={(v) => patch("hero", (p) => ({ ...p, metaRight: v }))}
            />
          </div>
        </div>
      )}

      {/* ----------------------------- PHILOSOPHY ----------------------------- */}
      {tab === "philosophy" && (
        <div className="flex flex-col gap-6">
          <div className="admin-card flex flex-col gap-6 p-5 sm:p-6">
            <Field
              label="Section label"
              value={drafts.philosophy.label}
              onChange={(v) => patch("philosophy", (p) => ({ ...p, label: v }))}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Field
                  key={i}
                  label={`Heading line ${i + 1}${i === 1 ? " (italic)" : ""}`}
                  value={drafts.philosophy.heading[i] ?? ""}
                  onChange={(v) =>
                    patch("philosophy", (p) => {
                      const heading = [...p.heading] as SiteContent["philosophy"]["heading"];
                      heading[i] = v;
                      return { ...p, heading };
                    })
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Studio block (one line each)"
                textarea
                rows={3}
                value={drafts.philosophy.studio.join("\n")}
                onChange={(v) =>
                  patch("philosophy", (p) => ({
                    ...p,
                    studio: v.split("\n").filter((l) => l.trim().length > 0),
                  }))
                }
              />
              <Field
                label="Figure caption"
                value={drafts.philosophy.figCaption}
                onChange={(v) => patch("philosophy", (p) => ({ ...p, figCaption: v }))}
              />
            </div>
            <Field
              label="Intro paragraph"
              textarea
              rows={5}
              value={drafts.philosophy.intro}
              onChange={(v) => patch("philosophy", (p) => ({ ...p, intro: v }))}
            />
            <Field
              label="Body paragraph"
              textarea
              rows={4}
              value={drafts.philosophy.body}
              onChange={(v) => patch("philosophy", (p) => ({ ...p, body: v }))}
            />
          </div>

          <div className="admin-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="admin-label !mb-0">Stats</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {drafts.philosophy.stats.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="admin-input w-20 shrink-0"
                    value={s.value}
                    placeholder="27"
                    onChange={(e) =>
                      patch("philosophy", (p) => ({
                        ...p,
                        stats: p.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                      }))
                    }
                  />
                  <input
                    className="admin-input"
                    value={s.label}
                    placeholder="Years in practice"
                    onChange={(e) =>
                      patch("philosophy", (p) => ({
                        ...p,
                        stats: p.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-5 sm:p-6">
            <span className="admin-label">Principles</span>
            <div className="flex flex-col gap-4">
              {drafts.philosophy.principles.map((pr, i) => (
                <div key={i} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex gap-2">
                    <input
                      className="admin-input w-14 shrink-0"
                      value={pr.n}
                      onChange={(e) =>
                        patch("philosophy", (p) => ({
                          ...p,
                          principles: p.principles.map((x, j) =>
                            j === i ? { ...x, n: e.target.value } : x
                          ),
                        }))
                      }
                    />
                    <input
                      className="admin-input"
                      value={pr.title}
                      placeholder="Mass"
                      onChange={(e) =>
                        patch("philosophy", (p) => ({
                          ...p,
                          principles: p.principles.map((x, j) =>
                            j === i ? { ...x, title: e.target.value } : x
                          ),
                        }))
                      }
                    />
                  </div>
                  <textarea
                    className="admin-textarea mt-2"
                    rows={2}
                    value={pr.text}
                    onChange={(e) =>
                      patch("philosophy", (p) => ({
                        ...p,
                        principles: p.principles.map((x, j) =>
                          j === i ? { ...x, text: e.target.value } : x
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------ CONTACT ------------------------------ */}
      {tab === "contact" && (
        <div className="flex flex-col gap-6">
          <div className="admin-card flex flex-col gap-6 p-5 sm:p-6">
            <Field
              label="Section label"
              value={drafts.contact.label}
              onChange={(v) => patch("contact", (p) => ({ ...p, label: v }))}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Field
                  key={i}
                  label={`Heading line ${i + 1}${i === 1 ? " (italic)" : ""}`}
                  value={drafts.contact.heading[i] ?? ""}
                  onChange={(v) =>
                    patch("contact", (p) => {
                      const heading = [...p.heading] as SiteContent["contact"]["heading"];
                      heading[i] = v;
                      return { ...p, heading };
                    })
                  }
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Email"
                value={drafts.contact.email}
                onChange={(v) => patch("contact", (p) => ({ ...p, email: v }))}
              />
              <Field
                label="Phone"
                value={drafts.contact.phone}
                onChange={(v) => patch("contact", (p) => ({ ...p, phone: v }))}
              />
              <Field
                label="Address (line breaks allowed)"
                textarea
                rows={3}
                value={drafts.contact.address}
                onChange={(v) => patch("contact", (p) => ({ ...p, address: v }))}
              />
              <Field
                label="Hours (line breaks allowed)"
                textarea
                rows={3}
                value={drafts.contact.hours}
                onChange={(v) => patch("contact", (p) => ({ ...p, hours: v }))}
              />
              <Field
                label="Copyright line"
                value={drafts.contact.copyright}
                onChange={(v) => patch("contact", (p) => ({ ...p, copyright: v }))}
              />
              <Field
                label="Coordinates"
                value={drafts.contact.coords}
                onChange={(v) => patch("contact", (p) => ({ ...p, coords: v }))}
              />
            </div>
          </div>

          <div className="admin-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="admin-label !mb-0">Social links</span>
              <button
                type="button"
                onClick={() =>
                  patch("contact", (p) => ({
                    ...p,
                    socials: [...p.socials, { label: "New", href: "https://" }],
                  }))
                }
                className="admin-btn px-3 py-1.5"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {drafts.contact.socials.map((s, i) => (
                <PairRow
                  key={i}
                  label={String(i + 1).padStart(2, "0")}
                  left={s.label}
                  right={s.href}
                  leftPlaceholder="Instagram"
                  rightPlaceholder="https://…"
                  onLeft={(v) =>
                    patch("contact", (p) => ({
                      ...p,
                      socials: p.socials.map((x, j) => (j === i ? { ...x, label: v } : x)),
                    }))
                  }
                  onRight={(v) =>
                    patch("contact", (p) => ({
                      ...p,
                      socials: p.socials.map((x, j) => (j === i ? { ...x, href: v } : x)),
                    }))
                  }
                  onRemove={() =>
                    patch("contact", (p) => ({
                      ...p,
                      socials: p.socials.filter((_, j) => j !== i),
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------- NAVIGATION ---------------------------- */}
      {tab === "nav" && (
        <div className="flex flex-col gap-6">
          <div className="admin-card grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">
            <Field
              label="Brand"
              value={drafts.nav.brand}
              onChange={(v) => patch("nav", (p) => ({ ...p, brand: v }))}
            />
            <Field
              label="Brand mark"
              value={drafts.nav.brandMark}
              onChange={(v) => patch("nav", (p) => ({ ...p, brandMark: v }))}
            />
            <Field
              label="Header CTA"
              value={drafts.nav.cta}
              onChange={(v) => patch("nav", (p) => ({ ...p, cta: v }))}
            />
          </div>

          <div className="admin-card p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="admin-label !mb-0">Nav links</span>
              <button
                type="button"
                onClick={() =>
                  patch("nav", (p) => ({ ...p, links: [...p.links, { label: "New", href: "#" }] }))
                }
                className="admin-btn px-3 py-1.5"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {drafts.nav.links.map((l, i) => (
                <PairRow
                  key={i}
                  label={String(i + 1).padStart(2, "0")}
                  left={l.label}
                  right={l.href}
                  leftPlaceholder="Studio"
                  rightPlaceholder="#philosophy"
                  onLeft={(v) =>
                    patch("nav", (p) => ({
                      ...p,
                      links: p.links.map((x, j) => (j === i ? { ...x, label: v } : x)),
                    }))
                  }
                  onRight={(v) =>
                    patch("nav", (p) => ({
                      ...p,
                      links: p.links.map((x, j) => (j === i ? { ...x, href: v } : x)),
                    }))
                  }
                  onRemove={() =>
                    patch("nav", (p) => ({ ...p, links: p.links.filter((_, j) => j !== i) }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 border border-white/10 bg-ink/95 px-4 py-3 backdrop-blur">
        <button onClick={save} disabled={busy} className="admin-btn-solid px-6 py-3">
          {busy ? "Saving…" : `Save ${active.label}`}
        </button>
        <a href="/" target="_blank" className="admin-btn py-3">
          Preview ↗
        </a>
        <AnimatePresence>
          {status && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`font-mono text-[10px] uppercase tracking-wider ${
                status.kind === "ok" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {status.msg}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
