import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AudioPlayer } from "@/components/player/audio-player";
import { IconButton } from "@/components/ui/icon-button";
import { VoicePartChip } from "@/components/songs/voice-part-chip";
import { songsService } from "@/services/songs.service";

type Props = {
  params: Promise<{ songId: string; partId: string }>;
};

export default async function PracticePage({ params }: Props) {
  const { songId, partId } = await params;
  const song = songsService.getById(songId);
  if (!song) notFound();
  const part = song.parts.find((item) => item.id === partId);
  if (!part) notFound();

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Link href={`/songs/${song.id}`}>
          <IconButton label="Back">
            <ArrowLeft className="size-5" />
          </IconButton>
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-violet-700">{song.title}</p>
          <h1 className="text-2xl font-black text-slate-950">{part.displayName}</h1>
        </div>
      </header>
      <section>
        <p className="mb-3 text-sm font-black text-slate-500">Switch part</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {song.parts.map((songPart) => (
            <Link key={songPart.id} href={`/practice/${song.id}/${songPart.id}`} className="shrink-0">
              <VoicePartChip part={songPart} active={songPart.id === part.id} />
            </Link>
          ))}
        </div>
      </section>
      <AudioPlayer song={song} selectedPart={part} />
    </div>
  );
}
