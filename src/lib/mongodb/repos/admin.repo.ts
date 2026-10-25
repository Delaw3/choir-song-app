import "server-only";

import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { CreditTransaction, Member } from "@/types/user";
import type {
  CreditTransactionDoc,
  PaymentDoc,
  UserDoc,
  WithId,
} from "@/lib/mongodb/types";

const USERS = "users";
const LEDGER = "creditTransactions";
const PAYMENTS = "payments";

/**
 * Admin READ helpers. Each function enforces admin authorization itself so
 * the data boundary is protected even if a caller forgets to check.
 */

export async function listMembersAdmin(pageSize = 100): Promise<Member[]> {
  await requireAdmin();
  const db = getMongoDb();
  const docs = await db
    .collection<UserDoc>(USERS)
    .find()
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();

  return docs.map((d) => {
    const initials = d.displayName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      id: d._id!.toString(),
      name: d.displayName,
      firstname: d.displayName.split(" ")[0] || d.displayName,
      email: d.email ?? "",
      avatarInitials: initials || "MB",
      creditBalance: d.creditBalance,
      joinedAt: d.createdAt.toISOString().slice(0, 10),
    };
  });
}

export type AdminLedgerEntry = CreditTransaction & {
  userId: string;
  status: string;
};

export async function listLedgerAdmin(pageSize = 100): Promise<AdminLedgerEntry[]> {
  await requireAdmin();
  const db = getMongoDb();
  const docs = await db
    .collection<CreditTransactionDoc>(LEDGER)
    .find()
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();

  return docs.map((d) => ({
    id: d._id!.toString(),
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
    userId: d.userId,
    status: d.status,
  }));
}

export type AdminPaymentEntry = {
  id: string;
  userId: string;
  provider: PaymentDoc["provider"];
  amount: number;
  currency: string;
  creditsToGrant: number;
  status: PaymentDoc["status"];
  createdAt: string;
};

export async function listPaymentsAdmin(pageSize = 100): Promise<AdminPaymentEntry[]> {
  await requireAdmin();
  const db = getMongoDb();
  const docs = await db
    .collection<PaymentDoc>(PAYMENTS)
    .find()
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();

  return docs.map((d) => ({
    id: d._id!.toString(),
    userId: d.userId,
    provider: d.provider,
    amount: d.amount,
    currency: d.currency,
    creditsToGrant: d.creditsToGrant,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
  }));
}