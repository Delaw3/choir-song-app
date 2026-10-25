"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelClassName?: string;
  error?: string;
};

export function PasswordInput({ label, labelClassName, error, id, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div>
      <label className={cn("mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600", labelClassName)} htmlFor={inputId}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Lock className="pointer-events-none absolute left-3.5 size-4 text-slate-400" />
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            "min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:ring-4 focus:ring-violet-500/10",
            error && "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/10",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error ? <p id={errorId} className="mt-1.5 text-xs font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
