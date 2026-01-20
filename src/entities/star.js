const STAR_SPRITES = {
  yellow: new Image(),
  red: new Image(),
  blue: new Image()
};
STAR_SPRITES.yellow.src = "assets/ui/sprites/yellow_star.png";
STAR_SPRITES.red.src = "assets/ui/sprites/red_star.png";
STAR_SPRITES.blue.src = "assets/ui/sprites/blue_star.png";

const DEFAULTS = {
  bodyRadius: 60,
  bodyColor: "gold",
  wellFill: "rgba(255, 255, 200, 0.06)",
  wellStroke: "rgba(255, 255, 200, 0.2)",
  minimapColor: "gold",
  spriteKey: "yellow"
};

export class Star {
  constructor(x, y, options = {}) {
    const opts = typeof options === "number" ? { mass: options } : options;
    this.x = x;
    this.y = y;
    this.mass = opts.mass ?? 1500;
    this.radius = opts.bodyRadius ?? DEFAULTS.bodyRadius;
    this.bodyColor = opts.bodyColor ?? DEFAULTS.bodyColor;
    this.wellFill = opts.wellFill ?? DEFAULTS.wellFill;
    this.wellStroke = opts.wellStroke ?? DEFAULTS.wellStroke;
    this.minimapColor = opts.minimapColor ?? DEFAULTS.minimapColor;
    this.spriteKey = opts.spriteKey ?? DEFAULTS.spriteKey;
    this.gravityRadius = opts.gravityRadius ?? (this.radius * 6);
    this.rotation = opts.rotation ?? 0;
    this.rotationSpeed = opts.rotationSpeed ?? 0;
    this.pulsePhase = opts.pulsePhase ?? Math.random() * Math.PI * 2;
    this.pulseSpeed = opts.pulseSpeed ?? 1.0;
    this.pulseAmount = opts.pulseAmount ?? 0.06;
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

