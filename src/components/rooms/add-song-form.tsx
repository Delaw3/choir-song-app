import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { songsService } from "@/services/songs.service";
import { ROOM_PART_PRESETS } from "@/types/room";

export function AddSongForm(props: {
  catalog: ReturnType<typeof songsService.getPublished>;
  sections: Array<{ id: string; title: string }>;
  songId: string;
  sectionId: string;
  voicePart: string;
  customPart: string;
  onSong: (v: string) => void;
  onSection: (v: string) => void;
  onPart: (v: string) => void;
  onCustom: (v: string) => void;
  onAdd: () => void;
}) {
  const selectClass = "mt-1 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400";
  return (
    <div className="mb-4 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block text-xs font-bold text-slate-600">Song
        <select value={props.songId} onChange={(e) => props.onSong(e.target.value)} className={selectClass}>
          <option value="">Pick a song…</option>
          {props.catalog.map((s) => <option key={s.id} value={s.id}>{s.title} — {s.composer}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs font-bold text-slate-600">Section
          <select value={props.sectionId} onChange={(e) => props.onSection(e.target.value)} className={selectClass}>
            <option value="">Pick…</option>
            {props.sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
        <label className="block text-xs font-bold text-slate-600">Part
          <select value={props.voicePart} onChange={(e) => props.onPart(e.target.value)} className={selectClass}>
            {ROOM_PART_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
            <option value="Custom…">Custom…</option>
          </select>
        </label>
      </div>
      {props.voicePart === "Custom…" ? (
        <Input value={props.customPart} onChange={(e) => props.onCustom(e.target.value)} placeholder="e.g. Cantor" aria-label="Custom part name" />
      ) : null}
      <Button type="button" className="w-full" onClick={props.onAdd} disabled={!props.songId || !props.sectionId}>Add to setlist</Button>
    </div>
  );
}
