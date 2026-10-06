import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import ProjectRow from "@/components/admin/ProjectRow";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="admin-label !mb-2">02 — Portfolio</span>
          <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em] sm:text-5xl">
            Projects
          </h1>
        </div>
        <Link href="/admin/projects/new" className="admin-btn-solid">
          + New project
        </Link>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-brutal text-steel">
                #
              </th>
              <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-brutal text-steel">
                Project
              </th>
              <th className="hidden px-5 py-3 font-mono text-[9px] uppercase tracking-brutal text-steel sm:table-cell">
                Location
              </th>
              <th className="hidden px-5 py-3 font-mono text-[9px] uppercase tracking-brutal text-steel md:table-cell">
                Year
              </th>
              <th className="px-5 py-3 font-mono text-[9px] uppercase tracking-brutal text-steel">
                Status
              </th>
              <th className="px-5 py-3 text-right font-mono text-[9px] uppercase tracking-brutal text-steel">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </tbody>
        </table>

        {projects.length === 0 && (
          <div className="px-5 py-16 text-center">
            <p className="admin-label">No projects</p>
            <p className="mt-2 text-sm text-steel">
              Create your first project to populate the gallery.
            </p>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-steel">
        Tip: <span className="text-fog">Status</span> toggles whether a project is visible on the
        public site — drafts stay in the admin only.
      </p>
    </div>
  );
}
