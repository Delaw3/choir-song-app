import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm font-semibold text-violet-700">Updates</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Notifications</h1>
      </header>
      {["New Communion songs were published", "Your 100-credit purchase is available", "Practice reminder for Ave Verum Corpus"].map((item) => (
        <div key={item} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Bell className="size-5" /></span>
          <div>
            <p className="text-sm font-bold text-slate-950">{item}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Today</p>
          </div>
        </div>
      ))}
    </div>
  );
}
