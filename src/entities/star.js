import { CONFIG } from "../game/config.js";

const { STAR } = CONFIG;
const STAR_SPRITES = {
  yellow: new Image(),
  red: new Image(),
  blue: new Image()
};
STAR_SPRITES.yellow.src = STAR.SPRITES.yellow;
STAR_SPRITES.red.src = STAR.SPRITES.red;
STAR_SPRITES.blue.src = STAR.SPRITES.blue;

const DEFAULTS = STAR.DEFAULTS;

export class Star {
  constructor(x, y, options = {}) {
    const opts = typeof options === "number" ? { mass: options } : options;
    this.x = x;
    this.y = y;
    this.mass = opts.mass ?? DEFAULTS.MASS;
    this.radius = opts.bodyRadius ?? DEFAULTS.BODY_RADIUS;
    this.bodyColor = opts.bodyColor ?? DEFAULTS.BODY_COLOR;
    this.wellFill = opts.wellFill ?? DEFAULTS.WELL_FILL;
    this.wellStroke = opts.wellStroke ?? DEFAULTS.WELL_STROKE;
    this.minimapColor = opts.minimapColor ?? DEFAULTS.MINIMAP_COLOR;
    this.spriteKey = opts.spriteKey ?? DEFAULTS.SPRITE_KEY;
    this.gravityRadius = opts.gravityRadius ?? (this.radius * DEFAULTS.GRAVITY_RADIUS_MULTIPLIER);
    this.rotation = opts.rotation ?? 0;
    this.rotationSpeed = opts.rotationSpeed ?? 0;
    this.pulsePhase = opts.pulsePhase ?? Math.random() * Math.PI * 2;
    this.pulseSpeed = opts.pulseSpeed ?? DEFAULTS.PULSE_SPEED;
    this.pulseAmount = opts.pulseAmount ?? DEFAULTS.PULSE_AMOUNT;
    this.pulseScale = 1;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
    this.pulsePhase += this.pulseSpeed * dt;
    this.pulseScale = 1 + Math.sin(this.pulsePhase) * this.pulseAmount;
  }

  draw(ctx) {
    const gravityRadius = this.gravityRadius;
    if (Number.isFinite(gravityRadius) && gravityRadius > this.radius) {
      ctx.save();
      ctx.fillStyle = this.wellFill;
      ctx.strokeStyle = this.wellStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, gravityRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const glowAlpha = 0.18 + Math.abs(Math.sin(this.pulsePhase)) * 0.2;
    const glowRadius = this.radius * 2.2 * this.pulseScale;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = glowAlpha;
    const glow = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, glowRadius);
    glow.addColorStop(0, this.bodyColor);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const sprite = STAR_SPRITES[this.spriteKey];
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      const scale = ((this.radius * 2) / sprite.naturalWidth) * this.pulseScale;
      const drawW = sprite.naturalWidth * scale;
      const drawH = sprite.naturalHeight * scale;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * this.pulseScale, 0, Math.PI * 2);
      ctx.fillStyle = this.bodyColor;
      ctx.fill();
    }
  }
}

