import { createClient } from "@supabase/supabase-js";
import type { StorageProvider } from "@/lib/storage";

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "song-assets";

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (supabase) return supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

/** Supabase Storage implementation of the StorageProvider interface. */
export function createSupabaseStorage(): StorageProvider {
  return {
    async uploadFile({ path, file, contentType }) {
      const client = getSupabase();
      const { error } = await client.storage
        .from(bucketName)
        .upload(path, file, {
          contentType,
          upsert: true,
        });
      if (error) throw error;

      const { data } = client.storage.from(bucketName).getPublicUrl(path);
      return { url: data.publicUrl, path };
    },
    async deleteFile({ path }) {
      const client = getSupabase();
      const { error } = await client.storage.from(bucketName).remove([path]);
      if (error) throw error;
    },
    async getDownloadUrl({ path }) {
      const client = getSupabase();
      const { data } = client.storage.from(bucketName).getPublicUrl(path);
      return data.publicUrl;
    },
  };
}