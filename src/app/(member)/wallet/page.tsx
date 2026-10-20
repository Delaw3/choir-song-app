import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransactionItem } from "@/components/wallet/transaction-item";
import { creditsService } from "@/services/credits.service";
import { usersService } from "@/services/users.service";

export default function WalletPage() {
  const member = usersService.getCurrentMember();
  const transactions = creditsService.getTransactions();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-violet-700">Credits</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Wallet</h1>
      </header>
      <section className="relative rounded-[2rem] bg-gradient-to-br from-violet-50/55 via-white/45 to-violet-100/55 backdrop-blur-md border border-violet-200/60 p-5 shadow-[0_8px_32px_rgba(109,40,217,0.12)] overflow-hidden">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-70 pointer-events-none" />
        <p className="relative z-10 text-sm font-semibold text-violet-700">Available balance</p>
        <p className="relative z-10 mt-2 text-5xl font-black text-violet-900">{member.creditBalance}</p>
        <Link href="/wallet/buy" className="mt-5 block">
          <Button className="w-full" variant="secondary">Buy credits</Button>
        </Link>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-black text-slate-950">Recent credit activity</h2>
        <div className="space-y-3">
          {transactions.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)}
        </div>
      </section>
    </div>
  );
}
