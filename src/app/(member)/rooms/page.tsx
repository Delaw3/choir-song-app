"use client";

import { useMemo } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useRoomsVersion } from "@/hooks/use-rooms";
import { roomsService } from "@/services/rooms.service";
import { RoomNotFoundError } from "@/types/room";
import { RoomCard } from "@/components/rooms/room-card";

export default function RoomsPage() {
  const auth = useAuth();
  const userId = auth.user?.id ?? "member-demo";
  const displayName = auth.user?.name ?? "";
  const [version, bump] = useRoomsVersion();
  const rooms = useMemo(() => roomsService.listForUser(userId), [userId, version]);
  const refresh = bump;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function createRoom() {
    setError("");
    setNotice("");
    try {
      const room = roomsService.createRoom(name, description || undefined, { id: userId, name: displayName });
      setName("");
      setDescription("");
      setShowCreate(false);
      setNotice(`Room created. Share code ${room.code} with members.`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the room.");
    }
  }

  function joinRoom() {
    setError("");
    setNotice("");
    try {
      const room = roomsService.joinRoom(code, { id: userId, name: displayName });
      setCode("");
      setNotice(`Joined ${room.name}.`);
      refresh();
    } catch (err) {
      if (err instanceof RoomNotFoundError) setError(err.message);
      else setError(err instanceof Error ? err.message : "Couldn't join the room.");
    }
  }

  async function copyCode(roomCode: string) {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(roomCode);
      setTimeout(() => setCopied((c) => (c === roomCode ? null : c)), 1500);
    } catch {
      setError("Couldn't copy the code.");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Practice together</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Rooms</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Create a room, share its code, curate songs by section.</p>
      </header>
      {notice ? <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</p> : null}
      {error ? <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900">Join with a code</h2>
        <div className="mt-3 flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. BELL-AV03" aria-label="Room code" className="uppercase" />
          <Button type="button" onClick={joinRoom} disabled={!code.trim()}>Join</Button>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">Your rooms</h2>
          <Button type="button" size="sm" variant={showCreate ? "secondary" : "primary"} onClick={() => setShowCreate((v) => !v)}>
            <Plus className="size-4" />{showCreate ? "Cancel" : "New room"}
          </Button>
        </div>
        {showCreate ? (
          <div className="mb-4 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room name" aria-label="Room name" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" aria-label="Room description" />
            <Button type="button" className="w-full" onClick={createRoom} disabled={!name.trim()}>Create room</Button>
          </div>
        ) : null}
        {rooms.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">No rooms yet. Create one or join with a code.</p>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} userId={userId} copied={copied === room.code} onCopy={() => void copyCode(room.code)} />
            ))}
          </div>
        )}
      </section>
      <p className="text-xs leading-5 text-slate-400">Mock storage for now — rooms live in memory until the backend lands.</p>
    </div>
  );
}
