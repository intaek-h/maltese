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
