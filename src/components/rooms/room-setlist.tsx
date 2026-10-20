"use client";

import { useState } from "react";
import Link from "next/link";
import { Music2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoomsVersion } from "@/hooks/use-rooms";
import { roomsService } from "@/services/rooms.service";
import { songsService } from "@/services/songs.service";
import { RoomAuthError } from "@/types/room";
import { AddSongForm } from "@/components/rooms/add-song-form";
import { useMemo } from "react";

export function RoomSetlist({ roomId, userId }: { roomId: string; userId: string }) {
  const [version, bump] = useRoomsVersion();
  const room = useMemo(() => roomsService.getById(roomId), [roomId, version]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [songId, setSongId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [voicePart, setVoicePart] = useState("All voices");
  const [customPart, setCustomPart] = useState("");
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const catalog = useMemo(() => songsService.getPublished(), []);
  const songById = useMemo(() => new Map(catalog.map((s) => [s.id, s])), [catalog]);

  if (!room) return null;
  const owner = roomsService.isOwner(room, userId);
  const partLabel = voicePart === "Custom…" ? customPart : voicePart;

  function mutate(fn: () => void) {
    setError("");
    try {
      fn();
      bump();
    } catch (err) {
      setError(err instanceof RoomAuthError ? err.message : err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function addSong() {
    if (!songId || !sectionId) {
      setError("Pick a song and a section.");
      return;
    }
    const current = roomsService.getById(roomId);
    if (!current) return;
    mutate(() => {
      roomsService.addSong(current.id, songId, sectionId, partLabel, undefined, userId);
      setSongId("");
      setCustomPart("");
      setShowAdd(false);
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">Setlist</h2>
        {owner ? (
          <Button type="button" size="sm" variant={showAdd ? "secondary" : "primary"} onClick={() => setShowAdd((v) => !v)}>
            <Plus className="size-4" />{showAdd ? "Cancel" : "Add song"}
          </Button>
        ) : null}
      </div>
      {error ? <p role="alert" className="mb-3 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      {owner && showAdd ? (
        <AddSongForm
          catalog={catalog}
          sections={room.sections}
          songId={songId}
          sectionId={sectionId}
          voicePart={voicePart}
          customPart={customPart}
          onSong={setSongId}
          onSection={setSectionId}
          onPart={setVoicePart}
          onCustom={setCustomPart}
          onAdd={addSong}
        />
      ) : null}
      <div className="space-y-4">
        {room.sections.map((section) => {
          const items = room.items.filter((i) => i.sectionId === section.id);
          return (
            <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                {owner ? (
                  <button type="button" onClick={() => mutate(() => roomsService.removeSection(room.id, section.id, userId))} className="text-xs font-semibold text-rose-600 hover:underline" aria-label={`Remove ${section.title}`}>Remove</button>
                ) : null}
              </div>
              {items.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No songs here yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {items.map((item) => {
                    const song = songById.get(item.songId);
                    return (
                      <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Music2 className="size-4" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">{song?.title ?? item.songId}</p>
                          <p className="truncate text-xs text-slate-500">{item.voicePart}{song ? ` · ${song.composer}` : ""}</p>
                        </div>
                        {song ? <Link href={`/songs/${song.id}`} className="shrink-0 text-xs font-bold text-violet-700">Practice</Link> : null}
                        {owner ? (
                          <button type="button" onClick={() => mutate(() => roomsService.removeSong(room.id, item.id, userId))} className="flex size-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove song">
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {owner ? (
        <div className="mt-3 flex gap-2">
          <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="New section (e.g. Offertory)" aria-label="New section title" className="min-h-10 text-sm" />
          <Button type="button" size="sm" variant="secondary" onClick={() => mutate(() => { roomsService.addSection(room.id, sectionTitle, userId); setSectionTitle(""); })} disabled={!sectionTitle.trim()}>Add</Button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-400">Only {room.ownerName} (owner) can change this setlist.</p>
      )}
    </section>
  );
}
