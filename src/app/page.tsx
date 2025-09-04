import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { cookies } from "next/headers";
import Canvas from "@/app/_components/canvas";
import NewPunContainer from "@/app/_components/new-pun-container";
import { DEFAULT_ANIMALS_IN_CANVAS } from "@/constants/configs";
import { COOKIES } from "@/constants/cookies";
import { api } from "../../convex/_generated/api";
import { CanvasBackground } from "./_components/canvas-background";
import { PunLoader } from "./_components/pun-loader";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const punPublicKey = ((await searchParams).key || "") as string;

  const cookie = await cookies();
  const seed = cookie.get(COOKIES.authorKey)?.value || "";
  const offset = cookie.get(COOKIES.offset)?.value || "";

  const animalImages = await preloadQuery(api.animals.getAllAnimals);
  const paginatedPuns = await preloadQuery(api.puns.getRandomizedPuns, {
    seed,
    offset: Number(offset),
    numItems: DEFAULT_ANIMALS_IN_CANVAS,
  });

  let highlightedPun: FunctionReturnType<
    typeof api.puns.getPunByPubKey
  > | null = null;

  if (punPublicKey) {
    highlightedPun = await fetchQuery(api.puns.getPunByPubKey, {
      publicKey: punPublicKey,
    });
  }

  return (
    <CanvasBackground highlightedPun={highlightedPun}>
      <Canvas
        puns={paginatedPuns}
        animals={animalImages}
        highlightedPun={highlightedPun}
      />

      <div className="absolute sm:bottom-24 bottom-12 left-1/2 -translate-x-1/2">
        <NewPunContainer puns={paginatedPuns} animals={animalImages} />
      </div>

      <PunLoader />
    </CanvasBackground>
  );
}
