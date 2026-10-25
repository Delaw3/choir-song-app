"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Tags, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategoryAction } from "../actions";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subInput, setSubInput] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddSub() {
    const trimmed = subInput.trim();
    if (trimmed && !subCategories.includes(trimmed)) {
      setSubCategories((prev) => [...prev, trimmed]);
      setSubInput("");
    }
  }

  function handleRemoveSub(sub: string) {
    setSubCategories((prev) => prev.filter((s) => s !== sub));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const slug = trimmedName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    setCreating(true);
    try {
      await createCategoryAction({
        name: trimmedName,
        slug,
        subCategories,
      });

      router.push("/admin/categories");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50"
          aria-label="Back to categories"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700 sm:text-sm">Catalog Structure</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Create Category</h1>
        </div>
      </header>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 sm:text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-7">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Tags className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950 sm:text-lg">Category Details</h2>
            <p className="text-xs text-slate-500">
              Songs will be categorized under this name in the member catalog.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Easter, Hymns, Marian"
              required
              autoFocus
            />
          </div>

          {/* Optional Sub-Categories */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Sub-categories (Optional)
            </label>
            <p className="mt-0.5 text-xs text-slate-400">
              Add subdivisions (e.g. &ldquo;Entrance&rdquo;, &ldquo;Kyrie&rdquo;, &ldquo;Offertory&rdquo;). Leave empty if this category does not have parts.
            </p>

            <div className="mt-3 flex gap-2">
              <Input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSub();
                  }
                }}
                placeholder="Type sub-category name & press Add"
                className="bg-white"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddSub}
                disabled={!subInput.trim()}
                className="shrink-0"
              >
                <Plus className="mr-1 size-4" />
                Add
              </Button>
            </div>

            {subCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {subCategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSub(sub)}
                      className="rounded-full text-violet-500 hover:text-rose-600"
                      aria-label={`Remove ${sub}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/admin/categories">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={creating || !name.trim()}>
              {creating ? "Creating…" : "Save Category"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
