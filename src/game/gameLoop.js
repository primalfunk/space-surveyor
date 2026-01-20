import { Ship } from "../entities/ship.js";
import { Asteroid } from "../entities/asteroid.js";
import { EnemyShip } from "../entities/enemyShip.js";
import { Camera } from "./camera.js";
import { SectorManager, SECTOR_SIZE } from "./sectorManager.js";
import { applyGravity, integrate } from "./physics.js";
import { sounds, music } from "./audio.js";

const DEBUG = {
  VECTORS: true
};

const ZOOM = {
  MIN: 0.4,
  MAX: 2.0,
  SPEED: 0.7
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
  FUEL_ALPHA: 0.3
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
const SHAKE = {
  DURATION: 0.35,
  HIT: 6,
  SURVEY: 3
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

function drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, screenW, screenH) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }
  const size = MINIMAP.SIZE;
  const range = MINIMAP.RANGE;

  const x0 = screenW - size - 20;
  const y0 = 20;
  const cx = x0 + size / 2;
  const cy = y0 + size / 2;

  ctx.save();

  // background
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(x0, y0, size, size);

  ctx.strokeStyle = "white";
  ctx.strokeRect(x0, y0, size, size);

  // completed sector background tint
  for (const sector of activeSectors) {
    if (!sector.goalDelivered) {
      continue;
    }
    const bx0 = cx + ((sector.bounds.x - ship.x) / range) * (size / 2);
    const by0 = cy + ((sector.bounds.y - ship.y) / range) * (size / 2);
    const bSize = (sector.bounds.size / range) * (size / 2);
    ctx.fillStyle = "rgba(120, 255, 140, 0.08)";
    ctx.fillRect(bx0, by0, bSize, bSize);
  }

  // ship (center)
  ctx.fillStyle = "white";
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
      ctx.strokeStyle = `rgba(255, 120, 120, ${0.6 * (1 - t)})`;
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

    ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
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
      ctx.fillStyle = `rgba(255, 80, 80, ${0.5 + pulse * 0.5})`;
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
        ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
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
        ctx.fillStyle = "rgba(120, 255, 120, 0.9)";
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}


export function startGame(canvas, ctx, onGameOver) {
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
  let starfieldW = 0;
  let starfieldH = 0;
  const STARFIELD_PARALLAX = 0.03;
  const DUSTFIELD_PARALLAX = 0.015;
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
  let enemiesSpawned = 0;
  let enemiesInRange = [];
  const enemyPings = [];
  let alertClock = 0;
  let shakeTime = 0;
  let shakeDuration = 0;
  let shakeStrength = 0;

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
    ship.update(dt);
    timeSpent += dt;
    if (invulnTimer > 0) {
      invulnTimer = Math.max(0, invulnTimer - dt);
    }
    if (fireCooldown > 0) {
      fireCooldown = Math.max(0, fireCooldown - dt);
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

    if (shipVisible && keys[" "] && fireCooldown === 0) {
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
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  // World (rotated)
  camera.applyTransform(ctx, canvas);
  const shipSpeed = Math.hypot(ship.vx, ship.vy);
  drawTrail(ctx, trail, shipSpeed);
  drawSectorBounds(ctx, sector);
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
    ship.draw(ctx);
  }
  camera.resetTransform(ctx);

  if (DEBUG.VECTORS) {
    drawDebugVectors(ctx, ship);
  }
  drawScreenEffects(ctx, canvas.width, canvas.height);
  drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, canvas.width, canvas.height);
  drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, canvas.width, canvas.height);
  drawFuelGauge(ctx, ship, canvas.width, canvas.height);
  drawStatusHud(ctx, ship, lives, surveyed, timeSpent, canvas.width, canvas.height);
  drawScoreHud(ctx, score, scoreMultiplier, scorePulse, canvas.width, canvas.height);
  drawCompassHud(ctx, ship, activeSectors, enemies, fuelPickups, canvas.width, canvas.height);
  drawAlerts(ctx, canvas.width, canvas.height);
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
  ctx.lineWidth = 3;
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

