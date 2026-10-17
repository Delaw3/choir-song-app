import type { ComplaintCategory, ComplaintStatus } from "@/types/complaint";

export const complaintCategories: ComplaintCategory[] = [
  "TECHNICAL_ISSUE",
  "SONG_REQUEST",
  "CREDITS_PAYMENT",
  "ACCOUNT_ISSUE",
  "AUDIO_PROBLEM",
  "SUGGESTION",
  "OTHER",
];

export const complaintStatuses: ComplaintStatus[] = ["OPEN", "IN_REVIEW", "RESOLVED"];

export const complaintCategoryLabels: Record<ComplaintCategory, string> = {
  TECHNICAL_ISSUE: "Technical Issue",
  SONG_REQUEST: "Song Request",
  CREDITS_PAYMENT: "Credits & Payment",
  ACCOUNT_ISSUE: "Account Issue",
  AUDIO_PROBLEM: "Audio Problem",
  SUGGESTION: "Suggestion",
  OTHER: "Other",
};

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  RESOLVED: "Resolved",
};
