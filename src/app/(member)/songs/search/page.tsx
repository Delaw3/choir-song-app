import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { SongCard } from "@/components/songs/song-card";
import { listPublishedSongs } from "@/lib/mongodb/repos/songs.repo";

export default async function SearchSongsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const term = (query ?? "").trim().toLowerCase();

  const { items: allSongs } = await listPublishedSongs(50);

  const results = term
    ? allSongs.filter((song) =>
        [
          song.title,
          song.composer,
          song.category,
          song.subCategory ?? "",
          ...song.parts.map((part) => part.displayName),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : allSongs;

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
      <form action="" method="get">
        <SearchInput name="query" defaultValue={query ?? ""} autoFocus placeholder="Search title, category, part" />
      </form>
      <section className="space-y-3">
        {results.map((song) => <SongCard key={song.id} song={song} />)}
      </section>
    </div>
  );
}
