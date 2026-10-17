import { Activity, Music2, Users, WalletCards } from "lucide-react";
import { songsService } from "@/services/songs.service";

const metrics = [
  { label: "Members", value: "1,248", icon: Users },
  { label: "Songs", value: "186", icon: Music2 },
  { label: "Total Plays", value: "18.4k", icon: Activity },
  { label: "Revenue", value: "NGN 842k", icon: WalletCards },
];

export default function AdminDashboardPage() {
  const songs = songsService.getAll();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-violet-700">Overview</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Dashboard</h1>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">{metric.label}</span>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Icon className="size-5" /></span>
              </div>
              <p className="mt-5 text-3xl font-black text-slate-950">{metric.value}</p>
            </div>
          );
        })}
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Recent catalog activity</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {songs.slice(0, 5).map((song) => (
            <div key={song.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-950">{song.title}</p>
                <p className="text-sm text-slate-500">{song.category} • {song.parts.length} parts</p>
              </div>
              <span className="text-sm font-bold text-slate-600">{song.playCount.toLocaleString()} plays</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
