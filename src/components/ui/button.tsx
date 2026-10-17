import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-violet-700 text-white shadow-lg shadow-violet-700/20 hover:bg-violet-800",
        variant === "secondary" && "border border-violet-100 bg-white text-violet-800 hover:bg-violet-50",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
        size === "sm" && "min-h-10 px-3 text-sm",
        size === "md" && "min-h-12 px-5 text-sm",
        size === "lg" && "min-h-14 px-6 text-base",
        className,
      )}
      {...props}
    />
  );
}
