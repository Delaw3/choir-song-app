import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditBadge } from "@/components/ui/credit-badge";
import { SongCard } from "@/components/songs/song-card";
import { songsService } from "@/services/songs.service";
import { usersService } from "@/services/users.service";

export default function HomePage() {
  const member = usersService.getCurrentMember();
  const recent = songsService.getRecentlyPracticed();
  const newSongs = songsService.getNew();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">Hello, {member.name.split(" ")[0]}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Ready to practice?</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <Bell className="size-5" />
          </Link>
          <Link href="/profile" className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <User className="size-5" />
          </Link>
        </div>
      </header>

      <section className="rounded-[2rem] bg-violet-700 p-5 text-white shadow-xl shadow-violet-700/20">
        <p className="text-sm font-semibold text-violet-100">Current balance</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-black">{member.creditBalance}</p>
            <p className="text-sm font-semibold text-violet-100">training credits</p>
          </div>
          <Link href="/wallet/buy">
            <Button variant="secondary" size="sm">Buy Credits</Button>
          </Link>
        </div>
      </section>

      <Link href="/songs/search" className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400 shadow-sm">
        <Search className="size-5" />
        Search songs
      </Link>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950">Continue practicing</h2>
          <CreditBadge credits={member.creditBalance} />
        </div>
        <div className="space-y-3">
          {recent.slice(0, 2).map((song) => <SongCard key={song.id} song={song} />)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950">New songs</h2>
          <Link href="/songs" className="text-sm font-bold text-violet-700">View all</Link>
        </div>
        <div className="space-y-3">
          {newSongs.map((song) => <SongCard key={song.id} song={song} compact />)}
        </div>
      </section>
    </div>
  );
}
