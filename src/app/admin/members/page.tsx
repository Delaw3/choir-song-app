import { usersService } from "@/services/users.service";

export default function AdminMembersPage() {
  const members = usersService.getMembers();
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold text-violet-700">People</p><h1 className="mt-1 text-3xl font-black text-slate-950">Members</h1></header>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-800">{member.avatarInitials}</span>
              <div><p className="font-black text-slate-950">{member.name}</p><p className="text-sm text-slate-500">{member.email}</p></div>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-600">{member.creditBalance} credits</p>
          </div>
        ))}
      </section>
    </div>
  );
}
