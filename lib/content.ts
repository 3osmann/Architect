import "server-only";
import { query } from "./db";
import { defaultContent, defaultProjects } from "./defaults";
import type { ContentKey, Project, SiteContent } from "./types";

/**
 * Reads one settings key (`hero` | `philosophy` | `contact` | `nav`).
 * Merges over the built-in defaults so a missing/partial row never breaks the page.
 */
export async function getSetting<K extends ContentKey>(key: K): Promise<SiteContent[K]> {
  try {
    const rows = await query<{ value: SiteContent[K] }>(
      "SELECT value FROM settings WHERE key = $1 LIMIT 1",
      [key]
    );
    const stored = rows[0]?.value;
    if (!stored) return defaultContent[key];
    // Shallow + array merge keeps newly added default fields visible after upgrades.
    const base = defaultContent[key] as Record<string, unknown>;
    const value = stored as unknown as Record<string, unknown>;
    return { ...base, ...value } as SiteContent[K];
  } catch (e) {
    console.error(`[content] settings "${key}" fallback:`, e instanceof Error ? e.message : e);
    return defaultContent[key];
  }
}

/** Full content bundle for a page render. */
export async function getAllContent(): Promise<SiteContent> {
  try {
    const rows = await query<{ key: ContentKey; value: unknown }>(
      "SELECT key, value FROM settings"
    );
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return Object.fromEntries(
      (Object.keys(defaultContent) as ContentKey[]).map((key) => {
        const stored = map.get(key) as Record<string, unknown> | undefined;
        const base = defaultContent[key] as unknown as Record<string, unknown>;
        return [key, stored ? { ...base, ...stored } : base];
      })
    ) as SiteContent;
  } catch (e) {
    console.error("[content] getAllContent fallback:", e instanceof Error ? e.message : e);
    return defaultContent;
  }
}

/** Published projects for the public gallery. */
export async function getPublishedProjects(): Promise<Project[]> {
  try {
    return await query<Project>(
      "SELECT * FROM projects WHERE published = true ORDER BY sort_order ASC, id ASC"
    );
  } catch (e) {
    console.error("[content] projects fallback:", e instanceof Error ? e.message : e);
    return defaultProjects.map((p, i) => ({ ...p, id: i + 1 }));
  }
}

/** All projects (including drafts) for the admin. */
export async function getAllProjects(): Promise<Project[]> {
  return query<Project>("SELECT * FROM projects ORDER BY sort_order ASC, id ASC");
}

/** Write a settings key (upsert). */
export async function setSetting(key: ContentKey, value: unknown): Promise<void> {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}
