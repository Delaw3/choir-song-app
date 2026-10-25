import "server-only";

import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import { songsService } from "@/services/songs.service";
import type { Song, SongPart } from "@/types/song";
import type { SongDoc, SongPartDoc, SongCategoryDoc, WithId } from "@/lib/mongodb/types";

const SONGS = "songs";
const PARTS = "songParts";

export type SongsPage = { items: Song[]; nextCursor?: string };

function toSongPart(doc: WithId<SongPartDoc>): SongPart {
  return {
    id: doc.id,
    voiceType: doc.voiceGroup,
    partNumber: doc.subPart ?? undefined,
    displayName: doc.name,
    audioUrl: doc.audioUrl,
    duration: doc.durationSeconds,
    creditCost: doc.creditCost,
  };
}

function toSong(doc: WithId<SongDoc>, parts: SongPart[], categoryName: string): Song {
  return {
    id: doc.id,
    title: doc.title,
    composer: doc.composer ?? "Unknown composer",
    category: (doc.categoryId as unknown as Song["category"]) ?? "Anthems",
    subCategory: (doc.subCategory as unknown as Song["subCategory"] | undefined) ?? undefined,
    creditCost: doc.creditCost,
    status: doc.status === "archived" ? "draft" : doc.status,
    playCount: doc.playCount,
    practiceStatus: "not-started",
    isNew: doc.isNew,
    isUnlocked: true,
    isSaved: false,
    sheetUrl: doc.sheetUrl,
    parts,
  };
}

async function getCategoryNamesMap(): Promise<Map<string, string>> {
  const db = getMongoDb();
  const docs = await db.collection<SongCategoryDoc>("songCategories").find().toArray();
  const map = new Map<string, string>();
  docs.forEach((d) => map.set(d._id.toString(), d.name));
  return map;
}

async function getPartsForSong(songId: string): Promise<SongPart[]> {
  const db = getMongoDb();
  const docs = await db
    .collection<SongPartDoc>(PARTS)
    .find({ songId })
    .sort({ sortOrder: 1, createdAt: 1 })
    .toArray();
  return docs.map((d) => toSongPart({ ...d, id: d._id.toString() }));
}

/** List published songs sorted by title. */
export async function listPublishedSongs(pageSize = 20): Promise<SongsPage> {
  try {
    const db = getMongoDb();
    const categories = await getCategoryNamesMap();
    const docs = await db
      .collection<SongDoc>(SONGS)
      .find({ status: "published" })
      .toArray();

    if (docs.length > 0) {
      const items: Song[] = [];
      for (const doc of docs) {
        const parts = await getPartsForSong(doc._id.toString());
        items.push(
          toSong(
            { ...doc, id: doc._id.toString() },
            parts,
            categories.get(doc._id.toString()) ?? "Anthems",
          ),
        );
      }

      items.sort((a, b) => a.title.localeCompare(b.title));
      const page = items.slice(0, pageSize);
      return {
        items: page,
        nextCursor: items.length > pageSize ? page[page.length - 1].id : undefined,
      };
    }
  } catch (err) {
    console.warn("MongoDB listPublishedSongs error, falling back to mock catalog:", err);
  }

  const mockSongs = songsService.getPublished();
  return {
    items: mockSongs.slice(0, pageSize),
    nextCursor: undefined,
  };
}

/** Get a single published song by ID. */
export async function getSongById(id: string): Promise<Song | null> {
  if (ObjectId.isValid(id)) {
    try {
      const db = getMongoDb();
      const doc = await db
        .collection<SongDoc>(SONGS)
        .findOne({ _id: new ObjectId(id) });

      if (doc && doc.status === "published") {
        const parts = await getPartsForSong(doc._id.toString());
        const categories = await getCategoryNamesMap();
        return toSong(
          { ...doc, id: doc._id.toString() },
          parts,
          categories.get(doc._id.toString()) ?? "Anthems",
        );
      }
    } catch (err) {
      console.warn("MongoDB getSongById error:", err);
    }
  }

  return songsService.getById(id) ?? null;
}

/** Admin: create a new song document. Returns the auto-generated id. */
export async function createSong(input: {
  title: string;
  slug: string;
  categoryId: string;
  composer?: string;
  creditCost: number;
  status: "draft" | "published";
  sheetUrl?: string;
  subCategory?: string;
}): Promise<{ id: string }> {
  await requireAdmin();
  const db = getMongoDb();
  const now = new Date();
  const result = await db.collection<SongDoc>(SONGS).insertOne({
    title: input.title,
    slug: input.slug,
    categoryId: input.categoryId,
    composer: input.composer,
    creditCost: input.creditCost,
    status: input.status,
    sheetUrl: input.sheetUrl,
    subCategory: input.subCategory,
    playCount: 0,
    isNew: false,
    createdAt: now,
    updatedAt: now,
  } as SongDoc);
  return { id: result.insertedId.toString() };
}

/** Admin: update a song's sheet download URL. */
export async function updateSongSheetUrl(
  songId: string,
  sheetUrl: string,
): Promise<void> {
  await requireAdmin();
  const db = getMongoDb();
  await db.collection<SongDoc>(SONGS).updateOne(
    { _id: new ObjectId(songId) },
    { $set: { sheetUrl, updatedAt: new Date() } },
  );
}

/** Admin: list all songs regardless of status, newest first. */
export async function listAllSongsAdmin(pageSize = 50): Promise<Song[]> {
  await requireAdmin();
  const db = getMongoDb();
  const categories = await getCategoryNamesMap();
  const docs = await db
    .collection<SongDoc>(SONGS)
    .find()
    .sort({ updatedAt: -1 })
    .limit(pageSize)
    .toArray();

  const items: Song[] = [];
  for (const doc of docs) {
    const parts = await getPartsForSong(doc._id.toString());
    items.push(
      toSong(
        { ...doc, id: doc._id.toString() },
        parts,
        categories.get(doc._id.toString()) ?? "Anthems",
      ),
    );
  }
  return items;
}

/** List published songs by category. */
export async function listSongsByCategory(
  categoryId: string,
  pageSize = 20,
): Promise<Song[]> {
  const db = getMongoDb();
  const categories = await getCategoryNamesMap();
  const docs = await db
    .collection<SongDoc>(SONGS)
    .find({ status: "published", categoryId })
    .toArray();

  const items: Song[] = [];
  for (const doc of docs) {
    const parts = await getPartsForSong(doc._id.toString());
    items.push(
      toSong(
        { ...doc, id: doc._id.toString() },
        parts,
        categories.get(doc._id.toString()) ?? "Anthems",
      ),
    );
  }
  items.sort((a, b) => a.title.localeCompare(b.title));
  return items.slice(0, pageSize);
}

/** Admin: fetch parts for a song. */
export async function fetchPartsForSong(songId: string): Promise<SongPart[]> {
  await requireAdmin();
  return getPartsForSong(songId);
}

export function isSongsRepoAvailable(): boolean {
  return Boolean(process.env.MONGODB_URI);
}