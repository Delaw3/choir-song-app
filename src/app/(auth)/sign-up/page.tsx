"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { AuthError } from "@/components/auth/auth-feedback";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { authService, MockAuthError } from "@/services/auth.service";
import { cn } from "@/lib/utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    if (values.name.trim().length < 2) nextErrors.name = "Enter your full name.";
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
    <div className="w-full">
      {/* Centered Minimal Header */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Create account</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sign up for choir practice & repertoire</p>
      </div>

      <div className="space-y-4">
        {/* Centered Social Sign Up */}
        <SocialLoginButton label="Sign up with Google" />

        {/* Clean Centered Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">or</span>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={submit} className="space-y-4" noValidate>
          {authError ? <AuthError>{authError}</AuthError> : null}

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="full-name">
              Full Name
            </label>
            <input
              id="full-name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Amara Okafor"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "full-name-error" : undefined}
              className={cn(
                "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10",
                errors.name && "border-rose-400 bg-rose-50/20 focus:border-rose-500",
              )}
            />
            {errors.name ? <p id="full-name-error" className="mt-1.5 text-xs font-semibold text-rose-600">{errors.name}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="sign-up-email">
              Email
            </label>
            <input
              id="sign-up-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "sign-up-email-error" : undefined}
              className={cn(
                "min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10",
                errors.email && "border-rose-400 bg-rose-50/20 focus:border-rose-500",
              )}
            />
            {errors.email ? <p id="sign-up-email-error" className="mt-1.5 text-xs font-semibold text-rose-600">{errors.email}</p> : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="sign-up-password">
              Password
            </label>
            <PasswordInput
              id="sign-up-password"
              name="password"
              label="Password"
              labelClassName="sr-only"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => update("password", e.target.value)}
              error={errors.password}
              placeholder="At least 8 characters"
            />
            {!errors.password ? (
              <p className={cn("mt-1.5 flex items-center gap-1.5 text-xs transition-colors", passwordOk ? "font-semibold text-emerald-600" : "text-slate-400")}>
                <Check className={cn("size-3.5", passwordOk ? "text-emerald-500" : "text-slate-300")} />
                Must be at least 8 characters
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading || !ready}
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-violet-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin mr-2" />
                <span>Creating account…</span>
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Centered Switch Link */}
        <p className="pt-2 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold text-violet-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
