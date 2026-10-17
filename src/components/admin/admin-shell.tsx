import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <AdminSidebar />
      <main className="p-4 lg:ml-72 lg:p-8">{children}</main>
    </div>
  );
}
