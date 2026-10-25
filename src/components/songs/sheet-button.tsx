"use client";

import { Eye, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { SheetViewer } from "@/components/songs/sheet-viewer";

type SheetButtonProps = {
  url: string;
};

export function SheetButton({ url }: SheetButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton label="View music sheet" onClick={() => setOpen(true)} className="ml-auto">
        <Eye className="size-5" />
      </IconButton>
      <SheetViewer url={url} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
