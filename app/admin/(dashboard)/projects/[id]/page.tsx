import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import ProjectForm from "@/components/admin/ProjectForm";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const rows = await query<Project>("SELECT * FROM projects WHERE id = $1", [params.id]);
  const project = rows[0];
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-white/10 pb-6">
        <Link
          href="/admin/projects"
          className="admin-label !mb-3 inline-block transition-colors hover:text-paper"
        >
          ← Projects
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="admin-label !mb-2">
              {project.published ? "Live" : "Draft"} · ID {project.id}
            </span>
            <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em] sm:text-5xl">
              {project.title}
            </h1>
          </div>
        </div>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
