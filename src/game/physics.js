export const GRAVITY_G = 4000;
const SOFTENING = 80;
const DAMPING = 0.999;

export function applyGravity(entity, stars, dt, debugCb = null) {
  for (const star of stars) {
    const dx = star.x - entity.x;
    const dy = star.y - entity.y;
    const r = Math.hypot(dx, dy);
    if (Number.isFinite(star.gravityRadius) && r > star.gravityRadius) {
      continue;
    }

    const r2 = dx * dx + dy * dy + SOFTENING * SOFTENING;
    const rSoft = Math.sqrt(r2);
    const force = (GRAVITY_G * star.mass) / r2;

    const gx = (dx / rSoft) * force;
    const gy = (dy / rSoft) * force;

    entity.vx += gx * dt;
    entity.vy += gy * dt;

    if (debugCb) {
      debugCb(gx, gy);
    }
  }
}

export function integrate(entity, dt) {
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;
}

export function applyDamping(entity, dt) {
  entity.vx *= DAMPING;
  entity.vy *= DAMPING;
}

