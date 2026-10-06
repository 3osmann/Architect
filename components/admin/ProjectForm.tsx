"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RATIO_OPTIONS, TONE_OPTIONS } from "@/lib/defaults";
import type { Project } from "@/lib/types";

type Props = {
  /** Existing project → edit mode; null → create mode */
  project?: Project | null;
};

type FormState = {
  title: string;
  location: string;
  year: string;
  category: string;
  ratio: string;
  tone: string;
  sort_order: string | number;
  published: boolean;
};

const empty: FormState = {
  title: "",
  location: "",
  year: "",
  category: "",
  ratio: RATIO_OPTIONS[0].value,
  tone: TONE_OPTIONS[0].value,
  sort_order: 0,
  published: true,
};

/** Create / edit form shared by /admin/projects/new and /admin/projects/[id]. */
export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const editing = Boolean(project);
  const [form, setForm] = useState<FormState>(() => ({
    ...empty,
    ...(project ? { ...project, sort_order: String(project.sort_order) } : {}),
  }));
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (field: keyof FormState, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [field]: value }) as FormState);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);

    const payload = {
      ...form,
      sort_order: Number(form.sort_order) || 0,
      year: String(form.year),
    };

    const res = await fetch(editing ? `/api/projects/${project!.id}` : "/api/projects", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({ kind: "err", msg: data.error || "Save failed" });
      setBusy(false);
      return;
    }

    setStatus({ kind: "ok", msg: editing ? "Project updated" : "Project created" });
    setBusy(false);
    if (!editing) router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="admin-card p-5 sm:p-6">
        <span className="admin-label">Basics</span>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="p-title">
              Title *
            </label>
            <input
              id="p-title"
              required
              className="admin-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Monolith Tower"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="p-location">
              Location
            </label>
            <input
              id="p-location"
              className="admin-input"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Rotterdam, NL"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="p-year">
              Year
            </label>
            <input
              id="p-year"
              className="admin-input"
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              placeholder="2025"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="p-category">
              Category
            </label>
            <input
              id="p-category"
              className="admin-input"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Mixed-Use / High-Rise"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="p-order">
              Sort order
            </label>
            <input
              id="p-order"
              type="number"
              min={0}
              className="admin-input"
              value={form.sort_order}
              onChange={(e) => set("sort_order", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-card p-5 sm:p-6">
        <span className="admin-label">Appearance</span>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="p-ratio">
              Aspect ratio
            </label>
            <select
              id="p-ratio"
              className="admin-input"
              value={form.ratio}
              onChange={(e) => set("ratio", e.target.value)}
            >
              {RATIO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label" htmlFor="p-tone">
              Tone / gradient
            </label>
            <select
              id="p-tone"
              className="admin-input"
              value={form.tone}
              onChange={(e) => set("tone", e.target.value)}
            >
              {TONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live preview of the card artwork */}
        <div className="mt-5">
          <span className="admin-label">Preview</span>
          <div
            className={`relative h-32 w-full overflow-hidden border border-white/10 bg-gradient-to-br ${form.tone}`}
          >
            <div className="grid-overlay absolute inset-0 opacity-70" />
            <span className="absolute left-3 top-3 font-mono text-[10px] tracking-brutal text-white/60">
              {String(form.sort_order || 0).padStart(2, "0")}
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-sm font-semibold uppercase tracking-tight">
                {form.title || "Untitled"}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-brutal text-white/60">
                {form.location || "Location"}
              </p>
            </div>
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 border border-white/10 bg-black/30 px-4 py-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
            className="h-4 w-4 accent-[#f2f1ee]"
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">
            Published — visible on the public site
          </span>
        </label>
      </div>

      <AnimatePresence>
        {status && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`border-l-2 pl-3 font-mono text-[11px] uppercase tracking-wider ${
              status.kind === "ok" ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"
            }`}
          >
            {status.msg}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="admin-btn-solid px-6 py-3">
          {busy ? "Saving…" : editing ? "Save changes" : "Create project"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn py-3">
          Cancel
        </button>
        {editing && (
          <a href="/" target="_blank" className="admin-btn py-3">
            View on site ↗
          </a>
        )}
      </div>
    </form>
  );
}
