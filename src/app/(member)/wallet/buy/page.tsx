"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { CreditPackageCard } from "@/components/wallet/credit-package-card";
import { creditsService } from "@/services/credits.service";
import { formatNaira } from "@/lib/utils";

export default function BuyCreditsPage() {
  const packages = creditsService.getPackages();
  const [selectedId, setSelectedId] = useState(packages[1]?.id ?? packages[0]?.id);
  const [confirming, setConfirming] = useState(false);
  const selected = packages.find((pack) => pack.id === selectedId) ?? packages[0];

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/wallet">
          <IconButton label="Back">
            <ArrowLeft className="size-5" />
          </IconButton>
        </Link>
        <div>
          <p className="text-sm font-semibold text-violet-700">Top up</p>
          <h1 className="text-2xl font-black text-slate-950">Buy Credits</h1>
        </div>
      </header>
      <div className="space-y-3">
        {packages.map((pack) => <CreditPackageCard key={pack.id} pack={pack} selected={pack.id === selectedId} onSelect={() => setSelectedId(pack.id)} />)}
      </div>
      <Button className="w-full" size="lg" onClick={() => setConfirming(true)}>Continue</Button>
      <BottomSheet open={confirming} title="Confirm package" onClose={() => setConfirming(false)}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            You selected <strong>{selected.credits} credits</strong> for <strong>{formatNaira(selected.price)}</strong>. Payment integration is intentionally isolated and will be connected later.
          </p>
          <Button className="w-full" onClick={() => setConfirming(false)}>Looks good</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
