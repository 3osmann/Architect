"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";

/** Publish toggle + delete for one project row. */
export default function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);

  async function togglePublish() {
    setBusy(true);
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !project.published }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) {
      setHidden(true); // optimistic removal while RSC cache revalidates
      router.refresh();
    }
    setBusy(false);
  }

  if (hidden) return null;

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
      <td className="px-5 py-4 font-mono text-[10px] text-steel">
        {String(project.sort_order).padStart(2, "0")}
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium">{project.title}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-steel">
          {project.category}
        </p>
      </td>
      <td className="hidden px-5 py-4 font-mono text-[11px] text-fog sm:table-cell">
        {project.location}
      </td>
      <td className="hidden px-5 py-4 font-mono text-[11px] text-fog md:table-cell">
        {project.year}
      </td>
      <td className="px-5 py-4">
        <button
          onClick={togglePublish}
          disabled={busy}
          className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50 ${
            project.published
              ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
              : "border-white/20 text-steel hover:border-white/40"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              project.published ? "bg-emerald-400" : "bg-steel"
            }`}
          />
          {project.published ? "Live" : "Draft"}
        </button>
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex justify-end gap-3">
          <Link
            href={`/admin/projects/${project.id}`}
            className="font-mono text-[10px] uppercase tracking-wider text-fog transition-colors hover:text-paper"
          >
            Edit
          </Link>
          <button
            onClick={remove}
            disabled={busy}
            className="font-mono text-[10px] uppercase tracking-wider text-steel transition-colors hover:text-red-400 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
