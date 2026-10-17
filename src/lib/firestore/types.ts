import type { Timestamp } from "firebase/firestore";

/**
 * Core catalog + identity Firestore shapes.
 * Timestamps are Firestore `Timestamp` in storage; convert to ISO at UI edges.
 * Status enums are lowercase in Firestore (mappers translate legacy UPPER_CASE).
 */

export type FirestoreStatus = "draft" | "published" | "archived";
export type VoiceGroup = "soprano" | "alto" | "tenor" | "bass";

export interface SongDoc {
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  composer?: string;
  language?: string;
  difficulty?: "easy" | "medium" | "hard";
  status: FirestoreStatus;
  creditCost: number;
  playCount: number;
  isNew?: boolean;
  coverImagePath?: string;
  createdBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SongPartDoc {
  songId: string;
  name: string;
  voiceGroup: VoiceGroup;
  subPart?: number | null;
  audioStoragePath?: string;
  durationSeconds?: number;
  creditCost: number;
  status: "draft" | "published";
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SongCategoryDoc {
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  status: "active" | "archived";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type UserRole = "member" | "admin";

export interface UserDoc {
  displayName: string;
  email?: string;
  role: UserRole;
  creditBalance: number;
  status: "active" | "suspended" | "pending";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LibraryItemDoc {
  userId: string;
  songId: string;
  saved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PartUnlockDoc {
  userId: string;
  songId: string;
  partId: string;
  unlockedAt: Timestamp;
  transactionId?: string;
}

export interface PracticeProgressDoc {
  userId: string;
  songId: string;
  partId: string;
  status: "not-started" | "in-progress" | "completed";
  lastPracticedAt?: Timestamp;
  playCount: number;
  updatedAt: Timestamp;
}

export type WithId<T> = T & { id: string };
