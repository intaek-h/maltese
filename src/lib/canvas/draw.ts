import BarAlmost from "@public/health-bars/bar-almost-full.png";
import BarFull from "@public/health-bars/bar-full.png";
import BarHalf from "@public/health-bars/bar-half.png";
import BarMin from "@public/health-bars/bar-min.png";
import type { StaticImageData } from "next/image";
import type { MovingAnimal } from "./types";

type NoteStyle = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  font: string;
  paddingX: number;
  paddingY: number;
  cornerRadius: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  arrowSize: number;
  gap: number;
  maxWidth: number;
  lineHeight: number;
  dividerColor: string;
  dividerWidth: number;
};

export const defaultNoteStyle: NoteStyle = {
  backgroundColor: "rgba(255,255,255,1)",
  borderColor: "#000000",
  borderWidth: 3,
  textColor: "#111827",
  font: "700 20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial",
  paddingX: 12,
  paddingY: 10,
  cornerRadius: 8,
  shadowColor: "#000000",
  shadowBlur: 0,
  shadowOffsetX: 6,
  shadowOffsetY: 6,
  arrowSize: 8,
  gap: 6,
  maxWidth: 220,
  lineHeight: 26,
  dividerColor: "#111827",
  dividerWidth: 3,
};

// Like bar via image assets (fixed size). Loaded once and reused.
const BAR_GAP = 6;
const FALLBACK_BAR_HEIGHT = 18;

type BarAssetKey = "min" | "half" | "almost" | "full";
const barAssets: Record<
  BarAssetKey,
  { img: HTMLImageElement; loaded: boolean }
> = {
  min: { img: new Image(), loaded: false },
  half: { img: new Image(), loaded: false },
  almost: { img: new Image(), loaded: false },
  full: { img: new Image(), loaded: false },
};

function getImageSrc(asset: string | StaticImageData): string {
  return typeof asset === "string" ? asset : asset.src;
}

function prepareImage(
  entry: { img: HTMLImageElement; loaded: boolean },
  asset: string | StaticImageData,
) {
  const img = entry.img;
  // Set CORS mode before setting src to avoid tainting the canvas
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.src = getImageSrc(asset);
  const markLoaded = () => {
    entry.loaded = true;
  };
  // Prefer decode() for smoother rendering; fall back to onload/onerror
  if (typeof img.decode === "function") {
    img.decode().then(markLoaded).catch(markLoaded);
  } else {
    img.onload = markLoaded;
    img.onerror = markLoaded;
  }
}

prepareImage(barAssets.min, BarMin);
prepareImage(barAssets.half, BarHalf);
prepareImage(barAssets.almost, BarAlmost);
prepareImage(barAssets.full, BarFull);

// Images are prepared above; nothing else to do here.

function selectBarAsset(likeCount: number | undefined): {
  img: HTMLImageElement;
  loaded: boolean;
} {
  const n = typeof likeCount === "number" ? likeCount : 0;
  if (n < 1) return barAssets.min;
  if (n < 10) return barAssets.half;
  if (n < 20) return barAssets.almost;
  return barAssets.full;
}

// Compute the note box placement for a given moving sprite without drawing.
// This returns desired (unclamped) X/Y for the box when placed above the sprite.
export function computeNotePlacement(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  moving: MovingAnimal,
  style: NoteStyle = defaultNoteStyle,
) {
  const input1 = (moving.input1 ?? "").trim();
  const input2 = (moving.input2 ?? "").trim();
  const hasAny = input1.length > 0 || input2.length > 0;
  if (!hasAny) {
    return {
      boxWidth: 0,
      boxHeight: 0,
      desiredX: moving.x,
      desiredY: moving.y,
      margin: 4,
      logicalCanvasWidth: canvas.width / (ctx.getTransform().a || 1),
    };
  }

  ctx.font = style.font;
  const lines1 = input1 ? wrapText(ctx, input1, style.maxWidth) : [];
  const lines2 = input2 ? wrapText(ctx, input2, style.maxWidth) : [];
  const lines = [...lines1, ...lines2];

  let textWidth = 0;
  for (const line of lines)
    textWidth = Math.max(textWidth, ctx.measureText(line).width);
  const boxWidth = Math.ceil(textWidth) + style.paddingX * 2;
  const hasDivider = lines1.length > 0 && lines2.length > 0;
  const isSingleBlock = !hasDivider;
  const visibleLinesCount = lines1.length > 0 ? lines1.length : lines2.length;
  const boxHeight = isSingleBlock
    ? visibleLinesCount * style.lineHeight + style.paddingY
    : lines1.length * style.lineHeight +
      style.dividerWidth +
      lines2.length * style.lineHeight +
      style.paddingY * 2;

  const anchorX = moving.x + moving.width / 2;
  const anchorY = moving.y;
  const desiredX = Math.round(anchorX - boxWidth / 2);
  const desiredY = Math.round(
    anchorY - style.gap - style.arrowSize - boxHeight,
  );
  const t = ctx.getTransform();
  const logicalCanvasWidth = canvas.width / (t.a || 1);
  const margin = 4;
  return {
    boxWidth,
    boxHeight,
    desiredX,
    desiredY,
    margin,
    logicalCanvasWidth,
  };
}

