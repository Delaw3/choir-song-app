import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "choir.session.v1";

/**
 * Next.js 16 Proxy — optimistic route protection (edge).
 *
 * This is a fast pre-check only. Real authentication and authorization are
 * enforced server-side in `src/lib/auth/require.ts` and the MongoDB repos
 * (session validation, role checks, ownership checks). The proxy additionally
 * redirects unauthenticated visitors away from protected page routes.
 *
 * Edge runtime has no `node:crypto`, so the HMAC-signed session token is
 * verified with Web Crypto here. Keep this in sync with
 * `src/lib/auth/session.ts` (token format: base64url(JSON payload) + "." +
 * hex HMAC-SHA256 signature).
 *
 * Mock/demo mode (USE_DB !== "true") skips edge enforcement so local
 * development with the demo accounts keeps working.
 */

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) return null;
    bytes[i / 2] = byte;
  }
  return bytes;
}

async function isSessionTokenValid(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false; // fail closed when unconfigured
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [body, signatureHex] = parts;

  let payload: { expiresAt?: unknown };
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body)));
  } catch {
    return false;
  }
  if (
    typeof payload.expiresAt !== "number" ||
    Date.now() > payload.expiresAt
  ) {
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signature = hexToBytes(signatureHex);
    if (!signature) return false;
    return crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(body),
    );
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (process.env.USE_DB !== "true") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && (await isSessionTokenValid(token))) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    // Admin area
    "/admin",
    "/admin/:path*",
    // Member area (public catalog routes like /songs are excluded)
    "/home",
    "/home/:path*",
    "/wallet",
    "/wallet/:path*",
    "/complaints",
    "/complaints/:path*",
    "/library",
    "/library/:path*",
    "/notifications",
    "/practice/:path*",
    "/profile",
    "/rooms",
    "/rooms/:path*",
  ],
};