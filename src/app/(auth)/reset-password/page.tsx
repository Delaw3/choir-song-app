"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { KeyRound, LoaderCircle } from "lucide-react";
import { AuthSuccessState } from "@/components/auth/auth-feedback";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    await authService.resetPassword(password);
    setLoading(false);
    setUpdated(true);
  }

  if (updated) return <AuthSuccessState title="Password updated" message="Your password has been changed successfully." action={<Link href="/sign-in" className="block"><Button size="lg" className="w-full">Continue to Sign In</Button></Link>} />;

  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader icon={<KeyRound className="size-6" />} title="Reset Password" description="Choose a new password for your Choir Training account." />
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div><PasswordInput id="new-password" label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} error={errors.password} /><PasswordRequirements password={password} /></div>
        <PasswordInput id="confirm-new-password" label="Confirm new password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} error={errors.confirmPassword} />
        <Button type="submit" size="lg" className="w-full" disabled={loading || !password || !confirmPassword}>{loading ? <><LoaderCircle className="size-5 animate-spin" />Updating...</> : "Reset Password"}</Button>
      </form>
    </div>
  );
}
