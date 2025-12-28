"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Download, Link, Share } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "react-use";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LegoButton from "@/components/ui/lego-button";
import { customToast } from "@/components/ui/lego-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LS } from "@/constants/local-storage";
import {
  computeNotePlacement,
  defaultNoteStyle,
  drawScene,
  measureLikeBarUsedHeight,
  measureStatusBadgeUsedHeight,
} from "@/lib/canvas/draw";
import type { MovingAnimal } from "@/lib/canvas/types";
import { copyTextToClipboard } from "@/lib/clipboard-utils";
import { formatPun } from "@/lib/pun-utils";
import { likePunServerAction } from "@/lib/server-actions/likes/actions";

export default function PunDetailDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moving: MovingAnimal | null;
  zoom?: number;
}) {
  const { open, onOpenChange, moving, zoom: zoomProp } = props;

  const [likeDisabled, setLikeDisabled] = useLocalStorage<string[]>(
    LS.likeDisabledPunPublicKeys,
    [],
  );

  const [shouldShowBoomUpTooltip, setShouldShowBoomUpTooltip] =
    useLocalStorage<boolean>(LS.shouldShowBoomUpTooltip, true);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isOpeningShareApi, setIsOpeningShareApi] = useState(false);

  const computeScaledClone = useCallback(
    (
      current: MovingAnimal,
      canvasWidth: number,
      canvasHeight: number,
      zoom: number,
    ): MovingAnimal => {
      const padding = 12; // keep a small margin
      const availableW = Math.max(1, canvasWidth - padding * 2);
      const availableH = Math.max(1, canvasHeight - padding * 2);
      const baseScale = Math.min(
        availableW / current.width,
        availableH / current.height,
      );
      const finalScale = Math.max(0.1, Math.min(baseScale * zoom, 4));

      const scaledWidth = Math.max(1, Math.round(current.width * finalScale));
      const scaledHeight = Math.max(1, Math.round(current.height * finalScale));
      const x = Math.round((canvasWidth - scaledWidth) / 2);
      const y = Math.round((canvasHeight - scaledHeight) / 2);

      return {
        ...current,
        width: scaledWidth,
        height: scaledHeight,
        x,
        y,
      };
    },
    [],
  );

  useEffect(() => {
    if (!open || !moving) return;
    function drawOnce(current: MovingAnimal) {
      const c = previewCanvasRef.current;
      if (!c) return;
      const context = c.getContext("2d");
      if (!context) return;

      // Fixed CSS layout size (logical pixels)
      const cssWidth = 300;
      const cssHeight = 300;
      c.style.width = `${cssWidth}px`;
      c.style.height = `${cssHeight}px`;

      // Backing store size (device pixels) for crisp rendering
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      c.width = Math.max(1, Math.round(cssWidth * dpr));
      c.height = Math.max(1, Math.round(cssHeight * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";

      // Increase size via zoom while keeping it within bounds
      const zoom = typeof zoomProp === "number" ? zoomProp : 0.8;
      let clone = computeScaledClone(current, cssWidth, cssHeight, zoom);

      // Measure note to center the union (note above + sprite + like bar below)
      const unionPaddingY = 14; // vertical safety margin to avoid shadow cropping
      let centeredX = Math.round((cssWidth - clone.width) / 2);
      let tempForMeasure: MovingAnimal = { ...clone, x: centeredX, y: 0 };
      let placement = computeNotePlacement(
        context,
        c,
        tempForMeasure,
        defaultNoteStyle,
      );
      const extraAboveBase =
        defaultNoteStyle.gap + defaultNoteStyle.arrowSize + placement.boxHeight;
      const likeBarBelowHeight = measureLikeBarUsedHeight(clone);
      const statusBadgeBelowHeight = clone.isHighlighted
        ? measureStatusBadgeUsedHeight(clone)
        : 0;
      let unionHeight =
        extraAboveBase +
        clone.height +
        likeBarBelowHeight +
        statusBadgeBelowHeight;

      // If the union exceeds available height minus padding, reduce scale proportionally
      const maxUnionHeight = cssHeight - unionPaddingY * 2;
      if (unionHeight > maxUnionHeight) {
        const reduce = Math.max(0.1, Math.min(1, maxUnionHeight / unionHeight));
        const reducedW = Math.max(1, Math.round(clone.width * reduce));
        const reducedH = Math.max(1, Math.round(clone.height * reduce));
        clone = { ...clone, width: reducedW, height: reducedH };
        centeredX = Math.round((cssWidth - clone.width) / 2);
        tempForMeasure = { ...clone, x: centeredX, y: 0 };
        placement = computeNotePlacement(
          context,
          c,
          tempForMeasure,
          defaultNoteStyle,
        );
        unionHeight =
          extraAboveBase +
          clone.height +
          likeBarBelowHeight +
          (clone.isHighlighted ? measureStatusBadgeUsedHeight(clone) : 0);
      }

      // Final center with vertical padding applied
      const centeredY =
        unionPaddingY +
        Math.round(
          (cssHeight - unionPaddingY * 2 - unionHeight) / 2 + extraAboveBase,
        );
      const finalClone: MovingAnimal = { ...clone, x: centeredX, y: centeredY };

      drawScene(context, c, [finalClone]);
    }

    // Draw once after mount
    rafRef.current = requestAnimationFrame(() => drawOnce(moving));
    // Redraw when the image finishes loading (if not already loaded)
    if (!moving.isImageLoaded) {
      const handler = () => drawOnce(moving);
      moving.imageElement.addEventListener("load", handler, { once: true });
      return () => moving.imageElement.removeEventListener("load", handler);
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [open, moving, computeScaledClone, zoomProp]);

  const [isLikePunPending, setIsLikePunPending] = useState(false);
  const likePunDebounced = useDebouncedCallback(async (pubKey?: string) => {
    try {
      if (!pubKey) return;

      const res = await likePunServerAction({
        punPublicKey: pubKey,
      });

      customToast(
        {
          title: res.message,
        },
        { duration: 2000 },
      );

      const arr = likeDisabled || [];
      setLikeDisabled([...arr, pubKey]);
    } catch (error) {
      console.error(error);
      customToast(
        {
          title: "오류가 발생했습니다.",
        },
        { duration: 2000 },
      );
    } finally {
      setIsLikePunPending(false);
    }
  }, 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[380px] h-[560px] border-[#0000001a] shadow-2xl gap-4 rounded-[12px] p-8"
        style={{
          backgroundImage: "url('/backgrounds/2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "drop-shadow(2px 4px 6px #00000050)",
        }}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>
              {moving?.input1 || ""} {moving?.input2 || ""}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <div className="flex flex-col gap-9">
          <div className="flex justify-between items-center">
            <div>
              <Button
                size="sm"
                variant="inline"
                className="text-background! hidden! sm:inline-flex!"
                onClick={async () => {
                  copyTextToClipboard(
                    `${process.env.NEXT_PUBLIC_URL || ""}?key=${moving?.publicKey}`,
                  );
                  alert("링크를 복사했습니다.");
                }}
              >
                공유하기
                <Link className="size-3" />
              </Button>

              <Button
                variant="inline"
                className="text-background! inline-flex! sm:hidden!"
                loading={isOpeningShareApi}
                onClick={async () => {
                  try {
                    setIsOpeningShareApi(true);
                    await window.navigator.share({
                      title: `말장난 말티즈 - ${formatPun(moving?.input1, moving?.input2)}`,
                      url: `${process.env.NEXT_PUBLIC_URL || ""}?key=${moving?.publicKey}`,
                    });
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsOpeningShareApi(false);
                  }
                }}
              >
                공유하기
                <Share className="size-3" />
              </Button>
            </div>

            <div>
              <Button
                variant="inline"
                size="sm"
                className="text-background!"
                tabIndex={-1}
                onClick={async () => {
                  const c = previewCanvasRef.current;
                  if (!c) return;
                  try {
                    const blob = await new Promise<Blob | null>((resolve) =>
                      c.toBlob(resolve, "image/png"),
                    );
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `말장난 말티즈 - ${formatPun(moving?.input1, moving?.input2)}.png`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                이미지 다운로드
                <Download className="size-3" />
              </Button>
            </div>
          </div>

          <div className="w-full relative">
            <canvas ref={previewCanvasRef} className="m-auto" />
          </div>

          <div className="flex items-center justify-between gap-4 mt-auto">
            <LegoButton variant="secondary" onClick={() => onOpenChange(false)}>
              닫기
            </LegoButton>

            <Tooltip open={shouldShowBoomUpTooltip}>
              <TooltipTrigger asChild>
                <LegoButton
                  className="flex-1"
                  loading={isLikePunPending}
                  disabled={likeDisabled?.includes(moving?.publicKey || "")}
                  onClick={() => {
                    setIsLikePunPending(true);
                    setShouldShowBoomUpTooltip(false);
                    likePunDebounced(moving?.publicKey);
                  }}
                >
                  붐업+
                </LegoButton>
              </TooltipTrigger>
              <TooltipContent className="animate-bounce!">
                붐업이 많을수록 체력이 높아져요!
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
