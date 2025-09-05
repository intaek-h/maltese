"use client";

import { DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  computeNotePlacement,
  defaultNoteStyle,
  drawScene,
} from "@/lib/canvas/draw";
import type { MovingAnimal } from "@/lib/canvas/types";

export default function PunDetailDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moving: MovingAnimal | null;
  zoom?: number;
}) {
  const { open, onOpenChange, moving, zoom: zoomProp } = props;
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

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

      // Measure note to center the union (note above + sprite)
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
      let unionHeight = extraAboveBase + clone.height;

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
        unionHeight = extraAboveBase + clone.height;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[380px] h-[520px]" showCloseButton={false}>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>
              {moving?.input1 || ""} {moving?.input2 || ""}
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className="w-full">
          <canvas ref={previewCanvasRef} className="m-auto" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span>👍 {moving?.likeCount ?? 0}</span>
            <span>🚩 {moving?.reportCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                // TODO: wire like action using publicKey
                onOpenChange(false);
              }}
            >
              좋아요
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // TODO: wire report action using publicKey
                onOpenChange(false);
              }}
            >
              신고
            </Button>
          </div>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
