"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isFirestoreEnabled } from "@/lib/firebase";
import { listPublishedSongs, type SongsPage } from "@/lib/firestore/songs.repo";
import { songsService } from "@/services/songs.service";
import type { Song } from "@/types/song";

export type SongsSource = "mock" | "firestore" | "firestore-error";

type State = {
  songs: Song[];
  source: SongsSource;
  loading: boolean;
  error: string | null;
};

/** True when the app is attempting Firestore reads (flag on + config present). */
export function useFirestoreMode(): boolean {
  // Computed synchronously; no state or effects needed.
  return isFirestoreEnabled();
}

/** Published catalog with explicit mock <-> Firestore switching. */
export function usePublishedSongs(pageSize = 50): State {
  // Drives the data-source label: Firestore when the flag is on, otherwise mock.
  const source = useMemo<SongsSource>(() => {
    return isFirestoreEnabled() ? "firestore" : "mock";
  }, []);

  const [state, setState] = useState<State>({
    songs: songsService.getPublished(),
    source,
    loading: false,
    error: null,
  });

  const loadFirestore = useCallback(async (): Promise<SongsPage> => {
    return await listPublishedSongs(pageSize);
  }, [pageSize]);

  // Prime the catalog from Firestore on mount when the flag is enabled.
  // The effect holds the async read and all setState updates, so it is a
  // self-contained mount effect (no downstream state-chaining).
  useEffect(() => {
    if (!isFirestoreEnabled()) return;
    let cancelled = false;

    const read = async (): Promise<void> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const page = await loadFirestore();
        if (!cancelled && page.items.length > 0) {
          setState({
            songs: page.items,
            source: "firestore",
            loading: false,
            error: null,
          });
          return;
        }
        if (!cancelled) {
          // Empty Firestore result: honor the fallback and keep the mock data.
          setState({
            songs: songsService.getPublished(),
            source: "firestore-error",
            loading: false,
            error: "Firestore returned no published songs; showing mock catalog.",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            songs: songsService.getPublished(),
            source: "firestore-error",
            loading: false,
            error:
              err instanceof Error ? err.message : "Firestore query failed; showing mock catalog.",
          });
        }
      }
    };

    void read();

    return () => {
      cancelled = true;
    };
  }, [loadFirestore]);

  return state;
}


