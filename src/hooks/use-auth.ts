"use client";

import { useSyncExternalStore } from "react";
import { authService } from "@/services/auth.service";

export function useAuth() {
  return useSyncExternalStore(authService.subscribe, authService.getState, authService.getServerState);
}

export function useAuthActions() {
  return {
    async googleSignIn() {
      await authService.googleSignIn();
    },
  };
}

const subscribeNoop = () => () => undefined;

export function usePendingAuthEmail() {
  return useSyncExternalStore(subscribeNoop, authService.getPendingEmail, () => "member@example.com");
}
