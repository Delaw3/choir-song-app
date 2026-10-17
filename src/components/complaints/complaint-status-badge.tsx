import { complaintStatusLabels } from "@/constants/complaints";
import { cn } from "@/lib/utils";
import type { ComplaintStatus } from "@/types/complaint";

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-bold",
        status === "OPEN" && "bg-amber-50 text-amber-700",
        status === "IN_REVIEW" && "bg-violet-100 text-violet-800",
        status === "RESOLVED" && "bg-emerald-50 text-emerald-700",
      )}
    >
      {complaintStatusLabels[status]}
    </span>
  );
}
