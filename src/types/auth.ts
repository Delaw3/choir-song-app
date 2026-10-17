import type { UserRole } from "@/lib/firestore/types";

/**
 * Frontend-facing auth user. Mirrors the shape of the Firebase User for the
 * browser session; the server resolves these to Firestore `users/{id}` docs
 * (extended with role + emailVerified + displayName).
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

/**
 * Auth status of the current session.
 */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

/** Inputs the client sends to the trusted backend for credential-based flows. */
export interface SignInInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

/**
 * Errors the client can read out of the Firebase Auth SDK.
 * `FirebaseAuthError.isBlocking()` distinguishes recoverable (transient /
 * user-repairable) failures from ones that keep the user locked out.
 */
export class FirebaseAuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly credentialId?: string,
  ) {
    super(message);
    this.name = "FirebaseAuthError";
  }

  /** True for failures the client can attempt to self-repair. */
  isBlocking(): boolean {
    return (
      this.code === "auth/email-already-in-use" ||
      this.code === "auth/invalid-credential" ||
      this.code === "auth/user-disabled" ||
      this.code === "auth/user-not-found" ||
      this.code === "auth/wrong-password"
    );
  }

  static isFirebaseError(error: unknown): error is FirebaseAuthError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error
    );
  }

  static fromUnknown(error: unknown): FirebaseAuthError {
    if (this.isFirebaseError(error)) {
      return new FirebaseAuthError(
        String(error.code),
        String(error.message),
        "credentialId" in error ? String(error.credentialId) : undefined,
      );
    }
    return new FirebaseAuthError(
      "auth/unidentified-user",
      error instanceof Error ? error.message : String(error),
    );
  }
}

/**
 * Identity that arrives from Firebase Auth (signInWithPopup/Google) before the
 * backend resolves the user. NOTE: `emailVerified` from the IdP is *not* a
 * substitute for the app's own email verification step.
 */
export interface RawGoogleUser {
  uid: string;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  /** Provided by `GoogleAuthProvider.getToken()`; stores in-session. */
  accessToken: string;
}
