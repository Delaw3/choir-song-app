import type { ReactNode } from "react";
import Link from "next/link";
import { Music2 } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-stretch justify-center bg-slate-100 text-slate-950 sm:items-center sm:p-6">
      <div className="flex min-h-dvh w-full max-w-md flex-col bg-slate-50 px-4 py-6 sm:min-h-0 sm:rounded-[2rem] sm:px-8 sm:py-8 sm:shadow-2xl sm:shadow-slate-300/50">
        <Link href="/welcome" className="mb-8 inline-flex w-fit items-center gap-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-100">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-700 text-white"><Music2 className="size-5" /></span>
          <span className="text-sm font-black text-slate-950">Choir Training</span>
        </Link>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </main>
  );
}
