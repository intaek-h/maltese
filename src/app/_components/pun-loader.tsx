"use client";

import { useAtom } from "jotai";
import { shouldShowPunLoader as shouldShowPunLoaderAtom } from "@/store/pun";

export function PunLoader() {
  const [shouldShowPunLoader] = useAtom(shouldShowPunLoaderAtom);

  if (!shouldShowPunLoader) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-amber-300"></div>
  );
}
