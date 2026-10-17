import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreditBadge({ credits, className }: { credits: number | string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800", className)}>
      <Coins className="size-3.5" />
      {credits}
    </span>
  );
}
