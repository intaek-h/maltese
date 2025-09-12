"use client";

import { ConvexError } from "convex/values";
import { useAtom } from "jotai";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import NewPunForm from "@/app/_components/new-pun-form";
import NewPunSavingDialog from "@/app/_components/new-pun-saving-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LegoButton from "@/components/ui/lego-button";
import { createPunServerAction } from "@/lib/server-actions/pun/actions";
import { animalId, firstRow, secondRow } from "@/store/pun";
import type { Id } from "../../../convex/_generated/dataModel";

export default function NewPunFormDialog({
  isOpen,
  setIsOpen,
  onSubmit,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSubmit: () => void;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  const [row1, setRow1] = useAtom(firstRow);
  const [row2, setRow2] = useAtom(secondRow);
  const [animal, setAnimal] = useAtom(animalId);

  const [isPageTransitionPending, startTransition] = useTransition();

  const [isSaving, setIsSaving] = useState(false);

  const submitPun = useDebouncedCallback(async () => {
    try {
      setIsSaving(true);

      const response = await createPunServerAction({
        firstRow: row1,
        secondRow: row2,
        animalId: animal,
      });

      await new Promise<void>((r) => setTimeout(() => r(), 2000));

      if (response.success) {
        startTransition(() => {
          onSubmit();
          setRow1("");
          setRow2("");
          setAnimal("" as Id<"animals">);
          router.push(`/?key=${response.data.publicKey}`);
        });
        return;
      }

      throw undefined;
    } catch (error) {
      if (error instanceof ConvexError) {
        alert(error.data);
        return;
      }
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="h-screen rounded-none border-0 bg-transparent p-0 data-[state=open]:animate-none sm:w-screen sm:max-w-none"
        showCloseButton={false}
      >
        <div className="flex h-full w-full max-w-[calc(100vw-2rem)] flex-col">
          <DialogHeader className="items-center py-16">
            <DialogTitle className="text-secondary text-3xl font-bold">
              두 줄로 말장난을 만들어요
            </DialogTitle>
            <DialogDescription className="text-secondary text-base">
              <span className="">한 줄만 써도 괜찮아요</span>
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-[50vh] overflow-hidden">
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              {/* TODO */}
              {/* <div className="flex flex-col items-center">
                <Drawer>
                  <DrawerTrigger>
                    <p className="text-secondary text-lg font-semibold underline underline-offset-4">
                      예시를 보고싶어요!
                    </p>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                      <DrawerDescription>
                        This action cannot be undone.
                      </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                      <Button>Submit</Button>
                      <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div> */}
              <NewPunForm />
            </div>
          </div>

          <div className="flex flex-1 justify-center bg-transparent">
            <div className="m-auto flex h-fit gap-4">
              <LegoButton variant="secondary" onClick={() => setIsOpen(false)}>
                <ArrowLeftIcon className="mr-2" />
                뒤로
              </LegoButton>
              <LegoButton
                onClick={submitPun}
                loading={isSaving}
                disabled={row1.length === 0 && row2.length === 0}
              >
                저장하기
              </LegoButton>
            </div>
          </div>

          <NewPunSavingDialog isOpen={isSaving || isPageTransitionPending} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
