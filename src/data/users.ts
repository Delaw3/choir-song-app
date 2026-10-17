import type { Member } from "@/types/user";

export const currentMember: Member = {
  id: "member-001",
  name: "Amara Okafor",
  email: "amara.okafor@example.com",
  avatarInitials: "AO",
  creditBalance: 84,
  joinedAt: "2026-01-12",
};

export const members: Member[] = [
  currentMember,
  { id: "member-002", name: "David Mensah", email: "david.mensah@example.com", avatarInitials: "DM", creditBalance: 26, joinedAt: "2026-02-03" },
  { id: "member-003", name: "Chioma Adeleke", email: "chioma.adeleke@example.com", avatarInitials: "CA", creditBalance: 142, joinedAt: "2026-03-18" },
  { id: "member-004", name: "Samuel King", email: "samuel.king@example.com", avatarInitials: "SK", creditBalance: 9, joinedAt: "2026-04-24" },
];
