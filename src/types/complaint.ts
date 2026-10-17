export type ComplaintStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

export type ComplaintCategory =
  | "TECHNICAL_ISSUE"
  | "SONG_REQUEST"
  | "CREDITS_PAYMENT"
  | "ACCOUNT_ISSUE"
  | "AUDIO_PROBLEM"
  | "SUGGESTION"
  | "OTHER";

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: ComplaintCategory;
  subject: string;
  message: string;
  status: ComplaintStatus;
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateComplaintInput = Pick<Complaint, "category" | "subject" | "message"> &
  Pick<Complaint, "userId" | "userName" | "userEmail">;
