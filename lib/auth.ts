import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { query } from "./db";

export const SESSION_COOKIE = "am_session";
const SESSION_DAYS = 7;

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me"
);

/* ------------------------------------------------------------------
   Password hashing — scrypt (built into Node, no native deps)
------------------------------------------------------------------ */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ------------------------------------------------------------------
   Session — signed JWT stored in an httpOnly cookie
------------------------------------------------------------------ */
export type Session = { sub: string; email: string };

export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/** Reads the session cookie in Server Components / Route Handlers. */
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Guard for API route handlers — returns the session or a 401 Response. */
export async function requireSession(): Promise<Session | Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return session;
}

/* ------------------------------------------------------------------
   Admin account (stored in `admin_users`)
------------------------------------------------------------------ */
export async function verifyAdmin(email: string, password: string): Promise<Session | null> {
  const rows = await query<{ id: number; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM admin_users WHERE lower(email) = lower($1) LIMIT 1",
    [email]
  );
  const admin = rows[0];
  if (!admin || !verifyPassword(password, admin.password_hash)) return null;
  return { sub: String(admin.id), email: admin.email };
}

export async function updateAdminPassword(email: string, password: string): Promise<void> {
  await query("UPDATE admin_users SET password_hash = $1 WHERE lower(email) = lower($2)", [
    hashPassword(password),
    email,
  ]);
}

/** Constant-time-ish CSRF defence for state-changing APIs (same-origin token). */
export function expectedOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return true; // non-browser client (curl/tests)
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
