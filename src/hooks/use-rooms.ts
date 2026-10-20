"use client";

import { useCallback, useState } from "react";

/** Local refresh trigger for the in-memory mock rooms store. */
export function useRoomsVersion(): [number, () => void] {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  return [version, bump];
}
