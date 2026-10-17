"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, LogOut, MessageSquareText, Settings, Shield } from "lucide-react";
import { authService } from "@/services/auth.service";
import { usersService } from "@/services/users.service";

const links = [
  { label: "Account settings", icon: Settings },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Complaints & Support", icon: MessageSquareText, href: "/complaints" },
  { label: "Privacy", icon: Shield },
  { label: "Logout", icon: LogOut },
];

export default function ProfilePage() {
  const router = useRouter();
  const member = usersService.getCurrentMember();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authService.signOut();
    router.replace("/sign-in");
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-violet-700">Member</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Profile</h1>
      </header>
      <section className="rounded-[2rem] bg-white p-5 text-center shadow-sm">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-violet-700 text-2xl font-black text-white">{member.avatarInitials}</div>
        <h2 className="mt-4 text-xl font-black text-slate-950">{member.name}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{member.email}</p>
      </section>
      <section className="space-y-3">
        {links.map((item) => {
          const Icon = item.icon;
          const className = "flex min-h-14 w-full items-center gap-3 rounded-2xl bg-white px-4 text-left text-sm font-bold text-slate-700 shadow-sm transition hover:bg-violet-50";
          const content = <><Icon className="size-5 text-violet-700" /><span className="flex-1">{item.label}</span><ChevronRight className="size-4 text-slate-400" /></>;
          return item.href ? (
            <Link key={item.label} href={item.href} className={className}>{content}</Link>
          ) : (
            <button key={item.label} className={className} onClick={item.label === "Logout" ? signOut : undefined} disabled={item.label === "Logout" && signingOut}>
              {item.label === "Logout" && signingOut ? <><LogOut className="size-5 text-violet-700" /><span className="flex-1">Signing out...</span></> : content}
            </button>
          );
        })}
      </section>
    </div>
  );
}
