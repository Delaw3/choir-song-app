import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { RawGoogleUser } from "@/types/auth";

/**
 * Google sign-in provider. This module is responsible only for the browser
 * identity *prompt* — it does NOT persist user documents or mutate the ledger.
 * The wrapping `authService` transmits the Firebase ID token to the
 * trusted backend via a POST to `/api/auth/google` and awaits the backend's
 * resolved `AuthUser`.
 */
export function getGoogleAuthProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  // Keep the profile + email scopes explicit; `signInWithPopup` already
  // requests `openid`, `email`, and `profile` for Google.
  provider.addScope("email");
  provider.addScope("profile");
  return provider;
}

/** Map the raw IdP user + OAuth access token into the client-facing shape. */
export function mapRawGoogleUser(raw: RawGoogleUser): RawGoogleUser {
  return raw;
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const provider = getGoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * OAuth access token for calling Google APIs (NOT a Firebase ID token).
 * Must be read from the sign-in result — `auth.currentUser` does not retain it.
 */
export function getGoogleOAuthAccessToken(credential: UserCredential): string | null {
  const oauth = GoogleAuthProvider.credentialFromResult(credential);
  return oauth?.accessToken ?? null;
}

/**
 * Firebase ID token for backend verification (`POST /api/auth/google`
 * expects `{ idToken }`). This is what proves identity to our own backend.
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  return user.getIdToken(forceRefresh);
}

/**
 * @deprecated Use {@link getFirebaseIdToken} instead. Kept for backwards
 * compatibility — previously misnamed, it always returned the Firebase ID
 * token, never the Google OAuth access token (see
 * {@link getGoogleOAuthAccessToken}).
 */
export async function getGoogleAccessToken(): Promise<string> {
  return getFirebaseIdToken();
}

