"use client";

import { useAtom } from "jotai";

import { shouldShowPunLoader as shouldShowPunLoaderAtom } from "@/store/pun";

const art_3 = [
  "         /^-^\\",
  "        / o o \\",
  "       /   Y   \\",
  "       V \\ v / V",
  "         / - \\",
  "        /    |",
  "  (    /     |",
  "   ===/___) ||",
].join("\n");

export function PunLoader() {
  const [shouldShowPunLoader] = useAtom(shouldShowPunLoaderAtom);

  if (!shouldShowPunLoader) return null;

  return (
    <div className="fixed flex justify-center items-center top-0 left-0 right-0 bottom-0 bg-accent-foreground text-amber-400">
      <i className="">말장난 말티즈</i>
      <pre className="whitespace-pre ">{art_3}</pre>
    </div>
  );
}
