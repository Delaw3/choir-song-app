"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [showEmail, setShowEmail] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

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
    setShowEmail(true);
  }

  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader title="Welcome back" description="Pick up where you left off." />
      <SocialLoginButton />
      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      {showEmail ? (
        <form onSubmit={submit} className="space-y-4" noValidate>
          {authError ? <AuthError>{authError}</AuthError> : null}
          <div>
            <label className="sr-only" htmlFor="sign-in-email">Email</label>
            <Input id="sign-in-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "sign-in-email-error" : undefined} placeholder="Email" />
            {errors.email ? <p id="sign-in-email-error" className="mt-1.5 text-xs font-medium text-rose-600">{errors.email}</p> : null}
          </div>
          <PasswordInput id="sign-in-password" name="password" label="Password" labelClassName="sr-only" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} placeholder="Password" />
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-slate-600"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-4 accent-violet-700" />Remember me</label>
            <Link href="/forgot-password" className="font-semibold text-violet-700">Forgot password?</Link>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>{loading ? <><LoaderCircle className="size-5 animate-spin" />Signing in…</> : "Sign in"}</Button>
        </form>
      ) : (
        <Button type="button" variant="secondary" size="lg" className="w-full" onClick={() => setShowEmail(true)}>Sign in with email</Button>
      )}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowDemo((value) => !value)}
          aria-expanded={showDemo}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
        >
          Demo access
          <ChevronDown className={cn("size-3.5 transition-transform", showDemo && "rotate-180")} />
        </button>
        {showDemo ? (
          <div className="mt-2 grid grid-cols-2 gap-2" aria-label="Demo accounts">
            <Button type="button" variant="ghost" size="sm" onClick={() => fillDemo("member")}>Member demo</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => fillDemo("admin")}>Admin demo</Button>
          </div>
        ) : null}
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">New here? <Link href="/sign-up" className="font-semibold text-violet-700">Create account</Link></p>
    </div>
  );
}
