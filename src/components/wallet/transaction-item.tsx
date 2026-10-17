import { cn } from "@/lib/utils";
import type { CreditTransaction } from "@/types/user";

export function TransactionItem({ transaction }: { transaction: CreditTransaction }) {
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-950">{transaction.title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{transaction.detail} • {transaction.date}</p>
      </div>
      <span className={cn("shrink-0 text-sm font-black", isPositive ? "text-emerald-600" : "text-slate-700")}>
        {isPositive ? "+" : ""}
        {transaction.amount}
      </span>
    </div>
  );
}
