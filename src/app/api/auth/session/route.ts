import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FirebaseAdminNotConfiguredError, getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/firestore/types";

const SESSION_COOKIE = "choir.session.v1";

/** GET /api/auth/session — resolves the session cookie to the `AuthUser`. */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const db = getAdminDb();
    const snap = await db.collection("users").doc(uid).get();
    const data = snap.data() ?? {};
    const email = typeof data.email === "string" ? data.email : (decoded.email ?? "");
    return NextResponse.json(
      {
        user: {
          id: uid,
          name: typeof data.displayName === "string" ? data.displayName : (email.split("@")[0] ?? "Choir Member"),
          email,
          role: (data.role === "admin" ? "admin" : "member") as UserRole,
          emailVerified: Boolean(decoded.email_verified),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof FirebaseAdminNotConfiguredError) {
      return NextResponse.json({ user: null, code: "admin-not-configured" }, { status: 200 });
    }
    // Expired/revoked cookie — treat as signed out, clear it.
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }
}

/** DELETE /api/auth/session — revokes the session cookie (sign out). */
export async function DELETE() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  try {
    if (sessionCookie) {
      const adminAuth = getAdminAuth();
      const decoded = await adminAuth.verifySessionCookie(sessionCookie).catch(() => null);
      if (decoded) {
        await adminAuth.revokeRefreshTokens(decoded.uid).catch(() => undefined);
      }
    }
  } catch {
    // Sign-out must never fail because the server is unconfigured.
  }
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
