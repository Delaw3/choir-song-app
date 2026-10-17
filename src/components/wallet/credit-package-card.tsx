"use client";

import { Check } from "lucide-react";
import { cn, formatNaira } from "@/lib/utils";
import type { CreditPackage } from "@/types/user";

export function CreditPackageCard({ pack, selected, onSelect }: { pack: CreditPackage; selected?: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-3xl border bg-white p-4 text-left shadow-sm transition",
        selected ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200 hover:border-violet-200",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-black text-slate-950">{pack.credits} Credits</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{formatNaira(pack.price)}</p>
        </div>
        {selected ? <span className="flex size-8 items-center justify-center rounded-full bg-violet-700 text-white"><Check className="size-4" /></span> : null}
      </div>
      {pack.label ? <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{pack.label}</span> : null}
    </button>
  );
}
