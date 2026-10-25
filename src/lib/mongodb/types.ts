/**
 * MongoDB document shapes for the choir song app.
 * Dates are stored as JS Date objects (MongoDB native), converted to ISO
 * strings at UI edges via the repo layer.
 */

export type VoiceGroup = "soprano" | "alto" | "tenor" | "bass";

export interface SongDoc {
  _id?: import("mongodb").ObjectId;
  title: string;
  slug: string;
  description?: string;
  categoryId: string;
  composer?: string;
  language?: string;
  difficulty?: "easy" | "medium" | "hard";
  status: "draft" | "published" | "archived";
  creditCost: number;
  playCount: number;
  isNew?: boolean;
  coverImagePath?: string;
  sheetUrl?: string;
  subCategory?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SongPartDoc {
  _id?: import("mongodb").ObjectId;
  songId: string;
  name: string;
  voiceGroup: VoiceGroup;
  subPart?: number | null;
  audioStoragePath?: string;
  audioUrl?: string;
  durationSeconds?: number;
  creditCost: number;
  status: "draft" | "published";
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SongCategoryDoc {
  _id?: import("mongodb").ObjectId;
  name: string;
  slug: string;
  description?: string;
  subCategories?: string[];
  sortOrder: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Roles are assigned server-side only. `superadmin` is reserved for role
 * management and super-admin-only settings; regular admins are `admin`.
 */
export type UserRole = "member" | "admin" | "superadmin";

export interface UserDoc {
  _id?: import("mongodb").ObjectId;
  displayName: string;
  email?: string;
  passwordHash?: string;
  role: UserRole;
  creditBalance: number;
  status: "active" | "suspended" | "pending";
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: boolean;
}

export interface LibraryItemDoc {
  _id?: import("mongodb").ObjectId;
  userId: string;
  songId: string;
  saved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartUnlockDoc {
  _id?: import("mongodb").ObjectId;
  userId: string;
  songId: string;
  partId: string;
  unlockedAt: Date;
  transactionId?: string;
}

export interface PracticeProgressDoc {
  _id?: import("mongodb").ObjectId;
  userId: string;
  songId: string;
  partId: string;
  status: "not-started" | "in-progress" | "completed";
  lastPracticedAt?: Date;
  playCount: number;
  updatedAt: Date;
}

export type WithId<T> = T & { id: string };

/** Ledger / payments / complaints / notifications shapes. */

export type LedgerType = "purchase" | "spend" | "refund" | "adjustment" | "reversal";

export type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refund_pending"
  | "refunded"
  | "reversed";

export interface CreditTransactionDoc {
  _id?: import("mongodb").ObjectId;
  userId: string;
  type: LedgerType;
  amount: number;
  status: "pending" | "completed" | "failed" | "reversed";
  reference?: string;
  description?: string;
  relatedSongId?: string;
  relatedPartId?: string;
  idempotencyKey?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface PaymentDoc {
  _id?: import("mongodb").ObjectId;
  userId: string;
  provider: "paystack" | "flutterwave" | "manual";
  providerReference?: string;
  amount: number;
  currency: string;
  creditsToGrant: number;
  status: PaymentStatus;
  /** Audit trail: admin who confirmed the payment, and when. */
  confirmedBy?: string;
  confirmedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ComplaintStatus = "open" | "in_review" | "resolved";

export type ComplaintCategory =
  | "TECHNICAL_ISSUE"
  | "SONG_REQUEST"
  | "CREDITS_PAYMENT"
  | "ACCOUNT_ISSUE"
  | "AUDIO_PROBLEM"
  | "SUGGESTION"
  | "OTHER";

export interface ComplaintDoc {
  _id?: import("mongodb").ObjectId;
  userId?: string | null;
  userName: string;
  userEmail: string;
  subject: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintReplyDoc {
  _id?: import("mongodb").ObjectId;
  complaintId: string;
  authorRole: "member" | "admin";
  authorName: string;
  message: string;
  createdAt: Date;
}

export interface NotificationDoc {
  _id?: import("mongodb").ObjectId;
  title: string;
  message: string;
  type: "announcement" | "purchase" | "reminder" | "system";
  published: boolean;
  targetAudience: "all" | "members" | "admins";
  createdAt: Date;
}

export interface NotificationReadDoc {
  _id?: import("mongodb").ObjectId;
  userId: string;
  notificationId: string;
  readAt: Date;
}

export interface CreditPackageDoc {
  _id?: import("mongodb").ObjectId;
  credits: number;
  priceMinor: number;
  currency: string;
  label?: string;
  sortOrder: number;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}