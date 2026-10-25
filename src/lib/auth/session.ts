import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/mongodb/repos/users.repo";
import {
  createSessionRecord,
  deleteSessionRecord,
  getSessionRecord,
} from "@/lib/mongodb/repos/sessions.repo";
import type { UserDoc, UserRole } from "@/lib/mongodb/types";

const SESSION_COOKIE = "choir.session.v1";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSigningKey(): string {
  const key = process.env.SESSION_SECRET;
  if (!key) {
    throw new Error(
      "SESSION_SECRET environment variable is required for server-side sessions.",
    );
  }
  return key;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSigningKey()).update(payload).digest("hex");
}

function verifySignature(payload: string, signature: string): boolean {
  const expected = signPayload(payload);
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  // timingSafeEqual throws on length mismatch — guard first so forged cookies
  // produce a clean "invalid session" instead of a 500.
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  creditBalance?: number;
}

interface SessionPayload {
  sessionId: string;
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

/** Build the signed session token (base64url payload + HMAC-SHA256 signature). */
export function createSessionToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signPayload(body);
  return `${body}.${sig}`;
}

/** Verify and decode a session token. Returns null when the signature is
 *  invalid, the token is malformed, or the token has expired. */
export function verifySessionToken(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (!verifySignature(body, sig)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      !payload.sessionId ||
      !payload.userId ||
      !payload.issuedAt ||
      !payload.expiresAt
    ) {
      return null;
    }
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Create a signed, revocable session for the given user. Server-side only.
 *  A random 32-byte session id is stored server-side so sign-out (or an
 *  admin) can revoke the session before the token's own expiry. A fresh
 *  session id is minted on every sign-in (session-fixation protection). */
export async function createSession(user: UserDoc): Promise<void> {
  const now = Date.now();
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = now + SESSION_TTL_MS;
  const userId = user._id!.toString();
  await createSessionRecord(sessionId, userId, new Date(expiresAt));
  const token = createSessionToken({
    sessionId,
    userId,
    issuedAt: now,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/** Validate the current session cookie and return the session user.
 *  Rejects missing, malformed, expired, signature-invalid, or revoked
 *  (server-side deleted) sessions, and suspended/deleted users. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  // Server-side revocation check: the session record must still exist and
  // belong to the same user.
  const record = await getSessionRecord(payload.sessionId);
  if (!record || record.userId !== payload.userId) return null;
  if (record.expiresAt.getTime() <= Date.now()) {
    await deleteSessionRecord(payload.sessionId).catch(() => undefined);
    return null;
  }

  const user = await getUserById(payload.userId);
  if (!user || user.status !== "active") return null;

  return {
    id: user._id!.toString(),
    name: user.displayName,
    email: user.email ?? "",
    role: user.role,
    emailVerified: user.emailVerified ?? false,
    creditBalance: user.creditBalance ?? 0,
  };
}

/** Destroy the current session: revoke the server-side record and clear the
 *  cookie. Server-side only. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = token ? verifySessionToken(token) : null;
  if (payload) {
    await deleteSessionRecord(payload.sessionId).catch(() => undefined);
  }
  cookieStore.delete(SESSION_COOKIE);
}

/** Check whether a valid session exists without returning user data. */
export async function hasSession(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}
