import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/layout/bottom-navigation";

export function MemberShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <main className="mx-auto min-h-dvh w-full max-w-md bg-slate-50 px-4 pb-28 pt-5 shadow-2xl shadow-slate-300/40 sm:px-5">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
