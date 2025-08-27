import type { MovingAnimal } from "./types";

type MovementHandlers = {
  init?: (m: MovingAnimal, canvasWidth: number, canvasHeight: number) => void;
  update: (
    m: MovingAnimal,
    canvasWidth: number,
    canvasHeight: number,
    deltaSeconds: number,
  ) => void;
  resize?: (
    m: MovingAnimal,
    scaleX: number,
    scaleY: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => void;
};

const movementRegistry = new Map<string, MovementHandlers>();

export function registerMovement(type: string, handlers: MovementHandlers) {
  movementRegistry.set(type, handlers);
}

// Default slide movement
registerMovement("slide", {
  update: (m, canvasWidth, canvasHeight, dt) => {
    m.x += m.velocityX * dt;
    m.y += m.velocityY * dt;

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
  },
});

// Hop movement
registerMovement("hop", {
  init: (m, _cw, ch) => {
    const amplitude = 30 + Math.random() * 50;
    const phase = Math.random() * Math.PI * 2;
    const speedPhase = 6 + Math.random() * 4;
    const baseY = Math.min(ch - m.height, m.y);
    m.velocityY = 0;
    m.hop = { baseY, amplitude, phase, speed: speedPhase };
    m.y = Math.max(0, baseY - amplitude * Math.abs(Math.sin(phase)));
  },
  update: (m, canvasWidth, canvasHeight, dt) => {
    m.x += m.velocityX * dt;
    if (m.x < 0) {
      m.x = 0;
      m.velocityX *= -1;
    } else if (m.x + m.width > canvasWidth) {
      m.x = canvasWidth - m.width;
      m.velocityX *= -1;
    }

    if (m.hop) {
      m.hop.phase += m.hop.speed * dt;
      const yFromHop =
        m.hop.baseY - m.hop.amplitude * Math.abs(Math.sin(m.hop.phase));
      m.y = Math.max(0, Math.min(yFromHop, canvasHeight - m.height));
    }
  },
  resize: (m, _sx, sy, _cw, ch) => {
    if (m.hop) {
      m.hop.baseY *= sy;
      m.hop.baseY = Math.min(ch - m.height, Math.max(0, m.hop.baseY));
      const yFromHop =
        m.hop.baseY - m.hop.amplitude * Math.abs(Math.sin(m.hop.phase));
      m.y = Math.max(0, Math.min(yFromHop, ch - m.height));
    }
  },
});

// Zigzag: horizontal drift + vertical sine
registerMovement("zigzag", {
  init: (m, _cw, ch) => {
    const amplitude = 30 + Math.random() * 40;
    const phase = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 2; // vertical wave speed
    const baseY = Math.min(ch - m.height, Math.max(0, m.y));
    m.zigzag = { baseY, amplitude, phase, speed };
  },
  update: (m, cw, ch, dt) => {
    // Horizontal drift with bounce
    m.x += m.velocityX * dt;
    if (m.x < 0) {
      m.x = 0;
      m.velocityX *= -1;
    } else if (m.x + m.width > cw) {
      m.x = cw - m.width;
      m.velocityX *= -1;
    }
    // Vertical zigzag
    if (m.zigzag) {
      m.zigzag.phase += m.zigzag.speed * dt;
      const yFromWave =
        m.zigzag.baseY + m.zigzag.amplitude * Math.sin(m.zigzag.phase);
      m.y = Math.max(0, Math.min(yFromWave, ch - m.height));
    }
  },
  resize: (m, _sx, sy, _cw, ch) => {
    if (m.zigzag) {
      m.zigzag.baseY *= sy;
      m.zigzag.baseY = Math.min(ch - m.height, Math.max(0, m.zigzag.baseY));
      const yFromWave =
        m.zigzag.baseY + m.zigzag.amplitude * Math.sin(m.zigzag.phase);
      m.y = Math.max(0, Math.min(yFromWave, ch - m.height));
    }
  },
});

// Flutter: small erratic drift with faster bobbing
registerMovement("flutter", {
  init: (m, _cw, ch) => {
    m.flutter = {
      phase: Math.random() * Math.PI * 2,
      bobAmplitude: 10 + Math.random() * 15,
      bobSpeed: 8 + Math.random() * 6,
      driftSpeed: 20 + Math.random() * 30,
      heading: Math.random() * Math.PI * 2,
    };
    // Reduce base speeds for a gentler feel
    m.velocityX *= 0.5;
    m.velocityY = 0;
    m.y = Math.min(ch - m.height, Math.max(0, m.y));
  },
  update: (m, cw, ch, dt) => {
    if (m.flutter) {
      // Slight randomized heading drift
      m.flutter.heading += (Math.random() - 0.5) * 0.6 * dt;
      const driftVX = Math.cos(m.flutter.heading) * m.flutter.driftSpeed;
      m.x += (m.velocityX + driftVX) * dt;

      // Bounce horizontally
      if (m.x < 0) {
        m.x = 0;
        m.velocityX *= -1;
      } else if (m.x + m.width > cw) {
        m.x = cw - m.width;
        m.velocityX *= -1;
      }

      // Bobbing vertically
      m.flutter.phase += m.flutter.bobSpeed * dt;
      const bob = m.flutter.bobAmplitude * Math.sin(m.flutter.phase);
      const targetY = Math.min(ch - m.height, Math.max(0, m.y + bob * dt * 10));
      m.y = targetY;
    }
  },
  resize: (_m, _sx, _sy, _cw, _ch) => {
    // no-op (bobs relative to current y)
  },
});

// Orbit: circle around a moving center point that also drifts
registerMovement("orbit", {
  init: (m, cw, ch) => {
    const radius = 50 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    const angularSpeed =
      (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6);
    const direction: 1 | -1 = angularSpeed >= 0 ? 1 : -1;
    const centerX = Math.min(
      cw - m.width - radius,
      Math.max(radius, m.x + m.width / 2),
    );
    const centerY = Math.min(
      ch - m.height - radius,
      Math.max(radius, m.y + m.height / 2),
    );
    const centerVX = (Math.random() - 0.5) * 40;
    const centerVY = (Math.random() - 0.5) * 40;
    m.orbit = {
      centerX,
      centerY,
      radius,
      angle,
      angularSpeed,
      direction,
      centerVX,
      centerVY,
    };
    // position sprite on orbit
    m.x = centerX + radius * Math.cos(angle) - m.width / 2;
    m.y = centerY + radius * Math.sin(angle) - m.height / 2;
    // base velocities unused for orbit
    m.velocityX = 0;
    m.velocityY = 0;
  },
  update: (m, cw, ch, dt) => {
    if (!m.orbit) return;
    // Move center slowly and bounce within bounds
    m.orbit.centerX += m.orbit.centerVX * dt;
    m.orbit.centerY += m.orbit.centerVY * dt;
    if (m.orbit.centerX < 0 + m.orbit.radius) {
      m.orbit.centerX = m.orbit.radius;
      m.orbit.centerVX *= -1;
    } else if (m.orbit.centerX > cw - m.orbit.radius) {
      m.orbit.centerX = cw - m.orbit.radius;
      m.orbit.centerVX *= -1;
    }
    if (m.orbit.centerY < 0 + m.orbit.radius) {
      m.orbit.centerY = m.orbit.radius;
      m.orbit.centerVY *= -1;
    } else if (m.orbit.centerY > ch - m.orbit.radius) {
      m.orbit.centerY = ch - m.orbit.radius;
      m.orbit.centerVY *= -1;
    }

    // Advance angle and compute position on the circle
    m.orbit.angle += m.orbit.angularSpeed * dt;
    const px =
      m.orbit.centerX + m.orbit.radius * Math.cos(m.orbit.angle) - m.width / 2;
    const py =
      m.orbit.centerY + m.orbit.radius * Math.sin(m.orbit.angle) - m.height / 2;
    m.x = Math.max(0, Math.min(px, cw - m.width));
    m.y = Math.max(0, Math.min(py, ch - m.height));
  },
  resize: (m, sx, sy, cw, ch) => {
    if (!m.orbit) return;
    m.orbit.centerX *= sx;
    m.orbit.centerY *= sy;
    m.orbit.radius *= Math.min(sx, sy);
    // Recompute position
    const px =
      m.orbit.centerX + m.orbit.radius * Math.cos(m.orbit.angle) - m.width / 2;
    const py =
      m.orbit.centerY + m.orbit.radius * Math.sin(m.orbit.angle) - m.height / 2;
    m.x = Math.max(0, Math.min(px, cw - m.width));
    m.y = Math.max(0, Math.min(py, ch - m.height));
  },
});

function resolveHandlers(type: string): MovementHandlers {
  const handlers = movementRegistry.get(type) ?? movementRegistry.get("slide");
  if (handlers) return handlers;
  // Fallback to a minimal slide-like behavior without registering
  return {
    update: (m, canvasWidth, canvasHeight, dt) => {
      m.x += m.velocityX * dt;
      m.y += m.velocityY * dt;
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
    },
  };
}

export function initializeMovement(
  m: MovingAnimal,
  canvasWidth: number,
  canvasHeight: number,
) {
  const handlers = resolveHandlers(m.animal.movement_type);
  handlers.init?.(m, canvasWidth, canvasHeight);
}

export function updateMovement(
  m: MovingAnimal,
  canvasWidth: number,
  canvasHeight: number,
  deltaSeconds: number,
) {
  const handlers = resolveHandlers(m.animal.movement_type);
  handlers.update(m, canvasWidth, canvasHeight, deltaSeconds);
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
  const handlers = resolveHandlers(m.animal.movement_type);
  handlers.resize?.(m, scaleX, scaleY, canvasWidth, canvasHeight);
  if (m.x + m.width > canvasWidth) m.x = canvasWidth - m.width;
  if (m.y + m.height > canvasHeight) m.y = canvasHeight - m.height;
}
