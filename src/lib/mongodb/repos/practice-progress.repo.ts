import "server-only";

import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole, requireSelfOrAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { PracticeProgressDoc, WithId } from "@/lib/mongodb/types";

const PROGRESS = "practiceProgress";

export type PracticeProgress = {
  id: string;
  userId: string;
  songId: string;
  partId: string;
  status: "not-started" | "in-progress" | "completed";
  lastPracticedAt?: string;
  playCount: number;
  updatedAt: string;
};

function toPracticeProgress(doc: WithId<PracticeProgressDoc>): PracticeProgress {
  return {
    id: doc.id,
    userId: doc.userId,
    songId: doc.songId,
    partId: doc.partId,
    status: doc.status,
    lastPracticedAt: doc.lastPracticedAt?.toISOString(),
    playCount: doc.playCount,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Get practice progress for a specific user/song/part. */
export async function getPracticeProgress(
  userId: string,
  songId: string,
  partId: string,
): Promise<PracticeProgress | null> {
  // Ownership: users can only read their own progress; admins can read any.
  await requireSelfOrAdmin(userId);
  const db = getMongoDb();
  const doc = await db.collection<PracticeProgressDoc>(PROGRESS).findOne({
    userId,
    songId,
    partId,
  });
  if (!doc) return null;
  return toPracticeProgress({ ...doc, id: doc._id!.toString() });
}

/** Upsert practice progress. */
export async function upsertPracticeProgress(input: {
  userId: string;
  songId: string;
  partId: string;
  status: "not-started" | "in-progress" | "completed";
  playCount?: number;
}): Promise<PracticeProgress> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  // Users can only record progress for themselves; admins may record on
  // behalf of a member. Never trust a caller-supplied userId for members.
  if (sessionUser.id !== input.userId && !isAdminRole(sessionUser.role)) {
    throw new Error("Forbidden: you can only record your own practice progress.");
  }
  const db = getMongoDb();
  const now = new Date();
  const doc = await db.collection<PracticeProgressDoc>(PROGRESS).findOneAndUpdate(
    { userId: input.userId, songId: input.songId, partId: input.partId },
    {
      $set: {
        status: input.status,
        updatedAt: now,
        ...(input.playCount !== undefined ? { playCount: input.playCount } : {}),
        ...(input.status === "in-progress" || input.status === "completed"
          ? { lastPracticedAt: now }
          : {}),
      },
      $setOnInsert: {
        userId: input.userId,
        songId: input.songId,
        partId: input.partId,
        playCount: 0,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (!doc) throw new Error("Failed to upsert practice progress");
  return toPracticeProgress({ ...doc, id: doc._id!.toString() });
}

/** List practice progress for a user (all songs/parts). */
export async function listPracticeProgressForUser(
  userId: string,
): Promise<PracticeProgress[]> {
  // Ownership: users can only list their own progress; admins can list any.
  await requireSelfOrAdmin(userId);
  const db = getMongoDb();
  const docs = await db
    .collection<PracticeProgressDoc>(PROGRESS)
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map((d) => toPracticeProgress({ ...d, id: d._id!.toString() }));
}