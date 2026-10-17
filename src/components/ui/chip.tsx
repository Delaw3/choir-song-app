import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({ children, active, className }: { children: ReactNode; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold",
        active ? "border-violet-700 bg-violet-700 text-white" : "border-slate-200 bg-white text-slate-600",
        className,
      )}
    >
      {children}
    </span>
  );
}
