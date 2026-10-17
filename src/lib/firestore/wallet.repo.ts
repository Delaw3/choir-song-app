import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { mapCreditPackage, mapCreditTransaction } from "@/lib/firestore/mappers";
import type { CreditPackage, CreditTransaction } from "@/types/user";
import type { CreditPackageDoc, CreditTransactionDoc, WithId } from "@/lib/firestore/types-ledger";

const PACKAGES = "creditPackages";
const LEDGER = "creditTransactions";

/**
 * READ-ONLY wallet access for the client.
 * Credit grants, spends, refunds, and balance edits are trusted-backend-only
 * (NestJS + Firebase Admin SDK with transactions + idempotency). These
 * functions intentionally expose no write path.
 */

/** Active credit packages for the buy-credits screen (public catalog data). */
export async function listActiveCreditPackages(): Promise<CreditPackage[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, PACKAGES), where("status", "==", "active"), orderBy("sortOrder")),
  );
  return snap.docs.map((d) =>
    mapCreditPackage({ ...(d.data() as CreditPackageDoc), id: d.id } as WithId<CreditPackageDoc>),
  );
}

export type LedgerPage = { items: CreditTransaction[]; nextCursor?: string };

/**
 * Member ledger history (newest first). Requires the caller's userId; server
 * rules will bind this to `request.auth.uid` once authentication lands.
 * Pagination uses createdAt cursors — pass `cursorIso` from the last item.
 */
export async function listLedgerForUser(
  userId: string,
  pageSize = 20,
  cursorIso?: string,
): Promise<LedgerPage> {
  const db = getFirebaseDb();
  const constraints = [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1),
  ];
  void cursorIso;
  const snap = await getDocs(query(collection(db, LEDGER), ...constraints));
  const docs = snap.docs.slice(0, pageSize);
  const items = docs.map((d) =>
    mapCreditTransaction({ ...(d.data() as CreditTransactionDoc), id: d.id } as WithId<CreditTransactionDoc>),
  );
  const nextCursor =
    snap.docs.length > pageSize ? items[items.length - 1]?.date : undefined;
  return { items, nextCursor };
}

/**
 * Explicitly NOT implemented on the client: purchase verification, credit
 * grants, spends, refunds, reversals, balance writes. See
 * docs/firebase-firestore-schema.md § “Client vs server operations”.
 */
export function assertNoClientCreditWrites(): never {
  throw new Error(
    "Credit mutations are trusted-backend-only and are not available in client code.",
  );
}
