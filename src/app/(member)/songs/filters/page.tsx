import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { SongCard } from "@/components/songs/song-card";
import { listPublishedSongs } from "@/lib/mongodb/repos/songs.repo";
import { listActiveCategories } from "@/lib/mongodb/repos/categories.repo";
import type { Song } from "@/types/song";

export default async function FilterSongsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subCategory?: string }>;
}) {
  const { category: categoryParam, subCategory: subCategoryParam } =
    await searchParams;
  const category = categoryParam ?? "All";
  const subCategory = subCategoryParam ?? "All";

  const [{ items: allSongs }, activeCategories] = await Promise.all([
    listPublishedSongs(50),
    listActiveCategories(),
  ]);

  const categories = ["All", ...activeCategories.map((c) => c.name)];
  const selectedCatDoc = activeCategories.find(
    (c) => c.name.toLowerCase() === category.toLowerCase(),
  );
  const availableSubCategories =
    selectedCatDoc?.subCategories && selectedCatDoc.subCategories.length > 0
      ? ["All", ...selectedCatDoc.subCategories]
      : [];

  const results: Song[] = allSongs.filter((song) => {
    if (category !== "All" && song.category !== category) return false;
    if (subCategory !== "All" && song.subCategory !== subCategory) return false;
    return true;
  });

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

      <section className="rounded-3xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-black text-slate-950">Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link
              key={item}
              href={`/songs/filters?category=${item}&subCategory=All`}
              className="shrink-0"
            >
              <Chip active={category === item}>{item}</Chip>
            </Link>
          ))}
        </div>
      </section>

      {availableSubCategories.length > 0 && (
        <section className="rounded-3xl bg-white p-4 shadow-sm mt-3">
          <h2 className="mb-3 text-sm font-black text-slate-950">{category} sub-category</h2>
          <div className="flex flex-wrap gap-2">
            {availableSubCategories.map((item) => (
              <Link
                key={item}
                href={`/songs/filters?category=${category}&subCategory=${item}`}
                className="shrink-0"
              >
                <Chip active={subCategory === item}>{item}</Chip>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/songs">
          <Button variant="secondary">Reset</Button>
        </Link>
        <Link href="/songs" className="block">
          <Button className="w-full">Apply filters</Button>
        </Link>
      </div>

      <section className="space-y-3">
        {results.map((song) => <SongCard key={song.id} song={song} compact />)}
      </section>
    </div>
  );
}
