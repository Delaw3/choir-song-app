import { TransactionItem } from "@/components/wallet/transaction-item";
import { creditsService } from "@/services/credits.service";

export default function AdminTransactionsPage() {
  return <AdminStack title="Transactions" eyebrow="Credit ledger">{creditsService.getTransactions().map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)}</AdminStack>;
}

function AdminStack({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-violet-700">{eyebrow}</p><h1 className="mt-1 text-3xl font-black text-slate-950">{title}</h1></header><section className="space-y-3">{children}</section></div>;
}
