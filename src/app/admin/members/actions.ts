"use server";

import { getLiveMembers, updateUserAdmin } from "@/lib/mongodb/repos/users.repo";
import { requireAdmin } from "@/lib/auth/require";
import type { Member } from "@/types/user";
import type { UserRole } from "@/lib/mongodb/types";

export async function getMembersAction(): Promise<Member[]> {
  await requireAdmin();
  return getLiveMembers(200);
}

export async function updateMemberAction(
  userId: string,
  input: {
    displayName?: string;
    email?: string;
    creditBalance?: number;
    status?: "active" | "suspended" | "pending";
    role?: UserRole;
  },
): Promise<Member> {
  await requireAdmin();
  return updateUserAdmin(userId, input);
}
