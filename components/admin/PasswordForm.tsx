"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setStatus({ kind: "err", msg: "New passwords do not match" });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json().catch(() => ({}));
      setStatus(
        res.ok
          ? { kind: "ok", msg: "Password updated" }
          : { kind: "err", msg: data.error || "Update failed" }
      );
      if (res.ok) {
        setCurrent("");
        setNext("");
        setConfirm("");
      }
    } catch {
      setStatus({ kind: "err", msg: "Network error" });
    }
    setBusy(false);
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="admin-card flex flex-col gap-5 p-5 sm:p-6">
        <span className="admin-label">Change password</span>
        <div>
          <label className="admin-label" htmlFor="a-current">
            Current password
          </label>
          <input
            id="a-current"
            type="password"
            required
            autoComplete="current-password"
            className="admin-input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="a-next">
            New password (min. 8 characters)
          </label>
          <input
            id="a-next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="admin-input"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="a-confirm">
            Confirm new password
          </label>
          <input
            id="a-confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="admin-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <AnimatePresence>
          {status && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`border-l-2 pl-3 font-mono text-[11px] uppercase tracking-wider ${
                status.kind === "ok"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-red-500 text-red-400"
              }`}
            >
              {status.msg}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={busy} className="admin-btn-solid mt-1 py-3">
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>

      <div className="admin-card flex flex-col gap-5 p-5 sm:p-6">
        <span className="admin-label">Session</span>
        <div>
          <p className="text-sm text-fog">Signed in as</p>
          <p className="mt-1 font-mono text-sm text-paper">{email}</p>
        </div>
        <div>
          <p className="text-sm text-fog">Role</p>
          <p className="mt-1 font-mono text-sm text-paper">Administrator — full access</p>
        </div>
        <div>
          <p className="text-sm text-fog">Session length</p>
          <p className="mt-1 font-mono text-sm text-paper">7 days (httpOnly cookie)</p>
        </div>
        <button onClick={logout} className="admin-btn mt-auto py-3">
          Sign out →
        </button>
      </div>
    </div>
  );
}
