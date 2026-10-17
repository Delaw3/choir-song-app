"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService, MockAuthError } from "@/services/auth.service";

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
    if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    setAuthError("");
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const user = await authService.signIn({ email, password, rememberMe });
      router.replace(user.role === "admin" ? "/admin" : "/home");
    } catch (error) {
      setAuthError(error instanceof MockAuthError ? "Email or password is incorrect." : "We could not sign you in. Please try again.");
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
    <div className="flex flex-1 flex-col">
      <AuthHeader eyebrow="Welcome back" title="Sign In" description="Continue your choir practice where you left off." />
      <form onSubmit={submit} className="space-y-5" noValidate>
        {authError ? <AuthError>{authError}</AuthError> : null}
        <label className="block" htmlFor="sign-in-email"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><Input id="sign-in-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "sign-in-email-error" : undefined} placeholder="you@example.com" />{errors.email ? <p id="sign-in-email-error" className="mt-2 text-xs font-semibold text-rose-600">{errors.email}</p> : null}</label>
        <PasswordInput id="sign-in-password" name="password" label="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} />
        <div className="flex items-center justify-between gap-3 text-sm"><label className="flex cursor-pointer items-center gap-2 font-semibold text-slate-600"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="size-4 accent-violet-700" />Remember me</label><Link href="/forgot-password" className="font-bold text-violet-700">Forgot password?</Link></div>
        <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>{loading ? <><LoaderCircle className="size-5 animate-spin" />Signing in...</> : "Sign In"}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <SocialLoginButton />
      <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Demo accounts"><Button type="button" variant="ghost" size="sm" onClick={() => fillDemo("member")}>Member demo</Button><Button type="button" variant="ghost" size="sm" onClick={() => fillDemo("admin")}>Admin demo</Button></div>
      <p className="mt-7 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href="/sign-up" className="font-bold text-violet-700">Create account</Link></p>
    </div>
  );
}
