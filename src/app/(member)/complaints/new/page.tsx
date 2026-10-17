"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ComplaintForm } from "@/components/complaints/complaint-form";
import { IconButton } from "@/components/ui/icon-button";
import { complaintsService } from "@/services/complaints.service";
import { usersService } from "@/services/users.service";
import type { ComplaintCategory } from "@/types/complaint";

export default function NewComplaintPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  function submit(values: { category: ComplaintCategory; subject: string; message: string }) {
    const member = usersService.getCurrentMember();
    const complaint = complaintsService.createComplaint({ ...values, userId: member.id, userName: member.name, userEmail: member.email });
    setSubmitted(true);
    window.setTimeout(() => router.push(`/complaints/${complaint.id}`), 650);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3"><Link href="/complaints"><IconButton label="Back to complaints"><ArrowLeft className="size-5" /></IconButton></Link><div><p className="text-sm font-semibold text-violet-700">Support</p><h1 className="text-2xl font-black text-slate-950">New Complaint</h1></div></header>
      {submitted ? <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto size-12 text-emerald-600" /><h2 className="mt-4 text-xl font-black text-slate-950">Complaint submitted</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your message has been saved. Opening the complaint now.</p></div> : <section className="rounded-3xl bg-white p-5 shadow-sm"><ComplaintForm onSubmit={submit} /></section>}
    </div>
  );
}
