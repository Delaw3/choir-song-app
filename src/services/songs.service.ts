import { songs } from "@/data/songs";
import type { PracticeStatus, Song, SongCategory, SongSubCategory } from "@/types/song";

export type SongFilters = {
  query?: string;
  category?: SongCategory | "All";
  subCategory?: SongSubCategory | "All";
  voiceParts?: string[];
  practiceStatus?: PracticeStatus | "Any";
  creditCost?: number | "Any";
};

export const songsService = {
  getAll(): Song[] {
    return songs;
  },
  getPublished(): Song[] {
    return songs.filter((song) => song.status === "published");
  },
  getById(id: string): Song | undefined {
    return songs.find((song) => song.id === id);
  },
  search(query: string): Song[] {
    const term = query.trim().toLowerCase();
    if (!term) return songs.filter((song) => song.title.startsWith("Ave"));
    return songs.filter((song) =>
      [song.title, song.composer, song.category, song.subCategory ?? "", ...song.parts.map((part) => part.displayName)]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  },
  filter(filters: SongFilters): Song[] {
    return songs.filter((song) => {
      const matchesQuery = !filters.query || `${song.title} ${song.composer}`.toLowerCase().includes(filters.query.toLowerCase());
      const matchesCategory = !filters.category || filters.category === "All" || song.category === filters.category;
      const matchesSubCategory =
        !filters.subCategory || filters.subCategory === "All" || song.subCategory === filters.subCategory;
      const matchesStatus = !filters.practiceStatus || filters.practiceStatus === "Any" || song.practiceStatus === filters.practiceStatus;
      const matchesCost = !filters.creditCost || filters.creditCost === "Any" || song.creditCost <= filters.creditCost;
      const selectedParts = filters.voiceParts?.filter(Boolean) ?? [];
      const matchesParts =
        selectedParts.length === 0 ||
        selectedParts.some((part) => song.parts.some((songPart) => songPart.displayName.toLowerCase().replaceAll(" ", "").includes(part.toLowerCase())));

      return matchesQuery && matchesCategory && matchesSubCategory && matchesStatus && matchesCost && matchesParts;
    });
  },
  getNew(): Song[] {
    return songs.filter((song) => song.isNew);
  },
  getUnlocked(): Song[] {
    return songs.filter((song) => song.isUnlocked);
  },
  getSaved(): Song[] {
    return songs.filter((song) => song.isSaved);
  },
  getRecentlyPracticed(): Song[] {
    return songs.filter((song) => song.lastPracticedAt);
  },
};
