import { SongCard } from "@/components/songs/song-card";
import { songsService } from "@/services/songs.service";

export default function LibraryPage() {
  const recent = songsService.getRecentlyPracticed();
  const unlocked = songsService.getUnlocked();
  const saved = songsService.getSaved();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-violet-700">Your music</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Library</h1>
      </header>
      <SongSection title="Recently practiced" songs={recent} />
      <SongSection title="Unlocked songs" songs={unlocked} />
      <SongSection title="Saved songs" songs={saved} />
    </div>
  );
}

function SongSection({ title, songs }: { title: string; songs: ReturnType<typeof songsService.getAll> }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-black text-slate-950">{title}</h2>
      <div className="space-y-3">
        {songs.map((song) => <SongCard key={song.id} song={song} compact />)}
      </div>
    </section>
  );
}
