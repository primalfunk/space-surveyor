import { CONFIG } from "../game/config.js";
import { sounds } from "../game/audio.js";

const { SHIP } = CONFIG;
const ROT_SPEED = SHIP.ROT_SPEED;     // radians/sec
const THRUST = SHIP.THRUST;
const MAX_FUEL = SHIP.MAX_FUEL;
const THRUST_FUEL_RATE = SHIP.THRUST_FUEL_RATE;
const ROT_FUEL_RATE = SHIP.ROT_FUEL_RATE;

const SHIP_SPRITE = new Image();
SHIP_SPRITE.src = SHIP.SPRITE_SRC;
const SHIP_DRAW_SIZE = SHIP.DRAW_SIZE;
const THRUST_LOOP_SEGMENT = SHIP.THRUST_LOOP_SEGMENT;
const THRUST_LOOP_CROSSFADE = SHIP.THRUST_LOOP_CROSSFADE;
const THRUST_VISUAL = SHIP.THRUST_VISUAL;

const UPGRADE_PALETTES = {
  SHIELD: ["#567EA6", "#6A94BD", "#7EABD3", "#96C2E6", "#B3DAF4"],
  FIRE_RATE: ["#A8794E", "#BC8E5B", "#D1A56A", "#E6BF7C", "#F6D993"],
  FIRE_DISTANCE: ["#5F9E87", "#73B39A", "#89C8AE", "#A4DCC6", "#BDEFD9"],
  FUEL: ["#5E8E74", "#73A586", "#8BBC9B", "#A2D1B2", "#BCE6C9"],
  COLLECTOR: ["#8C6FA6", "#9F82BA", "#B598CF", "#C9B0E2", "#DCC7F0"]
};

const INDICATOR_GEOM = {
  SHIELD_AURA_INNER: 0.55,
  SHIELD_AURA_OUTER: 0.9,
  EMITTER_RADIUS: 0.24,
  EMITTER_SPREAD: 0.85,
  FUEL_TOP: 0.1,
  FUEL_BOTTOM: 0.45,
  FUEL_WIDTH: 0.18,
  COLLECTOR_Y_START: -0.05,
  COLLECTOR_STEP: 0.08,
  COLLECTOR_WIDTH: 0.16,
  COLLECTOR_HEIGHT: 0.06,
  FIRE_LINE_START: -0.48,
  FIRE_LINE_END: -0.92
};

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const int = Number.parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function paletteColor(palette, level) {
  if (level <= 0) {
    return null;
  }
  const idx = Math.min(level - 1, palette.length - 1);
  return palette[idx];
}

function levelAlpha(level, min = 0.35, max = 0.9) {
  if (level <= 0) {
    return 0;
  }
  const t = clamp01((level - 1) / 4);
  return min + (max - min) * t;
}

