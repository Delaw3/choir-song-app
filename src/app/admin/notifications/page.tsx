export default function AdminNotificationsPage() {
  return <Placeholder title="Notifications" eyebrow="Messaging" lines={["Create choir-wide announcements and practice reminders here.", "Delivery channels will be connected after authentication is ready."]} />;
}

function Placeholder({ title, eyebrow, lines }: { title: string; eyebrow: string; lines: string[] }) {
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-violet-700">{eyebrow}</p><h1 className="mt-1 text-3xl font-black text-slate-950">{title}</h1></header><section className="rounded-3xl bg-white p-6 shadow-sm">{lines.map((line) => <p key={line} className="text-sm leading-6 text-slate-600">{line}</p>)}</section></div>;
}
