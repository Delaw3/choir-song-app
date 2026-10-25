"use client";

import { useState } from "react";
import { Info, Database, ShieldCheck, Layers, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isStorageEnabled, getStorageKind } from "@/lib/storage";

export default function AdminSettingsPage() {
  const [storageEnabled, setStorageEnabled] = useState<boolean | null>(null);
  const [storageKind, setStorageKind] = useState<string | null>(null);

  const appName = "ChoirSong";
  const creditRules = [
    { label: "Credits per part stream", value: "1 credit" },
    { label: "Credits per sheet download", value: "3 credits" },
    { label: "Welcome bonus credits", value: "50 credits" },
    { label: "Minimum purchase", value: "10 credits" },
  ];

  function checkStatus() {
    setStorageEnabled(isStorageEnabled());
    setStorageKind(getStorageKind());
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-violet-700">Workspace</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Settings</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card icon={<Info className="size-5 text-blue-600" />} title="App identity" subtitle="Branding shown across the app.">
          <Input defaultValue={appName} disabled className="bg-slate-100" />
          <p className="mt-2 text-xs text-slate-500">Site name and brand assets. Logo upload coming soon.</p>
        </Card>
        <Card icon={<ShieldCheck className="size-5 text-emerald-600" />} title="Roles & permissions" subtitle="Admin, member, and guest access.">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><span className="w-6 text-slate-300">●</span> Admin: full catalog & user management</div>
            <div className="flex items-center gap-2"><span className="w-6 text-slate-300">●</span> Member: stream parts, buy credits</div>
            <div className="flex items-center gap-2"><span className="w-6 text-slate-300">●</span> Guest: preview catalog only</div>
          </div>
        </Card>
        <Card icon={<Layers className="size-5 text-violet-600" />} title="Credit rules" subtitle="Pricing for streams and sheet downloads.">
          <div className="space-y-2 text-sm text-slate-600">
            {creditRules.map((rule) => (
              <div key={rule.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{rule.label}</span>
                <span className="font-semibold">{rule.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-950">Storage & Firebase</h2>
          <Button variant="ghost" size="sm" onClick={checkStatus}>
            <Info className="mr-2 size-4" /> Check status
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <SettingRow label="Database" icon={<Database className="size-4" />} value="MongoDB" />
          <SettingRow label="Storage" icon={<Layers className="size-4" />} value={storageKind === "none" ? "Not configured" : storageKind ?? "unknown"} />
          <SettingRow label="Storage enabled" icon={<ShieldCheck className="size-4" />} value={storageEnabled === true ? "Yes" : storageEnabled === false ? "No" : "Unknown"} />
        </div>
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
          <p className="font-semibold">Supabase Storage setup required</p>
          <p className="mt-1 text-amber-600">
            Set <code className="bg-amber-200 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-200 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="bg-amber-200 px-1.5 py-0.5 rounded">.env.local</code>, then restart the dev server.
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-950 mb-4">Payments</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Card icon={<CreditCard className="size-5 text-amber-600" />} title="Payment providers" subtitle="Paystack and Flutterwave integration.">
            <div className="text-sm text-slate-600">Configure provider keys in <code className="bg-slate-100 px-1.5 py-0.5 rounded">.env.local</code> to enable member top-ups.</div>
          </Card>
          <Card icon={<CreditCard className="size-5 text-amber-600" />} title="Credit packages" subtitle="Predefined credit bundles for purchase.">
            <div className="text-sm text-slate-600">10 / 25 / 50 / 100 credits. Editable in MongoDB.</div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Card({ icon, title, subtitle, children }: { icon: React.ReactElement; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-500">{icon}</div>
        <div>
          <p className="font-black text-slate-950">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, icon, value }: { label: string; icon: React.ReactElement; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 flex items-center gap-3">
      <div className="rounded-xl bg-slate-50 p-1.5 text-slate-400">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 uppercase font-semibold">{label}</p>
        <p className="font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
