import "server-only";

import type { UserRole } from "@/lib/mongodb/types";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";

/** Verify the current session and return the authenticated user.
 *  Throws if the session is missing or invalid. */
export async function requireUser(): Promise<{ user: SessionUser; userId: string }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Authentication required.");
  }
  return {
    user: {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      emailVerified: sessionUser.emailVerified,
    },
    userId: sessionUser.id,
  };
}

/** True for privileged roles (`admin`, `superadmin`). */
export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}

/** Verify the current session and reject if the user is not an admin. */
export async function requireAdmin(): Promise<{ userId: string; role: UserRole }> {
  const { user, userId } = await requireUser();
  if (!isAdminRole(user.role)) {
    throw new Error("Administrator privileges required.");
  }
  return { userId, role: user.role };
}

/** Verify the current session and reject unless the user is a super admin. */
export async function requireSuperAdmin(): Promise<{ userId: string; role: UserRole }> {
  const { user, userId } = await requireUser();
  if (user.role !== "superadmin") {
    throw new Error("Super administrator privileges required.");
  }
  return { userId, role: user.role };
}

/** Verify the session and reject unless the user owns `resourceUserId` or
 *  holds an admin role. Returns the verified session user. */
export async function requireSelfOrAdmin(resourceUserId: string): Promise<SessionUser> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Authentication required.");
  }
  if (sessionUser.id !== resourceUserId && !isAdminRole(sessionUser.role)) {
    throw new Error("Forbidden: you can only access your own resources.");
  }
  return sessionUser;
}
