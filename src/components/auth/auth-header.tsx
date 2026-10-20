import type { ReactNode } from "react";

export function AuthHeader({ eyebrow, title, description, icon }: { eyebrow?: string; title: string; description?: string; icon?: ReactNode }) {
  return (
    <header className="mb-6">
      {icon ? <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">{icon}</div> : null}
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-widest text-violet-700">{eyebrow}</p> : null}
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
    </header>
  );
}
