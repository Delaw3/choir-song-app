"use client";

/**
 * Client auth service (mock-first, backend-verified Google flow).
 *
 * Email/password + demo accounts resolve against localStorage so the app runs
 * with zero network calls. `googleSignIn()` prefers the real flow:
 * Firebase popup -> POST the ID token to `/api/auth/google` -> the trusted
 * backend verifies it with the Admin SDK, upserts `users/{uid}`, mints a
 * session cookie, and returns the authoritative `AuthUser`.
 *
 * When the backend is unconfigured (503 `admin-not-configured`) the popup
 * identity is kept as a local session; when Firebase itself is unconfigured,
 * the demo member account is used. Auth state also re-syncs from Firebase
 * (`onAuthStateChanged`) so a refresh keeps the server session alive.
 */

import type { AuthState, AuthUser, SignInInput, SignUpInput } from "@/types/auth";
import type { UserRole } from "@/lib/mongodb/types";

const SESSION_KEY = "choir.auth.session.v1";
const ACCOUNTS_KEY = "choir.auth.accounts.v1";
const PENDING_EMAIL_KEY = "choir.auth.pendingEmail.v1";

export class MockAuthError extends Error {
  constructor(
    public readonly code: "INVALID_CREDENTIALS" | "EMAIL_IN_USE",
    message?: string,
  ) {
    super(message ?? code);
    this.name = "MockAuthError";
  }
}

interface StoredAccount extends AuthUser {
  password: string;
}

const seedAccounts: StoredAccount[] = [
  { id: "member-demo", name: "Amara Okafor", email: "member@choir.app", password: "Choir123!", role: "member", emailVerified: true },
  { id: "admin-demo", name: "Choir Admin", email: "admin@choir.app", password: "Choir123!", role: "admin", emailVerified: true },
];

const unauthenticatedState: AuthState = { status: "unauthenticated", user: null };

let state: AuthState = unauthenticatedState;
let pendingEmail = "member@example.com";
const listeners = new Set<() => void>();
let hydrated = false;
const authListenerStarted = false;
const sessionSyncInFlight: Promise<void> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJSON<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — session simply won't persist */
  }
}

function getStoredAccounts(): StoredAccount[] {
  const stored = readJSON<StoredAccount[]>(ACCOUNTS_KEY);
  return stored && Array.isArray(stored) && stored.length > 0 ? stored : seedAccounts;
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  writeJSON(ACCOUNTS_KEY, accounts);
}

function toAuthUser(account: StoredAccount): AuthUser {
  return { id: account.id, name: account.name, email: account.email, role: account.role, emailVerified: account.emailVerified };
}

function persistSession(user: AuthUser | null): void {
  if (!isBrowser()) return;
  try {
    if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function emit(next: AuthState): void {
  state = next;
  for (const listener of Array.from(listeners)) {
    try {
      listener();
    } catch {
      /* a throwing subscriber must not break the store */
    }
  }
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isBrowser()) return;
  if (!readJSON(ACCOUNTS_KEY)) saveStoredAccounts(seedAccounts);
  const session = readJSON<AuthUser>(SESSION_KEY);
  if (session?.id && session.email) state = { status: "authenticated", user: session };
  const pending = readJSON<string>(PENDING_EMAIL_KEY);
  if (typeof pending === "string" && pending) pendingEmail = pending;

  if (session?.id) {
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          state = { status: "authenticated", user: data.user };
          persistSession(data.user);
          emit(state);
        }
      })
      .catch(() => undefined);
  }
}

/**
 * Keeps local state in sync with Firebase Auth across refreshes. When a
 * Firebase user exists, re-verify via the backend (`/api/auth/google`) so the
 * role comes from the server; when signed out, keep the local mock session
 * untouched (email/password flows have no Firebase user).
 */


function setPendingEmail(email: string): void {
  pendingEmail = email;
  writeJSON(PENDING_EMAIL_KEY, email);
}