function drawFuelGauge(ctx, ship, screenW, screenH) {
  const panelW = 320;
  const panelH = 78;
  const x = 20;
  const y = screenH - panelH - 16;
  const barW = panelW - 24;
  const barH = 10;
  const barX = x + 12;
  const barY = y + panelH - 18;
  const ratio = ship.maxFuel > 0 ? ship.fuel / ship.maxFuel : 0;
  const fillWidth = Math.max(0, Math.min(1, ratio)) * barW;
  const depleted = ship.fuel <= 0;
  const fuelValue = Math.max(0, ship.fuel).toFixed(1);

  ctx.save();
  const panelGrad = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
  panelGrad.addColorStop(0, "rgba(6, 10, 24, 0.85)");
  panelGrad.addColorStop(1, "rgba(10, 70, 110, 0.75)");

  ctx.beginPath();
  ctx.moveTo(x + 16, y);
  ctx.lineTo(x + panelW, y);
  ctx.lineTo(x + panelW - 12, y + panelH);
  ctx.lineTo(x, y + panelH);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 220, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, "rgba(255, 80, 80, 0.9)");
  grad.addColorStop(0.5, "rgba(255, 220, 80, 0.9)");
  grad.addColorStop(1, "rgba(80, 220, 120, 0.9)");
  ctx.fillStyle = depleted ? "rgba(255, 80, 80, 0.9)" : grad;
  ctx.fillRect(barX, barY, fillWidth, barH);

  ctx.fillStyle = "rgba(190, 240, 255, 0.85)";
  ctx.font = `12px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("FUEL", barX + 20, y + 18);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillText(fuelValue, x + panelW - 12, y + 18);

  if (depleted) {
    ctx.fillStyle = "rgba(255, 120, 120, 0.95)";
    ctx.font = `11px ${HUD_FONT}`;
    ctx.textAlign = "right";
    ctx.fillText("Press Q to restart", x + panelW - 12, y + panelH - 8);
  }
  ctx.restore();
}

function drawStatusHud(ctx, ship, lives, surveyed, timeSpent, screenW, screenH) {
  const speed = Math.hypot(ship.vx, ship.vy);
  let headingDeg = (ship.heading * 180) / Math.PI;
  headingDeg = ((headingDeg % 360) + 360) % 360;

  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = `16px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(`Lives: ${lives}`, 20, 24);
  ctx.fillText(`Surveyed: ${surveyed}`, 20, 44);
  ctx.fillText(`Time: ${timeSpent.toFixed(1)}s`, 20, 64);
  ctx.fillText(`Speed: ${speed.toFixed(1)}`, 20, 84);
  ctx.fillText(`Heading: ${headingDeg.toFixed(0)}deg`, 20, 104);
  ctx.restore();
}

