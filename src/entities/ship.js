const ROT_SPEED = 2.5;     // radians/sec
const THRUST = 200;
const MAX_FUEL = 400;
const THRUST_FUEL_RATE = 18;
const ROT_FUEL_RATE = 0;
import { sounds } from "../game/audio.js";

const SHIP_SPRITE = new Image();
SHIP_SPRITE.src = "assets/ui/sprites/ship.png";
const SHIP_DRAW_SIZE = 24;
const THRUST_LOOP_SEGMENT = 0.4;
const THRUST_LOOP_CROSSFADE = 0.16;
const THRUST_VISUAL = {
  PLUME_BASE: 14,
  PLUME_MAX: 32,
  PLUME_SPEED: 22,
  PLUME_WIDTH: 9,
  KICK_DURATION: 0.14,
  KICK_RADIUS: 10,
  KICK_ALPHA: 0.65,
  SHIMMER_COUNT: 3,
  SHIMMER_LENGTH: 16,
  SHIMMER_WIDTH: 2.6,
  FLARE_RADIUS: 12,
  FLARE_ALPHA: 0.25
};

const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

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
    let rotationInput = 0;
    if (keys["arrowleft"] || keys["a"]) rotationInput -= 1;
    if (keys["arrowright"] || keys["d"]) rotationInput += 1;

    let thrustInput = 0;
    if (keys["arrowup"] || keys["w"]) thrustInput = 1;
    if (keys["arrowdown"] || keys["s"]) thrustInput = -1;

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

  draw(ctx, speed = 0) {
    // World-space draw (unused for now)
    this.drawScreen(ctx, this.x, this.y, speed);
  }

  drawScreen(ctx, sx, sy, speed = 0) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.heading);

    if (this.thrusting !== 0 || this.kickTimer > 0) {
      this.drawFlames(ctx, this.thrusting, speed);
    }
    if (SHIP_SPRITE.complete && SHIP_SPRITE.naturalWidth > 0) {
      const scale = SHIP_DRAW_SIZE / SHIP_SPRITE.naturalHeight;
      const drawW = SHIP_SPRITE.naturalWidth * scale;
      const drawH = SHIP_SPRITE.naturalHeight * scale;
      ctx.drawImage(SHIP_SPRITE, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(8, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();

      ctx.fillStyle = "white";
      ctx.fill();
    }
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

