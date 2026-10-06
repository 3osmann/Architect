import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-white/10 pb-6">
        <Link
          href="/admin/projects"
          className="admin-label !mb-3 inline-block transition-colors hover:text-paper"
        >
          ← Projects
        </Link>
        <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em] sm:text-5xl">
          New project
        </h1>
      </div>
      <ProjectForm />
    </div>
  );
}
