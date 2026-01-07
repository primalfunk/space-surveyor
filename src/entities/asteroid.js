const ASTEROID_SPRITE = new Image();
ASTEROID_SPRITE.src = "assets/ui/sprites/asteroid.png";
const ASTEROID_CHUNK_SPRITE = new Image();
ASTEROID_CHUNK_SPRITE.src = "assets/ui/sprites/asteroid_chunk.png";
const ASTEROID_ROT_SPEED_MIN = 0.05;
const ASTEROID_ROT_SPEED_MAX = 0.18;

export class Asteroid {
  constructor(x, y, vx, vy, radius = 16, rotation = 0, rotationSpeed = null, spriteKey = "asteroid") {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.rotation = rotation;
    this.spriteKey = spriteKey;
    const baseSpeed = rotationSpeed ?? (
      ASTEROID_ROT_SPEED_MIN
      + Math.random() * (ASTEROID_ROT_SPEED_MAX - ASTEROID_ROT_SPEED_MIN)
    );
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * baseSpeed;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    const sprite = this.spriteKey === "chunk" ? ASTEROID_CHUNK_SPRITE : ASTEROID_SPRITE;
    if (sprite.complete && sprite.naturalWidth > 0) {
      const scale = (this.radius * 2) / sprite.naturalWidth;
      const drawW = sprite.naturalWidth * scale;
      const drawH = sprite.naturalHeight * scale;
      ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 180, 180, 0.9)";
      ctx.strokeStyle = "rgba(220, 220, 220, 0.9)";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

