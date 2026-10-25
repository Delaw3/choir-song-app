import type { Member } from "@/types/user";

export const usersService = {
  getCurrentMember(): Member {
    return {
      id: "guest-member",
      name: "Choir Member",
      firstname: "Member",
      email: "member@choir.app",
      avatarInitials: "CM",
      creditBalance: 84,
      joinedAt: "2026-01-01",
    };
  },

  async getMembers(): Promise<Member[]> {
    try {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members)) {
          return data.members;
        }
      }
    } catch {
      // Offline fallback
    }
    return [];
  },
};
