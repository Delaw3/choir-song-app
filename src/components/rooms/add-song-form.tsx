import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function AddSongForm(props: {
  catalog: ReturnType<typeof import("@/services/songs.service").songsService.getPublished>;
  sections: Array<{ id: string; title: string }>;
  searchQuery: string;
  selectedSongId: string | null;
  sectionTitle: string;
  onSearch: (v: string) => void;
  onSelectSong: (id: string) => void;
  onSection: (v: string) => void;
  onAdd: () => void;
}) {
  const filteredCatalog = props.catalog.filter((s) =>
    s.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
    s.composer.toLowerCase().includes(props.searchQuery.toLowerCase()),
  );

  const selectClass = "mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400";

  return (
    <div className="mb-4 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block text-xs font-bold text-slate-600">Search song</label>
      <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 min-h-12">
        <Search className="size-4 text-slate-400" />
        <input
          value={props.searchQuery}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Search by title or composer…"
          className="flex-1 w-0 outline-none bg-transparent"
        />
      </div>

      {filteredCatalog.length > 0 ? (
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filteredCatalog.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => props.onSelectSong(s.id)}
              className={`
                flex items-center justify-between gap-2 px-3 py-2 text-sm text-left rounded-xl
                ${props.selectedSongId === s.id ? "bg-violet-50 text-violet-800 font-medium" : "bg-slate-50 text-slate-700 hover:bg-violet-50"}
              `}
            >
              <span className="truncate">{s.title}</span>
              <span className="text-xs text-slate-400">{s.composer}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">No matching songs.</p>
      )}

      <label className="block text-xs font-bold text-slate-600 mt-2">Section (type to create)</label>
      <Input value={props.sectionTitle} onChange={(e) => props.onSection(e.target.value)} placeholder="e.g. Offertory" aria-label="Section name" className={selectClass} />

      <Button type="button" className="w-full" onClick={props.onAdd} disabled={!props.selectedSongId || !props.sectionTitle.trim()}>
        Add to setlist
      </Button>
    </div>
  );
}
