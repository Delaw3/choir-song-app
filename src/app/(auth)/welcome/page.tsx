import Link from "next/link";
import { Headphones, Mic2, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="flex flex-1 flex-col justify-between gap-10 pb-2 pt-4">
      <section>
        <div className="grid w-fit grid-cols-2 gap-3" aria-hidden="true">
          <span className="col-span-2 flex size-20 items-center justify-center rounded-3xl bg-violet-700 text-white shadow-xl shadow-violet-700/20"><Music2 className="size-9" /></span>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm"><Mic2 className="size-5" /></span>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Headphones className="size-5" /></span>
        </div>
        <p className="mt-10 text-sm font-bold text-violet-700">Choir Training</p>
        <h1 className="mt-2 max-w-sm text-4xl font-black leading-tight tracking-tight text-slate-950">Learn your part. Practice anywhere.</h1>
        <p className="mt-5 max-w-sm text-base leading-7 text-slate-500">Learn and practice your individual choir part at your own pace, wherever rehearsal takes you.</p>
      </section>
      <section className="space-y-4">
        <Link href="/sign-up" className="block"><Button size="lg" className="w-full">Get Started</Button></Link>
        <p className="text-center text-sm text-slate-500">Already have an account? <Link href="/sign-in" className="font-bold text-violet-700 hover:text-violet-800">Sign in</Link></p>
      </section>
    </div>
  );
}
