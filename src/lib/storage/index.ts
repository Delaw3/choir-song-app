export type StorageProvider = {
  uploadFile(params: {
    path: string;
    file: File | Blob;
    contentType?: string;
  }): Promise<{ url: string; path: string }>;
  deleteFile(params: { path: string }): Promise<void>;
  getDownloadUrl(params: { path: string }): Promise<string>;
};

export type StorageKind = "supabase" | "firebase" | "none";

let provider: StorageProvider | null = null;
let enabled = false;
let kind: StorageKind = "none";

export function isStorageEnabled(): boolean {
  return enabled;
}

export function getStorageKind(): StorageKind {
  return kind;
}

export function setStorageProvider(
  p: StorageProvider,
  isEnabled: boolean,
  storageKind: StorageKind,
) {
  provider = p;
  enabled = isEnabled;
  kind = storageKind;
}

export function getStorage(): StorageProvider {
  if (!provider) {
    throw new Error(
      "Storage provider not initialized. Call setStorageProvider first (e.g. in layout).",
    );
  }
  return provider;
}