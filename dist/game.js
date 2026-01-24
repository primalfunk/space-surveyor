// ===== FILE: src/game/audio.js =====
(function(){
"use strict";
const SOUND_DEFS = {
  start_game: { src: "assets/sounds/mp3/start_game.mp3", volume: 0.9 },
  laser: { src: "assets/sounds/mp3/laser.mp3", volume: 0.375 },
  enemy_laser: { src: "assets/sounds/mp3/laser.mp3", volume: 0.1875 },
  explosion: { src: "assets/sounds/mp3/explosion.mp3", volume: 0.85 },
  lost_life: { src: "assets/sounds/mp3/lost_life.mp3", volume: 0.9 },
  got_fuel: { src: "assets/sounds/mp3/got_fuel.mp3", volume: 0.8 },
  got_survey: { src: "assets/sounds/mp3/got_survey.mp3", volume: 0.85 },
  game_over: { src: "assets/sounds/mp3/game_over.mp3", volume: 0.9 },
  thrust: { src: "assets/sounds/mp3/thrust.mp3", volume: 0.7 },
  thrust_rotate: { src: "assets/sounds/mp3/thrust.mp3", volume: 0.2 }
};

class SoundManager {
  constructor(defs) {
    this.defs = defs;
    this.pool = new Map();
    this.loopHandles = new Map();
    this.preloaded = false;
  }

  preload() {
    if (this.preloaded) {
      return;
    }
    for (const [key, def] of Object.entries(this.defs)) {
      const audio = new Audio(def.src);
      audio.preload = "auto";
      audio.volume = def.volume ?? 1;
      this.pool.set(key, [audio]);
    }
    this.preloaded = true;
  }

  play(key) {
    const def = this.defs[key];
    if (!def) {
      return;
    }
    let pool = this.pool.get(key);
    if (!pool) {
      pool = [];
      this.pool.set(key, pool);
    }
    let audio = pool.find((entry) => entry.paused || entry.ended);
    if (!audio) {
      audio = new Audio(def.src);
      audio.preload = "auto";
      pool.push(audio);
    }
    audio.volume = def.volume ?? 1;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  startLoop(key, segmentSeconds = 0.4, crossfadeSeconds = 0.16) {
    if (this.loopHandles.has(key)) {
      return;
    }
    const def = this.defs[key];
    if (!def) {
      return;
    }
    const volume = def.volume ?? 1;
    const fadeMs = Math.max(20, crossfadeSeconds * 1000);
    const segmentMs = Math.max(100, segmentSeconds * 1000);
    const intervalMs = Math.max(40, segmentMs - fadeMs);

    const makeAudio = () => {
      const audio = new Audio(def.src);
      audio.preload = "auto";
      audio.volume = volume;
      return audio;
    };

    const a = makeAudio();
    const b = makeAudio();
    let active = a;
    let inactive = b;
    let stopped = false;
    const rafIds = new Set();

    const fade = (audio, from, to, onDone) => {
      const start = performance.now();
      const step = (time) => {
        if (stopped) {
          return;
        }
        const t = Math.min(1, (time - start) / fadeMs);
        audio.volume = from + (to - from) * t;
        if (t < 1) {
          const id = requestAnimationFrame(step);
          rafIds.add(id);
        } else if (onDone) {
          onDone();
        }
      };
      const id = requestAnimationFrame(step);
      rafIds.add(id);
    };

    const startAudio = (audio, fadeIn) => {
      audio.currentTime = 0;
      audio.volume = fadeIn ? 0 : volume;
      audio.play().catch(() => {});
      if (fadeIn) {
        fade(audio, 0, volume);
      }
    };

    const stopAudio = (audio) => {
      const from = audio.volume;
      fade(audio, from, 0, () => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;
      });
    };

    startAudio(active, false);
    const interval = setInterval(() => {
      if (stopped) {
        return;
      }
      startAudio(inactive, true);
      stopAudio(active);
      const next = active;
      active = inactive;
      inactive = next;
    }, intervalMs);

    this.loopHandles.set(key, {
      interval,
      audios: [a, b],
      rafIds,
      stop: () => {
        stopped = true;
        clearInterval(interval);
        for (const id of rafIds) {
          cancelAnimationFrame(id);
        }
        a.pause();
        b.pause();
        a.currentTime = 0;
        b.currentTime = 0;
        a.volume = volume;
        b.volume = volume;
      }
    });
  }

  stopLoop(key) {
    const handle = this.loopHandles.get(key);
    if (!handle) {
      return;
    }
    if (typeof handle.stop === "function") {
      handle.stop();
    } else {
      clearInterval(handle.interval);
      handle.audio.pause();
      handle.audio.currentTime = 0;
    }
    this.loopHandles.delete(key);
  }
}

const sounds = new SoundManager(SOUND_DEFS);

class MusicManager {
  constructor(tracks, volume = 0.5) {
    this.tracks = tracks;
    this.volume = volume;
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.volume = volume;
    this.index = 0;
    this.playing = false;
    this.onEnded = this.onEnded.bind(this);
  }

  onEnded() {
    if (!this.playing) {
      return;
    }
    this.index = (this.index + 1) % this.tracks.length;
    this.playCurrent();
  }

  playCurrent() {
    if (!this.tracks.length) {
      return;
    }
    this.audio.src = this.tracks[this.index];
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {});
  }

  start() {
    if (this.playing || this.tracks.length === 0) {
      return;
    }
    this.playing = true;
    this.audio.addEventListener("ended", this.onEnded);
    this.playCurrent();
  }

  stop() {
    if (!this.playing) {
      return;
    }
    this.playing = false;
    this.audio.removeEventListener("ended", this.onEnded);
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

const music = new MusicManager([
  "assets/sounds/mp3/1. failed_before.mp3",
  "assets/sounds/mp3/2. remind_me_later.mp3",
  "assets/sounds/mp3/3. take_it_easy.mp3",
  "assets/sounds/mp3/4. where_the_time_goes.mp3",
  "assets/sounds/mp3/5. the_noise_in_my_head.mp3",
  "assets/sounds/mp3/6. noonquil.mp3"
], 0.45);
window.sounds = sounds;
window.music = music;
})();
// ===== FILE: src/game/physics.js =====
(function(){
"use strict";
const GRAVITY_G = 4000;
const SOFTENING = 80;
const DAMPING = 0.999;

function applyGravity(entity, stars, dt, debugCb = null) {
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

function integrate(entity, dt) {
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;
}

function applyDamping(entity, dt) {
  entity.vx *= DAMPING;
  entity.vy *= DAMPING;
}
window.applyGravity = applyGravity;
window.integrate = integrate;
window.applyDamping = applyDamping;
window.GRAVITY_G = GRAVITY_G;
})();
// ===== FILE: src/entities/asteroid.js =====
(function(){
"use strict";
const ASTEROID_SPRITE = new Image();
ASTEROID_SPRITE.src = "assets/ui/sprites/asteroid.png";
const ASTEROID_CHUNK_SPRITE = new Image();
ASTEROID_CHUNK_SPRITE.src = "assets/ui/sprites/asteroid_chunk.png";
const ASTEROID_ROT_SPEED_MIN = 0.05;
const ASTEROID_ROT_SPEED_MAX = 0.18;

class Asteroid {
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
window.Asteroid = Asteroid;
})();
// ===== FILE: src/entities/enemyShip.js =====
(function(){
"use strict";
const ENEMY_ROT_SPEED = 2.5;
const ENEMY_THRUST = 120;
const ENEMY_MAX_SPEED = 220;
const ENEMY_STRAFE_RANGE = 520;
const ENEMY_STRAFE_BUFFER = 90;
const ENEMY_DRAW_SIZE = 36;
const ENEMY_SPRITE = new Image();
ENEMY_SPRITE.src = "assets/ui/sprites/enemy_ship.png";

class EnemyShip {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.heading = 0;
    this.fireCooldown = 0;
    this.strafeDir = Math.random() < 0.5 ? -1 : 1;
    this.strafing = false;
  }

  update(dt, targetX, targetY, shouldChase) {
    if (this.fireCooldown > 0) {
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    }
    if (!shouldChase) {
      return;
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (this.strafing) {
      if (dist > ENEMY_STRAFE_RANGE + ENEMY_STRAFE_BUFFER) {
        this.strafing = false;
      }
    } else if (dist < ENEMY_STRAFE_RANGE) {
      this.strafing = true;
    }

    let steerX = dx;
    let steerY = dy;
    if (this.strafing) {
      steerX = -dy * this.strafeDir;
      steerY = dx * this.strafeDir;
    }

    // Heading 0 points "up", so use swapped atan2 to match sin/-cos thrust.
    const desired = Math.atan2(steerX, -steerY);
    let delta = desired - this.heading;
    delta = ((delta + Math.PI) % (Math.PI * 2)) - Math.PI;
    const turn = Math.max(-ENEMY_ROT_SPEED * dt, Math.min(ENEMY_ROT_SPEED * dt, delta));
    this.heading += turn;

    const fx = Math.sin(this.heading);
    const fy = -Math.cos(this.heading);
    this.vx += fx * ENEMY_THRUST * dt;
    this.vy += fy * ENEMY_THRUST * dt;
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > ENEMY_MAX_SPEED) {
      const scale = ENEMY_MAX_SPEED / speed;
      this.vx *= scale;
      this.vy *= scale;
    }
  }

  canFire() {
    return this.fireCooldown <= 0;
  }

  resetFireCooldown(cooldown) {
    this.fireCooldown = cooldown;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.heading);
    if (ENEMY_SPRITE.complete && ENEMY_SPRITE.naturalWidth > 0) {
      const scale = ENEMY_DRAW_SIZE / ENEMY_SPRITE.naturalHeight;
      const drawW = ENEMY_SPRITE.naturalWidth * scale;
      const drawH = ENEMY_SPRITE.naturalHeight * scale;
      ctx.drawImage(ENEMY_SPRITE, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(8, 10);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
      ctx.fill();
    }
    ctx.restore();
  }
}
window.EnemyShip = EnemyShip;
})();
// ===== FILE: src/entities/goal.js =====
(function(){
"use strict";
class Goal {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = new Image();
    this.sprite.src = "assets/ui/sprites/fuel.png";
    this.rotation = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 0.6;
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * speed;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
  }

  draw(ctx) {
    ctx.save();
    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.fillStyle = "rgba(0, 255, 0, 0.25)";
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }

  containsPoint(px, py, margin = 0) {
    return (
      px >= this.x - margin &&
      px <= this.x + this.width + margin &&
      py >= this.y - margin &&
      py <= this.y + this.height + margin
    );
  }
}
window.Goal = Goal;
})();
// ===== FILE: src/entities/endZone.js =====
(function(){
"use strict";

const SCAN_SPRITE = new Image();
SCAN_SPRITE.src = "assets/ui/sprites/scan_point.png";
const SCAN_ROT_SPEED = 2.2;
const SCAN_PULSE_SPEED = 3.2;
const SCAN_PULSE_AMOUNT = 0.08;

class EndZone {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * SCAN_ROT_SPEED;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
    this.pulsePhase += SCAN_PULSE_SPEED * dt;
  }

  draw(ctx, isComplete = false) {
    ctx.save();
    if (SCAN_SPRITE.complete && SCAN_SPRITE.naturalWidth > 0) {
      const pulse = 1 + Math.sin(this.pulsePhase) * SCAN_PULSE_AMOUNT;
      const alphaPulse = 0.6 + (Math.sin(this.pulsePhase) * 0.2);
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;

      ctx.translate(centerX, centerY);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(120, 255, 180, ${0.35 + alphaPulse * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, (this.width * 0.7) * pulse, (this.height * 0.7) * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = alphaPulse;
      ctx.rotate(this.rotation);
      ctx.drawImage(
        SCAN_SPRITE,
        -(this.width * pulse) / 2,
        -(this.height * pulse) / 2,
        this.width * pulse,
        this.height * pulse
      );
      ctx.restore();
    } else {
      ctx.fillStyle = isComplete ? "rgba(80, 255, 120, 0.2)" : "rgba(0, 255, 0, 0.15)";
      ctx.strokeStyle = isComplete ? "rgba(80, 255, 120, 0.9)" : "rgba(0, 255, 0, 0.7)";
      ctx.lineWidth = 2;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    ctx.restore();
  }

  containsPoint(px, py, margin = 0) {
    return (
      px >= this.x - margin &&
      px <= this.x + this.width + margin &&
      py >= this.y - margin &&
      py <= this.y + this.height + margin
    );
  }
}
window.EndZone = EndZone;
})();
// ===== FILE: src/entities/star.js =====
(function(){
"use strict";
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

class Star {
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
window.Star = Star;
})();
// ===== FILE: src/entities/ship.js =====
(function(){
"use strict";
const ROT_SPEED = 2.5;     // radians/sec
const THRUST = 200;
const MAX_FUEL = 400;
const THRUST_FUEL_RATE = 18;
const ROT_FUEL_RATE = 0;

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

class Ship {
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
window.Ship = Ship;
})();
// ===== FILE: src/game/camera.js =====
(function(){
"use strict";
class Camera {
  constructor(ship) {
    this.ship = ship;
    this.zoom = 1;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  applyTransform(ctx, canvas) {
    ctx.save();
    ctx.translate(canvas.width / 2 + this.shakeX, canvas.height / 2 + this.shakeY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.ship.x, -this.ship.y);
  }

  resetTransform(ctx) {
    ctx.restore();
  }
}
window.Camera = Camera;
})();
// ===== FILE: src/game/sectorManager.js =====
(function(){
"use strict";




const SECTOR_SIZE = 6000;
const STAR = {
  MASS_MIN: 1200,
  MASS_MAX: 2200,
  MARGIN: 400
};
const STAR_WELL = {
  BASE_RADIUS: 630,
  VARIANCE: 0.2
};
const STAR_ROTATION = {
  YELLOW_MIN: 0.25,
  YELLOW_MAX: 0.35,
  RED_MIN: 0.4,
  RED_MAX: 0.55,
  BLUE_MIN: 0.6,
  BLUE_MAX: 0.8
};
const STAR_PULSE = {
  YELLOW_SPEED_MIN: 0.7,
  YELLOW_SPEED_MAX: 1.0,
  RED_SPEED_MIN: 0.9,
  RED_SPEED_MAX: 1.2,
  BLUE_SPEED_MIN: 1.1,
  BLUE_SPEED_MAX: 1.5,
  YELLOW_AMOUNT: 0.05,
  RED_AMOUNT: 0.08,
  BLUE_AMOUNT: 0.12
};
const STAR_TYPES = {
  yellow: {
    id: "yellow",
    bodyColor: "gold",
    wellFill: "rgba(255, 255, 200, 0.06)",
    wellStroke: "rgba(255, 255, 200, 0.2)",
    minimapColor: "gold",
    spriteKey: "yellow",
    wellMultiplier: 1.3,
    massMultiplier: 2.5
  },
  red: {
    id: "red",
    bodyColor: "#ff4d4d",
    wellFill: "rgba(255, 80, 80, 0.06)",
    wellStroke: "rgba(255, 80, 80, 0.2)",
    minimapColor: "#ff6b6b",
    spriteKey: "red",
    wellMultiplier: 1.0,
    massMultiplier: 1.0
  },
  blue: {
    id: "blue",
    bodyColor: "#66ccff",
    wellFill: "rgba(120, 180, 255, 0.06)",
    wellStroke: "rgba(120, 180, 255, 0.2)",
    minimapColor: "#7ad2ff",
    spriteKey: "blue",
    wellMultiplier: 1.69,
    massMultiplier: 4.0
  }
};
const GOAL = {
  WIDTH: 12,
  HEIGHT: 24,
  MARGIN: 300,
  MIN_SHIP_DIST: 900,
  MIN_STAR_DIST: 300
};
const ASTEROIDS = {
  COUNT: 12,
  SPEED_MIN: 5,
  SPEED_MAX: 120,
  RADIUS_MIN: 10,
  RADIUS_MAX: 44,
  SPAWN_MARGIN: 400
};

const END_ZONE = {
  WIDTH: 30,
  HEIGHT: 16,
  MARGIN: 120,
  MIN_GOAL_DIST: 600
};

function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

function randomInt(rng, min, maxInclusive) {
  return Math.floor(randomRange(rng, min, maxInclusive + 1));
}

function randomPointInBounds(rng, bounds, margin) {
  return {
    x: randomRange(rng, bounds.x + margin, bounds.x + bounds.size - margin),
    y: randomRange(rng, bounds.y + margin, bounds.y + bounds.size - margin)
  };
}

function applyVariance(value, variance) {
  const factor = 1 - variance + Math.random() * (variance * 2);
  return value * factor;
}

function getStarTypeConfig(typeId) {
  return STAR_TYPES[typeId] ?? STAR_TYPES.red;
}

function getStarRotationRange(typeId) {
  if (typeId === "blue") {
    return [STAR_ROTATION.BLUE_MIN, STAR_ROTATION.BLUE_MAX];
  }
  if (typeId === "red") {
    return [STAR_ROTATION.RED_MIN, STAR_ROTATION.RED_MAX];
  }
  return [STAR_ROTATION.YELLOW_MIN, STAR_ROTATION.YELLOW_MAX];
}

function getStarPulseConfig(typeId) {
  if (typeId === "blue") {
    return {
      speedMin: STAR_PULSE.BLUE_SPEED_MIN,
      speedMax: STAR_PULSE.BLUE_SPEED_MAX,
      amount: STAR_PULSE.BLUE_AMOUNT
    };
  }
  if (typeId === "red") {
    return {
      speedMin: STAR_PULSE.RED_SPEED_MIN,
      speedMax: STAR_PULSE.RED_SPEED_MAX,
      amount: STAR_PULSE.RED_AMOUNT
    };
  }
  return {
    speedMin: STAR_PULSE.YELLOW_SPEED_MIN,
    speedMax: STAR_PULSE.YELLOW_SPEED_MAX,
    amount: STAR_PULSE.YELLOW_AMOUNT
  };
}

const ZONES = {
  start: { id: "start", asteroidMultiplier: 0.5 },
  middle: { id: "middle", asteroidMultiplier: 1.0 },
  outer: { id: "outer", asteroidMultiplier: 1.3 }
};

function getZoneConfig(ring) {
  if (ring === 0) {
    return ZONES.start;
  }
  if (ring === 1) {
    return ZONES.middle;
  }
  return ZONES.outer;
}

function getStarCountsForRing(ring) {
  if (ring === 0) {
    return {
      red: { min: 1, max: 1 },
      yellow: { min: 0, max: 0 },
      blue: { min: 0, max: 0 }
    };
  }
  if (ring === 1) {
    return {
      red: { min: 1, max: 2 },
      yellow: { min: 1, max: 2 },
      blue: { min: 0, max: 0 }
    };
  }
  if (ring === 2) {
    return {
      red: { min: 2, max: 3 },
      yellow: { min: 2, max: 3 },
      blue: { min: 1, max: 1 }
    };
  }
  return {
    red: { min: ring, max: ring + 1 },
    yellow: { min: ring, max: ring + 1 },
    blue: { min: ring - 2, max: ring - 1 }
  };
}

function generateStars(rng, bounds, ring, safePoint, safeRadius) {
  const stars = [];
  const counts = getStarCountsForRing(ring);
  const entries = [
    {
      type: "red",
      count: randomInt(rng, counts.red.min, counts.red.max)
    },
    {
      type: "yellow",
      count: randomInt(rng, counts.yellow.min, counts.yellow.max)
    },
    {
      type: "blue",
      count: randomInt(rng, counts.blue.min, counts.blue.max)
    }
  ];

  for (const entry of entries) {
    const type = getStarTypeConfig(entry.type);
    for (let i = 0; i < entry.count; i++) {
      const baseMass = randomRange(rng, STAR.MASS_MIN, STAR.MASS_MAX);
      const mass = applyVariance(baseMass * type.massMultiplier, STAR_WELL.VARIANCE);
      const gravityRadius = applyVariance(
        STAR_WELL.BASE_RADIUS * type.wellMultiplier,
        STAR_WELL.VARIANCE
      );
      const [rotMin, rotMax] = getStarRotationRange(type.id);
      const rotSpeed = randomRange(rng, rotMin, rotMax) * (rng() < 0.5 ? -1 : 1);
      const pulseCfg = getStarPulseConfig(type.id);
      const pulseSpeed = randomRange(rng, pulseCfg.speedMin, pulseCfg.speedMax);
      const pulseAmount = pulseCfg.amount;

      let pos = randomPointInBounds(rng, bounds, STAR.MARGIN);
      for (let tries = 0; tries < 30; tries++) {
        if (!safePoint) {
          break;
        }
        const dx = pos.x - safePoint.x;
        const dy = pos.y - safePoint.y;
        const minDist = Math.max(safeRadius, gravityRadius + 200);
        if (Math.hypot(dx, dy) >= minDist) {
          break;
        }
        pos = randomPointInBounds(rng, bounds, STAR.MARGIN);
      }

      stars.push(new Star(pos.x, pos.y, {
        mass,
        gravityRadius,
        bodyColor: type.bodyColor,
        wellFill: type.wellFill,
        wellStroke: type.wellStroke,
        minimapColor: type.minimapColor,
        spriteKey: type.spriteKey,
        rotationSpeed: rotSpeed,
        pulseSpeed,
        pulseAmount
      }));
    }
  }
  return stars;
}

function generateEndZone(rng, bounds, goalX, goalY) {
  const edges = ["north", "south", "west", "east"];
  let zone = null;

  for (let i = 0; i < 12; i++) {
    const edge = edges[randomInt(rng, 0, edges.length - 1)];
    let x = bounds.x + END_ZONE.MARGIN;
    let y = bounds.y + END_ZONE.MARGIN;

    if (edge == "north") {
      x = randomRange(rng, bounds.x + END_ZONE.MARGIN, bounds.x + bounds.size - END_ZONE.MARGIN - END_ZONE.WIDTH);
      y = bounds.y + END_ZONE.MARGIN;
    } else if (edge == "south") {
      x = randomRange(rng, bounds.x + END_ZONE.MARGIN, bounds.x + bounds.size - END_ZONE.MARGIN - END_ZONE.WIDTH);
      y = bounds.y + bounds.size - END_ZONE.MARGIN - END_ZONE.HEIGHT;
    } else if (edge == "west") {
      x = bounds.x + END_ZONE.MARGIN;
      y = randomRange(rng, bounds.y + END_ZONE.MARGIN, bounds.y + bounds.size - END_ZONE.MARGIN - END_ZONE.HEIGHT);
    } else {
      x = bounds.x + bounds.size - END_ZONE.MARGIN - END_ZONE.WIDTH;
      y = randomRange(rng, bounds.y + END_ZONE.MARGIN, bounds.y + bounds.size - END_ZONE.MARGIN - END_ZONE.HEIGHT);
    }

    const dx = x - goalX;
    const dy = y - goalY;
    if (Math.hypot(dx, dy) < END_ZONE.MIN_GOAL_DIST) {
      continue;
    }

    zone = new EndZone(x, y, END_ZONE.WIDTH, END_ZONE.HEIGHT);
    break;
  }

  if (!zone) {
    zone = new EndZone(
      bounds.x + bounds.size - END_ZONE.MARGIN - END_ZONE.WIDTH,
      bounds.y + bounds.size - END_ZONE.MARGIN - END_ZONE.HEIGHT,
      END_ZONE.WIDTH,
      END_ZONE.HEIGHT
    );
  }

  return zone;
}

function generateGoal(rng, bounds, shipX, shipY, stars) {
  let goalX = bounds.x + bounds.size / 2 - GOAL.WIDTH / 2;
  let goalY = bounds.y + bounds.size / 2 - GOAL.HEIGHT / 2;

  for (let i = 0; i < 20; i++) {
    const pos = randomPointInBounds(rng, bounds, GOAL.MARGIN);
    const gx = pos.x;
    const gy = pos.y;

    const shipDx = gx - shipX;
    const shipDy = gy - shipY;
    if (Math.hypot(shipDx, shipDy) < GOAL.MIN_SHIP_DIST) {
      continue;
    }

    let tooClose = false;
    for (const star of stars) {
      const dx = gx - star.x;
      const dy = gy - star.y;
      if (Math.hypot(dx, dy) < GOAL.MIN_STAR_DIST) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) {
      continue;
    }

    goalX = gx;
    goalY = gy;
    break;
  }

  return new Goal(goalX, goalY, GOAL.WIDTH, GOAL.HEIGHT);
}

function generateAsteroids(rng, bounds, shipX, shipY, viewRadius, asteroidMultiplier, safePoint, safeRadius) {
  const asteroids = [];
  const count = Math.max(1, Math.round(ASTEROIDS.COUNT * asteroidMultiplier));
  for (let i = 0; i < count; i++) {
    let pos = null;
    let vx = 0;
    let vy = 0;
    for (let tries = 0; tries < 40; tries++) {
      const candidate = randomPointInBounds(rng, bounds, ASTEROIDS.SPAWN_MARGIN);
      const dx = candidate.x - shipX;
      const dy = candidate.y - shipY;
      const minSpawnDist = viewRadius + ASTEROIDS.SPAWN_MARGIN;
      if (Math.hypot(dx, dy) < minSpawnDist) {
        continue;
      }

      const travelAngle = randomRange(rng, 0, Math.PI * 2);
      const speed = randomRange(rng, ASTEROIDS.SPEED_MIN, ASTEROIDS.SPEED_MAX);
      const testVx = Math.cos(travelAngle) * speed;
      const testVy = Math.sin(travelAngle) * speed;

      if (safePoint) {
        const sx = safePoint.x - candidate.x;
        const sy = safePoint.y - candidate.y;
        const dist = Math.hypot(sx, sy);
        if (dist < safeRadius) {
          continue;
        }
        const dot = testVx * sx + testVy * sy;
        const cos = dist > 0 ? dot / (speed * dist) : 0;
        if (cos > 0.7) {
          continue;
        }
      }

      pos = candidate;
      vx = testVx;
      vy = testVy;
      break;
    }

    if (!pos) {
      pos = randomPointInBounds(rng, bounds, ASTEROIDS.SPAWN_MARGIN);
      const travelAngle = randomRange(rng, 0, Math.PI * 2);
      const speed = randomRange(rng, ASTEROIDS.SPEED_MIN, ASTEROIDS.SPEED_MAX);
      vx = Math.cos(travelAngle) * speed;
      vy = Math.sin(travelAngle) * speed;
    }

    const radius = randomRange(rng, ASTEROIDS.RADIUS_MIN, ASTEROIDS.RADIUS_MAX);

    asteroids.push(new Asteroid(pos.x, pos.y, vx, vy, radius));
  }
  return asteroids;
}

class SectorManager {
  constructor(safePoint = null, safeRadius = 0) {
    this.current = null;
    this.sectors = new Map();
    this.safePoint = safePoint;
    this.safeRadius = safeRadius;
  }

  getSectorAt(sx, sy, viewRadius, shipX, shipY) {
    const key = `${sx},${sy}`;
    if (this.sectors.has(key)) {
      return this.sectors.get(key);
    }

    const rng = Math.random;
    const ring = Math.max(Math.abs(sx), Math.abs(sy));
    const bounds = {
      x: sx * SECTOR_SIZE,
      y: sy * SECTOR_SIZE,
      size: SECTOR_SIZE
    };
    const zone = getZoneConfig(ring);
    const useSafePoint = (ring === 0) ? this.safePoint : null;
    const safeRadius = (ring === 0) ? this.safeRadius : 0;
    const stars = generateStars(rng, bounds, ring, useSafePoint, safeRadius);
    const goal = generateGoal(rng, bounds, shipX, shipY, stars);
    const endZone = generateEndZone(rng, bounds, goal.x, goal.y);
    const asteroids = generateAsteroids(
      rng,
      bounds,
      shipX,
      shipY,
      viewRadius,
      zone.asteroidMultiplier,
      useSafePoint,
      safeRadius
    );

    const sector = {
      sx,
      sy,
      bounds,
      zone: zone.id,
      stars,
      goal,
      endZone,
      asteroids,
      goalCollected: true,
      goalDelivered: false
    };
    this.sectors.set(key, sector);
    return sector;
  }

  getSectorForPosition(x, y, viewRadius, shipX, shipY) {
    const sx = Math.floor(x / SECTOR_SIZE);
    const sy = Math.floor(y / SECTOR_SIZE);
    this.current = this.getSectorAt(sx, sy, viewRadius, shipX, shipY);
    return this.current;
  }

  getSectorsAround(x, y, viewRadius, shipX, shipY, range = 1) {
    const sx = Math.floor(x / SECTOR_SIZE);
    const sy = Math.floor(y / SECTOR_SIZE);
    const sectors = [];
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        sectors.push(this.getSectorAt(sx + dx, sy + dy, viewRadius, shipX, shipY));
      }
    }
    return sectors;
  }
}
window.SectorManager = SectorManager;
window.SECTOR_SIZE = SECTOR_SIZE;
})();
// ===== FILE: src/ui/startScreen.js =====
(function(){
"use strict";

function showStartScreen(root, onStart) {
  if (!root) {
    return null;
  }

  sounds.preload();

  const overlay = document.createElement("div");
  overlay.className = "overlay start-screen";

  const panel = document.createElement("div");
  panel.className = "start-panel";

  const title = document.createElement("div");
  title.className = "start-title";
  title.textContent = "Space Surveyor";

  const subtitle = document.createElement("div");
  subtitle.className = "start-subtitle";
  subtitle.textContent = "";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "start-button start-capsule";
  button.textContent = "Press Space to Start";

  const blurb = document.createElement("div");
  blurb.className = "start-blurb";
  blurb.textContent = "Conserve fuel. Survey unknown systems. Chart your legacy.";

  const carousel = document.createElement("div");
  carousel.className = "start-carousel";

  const slides = [];
  const addSlide = (content) => {
    const slide = document.createElement("div");
    slide.className = "start-slide";
    slide.appendChild(content);
    carousel.appendChild(slide);
    slides.push(slide);
  };

  const controls = document.createElement("div");
  controls.className = "start-card start-controls";
  const controlsTitle = document.createElement("div");
  controlsTitle.className = "start-controls-title";
  controlsTitle.textContent = "Flight Controls";
  const controlsList = document.createElement("div");
  controlsList.className = "start-controls-list";
  const controlEntries = [
    { keys: "WASD / ARROWS", desc: "Steer and thrust" },
    { keys: "TOUCH", desc: "Left stick to steer/thrust, right button to fire" },
    { keys: "M", desc: "Toggle mouse aim" },
    { keys: "MOUSE", desc: "Aim / LMB fire / RMB thrust" },
    { keys: "Z / X", desc: "Zoom Camera out / in" },
    { keys: "Q (OUT OF FUEL)", desc: "Terminate when stranded" },
    { keys: "ESC", desc: "Return to start" }
  ];
  for (const entry of controlEntries) {
    const row = document.createElement("div");
    row.className = "start-controls-item";
    const keys = document.createElement("div");
    keys.className = "start-controls-keys";
    keys.textContent = entry.keys;
    const desc = document.createElement("div");
    desc.className = "start-controls-desc";
    desc.textContent = entry.desc;
    row.appendChild(keys);
    row.appendChild(desc);
    controlsList.appendChild(row);
  }
  controls.appendChild(controlsTitle);
  controls.appendChild(controlsList);
  addSlide(controls);

  const legend = document.createElement("div");
  legend.className = "start-card start-legend";
  const legendTitle = document.createElement("div");
  legendTitle.className = "start-legend-title";
  legendTitle.textContent = "Field Legend";
  legend.appendChild(legendTitle);

  const legendList = document.createElement("div");
  legendList.className = "start-legend-list";
  const legendEntries = [
    {
      icon: "ship",
      name: "Player - Surveyor Class",
      desc: "Pilot this craft. Dodge hazards, deliver surveys."
    },
    {
      icon: "star",
      name: "Stars - Gravity Wells",
      desc: "Pull you in. Avoid the core."
    },
    {
      icon: "asteroid",
      name: "Asteroids - Drift Rocks",
      desc: "Shoot for points. Fragments still hurt."
    },
    {
      icon: "enemy",
      name: "Enemy Ships - Raiders",
      desc: "Hunt you down. Take them out for bonus."
    },
    {
      icon: "fuel",
      name: "Fuel - Charge Pods",
      desc: "Refill tank to keep thrusting."
    },
    {
      icon: "survey",
      name: "Survey Sites - Drop Zones",
      desc: "Deliver surveys to score and advance."
    }
  ];

  for (const entry of legendEntries) {
    const item = document.createElement("div");
    item.className = "start-legend-item";

    const icon = document.createElement("div");
    icon.className = `start-legend-icon legend-${entry.icon}`;

    const text = document.createElement("div");
    text.className = "start-legend-text";

    const name = document.createElement("div");
    name.className = "start-legend-name";
    name.textContent = entry.name;

    const desc = document.createElement("div");
    desc.className = "start-legend-desc";
    desc.textContent = entry.desc;

    text.appendChild(name);
    text.appendChild(desc);
    item.appendChild(icon);
    item.appendChild(text);
    legendList.appendChild(item);
  }
  legend.appendChild(legendList);
  addSlide(legend);

  const scores = document.createElement("div");
  scores.className = "start-card start-scores";
  const scoresTitle = document.createElement("div");
  scoresTitle.className = "start-scores-title";
  scoresTitle.textContent = "High Scores";
  const scoresList = document.createElement("div");
  scoresList.className = "start-scores-list";
  const defaultScores = [
    { name: "WINGTIP", score: 75000 },
    { name: "WINGTIP", score: 52000 },
    { name: "WINGTIP", score: 37000 },
    { name: "WINGTIP", score: 23300 },
    { name: "WINGTIP", score: 12500 },
    { name: "WINGTIP", score: 5900 },
    { name: "WINGTIP", score: 3800 },
    { name: "WINGTIP", score: 1400 },
    { name: "WINGTIP", score: 600 },
    { name: "WINGTIP", score: 100 }
  ];

  const renderScores = (entries) => {
    scoresList.innerHTML = "";
    const list = Array.isArray(entries) ? entries.slice(0, 10) : [];
    const padded = list.length ? list.slice() : defaultScores.slice(0, 10);
    while (padded.length < 10) {
      padded.push({ name: "---", score: 0 });
    }

    padded.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "start-scores-row";
      const rank = document.createElement("div");
      rank.className = "start-scores-rank";
      rank.textContent = `${index + 1}.`;
      const name = document.createElement("div");
      name.className = "start-scores-name";
      name.textContent = entry.name || "---";
      const value = document.createElement("div");
      value.className = "start-scores-value";
      const numericScore = Number(entry.score);
      value.textContent = Number.isFinite(numericScore)
        ? numericScore.toLocaleString("en-US")
        : "0";
      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(value);
      scoresList.appendChild(row);
    });
  };

  renderScores(defaultScores);
  scores.appendChild(scoresTitle);
  scores.appendChild(scoresList);
  addSlide(scores);

  const loadScores = async () => {
    try {
      const res = await fetch("/api/score/");
      if (!res.ok) {
        throw new Error("fetch failed");
      }
      const data = await res.json();
      renderScores(data);
    } catch (err) {
      renderScores([]);
    }
  };

  loadScores();

  let slideIndex = 0;
  slides[slideIndex].classList.add("is-active");
  const slideTimer = setInterval(() => {
    slides[slideIndex].classList.remove("is-active");
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add("is-active");
  }, 6000);

  panel.appendChild(title);
  panel.appendChild(subtitle);
  panel.appendChild(carousel);
  panel.appendChild(button);
  panel.appendChild(blurb);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  const bgLayer = document.createElement("div");
  bgLayer.className = "start-bg-layer";
  overlay.appendChild(bgLayer);

  const credit = document.createElement("div");
  credit.className = "start-credit";
  credit.innerHTML = 'a game by <span class="start-subtitle-name">Jared Menard</span> &middot; All Rights Reserved';
  overlay.appendChild(credit);

  const bgObjects = createBackgroundObjects(bgLayer, 6, 4);

  let started = false;
  const start = () => {
    if (started) {
      return;
    }
    started = true;
    sounds.play("start_game");
    cleanup();
    if (onStart) {
      onStart();
    }
  };

  const onKeyDown = (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      start();
    }
  };

  button.addEventListener("click", start);
  window.addEventListener("keydown", onKeyDown);

  function cleanup() {
    window.removeEventListener("keydown", onKeyDown);
    button.removeEventListener("click", start);
    for (const obj of bgObjects) {
      obj.stop();
    }
    clearInterval(slideTimer);
    overlay.remove();
  }

  return {
    destroy: cleanup,
    start
  };
}

function createBackgroundObjects(layer, starCount, asteroidCount) {
  const objects = [];
  const addObject = (className, sizeRange, speedRange) => {
    const el = document.createElement("div");
    el.className = `start-bg-object ${className}`;
    const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    const startX = Math.random() * 120 - 10;
    const startY = Math.random() * 120 - 10;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${startX}%`;
    el.style.top = `${startY}%`;
    layer.appendChild(el);

    let angle = Math.random() * Math.PI * 2;
    let speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
    let driftX = Math.cos(angle) * speed;
    let driftY = Math.sin(angle) * speed;
    let translateX = 0;
    let translateY = 0;
    let lastTime = performance.now();
    let raf = 0;

    const step = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      translateX += driftX * dt;
      translateY += driftY * dt;

      if (translateX > 140 || translateX < -140) {
        driftX *= -1;
      }
      if (translateY > 140 || translateY < -140) {
        driftY *= -1;
      }

      el.style.transform = `translate(${translateX}px, ${translateY}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return {
      stop: () => cancelAnimationFrame(raf)
    };
  };

  for (let i = 0; i < starCount; i++) {
    objects.push(addObject("bg-star", [6, 16], [6, 14]));
  }
  for (let i = 0; i < asteroidCount; i++) {
    objects.push(addObject("bg-asteroid", [10, 22], [4, 9]));
  }

  return objects;
}
window.showStartScreen = showStartScreen;
})();
// ===== FILE: src/ui/gameoverModal.js =====
(function(){
"use strict";
const SCORE_ENDPOINT = "/api/score/";
const MIN_QUALIFY_SCORE = 100;
const NAME_MAX_LENGTH = 12;

function qualifies(score, scores) {
  if (score < MIN_QUALIFY_SCORE) {
    return false;
  }
  if (!Array.isArray(scores) || scores.length < 10) {
    return true;
  }
  const tenth = scores[9]?.score ?? 0;
  return score >= tenth;
}

function sanitizeName(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "")
    .slice(0, NAME_MAX_LENGTH);
}

function renderLeaderboard(scores) {
  const wrap = document.createElement("div");
  wrap.className = "leaderboard-wrap";

  const title = document.createElement("div");
  title.className = "leaderboard-title";
  title.textContent = "High Scores";
  wrap.appendChild(title);

  const list = document.createElement("div");
  list.className = "leaderboard-list";

  const entries = Array.isArray(scores) ? scores.slice(0, 10) : [];
  const padded = entries.slice();
  while (padded.length < 10) {
    padded.push({ name: "---", score: 0 });
  }

  padded.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    if (entry.isNew) {
      row.classList.add("is-new");
    }

    const rank = document.createElement("div");
    rank.className = "leaderboard-rank";
    rank.textContent = `${index + 1}.`;

    const name = document.createElement("div");
    name.className = "leaderboard-name";
    name.textContent = entry.name || "---";

    const value = document.createElement("div");
    value.className = "leaderboard-score";
    const numericScore = Number(entry.score);
    value.textContent = Number.isFinite(numericScore)
      ? numericScore.toLocaleString("en-US")
      : "0";

    row.appendChild(rank);
    row.appendChild(name);
    row.appendChild(value);
    list.appendChild(row);
  });

  wrap.appendChild(list);
  return wrap;
}

function showGameOverModal(root, stats, onClose) {
  if (!root) {
    return null;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay gameover-modal";

  const panel = document.createElement("div");
  panel.className = "gameover-panel";

  const title = document.createElement("div");
  title.className = "gameover-title";
  title.textContent = "Game Over";

  const subtitle = document.createElement("div");
  subtitle.className = "gameover-subtitle";
  subtitle.textContent = "Loading leaderboard...";

  panel.appendChild(title);
  if (stats) {
    const statsWrap = document.createElement("div");
    statsWrap.className = "gameover-stats";

    const scoreLine = document.createElement("div");
    scoreLine.textContent = `Score: ${Math.round(stats.score || 0)}`;

    const distanceLine = document.createElement("div");
    const distance = Math.round(stats.distanceTraveled || 0);
    distanceLine.textContent = `Distance: ${distance}u`;

    const timeLine = document.createElement("div");
    const time = (stats.timeSpent || 0).toFixed(1);
    timeLine.textContent = `Time: ${time}s`;

    const surveyedLine = document.createElement("div");
    surveyedLine.textContent = `Surveyed: ${stats.surveyed || 0}`;

    statsWrap.appendChild(scoreLine);
    statsWrap.appendChild(distanceLine);
    statsWrap.appendChild(timeLine);
    statsWrap.appendChild(surveyedLine);
    panel.appendChild(statsWrap);
  }
  const content = document.createElement("div");
  content.className = "gameover-content";

  panel.appendChild(subtitle);
  panel.appendChild(content);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  let closed = false;
  let canClose = true;
  const close = () => {
    if (closed || !canClose) {
      return;
    }
    closed = true;
    cleanup();
    if (onClose) {
      onClose();
    }
  };

  const onKeyDown = (event) => {
    if (canClose) {
      event.preventDefault();
      close();
    }
  };

  overlay.addEventListener("pointerdown", close);
  window.addEventListener("keydown", onKeyDown);

  const finalScore = Math.round(stats?.score || 0);

  const showError = (message) => {
    subtitle.textContent = message;
    canClose = true;
  };

  const showLeaderboard = (scores) => {
    content.innerHTML = "";
    content.appendChild(renderLeaderboard(scores));
    subtitle.textContent = "Press any key to return";
    canClose = true;
  };

  const showEntryForm = (scores) => {
    canClose = false;
    subtitle.textContent = "New High Score!";
    content.innerHTML = "";

    const entryWrap = document.createElement("div");
    entryWrap.className = "score-entry";

    const label = document.createElement("div");
    label.className = "score-entry-label";
    label.textContent = "Enter Callsign";

    const input = document.createElement("input");
    input.className = "score-entry-input";
    input.type = "text";
    input.maxLength = NAME_MAX_LENGTH;
    input.placeholder = "AAA";
    input.value = "";

    input.addEventListener("input", () => {
      input.value = sanitizeName(input.value);
    });

    const actions = document.createElement("div");
    actions.className = "score-entry-actions";

    const submit = document.createElement("button");
    submit.type = "button";
    submit.className = "score-entry-button";
    submit.textContent = "OK";

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "score-entry-button ghost";
    cancel.textContent = "Cancel";

    actions.appendChild(submit);
    actions.appendChild(cancel);

    entryWrap.appendChild(label);
    entryWrap.appendChild(input);
    entryWrap.appendChild(actions);
    content.appendChild(entryWrap);
    content.appendChild(renderLeaderboard(scores));

    input.focus();

    const submitScore = async () => {
      const name = sanitizeName(input.value) || "ANON";
      submit.disabled = true;
      cancel.disabled = true;
      try {
        const res = await fetch(SCORE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, score: finalScore })
        });
        if (!res.ok) {
          throw new Error("submit failed");
        }
      } catch (err) {
        showError("Score submission failed");
        return;
      }

      let updated = [];
      try {
        const res = await fetch(SCORE_ENDPOINT);
        if (res.ok) {
          updated = await res.json();
        }
      } catch (err) {
        showError("Score submission failed");
        return;
      }

      const highlight = updated.map((entry) => ({ ...entry }));
      const matchIndex = highlight.findIndex(
        (entry) => entry.name === name && entry.score === finalScore
      );
      if (matchIndex >= 0) {
        highlight[matchIndex] = { ...highlight[matchIndex], isNew: true };
      }
      showLeaderboard(highlight);
    };

    submit.addEventListener("click", submitScore);
    cancel.addEventListener("click", () => {
      showLeaderboard(scores);
    });
  };

  const loadLeaderboard = async () => {
    if (finalScore < MIN_QUALIFY_SCORE) {
      subtitle.textContent = `Score below ${MIN_QUALIFY_SCORE}. Press any key to return`;
      content.innerHTML = "";
      canClose = true;
      return;
    }

    let scores = [];
    try {
      const res = await fetch(SCORE_ENDPOINT);
      if (!res.ok) {
        throw new Error("fetch failed");
      }
      scores = await res.json();
    } catch (err) {
      showError("Leaderboard unavailable");
      return;
    }

    if (qualifies(finalScore, scores)) {
      showEntryForm(scores);
    } else {
      showLeaderboard(scores);
    }
  };

  loadLeaderboard();

  function cleanup() {
    overlay.removeEventListener("pointerdown", close);
    window.removeEventListener("keydown", onKeyDown);
    overlay.remove();
  }

  return {
    destroy: cleanup,
    close
  };
}
window.showGameOverModal = showGameOverModal;
})();
// ===== FILE: src/ui/levelCompleteModal.js =====
(function(){
"use strict";
function showLevelCompleteModal(root, onClose) {
  if (!root) {
    return null;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay level-complete-modal";

  const panel = document.createElement("div");
  panel.className = "level-complete-panel";

  const title = document.createElement("div");
  title.className = "level-complete-title";
  title.textContent = "Level Complete";

  const subtitle = document.createElement("div");
  subtitle.className = "level-complete-subtitle";
  subtitle.textContent = "Press any key to return";

  panel.appendChild(title);
  panel.appendChild(subtitle);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  let closed = false;
  const close = () => {
    if (closed) {
      return;
    }
    closed = true;
    cleanup();
    if (onClose) {
      onClose();
    }
  };

  const onKeyDown = (event) => {
    event.preventDefault();
    close();
  };

  overlay.addEventListener("pointerdown", close);
  window.addEventListener("keydown", onKeyDown);

  function cleanup() {
    overlay.removeEventListener("pointerdown", close);
    window.removeEventListener("keydown", onKeyDown);
    overlay.remove();
  }

  return {
    destroy: cleanup,
    close
  };
}
window.showLevelCompleteModal = showLevelCompleteModal;
})();
// ===== FILE: src/game/gameLoop.js =====
(function(){
"use strict";







const DEBUG = {
  VECTORS: true
};

const ZOOM = {
  MIN: 0.4,
  MAX: 2.0,
  SPEED: 0.7,
  WHEEL_STEP: 0.12
};

const MINIMAP = {
  SIZE: 200,
  RANGE: 3000  // world units visible from ship
};

const COMPASS = {
  WIDTH: 320,
  HEIGHT: 78,
  Y_OFFSET: 55,
  FOV: Math.PI,
  TICK_DEG: 15
};

const BEARING = {
  RADIUS: 36,
  CHEVRON_LENGTH: 9,
  CHEVRON_WIDTH: 5,
  CHEVRON_GAP: 7,
  DRIFT_AMPLITUDE: 4,
  DRIFT_SPEED: 0.0035,
  PULSE_SPEED: 0.0045,
  FUEL_SIZE: 3,
  SCAN_PRIMARY_ALPHA: 0.8,
  SCAN_SECONDARY_ALPHA: 0.45,
  FUEL_ALPHA: 0.3,
  DANGER_ALPHA: 0.85,
  DANGER_PULSE_SPEED: 0.012,
  DANGER_FLICKER_SPEED: 0.045,
  DANGER_DRIFT_SPEED: 0.006,
  FUEL_MAX_DOTS: 3
};
const SCAN_PULSE = {
  PERIOD: 2400,
  RADIUS_MIN: 16,
  RADIUS_MAX: 160,
  LINE_WIDTH: 2
};

const ACTIVE_SECTOR_RANGE = 1;

const START_SAFE_RADIUS = 1600;
const FUEL_PICKUP_AMOUNT_RATIO = 1.0;
const STARTING_LIVES = 3;
const INVULN_DURATION = 1.25;
const GAME_OVER_DELAY = 0.7;
const RESPAWN_DELAY = 0.6;
const SCORE_CHUNK_MULTIPLIER = 0.5;
const SCORE_POINTS = {
  ASTEROID: 5,
  ENEMY: 25,
  FUEL: 15,
  SURVEY: 40
};

const STARFIELD = {
  DENSITY: 0.002,
  ALPHA: 0.45,
  BRIGHTNESS_MIN: 180,
  BRIGHTNESS_MAX: 255
};
const DUSTFIELD = {
  DENSITY: 0.0012,
  ALPHA: 0.22,
  BRIGHTNESS_MIN: 80,
  BRIGHTNESS_MAX: 160
};
const FARFIELD = {
  DENSITY: 0.0007,
  ALPHA: 0.18,
  BRIGHTNESS_MIN: 110,
  BRIGHTNESS_MAX: 190
};
const BULLET = {
  SPEED: 900,
  LIFE: 1.2,
  COOLDOWN: 0.18
};
const ENEMY = {
  FIRE_COOLDOWN: BULLET.COOLDOWN * 3,
  SPAWN_MARGIN: 120
};
const PLAYER_EFFECTIVE_RANGE = BULLET.SPEED * BULLET.LIFE;
const ENEMY_RANGE_SCALE = 2 / 3;
const ENEMY_EFFECTIVE_RANGE = PLAYER_EFFECTIVE_RANGE * ENEMY_RANGE_SCALE;
const ENEMY_FIRE_RANGE = ENEMY_EFFECTIVE_RANGE * 1.1;
const ENEMY_BULLET_LIFE = BULLET.LIFE * ENEMY_RANGE_SCALE;
const ENEMY_HIT_RADIUS = 12;
const ENEMY_CHUNK_SPRITE = new Image();
ENEMY_CHUNK_SPRITE.src = "assets/ui/sprites/enemy_chunk.png";
const ENEMY_CHUNK = {
  COUNT_MIN: 5,
  COUNT_MAX: 9,
  SPEED_MIN: 90,
  SPEED_MAX: 240,
  SIZE_MIN: 8,
  SIZE_MAX: 16,
  LIFE_MIN: 0.5,
  LIFE_MAX: 1.2,
  ROT_SPEED_MIN: 2.0,
  ROT_SPEED_MAX: 5.0
};
const FUEL_SPRITE = new Image();
FUEL_SPRITE.src = "assets/ui/sprites/fuel.png";
const FUEL_PICKUP = {
  WIDTH: 12,
  HEIGHT: 24,
  RADIUS: 14,
  DROP_CHANCE: 1 / 3,
  ROT_SPEED_MIN: 0.5,
  ROT_SPEED_MAX: 1.1
};

const HUD_FONT = "'Orbitron', 'Bank Gothic', 'Eurostile', 'Consolas', monospace";
const ALERT = {
  DURATION: 2,
  FADE: 0.25
};
const HUD_COLORS = {
  PANEL_START: "rgba(8, 12, 16, 0.9)",
  PANEL_END: "rgba(14, 24, 28, 0.82)",
  PANEL_STROKE: "rgba(120, 170, 180, 0.55)",
  PANEL_TICK: "rgba(200, 220, 220, 0.18)",
  PANEL_TEXT: "rgba(230, 240, 240, 0.95)",
  PANEL_MUTED: "rgba(170, 188, 194, 0.7)",
  ACCENT: "rgba(120, 200, 190, 0.95)",
  ACCENT_SOFT: "rgba(120, 200, 190, 0.35)",
  ACCENT_GLOW: "rgba(120, 200, 190, 0.55)",
  WARM: "rgba(210, 185, 150, 0.95)",
  WARNING: "rgba(210, 130, 120, 0.95)",
  ENEMY: "rgba(200, 110, 110, 0.9)",
  ASTEROID: "rgba(180, 185, 190, 0.4)",
  MAP_BG: "rgba(6, 10, 12, 0.65)",
  MAP_COMPLETE: "rgba(100, 170, 160, 0.1)",
  ALERT_STROKE: "rgba(6, 10, 12, 0.75)"
};
const SHAKE = {
  DURATION: 0.35,
  HIT: 6,
  SURVEY: 3
};
const BACKGROUND_SLICE = {
  DENSITY: 0.001,
  ALPHA: 0.22,
  ROT_SPEED: 0.00005,
  PARALLAX: 0.01,
  ARC: Math.PI * 1.1
};
const BACKGROUND_EVENTS = {
  MIN_INTERVAL: 3.5,
  MAX_INTERVAL: 7.5,
  MAX_ACTIVE: 5,
  EDGE_MARGIN: 80,
  CLUSTER_CHANCE: 0.35,
  CLUSTER_MIN: 2,
  CLUSTER_MAX: 3,
  CLUSTER_OFFSET: 140
};
const PSYCHE_PALETTE = [
  [255, 80, 220],
  [80, 240, 255],
  [200, 255, 90],
  [255, 150, 60],
  [160, 90, 255],
  [255, 90, 140]
];
const NEBULA = {
  ALPHA: 0.2,
  ROT_SPEED: 0.00003,
  PARALLAX: 0.006,
  RADIUS_SCALE: 0.6,
  RING_WIDTH: 0.16,
  BLOB_COUNT: 28
};
const THRUST_PARTICLES = {
  RATE: 36,
  SPEED_MIN: 40,
  SPEED_MAX: 140,
  LIFE_MIN: 0.18,
  LIFE_MAX: 0.45,
  SIZE_MIN: 1.4,
  SIZE_MAX: 3.2,
  SPREAD: 0.45,
  OFFSET: 12
};
const TOUCH = {
  DEADZONE: 12,
  MAX_RADIUS_MIN: 60,
  MAX_RADIUS_MAX: 110,
  MOVE_ZONE: 0.5,
  HINT_ALPHA: 0.22,
  ACTIVE_ALPHA: 0.45
};
const TRAIL_DISPERSE = {
  BASE_WIDTH: 3,
  SPREAD: 10
};
const TRAIL_SPARKS = {
  RATE: 18,
  SPEED_MIN: 30,
  SPEED_MAX: 160,
  LIFE_MIN: 0.12,
  LIFE_MAX: 0.4,
  SIZE_MIN: 1.1,
  SIZE_MAX: 2.8,
  SPREAD: 0.8,
  OFFSET: 10
};
const TRAIL_COLOR = {
  SPEED: 520,
  SLOW: [90, 140, 220],
  FAST: [200, 240, 255]
};
class Particle {
  constructor(x, y, angle, speed, life, color, size) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx, scale = 1, alphaScale = 1) {
    const lifeRatio = this.life / this.maxLife;
    const alpha = lifeRatio * alphaScale;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * lifeRatio * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class EnemyChunk {
  constructor(x, y, vx, vy, size, rotationSpeed, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = rotationSpeed;
    this.life = life;
    this.maxLife = life;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.rotationSpeed * dt;
    this.life -= dt;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (ENEMY_CHUNK_SPRITE.complete && ENEMY_CHUNK_SPRITE.naturalWidth > 0) {
      const scale = this.size / ENEMY_CHUNK_SPRITE.naturalWidth;
      const drawW = ENEMY_CHUNK_SPRITE.naturalWidth * scale;
      const drawH = ENEMY_CHUNK_SPRITE.naturalHeight * scale;
      ctx.drawImage(ENEMY_CHUNK_SPRITE, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = "rgba(255, 120, 120, 0.9)";
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

class FuelPickup {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.rotation = Math.atan2(vy, vx);
    const speed = FUEL_PICKUP.ROT_SPEED_MIN
      + Math.random() * (FUEL_PICKUP.ROT_SPEED_MAX - FUEL_PICKUP.ROT_SPEED_MIN);
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * speed;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (FUEL_SPRITE.complete && FUEL_SPRITE.naturalWidth > 0) {
      ctx.drawImage(
        FUEL_SPRITE,
        -FUEL_PICKUP.WIDTH / 2,
        -FUEL_PICKUP.HEIGHT / 2,
        FUEL_PICKUP.WIDTH,
        FUEL_PICKUP.HEIGHT
      );
    } else {
      ctx.fillStyle = "rgba(255, 220, 120, 0.9)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(
        -FUEL_PICKUP.WIDTH / 2,
        -FUEL_PICKUP.HEIGHT / 2,
        FUEL_PICKUP.WIDTH,
        FUEL_PICKUP.HEIGHT
      );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

function getViewRadius(canvas, camera) {
  return (Math.hypot(canvas.width, canvas.height) / 2) / camera.zoom;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function getHudScale(screenW, screenH) {
  const base = Math.min(screenW, screenH);
  return Math.min(1, Math.max(0.75, base / 900));
}

function pickPsycheColor() {
  return PSYCHE_PALETTE[Math.floor(Math.random() * PSYCHE_PALETTE.length)];
}

function rgba(color, alpha, scale = 1) {
  const r = Math.max(0, Math.min(255, Math.round(color[0] * scale)));
  const g = Math.max(0, Math.min(255, Math.round(color[1] * scale)));
  const b = Math.max(0, Math.min(255, Math.round(color[2] * scale)));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createStarfield(width, height, config = STARFIELD) {
  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  const octx = offscreen.getContext("2d");
  const imageData = octx.createImageData(width, height);
  const data = imageData.data;
  const density = config?.DENSITY ?? STARFIELD.DENSITY;
  const minBrightness = config?.BRIGHTNESS_MIN ?? STARFIELD.BRIGHTNESS_MIN;
  const maxBrightness = config?.BRIGHTNESS_MAX ?? STARFIELD.BRIGHTNESS_MAX;
  const brightnessSpan = Math.max(0, maxBrightness - minBrightness);
  const count = Math.floor(width * height * density);

  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const idx = (y * width + x) * 4;
    const brightness = minBrightness + Math.floor(Math.random() * (brightnessSpan + 1));
    data[idx] = brightness;
    data[idx + 1] = brightness;
    data[idx + 2] = brightness;
    data[idx + 3] = 255;
  }

  octx.putImageData(imageData, 0, 0);
  return offscreen;
}

function createRotatingSlice(size, config = BACKGROUND_SLICE) {
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const octx = offscreen.getContext("2d");
  const center = size / 2;
  const radius = size * 0.32;
  const count = Math.floor(size * size * config.DENSITY);
  const arc = config.ARC ?? Math.PI;
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * arc;
    const dist = Math.random() * radius;
    const x = center + Math.cos(angle) * dist;
    const y = center + Math.sin(angle) * dist;
    const color = pickPsycheColor();
    const intensity = 0.6 + Math.random() * 0.5;
    octx.fillStyle = rgba(color, 0.85, intensity);
    octx.fillRect(x, y, 1, 1);
  }
  return offscreen;
}

function createNebulaTexture(size, config = NEBULA) {
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const octx = offscreen.getContext("2d");
  const center = size / 2;
  const radius = size * config.RADIUS_SCALE;
  const ringWidth = radius * config.RING_WIDTH;
  const ringColorA = pickPsycheColor();
  const ringColorB = pickPsycheColor();

  const ringGrad = octx.createRadialGradient(center, center, radius - ringWidth, center, center, radius + ringWidth);
  ringGrad.addColorStop(0, rgba(ringColorA, 0));
  ringGrad.addColorStop(0.5, rgba(ringColorB, 0.26));
  ringGrad.addColorStop(1, rgba(ringColorA, 0));
  octx.fillStyle = ringGrad;
  octx.beginPath();
  octx.arc(center, center, radius + ringWidth, 0, Math.PI * 2);
  octx.fill();

  for (let i = 0; i < config.BLOB_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radius + (Math.random() - 0.5) * ringWidth * 1.2;
    const x = center + Math.cos(angle) * dist;
    const y = center + Math.sin(angle) * dist;
    const blobRadius = ringWidth * (0.35 + Math.random() * 0.6);
    const blobColor = pickPsycheColor();
    const blob = octx.createRadialGradient(x, y, 0, x, y, blobRadius);
    blob.addColorStop(0, rgba(blobColor, 0.35));
    blob.addColorStop(1, rgba(blobColor, 0));
    octx.fillStyle = blob;
    octx.beginPath();
    octx.arc(x, y, blobRadius, 0, Math.PI * 2);
    octx.fill();
  }

  return offscreen;
}

function drawStarfield(ctx, starfield, offsetX, offsetY, width, height) {
  if (!starfield) {
    return;
  }
  const x = ((offsetX % width) + width) % width;
  const y = ((offsetY % height) + height) % height;
  const ox = -x;
  const oy = -y;

  ctx.drawImage(starfield, ox, oy);
  ctx.drawImage(starfield, ox + width, oy);
  ctx.drawImage(starfield, ox, oy + height);
  ctx.drawImage(starfield, ox + width, oy + height);
}

function drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, screenW, screenH, isCompact) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }
  const base = Math.min(screenW, screenH);
  const edge = isCompact ? 12 : 20;
  const maxSize = Math.min(screenW - edge * 2, screenH - edge * 2);
  const desiredSize = isCompact
    ? Math.min(MINIMAP.SIZE, Math.round(base * 0.28))
    : MINIMAP.SIZE;
  const size = Math.max(120, Math.min(desiredSize, maxSize));
  const range = MINIMAP.RANGE;

  const x0 = screenW - size - edge;
  const y0 = edge;
  const cx = x0 + size / 2;
  const cy = y0 + size / 2;

  ctx.save();

  // background
  ctx.fillStyle = HUD_COLORS.MAP_BG;
  ctx.fillRect(x0, y0, size, size);

  ctx.strokeStyle = HUD_COLORS.PANEL_STROKE;
  ctx.strokeRect(x0, y0, size, size);

  // completed sector background tint
  for (const sector of activeSectors) {
    if (!sector.goalDelivered) {
      continue;
    }
    const bx0 = cx + ((sector.bounds.x - ship.x) / range) * (size / 2);
    const by0 = cy + ((sector.bounds.y - ship.y) / range) * (size / 2);
    const bSize = (sector.bounds.size / range) * (size / 2);
    ctx.fillStyle = HUD_COLORS.MAP_COMPLETE;
    ctx.fillRect(bx0, by0, bSize, bSize);
  }

  // ship (center)
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  // enemy spawn pings
  if (enemyPings && enemyPings.length > 0) {
    for (const ping of enemyPings) {
      const dx = ping.x - ship.x;
      const dy = ping.y - ship.y;
      if (Math.abs(dx) > range || Math.abs(dy) > range) continue;
      const mx = cx + (dx / range) * (size / 2);
      const my = cy + (dy / range) * (size / 2);
      const t = 1 - (ping.life / ping.maxLife);
      const radius = 4 + t * 10;
      ctx.strokeStyle = `rgba(200, 110, 110, ${0.6 * (1 - t)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mx, my, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // stars and asteroids
  for (const sector of activeSectors) {
    for (const star of sector.stars) {
      const dx = star.x - ship.x;
      const dy = star.y - ship.y;

      if (Math.abs(dx) > range || Math.abs(dy) > range) continue;

      const mx = cx + (dx / range) * (size / 2);
      const my = cy + (dy / range) * (size / 2);

      ctx.fillStyle = star.minimapColor ?? "gold";
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(180, 190, 195, 0.8)";
    for (const asteroid of sector.asteroids) {
      const dx = asteroid.x - ship.x;
      const dy = asteroid.y - ship.y;

      if (Math.abs(dx) > range || Math.abs(dy) > range) continue;

      const mx = cx + (dx / range) * (size / 2);
      const my = cy + (dy / range) * (size / 2);

      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // enemies
  if (enemiesInRange && enemiesInRange.length > 0) {
    for (const enemy of enemiesInRange) {
      const dx = enemy.x - ship.x;
      const dy = enemy.y - ship.y;
      if (Math.abs(dx) > range || Math.abs(dy) > range) continue;
      const mx = cx + (dx / range) * (size / 2);
      const my = cy + (dy / range) * (size / 2);
      const pulse = 0.5 + Math.abs(Math.sin(performance.now() / 250));
      ctx.fillStyle = `rgba(200, 110, 110, ${0.4 + pulse * 0.45})`;
      ctx.beginPath();
      ctx.arc(mx, my, 2.5 + pulse, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // end zones + goal pickups
  for (const sector of activeSectors) {
    const { goal, endZone, goalCollected, goalDelivered } = sector;
    if (!goalDelivered) {
      const zdx = endZone.x + endZone.width / 2 - ship.x;
      const zdy = endZone.y + endZone.height / 2 - ship.y;
      if (Math.abs(zdx) <= range && Math.abs(zdy) <= range) {
        const zx = cx + (zdx / range) * (size / 2);
        const zy = cy + (zdy / range) * (size / 2);
        ctx.strokeStyle = "rgba(120, 200, 190, 0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(zx - 5, zy - 5, 10, 10);
      }
    }

    if (!goalCollected) {
      const gdx = goal.x + goal.width / 2 - ship.x;
      const gdy = goal.y + goal.height / 2 - ship.y;
      if (Math.abs(gdx) <= range && Math.abs(gdy) <= range) {
        const gx = cx + (gdx / range) * (size / 2);
        const gy = cy + (gdy / range) * (size / 2);
        ctx.fillStyle = "rgba(120, 200, 190, 0.9)";
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}


function startGame(canvas, ctx, onGameOver) {
  sounds.preload();
  music.start();
  const startX = SECTOR_SIZE / 2;
  const startY = SECTOR_SIZE / 2;
  const ship = new Ship(startX, startY);
  const camera = new Camera(ship);
  const sectorManager = new SectorManager({ x: startX, y: startY }, START_SAFE_RADIUS);
  let sector = sectorManager.getSectorForPosition(
    ship.x,
    ship.y,
    getViewRadius(canvas, camera),
    ship.x,
    ship.y
  );
  let activeSectors = sectorManager.getSectorsAround(
    ship.x,
    ship.y,
    getViewRadius(canvas, camera),
    ship.x,
    ship.y,
    ACTIVE_SECTOR_RANGE
  );
  const trail = [];
  const SHIP_RADIUS = 12;
  const TRAIL_MAX = 200;
  const TRAIL_MIN_DIST = 6;
  const TRAIL_FADE_SPEED = 24;
  const TRAIL_FADE_STEP = 0.02;
  let lastTrailX = null;
  let lastTrailY = null;
  let trailFadeTimer = 0;
  let starfield = null;
  let dustfield = null;
  let farfield = null;
  let sliceField = null;
  let nebulaField = null;
  let starfieldW = 0;
  let starfieldH = 0;
  const STARFIELD_PARALLAX = 0.03;
  const DUSTFIELD_PARALLAX = 0.015;
  const FARFIELD_PARALLAX = 0.008;
  const particles = [];
  const bullets = [];
  const enemyBullets = [];
  const enemies = [];
  const fuelPickups = [];
  const alerts = [];

  let lastTime = performance.now();
  let running = true;
  let rafId = null;
  let gameOver = false;
  let pendingGameOver = false;
  let gameOverTimer = 0;
  let cachedGameOverStats = null;
  let shipVisible = true;
  let respawnTimer = 0;
  let lives = STARTING_LIVES;
  let surveyed = 0;
  let invulnTimer = 0;
  let timeSpent = 0;
  let distanceTraveled = 0;
  let lastShipX = ship.x;
  let lastShipY = ship.y;
  let scoreMultiplier = 1;
  let score = 0;
  let combatScore = 0;
  let scorePulse = 0;
  let fireCooldown = 0;
  let fireLockout = 0.5;
  let enemiesSpawned = 0;
  let enemiesInRange = [];
  const enemyPings = [];
  let alertClock = 0;
  let shakeTime = 0;
  let shakeDuration = 0;
  let shakeStrength = 0;
  let thrustParticleCarry = 0;
  let trailSparkCarry = 0;
  const backgroundEvents = [];
  const backgroundRecent = [];
  let backgroundClock = 0;
  let nextBackgroundEvent = 0;
  const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    leftDown: false,
    rightDown: false,
    hasMoved: false
  };
  const touch = {
    moveId: null,
    fireId: null,
    moveStartX: 0,
    moveStartY: 0,
    moveX: 0,
    moveY: 0,
    isActive: false
  };
  const mouseAimStorageKey = "spaceSurveyor_mouseAim";
  let mouseAimEnabled = true;
  let wheelZoomStep = 0;
  const pinch = {
    active: false,
    startDist: 0,
    startZoom: 1
  };

  try {
    const stored = localStorage.getItem(mouseAimStorageKey);
    if (stored !== null) {
      mouseAimEnabled = stored === "true";
    }
  } catch (err) {}

  const updateMousePosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    mouse.x = (event.clientX - rect.left) * scaleX;
    mouse.y = (event.clientY - rect.top) * scaleY;
    mouse.hasMoved = true;
  };

  const onMouseMove = (event) => updateMousePosition(event);
  const onMouseDown = (event) => {
    updateMousePosition(event);
    if (event.button === 0) {
      mouse.leftDown = true;
    } else if (event.button === 2) {
      mouse.rightDown = true;
    }
  };
  const onMouseUp = (event) => {
    if (event.button === 0) {
      mouse.leftDown = false;
    } else if (event.button === 2) {
      mouse.rightDown = false;
    }
  };
  const onContextMenu = (event) => {
    event.preventDefault();
  };
  const onWheel = (event) => {
    if (event.deltaY === 0) {
      return;
    }
    event.preventDefault();
    wheelZoomStep += (event.deltaY > 0 ? -1 : 1) * ZOOM.WHEEL_STEP;
  };
  const getTouchPosition = (touchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return {
      x: (touchEvent.clientX - rect.left) * scaleX,
      y: (touchEvent.clientY - rect.top) * scaleY
    };
  };
  const getPinchDistance = (touches) => {
    if (!touches || touches.length < 2) {
      return 0;
    }
    const a = getTouchPosition(touches[0]);
    const b = getTouchPosition(touches[1]);
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const startPinch = (touches) => {
    pinch.active = true;
    pinch.startDist = getPinchDistance(touches);
    pinch.startZoom = camera.zoom;
  };
  const updatePinch = (touches) => {
    if (!pinch.active || touches.length < 2 || pinch.startDist <= 0) {
      return;
    }
    const dist = getPinchDistance(touches);
    const ratio = dist / pinch.startDist;
    const target = pinch.startZoom * ratio;
    camera.zoom = Math.max(ZOOM.MIN, Math.min(ZOOM.MAX, target));
  };
  const endPinch = (touches) => {
    if (!touches || touches.length < 2) {
      pinch.active = false;
    }
  };
  const onTouchStart = (event) => {
    event.preventDefault();
    for (const t of event.changedTouches) {
      const pos = getTouchPosition(t);
      if (pos.x <= canvas.width * TOUCH.MOVE_ZONE && touch.moveId === null) {
        touch.moveId = t.identifier;
        touch.moveStartX = pos.x;
        touch.moveStartY = pos.y;
        touch.moveX = pos.x;
        touch.moveY = pos.y;
        touch.isActive = true;
      } else if (touch.fireId === null) {
        touch.fireId = t.identifier;
        touch.isActive = true;
      }
    }
    if (!pinch.active && event.touches.length >= 2) {
      startPinch(event.touches);
    }
  };
  const onTouchMove = (event) => {
    event.preventDefault();
    for (const t of event.changedTouches) {
      if (t.identifier === touch.moveId) {
        const pos = getTouchPosition(t);
        touch.moveX = pos.x;
        touch.moveY = pos.y;
      }
    }
    if (event.touches.length >= 2) {
      if (!pinch.active) {
        startPinch(event.touches);
      }
      updatePinch(event.touches);
    }
  };
  const onTouchEnd = (event) => {
    event.preventDefault();
    for (const t of event.changedTouches) {
      if (t.identifier === touch.moveId) {
        touch.moveId = null;
      } else if (t.identifier === touch.fireId) {
        touch.fireId = null;
      }
    }
    if (touch.moveId === null && touch.fireId === null) {
      touch.isActive = false;
    }
    endPinch(event.touches);
  };
  const onToggleMouseAim = (event) => {
    if (event.key.toLowerCase() !== "m") {
      return;
    }
    mouseAimEnabled = !mouseAimEnabled;
    try {
      localStorage.setItem(mouseAimStorageKey, mouseAimEnabled.toString());
    } catch (err) {}
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });
  canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
  window.addEventListener("keydown", onToggleMouseAim);
  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  function cleanupMouseControls() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("keydown", onToggleMouseAim);
    canvas.removeEventListener("contextmenu", onContextMenu);
    canvas.removeEventListener("wheel", onWheel);
  }

  function respawn() {
    ship.x = startX;
    ship.y = startY;
    ship.vx = 0;
    ship.vy = 0;
    ship.heading = 0;
    ship.fuel = ship.maxFuel;
    lastShipX = ship.x;
    lastShipY = ship.y;
    lastTrailX = null;
    lastTrailY = null;
    trail.length = 0;
    invulnTimer = INVULN_DURATION;
    scoreMultiplier = 1;
    ship.stopThrustLoop();
  }

  function addScore(points, applyMultiplier = false, trackCombat = false) {
    const applied = applyMultiplier ? points * scoreMultiplier : points;
    score += applied;
    if (trackCombat) {
      combatScore += points;
    }
    scorePulse = Math.min(2.0, scorePulse + 0.8);
  }

  function queueRespawn() {
    shipVisible = false;
    ship.stopThrustLoop();
    respawnTimer = RESPAWN_DELAY;
  }

  function queueAlert(text, delay = 0, duration = ALERT.DURATION) {
    alerts.push({
      text,
      start: alertClock + delay,
      duration
    });
  }

  function triggerShake(strength, duration = SHAKE.DURATION) {
    shakeStrength = Math.max(shakeStrength, strength);
    shakeTime = Math.max(shakeTime, duration);
    shakeDuration = Math.max(shakeDuration, duration);
  }

  function updateShake(dt) {
    if (shakeTime > 0) {
      shakeTime = Math.max(0, shakeTime - dt);
      const fade = shakeDuration > 0 ? shakeTime / shakeDuration : 0;
      const intensity = shakeStrength * fade;
      camera.shakeX = (Math.random() * 2 - 1) * intensity;
      camera.shakeY = (Math.random() * 2 - 1) * intensity;
      if (shakeTime === 0) {
        shakeStrength = 0;
        shakeDuration = 0;
      }
    } else {
      camera.shakeX = 0;
      camera.shakeY = 0;
    }
  }

  function scheduleNextBackgroundEvent(now) {
    nextBackgroundEvent = now + randomRange(BACKGROUND_EVENTS.MIN_INTERVAL, BACKGROUND_EVENTS.MAX_INTERVAL);
  }

  function rollBackgroundType() {
    const typeRoll = Math.random();
    if (typeRoll < 0.2) return "supernova";
    if (typeRoll < 0.4) return "nebulaBurst";
    if (typeRoll < 0.62) return "meteor";
    if (typeRoll < 0.76) return "warp";
    if (typeRoll < 0.88) return "quasar";
    if (typeRoll < 0.92) return "neonRibbon";
    if (typeRoll < 0.96) return "jellySlab";
    return "chromaEddy";
  }

  function pickBackgroundType() {
    let type = rollBackgroundType();
    for (let i = 0; i < 4 && backgroundRecent.includes(type); i++) {
      type = rollBackgroundType();
    }
    backgroundRecent.push(type);
    if (backgroundRecent.length > 3) {
      backgroundRecent.shift();
    }
    return type;
  }

  function buildBackgroundEvent(type, now, posX, posY, scale = 1) {
    const driftAngle = randomRange(0, Math.PI * 2);
    const driftSpeed = randomRange(4, 16) * scale;
    const parallax = randomRange(0.04, 0.1);
    const worldX = ship.x + (posX - canvas.width / 2) / (camera.zoom * parallax);
    const worldY = ship.y + (posY - canvas.height / 2) / (camera.zoom * parallax);
    const base = {
      type,
      start: now,
      duration: randomRange(2.5, 8.5) * scale,
      worldX,
      worldY,
      driftX: Math.cos(driftAngle) * driftSpeed,
      driftY: Math.sin(driftAngle) * driftSpeed,
      parallax,
      colors: [pickPsycheColor(), pickPsycheColor(), pickPsycheColor()]
    };

    if (type === "quasar") {
      base.duration = randomRange(2.8, 4.6) * scale;
      base.angle = randomRange(0, Math.PI * 2);
      base.length = randomRange(420, 900) * scale;
      base.width = randomRange(2, 4) * scale;
    } else if (type === "supernova") {
      base.duration = randomRange(6, 10) * scale;
      base.radius = randomRange(40, 120) * scale;
      base.maxRadius = base.radius + randomRange(180, 320) * scale;
    } else if (type === "nebulaBurst") {
      base.duration = randomRange(4.5, 8) * scale;
      base.radius = randomRange(120, 260) * scale;
      base.rotation = randomRange(0, Math.PI * 2);
    } else if (type === "meteor") {
      base.duration = randomRange(1.6, 2.8) * scale;
      base.angle = randomRange(0, Math.PI * 2);
      base.length = randomRange(140, 260) * scale;
      base.travel = randomRange(220, 420) * scale;
      base.count = Math.max(1, Math.floor(randomRange(2, 5) * scale));
    } else if (type === "warp") {
      base.duration = randomRange(2.2, 4.4) * scale;
      base.radius = randomRange(60, 140) * scale;
      base.maxRadius = base.radius + randomRange(220, 420) * scale;
    } else if (type === "neonRibbon") {
      base.duration = randomRange(7, 12) * scale;
      base.angle = randomRange(0, Math.PI * 2);
      base.length = randomRange(240, 520) * scale;
      base.width = randomRange(10, 20) * scale;
      base.bend = randomRange(18, 52) * scale;
      base.phase = randomRange(0, Math.PI * 2);
    } else if (type === "jellySlab") {
      base.duration = randomRange(8, 14) * scale;
      base.width = randomRange(140, 280) * scale;
      base.height = randomRange(70, 150) * scale;
      base.rotation = randomRange(0, Math.PI * 2);
      base.phase = randomRange(0, Math.PI * 2);
    } else if (type === "chromaEddy") {
      base.duration = randomRange(9, 16) * scale;
      base.radius = randomRange(60, 150) * scale;
      base.orbCount = Math.max(3, Math.floor(randomRange(3, 6)));
      base.orbSize = randomRange(12, 26) * scale;
      base.spin = randomRange(-0.7, 0.7);
      base.phase = randomRange(0, Math.PI * 2);
    }

    return base;
  }

  function spawnBackgroundEvent(now) {
    if (backgroundEvents.length >= BACKGROUND_EVENTS.MAX_ACTIVE) {
      scheduleNextBackgroundEvent(now);
      return;
    }
    const type = pickBackgroundType();
    const margin = BACKGROUND_EVENTS.EDGE_MARGIN;
    const posX = randomRange(margin, canvas.width - margin);
    const posY = randomRange(margin, canvas.height - margin);
    backgroundEvents.push(buildBackgroundEvent(type, now, posX, posY, 1));
    if (Math.random() < BACKGROUND_EVENTS.CLUSTER_CHANCE) {
      const count = Math.floor(randomRange(BACKGROUND_EVENTS.CLUSTER_MIN, BACKGROUND_EVENTS.CLUSTER_MAX + 1));
      for (let i = 0; i < count; i++) {
        if (backgroundEvents.length >= BACKGROUND_EVENTS.MAX_ACTIVE) {
          break;
        }
        const offsetAngle = randomRange(0, Math.PI * 2);
        const offsetDist = randomRange(40, BACKGROUND_EVENTS.CLUSTER_OFFSET);
        const clusterX = posX + Math.cos(offsetAngle) * offsetDist;
        const clusterY = posY + Math.sin(offsetAngle) * offsetDist;
        const clusterScale = randomRange(0.55, 0.85);
        backgroundEvents.push(buildBackgroundEvent(type, now, clusterX, clusterY, clusterScale));
      }
    }
    scheduleNextBackgroundEvent(now);
  }

  function updateBackgroundEvents(dt) {
    backgroundClock += dt;
    if (backgroundClock >= nextBackgroundEvent) {
      spawnBackgroundEvent(backgroundClock);
    }
    for (let i = backgroundEvents.length - 1; i >= 0; i--) {
      const evt = backgroundEvents[i];
      if (backgroundClock > evt.start + evt.duration) {
        backgroundEvents.splice(i, 1);
      }
    }
  }

  scheduleNextBackgroundEvent(0);

  function spawnThrustParticles(dt) {
    const thrust = ship.thrusting;
    const thrustPower = Math.min(1, Math.abs(thrust));
    if (thrustPower <= 0) {
      thrustParticleCarry = 0;
      return;
    }
    const rate = THRUST_PARTICLES.RATE * thrustPower;
    thrustParticleCarry += dt * rate;
    const fx = Math.sin(ship.heading);
    const fy = -Math.cos(ship.heading);
    const baseX = ship.x - fx * THRUST_PARTICLES.OFFSET;
    const baseY = ship.y - fy * THRUST_PARTICLES.OFFSET;
    const sideX = -fy;
    const sideY = fx;
    while (thrustParticleCarry >= 1) {
      const sideOffset = (Math.random() - 0.5) * 5;
      const angle = ship.heading + Math.PI / 2
        + (Math.random() - 0.5) * THRUST_PARTICLES.SPREAD;
      const speed = THRUST_PARTICLES.SPEED_MIN
        + Math.random() * (THRUST_PARTICLES.SPEED_MAX - THRUST_PARTICLES.SPEED_MIN);
      const life = THRUST_PARTICLES.LIFE_MIN
        + Math.random() * (THRUST_PARTICLES.LIFE_MAX - THRUST_PARTICLES.LIFE_MIN);
      const size = THRUST_PARTICLES.SIZE_MIN
        + Math.random() * (THRUST_PARTICLES.SIZE_MAX - THRUST_PARTICLES.SIZE_MIN);
      particles.push(
        new Particle(
          baseX + sideX * sideOffset,
          baseY + sideY * sideOffset,
          angle,
          speed * (0.5 + thrustPower * 0.5),
          life,
          "rgba(120, 200, 190, 0.6)",
          size
        )
      );
      thrustParticleCarry -= 1;
    }
  }

  function spawnTrailSparks(dt, speed) {
    if (speed < 40) {
      trailSparkCarry = 0;
      return;
    }
    const speedRatio = Math.min(1, speed / TRAIL_COLOR.SPEED);
    const rate = TRAIL_SPARKS.RATE * speedRatio;
    trailSparkCarry += dt * rate;
    const dirX = ship.vx / speed;
    const dirY = ship.vy / speed;
    const baseX = ship.x - dirX * TRAIL_SPARKS.OFFSET;
    const baseY = ship.y - dirY * TRAIL_SPARKS.OFFSET;
    const angleBase = Math.atan2(dirY, dirX) + Math.PI;

    while (trailSparkCarry >= 1) {
      const angle = angleBase + (Math.random() - 0.5) * TRAIL_SPARKS.SPREAD;
      const velocity = TRAIL_SPARKS.SPEED_MIN
        + Math.random() * (TRAIL_SPARKS.SPEED_MAX - TRAIL_SPARKS.SPEED_MIN);
      const life = TRAIL_SPARKS.LIFE_MIN
        + Math.random() * (TRAIL_SPARKS.LIFE_MAX - TRAIL_SPARKS.LIFE_MIN);
      const size = TRAIL_SPARKS.SIZE_MIN
        + Math.random() * (TRAIL_SPARKS.SIZE_MAX - TRAIL_SPARKS.SIZE_MIN);
      particles.push(
        new Particle(
          baseX,
          baseY,
          angle,
          velocity,
          life,
          "rgba(160, 210, 200, 0.7)",
          size
        )
      );
      trailSparkCarry -= 1;
    }
  }

  queueAlert("Scan the sector, but watch your fuel!", 0, ALERT.DURATION * 1.5);

  function updateAlerts(dt) {
    alertClock += dt;
    for (let i = alerts.length - 1; i >= 0; i--) {
      const alert = alerts[i];
      if (alertClock > alert.start + alert.duration) {
        alerts.splice(i, 1);
      }
    }
  }

  function loop(time) {
    if (!running) {
      return;
    }
    const dt = Math.min((time - lastTime) / 1000, 0.033);
    lastTime = time;

    update(dt);
    if (!running) {
      return;
    }
    render();

    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    updateParticles(dt);
    updateEnemyBullets(dt);
    updateEnemyPings(dt);
    updateAlerts(dt);
    updateShake(dt);
    updateBackgroundEvents(dt);
    if (pendingGameOver) {
      gameOverTimer = Math.max(0, gameOverTimer - dt);
      if (gameOverTimer === 0) {
        finalizeGameOver();
      }
      return;
    }
    if (respawnTimer > 0) {
      respawnTimer = Math.max(0, respawnTimer - dt);
      if (respawnTimer === 0) {
        respawn();
        shipVisible = true;
      }
      return;
    }
    let externalInput = null;
    let keyboardRotationInput = 0;
    if (keys["arrowleft"] || keys["a"]) keyboardRotationInput -= 1;
    if (keys["arrowright"] || keys["d"]) keyboardRotationInput += 1;
    let keyboardThrustInput = 0;
    if (keys["arrowup"] || keys["w"]) keyboardThrustInput = 1;
    if (keys["arrowdown"] || keys["s"]) keyboardThrustInput = -1;
    if (mouseAimEnabled && mouse.hasMoved) {
      const centerX = canvas.width / 2 + camera.shakeX;
      const centerY = canvas.height / 2 + camera.shakeY;
      const worldX = (mouse.x - centerX) / camera.zoom + ship.x;
      const worldY = (mouse.y - centerY) / camera.zoom + ship.y;
      const dx = worldX - ship.x;
      const dy = worldY - ship.y;
      if (keyboardRotationInput === 0) {
        externalInput = externalInput || {};
        externalInput.aimAngle = Math.atan2(dx, -dy);
      }
      if (mouse.rightDown && keyboardThrustInput === 0) {
        externalInput = externalInput || {};
        externalInput.thrustInput = 1;
      }
    }
    if (touch.moveId !== null) {
      const dx = touch.moveX - touch.moveStartX;
      const dy = touch.moveY - touch.moveStartY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = Math.min(
        TOUCH.MAX_RADIUS_MAX,
        Math.max(TOUCH.MAX_RADIUS_MIN, Math.min(canvas.width, canvas.height) * 0.16)
      );
      if (dist > TOUCH.DEADZONE && keyboardRotationInput === 0) {
        externalInput = externalInput || {};
        externalInput.aimAngle = Math.atan2(dx, -dy);
      }
      if (dist > TOUCH.DEADZONE && keyboardThrustInput === 0) {
        externalInput = externalInput || {};
        externalInput.thrustInput = Math.min(1, dist / maxRadius);
      }
    }
    ship.update(dt, externalInput);
    spawnThrustParticles(dt);
    timeSpent += dt;
    if (invulnTimer > 0) {
      invulnTimer = Math.max(0, invulnTimer - dt);
    }
    if (fireCooldown > 0) {
      fireCooldown = Math.max(0, fireCooldown - dt);
    }
    if (fireLockout > 0) {
      fireLockout = Math.max(0, fireLockout - dt);
    }
    if (scorePulse > 0) {
      scorePulse = Math.max(0, scorePulse - dt * 2.6);
    }
    updateBullets(dt);

    sector = sectorManager.getSectorForPosition(
      ship.x,
      ship.y,
      getViewRadius(canvas, camera),
      ship.x,
      ship.y
    );
    activeSectors = sectorManager.getSectorsAround(
      ship.x,
      ship.y,
      getViewRadius(canvas, camera),
      ship.x,
      ship.y,
      ACTIVE_SECTOR_RANGE
    );

    // --- gravity debug accumulation ---
    ship.debugGravityX = 0;
    ship.debugGravityY = 0;

    const activeStars = activeSectors.flatMap((s) => s.stars);
    for (const activeSector of activeSectors) {
      if (!activeSector.goalCollected && typeof activeSector.goal.update === "function") {
        activeSector.goal.update(dt);
      }
      if (!activeSector.goalDelivered && typeof activeSector.endZone.update === "function") {
        activeSector.endZone.update(dt);
      }
    }
    for (const star of activeStars) {
      if (typeof star.update === "function") {
        star.update(dt);
      }
    }
    applyGravity(ship, activeStars, dt, (gx, gy) => {
    ship.debugGravityX += gx;
    ship.debugGravityY += gy;
    });

    integrate(ship, dt);
    const shipSpeed = Math.hypot(ship.vx, ship.vy);
    spawnTrailSparks(dt, shipSpeed);
    const dxTravel = ship.x - lastShipX;
    const dyTravel = ship.y - lastShipY;
    distanceTraveled += Math.hypot(dxTravel, dyTravel);
    lastShipX = ship.x;
    lastShipY = ship.y;
    for (const activeSector of activeSectors) {
      for (const asteroid of activeSector.asteroids) {
        if (typeof asteroid.update === "function") {
          asteroid.update(dt);
        }
        applyGravity(asteroid, activeStars, dt);
        integrate(asteroid, dt);
      }
    }
    updateFuelPickups(dt, activeStars);
    enemiesInRange = updateEnemies(dt, activeStars);
    handleFuelPickups();
    handleBulletHits(activeSectors);
    updateZoom(dt);
    if (lastTrailX === null) {
      lastTrailX = ship.x;
      lastTrailY = ship.y;
      trail.push({ x: ship.x, y: ship.y });
    } else {
      const dx = ship.x - lastTrailX;
      const dy = ship.y - lastTrailY;
      if ((dx * dx + dy * dy) >= (TRAIL_MIN_DIST * TRAIL_MIN_DIST)) {
        trail.push({ x: ship.x, y: ship.y });
        lastTrailX = ship.x;
        lastTrailY = ship.y;
        if (trail.length > TRAIL_MAX) {
          trail.shift();
        }
      }
    }
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed < TRAIL_FADE_SPEED && trail.length > 0) {
      const fadeRate = 1 - (speed / TRAIL_FADE_SPEED);
      trailFadeTimer += dt * fadeRate;
      const removeCount = Math.floor(trailFadeTimer / TRAIL_FADE_STEP);
      if (removeCount > 0) {
        trail.splice(0, removeCount);
        trailFadeTimer -= removeCount * TRAIL_FADE_STEP;
      }
      if (trail.length < 2) {
        trail.length = 0;
        lastTrailX = null;
        lastTrailY = null;
      }
    } else {
      trailFadeTimer = 0;
    }

    for (const star of activeStars) {
      const dx = ship.x - star.x;
      const dy = ship.y - star.y;
      const dist = Math.hypot(dx, dy);
      if (dist < star.radius) {
        triggerShake(SHAKE.HIT);
        spawnExplosion(ship.x, ship.y, "star");
        lives -= 1;
        if (lives <= 0) {
          shipVisible = false;
          sounds.play("game_over");
          endGame();
          return;
        }
        sounds.play("lost_life");
        queueRespawn();
        return;
      }
    }

    if (invulnTimer <= 0) {
      for (const activeSector of activeSectors) {
        for (const asteroid of activeSector.asteroids) {
          const dx = ship.x - asteroid.x;
          const dy = ship.y - asteroid.y;
          const dist = Math.hypot(dx, dy);
          if (dist < asteroid.radius + SHIP_RADIUS) {
            triggerShake(SHAKE.HIT);
            lives -= 1;
            if (lives <= 0) {
              spawnExplosion(ship.x, ship.y, "normal");
              shipVisible = false;
              sounds.play("game_over");
              endGame();
              return;
            }
            spawnExplosion(ship.x, ship.y, "normal");
            sounds.play("lost_life");
            queueRespawn();
            return;
          }
        }
      }
    }

    if (ship.fuel <= 0 && keys["q"]) {
      keys["q"] = false;
      lives -= 1;
      if (lives <= 0) {
        spawnExplosion(ship.x, ship.y, "normal");
        shipVisible = false;
        sounds.play("game_over");
        endGame();
        return;
      }
      spawnExplosion(ship.x, ship.y, "normal");
      sounds.play("lost_life");
      queueRespawn();
      return;
    }

    const wantsFire = keys[" "] || (mouseAimEnabled && mouse.leftDown) || touch.fireId !== null;
    if (shipVisible && wantsFire && fireCooldown === 0 && fireLockout === 0) {
      spawnBullet();
      sounds.play("laser");
      fireCooldown = BULLET.COOLDOWN;
    }

    if (!sector.goalCollected && sector.goal.containsPoint(ship.x, ship.y, SHIP_RADIUS)) {
      sector.goalCollected = true;
      ship.fuel = ship.maxFuel;
    }

    if (!sector.goalDelivered && sector.endZone.containsPoint(ship.x, ship.y, SHIP_RADIUS)) {
      sector.goalDelivered = true;
      ship.fuel = ship.maxFuel;
      surveyed += 1;
      scoreMultiplier = 1 + surveyed;
      addScore(SCORE_POINTS.SURVEY);
      queueAlert("Sector surveyed.");
      queueAlert("Fuel tanks refilled!", ALERT.DURATION);
      triggerShake(SHAKE.SURVEY);
      sounds.play("got_survey");
      console.log("[survey] completed", {
        sector: `${sector.sx},${sector.sy}`,
        surveyed
      });
      const spawned = spawnEnemyForSurvey();
      if (spawned > 0) {
        queueAlert("Enemies have been alerted as to your position.", ALERT.DURATION * 2);
      }
    }
  }

function render() {
  if (canvas.width !== starfieldW || canvas.height !== starfieldH) {
    starfieldW = canvas.width;
    starfieldH = canvas.height;
    starfield = createStarfield(starfieldW, starfieldH, STARFIELD);
    dustfield = createStarfield(starfieldW, starfieldH, DUSTFIELD);
    farfield = createStarfield(starfieldW, starfieldH, FARFIELD);
    const sliceSize = Math.ceil(Math.max(starfieldW, starfieldH) * 1.5);
    sliceField = createRotatingSlice(sliceSize, BACKGROUND_SLICE);
    const nebulaSize = Math.ceil(Math.max(starfieldW, starfieldH) * 1.4);
    nebulaField = createNebulaTexture(nebulaSize, NEBULA);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (farfield) {
    ctx.save();
    ctx.globalAlpha = FARFIELD.ALPHA;
    const offsetX = -ship.x * FARFIELD_PARALLAX;
    const offsetY = -ship.y * FARFIELD_PARALLAX;
    drawStarfield(ctx, farfield, offsetX, offsetY, canvas.width, canvas.height);
    ctx.restore();
  }
  if (dustfield) {
    ctx.save();
    ctx.globalAlpha = DUSTFIELD.ALPHA;
    const offsetX = -ship.x * DUSTFIELD_PARALLAX;
    const offsetY = -ship.y * DUSTFIELD_PARALLAX;
    drawStarfield(ctx, dustfield, offsetX, offsetY, canvas.width, canvas.height);
    ctx.restore();
  }
  if (starfield) {
    ctx.save();
    ctx.globalAlpha = STARFIELD.ALPHA;
    const offsetX = -ship.x * STARFIELD_PARALLAX;
    const offsetY = -ship.y * STARFIELD_PARALLAX;
    drawStarfield(ctx, starfield, offsetX, offsetY, canvas.width, canvas.height);
    ctx.restore();
  }

  const time = performance.now();
  if (sliceField) {
    ctx.save();
    ctx.globalAlpha = BACKGROUND_SLICE.ALPHA;
    ctx.translate(
      canvas.width / 2 - ship.x * BACKGROUND_SLICE.PARALLAX,
      canvas.height / 2 - ship.y * BACKGROUND_SLICE.PARALLAX
    );
    ctx.rotate(time * BACKGROUND_SLICE.ROT_SPEED);
    ctx.drawImage(sliceField, -sliceField.width / 2, -sliceField.height / 2);
    ctx.restore();
  }

  if (nebulaField) {
    ctx.save();
    ctx.globalAlpha = NEBULA.ALPHA;
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(
      canvas.width / 2 - ship.x * NEBULA.PARALLAX,
      canvas.height / 2 - ship.y * NEBULA.PARALLAX
    );
    ctx.rotate(time * NEBULA.ROT_SPEED);
    ctx.drawImage(nebulaField, -nebulaField.width / 2, -nebulaField.height / 2);
    ctx.restore();
  }

  drawBackgroundEvents(ctx, backgroundEvents, backgroundClock, ship, canvas.width, canvas.height);

  // World (rotated)
  camera.applyTransform(ctx, canvas);
  const shipSpeed = Math.hypot(ship.vx, ship.vy);
  drawTrail(ctx, trail, shipSpeed);
  drawSectorBounds(ctx, sector);
  drawScanPulse(ctx, ship, activeSectors, time, getViewRadius(canvas, camera));
  const viewRadius = getViewRadius(canvas, camera);
  for (const activeSector of activeSectors) {
    if (activeSector.goalDelivered) {
      continue;
    }
    const endZone = activeSector.endZone;
    const ex = endZone.x + endZone.width / 2;
    const ey = endZone.y + endZone.height / 2;
    const dx = ex - ship.x;
    const dy = ey - ship.y;
    if (Math.hypot(dx, dy) <= viewRadius) {
      endZone.draw(ctx, false);
    }
  }
  if (!sector.goalCollected) {
    sector.goal.draw(ctx);
  }
  for (const activeSector of activeSectors) {
    for (const star of activeSector.stars) {
      star.draw(ctx);
    }
    for (const asteroid of activeSector.asteroids) {
      asteroid.draw(ctx);
    }
  }
  drawFuelPickups(ctx);
  drawEnemies(ctx);
  drawEnemyBullets(ctx);
  drawBullets(ctx);
  drawParticles(ctx);
  if (shipVisible) {
    ship.draw(ctx, shipSpeed);
  }
  camera.resetTransform(ctx);

  if (DEBUG.VECTORS) {
    drawDebugVectors(ctx, ship);
  }
  drawScreenEffects(ctx, canvas.width, canvas.height);
  const hudScale = getHudScale(canvas.width, canvas.height);
  ctx.save();
  ctx.scale(hudScale, hudScale);
  const hudW = canvas.width / hudScale;
  const hudH = canvas.height / hudScale;
  const isCompactHud = Math.min(canvas.width, canvas.height) < 820;
  const controlLabel = touch.isActive
    ? "CTRL: TOUCH + KEYS"
    : (mouseAimEnabled ? "CTRL: MOUSE + KEYS" : "CTRL: KEYS");
  drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, enemiesInRange, hudW, hudH);
  drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, hudW, hudH, isCompactHud);
  drawFuelGauge(ctx, ship, hudW, hudH, isCompactHud);
  drawStatusHud(
    ctx,
    ship,
    lives,
    surveyed,
    timeSpent,
    hudW,
    hudH,
    controlLabel,
    isCompactHud
  );
  drawScoreHud(ctx, score, scoreMultiplier, scorePulse, hudW, hudH, isCompactHud);
  drawAlerts(ctx, hudW, hudH);
  ctx.restore();
  drawMouseReticle(ctx, mouse, canvas.width, canvas.height, mouseAimEnabled);
  drawTouchControls(ctx, touch, canvas.width, canvas.height);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function drawTrail(ctx, trail, speed = 0) {
  if (trail.length < 2) {
    return;
  }

  const speedRatio = Math.min(1, speed / TRAIL_COLOR.SPEED);
  const trailR = Math.round(lerp(TRAIL_COLOR.SLOW[0], TRAIL_COLOR.FAST[0], speedRatio));
  const trailG = Math.round(lerp(TRAIL_COLOR.SLOW[1], TRAIL_COLOR.FAST[1], speedRatio));
  const trailB = Math.round(lerp(TRAIL_COLOR.SLOW[2], TRAIL_COLOR.FAST[2], speedRatio));

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = TRAIL_DISPERSE.BASE_WIDTH;
  ctx.setLineDash([]);
  const total = trail.length - 1;
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    const t = i / total;
    const alpha = 0.05 + 0.35 * t;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${alpha})`;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1];
    const b = trail[i];
    const t = i / (trail.length - 1);
    const alpha = (0.08 + 0.35 * t) * (0.5 + speedRatio * 0.6);
    const width = TRAIL_DISPERSE.BASE_WIDTH + t * TRAIL_DISPERSE.SPREAD;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = width;
    ctx.strokeStyle = `rgba(${trailR}, ${trailG}, ${trailB}, ${alpha})`;
    ctx.stroke();
  }
  ctx.restore();
}

function drawDebugVectors(ctx, ship) {
  ctx.save();
  ctx.translate(window.innerWidth / 2, window.innerHeight / 2);

  // Velocity vector (white)
  const vx = ship.vx * 0.2;
  const vy = ship.vy * 0.2;
  const vlen = Math.hypot(vx, vy);
  if (vlen > 0.01) {
    const grad = ctx.createLinearGradient(0, 0, vx, vy);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.4, "rgba(200, 220, 255, 0.4)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0.9)");

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(vx, vy);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Gravity vector (red)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ship.debugGravityX * 0.05, ship.debugGravityY * 0.05);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawSectorBounds(ctx, sector) {
  if (!sector) {
    return;
  }
  const { x, y, size } = sector.bounds;
  ctx.save();
  if (sector.goalDelivered) {
    ctx.fillStyle = "rgba(120, 255, 140, 0.06)";
    ctx.fillRect(x, y, size, size);
  }
  ctx.strokeStyle = "rgba(0, 200, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 12]);
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}

function drawNavHud(ctx, ship, target, label, screenW, screenH) {
  if (!target) {
    return;
  }
  const gx = target.x + target.width / 2;
  const gy = target.y + target.height / 2;
  const dx = gx - ship.x;
  const dy = gy - ship.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const trajSpeed = Math.hypot(ship.vx, ship.vy);
  let offsetDeg = 0;
  if (trajSpeed > 0.01) {
    const trajAngle = Math.atan2(ship.vy, ship.vx);
    const delta = angle - trajAngle;
    offsetDeg = ((delta * 180) / Math.PI + 540) % 360 - 180;
  }

  const arrowCenterX = screenW / 2;
  const arrowCenterY = 40;
  const arrowLen = 22;

  ctx.save();
  ctx.translate(arrowCenterX, arrowCenterY);
  ctx.rotate(angle);
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-arrowLen, 0);
  ctx.lineTo(arrowLen, 0);
  ctx.lineTo(arrowLen - 6, -6);
  ctx.moveTo(arrowLen, 0);
  ctx.lineTo(arrowLen - 6, 6);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "lime";
  ctx.font = `16px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(`${label}: ${Math.round(distance)}u`, arrowCenterX, arrowCenterY + 24);
  const headingLabel = trajSpeed > 0.01
    ? `Offset: ${offsetDeg.toFixed(0)}deg`
    : "Offset: --";
  ctx.fillText(headingLabel, arrowCenterX, arrowCenterY + 42);
  ctx.restore();
}

function drawFuelGauge(ctx, ship, screenW, screenH, isCompact) {
  const edge = isCompact ? 12 : 20;
  const panelW = Math.min(isCompact ? 260 : 320, screenW - edge * 2);
  const panelH = isCompact ? 70 : 78;
  const x = edge;
  const y = screenH - panelH - (isCompact ? 10 : 16);
  const barW = panelW - 24;
  const barH = isCompact ? 9 : 10;
  const barX = x + 12;
  const barY = y + panelH - (isCompact ? 16 : 18);
  const ratio = ship.maxFuel > 0 ? ship.fuel / ship.maxFuel : 0;
  const fillWidth = Math.max(0, Math.min(1, ratio)) * barW;
  const depleted = ship.fuel <= 0;
  const fuelValue = Math.max(0, ship.fuel).toFixed(1);

  ctx.save();
  const panelGrad = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
  panelGrad.addColorStop(0, HUD_COLORS.PANEL_START);
  panelGrad.addColorStop(1, HUD_COLORS.PANEL_END);

  ctx.beginPath();
  ctx.moveTo(x + 16, y);
  ctx.lineTo(x + panelW, y);
  ctx.lineTo(x + panelW - 12, y + panelH);
  ctx.lineTo(x, y + panelH);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = HUD_COLORS.PANEL_STROKE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
  ctx.strokeStyle = HUD_COLORS.PANEL_TICK;
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, "rgba(200, 110, 110, 0.9)");
  grad.addColorStop(0.55, HUD_COLORS.WARM);
  grad.addColorStop(1, "rgba(120, 190, 175, 0.9)");
  ctx.fillStyle = depleted ? "rgba(200, 110, 110, 0.9)" : grad;
  ctx.fillRect(barX, barY, fillWidth, barH);

  ctx.fillStyle = HUD_COLORS.PANEL_MUTED;
  ctx.font = `${isCompact ? 11 : 12}px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("FUEL", barX + 20, y + 18);
  ctx.textAlign = "right";
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.fillText(fuelValue, x + panelW - 12, y + 18);

  if (depleted) {
    ctx.fillStyle = HUD_COLORS.WARNING;
    ctx.font = `${isCompact ? 10 : 11}px ${HUD_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("Press Q to restart", x + panelW - 12, y + panelH - 8);
  }
  ctx.restore();
}

function drawStatusHud(ctx, ship, lives, surveyed, timeSpent, screenW, screenH, controlLabel = "", isCompact = false) {
  const speed = Math.hypot(ship.vx, ship.vy);
  let headingDeg = (ship.heading * 180) / Math.PI;
  headingDeg = ((headingDeg % 360) + 360) % 360;
  const edge = isCompact ? 12 : 18;
  const labels = isCompact
    ? {
      lives: "LIV",
      surveyed: "SURV",
      time: "TIME",
      speed: "SPD",
      heading: "HDG"
    }
    : {
      lives: "LIVES",
      surveyed: "SURVEYED",
      time: "TIME",
      speed: "SPEED",
      heading: "HEADING"
    };
  const lines = [
    { label: labels.lives, value: lives },
    { label: labels.surveyed, value: surveyed },
    { label: labels.time, value: `${timeSpent.toFixed(1)}s` },
    { label: labels.speed, value: speed.toFixed(1) },
    { label: labels.heading, value: `${headingDeg.toFixed(0)}deg` }
  ];
  const showControls = !isCompact && controlLabel;
  const lineH = isCompact ? 16 : 18;
  const basePad = isCompact ? 12 : 16;
  const panelW = Math.min(isCompact ? 240 : 280, screenW - edge * 2);
  const panelH = basePad * 2 + lineH * lines.length + (showControls ? lineH : 0);
  const x = edge;
  const y = edge;

  ctx.save();
  const panelGrad = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
  panelGrad.addColorStop(0, HUD_COLORS.PANEL_START);
  panelGrad.addColorStop(1, HUD_COLORS.PANEL_END);

  ctx.beginPath();
  ctx.moveTo(x + 14, y);
  ctx.lineTo(x + panelW, y);
  ctx.lineTo(x + panelW - 12, y + panelH);
  ctx.lineTo(x, y + panelH);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = HUD_COLORS.PANEL_STROKE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = HUD_COLORS.PANEL_TICK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 8);
  ctx.lineTo(x + panelW - 10, y + 8);
  ctx.stroke();

  const labelX = x + 16;
  const valueX = x + panelW - 14;
  let cursorY = y + basePad + lineH - 4;
  for (const line of lines) {
    ctx.textAlign = "left";
    ctx.fillStyle = HUD_COLORS.PANEL_MUTED;
    ctx.font = `${isCompact ? 11 : 12}px ${HUD_FONT}`;
    ctx.fillText(line.label, labelX, cursorY);
    ctx.textAlign = "right";
    ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
    ctx.font = `${isCompact ? 14 : 16}px ${HUD_FONT}`;
    ctx.fillText(line.value, valueX, cursorY);
    cursorY += lineH;
  }

  if (showControls) {
    ctx.textAlign = "left";
    ctx.fillStyle = HUD_COLORS.PANEL_MUTED;
    ctx.font = `${isCompact ? 10 : 11}px ${HUD_FONT}`;
    ctx.fillText(controlLabel, labelX, cursorY + 2);
  }
  ctx.restore();
}

function drawScoreHud(ctx, score, multiplier, pulse, screenW, screenH, isCompact) {
  const displayScore = Math.max(0, Math.floor(score));
  const scoreText = displayScore.toString().padStart(7, "0");
  const edge = isCompact ? 12 : 18;
  const panelW = Math.min(isCompact ? 260 : 320, screenW - edge * 2);
  const panelH = isCompact ? 70 : 78;
  const x = screenW - panelW - edge;
  const y = screenH - panelH - (isCompact ? 10 : 16);
  const labelX = x + 24;
  const labelY = y + (isCompact ? 16 : 18);
  const scoreFont = isCompact ? 24 : 28;
  const labelFont = isCompact ? 11 : 12;
  const badgeFont = isCompact ? 14 : 16;
  const badgeLabelFont = isCompact ? 9 : 10;
  const time = performance.now();
  const ringPulse = 0.4 + 0.6 * Math.abs(Math.sin(time / 220));
  const ringRatio = Math.min(1, (multiplier - 1) / 6);

  ctx.save();

  const panelGrad = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
  panelGrad.addColorStop(0, HUD_COLORS.PANEL_START);
  panelGrad.addColorStop(1, HUD_COLORS.PANEL_END);

  ctx.beginPath();
  ctx.moveTo(x + 24, y);
  ctx.lineTo(x + panelW, y);
  ctx.lineTo(x + panelW - 16, y + panelH);
  ctx.lineTo(x, y + panelH);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = HUD_COLORS.PANEL_STROKE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = HUD_COLORS.PANEL_TICK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 8);
  ctx.lineTo(x + panelW - 10, y + 8);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.font = `${labelFont}px ${HUD_FONT}`;
  ctx.fillText("SCORE", labelX, labelY);

  const scoreX = labelX;
  const scoreY = y + (isCompact ? 50 : 54);
  const pulseT = Math.min(1, pulse / 1.2);
  const pulseEase = Math.pow(pulseT, 0.75);
  const pulseScale = 1 + pulseEase * 0.26;
  const glow = 14 + pulseEase * 60 + pulse * 12;
  if (pulseT > 0) {
    const barW = 220 + pulseEase * 180;
    const barH = 14 + pulseEase * 10;
    const barX = scoreX - 16;
    const barY = scoreY - 30 - pulseEase * 14;
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    barGrad.addColorStop(0.5, `rgba(120, 200, 190, ${0.7 * pulseEase + 0.25})`);
    barGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW, barH);

    const bar2W = 140 + pulseEase * 120;
    const bar2H = 8 + pulseEase * 6;
    const bar2X = scoreX - 6;
    const bar2Y = scoreY + 8 + pulseEase * 6;
    const bar2Grad = ctx.createLinearGradient(bar2X, 0, bar2X + bar2W, 0);
    bar2Grad.addColorStop(0, "rgba(0, 0, 0, 0)");
    bar2Grad.addColorStop(0.5, `rgba(170, 210, 205, ${0.55 * pulseEase + 0.2})`);
    bar2Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = bar2Grad;
    ctx.fillRect(bar2X, bar2Y, bar2W, bar2H);
  }

  ctx.font = `bold ${scoreFont}px ${HUD_FONT}`;
  const scoreMetrics = ctx.measureText(scoreText);
  const platePadX = isCompact ? 18 : 22;
  const platePadY = isCompact ? 8 : 10;
  const plateW = scoreMetrics.width + platePadX * 2;
  const plateH = scoreFont + platePadY * 2;
  const plateX = scoreX - platePadX;
  const plateY = scoreY - scoreFont - platePadY + 4;
  const plateGrad = ctx.createLinearGradient(plateX, plateY, plateX + plateW, plateY + plateH);
  plateGrad.addColorStop(0, "rgba(6, 10, 12, 0.92)");
  plateGrad.addColorStop(1, "rgba(12, 18, 22, 0.88)");
  ctx.fillStyle = plateGrad;
  ctx.fillRect(plateX, plateY, plateW, plateH);
  ctx.strokeStyle = "rgba(220, 235, 235, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  ctx.save();
  ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
  ctx.shadowBlur = glow + 10;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillText(scoreText, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillText(scoreText, 0, 0);
  ctx.restore();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
  ctx.lineWidth = 3.5;
  ctx.save();
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.strokeText(scoreText, 0, 0);
  ctx.restore();

  const badgeR = isCompact ? 13 : 15;
  const badgeX = x + panelW - (isCompact ? 34 : 38);
  const badgeY = y + panelH / 2 + 6;
  const badgeGrad = ctx.createRadialGradient(
    badgeX - 4,
    badgeY - 4,
    4,
    badgeX,
    badgeY,
    badgeR
  );
  badgeGrad.addColorStop(0, "rgba(220, 200, 170, 0.95)");
  badgeGrad.addColorStop(1, "rgba(170, 130, 100, 0.95)");

  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = badgeGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(230, 235, 235, 0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = `rgba(190, 200, 190, ${0.35 + ringPulse * 0.5})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    badgeX,
    badgeY,
    badgeR + 6,
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * ringRatio
  );
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(8, 12, 16, 0.9)";
  ctx.font = `${badgeFont}px ${HUD_FONT}`;
  ctx.fillText(`x${multiplier}`, badgeX, badgeY + 6);
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.font = `${badgeLabelFont}px ${HUD_FONT}`;
  ctx.fillText("MULTI", badgeX, labelY);

  ctx.restore();
}

function normalizeAngle(angle) {
  return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
}

function drawCompassHud(ctx, ship, activeSectors, enemies, fuelPickups, screenW, screenH) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }

  const range = MINIMAP.RANGE;
  const width = Math.min(COMPASS.WIDTH, screenW - 100);
  if (width < 200) {
    return;
  }
  const height = COMPASS.HEIGHT;
  const centerX = screenW / 2;
  const centerY = screenH - COMPASS.Y_OFFSET;
  const halfWidth = width / 2;
  const halfFov = COMPASS.FOV / 2;
  const top = centerY - height / 2;
  const bottom = centerY + height / 2;
  const notch = 18;

  ctx.save();
  const panelGrad = ctx.createLinearGradient(centerX - halfWidth, top, centerX + halfWidth, bottom);
  panelGrad.addColorStop(0, HUD_COLORS.PANEL_START);
  panelGrad.addColorStop(1, HUD_COLORS.PANEL_END);

  ctx.beginPath();
  ctx.moveTo(centerX - halfWidth + notch, top);
  ctx.lineTo(centerX + halfWidth, top);
  ctx.lineTo(centerX + halfWidth - notch, bottom);
  ctx.lineTo(centerX - halfWidth, bottom);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = HUD_COLORS.PANEL_STROKE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = HUD_COLORS.PANEL_TICK;
  ctx.lineWidth = 1;
  for (let deg = -90; deg <= 90; deg += COMPASS.TICK_DEG) {
    const rel = (deg * Math.PI) / 180;
    const x = centerX + (rel / halfFov) * halfWidth;
    const major = deg % 30 === 0;
    const len = major ? 12 : 7;
    ctx.beginPath();
    ctx.moveTo(x, centerY - len / 2);
    ctx.lineTo(x, centerY + len / 2);
    ctx.stroke();
  }

  ctx.strokeStyle = HUD_COLORS.ACCENT;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX, top + 6);
  ctx.lineTo(centerX, bottom - 6);
  ctx.stroke();
  ctx.restore();

  const laneFuel = centerY - 24;
  const laneEnd = centerY - 12;
  const laneEnemy = centerY + 2;
  const laneStar = centerY + 14;
  const laneAsteroid = centerY + 22;

  function drawMark(tx, ty, laneY, baseAlpha, drawFn) {
    const dx = tx - ship.x;
    const dy = ty - ship.y;
    const dist = Math.hypot(dx, dy);
    if (dist > range) {
      return;
    }
    const rel = normalizeAngle(Math.atan2(dx, -dy) - ship.heading);
    if (Math.abs(rel) > halfFov) {
      return;
    }
    const x = centerX + (rel / halfFov) * halfWidth;
    const falloff = 0.4 + 0.6 * (1 - dist / range);
    const alpha = baseAlpha * Math.max(0, Math.min(1, falloff));
    drawFn(x, laneY, alpha);
  }

  function drawEnemyMark(x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.shadowColor = "rgba(200, 110, 110, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(200, 110, 110, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(7, 7);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(230, 235, 235, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawStarMark(x, y, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-3, -3, 6, 6);
    ctx.restore();
  }

  function drawAsteroidMark(x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.strokeStyle = HUD_COLORS.ASTEROID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(3, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawEndZoneMark(x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = HUD_COLORS.ACCENT;
    ctx.strokeStyle = "rgba(40, 90, 80, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(-5, -5, 10, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawFuelMark(x, y, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = HUD_COLORS.WARM;
    ctx.strokeStyle = "rgba(230, 235, 235, 0.6)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(4, -6);
    ctx.arc(4, 0, 6, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-4, 6);
    ctx.arc(-4, 0, 6, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(90, 70, 50, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.lineTo(2, -1);
    ctx.stroke();
    ctx.restore();
  }

  for (const enemy of enemies) {
    drawMark(enemy.x, enemy.y, laneEnemy, 1, drawEnemyMark);
  }

  for (const sector of activeSectors) {
    if (!sector.goalDelivered && sector.endZone) {
      const endZone = sector.endZone;
      const ex = endZone.x + endZone.width / 2;
      const ey = endZone.y + endZone.height / 2;
      drawMark(ex, ey, laneEnd, 0.95, drawEndZoneMark);
    }
  }

  for (const fuel of fuelPickups) {
    drawMark(fuel.x, fuel.y, laneFuel, 0.95, drawFuelMark);
  }

  for (const sector of activeSectors) {
    for (const star of sector.stars) {
      const color = star.minimapColor ?? star.bodyColor ?? "white";
      drawMark(star.x, star.y, laneStar, 0.55, (x, y, alpha) => {
        drawStarMark(x, y, alpha, color);
      });
    }
  }

  for (const sector of activeSectors) {
    for (const asteroid of sector.asteroids) {
      drawMark(asteroid.x, asteroid.y, laneAsteroid, 0.25, drawAsteroidMark);
    }
  }
}

function getNearestScanTarget(ship, activeSectors) {
  let nearest = null;
  for (const sector of activeSectors) {
    if (sector.goalDelivered || !sector.endZone) {
      continue;
    }
    const ex = sector.endZone.x + sector.endZone.width / 2;
    const ey = sector.endZone.y + sector.endZone.height / 2;
    const dx = ex - ship.x;
    const dy = ey - ship.y;
    const dist2 = dx * dx + dy * dy;
    if (!nearest || dist2 < nearest.dist2) {
      nearest = { x: ex, y: ey, dist2 };
    }
  }
  return nearest;
}

function drawScanPulse(ctx, ship, activeSectors, timeMs, viewRadius) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }
  const target = getNearestScanTarget(ship, activeSectors);
  if (!target) {
    return;
  }
  const dist = Math.hypot(target.x - ship.x, target.y - ship.y);
  if (dist > viewRadius + SCAN_PULSE.RADIUS_MAX) {
    return;
  }

  const t = (timeMs % SCAN_PULSE.PERIOD) / SCAN_PULSE.PERIOD;
  const radius = SCAN_PULSE.RADIUS_MIN
    + (SCAN_PULSE.RADIUS_MAX - SCAN_PULSE.RADIUS_MIN) * t;
  const alpha = 0.5 * (1 - t);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(120, 200, 190, ${alpha})`;
  ctx.lineWidth = SCAN_PULSE.LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, enemiesInRange, screenW, screenH) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }

  const scanTargets = [];
  for (const sector of activeSectors) {
    if (!sector.goalDelivered && sector.endZone) {
      const ex = sector.endZone.x + sector.endZone.width / 2;
      const ey = sector.endZone.y + sector.endZone.height / 2;
      const dx = ex - ship.x;
      const dy = ey - ship.y;
      scanTargets.push({ x: ex, y: ey, dist2: dx * dx + dy * dy });
    }
  }
  scanTargets.sort((a, b) => a.dist2 - b.dist2);

  const hasFuel = fuelPickups && fuelPickups.length > 0;
  const hasEnemies = enemiesInRange && enemiesInRange.length > 0;
  if (scanTargets.length === 0 && !hasFuel && !hasEnemies) {
    return;
  }

  const centerX = screenW / 2;
  const centerY = screenH / 2;
  const scanColor = HUD_COLORS.ACCENT;
  const scanGlow = HUD_COLORS.ACCENT_GLOW;
  const fuelColor = HUD_COLORS.PANEL_TEXT;
  const dangerColor = HUD_COLORS.ENEMY;
  const dangerGlow = "rgba(255, 90, 90, 0.9)";

  function drawDot(angle, size, alpha, color, glow) {
    const x = centerX + Math.cos(angle) * BEARING.RADIUS;
    const y = centerY + Math.sin(angle) * BEARING.RADIUS;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawChevronPair(angle, alpha, scale = 1, phase = 0, style = null) {
    const time = performance.now();
    const pulseBase = style?.pulseBase ?? 0.85;
    const pulseRange = style?.pulseRange ?? 0.15;
    const pulseSpeed = style?.pulseSpeed ?? BEARING.PULSE_SPEED;
    const driftSpeed = style?.driftSpeed ?? BEARING.DRIFT_SPEED;
    const driftAmp = style?.driftAmp ?? BEARING.DRIFT_AMPLITUDE;
    let pulse = pulseBase + pulseRange * Math.sin(time * pulseSpeed + phase);
    if (style?.flickerSpeed) {
      pulse *= 0.75 + 0.25 * Math.sin(time * style.flickerSpeed + phase * 1.7);
    }
    const drift = Math.sin(time * driftSpeed + phase) * driftAmp;
    const radius = BEARING.RADIUS + drift;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const len = BEARING.CHEVRON_LENGTH * scale;
    const width = BEARING.CHEVRON_WIDTH * scale;
    const gap = BEARING.CHEVRON_GAP * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha * pulse;
    ctx.strokeStyle = style?.color ?? scanColor;
    ctx.lineWidth = style?.lineWidth ?? 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = style?.glow ?? scanGlow;
    ctx.shadowBlur = style?.glowBlur ?? 8;

    const drawChevron = (offset) => {
      ctx.beginPath();
      ctx.moveTo(-len + offset, -width);
      ctx.lineTo(offset, 0);
      ctx.lineTo(-len + offset, width);
      ctx.stroke();
    };

    drawChevron(0);
    drawChevron(-gap);
    ctx.restore();
  }

  const scanStyle = {
    color: scanColor,
    glow: scanGlow,
    lineWidth: 2,
    glowBlur: 8,
    pulseBase: 0.85,
    pulseRange: 0.15,
    pulseSpeed: BEARING.PULSE_SPEED,
    driftSpeed: BEARING.DRIFT_SPEED,
    driftAmp: BEARING.DRIFT_AMPLITUDE
  };
  const dangerStyle = {
    color: dangerColor,
    glow: dangerGlow,
    lineWidth: 2.6,
    glowBlur: 12,
    pulseBase: 0.7,
    pulseRange: 0.4,
    pulseSpeed: BEARING.DANGER_PULSE_SPEED,
    flickerSpeed: BEARING.DANGER_FLICKER_SPEED,
    driftSpeed: BEARING.DANGER_DRIFT_SPEED,
    driftAmp: BEARING.DRIFT_AMPLITUDE * 1.4
  };

  if (scanTargets.length > 0) {
    const primary = scanTargets[0];
    const angle = Math.atan2(primary.y - ship.y, primary.x - ship.x);
    drawChevronPair(angle, BEARING.SCAN_PRIMARY_ALPHA, 1, 0, scanStyle);
  }
  if (scanTargets.length > 1) {
    const secondary = scanTargets[1];
    const angle = Math.atan2(secondary.y - ship.y, secondary.x - ship.x);
    drawChevronPair(angle, BEARING.SCAN_SECONDARY_ALPHA, 0.85, Math.PI / 2, scanStyle);
  }

  if (hasEnemies) {
    enemiesInRange.forEach((enemy, index) => {
      const dx = enemy.x - ship.x;
      const dy = enemy.y - ship.y;
      const dist = Math.hypot(dx, dy);
      const distScale = 0.5 + 0.5 * (1 - Math.min(1, dist / MINIMAP.RANGE));
      const angle = Math.atan2(dy, dx);
      const phase = index * (Math.PI / 3);
      drawChevronPair(angle, BEARING.DANGER_ALPHA * distScale, 1.05, phase, dangerStyle);
    });
  }

  if (hasFuel) {
    const nearestFuel = fuelPickups
      .map((fuel) => {
        const dx = fuel.x - ship.x;
        const dy = fuel.y - ship.y;
        return {
          angle: Math.atan2(dy, dx),
          dist2: dx * dx + dy * dy
        };
      })
      .sort((a, b) => a.dist2 - b.dist2)
      .slice(0, BEARING.FUEL_MAX_DOTS);

    for (const fuel of nearestFuel) {
      drawDot(fuel.angle, BEARING.FUEL_SIZE, BEARING.FUEL_ALPHA, fuelColor);
    }
  }
}

function drawMouseReticle(ctx, mouse, screenW, screenH, active) {
  if (!active || !mouse?.hasMoved) {
    return;
  }
  if (mouse.x < 0 || mouse.y < 0 || mouse.x > screenW || mouse.y > screenH) {
    return;
  }

  const size = 10;
  ctx.save();
  ctx.translate(mouse.x, mouse.y);
  ctx.strokeStyle = HUD_COLORS.ACCENT;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.lineTo(-4, 0);
  ctx.moveTo(size, 0);
  ctx.lineTo(4, 0);
  ctx.moveTo(0, -size);
  ctx.lineTo(0, -4);
  ctx.moveTo(0, size);
  ctx.lineTo(0, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTouchControls(ctx, touch, screenW, screenH) {
  const showHints = touch?.isActive || screenW < 900 || screenH < 700;
  if (!showHints) {
    return;
  }

  const baseRadius = Math.min(70, Math.max(48, Math.min(screenW, screenH) * 0.12));
  const baseX = touch.moveId !== null ? touch.moveStartX : screenW * 0.18;
  const baseY = touch.moveId !== null ? touch.moveStartY : screenH * 0.78;
  const knobX = touch.moveId !== null ? touch.moveX : baseX;
  const knobY = touch.moveId !== null ? touch.moveY : baseY;

  ctx.save();
  ctx.globalAlpha = touch.moveId !== null ? TOUCH.ACTIVE_ALPHA : TOUCH.HINT_ALPHA;
  ctx.strokeStyle = HUD_COLORS.ACCENT_SOFT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(baseX, baseY, baseRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = HUD_COLORS.ACCENT;
  ctx.globalAlpha = touch.moveId !== null ? 0.5 : 0.25;
  ctx.beginPath();
  ctx.arc(knobX, knobY, baseRadius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const fireRadius = Math.min(48, Math.max(30, Math.min(screenW, screenH) * 0.08));
  const fireX = screenW * 0.82;
  const fireY = screenH * 0.78;
  ctx.save();
  ctx.globalAlpha = touch.fireId !== null ? TOUCH.ACTIVE_ALPHA : TOUCH.HINT_ALPHA;
  ctx.strokeStyle = HUD_COLORS.WARNING;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(fireX, fireY, fireRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBackgroundEvents(ctx, events, clock, ship, screenW, screenH) {
  if (!events || events.length === 0) {
    return;
  }

  const fadeIn = 0.18;
  const fadeOut = 0.18;

  for (const evt of events) {
    const elapsed = clock - evt.start;
    const t = Math.max(0, Math.min(1, elapsed / evt.duration));
    let alpha = 1;
    if (t < fadeIn) {
      alpha = t / fadeIn;
    } else if (t > 1 - fadeOut) {
      alpha = (1 - t) / fadeOut;
    }

    if (alpha <= 0) {
      continue;
    }

    const driftX = evt.driftX * elapsed;
    const driftY = evt.driftY * elapsed;
    const screenX = screenW / 2 + (evt.worldX - ship.x) * evt.parallax + driftX;
    const screenY = screenH / 2 + (evt.worldY - ship.y) * evt.parallax + driftY;
    const wobble = Math.sin((clock + evt.worldX) * 0.25) * 0.15;
    const hueShift = 0.85 + 0.3 * Math.sin((clock + evt.worldY) * 0.2);
    const swapPalette = t > 0.5;
    const [colorA, colorB, colorC] = swapPalette
      ? [evt.colors[1], evt.colors[2], evt.colors[0]]
      : evt.colors;

    if (evt.type === "quasar") {
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      ctx.translate(screenX, screenY);
      ctx.rotate(evt.angle + wobble);
      const beamGrad = ctx.createLinearGradient(0, 0, evt.length, 0);
      beamGrad.addColorStop(0, rgba(colorA, 0, hueShift));
      beamGrad.addColorStop(0.5, rgba(colorB, 0.85, hueShift));
      beamGrad.addColorStop(1, rgba(colorA, 0, hueShift));
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = evt.width;
      ctx.beginPath();
      ctx.moveTo(-evt.length * 0.1, 0);
      ctx.lineTo(evt.length, 0);
      ctx.stroke();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = rgba(colorB, 0.55, hueShift);
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (evt.type === "supernova") {
      const radius = evt.radius + (evt.maxRadius - evt.radius) * t;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * 0.6;
      const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, radius);
      grad.addColorStop(0, rgba(colorA, 0.85, 1.1 * hueShift));
      grad.addColorStop(0.45, rgba(colorB, 0.55, hueShift));
      grad.addColorStop(1, rgba(colorC, 0, hueShift));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (evt.type === "nebulaBurst") {
      const radius = evt.radius * (0.8 + t * 0.6);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * 0.5;
      ctx.translate(screenX, screenY);
      ctx.rotate(evt.rotation + t * 0.8 + wobble);
      ctx.strokeStyle = rgba(colorA, 0.6, hueShift);
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -Math.PI / 3, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = rgba(colorB, 0.45, hueShift);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.7, Math.PI / 2, Math.PI * 1.1);
      ctx.stroke();
      ctx.restore();
    } else if (evt.type === "meteor") {
      const travel = evt.travel * t;
      const dirX = Math.cos(evt.angle);
      const dirY = Math.sin(evt.angle);
      ctx.save();
      ctx.globalAlpha = alpha * 0.55;
      for (let i = 0; i < evt.count; i++) {
        const offset = (i - (evt.count - 1) / 2) * 18;
        const sx = screenX + dirX * travel + -dirY * offset;
        const sy = screenY + dirY * travel + dirX * offset;
        const ex = sx + dirX * evt.length;
        const ey = sy + dirY * evt.length;
        const streak = ctx.createLinearGradient(sx, sy, ex, ey);
        streak.addColorStop(0, rgba(colorA, 0, hueShift));
        streak.addColorStop(0.6, rgba(colorB, 0.8, hueShift));
        streak.addColorStop(1, rgba(colorA, 0, hueShift));
        ctx.strokeStyle = streak;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      ctx.restore();
    } else if (evt.type === "warp") {
      const radius = evt.radius + (evt.maxRadius - evt.radius) * t;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * 0.4;
      ctx.strokeStyle = rgba(colorA, 0.7, hueShift);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = rgba(colorB, 0.4, hueShift);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (evt.type === "neonRibbon") {
      const wave = Math.sin(clock * 0.35 + evt.phase) * evt.bend;
      const wave2 = Math.cos(clock * 0.25 + evt.phase) * evt.bend * 0.7;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * 0.5;
      ctx.translate(screenX, screenY);
      ctx.rotate(evt.angle + wobble * 0.7);
      const grad = ctx.createLinearGradient(-evt.length / 2, 0, evt.length / 2, 0);
      grad.addColorStop(0, rgba(colorA, 0, hueShift));
      grad.addColorStop(0.45, rgba(colorB, 0.9, hueShift));
      grad.addColorStop(1, rgba(colorC, 0, hueShift));
      ctx.strokeStyle = grad;
      ctx.lineWidth = evt.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-evt.length / 2, 0);
      ctx.bezierCurveTo(-evt.length / 6, wave, evt.length / 6, wave2, evt.length / 2, 0);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.25;
      ctx.strokeStyle = rgba(colorB, 0.6, hueShift);
      ctx.lineWidth = evt.width * 2.1;
      ctx.beginPath();
      ctx.moveTo(-evt.length / 2, 0);
      ctx.bezierCurveTo(-evt.length / 6, wave, evt.length / 6, wave2, evt.length / 2, 0);
      ctx.stroke();
      ctx.restore();
    } else if (evt.type === "jellySlab") {
      const pulse = 0.92 + 0.08 * Math.sin(clock * 0.25 + evt.phase);
      const width = evt.width * pulse;
      const height = evt.height * (0.9 + 0.1 * Math.cos(clock * 0.28 + evt.phase));
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * 0.45;
      ctx.translate(screenX, screenY);
      ctx.rotate(evt.rotation + wobble * 0.4);
      ctx.save();
      ctx.scale(1, height / width);
      const radius = width / 2;
      const grad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
      grad.addColorStop(0, rgba(colorA, 0.6, hueShift));
      grad.addColorStop(0.6, rgba(colorB, 0.35, hueShift));
      grad.addColorStop(1, rgba(colorC, 0, hueShift));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.globalAlpha = alpha * 0.32;
      ctx.strokeStyle = rgba(colorB, 0.8, hueShift);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-width * 0.35, -height * 0.12);
      ctx.quadraticCurveTo(0, height * 0.05, width * 0.35, height * 0.12);
      ctx.stroke();
      ctx.restore();
    } else if (evt.type === "chromaEddy") {
      const spin = evt.spin * (0.7 + 0.3 * Math.sin(clock * 0.25 + evt.phase));
      const baseAngle = t * Math.PI * 2 * spin + evt.phase;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(screenX, screenY);
      for (let i = 0; i < evt.orbCount; i++) {
        const angle = baseAngle + (i * Math.PI * 2) / evt.orbCount;
        const dist = evt.radius * (0.6 + 0.4 * Math.sin(t * Math.PI * 2 + i));
        const ox = Math.cos(angle) * dist;
        const oy = Math.sin(angle) * dist;
        const size = evt.orbSize * (0.7 + 0.3 * Math.sin(clock * 0.4 + i));
        const orb = ctx.createRadialGradient(ox, oy, 0, ox, oy, size);
        orb.addColorStop(0, rgba(colorA, 0.8, hueShift));
        orb.addColorStop(0.6, rgba(colorB, 0.45, hueShift));
        orb.addColorStop(1, rgba(colorC, 0, hueShift));
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = orb;
        ctx.beginPath();
        ctx.arc(ox, oy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function drawScreenEffects(ctx, screenW, screenH) {
  const centerX = screenW / 2;
  const centerY = screenH / 2;
  const maxRadius = Math.max(screenW, screenH) * 0.6;
  const minRadius = Math.min(screenW, screenH) * 0.25;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
  glow.addColorStop(0, "rgba(120, 200, 190, 0.12)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, screenW, screenH);
  ctx.restore();

  ctx.save();
  const vignette = ctx.createRadialGradient(centerX, centerY, minRadius, centerX, centerY, maxRadius);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, screenW, screenH);
  ctx.restore();
}

function drawAlerts(ctx, screenW, screenH) {
  if (alerts.length === 0) {
    return;
  }
  let active = null;
  for (const alert of alerts) {
    if (alertClock >= alert.start && alertClock <= alert.start + alert.duration) {
      if (!active || alert.start > active.start) {
        active = alert;
      }
    }
  }
  if (!active) {
    return;
  }

  const elapsed = alertClock - active.start;
  const fadeWindow = Math.min(ALERT.FADE, active.duration / 2);
  let alpha = 1;
  if (elapsed < fadeWindow) {
    alpha = elapsed / fadeWindow;
  } else if (elapsed > active.duration - fadeWindow) {
    alpha = (active.duration - elapsed) / fadeWindow;
  }

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.font = `18px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = screenW * 0.25;
  const y = screenH * 0.25;
  ctx.lineWidth = 3;
  ctx.strokeStyle = HUD_COLORS.ALERT_STROKE;
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.strokeText(active.text, x, y);
  ctx.fillText(active.text, x, y);
  ctx.restore();
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      bullets.splice(i, 1);
    }
  }
}

function updateEnemyBullets(dt) {
  if (enemyBullets.length === 0) {
    return;
  }
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      enemyBullets.splice(i, 1);
      continue;
    }
    if (invulnTimer <= 0 && shipVisible) {
      const dx = b.x - ship.x;
      const dy = b.y - ship.y;
      if (Math.hypot(dx, dy) < SHIP_RADIUS) {
        enemyBullets.splice(i, 1);
        if (b.owner) {
          const ownerIndex = enemies.indexOf(b.owner);
          if (ownerIndex !== -1) {
            enemies.splice(ownerIndex, 1);
          }
          for (let j = enemyBullets.length - 1; j >= 0; j--) {
            if (enemyBullets[j].owner === b.owner) {
              enemyBullets.splice(j, 1);
            }
          }
        }
        triggerShake(SHAKE.HIT);
        lives -= 1;
        if (lives <= 0) {
          spawnExplosion(ship.x, ship.y, "normal");
          shipVisible = false;
          sounds.play("game_over");
          endGame();
          return;
        }
        spawnExplosion(ship.x, ship.y, "normal");
        sounds.play("lost_life");
        queueRespawn();
        return;
      }
    }
  }
}

