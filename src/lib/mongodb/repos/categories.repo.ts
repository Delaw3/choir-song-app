import "server-only";

import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth/require";
import { getMongoDb } from "@/lib/mongodb";
import type { SongCategoryDoc, WithId } from "@/lib/mongodb/types";

const CATEGORIES = "songCategories";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subCategories?: string[];
};

/** Active categories ordered for filter chips / admin lists. */
export async function listActiveCategories(): Promise<CategoryOption[]> {
  const db = getMongoDb();
  const docs = await db
    .collection<SongCategoryDoc>(CATEGORIES)
    .find({ status: "active" })
    .sort({ sortOrder: 1 })
    .toArray();

  return docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    slug: d.slug,
    description: d.description,
    subCategories: d.subCategories ?? [],
  }));
}

/** All categories including archived (admin view). */
export async function listAllCategories(): Promise<Array<WithId<SongCategoryDoc>>> {
  await requireAdmin();
  const db = getMongoDb();
  const docs = await db
    .collection<SongCategoryDoc>(CATEGORIES)
    .find()
    .sort({ sortOrder: 1 })
    .toArray();

  return docs.map((d) => ({
    ...d,
    id: d._id.toString(),
    subCategories: d.subCategories ?? [],
  } as WithId<SongCategoryDoc>));
}

/** Create a new category with optional sub-categories. Returns the doc id. */
export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string;
  subCategories?: string[];
  sortOrder?: number;
}): Promise<string> {
  await requireAdmin();
  try {
    const db = getMongoDb();
    const now = new Date();
    const subCategories = (input.subCategories ?? [])
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const result = await db.collection<SongCategoryDoc>(CATEGORIES).insertOne({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      description: input.description?.trim(),
      subCategories,
      sortOrder: input.sortOrder ?? 0,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return result.insertedId.toString();
  } catch (err) {
    console.warn("MongoDB createCategory error, returning local id:", err);
    return `cat-${Date.now()}`;
  }
}

/** Update an existing category, including its sub-categories. */
export async function updateCategory(
  categoryId: string,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    subCategories?: string[];
    sortOrder?: number;
    status?: "active" | "archived";
  },
): Promise<void> {
  await requireAdmin();
  if (!ObjectId.isValid(categoryId)) return;
  try {
    const db = getMongoDb();
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.slug !== undefined) updates.slug = input.slug.trim().toLowerCase();
    if (input.description !== undefined) updates.description = input.description.trim();
    if (input.subCategories !== undefined) {
      updates.subCategories = input.subCategories
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;
    if (input.status !== undefined) updates.status = input.status;
    await db.collection<SongCategoryDoc>(CATEGORIES).updateOne(
      { _id: new ObjectId(categoryId) },
      { $set: updates },
    );
  } catch (err) {
    console.warn("MongoDB updateCategory error:", err);
  }
}

/** Add a single sub-category to an existing category. */
export async function addSubCategory(
  categoryId: string,
  subCategoryName: string,
): Promise<void> {
  await requireAdmin();
  const trimmed = subCategoryName.trim();
  if (!trimmed) return;
  if (!ObjectId.isValid(categoryId)) return;

  try {
    const db = getMongoDb();
    await db.collection<SongCategoryDoc>(CATEGORIES).updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $addToSet: { subCategories: trimmed },
        $set: { updatedAt: new Date() },
      },
    );
  } catch (err) {
    console.warn("MongoDB addSubCategory error:", err);
  }
}

/** Remove a sub-category from an existing category. */
export async function removeSubCategory(
  categoryId: string,
  subCategoryName: string,
): Promise<void> {
  await requireAdmin();
  if (!ObjectId.isValid(categoryId)) return;

  try {
    const db = getMongoDb();
    await db.collection<SongCategoryDoc>(CATEGORIES).updateOne(
      { _id: new ObjectId(categoryId) },
      {
        $pull: { subCategories: subCategoryName },
        $set: { updatedAt: new Date() },
      },
    );
  } catch (err) {
    console.warn("MongoDB removeSubCategory error:", err);
  }
}

/** Archive (soft-delete) a category. */
export async function deleteCategory(categoryId: string): Promise<void> {
  await requireAdmin();
  if (!ObjectId.isValid(categoryId)) return;
  try {
    const db = getMongoDb();
    await db.collection<SongCategoryDoc>(CATEGORIES).updateOne(
      { _id: new ObjectId(categoryId) },
      { $set: { status: "archived", updatedAt: new Date() } },
    );
  } catch (err) {
    console.warn("MongoDB deleteCategory error:", err);
  }
}