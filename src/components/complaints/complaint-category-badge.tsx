import { complaintCategoryLabels } from "@/constants/complaints";
import type { ComplaintCategory } from "@/types/complaint";

export function ComplaintCategoryBadge({ category }: { category: ComplaintCategory }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-600">
      {complaintCategoryLabels[category]}
    </span>
  );
}