function updateFuelPickups(dt, activeStars) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (const fuel of fuelPickups) {
    fuel.update(dt);
    applyGravity(fuel, activeStars, dt);
    integrate(fuel, dt);
  }
}

function handleFuelPickups() {
  if (fuelPickups.length === 0) {
    return;
  }
  for (let i = fuelPickups.length - 1; i >= 0; i--) {
    const fuel = fuelPickups[i];
    const dx = ship.x - fuel.x;
    const dy = ship.y - fuel.y;
    if (Math.hypot(dx, dy) < FUEL_PICKUP.RADIUS + SHIP_RADIUS) {
      const refillAmount = ship.maxFuel * FUEL_PICKUP_AMOUNT_RATIO;
      ship.fuel = Math.min(ship.maxFuel, ship.fuel + refillAmount);
      addScore(SCORE_POINTS.FUEL, true);
      sounds.play("got_fuel");
      fuelPickups.splice(i, 1);
    }
  }
}

function handleBulletHits(activeSectors) {
  if (bullets.length === 0) {
    return;
  }
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const dx = b.x - enemy.x;
      const dy = b.y - enemy.y;
      if (Math.hypot(dx, dy) < ENEMY_HIT_RADIUS + 3) {
        spawnExplosion(enemy.x, enemy.y, "normal");
        spawnFuelDrop(enemy, true);
        sounds.play("explosion");
        spawnEnemyChunks(enemy);
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        addScore(SCORE_POINTS.ENEMY, true, true);
        hit = true;
        break;
      }
    }
    if (hit) {
      continue;
    }
    for (const sector of activeSectors) {
      for (let j = sector.asteroids.length - 1; j >= 0; j--) {
        const a = sector.asteroids[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < a.radius + 3) {
          spawnFuelDrop(a);
          const isChunk = a.spriteKey === "chunk";
          const basePoints = isChunk
            ? Math.round(SCORE_POINTS.ASTEROID * SCORE_CHUNK_MULTIPLIER)
            : SCORE_POINTS.ASTEROID;
          addScore(basePoints, true, true);
          spawnExplosion(a.x, a.y, "normal");
          sounds.play("explosion");
          if (a.spriteKey !== "chunk") {
            spawnAsteroidFragments(a, sector);
          }
          sector.asteroids.splice(j, 1);
          bullets.splice(i, 1);
          hit = true;
          break;
        }
      }
      if (hit) {
        break;
      }
    }
  }
}

