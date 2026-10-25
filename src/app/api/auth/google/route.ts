import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/mongodb/types";
import { MongoClient } from "mongodb";

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
 * POST /api/auth/google — placeholder stub.
 *
 * Firebase Auth has been removed from this app. Google ID-token verification
 * and session-cookie minting via Firebase Admin SDK are no longer available.
 *
 * To restore real Google OAuth, implement your own provider (NextAuth.js,
 * Lucia, or similar) and replace this route handler. For now, this endpoint
 * returns 503 so callers fall back to the mock auth service.
 */
export async function POST() {
  return errorResponse(
    503,
    "auth-not-configured",
    "Google OAuth is not configured. Firebase Auth has been removed from this app.",
  );
}
