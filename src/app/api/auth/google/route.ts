import { NextResponse } from "next/server";
import {
  FirebaseAdminNotConfiguredError,
  adminServerTimestamp,
  getAdminAuth,
  getAdminDb,
} from "@/lib/firebase-admin";
import type { UserRole } from "@/lib/firestore/types";

const SESSION_COOKIE = "choir.session.v1";
// Keep in sync with the client `authService` session fallback.
const ADMIN_EMAILS = new Set(
  (process.env.CHOIR_ADMIN_EMAILS ?? "admin@choir.app")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

function inferRole(email: string): UserRole {
  return ADMIN_EMAILS.has(email.trim().toLowerCase()) ? "admin" : "member";
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ code, message }, { status });
}

/**
 * POST /api/auth/google — verifies the Firebase ID token minted by
 * `signInWithPopup`, upserts `users/{uid}`, mints a session cookie, and
 * returns the resolved `AuthUser`.
 *
 * Body: `{ idToken: string }`
 * Success: `{ id, name, email, role, emailVerified }` + `Set-Cookie`.
 */
export async function POST(request: Request) {
  let idToken: string | null = null;
  try {
    const body = (await request.json().catch(() => null)) as { idToken?: unknown } | null;
    idToken = typeof body?.idToken === "string" ? body.idToken : null;
  } catch {
    idToken = null;
  }
  if (!idToken) {
    return errorResponse(400, "missing-id-token", "Provide { idToken } from the Firebase client SDK.");
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const uid = decoded.uid;
    const email = (decoded.email ?? "").toLowerCase();
    if (!email) {
      return errorResponse(400, "email-required", "The Google account must expose an email address.");
    }

    const name =
      (typeof decoded.name === "string" && decoded.name.trim()) ||
      email.split("@")[0] ||
      "Choir Member";
    const emailVerified = Boolean(decoded.email_verified);

    // Upsert the public user doc (doc ID = Auth UID). Role/credit writes stay
    // server-side only — never trust client-supplied roles.
    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();
    const existingData = (existing.data() ?? {}) as { displayName?: unknown; email?: unknown; role?: unknown };
    const wasAdmin = existingData.role === "admin";
    const allowListedAdmin = inferRole(email) === "admin";
    // Preserve an admin role granted via console/claims; never demote here.
    // A brand-new doc for an allow-listed email starts as admin, otherwise member.
    const resolvedRole: UserRole = wasAdmin || allowListedAdmin ? "admin" : "member";

    if (!existing.exists) {
      await userRef.set({
        displayName: name,
        email,
        role: resolvedRole,
        creditBalance: 0,
        status: "active",
        createdAt: adminServerTimestamp(),
        updatedAt: adminServerTimestamp(),
      });
    } else {
      const updates: Record<string, unknown> = { updatedAt: adminServerTimestamp() };
      if (typeof existingData.displayName !== "string") updates.displayName = name;
      if (typeof existingData.email !== "string") updates.email = email;
      // Elevate (never demote) when the allow-list now marks this user admin.
      if (resolvedRole === "admin" && existingData.role !== "admin") updates.role = "admin";
      if (Object.keys(updates).length > 1) {
        await userRef.update(updates);
      } else {
        await userRef.update({ updatedAt: adminServerTimestamp() });
      }
    }

    // Reflect the authoritative claim back so rules can use
    // `request.auth.token.admin == true` immediately on next token refresh.
    if (resolvedRole === "admin") {
      const freshClaims = (await adminAuth.getUser(uid)).customClaims ?? {};
      if (freshClaims.admin !== true) {
        await adminAuth.setCustomUserClaims(uid, { ...freshClaims, admin: true, role: "admin" });
      }
    }

    // 5-day session cookie (httpOnly, Secure in prod, SameSite=Lax).
    const expiresInMs = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: expiresInMs });

    const response = NextResponse.json(
      { id: uid, name, email, role: resolvedRole, emailVerified },
      { status: 200 },
    );
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(expiresInMs / 1000),
    });
    return response;
  } catch (error) {
    if (error instanceof FirebaseAdminNotConfiguredError) {
      return errorResponse(
        503,
        "admin-not-configured",
        "Server auth is not configured. Provide FIREBASE_SERVICE_ACCOUNT_JSON (see .env.example). Client falls back to mock session.",
      );
    }
    const code = typeof (error as { code?: unknown }).code === "string" ? String((error as { code?: string }).code) : "";
    if (code.startsWith("auth/")) {
      return errorResponse(401, code || "auth/invalid-token", "Invalid or expired sign-in token. Please try again.");
    }
    return errorResponse(500, "google-auth-failed", error instanceof Error ? error.message : "Google sign-in failed.");
  }
}