function drawBullets(ctx) {
  if (bullets.length === 0) {
    return;
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const b of bullets) {
    ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 120, 120, 0.5)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEnemyBullets(ctx) {
  if (enemyBullets.length === 0) {
    return;
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const b of enemyBullets) {
    ctx.fillStyle = "rgba(255, 60, 60, 0.9)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 120, 120, 0.5)";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFuelPickups(ctx) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (const fuel of fuelPickups) {
    fuel.draw(ctx);
  }
}

function spawnBullet() {
  const fx = Math.sin(ship.heading);
  const fy = -Math.cos(ship.heading);
  const offset = 14;
  bullets.push({
    x: ship.x + fx * offset,
    y: ship.y + fy * offset,
    vx: fx * BULLET.SPEED,
    vy: fy * BULLET.SPEED,
    life: BULLET.LIFE
  });
}

function updateEnemies(dt, activeStars) {
  const inRange = [];
  for (const enemy of enemies) {
    const dx = ship.x - enemy.x;
    const dy = ship.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const isInRange = dist <= MINIMAP.RANGE;
    if (isInRange) {
      inRange.push(enemy);
    }
    enemy.update(dt, ship.x, ship.y, true);
    applyGravity(enemy, activeStars, dt);
    integrate(enemy, dt);
    if (enemy.canFire() && dist <= ENEMY_FIRE_RANGE) {
      sounds.play("enemy_laser");
      spawnEnemyBullet(enemy);
      enemy.resetFireCooldown(ENEMY.FIRE_COOLDOWN);
    }
  }
  return inRange;
}

function drawEnemies(ctx) {
  for (const enemy of enemies) {
    enemy.draw(ctx);
  }
}

function spawnEnemyBullet(enemy) {
  const fx = Math.sin(enemy.heading);
  const fy = -Math.cos(enemy.heading);
  const offset = 14;
  enemyBullets.push({
    x: enemy.x + fx * offset,
    y: enemy.y + fy * offset,
    vx: fx * BULLET.SPEED,
    vy: fy * BULLET.SPEED,
    life: ENEMY_BULLET_LIFE,
    owner: enemy
  });
}

function getEnemySpawnCountForSector(currentSector) {
  if (!currentSector || currentSector.zone === "start") {
    return 0;
  }
  if (currentSector.zone === "outer") {
    return Math.random() < 0.5 ? 1 : 2;
  }
  return Math.random() < 0.5 ? 1 : 0;
}

function spawnEnemyForSurvey() {
  const desired = getEnemySpawnCountForSector(sector);
  if (desired <= 0) {
    return 0;
  }
  let spawned = 0;
  for (let i = 0; i < desired; i++) {
    const spawn = findEnemySpawnPoint();
    if (!spawn) {
      console.log("[enemy] spawn failed", {
        surveyed,
        enemiesSpawned
      });
      break;
    }
    const enemy = new EnemyShip(spawn.x, spawn.y);
    const dx = spawn.targetX - spawn.x;
    const dy = spawn.targetY - spawn.y;
    enemy.heading = Math.atan2(dx, -dy);
    enemies.push(enemy);
    enemyPings.push({ x: spawn.x, y: spawn.y, life: 1.2, maxLife: 1.2 });
    enemiesSpawned += 1;
    spawned += 1;
    console.log("[enemy] spawned", {
      x: spawn.x,
      y: spawn.y,
      sector: `${sector.sx},${sector.sy}`,
      enemiesSpawned
    });
  }
  return spawned;
}

function findEnemySpawnPoint() {
  if (!sector || !sector.goalDelivered) {
    return null;
  }
  const bounds = sector.bounds;
  const viewRadius = getViewRadius(canvas, camera);
  const minDist = viewRadius + ENEMY.SPAWN_MARGIN;
  const maxDist = MINIMAP.RANGE - 120;
  let best = null;

  for (let i = 0; i < 25; i++) {
    const x = bounds.x + Math.random() * bounds.size;
    const y = bounds.y + Math.random() * bounds.size;
    const dx = x - ship.x;
    const dy = y - ship.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= minDist && dist <= maxDist) {
      best = { x, y };
      break;
    }
  }

  if (!best) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.min(maxDist, minDist + 120);
    const x = ship.x + Math.cos(angle) * dist;
    const y = ship.y + Math.sin(angle) * dist;
    best = { x, y };
  }

  return {
    x: best.x,
    y: best.y,
    targetX: ship.x,
    targetY: ship.y
  };
}

