"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SheetViewerProps = {
  url: string;
  open: boolean;
  onClose: () => void;
};

export function SheetViewer({ url, open, onClose }: SheetViewerProps) {
  if (!open) return null;
  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Music sheet"
    >
      <button
        type="button"
        aria-label="Close sheet music"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />
      <div className="relative w-full h-full max-w-[92vw] max-h-[92vh] rounded-[2rem] bg-white shadow-2xl p-4 sm:p-6 sm:rounded-[3rem] animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          aria-label="Close sheet music"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-xl p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-100"
        >
          <X className="size-5" />
        </button>
        <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden outline outline-1 outline-slate-200">
          {isPdf ? (
            <div className="w-full h-full">
              <embed
                src={url}
                type="application/pdf"
                className="w-full h-full object-contain"
                title="Music sheet"
              />
            </div>
          ) : (
            <img src={url} alt="Music sheet" className="max-w-full max-h-[75vh] object-contain" />
          )}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-violet-700 hover:underline"
          >
            Open in new tab
          </a>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
