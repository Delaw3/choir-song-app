import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { mapNotification } from "@/lib/firestore/mappers";
import type { NotificationDoc, WithId } from "@/lib/firestore/types-ledger";

const NOTIFICATIONS = "notifications";
const READS = "notificationReads";

export type NotificationItem = { id: string; title: string; message: string; date: string; read: boolean };

async function getReadIds(userId?: string): Promise<Set<string>> {
  if (!userId) return new Set();
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, READS), where("userId", "==", userId), limit(500)));
  return new Set(snap.docs.map((d) => (d.data() as { notificationId: string }).notificationId));
}

/** Published announcements for the member notifications screen. */
export async function listPublishedNotifications(userId?: string): Promise<NotificationItem[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, NOTIFICATIONS),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(50),
    ),
  );
  const reads = await getReadIds(userId);
  return snap.docs.map((d) => {
    const base = mapNotification({ ...(d.data() as NotificationDoc), id: d.id } as WithId<NotificationDoc>);
    return { ...base, read: reads.has(d.id) };
  });
}
