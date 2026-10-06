import Link from "next/link";
import { getAllContent, getAllProjects } from "@/lib/content";
import { pingDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="admin-card p-5">
      <p className="admin-label !mb-4">{label}</p>
      <p className="text-4xl font-semibold tracking-[-0.03em]">{value}</p>
      {hint && <p className="mt-2 font-mono text-[10px] text-steel">{hint}</p>}
    </div>
  );
}

export default async function AdminOverview() {
  const [projects, content, db] = await Promise.all([getAllProjects(), getAllContent(), pingDb()]);

  const published = projects.filter((p) => p.published).length;
  const drafts = projects.length - published;
  const recent = projects.slice(-5).reverse();
  const sections: { key: keyof typeof content; label: string }[] = [
    { key: "hero", label: "Hero" },
    { key: "philosophy", label: "Philosophy" },
    { key: "contact", label: "Contact" },
    { key: "nav", label: "Navigation" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="admin-label !mb-2">Control room</span>
          <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em] sm:text-5xl">
            Overview
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/content" className="admin-btn">
            Edit content
          </Link>
          <Link href="/admin/projects/new" className="admin-btn-solid">
            + New project
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Projects" value={String(projects.length).padStart(2, "0")} hint="All time" />
        <Stat label="Published" value={String(published).padStart(2, "0")} hint="Live on site" />
        <Stat label="Drafts" value={String(drafts).padStart(2, "0")} hint="Hidden" />
        <Stat
          label="Database"
          value={db.ok ? "ON" : "OFF"}
          hint={db.ok ? `Neon · ${db.latencyMs}ms` : "Fallback content active"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <div className="admin-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="admin-label !mb-0">Recent projects</span>
            <Link
              href="/admin/projects"
              className="font-mono text-[10px] uppercase tracking-wider text-steel transition-colors hover:text-paper"
            >
              All →
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-steel">No projects yet.</p>
          ) : (
            <ul>
              {recent.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-3.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="truncate font-mono text-[10px] uppercase tracking-wider text-steel">
                      {p.location} · {p.year}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`font-mono text-[9px] uppercase tracking-wider ${
                        p.published ? "text-emerald-400" : "text-steel"
                      }`}
                    >
                      {p.published ? "Live" : "Draft"}
                    </span>
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="font-mono text-[10px] uppercase tracking-wider text-fog transition-colors hover:text-paper"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Content sections */}
        <div className="admin-card">
          <div className="border-b border-white/10 px-5 py-4">
            <span className="admin-label !mb-0">Site content</span>
          </div>
          <ul>
            {sections.map((s) => (
              <li key={s.key} className="border-b border-white/5 last:border-b-0">
                <Link
                  href={`/admin/content?section=${s.key}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/5"
                >
                  <span className="text-sm">{s.label}</span>
                  <span className="font-mono text-[10px] text-steel">Edit →</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 px-5 py-4">
            <p className="font-mono text-[10px] leading-relaxed text-steel">
              Changes appear instantly on the public site — every page render reads from
              Postgres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
