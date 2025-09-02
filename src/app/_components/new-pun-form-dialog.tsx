"use client";

import { ConvexError } from "convex/values";
import { useAtom } from "jotai";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NewPunForm from "@/app/_components/new-pun-form";
import NewPunSavingDialog from "@/app/_components/new-pun-saving-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import LegoButton from "@/components/ui/lego-button";
import { createPunServerAction } from "@/lib/server-actions/pun/actions";
import { animalId, firstRow, secondRow } from "@/store/pun";

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

  const [row1] = useAtom(firstRow);
  const [row2] = useAtom(secondRow);
  const [animal] = useAtom(animalId);

  const [isSaving, setIsSaving] = useState(false);

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
              <div className="flex flex-col items-center">
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
              </div>
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
                onClick={async () => {
                  try {
                    setIsSaving(true);

                    await new Promise<void>((r) => setTimeout(() => r(), 2000));

                    // const response = await createPunServerAction({
                    //   firstRow: row1,
                    //   secondRow: row2,
                    //   animalId: animal,
                    // });

                    // if (response.success) {
                    // }

                    onSubmit();

                    router.push("/?key=990");
                  } catch (error) {
                    if (error instanceof ConvexError) {
                      alert(error.data);
                      return;
                    }
                    alert("저장 중 오류가 발생했습니다.");
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                저장하기
              </LegoButton>
            </div>
          </div>

          <NewPunSavingDialog isOpen={isSaving} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
