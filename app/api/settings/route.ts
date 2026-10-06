import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { setSetting, getAllContent } from "@/lib/content";
import { defaultContent } from "@/lib/defaults";
import type { ContentKey } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS: ContentKey[] = ["hero", "philosophy", "contact", "nav"];

/** GET /api/settings — every content section (admin). */
export async function GET() {
  const session = await requireSession();
  if (session instanceof Response) return session;
  return NextResponse.json({ settings: await getAllContent() });
}

/** PUT /api/settings — upsert one section: { key, value } */
export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await req.json().catch(() => null);
  const key = body?.key as ContentKey;
  if (!KEYS.includes(key)) {
    return NextResponse.json({ error: `key must be one of: ${KEYS.join(", ")}` }, { status: 400 });
  }
  if (!body?.value || typeof body.value !== "object") {
    return NextResponse.json({ error: "value must be an object" }, { status: 400 });
  }

  // Merge over defaults so no required field can be wiped out by a partial payload.
  const merged = { ...defaultContent[key], ...body.value };
  await setSetting(key, merged);
  return NextResponse.json({ ok: true, key, value: merged });
}
