"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { roomsService } from "@/services/rooms.service";
import { RoomSetlist } from "@/components/rooms/room-setlist";
import { RoomMembers } from "@/components/rooms/room-members";

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth();
  const userId = auth.user?.id ?? "member-demo";
  const [error, setError] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  // Re-read on every render: the mock store is module-local, and setlist /
  // member children bump their own state which re-renders this tree.
  const room = useMemo(() => roomsService.getById(params.id), [params.id]);

  if (!room) {
    return (
      <div className="space-y-4">
        <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"><ArrowLeft className="size-4" />Rooms</Link>
        <p className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">Room not found.</p>
      </div>
    );
  }

  const owner = roomsService.isOwner(room, userId);

  function deleteRoom() {
    const current = roomsService.getById(params.id);
    if (!current) return;
    if (!window.confirm(`Delete ${current.name}? Members lose access.`)) return;
    try {
      roomsService.deleteRoom(current.id, userId);
      router.replace("/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete the room.");
    }
  }

  function leaveRoom() {
    const current = roomsService.getById(params.id);
    if (!current) return;
    try {
      roomsService.leaveRoom(current.id, userId);
      router.replace("/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't leave the room.");
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700"><ArrowLeft className="size-4" />Rooms</Link>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{room.name}</h1>
            {owner ? <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-800">Owner</span> : null}
          </div>
          {room.description ? <p className="mt-1 text-sm text-slate-500">{room.description}</p> : null}
          <p className="mt-2 text-xs font-bold text-slate-500">Code: <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">{room.code}</span></p>
        </div>
        <button
          type="button"
          onClick={() => setShowMembers(true)}
          className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm transition hover:bg-violet-50"
          aria-label={`View ${room.members.length} members`}
        >
          <Users className="size-5" />
          <span className="absolute -right-1 -top-1 flex min-size-5 min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-bold text-white">
            {room.members.length}
          </span>
        </button>
      </header>
      {error ? <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <RoomSetlist roomId={room.id} userId={userId} />
      {owner ? (
        <Button type="button" variant="danger" className="w-full" onClick={deleteRoom}>Delete room</Button>
      ) : (
        <Button type="button" variant="secondary" className="w-full" onClick={leaveRoom}>Leave room</Button>
      )}
      {showMembers ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`${room.name} members`}>
          <button type="button" aria-label="Close members" onClick={() => setShowMembers(false)} className="absolute inset-0 bg-slate-950/50" />
          <div className="relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-4xl bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl sm:rounded-4xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-950"><Users className="size-4" />Members ({room.members.length})</h2>
              <button
                type="button"
                onClick={() => setShowMembers(false)}
                className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <RoomMembers roomId={room.id} userId={userId} bare />
          </div>
        </div>
      ) : null}
    </div>
  );
}
