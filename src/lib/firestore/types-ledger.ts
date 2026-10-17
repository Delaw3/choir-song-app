import type { Timestamp } from "firebase/firestore";

/** Append-only ledger + payments + support + messaging shapes. */

export type LedgerType = "purchase" | "spend" | "refund" | "adjustment" | "reversal";

export type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refund_pending"
  | "refunded"
  | "reversed";

export interface CreditTransactionDoc {
  userId: string;
  type: LedgerType;
  amount: number;
  status: "pending" | "completed" | "failed" | "reversed";
  reference?: string;
  description?: string;
  relatedSongId?: string;
  relatedPartId?: string;
  idempotencyKey?: string;
  createdAt: Timestamp;
  metadata?: Record<string, unknown>;
}

export interface PaymentDoc {
  userId: string;
  provider: "paystack" | "flutterwave" | "manual";
  providerReference?: string;
  amount: number;
  currency: string;
  creditsToGrant: number;
  status: PaymentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  userId?: string | null;
  userName: string;
  userEmail: string;
  subject: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ComplaintReplyDoc {
  authorRole: "member" | "admin";
  authorName: string;
  message: string;
  createdAt: Timestamp;
}

export interface NotificationDoc {
  title: string;
  message: string;
  type: "announcement" | "purchase" | "reminder" | "system";
  published: boolean;
  targetAudience: "all" | "members" | "admins";
  createdAt: Timestamp;
}

export interface NotificationReadDoc {
  userId: string;
  notificationId: string;
  readAt: Timestamp;
}

export interface CreditPackageDoc {
  credits: number;
  priceMinor: number;
  currency: string;
  label?: string;
  sortOrder: number;
  status: "active" | "archived";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type WithId<T> = T & { id: string };


