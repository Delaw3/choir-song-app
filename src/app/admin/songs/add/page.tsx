"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, X, ArrowLeft, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSongAction } from "./actions";
import { getCategories, type AdminCategoryView } from "../../categories/actions";
import type { SongCategory, SongSubCategory, VoiceType } from "@/types/song";

const voiceTypes: VoiceType[] = ["soprano", "alto", "tenor", "bass"];

type DraftPart = {
  id: string;
  voiceType: VoiceType;
  partNumber: string;
  displayName: string;
  audioFile: string;
  duration: string;
  creditCost: string;
};

export default function AddSongPage() {
  const [parts, setParts] = useState<DraftPart[]>([
    { id: "part-1", voiceType: "soprano", partNumber: "1", displayName: "Soprano 1", audioFile: "", duration: "", creditCost: "2" },
  ]);
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string | null>(null);
  const [sheetFileName, setSheetFileName] = useState<string | null>(null);
  const [partAudioFiles, setPartAudioFiles] = useState<Record<string, File>>({});
  const [partAudioPreviews, setPartAudioPreviews] = useState<Record<string, string>>({});
  const [partAudioNames, setPartAudioNames] = useState<Record<string, string>>({});
  const partAudioInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [category, setCategory] = useState<SongCategory>("");
  const [subCategory, setSubCategory] = useState<SongSubCategory | "All">("All");
  const [creditCost, setCreditCost] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

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

  const selectedCategoryObj =
    categoriesList.find(
      (c) => c.name.toLowerCase() === category.toLowerCase() || c.slug === category.toLowerCase(),
    ) ?? categoriesList[0];

  const currentSubCategories = selectedCategoryObj?.subCategories ?? [];
  const hasSubCategories = currentSubCategories.length > 0;

  const addPart = () => {
    setParts((items) => [
      ...items,
      { id: `part-${items.length + 1}`, voiceType: "alto", partNumber: "", displayName: "Alto", audioFile: "", duration: "", creditCost: "2" },
    ]);
  };

  const removePart = (id: string) => {
    const prevUrl = partAudioPreviews[id];
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    setParts((items) => items.filter((item) => item.id !== id));
    setPartAudioFiles((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    setPartAudioPreviews((prev) => { const { [id]: _, ...rest } = prev; return rest; });
    setPartAudioNames((prev) => { const { [id]: _, ...rest } = prev; return rest; });
  };

  const updatePart = (id: string, field: keyof DraftPart, value: string) => {
    setParts((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSheetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setSheetFile(file);
    setSheetFileName(file.name);
    const url = URL.createObjectURL(file);
    setSheetPreviewUrl(url);
  };

  const removeSheet = () => {
    if (sheetPreviewUrl) URL.revokeObjectURL(sheetPreviewUrl);
    setSheetFile(null);
    setSheetPreviewUrl(null);
    setSheetFileName(null);
  };

  const handlePartAudioChange = (partId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPartAudioFiles((prev) => ({ ...prev, [partId]: file }));
    const url = URL.createObjectURL(file);
    setPartAudioPreviews((prev) => ({ ...prev, [partId]: url }));
    setPartAudioNames((prev) => ({ ...prev, [partId]: file.name }));
  };

  const removePartAudio = (partId: string) => {
    const prevUrl = partAudioPreviews[partId];
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    setPartAudioFiles((prev) => { const { [partId]: _, ...rest } = prev; return rest; });
    setPartAudioPreviews((prev) => { const { [partId]: _, ...rest } = prev; return rest; });
    setPartAudioNames((prev) => { const { [partId]: _, ...rest } = prev; return rest; });
  };

  const handleSave = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("composer", composer.trim());
      formData.set("category", category);
      formData.set("subCategory", subCategory === "All" ? "" : subCategory);
      formData.set("creditCost", creditCost);
      formData.set("status", status);
      if (sheetFile) formData.set("sheetFile", sheetFile);

      parts.forEach((part, index) => {
        formData.set(`partVoice-${index}`, part.voiceType);
        formData.set(`partDisplay-${index}`, part.displayName);
        formData.set(`partNumber-${index}`, part.partNumber);
        formData.set(`partDuration-${index}`, part.duration);
        formData.set(`partCredit-${index}`, part.creditCost);
        const file = partAudioFiles[part.id];
        if (file) formData.set(`partAudio-${index}`, file);
      });

      await createSongAction(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setTitle("");
        setComposer("");
        setCategory("Christmas");
        setSubCategory("All");
        setCreditCost("");
        setStatus("draft");
        setParts([{ id: "part-1", voiceType: "soprano", partNumber: "1", displayName: "Soprano 1", audioFile: "", duration: "", creditCost: "2" }]);
        removeSheet();
      }, 1500);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save song.");
    } finally {
      setIsSaving(false);
    }
  }, [title, composer, category, subCategory, creditCost, status, parts, sheetFile, partAudioFiles, removeSheet]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2">
        <Link href="/admin/songs" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
          <ArrowLeft className="size-4" /> Back to Songs
        </Link>
      </nav>

      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-violet-700">Catalog</p>
        <h1 className="mt-0 text-3xl font-black tracking-tight text-slate-950">Add Song</h1>
      </header>

      {saveError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{saveError}</div>
      )}
      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
          Song saved successfully! It will appear in the songs list.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-5">Song details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Ave Verum Corpus" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Composer</label>
              <Input value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="e.g. W. A. Mozart" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as SongCategory);
                  setSubCategory("All");
                }}
                className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {hasSubCategories ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Sub-category</label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as SongSubCategory | "All")}
                  className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option value="All">Directly under {category} (No sub-category)</option>
                  {currentSubCategories.map((sub: string) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center text-xs text-slate-400 pt-7">
                <span>(No sub-categories — song added directly under {category})</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Credit cost</label>
              <Input type="number" value={creditCost} onChange={(e) => setCreditCost(e.target.value)} placeholder="e.g. 2" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Music sheet (PDF or image)</h2>
            <p className="text-xs text-slate-500">Uploaded to Firebase Storage when saved</p>
          </div>
          {sheetFile ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">{sheetFileName}</span>
                {sheetPreviewUrl && (sheetFile.type.startsWith("image/") ? (
                  <img src={sheetPreviewUrl} alt="Sheet preview" className="w-32 h-40 object-cover border border-slate-200 rounded-xl" />
                ) : (
                  <div className="w-32 h-40 flex items-center justify-center border border-slate-200 rounded-xl bg-slate-50">
                    <Upload className="size-6 text-slate-400" />
                  </div>
                ))}
                <button type="button" onClick={removeSheet} className="rounded-xl p-2 text-rose-600 hover:bg-rose-50" aria-label="Remove music sheet">
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">PDF or image file.</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-violet-300 transition">
              <label className="block cursor-pointer">
                <Upload className="mx-auto size-6 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Click to upload music sheet</p>
                <p className="text-xs text-slate-500">PDF, PNG, or JPG</p>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="sr-only" onChange={handleSheetChange} />
              </label>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Training parts</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addPart}>
              <Plus className="mr-2 size-4" /> Add Part
            </Button>
          </div>
          <div className="space-y-3">
            {parts.map((part) => (
              <div key={part.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 md:grid-cols-[1fr_0.7fr_1fr_1fr_0.7fr_0.7fr_auto]">
                <select
                  value={part.voiceType}
                  onChange={(e) => updatePart(part.id, "voiceType", e.target.value as VoiceType)}
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                >
                  {voiceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Input value={part.partNumber} placeholder="No." onChange={(e) => updatePart(part.id, "partNumber", e.target.value)} />
                <Input value={part.displayName} placeholder="Display name" onChange={(e) => updatePart(part.id, "displayName", e.target.value)} required />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => partAudioInputRefs.current[part.id]?.click()}
                    className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-violet-300 transition outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <Upload className="mr-1 size-3 text-slate-400" />
                    Upload audio
                  </button>
                  <input
                    ref={el => { if (el) partAudioInputRefs.current[part.id] = el; }}
                    id={`part-audio-${part.id}`}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handlePartAudioChange(part.id, e)}
                  />
                  {partAudioNames[part.id] && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 truncate" title={partAudioNames[part.id]}>
                        {partAudioNames[part.id]}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePartAudio(part.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <Input type="number" value={part.duration} placeholder="Duration (sec)" onChange={(e) => updatePart(part.id, "duration", e.target.value)} />
                <Input type="number" value={part.creditCost} placeholder="Credits" onChange={(e) => updatePart(part.id, "creditCost", e.target.value)} required />
                <button
                  type="button"
                  aria-label="Remove part"
                  className="flex size-11 items-center justify-center rounded-2xl text-rose-600 hover:bg-rose-50"
                  onClick={() => removePart(part.id)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => { setTitle(""); setComposer(""); setCategory("Christmas"); setSubCategory("All"); setCreditCost(""); setStatus("draft"); setParts([{ id: "part-1", voiceType: "soprano", partNumber: "1", displayName: "Soprano 1", audioFile: "", duration: "", creditCost: "2" }]); removeSheet(); setPartAudioFiles({}); setPartAudioPreviews({}); setPartAudioNames({}); }}>
            Reset
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Save className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />} Save Song
          </Button>
        </div>
      </form>
    </div>
  );
}