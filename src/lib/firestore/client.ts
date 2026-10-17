import { getFirebaseDb, isFirestoreEnabled } from "@/lib/firebase";

export class FirestoreDisabledError extends Error {
  constructor() {
    super(
      "Firestore is not enabled. Set NEXT_PUBLIC_USE_FIRESTORE=true and provide " +
        "all NEXT_PUBLIC_FIREBASE_* variables (see .env.example).",
    );
    this.name = "FirestoreDisabledError";
  }
}

/**
 * Returns a Firestore instance, or throws `FirestoreDisabledError` when the
 * app is running in mock mode. Callers that support graceful fallback should
 * catch this error and use the local mock data instead.
 */
export function requireDb() {
  if (!isFirestoreEnabled()) throw new FirestoreDisabledError();
  return getFirebaseDb();
}

/** True when Firestore queries may be attempted (flag on + config present). */
export function canUseFirestore() {
  return isFirestoreEnabled();
}
