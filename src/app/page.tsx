import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { Menu } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { UUIDv4 } from "uuid-v4-validator";
import Canvas from "@/app/_components/canvas";
import NewPunContainer from "@/app/_components/new-pun-container";
import LegoButton from "@/components/ui/lego-button";
import { DEFAULT_ANIMALS_IN_CANVAS } from "@/constants/configs";
import { COOKIES } from "@/constants/cookies";
import { formatPun } from "@/lib/pun-utils";
import { api } from "../../convex/_generated/api";
import { CanvasBackground } from "./_components/canvas-background";
import { PunLoader } from "./_components/pun-loader";
import { SiteMenuSheet } from "./_components/site-menu-sheet";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const punPublicKey = ((await searchParams).key || "") as string;

  if (!punPublicKey) {
    return {
      title: "말장난 말티즈",
      description: "말난장 말치즈",
    };
  }

  let highlightedPun: FunctionReturnType<
    typeof api.puns.getPunByPubKey
  > | null = null;

  const isUUID = UUIDv4.validate(punPublicKey);

  if (!isUUID) {
    return {
      title: "말장난 말티즈",
      description: "말난장 말치즈",
    };
  }

  highlightedPun = await fetchQuery(api.puns.getPunByPubKey, {
    publicKey: punPublicKey,
  });

  return {
    title: `말장난 말티즈 - ${formatPun(highlightedPun?.firstRow, highlightedPun?.secondRow)}`,
    description: "말난장 말치즈",
  };
}

export default async function Home({ searchParams }: Props) {
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
    const isUUID = UUIDv4.validate(punPublicKey);
    if (isUUID) {
      highlightedPun = await fetchQuery(api.puns.getPunByPubKey, {
        publicKey: punPublicKey,
      });
    }
  }

  return (
    <CanvasBackground highlightedPun={highlightedPun}>
      <Canvas
        puns={paginatedPuns}
        animals={animalImages}
        highlightedPun={highlightedPun}
      />

      {/* show on mobile */}
      <div className="absolute sm:hidden block sm:bottom-24 bottom-12 left-6 transition-opacity hover:!opacity-100 duration-300 animate-[fade-to-opacity_3s_ease-in-out_3s_forwards]">
        <SiteMenuSheet>
          <LegoButton variant="orange" shape="default">
            <Menu />
          </LegoButton>
        </SiteMenuSheet>
      </div>

      <div className="absolute sm:bottom-24 bottom-12 left-1/2 -translate-x-1/2 transition-opacity hover:!opacity-100 duration-300 animate-[fade-to-opacity_3s_ease-in-out_3s_forwards]">
        <NewPunContainer puns={paginatedPuns} animals={animalImages} />

        <div className="absolute -left-[100px] top-0 hidden sm:block bottom-0">
          <SiteMenuSheet>
            <LegoButton variant="orange" shape="default" className="h-full">
              <Menu />
            </LegoButton>
          </SiteMenuSheet>
        </div>
      </div>

      <PunLoader />
    </CanvasBackground>
  );
}
