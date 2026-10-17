"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { ComplaintCategoryBadge } from "@/components/complaints/complaint-category-badge";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { useComplaints } from "@/hooks/use-complaints";
import { formatDate } from "@/lib/utils";

export default function ComplaintDetailsPage() {
  const params = useParams<{ id: string }>();
  const complaints = useComplaints();
  const complaint = complaints.find((item) => item.id === params.id);

  if (!complaint) return <EmptyState title="Complaint not found" message="This complaint may no longer be available." action={<Link href="/complaints" className="font-bold text-violet-700">Back to complaints</Link>} />;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3"><Link href="/complaints"><IconButton label="Back to complaints"><ArrowLeft className="size-5" /></IconButton></Link><div className="min-w-0"><p className="text-sm font-semibold text-violet-700">Complaint Details</p><h1 className="truncate text-2xl font-black text-slate-950">{complaint.subject}</h1></div></header>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2"><ComplaintStatusBadge status={complaint.status} /><ComplaintCategoryBadge category={complaint.category} /></div>
        <p className="mt-4 text-xs font-semibold text-slate-400">Submitted {formatDate(complaint.createdAt)}</p>
        <div className="mt-5 border-t border-slate-100 pt-5"><h2 className="text-sm font-black text-slate-950">Your message</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{complaint.message}</p></div>
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><MessageSquareText className="size-5" /></span><h2 className="text-lg font-black text-slate-950">Admin Response</h2></div>
        {complaint.adminResponse ? <><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{complaint.adminResponse}</p>{complaint.respondedAt ? <p className="mt-4 text-xs font-semibold text-slate-400">Responded {formatDate(complaint.respondedAt)}</p> : null}</> : <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">No response yet. Your complaint is being reviewed.</p>}
      </section>
    </div>
  );
}
