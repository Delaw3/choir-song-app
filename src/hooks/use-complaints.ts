"use client";

import { useSyncExternalStore } from "react";
import { complaintsService } from "@/services/complaints.service";

export function useComplaints() {
  return useSyncExternalStore(
    complaintsService.subscribe,
    complaintsService.getComplaints,
    complaintsService.getServerComplaints,
  );
}
