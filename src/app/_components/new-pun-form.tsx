"use client";

import { useAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import { PUN_MAX_LENGTH } from "@/constants/configs";
import { cn } from "@/lib/utils";
import { firstRow, secondRow } from "@/store/pun";

export default function NewPunForm() {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  const [firstInputValue, setFirstInputValue] = useAtom(firstRow);
  const [secondInputValue, setSecondInputValue] = useAtom(secondRow);

  const shouldShowMaxLengthWarning = useMemo(() => {
    if (firstInputValue.length > PUN_MAX_LENGTH) return true;
    if (secondInputValue.length > PUN_MAX_LENGTH) return true;
    return false;
  }, [firstInputValue, secondInputValue]);

  useEffect(() => {
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, []);

  return (
    <>
      <div className="border-primary flex w-[90vw] flex-col rounded-lg border-2 shadow-[4px_4px_0_0_#000] sm:w-[50vw] [&_input]:focus-visible:outline-none">
        <input
          ref={firstInputRef}
          maxLength={PUN_MAX_LENGTH}
          type="text"
          className={cn(
            "text-card-foreground bg-secondary rounded-t-md px-2 py-1 text-3xl font-bold transition-[font-size] duration-300 focus-within:text-5xl",
            firstInputValue.length > PUN_MAX_LENGTH && "text-destructive",
          )}
          placeholder="첫 번째 행"
          value={firstInputValue}
          onChange={(e) => setFirstInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              secondInputRef.current?.focus();
            }
          }}
        />
        <hr className="border-primary border-t-2" />
        <input
          ref={secondInputRef}
          type="text"
          maxLength={PUN_MAX_LENGTH}
          className={cn(
            "text-card-foreground bg-secondary rounded-b-md px-2 py-1 text-3xl font-bold transition-[font-size] duration-300 focus-within:text-5xl",
            secondInputValue.length > PUN_MAX_LENGTH && "text-destructive",
          )}
          placeholder="두 번째 행"
          value={secondInputValue}
          onChange={(e) => setSecondInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              firstInputRef.current?.focus();
            }
          }}
        />
      </div>

      <div
        className={cn(
          shouldShowMaxLengthWarning ? "visible" : "invisible",
          "bg-destructive mx-auto w-fit rounded-full px-3 py-1",
        )}
      >
        <p className="text-shadow-lego text-center text-background text-base font-semibold">
          한 행 당 열다섯자 제한입니다
        </p>
      </div>
    </>
  );
}
