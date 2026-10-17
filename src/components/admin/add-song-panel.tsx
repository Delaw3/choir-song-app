"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VoiceType } from "@/types/song";

type DraftPart = {
  id: string;
  voiceType: VoiceType;
  partNumber: string;
  displayName: string;
  audioFile: string;
  duration: string;
  creditCost: string;
};

const voiceTypes: VoiceType[] = ["soprano", "alto", "tenor", "bass"];

export function AddSongPanel() {
  const [parts, setParts] = useState<DraftPart[]>([
    { id: "part-1", voiceType: "soprano", partNumber: "1", displayName: "Soprano 1", audioFile: "", duration: "214", creditCost: "2" },
  ]);

  const addPart = () => {
    setParts((items) => [
      ...items,
      { id: `part-${items.length + 1}`, voiceType: "alto", partNumber: "", displayName: "Alto", audioFile: "", duration: "", creditCost: "2" },
    ]);
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Add Song</h2>
          <p className="mt-1 text-sm text-slate-500">Draft UI only. Persistence will connect to Firebase or the backend later.</p>
        </div>
        <Button size="sm">Save draft</Button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Input placeholder="Song title" />
        <Input placeholder="Composer" />
        <select className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none">
          <option>Mass</option>
          <option>Communion</option>
          <option>Anthems</option>
        </select>
        <Input placeholder="Credit cost" type="number" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Training parts</h3>
        <Button type="button" variant="secondary" size="sm" onClick={addPart}>
          <Plus className="size-4" /> Add Part
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {parts.map((part, index) => (
          <div key={part.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_0.7fr_1fr_1fr_0.7fr_0.7fr_auto]">
            <select
              value={part.voiceType}
              onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, voiceType: event.target.value as VoiceType } : item)))}
              className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
            >
              {voiceTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <Input value={part.partNumber} placeholder="No." onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, partNumber: event.target.value } : item)))} />
            <Input value={part.displayName} placeholder="Display name" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, displayName: event.target.value } : item)))} />
            <Input value={part.audioFile} placeholder="Audio file" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, audioFile: event.target.value } : item)))} />
            <Input value={part.duration} placeholder="Duration" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, duration: event.target.value } : item)))} />
            <Input value={part.creditCost} placeholder="Credits" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, creditCost: event.target.value } : item)))} />
            <button
              aria-label={`Remove part ${index + 1}`}
              className="flex size-11 items-center justify-center rounded-2xl text-rose-600 hover:bg-rose-50"
              onClick={() => setParts((items) => items.filter((item) => item.id !== part.id))}
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
