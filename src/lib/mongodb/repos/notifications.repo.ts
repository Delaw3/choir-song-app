import "server-only";

import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { NotificationDoc } from "@/lib/mongodb/types";

const NOTIFICATIONS = "notifications";
const READS = "notificationReads";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

async function getReadIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const db = getMongoDb();
  const snap = await db
    .collection<{ userId: string; notificationId: string }>(READS)
    .find({ userId })
    .limit(500)
    .toArray();
  return new Set(snap.map((d) => d.notificationId));
}

/** Published announcements for the member notifications screen. */
export async function listPublishedNotifications(
  userId?: string,
): Promise<NotificationItem[]> {
  // Read receipts are private: a `userId` may only be supplied for the
  // session user (or by an admin). Without a userId the published list is
  // returned without read state.
  const sessionUser = await getSessionUser();
  let readUserId: string | undefined;
  if (userId) {
    if (!sessionUser) throw new Error("Authentication required.");
    if (sessionUser.id !== userId && !isAdminRole(sessionUser.role)) {
      throw new Error("Forbidden: you can only view your own notifications.");
    }
    readUserId = userId;
  } else {
    readUserId = sessionUser?.id;
  }
  const db = getMongoDb();
  const docs = await db
    .collection<NotificationDoc>(NOTIFICATIONS)
    .find({ published: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const reads = await getReadIds(readUserId);
  return docs.map((d) => ({
    id: d._id!.toString(),
    title: d.title,
    message: d.message,
    date: d.createdAt.toISOString(),
    read: reads.has(d._id!.toString()),
  }));
}