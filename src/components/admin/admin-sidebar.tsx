"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, Gauge, ListMusic, MessageSquareText, Settings, Tags, Users, WalletCards, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

const adminItems = [
  { label: "Dashboard", href: "/admin", icon: Gauge },
  { label: "Songs", href: "/admin/songs", icon: ListMusic },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Members", href: "/admin/members", icon: Users },
  { label: "Credits", href: "/admin/credits", icon: WalletCards },
  { label: "Transactions", href: "/admin/transactions", icon: ReceiptText },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Complaints", href: "/admin/complaints", icon: MessageSquareText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col p-4">
        <Link href="/admin" className="mb-5 flex items-center gap-3 rounded-2xl px-2 py-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-700 text-lg font-black text-white">C</span>
          <span>
            <span className="block text-sm font-black text-slate-950">ChoirTrain</span>
            <span className="block text-xs font-semibold text-slate-500">Admin console</span>
          </span>
        </Link>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition",
                  isActive ? "bg-violet-700 text-white shadow-lg shadow-violet-700/20" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
