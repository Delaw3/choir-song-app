import Link from "next/link";
import {
  Activity,
  ChevronRight,
  MessageSquareText,
  Music2,
  Plus,
  Tags,
  Users,
  WalletCards,
} from "lucide-react";
import { songsService } from "@/services/songs.service";

const metrics = [
  { label: "Members", value: "1,248", icon: Users },
  { label: "Songs", value: "186", icon: Music2 },
  { label: "Total Plays", value: "18.4k", icon: Activity },
  { label: "Revenue", value: "NGN 842k", icon: WalletCards },
];

const quickActions = [
  { label: "Add Song", href: "/admin/songs/add", icon: Plus, primary: true },
  { label: "Complaints", href: "/admin/complaints", icon: MessageSquareText },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Members", href: "/admin/members", icon: Users },
];

export default function AdminDashboardPage() {
  const songs = songsService.getAll();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 sm:text-sm">Overview</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Dashboard</h1>
        </div>
        <Link
          href="/admin/songs/add"
          className="flex items-center gap-1.5 rounded-2xl bg-violet-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-violet-800 active:scale-95 sm:hidden"
        >
          <Plus className="size-4" />
          <span>New Song</span>
        </Link>
      </header>

      {/* Metrics Section: 2x2 on mobile, 4-col on desktop */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 sm:text-sm">{metric.label}</span>
                <span className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:size-11 sm:rounded-2xl">
                  <Icon className="size-4 sm:size-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-black text-slate-950 sm:mt-5 sm:text-3xl">{metric.value}</p>
            </div>
          );
        })}
      </section>

      {/* Mobile-Friendly Quick Actions (visible on mobile, accessible on desktop) */}
      <section className="sm:hidden">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold shadow-xs transition active:scale-95 ${
                  action.primary
                    ? "bg-violet-700 text-white"
                    : "border border-slate-200/80 bg-white text-slate-700"
                }`}
              >
                <Icon className="size-4" />
                <span>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Catalog Activity */}
      <section className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-base font-black text-slate-950 sm:text-lg">Recent catalog activity</h2>
          <Link
            href="/admin/songs"
            className="flex items-center text-xs font-bold text-violet-700 hover:underline"
          >
            <span>View all</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {songs.slice(0, 5).map((song) => (
            <Link
              key={song.id}
              href="/admin/songs"
              className="flex items-center justify-between py-3 transition hover:bg-slate-50/60 active:bg-slate-50 sm:py-4"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="truncate text-sm font-bold text-slate-950">{song.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  <span className="font-semibold text-violet-700">{song.category}</span>
                  {" • "}
                  <span>{song.parts.length} parts</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 sm:text-sm">
                  {song.playCount.toLocaleString()} plays
                </span>
                <ChevronRight className="size-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
