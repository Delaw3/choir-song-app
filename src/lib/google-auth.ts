import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import type { RawGoogleUser } from "@/types/auth";

/**
 * Google sign-in provider. This module is responsible only for the browser
 * identity *prompt* — it does NOT persist user documents or mutate the ledger.
 * The wrapping `authService` transmits the parsed IdP identity to the
 * trusted backend via a POST to `/api/auth/google` and awaits the backend's
 * resolved `AuthUser`.
 */
export function getGoogleAuthProvider(): GoogleAuthProvider {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
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

export async function getGoogleAccessToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("No signed-in user.");
  const credential = user.providerData.find((p) => p.providerId === "google.com");
  if (!credential) throw new Error("No google.com credential bound to current user.");
  const token = await user.getIdToken();
  return token;
}
