import { NextResponse, type NextRequest } from "next/server";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me";

/**
 * Edge middleware guarding every /admin route except the login page.
 * JWT (HS256) is verified with Web Crypto — no Node APIs, no jose in edge.
 * The same check is repeated server-side in the dashboard layout + API routes.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("am_session")?.value;
  const valid = token ? await isValid(token) : false;

  if (pathname === "/admin/login") {
    // Already signed in? Skip the login screen.
    return valid ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }

  if (!valid) {
    const login = new URL("/admin/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

const b64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function isValid(token: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signature = b64url(parts[2]);
    const signed = encoder.encode(`${parts[0]}.${parts[1]}`);
    const ok = await crypto.subtle.verify("HMAC", key, signature, signed);
    if (!ok) return false;

    const payload = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const config = {
  // Run on /admin and everything below it, never on the public site or APIs.
  matcher: ["/admin/:path*"],
};
