import Link from "next/link";
import { Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roomsService } from "@/services/rooms.service";
import type { PracticeRoom } from "@/types/room";

export function RoomCard({ room, userId, copied, onCopy }: { room: PracticeRoom; userId: string; copied: boolean; onCopy: () => void }) {
  const owner = roomsService.isOwner(room, userId);
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-950">{room.name}</h3>
            {owner ? <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-800">Owner</span> : null}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="size-3.5" />{room.members.length} member{room.members.length === 1 ? "" : "s"} · {room.items.length} song{room.items.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            onClick={onCopy}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            aria-label={`Copy room code ${room.code}`}
          >
            <Copy className="size-3.5" />{copied ? "Copied!" : room.code}
          </button>
        </div>
        <Link href={`/rooms/${room.id}`}>
          <Button size="sm" variant="secondary">Open</Button>
        </Link>
      </div>
    </article>
  );
}
