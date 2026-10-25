"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { GoogleLogo } from "@/components/auth/google-logo";
import { authService } from "@/services/auth.service";

export function SocialLoginButton({ label = "Continue with Google" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const user = await authService.googleSignIn();
      router.replace(user.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {error ? (
        <div className="mb-3">
          <AuthError>{error}</AuthError>
        </div>
      ) : null}
      <button
        type="button"
        aria-label={label}
        onClick={handleClick}
        disabled={loading}
        className="group relative flex min-h-[50px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50/80 hover:shadow active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle className="size-4 animate-spin text-violet-600" />
            <span className="text-slate-600">Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleLogo className="size-5 transition-transform group-hover:scale-105" />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}
