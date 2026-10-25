"use client";

import { useEffect } from "react";
import { setStorageProvider, isStorageEnabled } from "@/lib/storage";
import { createSupabaseStorage } from "@/lib/storage/supabase-storage";

/**
 * Client component that initializes the Supabase Storage adapter.
 * Add <StorageInitializer /> to your root layout so storage is ready
 * before any upload UI mounts.
 */
export function StorageInitializer() {
  useEffect(() => {
    if (isStorageEnabled()) return;

    // Only auto-initialize Supabase when its env vars are present.
    const hasSupabaseConfig =
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (hasSupabaseConfig) {
      try {
        setStorageProvider(createSupabaseStorage(), true, "supabase");
      } catch (err) {
        // Supabase not configured — storage stays disabled. The admin UI
        // should degrade gracefully (show a config warning).
        console.warn("Supabase Storage not configured:", err);
      }
    }
  }, []);

  return null;
}