export class Ship {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.heading = 0;
    this.maxFuel = MAX_FUEL;
    this.fuel = MAX_FUEL;
    this.thrusting = 0;
    this.thrustLoopActive = false;
    this.rotateLoopActive = false;
    this.kickTimer = 0;
  }

  stopThrustLoop() {
    if (this.thrustLoopActive) {
      sounds.stopLoop("thrust");
      this.thrustLoopActive = false;
    }
  }

  stopRotateLoop() {
    if (this.rotateLoopActive) {
      sounds.stopLoop("thrust_rotate");
      this.rotateLoopActive = false;
    }
  }

  update(dt, input = null) {
    this.kickTimer = Math.max(0, this.kickTimer - dt);
    const prevThrust = this.thrusting;
    const controlsDisabled = Boolean(input?.disableControls);
    if (controlsDisabled) {
      this.thrusting = 0;
      this.kickTimer = 0;
      this.stopThrustLoop();
      this.stopRotateLoop();
      return;
    }
    let rotationInput = 0;
    let thrustInput = 0;

    let aimAngle = null;
    if (input) {
      if (typeof input.rotationInput === "number") {
        rotationInput = input.rotationInput;
      }
      if (typeof input.thrustInput === "number") {
        thrustInput = input.thrustInput;
      }
      if (Number.isFinite(input.aimAngle)) {
        aimAngle = input.aimAngle;
      }
    }

    const fuelCost = (Math.abs(thrustInput) * THRUST_FUEL_RATE + Math.abs(rotationInput) * ROT_FUEL_RATE) * dt;
    if (fuelCost > 0 && this.fuel <= 0) {
      this.thrusting = 0;
      this.kickTimer = 0;
      this.stopThrustLoop();
      this.stopRotateLoop();
      return;
    }

    let scale = 1;
    if (fuelCost > 0 && this.fuel < fuelCost) {
      scale = this.fuel / fuelCost;
    }

    if (aimAngle !== null) {
      this.heading = aimAngle;
      rotationInput = 0;
      this.stopRotateLoop();
    }

    if (rotationInput !== 0) {
      this.heading += rotationInput * ROT_SPEED * dt * scale;
      if (thrustInput === 0 && !this.rotateLoopActive) {
        sounds.startLoop("thrust_rotate", THRUST_LOOP_SEGMENT, THRUST_LOOP_CROSSFADE);
        this.rotateLoopActive = true;
      }
    } else {
      this.stopRotateLoop();
    }

    if (thrustInput !== 0) {
      const fx = Math.sin(this.heading);
      const fy = -Math.cos(this.heading);

      this.vx += fx * THRUST * thrustInput * dt * scale;
      this.vy += fy * THRUST * thrustInput * dt * scale;
      if (!this.thrustLoopActive) {
        sounds.startLoop("thrust", THRUST_LOOP_SEGMENT, THRUST_LOOP_CROSSFADE);
        this.thrustLoopActive = true;
      }
      if (this.rotateLoopActive) {
        this.stopRotateLoop();
      }
    }

    if (fuelCost > 0) {
      this.fuel = Math.max(0, this.fuel - fuelCost * scale);
    }

    const nextThrust = thrustInput * scale;
    if (nextThrust > 0 && prevThrust <= 0) {
      this.kickTimer = THRUST_VISUAL.KICK_DURATION;
    }
    this.thrusting = nextThrust;
    if (this.thrusting === 0) {
      this.stopThrustLoop();
    }
  }

  draw(ctx, speed = 0, visuals = null) {
    // World-space draw (unused for now)
    this.drawScreen(ctx, this.x, this.y, speed, visuals);
  }

  drawScreen(ctx, sx, sy, speed = 0, visuals = null) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.heading);

    this.drawShieldAura(ctx, visuals);
    if (this.thrusting !== 0 || this.kickTimer > 0) {
      this.drawFlames(ctx, this.thrusting, speed);
    }
    this.drawIndicators(ctx, visuals);
    this.drawHull(ctx);
    ctx.restore();
  }

  drawShieldAura(ctx, visuals) {
    const shieldLevel = Math.max(0, visuals?.shieldLevel ?? 0);
    const shieldRatio = clamp01(visuals?.shieldRatio ?? 0);
    if (shieldLevel <= 0 || shieldRatio <= 0) {
      return;
    }
    const color = paletteColor(UPGRADE_PALETTES.SHIELD, shieldLevel);
    if (!color) {
      return;
    }
    const radius = SHIP_DRAW_SIZE * 0.58;
    const inner = SHIP_DRAW_SIZE * INDICATOR_GEOM.SHIELD_AURA_INNER;
    const outer = SHIP_DRAW_SIZE * INDICATOR_GEOM.SHIELD_AURA_OUTER;
    const glow = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
    const alpha = clamp01(shieldRatio) * levelAlpha(shieldLevel, 0.35, 0.8);
    glow.addColorStop(0, rgbaFromHex(color, alpha));
    glow.addColorStop(1, rgbaFromHex(color, 0));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(radius, outer), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawIndicators(ctx, visuals) {
    if (!visuals) {
      return;
    }
    const now = performance.now() / 1000;
    const shieldLevel = Math.max(0, visuals.shieldLevel ?? 0);
    const shieldRatio = clamp01(visuals.shieldRatio ?? 0);
    const fireRateLevel = Math.max(0, visuals.fireRateLevel ?? 0);
    const fireDistanceLevel = Math.max(0, visuals.fireDistanceLevel ?? 0);
    const fuelTankLevel = Math.max(0, visuals.fuelTankLevel ?? 0);
    const fuelRatio = clamp01(visuals.fuelRatio ?? 0);
    const collectorLevel = Math.max(0, visuals.collectorLevel ?? 0);
    const fireCooldown = Math.max(0.05, visuals.fireCooldownSeconds ?? 0.26);

    const half = SHIP_DRAW_SIZE / 2;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (shieldLevel > 0) {
      const color = paletteColor(UPGRADE_PALETTES.SHIELD, shieldLevel);
      if (color) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = levelAlpha(shieldLevel, 0.35, 0.75) * shieldRatio;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, half * 0.28, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (fireRateLevel > 0) {
      const color = paletteColor(UPGRADE_PALETTES.FIRE_RATE, fireRateLevel);
      if (color) {
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((now / fireCooldown) * Math.PI * 2));
        ctx.strokeStyle = color;
        ctx.globalAlpha = levelAlpha(fireRateLevel, 0.25, 0.75) * pulse;
        ctx.lineWidth = 1.1;
        const ticks = Math.max(1, fireRateLevel);
        const baseAngle = -Math.PI / 2;
        const spread = INDICATOR_GEOM.EMITTER_SPREAD;
        for (let i = 0; i < ticks; i++) {
          const t = ticks === 1 ? 0.5 : i / (ticks - 1);
          const angle = baseAngle - spread * 0.5 + spread * t;
          const r0 = half * 0.18;
          const r1 = half * INDICATOR_GEOM.EMITTER_RADIUS;
          const x0 = Math.cos(angle) * r0;
          const y0 = Math.sin(angle) * r0;
          const x1 = Math.cos(angle) * r1;
          const y1 = Math.sin(angle) * r1;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }
    }

    if (fireDistanceLevel > 0) {
      const color = paletteColor(UPGRADE_PALETTES.FIRE_DISTANCE, fireDistanceLevel);
      if (color) {
        const lineStart = SHIP_DRAW_SIZE * INDICATOR_GEOM.FIRE_LINE_START;
        const lineEnd = SHIP_DRAW_SIZE * (INDICATOR_GEOM.FIRE_LINE_END - fireDistanceLevel * 0.04);
        ctx.strokeStyle = color;
        ctx.globalAlpha = levelAlpha(fireDistanceLevel, 0.2, 0.7);
        ctx.lineWidth = 1;
        if (fireDistanceLevel >= 2) {
          ctx.setLineDash([2, 3]);
        }
        ctx.beginPath();
        ctx.moveTo(0, lineStart);
        ctx.lineTo(0, lineEnd);
        ctx.stroke();
        ctx.setLineDash([]);
        if (fireDistanceLevel >= 3) {
          ctx.globalAlpha *= 0.6;
          ctx.beginPath();
          ctx.moveTo(2, lineStart + 2);
          ctx.lineTo(2, lineEnd + 2);
          ctx.stroke();
        }
      }
    }

    if (fuelTankLevel > 0) {
      const color = paletteColor(UPGRADE_PALETTES.FUEL, fuelTankLevel);
      if (color) {
        const cells = fuelTankLevel * 3;
        const top = SHIP_DRAW_SIZE * INDICATOR_GEOM.FUEL_TOP;
        const bottom = SHIP_DRAW_SIZE * INDICATOR_GEOM.FUEL_BOTTOM;
        const height = bottom - top;
        const cellH = height / cells;
        const cellW = SHIP_DRAW_SIZE * INDICATOR_GEOM.FUEL_WIDTH;
        const filled = Math.round(cells * fuelRatio);
        for (let i = 0; i < cells; i++) {
          const y0 = top + i * cellH;
          const alpha = i < filled ? 0.7 : 0.25;
          ctx.strokeStyle = color;
          ctx.globalAlpha = levelAlpha(fuelTankLevel, 0.3, 0.7) * alpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.rect(-cellW / 2, y0, cellW, cellH * 0.8);
          ctx.stroke();
        }
      }
    }

    if (collectorLevel > 0) {
      const color = paletteColor(UPGRADE_PALETTES.COLLECTOR, collectorLevel);
      if (color) {
        ctx.strokeStyle = color;
        ctx.globalAlpha = levelAlpha(collectorLevel, 0.25, 0.7);
        ctx.lineWidth = 1.1;
        const count = collectorLevel;
        const wobble = collectorLevel > 1 ? Math.sin(now * 1.4) * 0.02 : 0;
        for (let i = 0; i < count; i++) {
          const y = SHIP_DRAW_SIZE * (INDICATOR_GEOM.COLLECTOR_Y_START + i * INDICATOR_GEOM.COLLECTOR_STEP);
          const halfW = SHIP_DRAW_SIZE * INDICATOR_GEOM.COLLECTOR_WIDTH * 0.5;
          const h = SHIP_DRAW_SIZE * INDICATOR_GEOM.COLLECTOR_HEIGHT;
          const offset = wobble * (i + 1);
          ctx.beginPath();
          ctx.moveTo(-halfW - offset, y - h * 0.5);
          ctx.lineTo(-halfW * 0.35 - offset, y);
          ctx.lineTo(-halfW - offset, y + h * 0.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(halfW + offset, y - h * 0.5);
          ctx.lineTo(halfW * 0.35 + offset, y);
          ctx.lineTo(halfW + offset, y + h * 0.5);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  drawHull(ctx) {
    const half = SHIP_DRAW_SIZE / 2;
    const noseW = SHIP_DRAW_SIZE * 0.22;
    const bodyW = SHIP_DRAW_SIZE * 0.42;
    const tailW = SHIP_DRAW_SIZE * 0.3;
    const noseY = -half * 0.9;
    const shoulderY = -half * 0.55;
    const midY = half * 0.2;
    const tailY = half * 0.58;
    const exhaustY = half * 0.9;
    const hullFill = "rgba(245, 246, 248, 0.95)";
    const hullEdge = "rgba(0, 0, 0, 0.9)";
    const innerColor = "rgba(130, 130, 130, 0.75)";

    ctx.save();
    ctx.fillStyle = hullFill;
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = hullEdge;
    ctx.beginPath();
    ctx.moveTo(-noseW, noseY);
    ctx.lineTo(-bodyW, shoulderY);
    ctx.lineTo(-bodyW, midY);
    ctx.lineTo(-tailW, tailY);
    ctx.lineTo(-tailW * 0.6, exhaustY);
    ctx.lineTo(tailW * 0.6, exhaustY);
    ctx.lineTo(tailW, tailY);
    ctx.lineTo(bodyW, midY);
    ctx.lineTo(bodyW, shoulderY);
    ctx.lineTo(noseW, noseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = innerColor;
    ctx.lineWidth = 1;

    // Sensor nose / perception arc
    ctx.beginPath();
    ctx.moveTo(-noseW * 0.65, noseY + half * 0.08);
    ctx.lineTo(noseW * 0.65, noseY + half * 0.08);
    ctx.stroke();

    // Navigation spine
    ctx.beginPath();
    ctx.moveTo(0, shoulderY + half * 0.06);
    ctx.lineTo(0, midY - half * 0.08);
    ctx.stroke();

    // Power core
    const coreW = SHIP_DRAW_SIZE * 0.22;
    const coreH = SHIP_DRAW_SIZE * 0.16;
    ctx.strokeRect(-coreW / 2, -coreH / 2, coreW, coreH);

    // Structural frame lines
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.75, 0);
    ctx.lineTo(bodyW * 0.75, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.65, midY - half * 0.02);
    ctx.lineTo(bodyW * 0.65, midY - half * 0.02);
    ctx.stroke();

    // Propulsion bays
    const bayW = SHIP_DRAW_SIZE * 0.18;
    const bayH = SHIP_DRAW_SIZE * 0.14;
    const bayY = half * 0.42;
    ctx.strokeRect(-bodyW * 0.72 - bayW / 2, bayY - bayH / 2, bayW, bayH);
    ctx.strokeRect(bodyW * 0.72 - bayW / 2, bayY - bayH / 2, bayW, bayH);

    // Exhaust plane
    ctx.beginPath();
    ctx.moveTo(-tailW * 0.6, exhaustY);
    ctx.lineTo(tailW * 0.6, exhaustY);
    ctx.stroke();

    ctx.restore();
  }

  drawFlames(ctx, thrusting, speed = 0) {
    const direction = 1;
    const baseY = 10;
    const offsets = [-6, 6];
    const flicker = 0.8 + Math.random() * 0.4;
    const thrustPower = Math.min(1, Math.abs(thrusting));
    const speedRatio = Math.min(1, speed / 520);
    const kickRatio = THRUST_VISUAL.KICK_DURATION > 0
      ? Math.min(1, this.kickTimer / THRUST_VISUAL.KICK_DURATION)
      : 0;
    const widthScale = 0.8 + thrustPower * 0.6 + kickRatio * 0.5;
    const flameLen = (8 + thrustPower * 6) * flicker;
    const outerLen = flameLen * (1.2 + thrustPower * 0.25);
    const heatLen = outerLen * 1.6;
    const plumeLen = THRUST_VISUAL.PLUME_BASE
      + thrustPower * THRUST_VISUAL.PLUME_MAX
      + speedRatio * THRUST_VISUAL.PLUME_SPEED;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (thrustPower > 0 || kickRatio > 0) {
      ctx.save();
      ctx.translate(0, baseY);
      ctx.scale(1, direction);

      const flareRadius = THRUST_VISUAL.FLARE_RADIUS * (0.6 + thrustPower * 0.6);
      const flare = ctx.createRadialGradient(0, 2, 0, 0, 2, flareRadius);
      flare.addColorStop(0, `rgba(120, 200, 190, ${THRUST_VISUAL.FLARE_ALPHA + thrustPower * 0.1})`);
      flare.addColorStop(1, "rgba(120, 200, 190, 0)");
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(0, 2, flareRadius, 0, Math.PI * 2);
      ctx.fill();

      if (kickRatio > 0) {
        const kickRadius = THRUST_VISUAL.KICK_RADIUS * (0.8 + kickRatio * 0.7);
        const kick = ctx.createRadialGradient(0, 0, 0, 0, 0, kickRadius);
        const kickAlpha = THRUST_VISUAL.KICK_ALPHA * kickRatio;
        kick.addColorStop(0, `rgba(255, 230, 200, ${kickAlpha})`);
        kick.addColorStop(1, "rgba(255, 140, 90, 0)");
        ctx.fillStyle = kick;
        ctx.beginPath();
        ctx.arc(0, 0, kickRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      const plumeWidth = THRUST_VISUAL.PLUME_WIDTH * widthScale;
      const plumeGrad = ctx.createLinearGradient(0, 0, 0, plumeLen);
      plumeGrad.addColorStop(0, `rgba(120, 200, 190, ${0.35 + thrustPower * 0.25})`);
      plumeGrad.addColorStop(1, "rgba(120, 200, 190, 0)");
      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.moveTo(-plumeWidth, 0);
      ctx.lineTo(plumeWidth, 0);
      ctx.lineTo(0, plumeLen);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    for (const ox of offsets) {
      ctx.save();
      ctx.translate(ox, baseY);
      ctx.scale(1, direction);

      const time = performance.now();
      ctx.strokeStyle = `rgba(120, 200, 190, ${0.2 + thrustPower * 0.2})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < THRUST_VISUAL.SHIMMER_COUNT; i++) {
        const offsetX = (i - (THRUST_VISUAL.SHIMMER_COUNT - 1) / 2) * THRUST_VISUAL.SHIMMER_WIDTH;
        const wave = Math.sin(time * 0.01 + i) * 2;
        const shimmerLen = heatLen + THRUST_VISUAL.SHIMMER_LENGTH * thrustPower;
        ctx.beginPath();
        ctx.moveTo(offsetX, 2);
        ctx.lineTo(offsetX + wave, shimmerLen);
        ctx.stroke();
      }

      const heatGradient = ctx.createLinearGradient(0, 0, 0, heatLen);
      heatGradient.addColorStop(0, "rgba(255, 200, 140, 0.35)");
      heatGradient.addColorStop(1, "rgba(255, 120, 60, 0)");
      ctx.fillStyle = heatGradient;
      ctx.beginPath();
      ctx.moveTo(-4 * widthScale, 0);
      ctx.lineTo(4 * widthScale, 0);
      ctx.lineTo(0, heatLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 140, 60, 0.85)";
      ctx.beginPath();
      ctx.moveTo(-2 * widthScale, 0);
      ctx.lineTo(2 * widthScale, 0);
      ctx.lineTo(0, outerLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 240, 180, 0.9)";
      ctx.beginPath();
      ctx.moveTo(-1.2 * widthScale, 0);
      ctx.lineTo(1.2 * widthScale, 0);
      ctx.lineTo(0, flameLen);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

}

