import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { canUseFirestore } from "@/lib/firestore/client";
import { getFirebaseDb } from "@/lib/firebase";
import { mapSong, mapSongPart } from "@/lib/firestore/mappers";
import type { Song, SongPart } from "@/types/song";
import type { SongCategoryDoc, SongDoc, SongPartDoc, WithId } from "@/lib/firestore/types";

const SONGS = "songs";
const PARTS = "songParts";
const CATEGORIES = "songCategories";

function withId<T>(snap: QueryDocumentSnapshot<DocumentData>): WithId<T> {
  return { ...(snap.data() as T), id: snap.id };
}

async function getCategoryNames(): Promise<Map<string, string>> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, CATEGORIES), orderBy("sortOrder")));
  const map = new Map<string, string>();
  snap.forEach((d) => {
    const data = d.data() as SongCategoryDoc;
    map.set(d.id, data.name);
  });
  return map;
}

async function getPartsForSong(songId: string): Promise<Array<WithId<SongPartDoc>>> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, PARTS), where("songId", "==", songId), orderBy("sortOrder")),
  );
  return snap.docs.map((d) => withId<SongPartDoc>(d));
}

export type SongsPage = { items: Song[]; nextCursor?: string };

/** List published songs with cursor pagination (ordered by title). */
export async function listPublishedSongs(pageSize = 20, cursor?: string): Promise<SongsPage> {
  const db = getFirebaseDb();
  const categories = await getCategoryNames();
  let q = query(collection(db, SONGS), where("status", "==", "published"), orderBy("title"), limit(pageSize));
  if (cursor) {
    const cursorSnap = await getDoc(doc(db, SONGS, cursor));
    if (cursorSnap.exists()) q = query(q, startAfter(cursorSnap));
  }
  const snap = await getDocs(q);
  const items: Song[] = [];
  for (const d of snap.docs) {
    const song = withId<SongDoc>(d);
    const parts = await getPartsForSong(d.id);
    items.push(
      mapSong({ song, parts, categoryName: categories.get(song.categoryId) ?? "Anthems" }),
    );
  }
  const last = snap.docs[snap.docs.length - 1];
  return { items, nextCursor: snap.docs.length === pageSize && last ? last.id : undefined };
}

export async function getSongById(id: string): Promise<Song | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, SONGS, id));
  if (!snap.exists()) return null;
  const song = { ...(snap.data() as SongDoc), id: snap.id };
  if (song.status !== "published") return null;
  const parts = await getPartsForSong(id);
  let categoryName = "Anthems";
  try {
    const cat = await getDoc(doc(db, CATEGORIES, song.categoryId));
    if (cat.exists()) categoryName = (cat.data() as SongCategoryDoc).name;
  } catch {
    categoryName = "Anthems";
  }
  return mapSong({ song, parts, categoryName });
}

export async function fetchPartsForSong(songId: string): Promise<SongPart[]> {
  const parts = await getPartsForSong(songId);
  return parts.map((p) => mapSongPart(songId, p));
}

/** Prefix search on title (requires `title` ordering; full-text moves server-side later). */
export async function searchSongs(term: string, pageSize = 20): Promise<Song[]> {
  const cleaned = term.trim();
  if (!cleaned) {
    const page = await listPublishedSongs(pageSize);
    return page.items;
  }
  const db = getFirebaseDb();
  const categories = await getCategoryNames();
  const snap = await getDocs(
    query(
      collection(db, SONGS),
      where("status", "==", "published"),
      orderBy("title"),
      where("title", ">=", cleaned),
      where("title", "<=", `${cleaned}\uf8ff`),
      limit(pageSize),
    ),
  );
  const items: Song[] = [];
  for (const d of snap.docs) {
    const song = withId<SongDoc>(d);
    const parts = await getPartsForSong(d.id);
    items.push(mapSong({ song, parts, categoryName: categories.get(song.categoryId) ?? "Anthems" }));
  }
  return items;
}

export async function listSongsByCategory(categoryId: string, pageSize = 20): Promise<Song[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(
      collection(db, SONGS),
      where("status", "==", "published"),
      where("categoryId", "==", categoryId),
      orderBy("title"),
      limit(pageSize),
    ),
  );
  const categories = await getCategoryNames();
  const items: Song[] = [];
  for (const d of snap.docs) {
    const song = withId<SongDoc>(d);
    const parts = await getPartsForSong(d.id);
    items.push(mapSong({ song, parts, categoryName: categories.get(song.categoryId) ?? "Anthems" }));
  }
  return items;
}

/** Admin: list all songs regardless of status (auth-gated by rules later). */
export async function listAllSongsAdmin(pageSize = 50): Promise<Song[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, SONGS), orderBy("updatedAt", "desc"), limit(pageSize)));
  const categories = await getCategoryNames();
  const items: Song[] = [];
  for (const d of snap.docs) {
    const song = withId<SongDoc>(d);
    const parts = await getPartsForSong(d.id);
    items.push(mapSong({ song, parts, categoryName: categories.get(song.categoryId) ?? "Anthems" }));
  }
  return items;
}

export function isSongsRepoAvailable(): boolean {
  return canUseFirestore();
}
