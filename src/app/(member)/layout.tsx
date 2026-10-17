import type { ReactNode } from "react";
import { AuthBoundary } from "@/components/auth/auth-boundary";
import { MemberShell } from "@/components/layout/member-shell";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <AuthBoundary role="member"><MemberShell>{children}</MemberShell></AuthBoundary>;
}
