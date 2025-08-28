"use client";

import { useEffect, useRef } from "react";
import animals from "@/dummy/animals.json";
import words from "@/dummy/words.json";
import {
  computeNotePlacement,
  defaultNoteStyle,
  drawScene,
} from "@/lib/canvas/draw";
import {
  handleResizeForMovingAnimal,
  initializeMovement,
  updateMovement,
} from "@/lib/canvas/movement";
import type { Animal, MovingAnimal, Word } from "@/lib/canvas/types";

function fitWithinBounds(
  naturalWidth: number,
  naturalHeight: number,
  maxWidth: number,
  maxHeight: number,
) {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxWidth, height: maxHeight };
  }
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));
  return { width, height };
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const context: CanvasRenderingContext2D = ctx;

    let logicalWidth = 0;
    let logicalHeight = 0;
    function sizeCanvasToWindow() {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      // Logical (CSS) size
      logicalWidth = window.innerWidth;
      logicalHeight = window.innerHeight;
      // Apply CSS size for layout
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
      // Backing store size for crisp rendering
      canvas.width = Math.max(1, Math.round(logicalWidth * dpr));
      canvas.height = Math.max(1, Math.round(logicalHeight * dpr));
      // Scale context so we can draw in logical CSS pixels
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    sizeCanvasToWindow();

    // Build moving animals: one sprite per word, using a real image asset
    const animalById = new Map<number, Animal>();
    for (const animal of animals as Animal[]) animalById.set(animal.id, animal);

    const movingAnimals: MovingAnimal[] = [];
    for (const word of words.slice(0, 3) as Word[]) {
      const animal = animalById.get(word.animal_id);
      if (!animal) continue;
      const pun = `${word.input_1} ${word.input_2}`.trim() || `${animal.name}`;

      const imageElement = new Image();
      imageElement.crossOrigin = "anonymous";
      // animal.image is a public path like "/maltese/maltese_1" (without extension)
      // Try .png first, then fallback to .svg if .png fails
      const basePath = animal.image;
      const ensureLeadingSlash = (p: string) =>
        p.startsWith("/") ? p : `/${p}`;
      const pngPath = ensureLeadingSlash(
        basePath.endsWith(".png") || basePath.endsWith(".svg")
          ? basePath
          : `${basePath}.png`,
      );
      imageElement.src = pngPath;
      imageElement.onerror = () => {
        // If png fails and original didn't specify .svg, try svg
        const svgCandidate = ensureLeadingSlash(
          basePath.endsWith(".svg")
            ? basePath
            : `${basePath.replace(/\.png$/, "")}.svg`,
        );
        if (imageElement.src !== svgCandidate) {
          imageElement.onerror = () => {
            moving.isImageLoaded = false;
          };
          imageElement.src = svgCandidate;
        } else {
          moving.isImageLoaded = false;
        }
      };

      const width = 140;
      const height = 100;
      const speed = 40 + Math.random() * 80; // px/sec
      const angle = Math.random() * Math.PI * 2;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      // Initial position
      const initialX = Math.random() * Math.max(1, logicalWidth - width);
      const initialY = Math.random() * Math.max(1, logicalHeight - height);

      const moving: MovingAnimal = {
        animal,
        pun,
        input1: word.input_1,
        input2: word.input_2,
        x: initialX,
        y: initialY,
        velocityX,
        velocityY,
        width,
        height,
        imageElement,
        isImageLoaded: false,
        // Stagger start by 0-0.8s so same-type movements don't sync
        startDelayRemainingSec: Math.random() * 0.8,
      };

      // Initialize movement via registry (configures per-type state)
      initializeMovement(moving, logicalWidth, logicalHeight);

      movingAnimals.push(moving);
    }

    for (const moving of movingAnimals) {
      moving.imageElement.onload = () => {
        moving.isImageLoaded = true;
        // Preserve aspect ratio within desired bounds
        const maxW = 140;
        const maxH = 100;
        const { naturalWidth, naturalHeight } = moving.imageElement;
        const { width: fittedW, height: fittedH } = fitWithinBounds(
          naturalWidth,
          naturalHeight,
          maxW,
          maxH,
        );
        moving.width = fittedW;
        moving.height = fittedH;
        // Clamp position so the resized sprite stays on-canvas
        const logicalCanvasWidth = logicalWidth;
        const logicalCanvasHeight = logicalHeight;
        moving.x = Math.max(
          0,
          Math.min(logicalCanvasWidth - moving.width, moving.x),
        );
        moving.y = Math.max(
          0,
          Math.min(logicalCanvasHeight - moving.height, moving.y),
        );
      };
      moving.imageElement.onerror = () => {
        moving.isImageLoaded = false;
      };
    }

    let previousTimestampMs: number | null = null;

    function update(deltaSeconds: number) {
      for (const moving of movingAnimals) {
        // Respect randomized start delay to desynchronize animations
        if ((moving.startDelayRemainingSec ?? 0) > 0) {
          moving.startDelayRemainingSec = Math.max(
            0,
            (moving.startDelayRemainingSec ?? 0) - deltaSeconds,
          );
          continue;
        }

        updateMovement(moving, logicalWidth, logicalHeight, deltaSeconds);

        // After movement, bounce if note would hit horizontal edges.
        const placement = computeNotePlacement(
          context,
          canvas,
          moving,
          defaultNoteStyle,
        );
        const {
          boxWidth,
          boxHeight,
          desiredX,
          desiredY,
          margin,
          logicalCanvasWidth,
        } = placement;
        if (boxWidth > 0) {
          const overflowLeft = desiredX < margin - 0.5;
          const overflowRight =
            desiredX > logicalCanvasWidth - boxWidth - margin + 0.5;
          if (overflowLeft || overflowRight) {
            // Reverse horizontal direction like a wall bounce
            moving.velocityX *= -1;
            // Reposition so the note fits exactly within the horizontal bounds
            if (overflowLeft) {
              const targetDesiredX = margin;
              const newSpriteX =
                targetDesiredX + boxWidth / 2 - moving.width / 2;
              moving.x = Math.max(
                0,
                Math.min(logicalCanvasWidth - moving.width, newSpriteX),
              );
            } else if (overflowRight) {
              const targetDesiredX = logicalCanvasWidth - margin - boxWidth;
              const newSpriteX =
                targetDesiredX + boxWidth / 2 - moving.width / 2;
              moving.x = Math.max(
                0,
                Math.min(logicalCanvasWidth - moving.width, newSpriteX),
              );
            }
          }
          // Vertical: if the note would go above the top, bounce vertically and reposition
          if (desiredY < 0) {
            moving.velocityY *= -1;
            const targetBoxTop = 0;
            const newSpriteY =
              targetBoxTop +
              defaultNoteStyle.gap +
              defaultNoteStyle.arrowSize +
              boxHeight;
            const logicalCanvasHeight = logicalHeight;
            moving.y = Math.max(
              0,
              Math.min(logicalCanvasHeight - moving.height, newSpriteY),
            );
          }
        }
      }
    }

    function draw() {
      drawScene(context, canvas, movingAnimals);
    }

    function loop(timestampMs: number) {
      if (previousTimestampMs == null) previousTimestampMs = timestampMs;
      const deltaSeconds = Math.min(
        0.05,
        (timestampMs - previousTimestampMs) / 1000,
      );
      previousTimestampMs = timestampMs;
      update(deltaSeconds);
      draw();
      animationFrameRef.current = window.requestAnimationFrame(loop);
    }

    animationFrameRef.current = window.requestAnimationFrame(loop);

    function handleResize() {
      const previousWidth = logicalWidth;
      const previousHeight = logicalHeight;
      sizeCanvasToWindow();
      const scaleX = logicalWidth / Math.max(1, previousWidth);
      const scaleY = logicalHeight / Math.max(1, previousHeight);
      for (const moving of movingAnimals) {
        handleResizeForMovingAnimal(
          moving,
          scaleX,
          scaleY,
          logicalWidth,
          logicalHeight,
        );
      }
    }

    window.addEventListener("resize", handleResize);

    function getCanvasPoint(evt: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width > 0 ? logicalWidth / rect.width : 1;
      const scaleY = rect.height > 0 ? logicalHeight / rect.height : 1;
      const x = (evt.clientX - rect.left) * scaleX;
      const y = (evt.clientY - rect.top) * scaleY;
      return { x, y };
    }

    function hitTest(x: number, y: number) {
      for (let i = movingAnimals.length - 1; i >= 0; i--) {
        const m = movingAnimals[i];
        if (x >= m.x && x <= m.x + m.width && y >= m.y && y <= m.y + m.height) {
          return m;
        }
      }
      return undefined;
    }

    function handlePointerMove(evt: PointerEvent) {
      const { x, y } = getCanvasPoint(evt);
      const hit = hitTest(x, y);
      canvas.style.cursor = hit ? "pointer" : "default";
    }

    function handlePointerDown(evt: PointerEvent) {
      const { x, y } = getCanvasPoint(evt);
      const hit = hitTest(x, y);
      if (hit) {
        window.alert("clicked");
      }
    }

    function tickHighlight(deltaSeconds: number) {
      for (const m of movingAnimals) {
        if ((m.highlightRemainingMs ?? 0) > 0) {
          m.highlightRemainingMs = Math.max(
            0,
            (m.highlightRemainingMs ?? 0) - deltaSeconds * 1000,
          );
        }
      }
    }

    // Wrap update to also tick highlight timers
    const originalUpdate = update;
    function updateWithHighlight(deltaSeconds: number) {
      originalUpdate(deltaSeconds);
      tickHighlight(deltaSeconds);
    }

    // Replace loop to call updateWithHighlight
    function loopWithHighlight(timestampMs: number) {
      if (previousTimestampMs == null) previousTimestampMs = timestampMs;
      const deltaSeconds = Math.min(
        0.05,
        (timestampMs - previousTimestampMs) / 1000,
      );
      previousTimestampMs = timestampMs;
      updateWithHighlight(deltaSeconds);
      draw();
      animationFrameRef.current =
        window.requestAnimationFrame(loopWithHighlight);
    }

    // Switch listener and loop
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    // Stop old loop if started (defensive), then start new one
    if (animationFrameRef.current != null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = window.requestAnimationFrame(loopWithHighlight);

    return () => {
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
