import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "@/components/ui/credit-badge";
import { IconButton } from "@/components/ui/icon-button";
import { VoicePartChip } from "@/components/songs/voice-part-chip";
import { songsService } from "@/services/songs.service";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SongDetailsPage({ params }: Props) {
  const { id } = await params;
  const song = songsService.getById(id);
  if (!song) notFound();
  const firstPart = song.parts[0];

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href="/songs">
          <IconButton label="Back">
            <ArrowLeft className="size-5" />
          </IconButton>
        </Link>
        <p className="text-sm font-bold text-violet-700">Song details</p>
      </header>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">{song.title}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">{song.composer}</p>
          </div>
          <CreditBadge credits={`${song.creditCost} credits`} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Info label="Category" value={song.category} />
          <Info label="Plays" value={song.playCount.toLocaleString()} />
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Available training parts</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {song.parts.map((part) => (
            <Link key={part.id} href={`/practice/${song.id}/${part.id}`}>
              <VoicePartChip part={part} />
            </Link>
          ))}
        </div>
      </section>

      <Link href={`/practice/${song.id}/${firstPart.id}`}>
        <Button className="w-full" size="lg">Use {firstPart.creditCost} credits & start practice</Button>
      </Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black text-slate-950">{value}</p>
    </div>
  );
}
