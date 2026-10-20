import type { VoiceType } from "@/types/song";

/**
 * Practice rooms (mock-first).
 *
 * A room is a member-owned group library: the owner curates songs into named
 * sections (entrance, offertory, communion, recessional, …), members join via
 * the room code, and members practice the room's setlist. Only the owner can
 * add/remove songs or rename sections — enforced in `rooms.service.ts` by
 * comparing `ownerId` to the signed-in user.
 *
 * Backend mapping (later task, no backend calls here):
 * - `rooms/{roomId}` — { name, code, ownerId, createdAt, updatedAt }
 * - `rooms/{roomId}/members/{userId}` — { userId, name, voicePart?, joinedAt }
 * - `rooms/{roomId}/sections/{sectionId}` — { title, sortOrder }
 * - `rooms/{roomId}/items/{itemId}` — { songId, sectionId, voicePart, note? }
 */

export type RoomVoicePart = VoiceType | "all";

export interface RoomMember {
  userId: string;
  name: string;
  /** Voice part the member sings in this room (owner-assigned or self-picked). */
  voicePart: VoiceType | null;
  joinedAt: string;
}

export interface RoomSection {
  id: string;
  title: string;
  sortOrder: number;
}

export interface RoomSongItem {
  id: string;
  songId: string;
  sectionId: string;
  /** Named part this entry belongs to (e.g. "Soprano 1", "All voices"). */
  voicePart: string;
  note?: string;
  addedAt: string;
}

export interface PracticeRoom {
  id: string;
  /** Short human code members type to join (e.g. "BELL-AV03"). */
  code: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  members: RoomMember[];
  sections: RoomSection[];
  items: RoomSongItem[];
}

export interface CreateRoomInput {
  name: string;
  description?: string;
}

export interface AddRoomSongInput {
  songId: string;
  sectionId: string;
  /** Free-form part label; presets offered by UI. */
  voicePart: string;
  note?: string;
}

export interface JoinRoomInput {
  code: string;
}

export class RoomAuthError extends Error {
  constructor(message = "Only the room owner can change the setlist.") {
    super(message);
    this.name = "RoomAuthError";
  }
}

export class RoomNotFoundError extends Error {
  constructor(message = "Room not found. Check the code and try again.") {
    super(message);
    this.name = "RoomNotFoundError";
  }
}

/** Default sections every new room starts with (owner can rename/remove). */
export const DEFAULT_ROOM_SECTIONS: Array<{ title: string }> = [
  { title: "Entrance" },
  { title: "Offertory" },
  { title: "Communion" },
  { title: "Recessional" },
];

/** Preset part labels offered when the owner adds a song. */
export const ROOM_PART_PRESETS: string[] = [
  "All voices",
  "Soprano 1",
  "Soprano 2",
  "Alto",
  "Alto 1",
  "Alto 2",
  "Tenor 1",
  "Tenor 2",
  "Bass",
];
