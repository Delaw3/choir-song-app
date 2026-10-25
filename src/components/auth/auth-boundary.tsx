"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/mongodb/types";

export function AuthBoundary({ role, children }: { role: UserRole | Array<UserRole>; children: ReactNode }) {
  const router = useRouter();
  const auth = useAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];
  const allowed =
    auth.status === "authenticated" &&
    auth.user !== null &&
    allowedRoles.includes(auth.user.role);

  useEffect(() => {
    if (auth.status === "loading" || allowed) return;
    if (auth.status === "unauthenticated") router.replace("/sign-in");
    else router.replace(auth.user?.role === "admin" ? "/admin" : "/home");
  }, [allowed, auth.status, auth.user?.role, router]);

  if (!allowed) {
    return <div className="mx-auto w-full max-w-md p-6"><LoadingState /></div>;
  }

  return children;
}

