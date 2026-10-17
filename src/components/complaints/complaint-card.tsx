import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ComplaintCategoryBadge } from "@/components/complaints/complaint-category-badge";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { formatDate } from "@/lib/utils";
import type { Complaint } from "@/types/complaint";

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Link
      href={`/complaints/${complaint.id}`}
      className="block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-100"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ComplaintStatusBadge status={complaint.status} />
            <ComplaintCategoryBadge category={complaint.category} />
          </div>
          <h3 className="mt-3 text-base font-black text-slate-950">{complaint.subject}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{complaint.message}</p>
          <p className="mt-3 text-xs font-semibold text-slate-400">Submitted {formatDate(complaint.createdAt)}</p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-slate-400" aria-hidden="true" />
      </div>
    </Link>
  );
}
