import type { MovingAnimal } from "./types";

export function drawScene(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  movingAnimals: ReadonlyArray<MovingAnimal>,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";
    const textX = moving.x + 6;
    const textY = moving.y + 6;
    ctx.fillText(moving.pun, textX, textY);

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
