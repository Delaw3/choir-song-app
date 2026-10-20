import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Trusted-backend Firebase Admin singleton (server-only).
 *
 * Credentials come from `FIREBASE_SERVICE_ACCOUNT_JSON` (full JSON string) or
 * the split fields `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` +
 * `FIREBASE_PRIVATE_KEY` (with `\n` newlines escaped). `FIREBASE_PROJECT_ID`
 * alone enables a no-credential mode that throws a descriptive 503 from the
 * route instead of crashing the build.
 */

let appInstance: App | null = null;

function readServiceAccount(): { projectId?: string; clientEmail?: string; privateKey?: string } {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    try {
      const parsed = JSON.parse(inline) as { project_id?: string; client_email?: string; private_key?: string };
      return {
        projectId: parsed.project_id ?? process.env.FIREBASE_PROJECT_ID,
        clientEmail: parsed.client_email ?? process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: parsed.private_key ?? process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      };
    } catch {
      // Fall through to split-field env vars.
    }
  }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
}

export class FirebaseAdminNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase Admin is not configured. Provide FIREBASE_SERVICE_ACCOUNT_JSON " +
        "or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY. " +
        "See .env.example.",
    );
    this.name = "FirebaseAdminNotConfiguredError";
  }
}

export function isFirebaseAdminConfigured(): boolean {
  const { projectId, clientEmail, privateKey } = readServiceAccount();
  return Boolean(projectId && clientEmail && privateKey);
}

function ensureApp(): App {
  if (appInstance) return appInstance;
  const { projectId, clientEmail, privateKey } = readServiceAccount();
  if (!projectId || !clientEmail || !privateKey) {
    throw new FirebaseAdminNotConfiguredError();
  }
  appInstance =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
          projectId,
        });
  return appInstance;
}

export function getAdminAuth(): Auth {
  return getAuth(ensureApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(ensureApp());
}

export function adminServerTimestamp(): FieldValue {
  return FieldValue.serverTimestamp();
}
