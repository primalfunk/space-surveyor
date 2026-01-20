const ROT_SPEED = 2.5;     // radians/sec
const THRUST = 200;
const MAX_FUEL = 400;
const THRUST_FUEL_RATE = 18;
const ROT_FUEL_RATE = THRUST_FUEL_RATE * 0.15;
import { sounds } from "../game/audio.js";

const SHIP_SPRITE = new Image();
SHIP_SPRITE.src = "assets/ui/sprites/ship.png";
const SHIP_DRAW_SIZE = 24;
const THRUST_LOOP_SEGMENT = 0.4;
const THRUST_LOOP_CROSSFADE = 0.16;

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

  update(dt) {
    let rotationInput = 0;
    if (keys["arrowleft"] || keys["a"]) rotationInput -= 1;
    if (keys["arrowright"] || keys["d"]) rotationInput += 1;

    let thrustInput = 0;
    if (keys["arrowup"] || keys["w"]) thrustInput = 1;
    if (keys["arrowdown"] || keys["s"]) thrustInput = -1;

    const fuelCost = (Math.abs(thrustInput) * THRUST_FUEL_RATE + Math.abs(rotationInput) * ROT_FUEL_RATE) * dt;
    if (fuelCost > 0 && this.fuel <= 0) {
      this.thrusting = 0;
      this.stopThrustLoop();
      this.stopRotateLoop();
      return;
    }

    let scale = 1;
    if (fuelCost > 0 && this.fuel < fuelCost) {
      scale = this.fuel / fuelCost;
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

    this.thrusting = thrustInput * scale;
    if (this.thrusting === 0) {
      this.stopThrustLoop();
    }
  }

  draw(ctx) {
    // World-space draw (unused for now)
    this.drawScreen(ctx, this.x, this.y);
  }

  drawScreen(ctx, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.heading);

    if (this.thrusting !== 0) {
      this.drawFlames(ctx, this.thrusting);
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

  drawFlames(ctx, thrusting) {
    const direction = 1;
    const baseY = 10;
    const offsets = [-6, 6];
    const flicker = 0.8 + Math.random() * 0.4;
    const flameLen = 8 * flicker;
    const outerLen = flameLen * 1.2;
    const heatLen = outerLen * 1.6;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const ox of offsets) {
      ctx.save();
      ctx.translate(ox, baseY);
      ctx.scale(1, direction);

      const heatGradient = ctx.createLinearGradient(0, 0, 0, heatLen);
      heatGradient.addColorStop(0, "rgba(255, 200, 140, 0.35)");
      heatGradient.addColorStop(1, "rgba(255, 120, 60, 0)");
      ctx.fillStyle = heatGradient;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, heatLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 140, 60, 0.85)";
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(2, 0);
      ctx.lineTo(0, outerLen);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 240, 180, 0.9)";
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.lineTo(1, 0);
      ctx.lineTo(0, flameLen);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

}

