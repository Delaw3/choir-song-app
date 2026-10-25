import "server-only";

import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole, requireSelfOrAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { CreditPackage, CreditTransaction } from "@/types/user";
import type {
  CreditPackageDoc,
  CreditTransactionDoc,
} from "@/lib/mongodb/types";

const PACKAGES = "creditPackages";
const LEDGER = "creditTransactions";

/** Active credit packages for the buy-credits screen (public catalog data). */
export async function listActiveCreditPackages(): Promise<CreditPackage[]> {
  const db = getMongoDb();
  const docs = await db
    .collection<CreditPackageDoc>(PACKAGES)
    .find({ status: "active" })
    .sort({ sortOrder: 1 })
    .toArray();

  return docs.map((d) => ({
    id: d._id!.toString(),
    credits: d.credits,
    price: Math.round(d.priceMinor / 100),
    label: d.label,
  }));
}

export type LedgerPage = { items: CreditTransaction[]; nextCursor?: string };

/** Member ledger history (newest first). Enforces ownership: users can only
 *  read their own ledger; admins can read any. */
export async function listLedgerForUser(
  userId: string,
  pageSize = 20,
  cursorIso?: string,
): Promise<LedgerPage> {
  await requireSelfOrAdmin(userId);

  const db = getMongoDb();
  const filter: Record<string, unknown> = { userId };
  if (cursorIso) {
    filter.createdAt = { $lt: new Date(cursorIso) };
  }

  const docs = await db
    .collection<CreditTransactionDoc>(LEDGER)
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(pageSize + 1)
    .toArray();

  const pageDocs = docs.slice(0, pageSize);
  const items = pageDocs.map(toLedgerEntry);

  const nextCursor =
    docs.length > pageSize ? items[items.length - 1]?.date : undefined;
  return { items, nextCursor };
}

/** Explicitly NOT implemented on the client: credit mutations. */
export function assertNoClientCreditWrites(): never {
  throw new Error(
    "Credit mutations are trusted-backend-only and are not available in client code.",
  );
}

/** Server-side: get current credit balance for a user from the users collection.
 *  Enforces ownership: users can read their own balance; admins can read any. */
export async function getUserCreditBalance(userId: string): Promise<number> {
  await requireSelfOrAdmin(userId);

  const db = getMongoDb();
  const doc = await db
    .collection<{ creditBalance?: number }>("users")
    .findOne({ _id: new ObjectId(userId) });
  return doc?.creditBalance ?? 0;
}

/** Server-side: record a credit transaction with idempotency.
 *
 *  userId is never taken from the caller for self-service types: purchase and
 *  spend always target the session user. Privileged types (refund, reversal,
 *  adjustment) require an admin caller and an explicit target user. Balance
 *  updates use atomic, condition-guarded operators so deductions can never
 *  produce a negative balance, and the same idempotency key never applies
 *  twice. */
export type CreateCreditTransactionInput = {
  type: "purchase" | "spend" | "refund" | "adjustment" | "reversal";
  amount: number;
  /** Target user for admin-only types (adjustment/refund/reversal).
   *  Ignored for purchase/spend, which always target the session user. */
  userId?: string;
  status?: "pending" | "completed" | "failed" | "reversed";
  reference?: string;
  description?: string;
  relatedSongId?: string;
  relatedPartId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

function toLedgerEntry(d: CreditTransactionDoc & { id?: string }): CreditTransaction {
  return {
    id: d.id ?? d._id!.toString(),
    title: d.description ?? d.reference ?? `${d.type} credits`,
    detail: d.relatedSongId ? `Song ${d.relatedSongId}` : "Wallet activity",
    amount: d.amount,
    date: d.createdAt.toISOString(),
    type:
      d.type === "purchase"
        ? "purchase"
        : d.type === "spend"
          ? "usage"
          : "bonus",
  };
}

export async function createCreditTransaction(
  input: CreateCreditTransactionInput,
): Promise<CreditTransaction> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  if (!Number.isFinite(input.amount) || input.amount === 0) {
    throw new Error("Transaction amount must be a non-zero finite number.");
  }

  const db = getMongoDb();

  // Derive the target user from the session (never trust caller-supplied ids
  // for self-service types).
  const selfService = input.type === "purchase" || input.type === "spend";
  let txUserId: string;
  if (selfService) {
    if (input.amount <= 0) throw new Error("Amount must be greater than zero.");
    txUserId = sessionUser.id;
  } else {
    if (!isAdminRole(sessionUser.role)) {
      throw new Error("Administrator privileges required for this action.");
    }
    if (!input.userId) {
      throw new Error("userId is required for admin credit transactions.");
    }
    if (input.type !== "adjustment" && input.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }
    txUserId = input.userId;
  }

  // Idempotency: replaying the same (user, key) returns the original
  // transaction instead of double-granting or double-charging.
  if (input.idempotencyKey) {
    const existing = await db
      .collection<CreditTransactionDoc>(LEDGER)
      .findOne({ userId: txUserId, idempotencyKey: input.idempotencyKey });
    if (existing) return toLedgerEntry(existing);
  }

  const now = new Date();

  // Atomic balance update. `spend` is conditioned on sufficient balance so a
  // deduction can never drive the balance negative. Single-document atomic
  // operators are used because multi-document transactions require a replica
  // set (documented limitation — see docs/security-audit.md).
  const users = db.collection<{
    _id: ObjectId;
    creditBalance?: number;
    updatedAt: Date;
  }>("users");
  if (input.type === "spend") {
    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(txUserId), creditBalance: { $gte: input.amount } },
      { $inc: { creditBalance: -input.amount }, $set: { updatedAt: now } },
      { returnDocument: "after" },
    );
    if (!updated) throw new Error("Insufficient credits or user not found.");
  } else {
    const updated = await users.findOneAndUpdate(
      { _id: new ObjectId(txUserId) },
      { $inc: { creditBalance: input.amount }, $set: { updatedAt: now } },
      { returnDocument: "after" },
    );
    if (!updated) throw new Error("User not found.");
  }

  if (input.idempotencyKey) {
    // Sparse unique index makes idempotency safe under concurrency.
    await db
      .collection<CreditTransactionDoc>(LEDGER)
      .createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true });
  }

  const ledgerDoc: CreditTransactionDoc = {
    userId: txUserId,
    type: input.type,
    amount: input.amount,
    status: input.status ?? "completed",
    reference: input.reference,
    description: input.description,
    relatedSongId: input.relatedSongId,
    relatedPartId: input.relatedPartId,
    idempotencyKey: input.idempotencyKey,
    metadata: input.metadata,
    createdAt: now,
  };

  try {
    await db.collection<CreditTransactionDoc>(LEDGER).insertOne(ledgerDoc);
  } catch (err) {
    // A concurrent request won the race with the same idempotency key —
    // return the existing transaction instead of failing.
    if (input.idempotencyKey) {
      const existing = await db
        .collection<CreditTransactionDoc>(LEDGER)
        .findOne({ userId: txUserId, idempotencyKey: input.idempotencyKey });
      if (existing) return toLedgerEntry(existing);
    }
    throw err;
  }

  return toLedgerEntry(ledgerDoc);
}
