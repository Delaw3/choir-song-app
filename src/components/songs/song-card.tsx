import Link from "next/link";
import { Music2 } from "lucide-react";
import { CreditBadge } from "@/components/ui/credit-badge";
import { VoicePartChip } from "@/components/songs/voice-part-chip";
import type { Song } from "@/types/song";

export function SongCard({ song, compact = false }: { song: Song; compact?: boolean }) {
  return (
    <Link
      href={`/songs/${song.id}`}
      className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
          <Music2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950">{song.title}</h3>
              <p className="mt-1 truncate text-sm text-slate-500">{song.composer}</p>
            </div>
            <CreditBadge credits={song.creditCost} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{song.category}</span>
            {!compact && song.parts.slice(0, 4).map((part) => <VoicePartChip key={part.id} part={part} />)}
            {!compact && song.parts.length > 4 ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">+{song.parts.length - 4}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
