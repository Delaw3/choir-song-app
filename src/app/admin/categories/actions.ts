"use server";

import {
  listAllCategories,
  createCategory,
  updateCategory,
  addSubCategory,
  removeSubCategory,
  deleteCategory,
} from "@/lib/mongodb/repos/categories.repo";
import { requireAdmin } from "@/lib/auth/require";

export type AdminCategoryView = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subCategories: string[];
};

export async function getCategories(): Promise<AdminCategoryView[]> {
  await requireAdmin();
  const docs = await listAllCategories();
  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description,
    subCategories: d.subCategories ?? [],
  }));
}

export async function createCategoryAction(input: {
  name: string;
  slug: string;
  description?: string;
  subCategories?: string[];
}): Promise<string> {
  await requireAdmin();
  return createCategory(input);
}

export async function updateCategoryAction(
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
  return updateCategory(categoryId, input);
}

export async function addSubCategoryAction(
  categoryId: string,
  subCategory: string,
): Promise<void> {
  await requireAdmin();
  return addSubCategory(categoryId, subCategory);
}

export async function removeSubCategoryAction(
  categoryId: string,
  subCategory: string,
): Promise<void> {
  await requireAdmin();
  return removeSubCategory(categoryId, subCategory);
}

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  await requireAdmin();
  return deleteCategory(categoryId);
}
