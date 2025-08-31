"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import NewPunAnimalDialog from "@/app/_components/new-pun-animal-dialog";
import LegoButton from "@/components/ui/lego-button";
import { nextPage, prevPage } from "@/lib/server-actions/pun/actions";
import type { api } from "../../../convex/_generated/api";
import NewPunFormDialog from "./new-pun-form-dialog";

export default function NewPunContainer(props: {
  puns: Preloaded<typeof api.puns.getRandomizedPuns>;
  animals: Preloaded<typeof api.animals.getAllAnimals>;
}) {
  const puns = usePreloadedQuery(props.puns);
  const animals = usePreloadedQuery(props.animals);

  const [openedDialog, setOpenedDialog] = useState<"" | "animal" | "form">("");

  return (
    <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-4">
      <LegoButton
        className="w-full sm:w-auto order-2 sm:order-none"
        variant="secondary"
        onClick={() =>
          prevPage({
            hasPrevPage: puns.hasPrevPage,
            lastOffset: puns.totalPages * 3 - 3,
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
      />

      <LegoButton
        className="w-full sm:w-auto order-3 sm:order-none"
        variant="secondary"
        onClick={() => nextPage({ hasNextPage: puns.hasNextPage })}
      >
        <ChevronRightIcon />
      </LegoButton>
    </div>
  );
}
