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

export type SongCategory = "Christmas" | "Mass" | "Non Liturgical" | "Communion" | "Anthems" | (string & {});

/** Sub-categories that apply to categories with subdivisions (e.g. Mass, Hymns, etc.). */
export type MassSubCategory =
  | "Entrance"
  | "Offertory"
  | "Kyrie"
  | "Gloria"
  | "Credo"
  | "Sanctus"
  | "Agnus Dei"
  | "Communion Rite";

export type SongSubCategory = MassSubCategory | (string & {});

export type Song = {
  id: string;
  title: string;
  composer: string;
  category: SongCategory;
  /** Optional sub-category if the category has sub-categories. */
  subCategory?: SongSubCategory;
  creditCost: number;
  status: "draft" | "published";
  playCount: number;
  practiceStatus: PracticeStatus;
  isNew?: boolean;
  isUnlocked?: boolean;
  isSaved?: boolean;
  lastPracticedAt?: string;
  /** Public URL of the song's music sheet (PDF or image). Admin-uploaded. */
  sheetUrl?: string;
  parts: SongPart[];
};
