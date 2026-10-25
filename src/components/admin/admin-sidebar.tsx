"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  ExternalLink,
  Gauge,
  ListMusic,
  Menu,
  MessageSquareText,
  ReceiptText,
  Settings,
  Tags,
  Users,
  WalletCards,
  X,
} from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (Untouched: fixed on left on lg screens) */}
      {/* ============================================================ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-full flex-col p-4">
          <Link href="/admin" className="mb-5 flex items-center gap-3 rounded-2xl px-2 py-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-700 text-lg font-black text-white">
              C
            </span>
            <span>
              <span className="block text-sm font-black text-slate-950">ChoirTrain</span>
              <span className="block text-xs font-semibold text-slate-500">Admin console</span>
            </span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition",
                    isActive
                      ? "bg-violet-700 text-white shadow-lg shadow-violet-700/20"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-slate-100 pt-3">
            <Link
              href="/home"
              className="flex min-h-11 items-center gap-2 rounded-2xl px-4 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ExternalLink className="size-3.5" />
              Switch to Member App
            </Link>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE TOP BAR WITH MENU ICON AT TOP RIGHT (lg:hidden)   */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-violet-700 text-xs font-black text-white">
            C
          </span>
          <span className="text-sm font-black tracking-tight text-slate-950">
            ChoirTrain <span className="text-xs font-bold text-violet-700">Admin</span>
          </span>
        </Link>

        {/* Menu icon button placed at top right */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close admin menu" : "Open admin menu"}
          aria-expanded={mobileMenuOpen}
          className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 shadow-xs transition hover:bg-slate-100 active:scale-95"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* ============================================================ */}
      {/* 3. MOBILE MENU (Opened via top right menu icon)             */}
      {/* ============================================================ */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over menu panel from top-right */}
          <div className="fixed inset-y-0 right-0 flex w-[300px] max-w-[85vw] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-xl bg-violet-700 text-xs font-black text-white">
                  C
                </span>
                <span className="text-sm font-black text-slate-950">Admin Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Navigation links inside menu */}
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition active:scale-[0.98]",
                      isActive
                        ? "bg-violet-700 text-white shadow-md shadow-violet-700/20"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Icon className="size-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Switch to Member App */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <ExternalLink className="size-3.5" />
                Switch to Member App
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
