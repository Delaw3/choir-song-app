import "server-only";

import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole, requireAdmin, requireSelfOrAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { PaymentDoc, PaymentStatus, WithId } from "@/lib/mongodb/types";

const PAYMENTS = "payments";

export type PaymentEntry = {
  id: string;
  userId: string;
  provider: "paystack" | "flutterwave" | "manual";
  providerReference?: string;
  amount: number;
  currency: string;
  creditsToGrant: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

function toPaymentEntry(doc: WithId<PaymentDoc>): PaymentEntry {
  return {
    id: doc.id,
    userId: doc.userId,
    provider: doc.provider,
    providerReference: doc.providerReference,
    amount: doc.amount,
    currency: doc.currency,
    creditsToGrant: doc.creditsToGrant,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Allowed status transitions when confirming a payment. Same-status is
 *  allowed so replays are idempotent. */
const CONFIRM_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["successful", "failed", "refund_pending"],
  refund_pending: ["refunded", "failed"],
  successful: ["refunded", "reversed"],
  failed: [],
  refunded: [],
  reversed: [],
};

export function isConfirmableTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  if (from === to) return true;
  return CONFIRM_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Create a payment record (pending). Server-side only.
 *  Users may only create payments for themselves; admins may create one on
 *  behalf of another user. Client-supplied status/amount-grant values are
 *  never trusted: status always starts as `pending`. */
export async function createPayment(input: {
  userId: string;
  provider: "paystack" | "flutterwave" | "manual";
  providerReference?: string;
  amount: number;
  currency: string;
  creditsToGrant: number;
}): Promise<string> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  if (sessionUser.id !== input.userId && !isAdminRole(sessionUser.role)) {
    throw new Error(
      "Forbidden: you can only create payments for yourself.",
    );
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Payment amount must be a positive number.");
  }
  if (!Number.isFinite(input.creditsToGrant) || input.creditsToGrant <= 0) {
    throw new Error("creditsToGrant must be a positive number.");
  }
  const db = getMongoDb();
  const now = new Date();
  const result = await db.collection<PaymentDoc>(PAYMENTS).insertOne({
    userId: input.userId,
    provider: input.provider,
    providerReference: input.providerReference,
    amount: input.amount,
    currency: input.currency,
    creditsToGrant: input.creditsToGrant,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
  return result.insertedId.toString();
}

/** Confirm a payment (server-side trusted operation). Only administrators may
 *  confirm or reject payments. Transitions are validated, the operation is
 *  idempotent (replaying the same confirmation returns the current record),
 *  and the confirming admin is recorded for audit. Credit granting must be
 *  done via `createCreditTransaction` with `idempotencyKey = paymentId`. */
export async function confirmPayment(
  paymentId: string,
  status: "successful" | "failed" | "refund_pending" | "refunded" | "reversed",
  reason?: string,
): Promise<PaymentEntry | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Authentication required.");
  if (!isAdminRole(sessionUser.role)) {
    throw new Error("Administrator privileges required to confirm payments.");
  }
  if (!ObjectId.isValid(paymentId)) return null;

  const db = getMongoDb();
  const payment = await db
    .collection<PaymentDoc>(PAYMENTS)
    .findOne({ _id: new ObjectId(paymentId) });
  if (!payment) return null;

  if (!isConfirmableTransition(payment.status, status)) {
    throw new Error(
      `Payment cannot transition from "${payment.status}" to "${status}".`,
    );
  }
  // Idempotent replay: already in the requested state.
  if (payment.status === status) {
    return toPaymentEntry({ ...payment, id: payment._id!.toString() });
  }

  const now = new Date();
  await db.collection<PaymentDoc>(PAYMENTS).updateOne(
    { _id: payment._id },
    {
      $set: {
        status,
        updatedAt: now,
        confirmedBy: sessionUser.id,
        confirmedAt: now,
        ...(status === "failed" && reason ? { failureReason: reason } : {}),
      },
    },
  );
  const updated = await db
    .collection<PaymentDoc>(PAYMENTS)
    .findOne({ _id: payment._id });
  return updated ? toPaymentEntry({ ...updated, id: updated._id!.toString() }) : null;
}

/** List payments for admin (read-only). */
export async function listPaymentsAdmin(pageSize = 100): Promise<PaymentEntry[]> {
  await requireAdmin();
  const db = getMongoDb();
  const docs = await db
    .collection<PaymentDoc>(PAYMENTS)
    .find()
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .toArray();
  return docs.map((d) => toPaymentEntry({ ...d, id: d._id!.toString() }));
}

/** Get a payment by id. Users can only read their own payments; admins can
 *  read any. */
export async function getPaymentById(
  paymentId: string,
): Promise<PaymentEntry | null> {
  if (!ObjectId.isValid(paymentId)) return null;
  const db = getMongoDb();
  const doc = await db
    .collection<PaymentDoc>(PAYMENTS)
    .findOne({ _id: new ObjectId(paymentId) });
  if (!doc) return null;
  await requireSelfOrAdmin(doc.userId);
  return toPaymentEntry({ ...doc, id: doc._id!.toString() });
}
