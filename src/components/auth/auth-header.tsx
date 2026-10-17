import type { ReactNode } from "react";

export function AuthHeader({ eyebrow, title, description, icon }: { eyebrow?: string; title: string; description: string; icon?: ReactNode }) {
  return (
    <header className="mb-7">
      {icon ? <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">{icon}</div> : null}
      {eyebrow ? <p className="text-sm font-bold text-violet-700">{eyebrow}</p> : null}
      <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </header>
  );
}
