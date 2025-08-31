import { atom } from "jotai";
import type { Id } from "../../convex/_generated/dataModel";

export const animalId = atom<Id<"animals">>("" as Id<"animals">);
export const firstRow = atom("");
export const secondRow = atom("");
