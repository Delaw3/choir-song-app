import type { UserRole } from "@/lib/mongodb/types";

/**
 * Frontend-facing auth user. Mirrors the shape of the auth session for the
 * browser session; the server resolves these to MongoDB `users/{id}` docs
 * (extended with role + emailVerified + displayName).
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  creditBalance?: number;
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
 * Generic auth error used by the mock auth service. Firebase Auth has been
 * removed from this app; this replaces the former FirebaseAuthError.
 */
export class AuthError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
  }

  /** True for failures the client can attempt to self-repair. */
  isBlocking(): boolean {
    return (
      this.code === "EMAIL_IN_USE" ||
      this.code === "INVALID_CREDENTIALS" ||
      this.code === "USER_DISABLED" ||
      this.code === "USER_NOT_FOUND" ||
      this.code === "WRONG_PASSWORD"
    );
  }
}
