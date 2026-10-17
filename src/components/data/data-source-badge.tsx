import { useFirestoreMode } from "@/hooks/use-firestore-songs";
import type { SongsSource } from "@/hooks/use-firestore-songs";

/** Small explicit badge showing which data source backs the catalog UI. */
export function DataSourceBadge({ source, error }: { source: SongsSource; error?: string | null }) {
  const mode = useFirestoreMode();
  const label =
    source === "firestore"
      ? "Live · Firestore"
      : source === "firestore-error"
        ? "Fallback · Mock data"
        : mode
          ? "Connecting · Firestore"
          : "Dev · Mock data";
  const tone =
    source === "firestore"
      ? "bg-emerald-100 text-emerald-800"
      : source === "firestore-error"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-600";
  return (
    <p className="flex flex-col gap-1">
      <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${tone}`}>
        {label}
      </span>
      {error ? <span className="text-xs font-semibold text-amber-700">{error}</span> : null}
    </p>
  );
}
