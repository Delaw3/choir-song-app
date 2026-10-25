"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { authService, MockAuthError } from "@/services/auth.service";
import { cn } from "@/lib/utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    setAuthError("");
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const user = await authService.signIn({ email, password, rememberMe });
      router.replace(user.role === "admin" ? "/admin" : "/home");
    } catch (error) {
      setAuthError(error instanceof MockAuthError ? "Incorrect email or password." : "Couldn't sign you in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: "member" | "admin") {
    setEmail(`${role}@choir.app`);
    setPassword("Choir123!");
    setErrors({});
    setAuthError("");
  }

  return (
    <div className="w-full">
      {/* Centered Minimal Header */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to your account</p>
      </div>

      <div className="space-y-4">
        {/* Centered Social Sign In */}
        <SocialLoginButton label="Continue with Google" />

        {/* Clean Centered Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">or</span>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4" noValidate>
          {authError ? <AuthError>{authError}</AuthError> : null}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="sign-in-email">
              Email
            </label>
            <input
              id="sign-in-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "sign-in-email-error" : undefined}
              className={cn(
                "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10",
                errors.email && "border-rose-400 bg-rose-50/20 focus:border-rose-500",
              )}
            />
            {errors.email ? <p id="sign-in-email-error" className="mt-1.5 text-xs font-semibold text-rose-600">{errors.email}</p> : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700" htmlFor="sign-in-password">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-violet-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="sign-in-password"
              name="password"
              label="Password"
              labelClassName="sr-only"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Your password"
            />
          </div>

          <div className="flex items-center">
            <label className="flex cursor-pointer select-none items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-slate-300 accent-violet-600 focus:ring-violet-500"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-violet-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin mr-2" />
                <span>Signing in…</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Centered Minimal Demo Access */}
        <div className="pt-2 text-center text-xs text-slate-400">
          <span>Demo accounts: </span>
          <button
            type="button"
            onClick={() => fillDemo("member")}
            className="font-bold text-violet-700 hover:underline"
          >
            Member
          </button>
          <span className="mx-1.5 text-slate-300">•</span>
          <button
            type="button"
            onClick={() => fillDemo("admin")}
            className="font-bold text-violet-700 hover:underline"
          >
            Admin
          </button>
        </div>

        {/* Centered Switch Link */}
        <p className="pt-2 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-bold text-violet-700 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
