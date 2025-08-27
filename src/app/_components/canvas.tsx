"use client";

import { useEffect, useRef } from "react";
import animals from "@/dummy/animals.json";
import words from "@/dummy/words.json";
import { drawScene } from "@/lib/canvas/draw";
import {
  handleResizeForMovingAnimal,
  initializeMovement,
  updateMovement,
} from "@/lib/canvas/movement";
import type { Animal, MovingAnimal, Word } from "@/lib/canvas/types";

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

    // Build moving animals: one sprite per word, using the associated animal image
    const animalById = new Map<number, Animal>();
    for (const animal of animals as Animal[]) animalById.set(animal.id, animal);

    const movingAnimals: MovingAnimal[] = [];
    for (const word of words as Word[]) {
      const animal = animalById.get(word.animal_id);
      if (!animal) continue;
      const pun = `${word.input_1} ${word.input_2}`.trim() || `${animal.name}`;

      const imageElement = new Image();
      imageElement.crossOrigin = "anonymous";
      imageElement.src = animal.image;

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
      };

      // Initialize movement via registry (configures per-type state)
      initializeMovement(moving, logicalWidth, logicalHeight);

      movingAnimals.push(moving);
    }

    for (const moving of movingAnimals) {
      moving.imageElement.onload = () => {
        moving.isImageLoaded = true;
      };
      moving.imageElement.onerror = () => {
        moving.isImageLoaded = false;
      };
    }

    let previousTimestampMs: number | null = null;

    function update(deltaSeconds: number) {
      for (const moving of movingAnimals) {
        updateMovement(moving, logicalWidth, logicalHeight, deltaSeconds);
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