function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, Math.floor(Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    const w = ctx.measureText(test).width;
    if (w > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawNote(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  moving: MovingAnimal,
  style: NoteStyle,
) {
  const input1 = (moving.input1 ?? "").trim();
  const input2 = (moving.input2 ?? "").trim();
  const hasAny = input1.length > 0 || input2.length > 0;
  if (!hasAny) return;

  // Prepare font for measurement and drawing
  ctx.font = style.font;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = style.textColor;

  // Wrap lines individually to keep them visually distinct
  const lines1 = input1 ? wrapText(ctx, input1, style.maxWidth) : [];
  const lines2 = input2 ? wrapText(ctx, input2, style.maxWidth) : [];
  const lines = [...lines1, ...lines2];
  if (lines.length === 0) return;

  // Compute box size
  let textWidth = 0;
  for (const line of lines)
    textWidth = Math.max(textWidth, ctx.measureText(line).width);
  const boxWidth = Math.ceil(textWidth) + style.paddingX * 2;
  const hasDivider = lines1.length > 0 && lines2.length > 0;
  const isSingleBlock = !hasDivider;
  const visibleLinesCount = lines1.length > 0 ? lines1.length : lines2.length;
  const boxHeight = isSingleBlock
    ? visibleLinesCount * style.lineHeight + style.paddingY
    : lines1.length * style.lineHeight +
      style.dividerWidth +
      lines2.length * style.lineHeight +
      style.paddingY * 2;

  // Anchor is top-center of sprite
  const anchorX = moving.x + moving.width / 2;
  const anchorY = moving.y;

  // Always prefer above; clamp into boundary instead of flipping
  const preferAbove = true;
  const placeAbove = preferAbove;

  let boxX = Math.round(anchorX - boxWidth / 2);
  let boxY = Math.round(anchorY - style.gap - style.arrowSize - boxHeight);
  // Clamp vertically into canvas top (no flip)
  boxY = Math.max(0, boxY);

  // Clamp horizontally within canvas (logical size under current transform)
  const t = ctx.getTransform();
  const logicalCanvasWidth = canvas.width / (t.a || 1);
  const margin = 4;
  boxX = Math.max(
    margin,
    Math.min(boxX, logicalCanvasWidth - boxWidth - margin),
  );

  // Arrow horizontal position (clamped to box)
  const arrowCenterX = Math.max(
    boxX + style.cornerRadius + style.arrowSize,
    Math.min(anchorX, boxX + boxWidth - style.cornerRadius - style.arrowSize),
  );

  // Draw shadowed rounded rect
  ctx.save();
  ctx.shadowColor = style.shadowColor;
  ctx.shadowBlur = style.shadowBlur;
  ctx.shadowOffsetX = style.shadowOffsetX;
  ctx.shadowOffsetY = style.shadowOffsetY;
  ctx.fillStyle = style.backgroundColor;
  createRoundedRectPath(
    ctx,
    boxX,
    boxY,
    boxWidth,
    boxHeight,
    style.cornerRadius,
  );
  ctx.fill();
  ctx.restore();

  // Border for rect
  if (style.borderWidth > 0) {
    ctx.save();
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = style.borderWidth;
    createRoundedRectPath(
      ctx,
      boxX,
      boxY,
      boxWidth,
      boxHeight,
      style.cornerRadius,
    );
    ctx.stroke();
    ctx.restore();
  }

  // Draw arrow
  const arrowHeight = style.arrowSize;
  const arrowHalfWidth = Math.max(arrowHeight, 8);
  ctx.save();
  ctx.fillStyle = style.backgroundColor;
  ctx.beginPath();
  if (placeAbove) {
    const tipX = anchorX;
    const tipY = anchorY - style.gap;
    const baseY = boxY + boxHeight;
    const baseLeftX = arrowCenterX - arrowHalfWidth;
    const baseRightX = arrowCenterX + arrowHalfWidth;
    ctx.moveTo(baseLeftX, baseY);
    ctx.lineTo(baseRightX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
  } else {
    const tipX = anchorX;
    const tipY = moving.y + moving.height + style.gap;
    const baseY = boxY;
    const baseLeftX = arrowCenterX - arrowHalfWidth;
    const baseRightX = arrowCenterX + arrowHalfWidth;
    ctx.moveTo(baseLeftX, baseY);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(baseRightX, baseY);
    ctx.closePath();
  }
  // Shadow for arrow
  ctx.shadowColor = style.shadowColor;
  ctx.shadowBlur = style.shadowBlur;
  ctx.shadowOffsetX = style.shadowOffsetX;
  ctx.shadowOffsetY = style.shadowOffsetY;
  ctx.fill();
  ctx.restore();

  // Arrow border
  if (style.borderWidth > 0) {
    ctx.save();
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = style.borderWidth;
    ctx.beginPath();
    if (placeAbove) {
      const tipX = anchorX;
      const tipY = anchorY - style.gap;
      const baseY = boxY + boxHeight;
      const baseLeftX = arrowCenterX - arrowHalfWidth;
      const baseRightX = arrowCenterX + arrowHalfWidth;
      ctx.moveTo(baseLeftX, baseY);
      ctx.lineTo(baseRightX, baseY);
      ctx.lineTo(tipX, tipY);
      ctx.closePath();
    } else {
      const tipX = anchorX;
      const tipY = moving.y + moving.height + style.gap;
      const baseY = boxY;
      const baseLeftX = arrowCenterX - arrowHalfWidth;
      const baseRightX = arrowCenterX + arrowHalfWidth;
      ctx.moveTo(baseLeftX, baseY);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(baseRightX, baseY);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.restore();
  }

  // Draw text lines and divider (if both inputs present)
  ctx.save();
  ctx.fillStyle = style.textColor;
  ctx.font = style.font;
  ctx.textBaseline = "alphabetic";
  let textY = boxY + style.paddingY + style.lineHeight * 0.6; // approx baseline
  // first block
  for (const line of lines1) {
    ctx.fillText(line, boxX + style.paddingX, textY);
    textY += style.lineHeight;
  }
  // divider
  if (hasDivider) {
    const lineY = Math.round(
      boxY + style.paddingY + lines1.length * style.lineHeight,
    );
    ctx.save();
    ctx.strokeStyle = style.dividerColor;
    ctx.lineWidth = style.dividerWidth;
    ctx.beginPath();
    ctx.moveTo(boxX, lineY);
    ctx.lineTo(boxX + boxWidth, lineY);
    ctx.stroke();
    ctx.restore();
    textY = lineY + style.dividerWidth + style.lineHeight * 0.85;
  }
  // second block
  for (const line of lines2) {
    ctx.fillText(line, boxX + style.paddingX, textY);
    textY += style.lineHeight;
  }
  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  movingAnimals: ReadonlyArray<MovingAnimal>,
  options?: { likeBarSizeAdjustPx?: number },
) {
  const transform = ctx.getTransform();
  const scaleX = transform.a || 1;
  const scaleY = transform.d || 1;
  const logicalWidth = canvas.width / scaleX;
  const logicalHeight = canvas.height / scaleY;
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  for (const moving of movingAnimals) {
    if (moving.isImageLoaded) {
      ctx.drawImage(
        moving.imageElement,
        moving.x,
        moving.y,
        moving.width,
        moving.height,
      );
    } else {
      ctx.fillStyle = "#ddd";
      ctx.fillRect(moving.x, moving.y, moving.width, moving.height);
    }

    // Draw note with input_1 and input_2
    drawNote(ctx, canvas, moving, defaultNoteStyle);

    // Draw like bar via image under the sprite
    const likeBarHeight = drawLikeBar(
      ctx,
      canvas,
      moving,
      options?.likeBarSizeAdjustPx ?? 0,
    );

    // Draw status badge for highlighted pun, positioned below the like bar
    if (moving.isHighlighted) {
      drawStatusBadge(ctx, canvas, moving, likeBarHeight);
    }

    if ((moving.highlightRemainingMs ?? 0) > 0) {
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        moving.x - 2,
        moving.y - 2,
        moving.width + 4,
        moving.height + 4,
      );
    }
  }
}

function drawStatusBadge(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  moving: MovingAnimal,
  extraOffsetBelow: number = 0,
) {
  const status = moving.status || "queued";
  const label =
    status === "queued"
      ? "등록 대기중"
      : status === "visible"
        ? "등록됨"
        : status === "hidden"
          ? "노출 제한됨"
          : status;

  const colors: Record<string, { bg: string; fg: string; border: string }> = {
    queued: { bg: "#fef3c7", fg: "#92400e", border: "#f59e0b" }, // amber
    visible: { bg: "#dcfce7", fg: "#065f46", border: "#22c55e" }, // green
    hidden: { bg: "#fee2e2", fg: "#7f1d1d", border: "#ef4444" }, // red
  };
  const theme = colors[status] || {
    bg: "#e5e7eb",
    fg: "#111827",
    border: "#6b7280",
  }; // gray

  const paddingX = 8;
  const paddingY = 4;
  const radius = 999; // pill
  const gap = 6; // distance below sprite
  const font =
    "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial";

  ctx.save();
  ctx.font = font;
  ctx.textBaseline = "middle";
  const textWidth = Math.ceil(ctx.measureText(label).width);
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 18 + paddingY * 0; // ~18px height for 12px font line

  const centerX = moving.x + moving.width / 2;
  let boxX = Math.round(centerX - boxWidth / 2);
  let boxY = Math.round(moving.y + moving.height + gap + extraOffsetBelow);

  const t = ctx.getTransform();
  const logicalCanvasWidth = canvas.width / (t.a || 1);
  const logicalCanvasHeight = canvas.height / (t.d || 1);
  const margin = 4;

  // Clamp horizontally fully within canvas
  boxX = Math.max(
    margin,
    Math.min(boxX, logicalCanvasWidth - boxWidth - margin),
  );
  // Clamp vertically to bottom edge; badge should stay below the animal
  if (boxY + boxHeight > logicalCanvasHeight - margin) {
    boxY = logicalCanvasHeight - margin - boxHeight;
  }

  // Background
  ctx.fillStyle = theme.bg;
  createRoundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, radius);
  ctx.fill();

  // Border
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text
  ctx.fillStyle = theme.fg;
  const textX = boxX + paddingX;
  const textY = boxY + boxHeight / 2;
  ctx.fillText(label, textX, textY);
  ctx.restore();
}

function drawLikeBar(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  moving: MovingAnimal,
  sizeAdjustPx: number = 0,
): number {
  const t = ctx.getTransform();
  const logicalCanvasWidth = canvas.width / (t.a || 1);
  const logicalCanvasHeight = canvas.height / (t.d || 1);
  const margin = 4;

  const centerX = moving.x + moving.width / 2;
  // Prefer image asset if loaded
  const asset = selectBarAsset(moving.likeCount);
  const img = asset.img;
  if (asset.loaded && img.naturalWidth > 0 && img.naturalHeight > 0) {
    const drawWidth = Math.max(1, img.naturalWidth + sizeAdjustPx);
    const aspect = img.naturalHeight / img.naturalWidth;
    const drawHeight = Math.max(1, Math.round(drawWidth * aspect));

    let barX = Math.round(centerX - drawWidth / 2);
    let barY = Math.round(moving.y + moving.height + BAR_GAP);

    // Clamp fully within canvas
    barX = Math.max(
      margin,
      Math.min(barX, logicalCanvasWidth - drawWidth - margin),
    );
    if (barY + drawHeight > logicalCanvasHeight - margin) {
      barY = logicalCanvasHeight - margin - drawHeight;
    }

    ctx.drawImage(img, barX, barY, drawWidth, drawHeight);

    return BAR_GAP + drawHeight;
  }
  // If image not yet loaded, reserve fallback space
  return BAR_GAP + FALLBACK_BAR_HEIGHT;
}

// Measure the vertical space the like bar will occupy beneath a sprite.
// Used by layouts (e.g., detail dialog) to reserve space.
export function measureLikeBarUsedHeight(moving: MovingAnimal): number {
  const asset = selectBarAsset(moving.likeCount);
  if (asset.loaded && asset.img.naturalHeight > 0) {
    return BAR_GAP + asset.img.naturalHeight;
  }
  return BAR_GAP + FALLBACK_BAR_HEIGHT;
}
