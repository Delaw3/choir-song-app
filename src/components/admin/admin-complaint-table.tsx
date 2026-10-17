import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ComplaintCategoryBadge } from "@/components/complaints/complaint-category-badge";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { Complaint } from "@/types/complaint";

export function AdminComplaintTable({ complaints }: { complaints: Complaint[] }) {
  if (!complaints.length) return <EmptyState title="No complaints found" message="Try adjusting the search or filters." />;

  return (
    <>
      <div className="space-y-3 md:hidden">
        {complaints.map((complaint) => (
          <article key={complaint.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-black text-slate-950">{complaint.subject}</p><p className="mt-1 text-sm text-slate-500">{complaint.userName}</p></div>
              <ComplaintStatusBadge status={complaint.status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2"><ComplaintCategoryBadge category={complaint.category} /><span className="text-xs font-semibold text-slate-400">{formatDate(complaint.createdAt)}</span></div>
            <Link href={`/admin/complaints/${complaint.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700">Review complaint <ArrowUpRight className="size-4" /></Link>
          </article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Subject</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="text-sm">
                  <td className="px-5 py-4"><p className="font-bold text-slate-900">{complaint.userName}</p><p className="mt-1 text-xs text-slate-500">{complaint.userEmail}</p></td>
                  <td className="max-w-60 px-5 py-4 font-bold text-slate-900">{complaint.subject}</td>
                  <td className="px-5 py-4"><ComplaintCategoryBadge category={complaint.category} /></td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(complaint.createdAt)}</td>
                  <td className="px-5 py-4"><ComplaintStatusBadge status={complaint.status} /></td>
                  <td className="px-5 py-4 text-right"><Link href={`/admin/complaints/${complaint.id}`} className="inline-flex items-center gap-2 font-bold text-violet-700">Review <ArrowUpRight className="size-4" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
