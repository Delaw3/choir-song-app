"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { usePendingAuthEmail } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const email = usePendingAuthEmail();
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function resend() {
    setLoading(true);
    await authService.resendVerificationEmail();
    setLoading(false);
    setCooldown(30);
    setNotice("A new verification email has been sent.");
  }

  async function openEmail() {
    setLoading(true);
    const user = await authService.completeEmailVerification();
    router.replace(user.role === "admin" ? "/admin" : "/home");
  }

  return (
    <div className="flex flex-1 flex-col">
      <AuthHeader icon={<MailCheck className="size-6" />} title="Check your email" description="We sent a verification link to your email address." />
      <div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="break-all text-sm font-bold text-slate-800">{email}</p></div>
      {notice ? <p role="status" className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</p> : null}
      <div className="mt-7 space-y-3"><Button type="button" size="lg" className="w-full" onClick={openEmail} disabled={loading}>Open Email App</Button><Button type="button" size="lg" variant="secondary" className="w-full" onClick={resend} disabled={loading || cooldown > 0}>{cooldown > 0 ? `Resend Email (${cooldown}s)` : "Resend Email"}</Button></div>
      <p className="mt-7 text-center text-sm text-slate-500">Wrong email? <Link href="/sign-up" className="font-bold text-violet-700">Go back</Link></p>
    </div>
  );
}
