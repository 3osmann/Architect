import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PasswordForm from "@/components/admin/PasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-white/10 pb-6">
        <span className="admin-label !mb-2">04 — Account</span>
        <h1 className="text-4xl font-semibold uppercase tracking-[-0.03em] sm:text-5xl">
          Account
        </h1>
      </div>

      <PasswordForm email={session.email} />
    </div>
  );
}
