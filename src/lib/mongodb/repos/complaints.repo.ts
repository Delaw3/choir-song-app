import "server-only";

import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { Complaint } from "@/types/complaint";
import type { ComplaintDoc, ComplaintReplyDoc } from "@/lib/mongodb/types";

const COMPLAINTS = "complaints";
const REPLIES = "complaintReplies";

function toComplaint(
  doc: ComplaintDoc & { id: string },
  replies: ComplaintReplyDoc[],
): Complaint {
  const adminReply = [...replies]
    .reverse()
    .find((r) => r.authorRole === "admin")?.message;
  const adminTimestamps = replies.filter((r) => r.authorRole === "admin");
  const last = adminTimestamps[adminTimestamps.length - 1];
  return {
    id: doc.id,
    userId: doc.userId ?? "anonymous",
    userName: doc.userName,
    userEmail: doc.userEmail,
    category: doc.category,
    subject: doc.subject,
    message: doc.description,
    status:
      doc.status === "open"
        ? "OPEN"
        : doc.status === "in_review"
          ? "IN_REVIEW"
          : "RESOLVED",
    adminResponse: adminReply,
    respondedAt: last?.createdAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Latest complaints first. Admin view lists all; member view filters by userId. */
export async function listComplaints(
  userId?: string,
  pageSize = 50,
): Promise<Complaint[]> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  if (userId) {
    if (sessionUser.id !== userId && !isAdminRole(sessionUser.role)) {
      throw new Error("Forbidden: you can only view your own complaints.");
    }
  } else if (!isAdminRole(sessionUser.role)) {
    throw new Error("Administrator privileges required to list all complaints.");
  }
  const db = getMongoDb();
  const filter = userId ? { userId } : {};
  const docs = await db
    .collection<ComplaintDoc>(COMPLAINTS)
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();

  const items: Complaint[] = [];
  for (const doc of docs) {
    const replies = await db
      .collection<ComplaintReplyDoc>(REPLIES)
      .find({ complaintId: doc._id!.toString() })
      .sort({ createdAt: 1 })
      .toArray();
    items.push(
      toComplaint({ ...doc, id: doc._id!.toString() }, replies),
    );
  }
  return items;
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  if (!ObjectId.isValid(id)) return null;
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  const db = getMongoDb();
  const doc = await db
    .collection<ComplaintDoc>(COMPLAINTS)
    .findOne({ _id: new ObjectId(id) });

  if (!doc) return null;
  // Ownership: members can only read their own complaints; anonymous
  // complaints (no userId) are admin-only.
  const isOwner = doc.userId !== null && doc.userId === sessionUser.id;
  if (!isOwner && !isAdminRole(sessionUser.role)) {
    throw new Error("Forbidden: you can only view your own complaints.");
  }

  const replies = await db
    .collection<ComplaintReplyDoc>(REPLIES)
    .find({ complaintId: doc._id!.toString() })
    .sort({ createdAt: 1 })
    .toArray();

  return toComplaint({ ...doc, id: doc._id!.toString() }, replies);
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
 * Pre-auth: creates an `open` complaint.
 *
 * Authenticated users are always bound to their own account — caller-supplied
 * identity fields are ignored. Anonymous (pre-auth) complaints remain allowed
 * by design and carry no userId.
 */
export async function createComplaint(input: CreateComplaintFsInput): Promise<string> {
  const sessionUser = await getSessionUser();
  const userId = sessionUser?.id ?? null;
  const userName = sessionUser?.name ?? input.userName;
  const userEmail = sessionUser?.email ?? input.userEmail;
  const db = getMongoDb();
  const now = new Date();
  const result = await db.collection<ComplaintDoc>(COMPLAINTS).insertOne({
    userId,
    userName,
    userEmail,
    subject: input.subject.trim(),
    category: input.category,
    description: input.description.trim(),
    status: "open",
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toString();
}

/** Member follow-up message on their own thread. */
export async function addComplaintReply(
  complaintId: string,
  input: { message: string },
): Promise<string> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  const db = getMongoDb();
  const complaint = await db
    .collection<ComplaintDoc>(COMPLAINTS)
    .findOne({ _id: new ObjectId(complaintId) });
  if (!complaint) throw new Error("Complaint not found.");
  // Only the complaint owner (member follow-up) or an admin (official reply)
  // may reply; the author role and name are derived from the session.
  const isOwner = complaint.userId !== null && complaint.userId === sessionUser.id;
  if (!isOwner && !isAdminRole(sessionUser.role)) {
    throw new Error("Forbidden: you can only reply to your own complaints.");
  }
  const isAdmin = isAdminRole(sessionUser.role);
  const result = await db.collection<ComplaintReplyDoc>(REPLIES).insertOne({
    complaintId,
    authorRole: isAdmin ? "admin" : "member",
    authorName: sessionUser.name,
    message: input.message.trim(),
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}