function drawScoreHud(ctx, score, multiplier, pulse, screenW, screenH) {
  const displayScore = Math.max(0, Math.floor(score));
  const scoreText = displayScore.toString().padStart(7, "0");
  const panelW = 320;
  const panelH = 78;
  const x = screenW - panelW - 18;
  const y = screenH - panelH - 16;
  const labelX = x + 30;
  const labelY = y + 18;
  const time = performance.now();
  const ringPulse = 0.4 + 0.6 * Math.abs(Math.sin(time / 220));
  const ringRatio = Math.min(1, (multiplier - 1) / 6);

  ctx.save();

  const panelGrad = ctx.createLinearGradient(x, y, x + panelW, y + panelH);
  panelGrad.addColorStop(0, "rgba(6, 10, 24, 0.85)");
  panelGrad.addColorStop(1, "rgba(10, 70, 110, 0.75)");

  ctx.beginPath();
  ctx.moveTo(x + 24, y);
  ctx.lineTo(x + panelW, y);
  ctx.lineTo(x + panelW - 16, y + panelH);
  ctx.lineTo(x, y + panelH);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 220, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 8);
  ctx.lineTo(x + panelW - 10, y + 8);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(190, 240, 255, 0.85)";
  ctx.font = `12px ${HUD_FONT}`;
  ctx.fillText("SCORE", labelX, labelY);

  const scoreX = labelX;
  const scoreY = y + 54;
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
    barGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    barGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * pulseEase + 0.35})`);
    barGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW, barH);

    const bar2W = 140 + pulseEase * 120;
    const bar2H = 8 + pulseEase * 6;
    const bar2X = scoreX - 6;
    const bar2Y = scoreY + 8 + pulseEase * 6;
    const bar2Grad = ctx.createLinearGradient(bar2X, 0, bar2X + bar2W, 0);
    bar2Grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    bar2Grad.addColorStop(0.5, `rgba(170, 230, 255, ${0.7 * pulseEase + 0.25})`);
    bar2Grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = bar2Grad;
    ctx.fillRect(bar2X, bar2Y, bar2W, bar2H);
  }

  ctx.font = `28px ${HUD_FONT}`;
  ctx.save();
  ctx.shadowColor = "rgba(80, 220, 255, 0.75)";
  ctx.shadowBlur = glow;
  ctx.fillStyle = "rgba(150, 230, 255, 0.6)";
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillText(scoreText, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillText(scoreText, 0, 0);
  ctx.restore();
  ctx.strokeStyle = "rgba(0, 70, 110, 0.9)";
  ctx.lineWidth = 2;
  ctx.save();
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.strokeText(scoreText, 0, 0);
  ctx.restore();

  const badgeR = 15;
  const badgeX = x + panelW - 38;
  const badgeY = y + panelH / 2 + 6;
  const badgeGrad = ctx.createRadialGradient(
    badgeX - 4,
    badgeY - 4,
    4,
    badgeX,
    badgeY,
    badgeR
  );
  badgeGrad.addColorStop(0, "rgba(255, 240, 170, 0.95)");
  badgeGrad.addColorStop(1, "rgba(255, 120, 60, 0.95)");

  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.fillStyle = badgeGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = `rgba(255, 230, 150, ${0.4 + ringPulse * 0.6})`;
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
  ctx.fillStyle = "rgba(30, 10, 0, 0.9)";
  ctx.font = `16px ${HUD_FONT}`;
  ctx.fillText(`x${multiplier}`, badgeX, badgeY + 6);
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = `10px ${HUD_FONT}`;
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
  panelGrad.addColorStop(0, "rgba(6, 12, 26, 0.88)");
  panelGrad.addColorStop(1, "rgba(8, 60, 90, 0.76)");

  ctx.beginPath();
  ctx.moveTo(centerX - halfWidth + notch, top);
  ctx.lineTo(centerX + halfWidth, top);
  ctx.lineTo(centerX + halfWidth - notch, bottom);
  ctx.lineTo(centerX - halfWidth, bottom);
  ctx.closePath();
  ctx.fillStyle = panelGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(120, 220, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
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

  ctx.strokeStyle = "rgba(140, 255, 200, 0.8)";
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
    ctx.shadowColor = "rgba(255, 80, 80, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(255, 70, 70, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(7, 7);
    ctx.lineTo(-7, 7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
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
    ctx.strokeStyle = "rgba(210, 210, 210, 0.4)";
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
    ctx.fillStyle = "rgba(120, 255, 120, 0.9)";
    ctx.strokeStyle = "rgba(20, 120, 60, 0.9)";
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
    ctx.fillStyle = "rgba(255, 210, 90, 0.95)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
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

    ctx.strokeStyle = "rgba(120, 80, 20, 0.8)";
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

function drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, screenW, screenH) {
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
  if (scanTargets.length === 0 && !hasFuel) {
    return;
  }

  const centerX = screenW / 2;
  const centerY = screenH / 2;
  const scanColor = "rgba(120, 255, 140, 0.95)";
  const scanGlow = "rgba(120, 255, 160, 0.7)";
  const fuelColor = "rgba(255, 255, 255, 1)";

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

  function drawChevronPair(angle, alpha, scale = 1, phase = 0) {
    const time = performance.now();
    const pulse = 0.85 + 0.15 * Math.sin(time * BEARING.PULSE_SPEED + phase);
    const drift = Math.sin(time * BEARING.DRIFT_SPEED + phase) * BEARING.DRIFT_AMPLITUDE;
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
    ctx.strokeStyle = scanColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = scanGlow;
    ctx.shadowBlur = 8;

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

  if (scanTargets.length > 0) {
    const primary = scanTargets[0];
    const angle = Math.atan2(primary.y - ship.y, primary.x - ship.x);
    drawChevronPair(angle, BEARING.SCAN_PRIMARY_ALPHA, 1, 0);
  }
  if (scanTargets.length > 1) {
    const secondary = scanTargets[1];
    const angle = Math.atan2(secondary.y - ship.y, secondary.x - ship.x);
    drawChevronPair(angle, BEARING.SCAN_SECONDARY_ALPHA, 0.85, Math.PI / 2);
  }

  if (hasFuel) {
    for (const fuel of fuelPickups) {
      const angle = Math.atan2(fuel.y - ship.y, fuel.x - ship.x);
      drawDot(angle, BEARING.FUEL_SIZE, BEARING.FUEL_ALPHA, fuelColor);
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
  glow.addColorStop(0, "rgba(120, 190, 255, 0.12)");
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
  ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillStyle = "rgba(240, 245, 255, 0.95)";
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
  }

  function updateZoom(dt) {
    let zoomDir = 0;
    if (keys["z"]) zoomDir -= 1;
    if (keys["x"]) zoomDir += 1;
    if (zoomDir === 0) {
      return;
    }
    camera.zoom += zoomDir * ZOOM.SPEED * dt;
    if (camera.zoom < ZOOM.MIN) camera.zoom = ZOOM.MIN;
    if (camera.zoom > ZOOM.MAX) camera.zoom = ZOOM.MAX;
  }

  return {
    stop: endGame,
    exitToMenu
  };
}
