import "server-only";

import { getMongoDb } from "@/lib/mongodb";

const SESSIONS = "sessions";

export interface SessionDoc {
  _id?: import("mongodb").ObjectId;
  /** Random 32-byte hex session id (the token `jti`). */
  sessionId: string;
  /** User id string this session belongs to. */
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Create a server-side session record. The record is what makes sign-out (and
 * admin revocation) effective before the token's own expiry. A TTL index on
 * `expiresAt` reaps expired records automatically.
 */
export async function createSessionRecord(
  sessionId: string,
  userId: string,
  expiresAt: Date,
): Promise<void> {
  const db = getMongoDb();
  await db
    .collection<SessionDoc>(SESSIONS)
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection<SessionDoc>(SESSIONS).insertOne({
    sessionId,
    userId,
    createdAt: new Date(),
    expiresAt,
  });
}

/** Look up an active session record by its random session id. */
export async function getSessionRecord(
  sessionId: string,
): Promise<SessionDoc | null> {
  const db = getMongoDb();
  return db.collection<SessionDoc>(SESSIONS).findOne({ sessionId });
}

/** Delete a session record (sign-out / revocation). */
export async function deleteSessionRecord(sessionId: string): Promise<void> {
  const db = getMongoDb();
  await db.collection<SessionDoc>(SESSIONS).deleteOne({ sessionId });
}