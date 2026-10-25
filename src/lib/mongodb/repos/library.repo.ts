import "server-only";

import { getMongoDb } from "@/lib/mongodb";
import { requireSelfOrAdmin } from "@/lib/auth/require";
import type { LibraryItemDoc, WithId } from "@/lib/mongodb/types";

const LIBRARY = "userLibraries";

export type LibraryItem = {
  id: string;
  userId: string;
  songId: string;
  saved: boolean;
  createdAt: string;
  updatedAt: string;
};

function toLibraryItem(doc: WithId<LibraryItemDoc>): LibraryItem {
  return {
    id: doc.id,
    userId: doc.userId,
    songId: doc.songId,
    saved: doc.saved,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** List library items for a user. */
export async function getLibraryItems(userId: string): Promise<LibraryItem[]> {
  // Ownership: users can only list their own library; admins can list any.
  await requireSelfOrAdmin(userId);
  const db = getMongoDb();
  const docs = await db
    .collection<LibraryItemDoc>(LIBRARY)
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map((d) => toLibraryItem({ ...d, id: d._id!.toString() }));
}

/** Get a single library item. */
export async function getLibraryItem(
  userId: string,
  songId: string,
): Promise<LibraryItem | null> {
  // Ownership: users can only read their own library items; admins can read any.
  await requireSelfOrAdmin(userId);
  const db = getMongoDb();
  const doc = await db.collection<LibraryItemDoc>(LIBRARY).findOne({
    userId,
    songId,
  });
  if (!doc) return null;
  return toLibraryItem({ ...doc, id: doc._id!.toString() });
}

/** Save (or unsave) a song for a user. Upsert-based. */
export async function saveSong(
  userId: string,
  songId: string,
  saved: boolean,
): Promise<void> {
  // Ownership: users can only modify their own library; admins may assist.
  await requireSelfOrAdmin(userId);
  const db = getMongoDb();
  const now = new Date();
  await db.collection<LibraryItemDoc>(LIBRARY).updateOne(
    { userId, songId },
    {
      $set: { saved, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

/** Check whether a song is saved for a user. */
export async function isSongSaved(userId: string, songId: string): Promise<boolean> {
  const item = await getLibraryItem(userId, songId);
  return item?.saved ?? false;
}