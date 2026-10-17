"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminComplaintDetails } from "@/components/admin/admin-complaint-details";
import { EmptyState } from "@/components/ui/empty-state";
import { useComplaints } from "@/hooks/use-complaints";

export default function AdminComplaintDetailsPage() {
  const params = useParams<{ id: string }>();
  const complaints = useComplaints();
  const complaint = complaints.find((item) => item.id === params.id);

  if (!complaint) return <EmptyState title="Complaint not found" message="This complaint may no longer be available." action={<Link href="/admin/complaints" className="font-bold text-violet-700">Back to complaints</Link>} />;

  return (
    <div className="space-y-6">
      <header><Link href="/admin/complaints" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700"><ArrowLeft className="size-4" />Back to complaints</Link><h1 className="mt-4 text-3xl font-black text-slate-950">Complaint Details</h1><p className="mt-2 text-sm text-slate-500">Review the complaint, update its status and respond to the member.</p></header>
      <AdminComplaintDetails complaint={complaint} />
    </div>
  );
}
