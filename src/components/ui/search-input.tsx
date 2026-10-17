"use client";

import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SearchInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("flex min-h-13 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm", className)}>
      <Search className="size-5 text-slate-400" />
      <input className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" {...props} />
    </label>
  );
}
