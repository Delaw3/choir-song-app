import { Edit3, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { songsService } from "@/services/songs.service";
import { listAllSongsAdmin } from "@/lib/mongodb/repos/songs.repo";
import type { Song } from "@/types/song";

export default async function AdminSongsPage() {
  let songs: Song[];
  let error: string | null = null;

  try {
    songs = await listAllSongsAdmin(50);
  } catch (err) {
    songs = songsService.getAll();
    error = err instanceof Error ? err.message : "Failed to load songs from MongoDB; showing mock catalog.";
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-700">Catalog</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Songs</h1>
        </div>
        <Link href="/admin/songs/add">
          <Button><Plus className="size-4" /> Add Song</Button>
        </Link>
      </header>
      <section className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
        <SearchInput placeholder="Search songs" />
        <select className="min-h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
          <option>All categories</option>
          <option>Mass</option>
          <option>Communion</option>
          <option>Anthems</option>
        </select>
        <select className="min-h-13 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
          <option>All statuses</option>
          <option>Draft</option>
          <option>Published</option>
        </select>
      </section>
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Song</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Credit</th>
                <th className="px-5 py-4">Parts</th>
                <th className="px-5 py-4">Plays</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            {error && (
              <tr>
                <td colSpan={8} className="px-5 py-4">
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>
                </td>
              </tr>
            )}
            {!error && (
              <tr>
                <td colSpan={8} className="px-5 py-2">
                  <div className="rounded-xl bg-slate-100 p-2 text-xs text-slate-500">Data source: MongoDB</div>
                </td>
              </tr>
            )}
            <tbody className="divide-y divide-slate-100">
              {songs.map((song) => (
                <tr key={song.id}>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950">{song.title}</p>
                    <p className="mt-1 text-slate-500">{song.composer}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{song.category}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{song.creditCost}</td>
                  <td className="px-5 py-4 text-slate-600">{song.parts.map((part) => part.displayName).join(", ")}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{song.playCount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{song.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button aria-label={`Edit ${song.title}`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><Edit3 className="size-4" /></button>
                      <button aria-label={`Delete ${song.title}`} className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
