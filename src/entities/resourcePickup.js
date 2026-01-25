import { CONFIG } from "../game/config.js";

const { RESOURCE } = CONFIG;
const RESOURCE_SPRITE = new Image();
RESOURCE_SPRITE.src = RESOURCE.SPRITE_SRC;

export class ResourcePickup {
  constructor(x, y, vx, vy, value, spawnTimeMs = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.value = Math.max(RESOURCE.MIN_DROP_VALUE, Math.round(value));
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.6);
    this.spawnTimeMs = spawnTimeMs;
    this.ttlMs = RESOURCE.TTL_MS;
    this.ageMs = 0;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
  }

  draw(ctx) {
    const size = RESOURCE.PICKUP_RADIUS;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (RESOURCE_SPRITE.complete && RESOURCE_SPRITE.naturalWidth > 0) {
      const scale = (size * 2) / RESOURCE_SPRITE.naturalWidth;
      const drawW = RESOURCE_SPRITE.naturalWidth * scale;
      const drawH = RESOURCE_SPRITE.naturalHeight * scale;
      ctx.drawImage(RESOURCE_SPRITE, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = "rgba(120, 220, 180, 0.9)";
      ctx.strokeStyle = "rgba(210, 255, 230, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.8, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (this.ttlMs && this.ttlMs > 0) {
      const remaining = Math.max(0, this.ttlMs - (this.ageMs ?? 0));
      const ratio = Math.max(0, Math.min(1, remaining / this.ttlMs));
      ctx.rotate(-this.rotation);
      ctx.save();
      ctx.strokeStyle = "rgba(170, 255, 210, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();
      ctx.fillStyle = "rgba(220, 255, 230, 0.9)";
      ctx.font = "10px Orbitron, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.ceil(remaining / 1000), 0, size + 14);
      ctx.restore();
    }
    ctx.restore();
  }
}
