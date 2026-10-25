import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { SongCard } from "@/components/songs/song-card";
import { EmptyState } from "@/components/ui/empty-state";
import { listPublishedSongs } from "@/lib/mongodb/repos/songs.repo";
import { listActiveCategories } from "@/lib/mongodb/repos/categories.repo";
import { cn } from "@/lib/utils";

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category: categoryParam, search: searchParam } = await searchParams;
  const category = categoryParam ?? "All";
  const term = (searchParam ?? "").trim().toLowerCase();

  const [{ items: allSongs }, activeCategories] = await Promise.all([
    listPublishedSongs(50),
    listActiveCategories(),
  ]);

  const categoryNames = ["All", ...activeCategories.map((c) => c.name)];

  const filteredSongs = allSongs.filter((song) => {
    if (category !== "All" && song.category !== category) return false;
    if (!term) return true;
    return (
      `${song.title} ${song.composer} ${song.category} ${song.subCategory ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  });

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-violet-700">Training catalog</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Songs</h1>
      </header>
      <form action="" method="get" className="flex items-center gap-3">
        <SearchInput
          className="flex-1"
          name="search"
          defaultValue={searchParam ?? ""}
          placeholder="Search songs"
        />
        <Link
          href="/songs/filters"
          className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-700/20"
        >
          <SlidersHorizontal className="size-5" />
        </Link>
      </form>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categoryNames.map(
          (cat) => {
            const isActive = category === cat;
            return (
              <Link
                key={cat}
                href={
                  cat === "All"
                    ? `/songs${term ? `?search=${encodeURIComponent(term)}` : ""}`
                    : `/songs?category=${encodeURIComponent(cat)}${term ? `&search=${encodeURIComponent(term)}` : ""}`
                }
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition",
                  isActive
                    ? "bg-violet-700 text-white shadow-violet-700/20"
                    : "bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {cat}
              </Link>
            );
          },
        )}
      </div>
      {filteredSongs.length ? (
        <div className="space-y-3">
          {filteredSongs.map((song) => <SongCard key={song.id} song={song} />)}
        </div>
      ) : (
        <EmptyState
          title="No songs found"
          message="Try another search term or reset your filters."
        />
      )}
    </div>
  );
}

