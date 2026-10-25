import type { WithId, UserDoc } from "@/lib/mongodb/types";
import type { Member } from "@/types/user";

export function toMember(doc: WithId<UserDoc>): Member {
  const initials = doc.displayName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: doc.id,
    name: doc.displayName,
    firstname: doc.displayName.split(" ")[0],
    email: doc.email ?? "",
    avatarInitials: initials || "MB",
    creditBalance: doc.creditBalance,
    joinedAt: doc.createdAt.toISOString().slice(0, 10),
  };
}