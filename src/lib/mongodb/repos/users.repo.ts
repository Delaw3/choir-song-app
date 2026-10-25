import "server-only";

import { ObjectId } from "mongodb";
import { requireAdmin, requireSelfOrAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { Member } from "@/types/user";
import type { CreditTransactionDoc, UserDoc, WithId } from "@/lib/mongodb/types";

const USERS = "users";

function toMember(doc: WithId<UserDoc>): Member {
  const initials = (doc.displayName || "Member")
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const joinedAt = doc.createdAt
    ? new Date(doc.createdAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  return {
    id: doc.id,
    name: doc.displayName,
    firstname: doc.displayName.split(" ")[0] || doc.displayName,
    email: doc.email ?? "",
    avatarInitials: initials || "MB",
    creditBalance: doc.creditBalance ?? 0,
    joinedAt,
    status: doc.status ?? "active",
    role: doc.role ?? "member",
  };
}

/** Get a user by MongoDB id. */
export async function getUserById(id: string): Promise<UserDoc | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = getMongoDb();
  return db.collection<UserDoc>(USERS).findOne({ _id: new ObjectId(id) });
}

/** Get a user by email. */
export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  const db = getMongoDb();
  return db.collection<UserDoc>(USERS).findOne({ email: email.toLowerCase() });
}

/** Get a member view by id. */
export async function getMemberById(id: string): Promise<Member | null> {
  // Ownership: members can read their own profile; admins can read any.
  await requireSelfOrAdmin(id);
  const doc = await getUserById(id);
  if (!doc) return null;
  return toMember({ ...doc, id: doc._id!.toString() });
}

/** Create a new user. Returns the inserted id.
 *
 * NOTE: `role` is deliberately NOT accepted in the input.
 * Roles are assigned server-side only by an admin, never by the caller.
 */
export async function createUser(input: {
  displayName: string;
  email: string;
  creditBalance?: number;
}): Promise<string> {
  const db = getMongoDb();
  const now = new Date();
  const result = await db.collection<UserDoc>(USERS).insertOne({
    displayName: input.displayName,
    email: input.email.toLowerCase(),
    role: "member",
    creditBalance: input.creditBalance ?? 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toString();
}

/** Adjust a user's credit balance (server-side, trusted). Returns the new balance. */
export async function adjustCreditBalance(
  userId: string,
  delta: number,
): Promise<number> {
  await requireAdmin(); // Protect this operation with admin privileges
  if (!ObjectId.isValid(userId)) throw new Error("User not found");
  const db = getMongoDb();
  const now = new Date();
  // Atomic, condition-guarded update: deductions can never drive the balance
  // below zero (unauthorized negative balances are impossible).
  const filter =
    delta < 0
      ? { _id: new ObjectId(userId), creditBalance: { $gte: -delta } }
      : { _id: new ObjectId(userId) };
  const updated = await db
    .collection<UserDoc>(USERS)
    .findOneAndUpdate(
      filter,
      { $inc: { creditBalance: delta }, $set: { updatedAt: now } },
      { returnDocument: "after" },
    );
  if (!updated) {
    throw new Error(
      delta < 0 ? "User not found or insufficient credits." : "User not found.",
    );
  }
  // Audit trail: every balance adjustment is recorded in the ledger.
  await db.collection<CreditTransactionDoc>("creditTransactions").insertOne({
    userId,
    type: "adjustment",
    amount: delta,
    status: "completed",
    description: `Admin credit adjustment (${delta >= 0 ? "+" : ""}${delta})`,
    createdAt: now,
  });
  return updated.creditBalance ?? 0;
}

/** List all members (admin view). */
export async function listMembersAdmin(pageSize = 100): Promise<Member[]> {
  await requireAdmin();
  return getLiveMembers(pageSize);
}

/** Get all live members from MongoDB (ordered by newest joined first). */
export async function getLiveMembers(pageSize = 100): Promise<Member[]> {
  const db = getMongoDb();
  const docs = await db
    .collection<UserDoc>(USERS)
    .find({ role: "member" })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();
  return docs.map((d) => toMember({ ...d, id: d._id!.toString() }));
}

/** Update a member's details, credit balance, and status (admin only). */
export async function updateUserAdmin(
  userId: string,
  input: {
    displayName?: string;
    email?: string;
    creditBalance?: number;
    status?: "active" | "suspended" | "pending";
    role?: import("@/lib/mongodb/types").UserRole;
  },
): Promise<Member> {
  await requireAdmin();
  if (!ObjectId.isValid(userId)) throw new Error("Invalid member ID");
  const db = getMongoDb();
  const now = new Date();

  const updateFields: Partial<UserDoc> & { updatedAt: Date } = {
    updatedAt: now,
  };

  if (typeof input.displayName === "string" && input.displayName.trim()) {
    updateFields.displayName = input.displayName.trim();
  }
  if (typeof input.email === "string" && input.email.trim()) {
    updateFields.email = input.email.trim().toLowerCase();
  }
  if (typeof input.creditBalance === "number" && !isNaN(input.creditBalance)) {
    updateFields.creditBalance = Math.max(0, Math.floor(input.creditBalance));
  }
  if (input.status) {
    updateFields.status = input.status;
  }
  if (input.role) {
    updateFields.role = input.role;
  }

  const result = await db.collection<UserDoc>(USERS).findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateFields },
    { returnDocument: "after" },
  );

  if (!result) throw new Error("Member not found");
  return toMember({ ...result, id: result._id!.toString() });
}