function spawnAsteroidFragments(asteroid, sector) {
  const fragmentCount = 2 + Math.floor(Math.random() * 4);
  const baseSpeed = Math.hypot(asteroid.vx, asteroid.vy);
  for (let i = 0; i < fragmentCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = baseSpeed * (0.2 + Math.random() * 0.6) + 30 + Math.random() * 150;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const fragmentRadius = Math.max(4, asteroid.radius * (0.25 + Math.random() * 0.3));
    sector.asteroids.push(
      new Asteroid(asteroid.x, asteroid.y, vx, vy, fragmentRadius, 0, null, "chunk")
    );
  }
}

function spawnFuelDrop(source, guaranteed = false) {
  if (!guaranteed && Math.random() > FUEL_PICKUP.DROP_CHANCE) {
    return;
  }
  fuelPickups.push(new FuelPickup(source.x, source.y, source.vx, source.vy));
}

function updateEnemyPings(dt) {
  for (let i = enemyPings.length - 1; i >= 0; i--) {
    enemyPings[i].life -= dt;
    if (enemyPings[i].life <= 0) {
      enemyPings.splice(i, 1);
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update(dt);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles(ctx) {
  if (particles.length === 0) {
    return;
  }
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const p of particles) {
    p.draw(ctx);
  }
  for (const p of particles) {
    p.draw(ctx, 2.2, 0.35);
  }
  ctx.restore();
}

function spawnExplosion(x, y, type = "normal") {
  const count = type === "star" ? 140 : 90;
  const color = type === "star" ? "#ffe6a6" : "#ffb25a";
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 260;
    const life = 0.6 + Math.random() * 0.8;
    const size = 3 + Math.random() * 5;
    particles.push(new Particle(x, y, angle, speed, life, color, size));
  }
}

function spawnEnemyChunks(enemy) {
  const count = ENEMY_CHUNK.COUNT_MIN
    + Math.floor(Math.random() * (ENEMY_CHUNK.COUNT_MAX - ENEMY_CHUNK.COUNT_MIN + 1));
  const baseSpeed = Math.hypot(enemy.vx, enemy.vy);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = ENEMY_CHUNK.SPEED_MIN
      + Math.random() * (ENEMY_CHUNK.SPEED_MAX - ENEMY_CHUNK.SPEED_MIN)
      + baseSpeed * 0.35;
    const vx = Math.cos(angle) * speed + enemy.vx * 0.4;
    const vy = Math.sin(angle) * speed + enemy.vy * 0.4;
    const size = ENEMY_CHUNK.SIZE_MIN
      + Math.random() * (ENEMY_CHUNK.SIZE_MAX - ENEMY_CHUNK.SIZE_MIN);
    const life = ENEMY_CHUNK.LIFE_MIN
      + Math.random() * (ENEMY_CHUNK.LIFE_MAX - ENEMY_CHUNK.LIFE_MIN);
    const rotSpeed = (Math.random() < 0.5 ? -1 : 1)
      * (ENEMY_CHUNK.ROT_SPEED_MIN
      + Math.random() * (ENEMY_CHUNK.ROT_SPEED_MAX - ENEMY_CHUNK.ROT_SPEED_MIN));
    particles.push(new EnemyChunk(enemy.x, enemy.y, vx, vy, size, rotSpeed, life));
  }
}


  requestAnimationFrame(loop);

  function endGame() {
    if (gameOver) {
      return;
    }
    ship.stopThrustLoop();
    music.stop();
    pendingGameOver = true;
    gameOverTimer = GAME_OVER_DELAY;
    const finalScore = Math.round(score);
    cachedGameOverStats = {
      score: finalScore,
      distanceTraveled,
      timeSpent,
      surveyed
    };
  }

  function finalizeGameOver() {
    if (gameOver) {
      return;
    }
    gameOver = true;
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    cleanupMouseControls();
    if (onGameOver) {
      onGameOver(cachedGameOverStats);
    }
  }

  function exitToMenu() {
    if (!running) {
      return;
    }
    running = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    ship.stopThrustLoop();
    ship.stopRotateLoop();
    music.stop();
    cleanupMouseControls();
  }

  function updateZoom(dt) {
    let zoomDir = 0;
    if (keys["z"]) zoomDir -= 1;
    if (keys["x"]) zoomDir += 1;
    const zoomDelta = zoomDir * ZOOM.SPEED * dt + wheelZoomStep;
    if (zoomDelta === 0) {
      return;
    }
    wheelZoomStep = 0;
    camera.zoom += zoomDelta;
    if (camera.zoom < ZOOM.MIN) camera.zoom = ZOOM.MIN;
    if (camera.zoom > ZOOM.MAX) camera.zoom = ZOOM.MAX;
  }

  return {
    stop: endGame,
    exitToMenu
  };
}
window.startGame = startGame;
})();
// ===== FILE: src/main.js =====
(function(){
"use strict";



const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const uiRoot = document.getElementById("ui-root");
let gameController = null;
let escListener = null;

function beginGame() {
  if (escListener) {
    window.removeEventListener("keydown", escListener);
    escListener = null;
  }
  gameController = startGame(canvas, ctx, (stats) => {
    if (escListener) {
      window.removeEventListener("keydown", escListener);
      escListener = null;
    }
    gameController = null;
    showGameOverModal(uiRoot, stats, () => {
      showStartScreen(uiRoot, beginGame);
    });
  });

  escListener = (event) => {
    if (event.code !== "Escape") {
      return;
    }
    event.preventDefault();
    if (!gameController) {
      return;
    }
    const controller = gameController;
    gameController = null;
    if (escListener) {
      window.removeEventListener("keydown", escListener);
      escListener = null;
    }
    if (typeof controller.exitToMenu === "function") {
      controller.exitToMenu();
    }
    showStartScreen(uiRoot, beginGame);
  };
  window.addEventListener("keydown", escListener);
}

showStartScreen(uiRoot, beginGame);
})();