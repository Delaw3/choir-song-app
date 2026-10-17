import { Chip } from "@/components/ui/chip";
import type { SongPart } from "@/types/song";

export function VoicePartChip({ part, active }: { part: SongPart; active?: boolean }) {
  return <Chip active={active}>{part.displayName}</Chip>;
}
