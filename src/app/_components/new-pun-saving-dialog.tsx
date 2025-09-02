"use client";

import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { useCallback } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export default function NewPunSavingDialog({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children?: React.ReactNode;
}) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: i know
  const rand = useCallback(
    () => randomIntFromInterval({ min: 1, max: 5 }),
    [isOpen],
  );

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="h-screen rounded-none border-0 bg-transparent p-0 data-[state=open]:animate-none sm:w-screen sm:max-w-none"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>로딩 화면입니다.</DialogTitle>
          <DialogDescription>기다려주세요...</DialogDescription>
        </VisuallyHidden>
        <div className="w-full h-full flex items-center justify-center">
          <div>
            <p className="font-serif text-4xl italic">저 장 중 . . .</p>

            <Image
              src={`/stickers/${rand()}.webp`}
              width={300}
              height={300}
              alt=""
              className="block"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// min and max included
function randomIntFromInterval({ min, max }: { min: number; max: number }) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
