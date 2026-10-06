import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { query } from "@/lib/db";
import type { Project } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** GET /api/projects/:id */
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (session instanceof Response) return session;
  const rows = await query<Project>("SELECT * FROM projects WHERE id = $1", [params.id]);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: rows[0] });
}

/** PUT /api/projects/:id — partial update (only fields present in the body). */
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const allowed = ["title", "location", "year", "category", "ratio", "tone", "published", "sort_order"] as const;
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const field of allowed) {
    if (field in body) {
      sets.push(`${field} = $${i++}`);
      values.push(
        field === "published" ? Boolean(body[field]) : field === "sort_order" ? Number(body[field]) : String(body[field])
      );
    }
  }
  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  values.push(params.id);
  const rows = await query<Project>(
    `UPDATE projects SET ${sets.join(", ")}, updated_at = now()
     WHERE id = $${i} RETURNING *`,
    values
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project: rows[0] });
}

/** DELETE /api/projects/:id */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (session instanceof Response) return session;
  const rows = await query<Project>("DELETE FROM projects WHERE id = $1 RETURNING id", [params.id]);
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
