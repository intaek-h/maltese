import { preloadQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import Canvas from "@/app/_components/canvas";
import NewPunContainer from "@/app/_components/new-pun-container";
import { DEFAULT_ANIMALS_IN_CANVAS } from "@/constants/configs";
import { COOKIES } from "@/constants/cookies";
import { api } from "../../convex/_generated/api";

export default async function Home() {
  const cookie = await cookies();
  const seed = cookie.get(COOKIES.authorKey)?.value || "";
  const offset = cookie.get(COOKIES.offset)?.value || "";

  const animalImages = await preloadQuery(api.animals.getAllAnimals);
  const paginatedPuns = await preloadQuery(api.puns.getRandomizedPuns, {
    seed,
    offset: Number(offset),
    numItems: DEFAULT_ANIMALS_IN_CANVAS,
  });

  return (
    <div className="relative h-screen w-screen">
      <Canvas puns={paginatedPuns} animals={animalImages} />

      <div className="absolute sm:bottom-24 bottom-12 left-1/2 -translate-x-1/2">
        <NewPunContainer puns={paginatedPuns} animals={animalImages} />
      </div>
    </div>
  );
}
