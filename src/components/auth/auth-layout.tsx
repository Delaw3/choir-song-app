import type { ReactNode } from "react";
import Link from "next/link";
import { Music2 } from "lucide-react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-stretch justify-center bg-slate-100 text-slate-950 sm:items-center sm:p-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(109,40,217,0.12),transparent)]" aria-hidden="true" />
      <div className="relative flex min-h-dvh w-full max-w-md flex-col border-slate-200 bg-white px-5 py-6 sm:min-h-0 sm:rounded-[2rem] sm:border sm:px-8 sm:py-8 sm:shadow-2xl sm:shadow-slate-300/40">
        <Link href="/welcome" className="mb-6 flex justify-center rounded-xl focus:outline-none focus:ring-4 focus:ring-violet-100" aria-label="Back to welcome">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-700 text-white"><Music2 className="size-5" /></span>
        </Link>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </main>
  );
}
