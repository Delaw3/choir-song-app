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

      <section className="relative rounded-[2rem] bg-gradient-to-br from-violet-50/55 via-white/45 to-violet-100/55 backdrop-blur-md border border-violet-200/60 p-5 shadow-[0_8px_32px_rgba(109,40,217,0.12)] overflow-hidden">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-70 pointer-events-none" />
        <p className="relative z-10 text-sm font-semibold text-violet-700">Current balance</p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <p className="relative z-10 text-4xl font-black text-violet-900">{member.creditBalance}</p>
            <p className="relative z-10 text-sm font-semibold text-violet-700">training credits</p>
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
