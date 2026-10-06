import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = "title, location, year, category, ratio, tone, published, sort_order";

/** GET /api/projects — every project (admin). */
export async function GET() {
  const session = await requireSession();
  if (session instanceof Response) return session;
  const rows = await query<Project>(`SELECT * FROM projects ORDER BY sort_order ASC, id ASC`);
  return NextResponse.json({ projects: rows });
}

/** POST /api/projects — create one. */
export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await req.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const rows = await query<Project>(
    `INSERT INTO projects (${COLUMNS})
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      String(body.title),
      String(body.location ?? ""),
      String(body.year ?? ""),
      String(body.category ?? ""),
      String(body.ratio ?? "aspect-[4/5]"),
      String(body.tone ?? "from-zinc-800 via-zinc-700 to-neutral-900"),
      body.published !== false,
      Number(body.sort_order ?? 0),
    ]
  );
  return NextResponse.json({ project: rows[0] }, { status: 201 });
}
