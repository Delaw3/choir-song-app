"use client";

import { useMemo, useState } from "react";
import { MessageSquareText, Search } from "lucide-react";
import { AdminComplaintTable } from "@/components/admin/admin-complaint-table";
import { complaintCategories, complaintCategoryLabels, complaintStatuses, complaintStatusLabels } from "@/constants/complaints";
import { useComplaints } from "@/hooks/use-complaints";
import type { ComplaintCategory, ComplaintStatus } from "@/types/complaint";

export default function AdminComplaintsPage() {
  const complaints = useComplaints();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | "ALL">("ALL");
  const [status, setStatus] = useState<ComplaintStatus | "ALL">("ALL");

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const matchesSearch = !query || [complaint.subject, complaint.message, complaint.userName, complaint.userEmail].some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (category === "ALL" || complaint.category === category) && (status === "ALL" || complaint.status === status);
    });
  }, [category, complaints, search, status]);

  const metrics = [
    { label: "Total complaints", value: complaints.length, tone: "text-slate-950" },
    { label: "Open complaints", value: complaints.filter((item) => item.status === "OPEN").length, tone: "text-amber-600" },
    { label: "In Review", value: complaints.filter((item) => item.status === "IN_REVIEW").length, tone: "text-violet-700" },
    { label: "Resolved", value: complaints.filter((item) => item.status === "RESOLVED").length, tone: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <header><p className="text-sm font-semibold text-violet-700">Member support</p><h1 className="mt-1 text-3xl font-black text-slate-950">Complaints</h1><p className="mt-2 text-sm text-slate-500">Review member issues, suggestions and requests.</p></header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className="rounded-2xl bg-white p-5 shadow-sm"><p className={`text-3xl font-black ${metric.tone}`}>{metric.value}</p><p className="mt-2 text-sm font-semibold text-slate-500">{metric.label}</p></div>)}
      </section>
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_180px]">
          <label className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search complaints</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member, subject or message" className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100" /></label>
          <label><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value as ComplaintCategory | "ALL")} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"><option value="ALL">All categories</option>{complaintCategories.map((item) => <option key={item} value={item}>{complaintCategoryLabels[item]}</option>)}</select></label>
          <label><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as ComplaintStatus | "ALL")} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"><option value="ALL">All statuses</option>{complaintStatuses.map((item) => <option key={item} value={item}>{complaintStatusLabels[item]}</option>)}</select></label>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400"><MessageSquareText className="size-4" />{filteredComplaints.length} {filteredComplaints.length === 1 ? "complaint" : "complaints"}</p>
      </section>
      <AdminComplaintTable complaints={filteredComplaints} />
    </div>
  );
}
