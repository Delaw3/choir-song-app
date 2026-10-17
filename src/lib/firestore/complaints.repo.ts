import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { mapComplaint, timestampToIso } from "@/lib/firestore/mappers";
import type { Complaint } from "@/types/complaint";
import type {
  ComplaintDoc,
  ComplaintReplyDoc,
} from "@/lib/firestore/types-ledger";

const COMPLAINTS = "complaints";

function toComplaint(
  snap: { id: string; data: () => ComplaintDoc },
  replies: ComplaintReplyDoc[],
): Complaint {
  const data = snap.data();
  const adminReply = [...replies]
    .reverse()
    .find((r) => r.authorRole === "admin")?.message;
  const mapped = mapComplaint({ ...data, id: snap.id }, adminReply);
  const adminTimestamps = replies.filter((r) => r.authorRole === "admin");
  const last = adminTimestamps[adminTimestamps.length - 1];
  return { ...mapped, respondedAt: timestampToIso(last?.createdAt) };
}

async function getReplies(complaintId: string): Promise<ComplaintReplyDoc[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, COMPLAINTS, complaintId, "replies"), orderBy("createdAt")),
  );
  return snap.docs.map((d) => d.data() as ComplaintReplyDoc);
}

/** Latest complaints first. Admin view lists all; member view filters by userId. */
export async function listComplaints(userId?: string, pageSize = 50): Promise<Complaint[]> {
  const db = getFirebaseDb();
  const snap = userId
    ? await getDocs(
        query(
          collection(db, COMPLAINTS),
          where("userId", "==", userId),
          orderBy("createdAt", "desc"),
          limit(pageSize),
        ),
      )
    : await getDocs(query(collection(db, COMPLAINTS), orderBy("createdAt", "desc"), limit(pageSize)));
  const items: Complaint[] = [];
  for (const d of snap.docs) {
    const replies = await getReplies(d.id);
    const data = { id: d.id, data: () => d.data() as ComplaintDoc };
    items.push(toComplaint(data, replies));
  }
  return items;
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, COMPLAINTS, id));
  if (!snap.exists()) return null;
  const replies = await getReplies(id);
  return toComplaint({ id: snap.id, data: () => snap.data() as ComplaintDoc }, replies);
}

export type CreateComplaintFsInput = {
  userId?: string | null;
  userName: string;
  userEmail: string;
  subject: string;
  category: ComplaintDoc["category"];
  description: string;
};

/**
 * Pre-auth: creates an `open` complaint. Members may create; only the
 * trusted backend / admin SDK may change status or append admin replies
 * once authentication lands (enforced by Firestore rules).
 */
export async function createComplaint(input: CreateComplaintFsInput): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, COMPLAINTS), {
    userId: input.userId ?? null,
    userName: input.userName,
    userEmail: input.userEmail,
    subject: input.subject.trim(),
    category: input.category,
    description: input.description.trim(),
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Member follow-up message on their own thread (pre-auth: any open thread). */
export async function addComplaintReply(
  complaintId: string,
  input: { authorName: string; message: string },
): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, COMPLAINTS, complaintId, "replies"), {
    authorRole: "member",
    authorName: input.authorName,
    message: input.message.trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
