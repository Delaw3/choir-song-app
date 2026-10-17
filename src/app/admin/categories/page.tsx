import { songsService } from "@/services/songs.service";

export default function AdminCategoriesPage() {
  const categories = ["Mass", "Communion", "Anthems"];

  return <SimpleAdminList title="Categories" eyebrow="Organization" items={categories.map((category) => `${category} • ${songsService.filter({ category: category as never }).length} songs`)} />;
}

function SimpleAdminList({ title, eyebrow, items }: { title: string; eyebrow: string; items: string[] }) {
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold text-violet-700">{eyebrow}</p><h1 className="mt-1 text-3xl font-black text-slate-950">{title}</h1></header>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <div key={item} className="rounded-3xl bg-white p-5 font-bold text-slate-800 shadow-sm">{item}</div>)}
      </section>
    </div>
  );
}
