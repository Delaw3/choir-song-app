"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SongCategory, SongSubCategory, VoiceType } from "@/types/song";
import { createSongAction } from "@/app/admin/songs/add/actions";
import { getCategories, type AdminCategoryView } from "@/app/admin/categories/actions";

type DraftPart = {
  id: string;
  voiceType: VoiceType;
  partNumber: string;
  displayName: string;
  audioFile: string;
  duration: string;
  creditCost: string;
};

const voiceTypes: VoiceType[] = ["soprano", "alto", "tenor", "bass"];

export function AddSongPanel() {
  const [parts, setParts] = useState<DraftPart[]>([
    { id: "part-1", voiceType: "soprano", partNumber: "1", displayName: "Soprano 1", audioFile: "", duration: "214", creditCost: "2" },
  ]);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [category, setCategory] = useState<SongCategory>("");
  const [subCategory, setSubCategory] = useState<SongSubCategory | "All">("All");
  const [creditCost, setCreditCost] = useState("");
  const [categoriesList, setCategoriesList] = useState<AdminCategoryView[]>([]);

  useEffect(() => {
    getCategories()
      .then((cats: AdminCategoryView[]) => {
        if (cats && cats.length > 0) {
          setCategoriesList(cats);
          setCategory((curr) => curr || cats[0].name);
        }
      })
      .catch(() => undefined);
  }, []);

  const addPart = () => {
    setParts((items) => [
      ...items,
      { id: `part-${items.length + 1}`, voiceType: "alto", partNumber: "", displayName: "Alto", audioFile: "", duration: "", creditCost: "2" },
    ]);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    setIsSaving(true);
    try {
      // All song creation goes through the admin Server Action, which
      // validates the session and requires the admin role server-side.
      const formData = new FormData();
      formData.set("title", title);
      if (composer) formData.set("composer", composer);
      formData.set("category", category);
      if (category === "Mass" && subCategory !== "All") {
        formData.set("subCategory", subCategory);
      }
      formData.set("creditCost", creditCost);
      formData.set("status", "draft");
      if (sheetFile) formData.set("sheetFile", sheetFile);

      await createSongAction(formData);
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save song.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Add Song</h2>
          <p className="mt-1 text-sm text-slate-500">
            Saves the song and its music sheet to MongoDB + Supabase Storage.
          </p>
        </div>
        <form onSubmit={handleSave} className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save song"}
          </Button>
        </form>
      </div>

      {saveError && (
        <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{saveError}</div>
      )}
      {saveSuccess && (
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
          Song saved successfully to MongoDB.
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Input
          value={title}
          placeholder="Song title"
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          value={composer}
          placeholder="Composer"
          onChange={(event) => setComposer(event.target.value)}
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as SongCategory)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
        >
          {categoriesList.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        {(() => {
          const selected = categoriesList.find(
            (c) => c.name.toLowerCase() === category.toLowerCase(),
          );
          if (!selected || !selected.subCategories || selected.subCategories.length === 0)
            return null;
          return (
            <select
              value={subCategory}
              onChange={(event) => setSubCategory(event.target.value as SongSubCategory | "All")}
              className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="All">Sub-category (All)</option>
              {selected.subCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          );
        })()}
        <Input
          value={creditCost}
          placeholder="Credit cost"
          type="number"
          onChange={(event) => setCreditCost(event.target.value)}
        />
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Music sheet</h3>
          <label
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-violet-500 transition"
            aria-label="Upload music sheet"
          >
            <input
              type="file"
              accept=".pdf, image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (!file) return;
                if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
                  alert("Please upload a PDF or image file.");
                  return;
                }
                if (sheetPreviewUrl) URL.revokeObjectURL(sheetPreviewUrl);
                setSheetFile(file);
                setSheetPreviewUrl(URL.createObjectURL(file));
              }}
            />
            Choose file
          </label>
        </div>
        {sheetPreviewUrl && (
          <div className="mt-3 flex items-center gap-3">
            {sheetPreviewUrl.toLowerCase().endsWith(".pdf") ? (
              <embed src={sheetPreviewUrl} type="application/pdf" className="w-32 h-40 object-contain border border-slate-200 rounded-xl" title="Sheet preview" />
            ) : (
              <img src={sheetPreviewUrl} alt="Sheet preview" className="w-32 h-40 object-cover border border-slate-200 rounded-xl" />
            )}
            <button
              type="button"
              aria-label="Remove music sheet"
              onClick={() => {
                if (sheetPreviewUrl) URL.revokeObjectURL(sheetPreviewUrl);
                setSheetFile(null);
                setSheetPreviewUrl(null);
              }}
              className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <p className="mt-1 text-xs text-slate-500">
          PDF or image. Uploaded to Supabase Storage when you save.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Training parts</h3>
        <Button type="button" variant="secondary" size="sm" onClick={addPart}>
          <Plus className="size-4" /> Add Part
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {parts.map((part, index) => (
          <div key={part.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_0.7fr_1fr_1fr_0.7fr_0.7fr_auto]">
            <select
              value={part.voiceType}
              onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, voiceType: event.target.value as VoiceType } : item)))}
              className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
            >
              {voiceTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
            <Input value={part.partNumber} placeholder="No." onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, partNumber: event.target.value } : item)))} />
            <Input value={part.displayName} placeholder="Display name" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, displayName: event.target.value } : item)))} />
            <Input value={part.audioFile} placeholder="Audio file" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, audioFile: event.target.value } : item)))} />
            <Input value={part.duration} placeholder="Duration" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, duration: event.target.value } : item)))} />
            <Input value={part.creditCost} placeholder="Credits" onChange={(event) => setParts((items) => items.map((item) => (item.id === part.id ? { ...item, creditCost: event.target.value } : item)))} />
            <button
              aria-label={`Remove part ${index + 1}`}
              className="flex size-11 items-center justify-center rounded-2xl text-rose-600 hover:bg-rose-50"
              onClick={() => setParts((items) => items.filter((item) => item.id !== part.id))}
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
          </div>                                                                                                                                           
        ))}
      </div>
    </section>
  );
}
