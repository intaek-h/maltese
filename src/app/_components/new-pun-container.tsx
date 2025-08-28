"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import NewPunAnimalDialog from "@/app/_components/new-pun-animal-dialog";
import LegoButton from "@/components/ui/lego-button";
import { api } from "../../../convex/_generated/api";
import NewPunFormDialog from "./new-pun-form-dialog";

export default function NewPunContainer() {
  useQuery(api.puns.getAllPuns);
  useQuery(api.animals.getAllAnimals);

  // const updatePun = useMutation(api.puns.updatePun);

  const [openedDialog, setOpenedDialog] = useState<"" | "animal" | "form">("");

  return (
    <div>
      {/* <LegoButton onClick={() => updatePun()}>변경</LegoButton> */}

      <NewPunAnimalDialog
        isOpen={openedDialog === "animal"}
        setIsOpen={(isOpen) => {
          if (isOpen) setOpenedDialog("animal");
          else setOpenedDialog("");
        }}
        openForm={() => setOpenedDialog("form")}
      >
        <LegoButton style={{ opacity: openedDialog !== "" ? 0 : 1 }}>
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
    </div>
  );
}
