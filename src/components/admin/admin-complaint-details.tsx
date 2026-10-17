"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { ComplaintCategoryBadge } from "@/components/complaints/complaint-category-badge";
import { ComplaintStatusBadge } from "@/components/complaints/complaint-status-badge";
import { Button } from "@/components/ui/button";
import { complaintStatuses, complaintStatusLabels } from "@/constants/complaints";
import { formatDate } from "@/lib/utils";
import { complaintsService } from "@/services/complaints.service";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

export function AdminComplaintDetails({ complaint }: { complaint: Complaint }) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [response, setResponse] = useState(complaint.adminResponse ?? "");
  const [notice, setNotice] = useState("");
  const [responseError, setResponseError] = useState("");

  function selectStatus(selectedStatus: ComplaintStatus) {
    setStatus(selectedStatus);
    complaintsService.updateComplaintStatus(complaint.id, selectedStatus);
    setNotice("Complaint status updated.");
  }

  function sendResponse() {
    if (!response.trim()) {
      setResponseError("Enter a response before sending.");
      return;
    }
    complaintsService.respondToComplaint(complaint.id, response);
    setResponseError("");
    setNotice("Response saved and is now visible to the member.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Member</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-800">{complaint.userName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
            <div className="min-w-0"><p className="font-black text-slate-950">{complaint.userName}</p><p className="truncate text-sm text-slate-500">{complaint.userEmail}</p></div>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2"><ComplaintStatusBadge status={complaint.status} /><ComplaintCategoryBadge category={complaint.category} /></div>
          <h2 className="mt-4 text-xl font-black text-slate-950">{complaint.subject}</h2>
          <p className="mt-2 text-xs font-semibold text-slate-400">Submitted {formatDate(complaint.createdAt)}</p>
          <div className="mt-6 border-t border-slate-100 pt-6"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Complaint message</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{complaint.message}</p></div>
        </section>
      </div>
      <aside className="space-y-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div><p className="text-sm font-black text-slate-950">Review complaint</p><p className="mt-1 text-sm text-slate-500">Update progress and reply to the member.</p></div>
        {notice ? <div role="status" className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{notice}</div> : null}
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Status</span><select value={status} onChange={(event) => selectStatus(event.target.value as ComplaintStatus)} className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100">{complaintStatuses.map((item) => <option key={item} value={item}>{complaintStatusLabels[item]}</option>)}</select><span className="mt-2 block text-xs text-slate-500">Changes save automatically.</span></label>
        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Admin Response</span><textarea value={response} onChange={(event) => setResponse(event.target.value)} rows={7} placeholder="Write a clear response for the member" className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />{responseError ? <p className="mt-2 text-xs font-semibold text-rose-600">{responseError}</p> : null}</label>
        <Button type="button" className="w-full" onClick={sendResponse}><Send className="size-4" />Send Response</Button>
        <p className="text-xs leading-5 text-slate-500">Responses are saved locally for now. Email and push notifications are not sent.</p>
      </aside>
    </div>
  );
}
