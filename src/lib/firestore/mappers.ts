import { Timestamp } from "firebase/firestore";
import type { Complaint, ComplaintStatus } from "@/types/complaint";
import type { CreditPackage, CreditTransaction, Member } from "@/types/user";
import type { Song, SongCategory, SongPart, VoiceType } from "@/types/song";
import type {
  SongCategoryDoc,
  SongDoc,
  SongPartDoc,
  UserDoc,
  WithId,
} from "@/lib/firestore/types";
import type {
  ComplaintDoc,
  ComplaintStatus as FsComplaintStatus,
  CreditPackageDoc,
  CreditTransactionDoc,
  NotificationDoc,
} from "@/lib/firestore/types-ledger";

export function timestampToIso(value: Timestamp | undefined): string | undefined {
  return value ? value.toDate().toISOString() : undefined;
}

export function timestampToIsoDefault(value: Timestamp | undefined): string {
  return value ? value.toDate().toISOString() : new Date(0).toISOString();
}

export function serverNow(): Timestamp {
  return Timestamp.now();
}

export function toVoiceType(input: string): VoiceType {
  const normalized = input.toLowerCase();
  if (normalized === "soprano" || normalized === "alto" || normalized === "tenor" || normalized === "bass") {
    return normalized;
  }
  return "soprano";
}

export function mapSongCategory(doc: WithId<SongCategoryDoc>): SongCategory {
  return doc.name as SongCategory;
}

export function mapSongPart(songId: string, doc: WithId<SongPartDoc>): SongPart {
  return {
    id: doc.id,
    voiceType: toVoiceType(doc.voiceGroup),
    partNumber: doc.subPart ?? undefined,
    displayName: doc.name,
    audioUrl: undefined,
    duration: doc.durationSeconds,
    creditCost: doc.creditCost,
  };
}

/** Joins a song doc + its parts + resolved category display name. */
export function mapSong(input: {
  song: WithId<SongDoc>;
  parts: Array<WithId<SongPartDoc>>;
  categoryName: string;
  library?: { saved: boolean; unlocked: boolean; practiceStatus: Song["practiceStatus"]; lastPracticedAt?: string };
}): Song {
  const fallbackCategory = (input.categoryName || "Anthems") as SongCategory;
  return {
    id: input.song.id,
    title: input.song.title,
    composer: input.song.composer ?? "Unknown composer",
    category: fallbackCategory,
    creditCost: input.song.creditCost,
    status: input.song.status === "archived" ? "draft" : input.song.status,
    playCount: input.song.playCount,
    practiceStatus: input.library?.practiceStatus ?? "not-started",
    isNew: input.song.isNew,
    isUnlocked: input.library?.unlocked,
    isSaved: input.library?.saved,
    lastPracticedAt: input.library?.lastPracticedAt,
    parts: input.parts.map((part) => mapSongPart(input.song.id, part)),
  };
}

const complaintStatusToUi: Record<FsComplaintStatus, ComplaintStatus> = {
  open: "OPEN",
  in_review: "IN_REVIEW",
  resolved: "RESOLVED",
};

export function mapComplaint(doc: WithId<ComplaintDoc>, adminResponse?: string): Complaint {
  return {
    id: doc.id,
    userId: doc.userId ?? "anonymous",
    userName: doc.userName,
    userEmail: doc.userEmail,
    category: doc.category,
    subject: doc.subject,
    message: doc.description,
    status: complaintStatusToUi[doc.status],
    adminResponse,
    respondedAt: undefined,
    createdAt: timestampToIsoDefault(doc.createdAt),
    updatedAt: timestampToIsoDefault(doc.updatedAt),
  };
}

const ledgerTypeToUi: Record<CreditTransactionDoc["type"], CreditTransaction["type"]> = {
  purchase: "purchase",
  spend: "usage",
  refund: "bonus",
  adjustment: "bonus",
  reversal: "bonus",
};

export function mapCreditTransaction(doc: WithId<CreditTransactionDoc>): CreditTransaction {
  return {
    id: doc.id,
    title: doc.description ?? doc.reference ?? `${doc.type} credits`,
    detail: doc.relatedSongId ? `Song ${doc.relatedSongId}` : "Wallet activity",
    amount: doc.amount,
    date: timestampToIsoDefault(doc.createdAt),
    type: ledgerTypeToUi[doc.type],
  };
}

export function mapCreditPackage(doc: WithId<CreditPackageDoc>): CreditPackage {
  return {
    id: doc.id,
    credits: doc.credits,
    price: Math.round(doc.priceMinor / 100),
    label: doc.label,
  };
}

export function mapMember(doc: WithId<UserDoc>): Member {
  const initials = doc.displayName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: doc.id,
    name: doc.displayName,
    email: doc.email ?? "",
    avatarInitials: initials || "MB",
    creditBalance: doc.creditBalance,
    joinedAt: timestampToIsoDefault(doc.createdAt).slice(0, 10),
  };
}

export function mapNotification(doc: WithId<NotificationDoc>): { id: string; title: string; message: string; date: string } {
  return {
    id: doc.id,
    title: doc.title,
    message: doc.message,
    date: timestampToIsoDefault(doc.createdAt),
  };
}
