import { getLiveMembers } from "@/lib/mongodb/repos/users.repo";
import { Users, Coins, Calendar, Mail } from "lucide-react";
import MembersTable from "./MembersTable";


export default async function AdminMembersPage() {
  const members = await getLiveMembers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 sm:text-sm">People</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Choir Members</h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Active choir singers registered in the database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800">
            <Users className="size-4 text-violet-600" />
            <span>{members.length} {members.length === 1 ? "Member" : "Members"}</span>
          </span>
        </div>
      </header>

      <MembersTable members={members} />
    </div>
  );
}
