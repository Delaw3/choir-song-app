import { DEFAULT_ROOM_SECTIONS, RoomAuthError, RoomNotFoundError } from "@/types/room";
import type { PracticeRoom } from "@/types/room";
const seedRooms: PracticeRoom[] = [
  {
    id: "room-bella-voce",
    code: "BELL-AV03",
    name: "Bella Voce Choir",
    description: "Setlist for this Sunday's Mass.",
    ownerId: "member-demo",
    ownerName: "Amara Okafor",
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    members: [
      { userId: "member-demo", name: "Amara Okafor", voicePart: "soprano", joinedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() },
      { userId: "member-demo-2", name: "Tunde Bakare", voicePart: "tenor", joinedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
      { userId: "member-demo-3", name: "Grace Mensah", voicePart: "alto", joinedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { userId: "member-demo-4", name: "Chidi Eze", voicePart: "bass", joinedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    ],
    sections: [
      { id: "sec-entrance", title: "Entrance", sortOrder: 0 },
      { id: "sec-offertory", title: "Offertory", sortOrder: 1 },
      { id: "sec-communion", title: "Communion", sortOrder: 2 },
      { id: "sec-recessional", title: "Recessional", sortOrder: 3 },
    ],
    items: [
      { id: "item-1", songId: "gloria-in-excelsis", sectionId: "sec-entrance", voicePart: "All voices", addedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
      { id: "item-2", songId: "kyrie-eleison", sectionId: "sec-entrance", voicePart: "Soprano 1", addedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
      { id: "item-3", songId: "ave-verum-corpus", sectionId: "sec-communion", voicePart: "All voices", addedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    ],
  },
];

let rooms: PracticeRoom[] = structuredClone(seedRooms);

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeCode(name: string): string {
  const stem = name
    .replace(/[^a-z0-9]+/gi, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `${stem}-${rand}`;
}

function clone(room: PracticeRoom): PracticeRoom {
  return structuredClone(room);
}

function findById(roomId: string): PracticeRoom {
  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw new RoomNotFoundError();
  return room;
}

function assertOwner(room: PracticeRoom, userId: string): void {
  if (room.ownerId !== userId) throw new RoomAuthError();
}


export const roomsService = {
  reset(): void {
    rooms = structuredClone(seedRooms);
  },

  listForUser(userId: string): PracticeRoom[] {
    return rooms
      .filter((room) => room.ownerId === userId || room.members.some((m) => m.userId === userId))
      .map(clone);
  },

  getById(roomId: string): PracticeRoom | undefined {
    const room = rooms.find((r) => r.id === roomId);
    return room ? clone(room) : undefined;
  },

  getByCode(code: string): PracticeRoom | undefined {
    const normalized = code.trim().toUpperCase();
    const room = rooms.find((r) => r.code.toUpperCase() === normalized);
    return room ? clone(room) : undefined;
  },

  isOwner(room: PracticeRoom, userId: string): boolean {
    return room.ownerId === userId;
  },

  isMember(room: PracticeRoom, userId: string): boolean {
    return room.ownerId === userId || room.members.some((m) => m.userId === userId);
  },

  createRoom(name: string, description: string | undefined, owner: { id: string; name: string }): PracticeRoom {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Give your room a name.");
    const createdAt = nowIso();
    const room: PracticeRoom = {
      id: makeId("room"),
      code: makeCode(cleanName),
      name: cleanName,
      description: description?.trim() || undefined,
      ownerId: owner.id,
      ownerName: owner.name,
      createdAt,
      members: [{ userId: owner.id, name: owner.name, voicePart: null, joinedAt: createdAt }],
      sections: DEFAULT_ROOM_SECTIONS.map((s, index) => ({ id: makeId("sec"), title: s.title, sortOrder: index })),
      items: [],
    };
    rooms = [room, ...rooms];
    return clone(room);
  },

  joinRoom(code: string, user: { id: string; name: string }): PracticeRoom {
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw new RoomNotFoundError("Enter the room code shared by the owner.");
    const room = rooms.find((r) => r.code.toUpperCase() === normalized);
    if (!room) throw new RoomNotFoundError();
    if (!room.members.some((m) => m.userId === user.id)) {
      room.members = [...room.members, { userId: user.id, name: user.name, voicePart: null, joinedAt: nowIso() }];
    }
    return clone(room);
  },

  leaveRoom(roomId: string, userId: string): void {
    const room = findById(roomId);
    if (room.ownerId === userId) throw new RoomAuthError("Owners can't leave their own room. Delete it instead.");
    room.members = room.members.filter((m) => m.userId !== userId);
  },

  deleteRoom(roomId: string, userId: string): void {
    const room = findById(roomId);
    assertOwner(room, userId);
    rooms = rooms.filter((r) => r.id !== roomId);
  },

  addSection(roomId: string, title: string, userId: string): PracticeRoom {
    const room = findById(roomId);
    assertOwner(room, userId);
    const clean = title.trim();
    if (!clean) throw new Error("Give the section a title (e.g. Entrance).");
    room.sections = [...room.sections, { id: makeId("sec"), title: clean, sortOrder: room.sections.length }];
    return clone(room);
  },

  renameSection(roomId: string, sectionId: string, title: string, userId: string): PracticeRoom {
    const room = findById(roomId);
    assertOwner(room, userId);
    const clean = title.trim();
    if (!clean) throw new Error("Give the section a title.");
    room.sections = room.sections.map((s) => (s.id === sectionId ? { ...s, title: clean } : s));
    return clone(room);
  },

  removeSection(roomId: string, sectionId: string, userId: string): PracticeRoom {
    const room = findById(roomId);
    assertOwner(room, userId);
    room.sections = room.sections.filter((s) => s.id !== sectionId);
    room.items = room.items.filter((i) => i.sectionId !== sectionId);
    return clone(room);
  },

  /** Owner-only: add a catalog song to a section with a named voice part. */
  addSong(roomId: string, songId: string, sectionId: string, voicePart: string, note: string | undefined, userId: string): PracticeRoom {
    const room = findById(roomId);
    assertOwner(room, userId);
    if (!room.sections.some((s) => s.id === sectionId)) throw new Error("Pick a section first.");
    const part = voicePart.trim();
    if (!part) throw new Error("Name the part (e.g. Soprano 1 or All voices).");
    const dupe = room.items.some(
      (i) => i.songId === songId && i.sectionId === sectionId && i.voicePart.toLowerCase() === part.toLowerCase(),
    );
    if (dupe) throw new Error("That song + part is already in this section.");
    room.items = [...room.items, { id: makeId("item"), songId, sectionId, voicePart: part, note: note?.trim() || undefined, addedAt: nowIso() }];
    return clone(room);
  },

  removeSong(roomId: string, itemId: string, userId: string): PracticeRoom {
    const room = findById(roomId);
    assertOwner(room, userId);
    room.items = room.items.filter((i) => i.id !== itemId);
    return clone(room);
  },

  setMemberVoicePart(
    roomId: string,
    memberId: string,
    voicePart: "soprano" | "alto" | "tenor" | "bass" | null,
    actorId: string,
  ): PracticeRoom {
    const room = findById(roomId);
    if (actorId !== room.ownerId && actorId !== memberId) throw new RoomAuthError();
    room.members = room.members.map((m) => (m.userId === memberId ? { ...m, voicePart } : m));
    return clone(room);
  },

  removeMember(roomId: string, memberId: string, actorId: string): PracticeRoom {
    const room = findById(roomId);
    if (actorId !== room.ownerId && actorId !== memberId) throw new RoomAuthError();
    if (memberId === room.ownerId) throw new RoomAuthError("The owner can't be removed.");
    room.members = room.members.filter((m) => m.userId !== memberId);
    return clone(room);
  },
};