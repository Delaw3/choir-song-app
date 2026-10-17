import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function AuthError({ children }: { children: ReactNode }) {
  return <div role="alert" className="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700"><AlertCircle className="mt-0.5 size-4 shrink-0" />{children}</div>;
}

export function AuthSuccessState({ title, message, action }: { title: string; message: string; action: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-8" /></span>
      <h1 className="mt-6 text-3xl font-black text-slate-950">{title}</h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">{message}</p>
      <div className="mt-8 w-full">{action}</div>
    </div>
  );
}
