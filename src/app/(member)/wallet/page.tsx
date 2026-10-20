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
      <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
        <p className="text-sm font-semibold text-slate-300">Available balance</p>
        <p className="mt-2 text-5xl font-black">{member.creditBalance}</p>
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
