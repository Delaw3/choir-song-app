"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useRoomsVersion } from "@/hooks/use-rooms";
import { roomsService } from "@/services/rooms.service";
import { RoomAuthError } from "@/types/room";

export function RoomMembers({ roomId, userId, bare = false }: { roomId: string; userId: string; bare?: boolean }) {
  const [version, bump] = useRoomsVersion();
  const [error, setError] = useState("");
  const room = useMemo(() => roomsService.getById(roomId), [roomId, version]);
  if (!room) return null;
  const owner = roomsService.isOwner(room, userId);

  function remove(memberId: string) {
    setError("");
    const current = roomsService.getById(roomId);
    if (!current) return;
    try {
      roomsService.removeMember(current.id, memberId, userId);
      bump();
    } catch (err) {
      setError(err instanceof RoomAuthError ? err.message : err instanceof Error ? err.message : "Couldn't remove member.");
    }
  }

  return (
    <div className={bare ? undefined : "rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"}>
      {!bare ? (
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Users className="size-4" />Members ({room.members.length})</h2>
      ) : null}
      {error ? <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <ul className="mt-3 space-y-2">
        {room.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{m.name}{m.userId === room.ownerId ? " · Owner" : ""}</p>
              <p className="text-xs capitalize text-slate-500">{m.voicePart ?? "No part yet"}</p>
            </div>
            {owner && m.userId !== room.ownerId ? (
              <button type="button" onClick={() => remove(m.userId)} className="text-xs font-semibold text-rose-600 hover:underline">Remove</button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
