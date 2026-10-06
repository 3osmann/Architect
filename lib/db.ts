import { Pool, type QueryResultRow } from "pg";

/**
 * Server-only Postgres pool (Neon via pgBouncer pooler).
 * - Singleton on globalThis so dev hot-reload doesn't leak connections.
 * - `sslmode=require` in the URL → rejectUnauthorized:false (Neon's cert chain).
 */
const globalForPool = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pgPool = pool;

/** Typed query helper. Throws on connection/SQL errors — callers decide fallbacks. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params as never[]);
  return res.rows;
}

/** Lightweight health probe used by the admin dashboard. */
export async function pingDb(): Promise<{ ok: boolean; error?: string; latencyMs?: number }> {
  const started = Date.now();
  try {
    await query("SELECT 1");
    return { ok: true, latencyMs: Date.now() - started };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
