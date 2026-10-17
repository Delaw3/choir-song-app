export type VoiceType = "soprano" | "alto" | "tenor" | "bass";

export type PracticeStatus = "not-started" | "in-progress" | "completed";

export type SongPart = {
  id: string;
  voiceType: VoiceType;
  partNumber?: number;
  displayName: string;
  audioUrl?: string;
  duration?: number;
  creditCost: number;
};

export type SongCategory = "Mass" | "Communion" | "Anthems";

export type Song = {
  id: string;
  title: string;
  composer: string;
  category: SongCategory;
  creditCost: number;
  status: "draft" | "published";
  playCount: number;
  practiceStatus: PracticeStatus;
  isNew?: boolean;
  isUnlocked?: boolean;
  isSaved?: boolean;
  lastPracticedAt?: string;
  parts: SongPart[];
};
