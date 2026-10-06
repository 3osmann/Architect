import { NextRequest, NextResponse } from "next/server";
import { getSession, updateAdminPassword, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

/**
 * PUT /api/account/password — { current, next }
 * Only the signed-in admin can rotate their own password.
 */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const current = String(body?.current ?? "");
  const next = String(body?.next ?? "");
  if (next.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const rows = await query<{ password_hash: string }>(
    "SELECT password_hash FROM admin_users WHERE id = $1",
    [session.sub]
  );
  if (!rows[0] || !verifyPassword(current, rows[0].password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await updateAdminPassword(session.email, next);
  return NextResponse.json({ ok: true });
}
