import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordRequirements({ password }: { password: string }) {
  const valid = password.length >= 8;
  return <p className={cn("mt-2 flex items-center gap-2 text-xs font-semibold", valid ? "text-emerald-600" : "text-slate-500")}><Check className="size-3.5" />At least 8 characters</p>;
}
