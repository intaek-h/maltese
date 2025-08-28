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

// Rabbit movement config and setters
export type RabbitConfig = {
  hopDistance: number; // px per hop
  hopHeight: number; // px peak height
  hopVelocity: number; // px/sec horizontal during hop
  stopTime: number; // seconds paused after 3 hops
};

let rabbitConfig: RabbitConfig = {
  hopDistance: 40,
  hopHeight: 30,
  hopVelocity: 220,
  stopTime: 2,
};

export function setRabbitConfig(partial: Partial<RabbitConfig>) {
  rabbitConfig = { ...rabbitConfig, ...partial };
}

export function getRabbitConfig(): RabbitConfig {
  return rabbitConfig;
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
    // Slow down hop vertical oscillation speed
    const speedPhase = 1 + Math.random() * 2.5;
    const baseY = Math.min(ch - m.height, m.y);
    m.velocityY = 0;
    // Reduce horizontal drift speed for hop movement
    m.velocityX *= 0.6;
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
      bobSpeed: 1 + Math.random() * 6,
      driftSpeed: 10 + Math.random() * 30,
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

// Rabbit: three hops forward, then pause
registerMovement("rabbit", {
  init: (m, cw, ch) => {
    const cfg = getRabbitConfig();
    const baseY = Math.min(ch - m.height, Math.max(0, m.y));
    const directionX: 1 | -1 = m.velocityX >= 0 ? 1 : -1;
    const startX = Math.max(0, Math.min(m.x, cw - m.width));
    const intendedEndX = startX + directionX * cfg.hopDistance;
    let endX = intendedEndX;
    let dir = directionX;
    if (intendedEndX < 0 || intendedEndX > cw - m.width) {
      // flip direction if the next hop would exceed bounds
      dir = directionX === 1 ? -1 : 1;
      endX = startX + dir * cfg.hopDistance;
      endX = Math.max(0, Math.min(endX, cw - m.width));
    }
    m.rabbit = {
      hopDistance: cfg.hopDistance,
      hopHeight: cfg.hopHeight,
      hopVelocity: cfg.hopVelocity,
      stopTime: cfg.stopTime,
      hopsRemainingInBurst: 3,
      hopProgress: 0,
      hopping: true,
      directionX: dir,
      pauseRemaining: 0,
      baseY,
      hopStartX: startX,
      hopEndX: endX,
    };
    m.y = baseY;
    m.velocityX = 0;
    m.velocityY = 0;
  },
  update: (m, cw, ch, dt) => {
    if (!m.rabbit) return;
    // keep runtime config in sync so code changes apply
    const cfg = getRabbitConfig();
    const r = m.rabbit;
    r.hopDistance = cfg.hopDistance;
    r.hopHeight = cfg.hopHeight;
    r.hopVelocity = cfg.hopVelocity;
    r.stopTime = cfg.stopTime;

    // Pause phase
    if (!r.hopping) {
      r.pauseRemaining = Math.max(0, r.pauseRemaining - dt);
      m.y = Math.max(0, Math.min(r.baseY, ch - m.height));
      if (r.pauseRemaining === 0) {
        r.hopping = true;
        r.hopsRemainingInBurst = 3;
        r.hopProgress = 0;
        // prepare next hop window based on current position and direction
        r.hopStartX = Math.max(0, Math.min(m.x, cw - m.width));
        let intendedEndX = r.hopStartX + r.directionX * r.hopDistance;
        if (intendedEndX < 0 || intendedEndX > cw - m.width) {
          r.directionX = r.directionX === 1 ? -1 : 1;
          intendedEndX = r.hopStartX + r.directionX * r.hopDistance;
        }
        r.hopEndX = Math.max(0, Math.min(intendedEndX, cw - m.width));
      }
      return;
    }

    // Hop phase: advance progress based on horizontal speed and required distance
    const totalDistance = Math.max(1, Math.abs(r.hopEndX - r.hopStartX));
    const hopDuration = totalDistance / Math.max(1, r.hopVelocity);
    r.hopProgress += dt / hopDuration;

    const t = Math.min(1, Math.max(0, r.hopProgress));
    // Smoothstep for horizontal (ease-in-out)
    const tEase = t * t * (3 - 2 * t);
    m.x = r.hopStartX + (r.hopEndX - r.hopStartX) * tEase;

    // Vertical arc (0..pi sine)
    const yFromHop = r.baseY - r.hopHeight * Math.sin(Math.PI * t);
    m.y = Math.max(0, Math.min(yFromHop, ch - m.height));

    // End of a hop
    if (r.hopProgress >= 1) {
      r.hopsRemainingInBurst -= 1;
      r.hopProgress = 0;
      // start next hop or pause
      if (r.hopsRemainingInBurst <= 0) {
        r.hopping = false;
        r.pauseRemaining = r.stopTime;
      } else {
        r.hopStartX = Math.max(0, Math.min(r.hopEndX, cw - m.width));
        // compute next end, flipping if needed
        let intendedEndX = r.hopStartX + r.directionX * r.hopDistance;
        if (intendedEndX < 0 || intendedEndX > cw - m.width) {
          r.directionX = r.directionX === 1 ? -1 : 1;
          intendedEndX = r.hopStartX + r.directionX * r.hopDistance;
        }
        r.hopEndX = Math.max(0, Math.min(intendedEndX, cw - m.width));
      }
    }
  },
  resize: (m, _sx, sy, cw, ch) => {
    if (!m.rabbit) return;
    m.rabbit.baseY *= sy;
    m.rabbit.baseY = Math.min(ch - m.height, Math.max(0, m.rabbit.baseY));
    // Re-scale start/end X proportionally to keep trajectory reasonable
    m.rabbit.hopStartX = Math.max(0, Math.min(m.x, cw - m.width));
    let intendedEndX =
      m.rabbit.hopStartX + m.rabbit.directionX * m.rabbit.hopDistance;
    if (intendedEndX < 0 || intendedEndX > cw - m.width) {
      m.rabbit.directionX = m.rabbit.directionX === 1 ? -1 : 1;
      intendedEndX =
        m.rabbit.hopStartX + m.rabbit.directionX * m.rabbit.hopDistance;
    }
    m.rabbit.hopEndX = Math.max(0, Math.min(intendedEndX, cw - m.width));
    m.y = Math.max(0, Math.min(m.rabbit.baseY, ch - m.height));
  },
});

// Deer: single hop forward, then pause 1s, repeat; flip at edges
registerMovement("deer", {
  init: (m, cw, ch) => {
    const HOP_DISTANCE = 60;
    const HOP_HEIGHT = 50;
    const HOP_VELOCITY = 220; // px/sec
    const STOP_TIME = 1; // seconds

    const baseY = Math.min(ch - m.height, Math.max(0, m.y));
    const directionX: 1 | -1 = m.velocityX >= 0 ? 1 : -1;
    const startX = Math.max(0, Math.min(m.x, cw - m.width));
    const intendedEndX = startX + directionX * HOP_DISTANCE;
    let endX = intendedEndX;
    let dir = directionX;
    if (intendedEndX < 0 || intendedEndX > cw - m.width) {
      dir = directionX === 1 ? -1 : 1;
      endX = startX + dir * HOP_DISTANCE;
      endX = Math.max(0, Math.min(endX, cw - m.width));
    }
    m.deer = {
      hopDistance: HOP_DISTANCE,
      hopHeight: HOP_HEIGHT,
      hopVelocity: HOP_VELOCITY,
      stopTime: STOP_TIME,
      hopProgress: 0,
      hopping: true,
      directionX: dir,
      pauseRemaining: 0,
      baseY,
      hopStartX: startX,
      hopEndX: endX,
    };
    m.y = baseY;
    m.velocityX = 0;
    m.velocityY = 0;
  },
  update: (m, cw, ch, dt) => {
    if (!m.deer) return;
    const r = m.deer;

    // Pause phase
    if (!r.hopping) {
      r.pauseRemaining = Math.max(0, r.pauseRemaining - dt);
      m.y = Math.max(0, Math.min(r.baseY, ch - m.height));
      if (r.pauseRemaining === 0) {
        r.hopping = true;
        r.hopProgress = 0;
        // prepare next hop based on current position and direction
        r.hopStartX = Math.max(0, Math.min(m.x, cw - m.width));
        let intendedEndX = r.hopStartX + r.directionX * r.hopDistance;
        if (intendedEndX < 0 || intendedEndX > cw - m.width) {
          r.directionX = r.directionX === 1 ? -1 : 1;
          intendedEndX = r.hopStartX + r.directionX * r.hopDistance;
        }
        r.hopEndX = Math.max(0, Math.min(intendedEndX, cw - m.width));
      }
      return;
    }

    // Hop phase
    const totalDistance = Math.max(1, Math.abs(r.hopEndX - r.hopStartX));
    const hopDuration = totalDistance / Math.max(1, r.hopVelocity);
    r.hopProgress += dt / hopDuration;

    const t = Math.min(1, Math.max(0, r.hopProgress));
    const tEase = t * t * (3 - 2 * t);
    m.x = r.hopStartX + (r.hopEndX - r.hopStartX) * tEase;

    const yFromHop = r.baseY - r.hopHeight * Math.sin(Math.PI * t);
    m.y = Math.max(0, Math.min(yFromHop, ch - m.height));

    if (r.hopProgress >= 1) {
      // After one hop, pause
      r.hopping = false;
      r.pauseRemaining = r.stopTime;
      r.hopProgress = 0;
      // If we ended up at an edge, flip for next hop
      if (m.x <= 0 || m.x + m.width >= cw) {
        r.directionX = r.directionX === 1 ? -1 : 1;
      }
    }
  },
  resize: (m, _sx, sy, cw, ch) => {
    if (!m.deer) return;
    m.deer.baseY *= sy;
    m.deer.baseY = Math.min(ch - m.height, Math.max(0, m.deer.baseY));
    // Re-scale start/end X proportionally to keep trajectory reasonable
    m.deer.hopStartX = Math.max(0, Math.min(m.x, cw - m.width));
    let intendedEndX =
      m.deer.hopStartX + m.deer.directionX * m.deer.hopDistance;
    if (intendedEndX < 0 || intendedEndX > cw - m.width) {
      m.deer.directionX = m.deer.directionX === 1 ? -1 : 1;
      intendedEndX = m.deer.hopStartX + m.deer.directionX * m.deer.hopDistance;
    }
    m.deer.hopEndX = Math.max(0, Math.min(intendedEndX, cw - m.width));
    m.y = Math.max(0, Math.min(m.deer.baseY, ch - m.height));
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
