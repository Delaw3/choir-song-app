"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

export function SocialLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await authService.googleSignIn();
      router.replace("/home");
    } catch (error) {
      // AuthError boundary already shows feedback; still route to sign-in so the
      // user can retry or use email/password.
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
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
            <span className="text-base font-black text-blue-600">G</span>
            Continue with Google
          </>
        )}
      </Button>
    </div>
  );
}
