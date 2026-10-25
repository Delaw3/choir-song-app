"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  Edit2,
  Users,
  Coins,
  Calendar,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  UserCheck,
  UserX,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMemberAction } from "./actions";
import type { Member } from "@/types/user";

export function MembersTableView({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCredits, setEditCredits] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"active" | "suspended" | "pending">("active");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function handleOpenEdit(member: Member) {
    setEditingMember(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditCredits(member.creditBalance ?? 0);
    setEditStatus((member.status as "active" | "suspended" | "pending") || "active");
  }

  function handleCloseEdit() {
    setEditingMember(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;
    setIsSaving(true);
    try {
      const updated = await updateMemberAction(editingMember.id, {
        displayName: editName,
        email: editEmail,
        creditBalance: Number(editCredits),
        status: editStatus,
      });

      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...m, ...updated } : m)),
      );
      showToast("success", `Updated details for ${editName.trim() || "member"}`);
      handleCloseEdit();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to update member.");
    } finally {
      setIsSaving(false);
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      String(m.creditBalance).includes(q) ||
      (m.role && m.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold shadow-lg transition-all ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header and Animated Expandable Search */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 sm:text-sm">People</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Choir Members</h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Active choir singers and member accounts registered in the database.
          </p>
        </div>

        {/* Search & Stats Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Animated Expanding Search Button / Input */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 ease-in-out ${
                isSearchExpanded
                  ? "w-64 sm:w-72 border-violet-600 ring-4 ring-violet-500/10"
                  : search
                  ? "w-48 sm:w-60"
                  : "w-11 cursor-pointer hover:bg-slate-50"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsSearchExpanded((prev) => !prev);
                  if (isSearchExpanded && search) setSearch("");
                }}
                className="flex size-11 shrink-0 items-center justify-center text-slate-500 hover:text-violet-700"
                aria-label="Toggle search"
              >
                <Search className="size-4" />
              </button>

              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, credits..."
                className={`h-11 w-full bg-transparent pr-2 text-xs font-semibold text-slate-800 outline-none transition-opacity duration-200 ${
                  isSearchExpanded || search ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onFocus={() => setIsSearchExpanded(true)}
              />

              {(search || isSearchExpanded) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setIsSearchExpanded(false);
                  }}
                  className="mr-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Members count badge */}
          <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-violet-200 bg-violet-50 px-3.5 text-xs font-bold text-violet-800">
            <Users className="size-4 text-violet-600" />
            <span>{filteredMembers.length} {filteredMembers.length === 1 ? "Member" : "Members"}</span>
          </span>
        </div>
      </header>

      {/* Desktop Table View (visible on md: and up) */}
      <div className="hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 pl-6 pr-4">Member</th>
                <th className="px-4 py-4">Status &amp; Role</th>
                <th className="px-4 py-4 text-center">Credit Balance</th>
                <th className="px-4 py-4">Joined Date</th>
                <th className="py-4 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Users className="mx-auto size-10 text-slate-300" />
                    <p className="mt-2 text-sm font-bold text-slate-700">No members matched your search</p>
                    <p className="text-xs text-slate-400">Try clearing the search filter</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const isSuspended = member.status === "suspended";
                  return (
                    <tr
                      key={member.id}
                      className="group transition hover:bg-slate-50/70"
                    >
                      {/* Name & Email */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-xs font-black text-white shadow-xs">
                            {member.avatarInitials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-black text-slate-900 group-hover:text-violet-700 transition">
                              {member.name}
                            </p>
                            <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                              <Mail className="size-3 text-slate-300 shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status & Role */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isSuspended
                                ? "bg-rose-100 text-rose-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${isSuspended ? "bg-rose-500" : "bg-emerald-500"}`} />
                            {isSuspended ? "Suspended" : "Active"}
                          </span>
                          {member.role === "admin" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                              <Shield className="size-3" />
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-xs font-black text-amber-900">
                          <Coins className="size-3.5 text-amber-500" />
                          <span>{member.creditBalance}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Calendar className="size-3.5 text-slate-400" />
                          {member.joinedAt}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(member)}
                          className="h-9 gap-1.5 rounded-xl text-xs font-bold text-violet-700 hover:bg-violet-50 hover:text-violet-800"
                        >
                          <Edit2 className="size-3.5" />
                          <span>Edit</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (visible on < md:) */}
      <div className="grid gap-3 sm:grid-cols-2 md:hidden">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Users className="mx-auto size-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">No members match your search</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-sm font-black text-white shadow-xs">
                      {member.avatarInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-900">{member.name}</p>
                      <p className="truncate text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(member)}
                    className="size-8 rounded-xl p-0 text-violet-700 hover:bg-violet-50"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credits</span>
                    <p className="flex items-center justify-center gap-1 font-black text-slate-900 text-xs mt-0.5">
                      <Coins className="size-3 text-amber-500" />
                      {member.creditBalance}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Joined</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{member.joinedAt}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-700">
                  {editingMember.avatarInitials}
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950">Edit Member</h3>
                  <p className="text-xs text-slate-400">Update member details &amp; credits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Member's full name"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="member@example.com"
                  required
                />
              </div>

              {/* Credit Balance Editor with Quick Adjustment Buttons */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Credit Balance
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCredits((prev) => Math.max(0, prev - 10))}
                    className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 text-xs font-bold"
                    title="-10 credits"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCredits((prev) => Math.max(0, prev - 1))}
                    className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95"
                    title="-1 credit"
                  >
                    <Minus className="size-4" />
                  </button>

                  <div className="relative flex-1">
                    <Coins className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-amber-500" />
                    <Input
                      type="number"
                      min={0}
                      value={editCredits}
                      onChange={(e) => setEditCredits(Math.max(0, Number(e.target.value)))}
                      className="pl-9 font-black text-slate-900"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditCredits((prev) => prev + 1)}
                    className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95"
                    title="+1 credit"
                  >
                    <Plus className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCredits((prev) => prev + 10)}
                    className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 text-xs font-bold"
                    title="+10 credits"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "active" | "suspended" | "pending")
                  }
                  className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-violet-600"
                >
                  <option value="active">Active (Access to practice &amp; songs)</option>
                  <option value="suspended">Suspended (Blocked from logging in)</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !editName.trim() || !editEmail.trim()}
                  className="flex items-center gap-1.5"
                >
                  <Save className="size-4" />
                  <span>{isSaving ? "Saving…" : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
