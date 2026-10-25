"use client";
import { useState } from "react";
import { Users, Mail, Search, Edit, X } from "lucide-react";
import Link from "next/link";

export default function MembersTable({ members }: { members: any[] }) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const closeModal = () => setEditMember(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    const { id, name, email, creditBalance } = editMember;
    try {
      const res = await fetch(`/api/admin/members/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: name,
            email,
            creditBalance: Number(creditBalance),
          }),
        },
      );
      if (res.ok) {
        // Optimistic UI: reload page to reflect changes
        window.location.reload();
      } else {
        console.error("Failed to update member");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">Members</h2>
        <button
          onClick={() => setShowSearch((s) => !s)}
          className="p-2 rounded-full hover:bg-slate-100 transition"
          aria-label="Search members"
        >
          <Search className="size-5 text-slate-500" />
        </button>
      </div>
      {showSearch && (
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
        />
      )}

      {/* Table (desktop) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Credits</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Joined</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-2 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-base font-black text-white">
                    {member.avatarInitials}
                  </span>
                  <span className="font-medium text-slate-900">{member.name}</span>
                </td>
                <td className="px-4 py-2 flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="size-3 shrink-0" />
                  <span>{member.email}</span>
                </td>
                <td className="px-4 py-2 text-sm text-slate-900">{member.creditBalance}</td>
                <td className="px-4 py-2 text-sm text-slate-900">{member.joinedAt}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setEditMember({ ...member })}
                    className="inline-flex items-center gap-1 text-violet-600 hover:underline"
                  >
                    <Edit className="size-4" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card list (mobile) */}
      <div className="md:hidden space-y-4">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-base font-black text-white">
                {member.avatarInitials}
              </span>
              <div>
                <p className="font-medium text-slate-900">{member.name}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="size-3 shrink-0" />
                  {member.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-900">
              <div>Credits: {member.creditBalance}</div>
              <div>Joined: {member.joinedAt}</div>
            </div>
            <button
              onClick={() => setEditMember({ ...member })}
              className="mt-2 inline-flex items-center gap-1 text-violet-600 hover:underline"
            >
              <Edit className="size-4" />
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="size-5" />
            </button>
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Edit Member</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  value={editMember.name}
                  onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={editMember.email}
                  onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Credits</label>
                <input
                  type="number"
                  min={0}
                  value={editMember.creditBalance}
                  onChange={(e) => setEditMember({ ...editMember, creditBalance: e.target.value })}
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
