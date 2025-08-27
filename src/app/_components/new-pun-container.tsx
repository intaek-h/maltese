"use client";

import { useState } from "react";
import NewPunAnimalDialog from "@/app/_components/new-pun-animal-dialog";
import LegoButton from "@/components/ui/lego-button";
import NewPunFormDialog from "./new-pun-form-dialog";

export default function NewPunContainer() {
  const [openedDialog, setOpenedDialog] = useState<"" | "animal" | "form">("");

  return (
    <div>
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
