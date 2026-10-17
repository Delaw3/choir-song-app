import { creditsService } from "@/services/credits.service";
import { formatNaira } from "@/lib/utils";

export default function AdminCreditsPage() {
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold text-violet-700">Wallet rules</p><h1 className="mt-1 text-3xl font-black text-slate-950">Credits</h1></header>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {creditsService.getPackages().map((pack) => <div key={pack.id} className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-2xl font-black text-slate-950">{pack.credits}</p><p className="mt-1 text-sm font-bold text-slate-500">{formatNaira(pack.price)}</p></div>)}
      </section>
    </div>
  );
}