function slugId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function inferRole(email: string): UserRole {
  return email.trim().toLowerCase().startsWith("admin@") ? "admin" : "member";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  subscribe(listener: () => void): () => void {
    hydrate();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getState(): AuthState {
    hydrate();
    return state;
  },

  getServerState(): AuthState {
    return unauthenticatedState;
  },

  getPendingEmail(): string {
    hydrate();
    return pendingEmail;
  },

  async signIn(input: SignInInput): Promise<AuthUser> {
    hydrate();
    emit({ status: "loading", user: state.user });
    await delay(250);
    const email = input.email.trim().toLowerCase();

    // 1. Try real database authentication via server-side session API
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const user: AuthUser = data.user;
          const accounts = getStoredAccounts();
          const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === email);
          const updatedAccount: StoredAccount = {
            id: user.id,
            name: user.name,
            email: user.email,
            password: input.password,
            role: user.role,
            emailVerified: user.emailVerified,
          };
          if (existingIdx >= 0) {
            accounts[existingIdx] = updatedAccount;
          } else {
            accounts.push(updatedAccount);
          }
          saveStoredAccounts(accounts);
          persistSession(user);
          emit({ status: "authenticated", user });
          return user;
        }
      } else if (res.status === 401 || res.status === 400) {
        emit(unauthenticatedState);
        throw new MockAuthError("INVALID_CREDENTIALS", "Email or password is incorrect.");
      }
    } catch (err) {
      if (err instanceof MockAuthError) {
        throw err;
      }
    }

    // 2. Offline fallback to local accounts if network is unavailable
    const account = getStoredAccounts().find((a) => a.email.toLowerCase() === email);
    if (!account || account.password !== input.password) {
      emit(unauthenticatedState);
      throw new MockAuthError("INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    const user = toAuthUser(account);
    persistSession(user);
    emit({ status: "authenticated", user });
    return user;
  },

  async signUp(input: SignUpInput): Promise<AuthUser> {
    hydrate();
    emit({ status: "loading", user: state.user });
    await delay(350);
    const email = input.email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email)) {
      emit(unauthenticatedState);
      throw new MockAuthError("EMAIL_IN_USE", "An account already uses this email.");
    }
    const account: StoredAccount = {
      id: slugId("user"),
      name: input.name.trim(),
      email,
      password: input.password,
      role: inferRole(email),
      emailVerified: false,
    };
    saveStoredAccounts([...accounts, account]);
    const user = toAuthUser(account);
    setPendingEmail(email);
    persistSession(null);
    emit(unauthenticatedState);
    return user;
  },

  async googleSignIn(): Promise<AuthUser> {
    hydrate();
    emit({ status: "loading", user: state.user });
    // Google OAuth via Firebase Auth has been removed from this app. Sign into
    // the demo member account so the social sign-in path still works locally.
    const account =
      getStoredAccounts().find((a) => a.email.toLowerCase() === "member@choir.app") ??
      seedAccounts[0];
    const user = toAuthUser(account);
    persistSession(user);
    emit({ status: "authenticated", user });
    return user;
  },

  async forgotPassword(email: string): Promise<void> {
    hydrate();
    setPendingEmail(email.trim().toLowerCase());
    await delay(350);
  },

  async resetPassword(password: string): Promise<void> {
    hydrate();
    await delay(350);
    const target = pendingEmail.toLowerCase();
    saveStoredAccounts(
      getStoredAccounts().map((a) => (a.email.toLowerCase() === target ? { ...a, password } : a)),
    );
    persistSession(null);
    emit(unauthenticatedState);
  },

  async resendVerificationEmail(): Promise<void> {
    hydrate();
    await delay(350);
  },

  async completeEmailVerification(): Promise<AuthUser> {
    hydrate();
    await delay(350);
    const accounts = getStoredAccounts();
    const target = pendingEmail.toLowerCase();
    let matched = accounts.find((a) => a.email.toLowerCase() === target) ?? null;
    if (!matched && state.user) {
      const su = state.user;
      matched = accounts.find((a) => a.email.toLowerCase() === su.email.toLowerCase()) ?? null;
    }
    if (!matched) {
      matched = accounts.find((a) => a.email.toLowerCase() === "member@choir.app") ?? seedAccounts[0];
    }
    const foundId = matched.id;
    saveStoredAccounts(accounts.map((a) => (a.id === foundId ? { ...a, emailVerified: true } : a)));
    const user: AuthUser = { ...toAuthUser(matched), emailVerified: true };
    persistSession(user);
    emit({ status: "authenticated", user });
    return user;
  },

  async signOut(): Promise<void> {
    hydrate();
    await delay(150);
    try {
      // No Firebase auth to sign out — local sign-out only
    } catch {
      /* local sign-out still proceeds */
    }
    try {
      await fetch("/api/auth/session", { method: "DELETE", credentials: "include" }).catch(
        () => undefined,
      );
    } catch {
      /* Backend may be unconfigured — cookie simply won't exist */
    }
    persistSession(null);
    emit(unauthenticatedState);
  },
};
