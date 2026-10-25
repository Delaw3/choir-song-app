import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth/session";

/** GET /api/auth/session — returns the current authenticated user from the server-side session. */
export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

/** DELETE /api/auth/session — revokes the server-side session record and clears the cookie (sign out). */
export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
