"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { FirebaseAuthError } from "@/types/auth";

function googleErrorMessage(error: unknown): string {
  if (FirebaseAuthError.isFirebaseError(error)) {
    switch (error.code) {
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Google sign-in was closed before finishing. Try again.";
      case "auth/popup-blocked":
        return "Your browser blocked the Google popup. Allow popups and try again.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized for Google sign-in. Add it under Firebase Console → Authentication → Settings → Authorized domains.";
      case "auth/operation-not-allowed":
        return "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Google.";
      case "auth/network-request-failed":
        return "Network error during Google sign-in. Check your connection and try again.";
      default:
        return error.message || "Google sign-in failed. Please try again.";
    }
  }
  if (error instanceof Error && /admin-not-configured/i.test(error.message)) {
    return "Server auth is not configured yet — you are signed in locally. Ask an admin to add the service-account key.";
  }
  return "Google sign-in failed. Please try again or use email/password.";
}

export function SocialLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const user = await authService.googleSignIn();
      router.replace(user.role === "admin" ? "/admin" : "/home");
    } catch (error) {
      // Popup dismissed — stay put so the user can retry.
      if (
        FirebaseAuthError.isFirebaseError(error) &&
        (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request")
      ) {
        setError(googleErrorMessage(error));
        return;
      }
      setError(googleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-3">
          <AuthError>{error}</AuthError>
        </div>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        aria-label="Continue with Google"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            <span className="ml-2">Signing in...</span>
          </>
        ) : (
          <>
            <GoogleLogo />
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}

