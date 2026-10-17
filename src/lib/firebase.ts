import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** True when all required client config values are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

/**
 * Explicit data-source switch. Mock mode (default) performs zero Firebase
 * network calls so the app runs without any credentials.
 */
export function isFirestoreEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_FIRESTORE === "true" &&
    isFirebaseConfigured()
  );
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function ensureConfigured() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Provide all NEXT_PUBLIC_FIREBASE_* " +
        "variables (see .env.example).",
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  ensureConfigured();
  appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return appInstance;
}

/** Reserved for the later authentication task — do not use yet. */
export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!isFirestoreEnabled()) {
    throw new Error(
      "Firestore is disabled (mock mode). Set NEXT_PUBLIC_USE_FIRESTORE=true " +
        "with valid Firebase config to enable it.",
    );
  }
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (storageInstance) return storageInstance;
  storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}

let analyticsInstance: Analytics | null = null;

/**
 * Analytics only works in the browser and only when supported.
 * Call this from a client component / effect, never during SSR.
 *
 * ```ts
 * useEffect(() => {
 *   void initFirebaseAnalytics();
 * }, []);
 * ```
 */
export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (analyticsInstance) return analyticsInstance;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) {
      analyticsInstance = getAnalytics(getFirebaseApp());
      return analyticsInstance;
    }
  } catch {
    // Analytics is optional — never break the app if it is blocked.
  }
  return null;
}
