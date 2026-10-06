import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, verifyAdmin, SESSION_COOKIE, expectedOrigin } from "@/lib/auth";

export const runtime = "nodejs";

/** POST /api/auth/login — verifies admin credentials and sets the session cookie. */
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!expectedOrigin(origin, req.headers.get("host"))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const session = await verifyAdmin(email, password);
  if (!session) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken(session);
  const res = NextResponse.json({ ok: true, email: session.email });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
