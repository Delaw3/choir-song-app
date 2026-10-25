"use server";

import "server-only";

import { requireAdmin } from "@/lib/auth/require";
import { createSong, updateSongSheetUrl } from "@/lib/mongodb/repos/songs.repo";
import { getMongoDb } from "@/lib/mongodb";
import { isStorageEnabled, getStorage } from "@/lib/storage";

export async function createSongAction(formData: FormData) {
  const title = formData.get("title") as string;
  const composer = (formData.get("composer") as string) || undefined;
  const category = (formData.get("category") as string) || "Christmas";
  const subCategory = (formData.get("subCategory") as string) || undefined;
  const creditCost = Number(formData.get("creditCost")) || 0;
  const status = (formData.get("status") as "draft" | "published") || "draft";
  const sheetFile = formData.get("sheetFile") as File | null;

  await requireAdmin();

  const slug = title.trim().toLowerCase().replace(/\s+/g, "-");

  const storageEnabled = isStorageEnabled();
  let songId = `mock-${Date.now()}`;

  if (storageEnabled) {
    const { id: createdId } = await createSong({
      title: title.trim(),
      slug,
      categoryId: category.toLowerCase(),
      composer,
      creditCost,
      status,
      subCategory:
        subCategory && subCategory !== "All" && subCategory.trim()
          ? subCategory.trim()
          : undefined,
    });
    songId = createdId;
  }

  // Sheet music upload (Supabase Storage)
  if (sheetFile && storageEnabled) {
    const { url } = await getStorage().uploadFile({
      path: `songs/${songId}/sheet`,
      file: sheetFile,
      contentType: sheetFile.type,
    });
    await updateSongSheetUrl(songId, url);
  }

  // Part audio uploads
  const partAudioUrls: Record<string, string> = {};
  if (storageEnabled) {
    // Collect all part audio files from FormData
    const partKeys: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("partAudio-")) {
        partKeys.push(key);
      }
    }

    await Promise.all(
      partKeys.map(async (key) => {
        const partId = key.replace("partAudio-", "");
        const file = formData.get(key) as File | null;
        if (!file) return;
        const { url } = await getStorage().uploadFile({
          path: `songs/${songId}/parts/${partId}/audio`,
          file,
          contentType: file.type,
        });
        partAudioUrls[partId] = url;
      }),
    );
  }

  // Save parts to MongoDB
  if (storageEnabled) {
    const db = getMongoDb();
    const now = new Date();

    const partIndices: string[] = [];
    for (const key of formData.keys()) {
      if (key.startsWith("partVoice-")) {
        partIndices.push(key.replace("partVoice-", ""));
      }
    }

    await Promise.all(
      partIndices.map(async (index) => {
        const voiceType = (formData.get(`partVoice-${index}`) as string) || "soprano";
        const displayName = (formData.get(`partDisplay-${index}`) as string) || `Part ${index}`;
        const partNumberStr = formData.get(`partNumber-${index}`) as string;
        const durationStr = formData.get(`partDuration-${index}`) as string;
        const creditCostStr = formData.get(`partCredit-${index}`) as string;

        const partNumber = partNumberStr ? Number(partNumberStr) : undefined;
        const audioUrl = partAudioUrls[index] || undefined;
        const duration = durationStr ? Number(durationStr) : undefined;
        const creditCostVal = creditCostStr ? Number(creditCostStr) : 0;

        await db.collection("songParts").insertOne({
          songId,
          name: displayName.trim(),
          voiceGroup: voiceType as "soprano" | "alto" | "tenor" | "bass",
          subPart: partNumber,
          audioUrl,
          durationSeconds: duration,
          creditCost: creditCostVal,
          status: "published",
          sortOrder: Number(index) || 0,
          createdAt: now,
          updatedAt: now,
        });
      }),
    );
  }

  return { songId };
}
