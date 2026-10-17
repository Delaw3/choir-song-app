"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService, MockAuthError } from "@/services/auth.service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!emailPattern.test(values.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (values.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (values.confirmPassword !== values.password) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    setAuthError("");
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await authService.signUp({ name: values.name, email: values.email, password: values.password });
      router.push("/verify-email");
    } catch (error) {
      setAuthError(error instanceof MockAuthError && error.code === "EMAIL_IN_USE" ? "An account already uses this email. Try signing in instead." : "We could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader eyebrow="Join the choir" title="Create Account" description="Set up your account and start learning your voice part." />
      <form onSubmit={submit} className="space-y-5" noValidate>
        {authError ? <AuthError>{authError}</AuthError> : null}
        <label className="block" htmlFor="full-name"><span className="mb-2 block text-sm font-bold text-slate-700">Full name</span><Input id="full-name" autoComplete="name" value={values.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "full-name-error" : undefined} placeholder="Your full name" />{errors.name ? <p id="full-name-error" className="mt-2 text-xs font-semibold text-rose-600">{errors.name}</p> : null}</label>
        <label className="block" htmlFor="sign-up-email"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><Input id="sign-up-email" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "sign-up-email-error" : undefined} placeholder="you@example.com" />{errors.email ? <p id="sign-up-email-error" className="mt-2 text-xs font-semibold text-rose-600">{errors.email}</p> : null}</label>
        <div><PasswordInput id="sign-up-password" label="Password" autoComplete="new-password" value={values.password} onChange={(event) => update("password", event.target.value)} error={errors.password} /><PasswordRequirements password={values.password} /></div>
        <PasswordInput id="confirm-password" label="Confirm password" autoComplete="new-password" value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} error={errors.confirmPassword} />
        <Button type="submit" size="lg" className="w-full" disabled={loading || !values.name || !values.email || !values.password || !values.confirmPassword}>{loading ? <><LoaderCircle className="size-5 animate-spin" />Creating account...</> : "Create Account"}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <SocialLoginButton />
      <p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link href="/sign-in" className="font-bold text-violet-700">Sign in</Link></p>
    </div>
  );
}
