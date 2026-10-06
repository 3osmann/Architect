"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { n: "01", label: "Overview", href: "/admin" },
  { n: "02", label: "Projects", href: "/admin/projects" },
  { n: "03", label: "Content", href: "/admin/content" },
  { n: "04", label: "Account", href: "/admin/account" },
];

type Props = {
  email: string;
  dbOk: boolean;
  dbLatency?: number;
  dbError?: string;
};

/** Sidebar navigation — active state derived from the current pathname. */
export default function AdminNav({ email, dbOk, dbLatency, dbError }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between border-r border-white/10 bg-carbon/50 py-7 lg:flex">
        <div>
          <Link href="/admin" className="block px-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-paper">Atelier</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-brutal text-steel">
              Monolith / Admin
            </p>
          </Link>

          <nav className="mt-10 flex flex-col">
            {ITEMS.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${active ? "admin-nav-item-active" : ""}`}
                >
                  <span className="text-[9px] text-steel">{item.n}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4">
          <div className="mb-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${dbOk ? "bg-emerald-400" : "bg-red-500"}`}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-steel">
                {dbOk ? `Postgres ${dbLatency ?? 0}ms` : "DB offline"}
              </span>
            </div>
            {dbError && (
              <p className="mt-2 break-words font-mono text-[9px] leading-relaxed text-red-400/80">
                {dbError.slice(0, 90)}
              </p>
            )}
            <p className="mt-3 truncate font-mono text-[10px] text-fog" title={email}>
              {email}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/" target="_blank" className="admin-btn w-full">
              View site ↗
            </Link>
            <button onClick={logout} className="admin-btn w-full">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.25em]">
            Monolith / Admin
          </Link>
          <div className="flex items-center gap-3">
            <span
              className={`h-1.5 w-1.5 rounded-full ${dbOk ? "bg-emerald-400" : "bg-red-500"}`}
            />
            <button onClick={logout} className="font-mono text-[10px] uppercase tracking-wider text-steel">
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex overflow-x-auto border-t border-white/10">
          {ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border-b-2 px-4 py-3 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  active ? "border-paper text-paper" : "border-transparent text-steel"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
