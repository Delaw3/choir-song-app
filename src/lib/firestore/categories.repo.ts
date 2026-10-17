import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { SongCategoryDoc, WithId } from "@/lib/firestore/types";

const CATEGORIES = "songCategories";

export type CategoryOption = { id: string; name: string; slug: string };

/** Active categories ordered for filter chips / admin lists. */
export async function listActiveCategories(): Promise<CategoryOption[]> {
  const db = getFirebaseDb();
  const snap = await getDocs(
    query(collection(db, CATEGORIES), where("status", "==", "active"), orderBy("sortOrder")),
  );
  return snap.docs.map((d) => {
    const data = d.data() as SongCategoryDoc;
    const withId = { ...data, id: d.id } as WithId<SongCategoryDoc>;
    return { id: withId.id, name: withId.name, slug: withId.slug };
  });
}
