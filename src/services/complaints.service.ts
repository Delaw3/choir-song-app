import { complaints as initialComplaints } from "@/data/complaints";
import type { Complaint, ComplaintStatus, CreateComplaintInput } from "@/types/complaint";

const STORAGE_KEY = "choir-training-complaints";
let complaintStore: Complaint[] = initialComplaints.map((complaint) => ({ ...complaint }));
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) complaintStore = JSON.parse(saved) as Complaint[];
  } catch {
    complaintStore = initialComplaints.map((complaint) => ({ ...complaint }));
  }
}

function getLatestComplaints() {
  if (typeof window === "undefined") return complaintStore;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Complaint[]) : complaintStore;
  } catch {
    return complaintStore;
  }
}

function commit(next: Complaint[]) {
  complaintStore = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

export const complaintsService = {
  subscribe(listener: () => void) {
    hydrate();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getComplaints() {
    hydrate();
    return complaintStore;
  },

  getServerComplaints() {
    return initialComplaints;
  },

  getComplaintById(id: string) {
    return this.getComplaints().find((complaint) => complaint.id === id);
  },

  getUserComplaints(userId: string) {
    return this.getComplaints().filter((complaint) => complaint.userId === userId);
  },

  createComplaint(input: CreateComplaintInput) {
    const now = new Date().toISOString();
    const complaint: Complaint = {
      ...input,
      id: `complaint-${Date.now()}`,
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    };
    commit([complaint, ...getLatestComplaints()]);
    return complaint;
  },

  updateComplaintStatus(id: string, status: ComplaintStatus) {
    const updatedAt = new Date().toISOString();
    commit(getLatestComplaints().map((complaint) => (complaint.id === id ? { ...complaint, status, updatedAt } : complaint)));
    return this.getComplaintById(id);
  },

  respondToComplaint(id: string, adminResponse: string) {
    const respondedAt = new Date().toISOString();
    commit(
      getLatestComplaints().map((complaint) =>
        complaint.id === id
          ? { ...complaint, adminResponse: adminResponse.trim(), respondedAt, updatedAt: respondedAt }
          : complaint,
      ),
    );
    return this.getComplaintById(id);
  },
};
