"use client";

import { useAuth } from "@/hooks/use-auth";

import type { Member } from "@/types/user";

/**
 * Returns a live member object derived from the authenticated user.
 * Returns `null` when no user is signed in.
 */
export function useCurrentMember(): Member | null {
  const auth = useAuth();
  if (auth.status === "authenticated" && auth.user) {
    const name = auth.user.name ?? "Member";
    const firstname = name.split(" ")[0] || name;
    const avatarInitials = name
      .split(" ")
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "MB";
    return {
      id: auth.user.id,
      name,
      firstname,
      email: auth.user.email,
      avatarInitials,
      creditBalance: auth.user.creditBalance ?? 84,
      joinedAt: "Active Member",
    };
  }
  return null;
}
