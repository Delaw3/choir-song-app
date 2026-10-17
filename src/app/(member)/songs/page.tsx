"use client";

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { SongCard } from "@/components/songs/song-card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataSourceBadge } from "@/components/data/data-source-badge";
import { usePublishedSongs } from "@/hooks/use-firestore-songs";

export default function SongsPage() {
  const { songs, source, loading, error } = usePublishedSongs();

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-violet-700">Training catalog</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Songs</h1>
      </header>
      <div className="flex gap-3">
        <Link href="/songs/search" className="min-w-0 flex-1">
          <SearchInput placeholder="Search songs" readOnly />
        </Link>
        <Link href="/songs/filters" className="flex size-13 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-700/20">
          <SlidersHorizontal className="size-5" />
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", "Mass", "Communion", "Anthems"].map((category) => (
          <Link key={category} href={`/songs/filters?category=${category}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm">
            {category}
          </Link>
        ))}
      </div>
      <DataSourceBadge source={source} error={error} />
      {loading && songs.length === 0 ? (
        <p className="rounded-3xl bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">Loading catalog…</p>
      ) : songs.length ? (
        <div className="space-y-3">
          {songs.map((song) => <SongCard key={song.id} song={song} />)}
        </div>
      ) : (
        <EmptyState title="No songs found" message="Try another search term or reset your filters." />
      )}
    </div>
  );
}

