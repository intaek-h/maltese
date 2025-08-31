import type Rand from "rand-seed";

// Fisher-Yates shuffle
export function shuffle<T>(array: T[], rand: Rand): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand.next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
