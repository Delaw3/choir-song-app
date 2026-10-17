"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { SongCard } from "@/components/songs/song-card";
import { songsService } from "@/services/songs.service";

const recentSearches = ["Kyrie", "Communion", "Tenor 1"];

export default function SearchSongsPage() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => songsService.search(query), [query]);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/songs">
          <IconButton label="Back">
            <ArrowLeft className="size-5" />
          </IconButton>
        </Link>
        <div>
          <p className="text-sm font-semibold text-violet-700">Find music</p>
          <h1 className="text-2xl font-black text-slate-950">Search songs</h1>
        </div>
      </header>
      <SearchInput autoFocus placeholder="Search title, category, part" value={query} onChange={(event) => setQuery(event.target.value)} />
      <section>
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Recent searches</h2>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((term) => (
            <button key={term} onClick={() => setQuery(term)} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
              {term}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        {results.map((song) => <SongCard key={song.id} song={song} />)}
      </section>
    </div>
  );
}
