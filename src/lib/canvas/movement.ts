import type { MovingAnimal } from "./types";

export function updateMovement(
  m: MovingAnimal,
  canvasWidth: number,
  canvasHeight: number,
  deltaSeconds: number,
) {
  if (m.animal.movement_type === "hop" && m.hop) {
    // Horizontal movement with edge bounce
    m.x += m.velocityX * deltaSeconds;
    if (m.x < 0) {
      m.x = 0;
      m.velocityX *= -1;
    } else if (m.x + m.width > canvasWidth) {
      m.x = canvasWidth - m.width;
      m.velocityX *= -1;
    }

    // Hop vertical position
    m.hop.phase += m.hop.speed * deltaSeconds;
    const yFromHop =
      m.hop.baseY - m.hop.amplitude * Math.abs(Math.sin(m.hop.phase));
    m.y = Math.max(0, Math.min(yFromHop, canvasHeight - m.height));
    return;
  }

  // Default: slide with velocity and bounce
  m.x += m.velocityX * deltaSeconds;
  m.y += m.velocityY * deltaSeconds;

  if (m.x < 0) {
    m.x = 0;
    m.velocityX *= -1;
  } else if (m.x + m.width > canvasWidth) {
    m.x = canvasWidth - m.width;
    m.velocityX *= -1;
  }

  if (m.y < 0) {
    m.y = 0;
    m.velocityY *= -1;
  } else if (m.y + m.height > canvasHeight) {
    m.y = canvasHeight - m.height;
    m.velocityY *= -1;
  }
}

export function handleResizeForMovingAnimal(
  m: MovingAnimal,
  scaleX: number,
  scaleY: number,
  canvasWidth: number,
  canvasHeight: number,
) {
  m.x *= scaleX;
  m.y *= scaleY;
  if (m.hop) {
    m.hop.baseY *= scaleY;
    m.hop.baseY = Math.min(canvasHeight - m.height, Math.max(0, m.hop.baseY));
    const yFromHop =
      m.hop.baseY - m.hop.amplitude * Math.abs(Math.sin(m.hop.phase));
    m.y = Math.max(0, Math.min(yFromHop, canvasHeight - m.height));
  }
  if (m.x + m.width > canvasWidth) m.x = canvasWidth - m.width;
  if (m.y + m.height > canvasHeight) m.y = canvasHeight - m.height;
}
