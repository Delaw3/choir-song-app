"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LoaderCircle, Mail } from "lucide-react";
import { AuthSuccessState } from "@/components/auth/auth-feedback";
import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await authService.forgotPassword(email);
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return <AuthSuccessState title="Check your email" message="If an account exists for this email, we've sent password reset instructions." action={<div className="space-y-3"><Link href="/reset-password" className="block"><Button size="lg" className="w-full">Continue</Button></Link><Link href="/sign-in" className="inline-flex min-h-11 items-center justify-center font-bold text-violet-700">Back to Sign In</Link></div>} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader icon={<Mail className="size-6" />} title="Forgot password?" description="Enter the email associated with your account and we'll send you instructions to reset your password." />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <label className="block" htmlFor="forgot-email"><span className="mb-2 block text-sm font-bold text-slate-700">Email address</span><Input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "forgot-email-error" : undefined} placeholder="you@example.com" />{error ? <p id="forgot-email-error" className="mt-2 text-xs font-semibold text-rose-600">{error}</p> : null}</label>
        <Button type="submit" size="lg" className="w-full" disabled={loading || !email}>{loading ? <><LoaderCircle className="size-5 animate-spin" />Sending...</> : "Send Reset Link"}</Button>
      </form>
      <Link href="/sign-in" className="mt-7 text-center text-sm font-bold text-violet-700">Back to Sign In</Link>
    </div>
  );
}
