"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquarePlus } from "lucide-react";
import { ComplaintCard } from "@/components/complaints/complaint-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { useComplaints } from "@/hooks/use-complaints";
import { usersService } from "@/services/users.service";

export default function ComplaintsPage() {
  const complaints = useComplaints();
  const member = usersService.getCurrentMember();
  const memberComplaints = complaints.filter((complaint) => complaint.userId === member.id);

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex items-center gap-3"><Link href="/profile"><IconButton label="Back to profile"><ArrowLeft className="size-5" /></IconButton></Link><h1 className="text-2xl font-black text-slate-950">Complaints &amp; Support</h1></div>
        <p className="text-sm leading-6 text-slate-500">Have an issue or suggestion? Send a message to the choir admin.</p>
        <Link href="/complaints/new" className="block"><Button size="lg" className="w-full"><MessageSquarePlus className="size-5" />New Complaint</Button></Link>
      </header>
      <section>
        <h2 className="mb-3 text-lg font-black text-slate-950">My Complaints</h2>
        {memberComplaints.length ? <div className="space-y-3">{memberComplaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} />)}</div> : <EmptyState title="No complaints yet" message="Need help? Send a complaint or suggestion to the choir admin." action={<Link href="/complaints/new"><Button>Send a Complaint</Button></Link>} />}
      </section>
    </div>
  );
}
