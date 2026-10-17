import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { mapCreditTransaction, mapMember } from "@/lib/firestore/mappers";
import type { CreditTransaction, Member } from "@/types/user";
import type { CreditTransactionDoc, PaymentDoc, WithId } from "@/lib/firestore/types-ledger";
import type { UserDoc as CoreUserDoc, UserDoc } from "@/lib/firestore/types";

const USERS = "users";
const LEDGER = "creditTransactions";
const PAYMENTS = "payments";

/**
 * Admin READ helpers. These are plain query functions — they are NOT
 * authorization. Until Firebase Authentication + custom claims land, admin
 * pages must be treated as unprotected UI; Firestore rules below deny all
 * production reads/writes until auth is wired. See
 * docs/firebase-firestore-schema.md § “Security assumptions”.
 */

export async function listMembersAdmin(pageSize = 100): Promise<Member[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, USERS), orderBy("createdAt", "desc"), limit(pageSize)));
  return snap.docs.map((d) =>
    mapMember({ ...(d.data() as CoreUserDoc), id: d.id } as WithId<UserDoc>),
  );
}

export type AdminLedgerEntry = CreditTransaction & { userId: string; status: string };

export async function listLedgerAdmin(pageSize = 100): Promise<AdminLedgerEntry[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, LEDGER), orderBy("createdAt", "desc"), limit(pageSize)));
  return snap.docs.map((d) => {
    const data = d.data() as CreditTransactionDoc;
    const base = mapCreditTransaction({ ...data, id: d.id });
    return { ...base, userId: data.userId, status: data.status };
  });
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
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, PAYMENTS), orderBy("createdAt", "desc"), limit(pageSize)));
  return snap.docs.map((d) => {
    const data = d.data() as PaymentDoc;
    return {
      id: d.id,
      userId: data.userId,
      provider: data.provider,
      amount: data.amount,
      currency: data.currency,
      creditsToGrant: data.creditsToGrant,
      status: data.status,
      createdAt: data.createdAt?.toDate().toISOString() ?? new Date(0).toISOString(),
    };
  });
}
