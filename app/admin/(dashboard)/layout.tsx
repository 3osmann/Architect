import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { pingDb } from "@/lib/db";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

/**
 * Shell for every signed-in admin page.
 * Middleware already guards /admin — this layout re-checks as defence in depth
 * (cookies() are available here, middleware runs at the edge).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const db = await pingDb();

  return (
    <div className="min-h-screen bg-ink text-paper">
      <AdminNav
        email={session.email}
        dbOk={db.ok}
        dbLatency={db.latencyMs}
        dbError={db.error}
      />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
