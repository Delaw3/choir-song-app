"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { SongCard } from "@/components/songs/song-card";
import { songsService } from "@/services/songs.service";
import type { PracticeStatus, SongCategory } from "@/types/song";

const categories: Array<SongCategory | "All"> = ["All", "Mass", "Communion", "Anthems"];
const voiceParts = ["S1", "S2", "A", "T1", "T2", "B"];
const statuses: Array<PracticeStatus | "Any"> = ["Any", "not-started", "in-progress", "completed"];

export default function FilterSongsPage() {
  const [category, setCategory] = useState<SongCategory | "All">("All");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [status, setStatus] = useState<PracticeStatus | "Any">("Any");
  const [creditCost, setCreditCost] = useState<number | "Any">("Any");
  const results = useMemo(() => songsService.filter({ category, voiceParts: selectedParts, practiceStatus: status, creditCost }), [category, selectedParts, status, creditCost]);

  const togglePart = (part: string) => setSelectedParts((parts) => (parts.includes(part) ? parts.filter((item) => item !== part) : [...parts, part]));
  const reset = () => {
    setCategory("All");
    setSelectedParts([]);
    setStatus("Any");
    setCreditCost("Any");
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/songs">
          <IconButton label="Back">
            <ArrowLeft className="size-5" />
          </IconButton>
        </Link>
        <div>
          <p className="text-sm font-semibold text-violet-700">Refine catalog</p>
          <h1 className="text-2xl font-black text-slate-950">Filter songs</h1>
        </div>
      </header>

      <FilterGroup title="Category">{categories.map((item) => <button key={item} onClick={() => setCategory(item)}><Chip active={category === item}>{item}</Chip></button>)}</FilterGroup>
      <FilterGroup title="Voice parts">{voiceParts.map((part) => <button key={part} onClick={() => togglePart(part)}><Chip active={selectedParts.includes(part)}>{part}</Chip></button>)}</FilterGroup>
      <FilterGroup title="Practice status">{statuses.map((item) => <button key={item} onClick={() => setStatus(item)}><Chip active={status === item}>{item.replaceAll("-", " ")}</Chip></button>)}</FilterGroup>
      <FilterGroup title="Credit cost">
        {["Any", 1, 2, 3, 4].map((item) => <button key={item} onClick={() => setCreditCost(item as number | "Any")}><Chip active={creditCost === item}>{item === "Any" ? "Any credit cost" : `Up to ${item}`}</Chip></button>)}
      </FilterGroup>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={reset}>Reset</Button>
        <Link href="/songs" className="block"><Button className="w-full">Apply filters</Button></Link>
      </div>

      <section className="space-y-3">
        {results.map((song) => <SongCard key={song.id} song={song} compact />)}
      </section>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black text-slate-950">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}
