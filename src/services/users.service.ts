import { currentMember, members } from "@/data/users";

export const usersService = {
  getCurrentMember() {
    return currentMember;
  },
  getMembers() {
    return members;
  },
};
