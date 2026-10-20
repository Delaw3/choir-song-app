"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  label: string;
  labelClassName?: string;
  error?: string;
};

export function PasswordInput({ label, labelClassName, error, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div>
      <label className={cn("mb-2 block text-sm font-bold text-slate-700", labelClassName)} htmlFor={inputId}>{label}</label>
      <span className="relative block">
        <Input id={inputId} type={visible ? "text" : "password"} className="pr-12" aria-invalid={Boolean(error)} aria-describedby={errorId} {...props} />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} onClick={() => setVisible((value) => !value)} className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400">
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </span>
      {error ? <p id={errorId} className="mt-1.5 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
