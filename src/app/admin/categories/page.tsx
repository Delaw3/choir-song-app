"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, Tags, Layers, AlertCircle, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCategories,
  updateCategoryAction,
  addSubCategoryAction,
  removeSubCategoryAction,
  deleteCategoryAction,
  type AdminCategoryView,
} from "./actions";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryView[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Inline add sub-category to existing category state
  const [activeAddSubId, setActiveAddSubId] = useState<string | null>(null);
  const [inlineSubInput, setInlineSubInput] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    setError(null);
    try {
      const all = await getCategories();
      setCategories(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(event: React.FormEvent, id: string) {
    event.preventDefault();
    setError(null);
    const trimmed = editName.trim();
    if (!trimmed) return;
    try {
      const updatedSlug = trimmed
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      await updateCategoryAction(id, { name: trimmed, slug: updatedSlug });
      setCategories((cats) =>
        cats.map((c) => (c.id === id ? { ...c, name: trimmed, slug: updatedSlug } : c)),
      );
      setEditingId(null);
      setSuccess(`Updated category "${trimmed}".`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category.");
    }
  }

  async function handleAddInlineSub(categoryId: string) {
    const trimmed = inlineSubInput.trim();
    if (!trimmed) return;
    try {
      await addSubCategoryAction(categoryId, trimmed);
      setCategories((cats) =>
        cats.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subCategories: c.subCategories.includes(trimmed)
                  ? c.subCategories
                  : [...c.subCategories, trimmed],
              }
            : c,
        ),
      );
      setInlineSubInput("");
      setActiveAddSubId(null);
      setSuccess(`Added sub-category "${trimmed}".`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add sub-category.");
    }
  }

  async function handleRemoveSub(categoryId: string, subCategory: string) {
    try {
      await removeSubCategoryAction(categoryId, subCategory);
      setCategories((cats) =>
        cats.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                subCategories: c.subCategories.filter((s) => s !== subCategory),
              }
            : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove sub-category.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Archive this category?")) return;
    setError(null);
    try {
      await deleteCategoryAction(id);
      setCategories((cats) => cats.filter((c) => c.id !== id));
      setSuccess("Category archived successfully.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive category.");
    }
  }

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.slug.toLowerCase().includes(term) ||
      c.subCategories.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header with Create Category Button on the Right */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 sm:text-sm">Catalog Structure</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Categories</h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Manage your choir repertoire categories and subdivisions.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="flex items-center gap-1.5 rounded-2xl bg-violet-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-800 active:scale-95">
            <Plus className="size-4" />
            <span>Create Category</span>
          </Button>
        </Link>
      </header>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 sm:text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 sm:text-sm">
          {success}
        </div>
      )}

      {/* Search / Filter Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories or sub-categories..."
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-500/10 sm:text-sm"
        />
      </div>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-950 sm:text-lg">
            Created Categories ({filteredCategories.length})
          </h2>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-bold text-violet-700 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center text-sm font-semibold text-slate-400">
            Loading categories from database…
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Tags className="mx-auto size-10 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">
              {search ? "No matching categories" : "No categories yet"}
            </h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {search
                ? `No categories match "${search}". Try another keyword.`
                : "Create your first category to organize songs for your choir."}
            </p>
            {!search && (
              <div className="mt-5">
                <Link href="/admin/categories/new">
                  <Button size="sm">
                    <Plus className="mr-1 size-4" />
                    Create Category
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCategories.map((cat) => {
              const isEditing = editingId === cat.id;
              const hasSubs = cat.subCategories && cat.subCategories.length > 0;

              return (
                <div
                  key={cat.id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
                >
                  <div>
                    {/* Header: Name, Slug, & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleUpdate(e, cat.id)}
                            className="space-y-2 pt-1"
                          >
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Category name"
                              required
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">Save</Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div>
                            <h3 className="truncate text-base font-black text-slate-950 sm:text-lg">
                              {cat.name}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Slug: <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-600">{cat.slug}</code>
                            </p>
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditName(cat.name);
                            }}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Edit Category Name"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
                            className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            title="Archive Category"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sub-Categories Section */}
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <Layers className="size-3.5 text-slate-400" />
                          {hasSubs
                            ? `Sub-categories (${cat.subCategories.length})`
                            : "Direct Category (No sub-parts)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAddSubId(activeAddSubId === cat.id ? null : cat.id);
                            setInlineSubInput("");
                          }}
                          className="text-xs font-bold text-violet-700 hover:underline"
                        >
                          + Add Sub
                        </button>
                      </div>

                      {/* Sub-category chips */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {hasSubs ? (
                          cat.subCategories.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSub(cat.id, sub)}
                                className="text-slate-400 hover:text-rose-600"
                                title={`Remove ${sub}`}
                              >
                                <X className="size-3" />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            Songs are assigned directly to this category.
                          </span>
                        )}
                      </div>

                      {/* Inline Add Sub-Category Input */}
                      {activeAddSubId === cat.id && (
                        <div className="mt-3 flex gap-2">
                          <Input
                            value={inlineSubInput}
                            onChange={(e) => setInlineSubInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddInlineSub(cat.id);
                              }
                            }}
                            placeholder="New sub-category name"
                            autoFocus
                            className="h-10 text-xs"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddInlineSub(cat.id)}
                            disabled={!inlineSubInput.trim()}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
