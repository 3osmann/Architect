"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed");
        setBusy(false);
        return;
      }
      // Only allow same-site relative redirects
      router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Network error — try again");
      setBusy(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md border border-white/10 bg-carbon/80 p-8 sm:p-10"
    >
      <div className="mb-8 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-brutal text-steel">Atelier</span>
        <span className="font-mono text-[10px] uppercase tracking-brutal text-paper">Monolith</span>
      </div>

      <h1 className="text-3xl font-semibold uppercase tracking-[-0.02em]">Control Room</h1>
      <p className="mt-2 text-sm text-steel">Studio administration — restricted access.</p>

      <div className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="admin-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@monolith.studio"
            className="admin-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="admin-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="admin-input"
          />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-5 border-l-2 border-red-500 pl-3 font-mono text-[11px] uppercase tracking-wider text-red-400"
        >
          {error}
        </motion.p>
      )}

      <button type="submit" disabled={busy} className="admin-btn-solid mt-8 w-full py-3">
        {busy ? "Signing in…" : "Sign in →"}
      </button>

      <a
        href="/"
        className="mt-6 block text-center font-mono text-[10px] uppercase tracking-brutal text-steel transition-colors hover:text-paper"
      >
        ← Back to website
      </a>
    </motion.form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5">
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,10,10,0.9)_100%)]" />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
