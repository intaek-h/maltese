"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { useAtom } from "jotai";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import NewPunAnimalDialog from "@/app/_components/new-pun-animal-dialog";
import LegoButton from "@/components/ui/lego-button";
import { nextPage, prevPage } from "@/lib/server-actions/pun/actions";
import { shouldShowPunLoader as shouldShowPunLoaderAtom } from "@/store/pun";
import type { api } from "../../../convex/_generated/api";
import NewPunFormDialog from "./new-pun-form-dialog";

export default function NewPunContainer(props: {
  puns: Preloaded<typeof api.puns.getRandomizedPuns>;
  animals: Preloaded<typeof api.animals.getAllAnimals>;
}) {
  const puns = usePreloadedQuery(props.puns);
  const animals = usePreloadedQuery(props.animals);

  animals.sort((a, b) => {
    if (a.name === "구운 말티즈") return -1;
    if (b.name === "구운 말티즈") return 1;
    return 0;
  });

  const [isPending, startTransition] = useTransition();

  const [_, setShouldShowPunLoader] = useAtom(shouldShowPunLoaderAtom);

  const [openedDialog, setOpenedDialog] = useState<"" | "animal" | "form">("");

  useEffect(() => {
    if (isPending) {
      setShouldShowPunLoader(true);
    } else {
      setShouldShowPunLoader(false);
    }
  }, [isPending, setShouldShowPunLoader]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-4 transition-opacity hover:!opacity-100 duration-300 animate-[fade-to-opacity_3s_ease-in-out_3s_forwards]">
      <LegoButton
        className="w-full sm:w-auto order-2 sm:order-none"
        variant="secondary"
        onClick={() =>
          startTransition(async () => {
            await prevPage({
              hasPrevPage: puns.hasPrevPage,
              lastOffset: puns.totalPages * 3 - 3,
            });
          })
        }
      >
        <ChevronLeftIcon />
      </LegoButton>

      <NewPunAnimalDialog
        animals={animals}
        isOpen={openedDialog === "animal"}
        setIsOpen={(isOpen) => {
          if (isOpen) setOpenedDialog("animal");
          else setOpenedDialog("");
        }}
        openForm={() => setOpenedDialog("form")}
      >
        <LegoButton
          className="w-full col-span-2 order-1 sm:order-none"
          style={{ opacity: openedDialog !== "" ? 0 : 1 }}
        >
          나도 말장난 하기
        </LegoButton>
      </NewPunAnimalDialog>

      <NewPunFormDialog
        isOpen={openedDialog === "form"}
        setIsOpen={(isOpen) => {
          if (isOpen) setOpenedDialog("form");
          else setOpenedDialog("animal");
        }}
        onSubmit={() => {
          setOpenedDialog("");
        }}
      />

      <LegoButton
        className="w-full sm:w-auto order-3 sm:order-none"
        variant="secondary"
        onClick={() => {
          startTransition(async () => {
            await nextPage({ hasNextPage: puns.hasNextPage });
          });
        }}
      >
        <ChevronRightIcon />
      </LegoButton>
    </div>
  );
}
