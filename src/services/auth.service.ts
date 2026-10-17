"use client";

/**
 * Client auth service (mock-first).
 * All flows resolve against localStorage-backed demo accounts so the app runs
 * with zero network calls. `googleSignIn()` additionally attempts the real
 * Firebase popup when configured, falling back to the demo account.
 */

import type { AuthState, AuthUser, SignInInput, SignUpInput } from "@/types/auth";
import { FirebaseAuthError } from "@/types/auth";
import type { UserRole } from "@/lib/firestore/types";

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
}

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
    await delay(350);
    const email = input.email.trim().toLowerCase();
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
    try {
      const { signInWithGoogle } = await import("@/lib/google-auth");
      const credential = await signInWithGoogle();
      const fbUser = credential.user;
      const email = (fbUser.email ?? "member@choir.app").toLowerCase();
      const name = fbUser.displayName ?? email.split("@")[0] ?? "Choir Member";
      try {
        const token = await fbUser.getIdToken();
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: token }),
        });
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as AuthUser | null;
          if (body && body.id && body.email) {
            const user: AuthUser = {
              id: body.id,
              name: body.name || name,
              email: body.email,
              role: body.role === "admin" ? "admin" : "member",
              emailVerified: Boolean(body.emailVerified),
            };
            persistSession(user);
            emit({ status: "authenticated", user });
            return user;
          }
        }
      } catch {
        /* backend route may not exist yet — fall through to local account */
      }
      const user: AuthUser = {
        id: `google-${fbUser.uid}`,
        name,
        email,
        role: inferRole(email),
        emailVerified: Boolean(fbUser.emailVerified),
      };
      persistSession(user);
      emit({ status: "authenticated", user });
      return user;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (/not configured|NEXT_PUBLIC_FIREBASE/i.test(msg)) {
        const account =
          getStoredAccounts().find((a) => a.email.toLowerCase() === "member@choir.app") ??
          seedAccounts[0];
        const user = toAuthUser(account);
        persistSession(user);
        emit({ status: "authenticated", user });
        return user;
      }
      emit(unauthenticatedState);
      throw FirebaseAuthError.fromUnknown(error);
    }
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
      const { getFirebaseAuth } = await import("@/lib/firebase");
      const { signOut } = await import("firebase/auth");
      await signOut(getFirebaseAuth()).catch(() => undefined);
    } catch {
      /* Firebase may be unconfigured — local sign-out still proceeds */
    }
    persistSession(null);
    emit(unauthenticatedState);
  },
};
