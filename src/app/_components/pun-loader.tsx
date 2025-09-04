"use client";

import { useAtom } from "jotai";

import { shouldShowPunLoader as shouldShowPunLoaderAtom } from "@/store/pun";

export function PunLoader() {
  const [shouldShowPunLoader] = useAtom(shouldShowPunLoaderAtom);

  if (!shouldShowPunLoader) return null;

  return (
    <div className="fixed flex justify-center items-center top-0 left-0 right-0 bottom-0 bg-[rgb(76,126,239,0.3)] text-[rgb(76,126,239)]">
      <div className="flex items-center justify-center w-60 h-60 sm:w-[300px] sm:h-[300px] bg-background">
        <i>말장난 말티즈</i>
        <pre className="whitespace-pre ml-4 text-xl">૮･ﻌ･ა</pre>
      </div>
    </div>
  );
}
