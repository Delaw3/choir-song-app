"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService, MockAuthError } from "@/services/auth.service";
import { cn } from "@/lib/utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>;
}

export default function SignUpPage() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordOk = useMemo(() => values.password.length >= 8, [values.password]);

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!emailPattern.test(values.email.trim())) nextErrors.email = "Enter a valid email.";
    if (values.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    setErrors(nextErrors);
    setAuthError("");
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      await authService.signUp({ name: values.name, email: values.email, password: values.password });
      router.push("/verify-email");
    } catch (error) {
      setAuthError(error instanceof MockAuthError && error.code === "EMAIL_IN_USE" ? "This email is already registered. Try signing in." : "Couldn't create your account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const ready = Boolean(values.name.trim() && values.email.trim() && passwordOk);

  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader title="Create your account" description="One account for practice, library, and credits." />
      <SocialLoginButton />
      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {authError ? <AuthError>{authError}</AuthError> : null}
        <div>
          <label className="sr-only" htmlFor="full-name">Name</label>
          <Input id="full-name" autoComplete="name" value={values.name} onChange={(event) => update("name", event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "full-name-error" : undefined} placeholder="Full name" />
          <FieldError id="full-name-error" message={errors.name} />
        </div>
        <div>
          <label className="sr-only" htmlFor="sign-up-email">Email</label>
          <Input id="sign-up-email" type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "sign-up-email-error" : undefined} placeholder="Email" />
          <FieldError id="sign-up-email-error" message={errors.email} />
        </div>
        <div>
          <PasswordInput id="sign-up-password" label="Password" labelClassName="sr-only" autoComplete="new-password" value={values.password} onChange={(event) => update("password", event.target.value)} error={errors.password} placeholder="Password (8+ characters)" />
          {!errors.password ? (
            <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs", passwordOk ? "font-medium text-emerald-600" : "text-slate-400")}>
              <Check className="size-3.5" />8+ characters
            </p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading || !ready}>{loading ? <><LoaderCircle className="size-5 animate-spin" />Creating…</> : "Create account"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Have an account? <Link href="/sign-in" className="font-semibold text-violet-700">Sign in</Link></p>
    </div>
  );
}
