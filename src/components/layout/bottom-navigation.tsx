"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Music2, Users, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Rooms", href: "/rooms", icon: Users },
  { label: "Songs", href: "/songs", icon: Music2 },
  { label: "Library", href: "/library", icon: Library },
  { label: "Wallet", href: "/wallet", icon: WalletCards },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const isSongs = item.href === "/songs";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition",
                isActive
                  ? "bg-violet-100 text-violet-800"
                  : isSongs
                  ? "text-slate-500 hover:bg-slate-100 hover:text-violet-800"
                  : "text-slate-500 hover:bg-slate-100",
              )}
            >
              <Icon className={cn("size-5", isSongs && "text-violet-800")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
