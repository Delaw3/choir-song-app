import type { ReactNode } from "react";
import { AuthBoundary } from "@/components/auth/auth-boundary";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthBoundary role="admin"><AdminShell>{children}</AdminShell></AuthBoundary>;
}
