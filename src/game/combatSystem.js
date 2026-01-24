import { Asteroid } from "../entities/asteroid.js";
import { integrate } from "./physics.js";
import { applyForcesToEntity } from "./forceFields.js";
import { CONFIG } from "./config.js";

const { PICKUPS, ENEMY, ASTEROID } = CONFIG;
const FUEL_PICKUP_AMOUNT_RATIO = PICKUPS.FUEL.AMOUNT_RATIO;
const ENEMY_HIT_RADIUS = ENEMY.HIT_RADIUS;
const ENEMY_CHUNK_SPRITE = new Image();
ENEMY_CHUNK_SPRITE.src = PICKUPS.ENEMY_CHUNK.SPRITE_SRC;
const ENEMY_CHUNK = {
  COUNT_MIN: PICKUPS.ENEMY_CHUNK.COUNT_MIN,
  COUNT_MAX: PICKUPS.ENEMY_CHUNK.COUNT_MAX,
  SPEED_MIN: PICKUPS.ENEMY_CHUNK.SPEED_MIN,
  SPEED_MAX: PICKUPS.ENEMY_CHUNK.SPEED_MAX,
  SIZE_MIN: PICKUPS.ENEMY_CHUNK.SIZE_MIN,
  SIZE_MAX: PICKUPS.ENEMY_CHUNK.SIZE_MAX,
  LIFE_MIN: PICKUPS.ENEMY_CHUNK.LIFE_MIN,
  LIFE_MAX: PICKUPS.ENEMY_CHUNK.LIFE_MAX,
  ROT_SPEED_MIN: PICKUPS.ENEMY_CHUNK.ROT_SPEED_MIN,
  ROT_SPEED_MAX: PICKUPS.ENEMY_CHUNK.ROT_SPEED_MAX
};
const FUEL_SPRITE = new Image();
FUEL_SPRITE.src = PICKUPS.FUEL.SPRITE_SRC;
const FUEL_PICKUP = {
  WIDTH: PICKUPS.FUEL.WIDTH,
  HEIGHT: PICKUPS.FUEL.HEIGHT,
  RADIUS: PICKUPS.FUEL.RADIUS,
  DROP_CHANCE: PICKUPS.FUEL.DROP_CHANCE,
  ROT_SPEED_MIN: PICKUPS.FUEL.ROT_SPEED_MIN,
  ROT_SPEED_MAX: PICKUPS.FUEL.ROT_SPEED_MAX
};
const ASTEROID_FRAGMENTS = ASTEROID.FRAGMENTS;

export class Particle {
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

export function updateBullets(bullets, dt) {
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

export function updateEnemyBullets(
  enemyBullets,
  enemies,
  ship,
  shipRadius,
  invulnTimer,
  shipVisible,
  handleLifeLoss,
  dt
) {
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
      if (Math.hypot(dx, dy) < shipRadius) {
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
        handleLifeLoss("normal");
        return;
      }
    }
  }
}

function findSectorForPosition(activeSectors, x, y) {
  if (!Array.isArray(activeSectors)) {
    return null;
  }
  for (const sector of activeSectors) {
    const bounds = sector?.bounds;
    if (!bounds) {
      continue;
    }
    if (x >= bounds.x && x <= bounds.x + bounds.size
      && y >= bounds.y && y <= bounds.y + bounds.size) {
      return sector;
    }
  }
  return null;
}

export function updateFuelPickups(fuelPickups, activeStars, activeSectors, dt) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (const fuel of fuelPickups) {
    fuel.update(dt);
    const sector = findSectorForPosition(activeSectors, fuel.x, fuel.y);
    const rivers = sector?.runtimeRivers ?? [];
    applyForcesToEntity(fuel, dt, activeStars, rivers, CONFIG);
    integrate(fuel, dt);
  }
}

export function handleFuelPickups(fuelPickups, ship, shipRadius, scorePoints, addScore, sounds) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (let i = fuelPickups.length - 1; i >= 0; i--) {
    const fuel = fuelPickups[i];
    const dx = ship.x - fuel.x;
    const dy = ship.y - fuel.y;
    if (Math.hypot(dx, dy) < FUEL_PICKUP.RADIUS + shipRadius) {
      const refillAmount = ship.maxFuel * FUEL_PICKUP_AMOUNT_RATIO;
      ship.fuel = Math.min(ship.maxFuel, ship.fuel + refillAmount);
      addScore(scorePoints.FUEL, true, false, { x: fuel.x, y: fuel.y }, "fuel");
      sounds.play("got_fuel");
      fuelPickups.splice(i, 1);
    }
  }
}

export function handleBulletHits(
  bullets,
  enemies,
  activeSectors,
  scorePoints,
  scoreChunkMultiplier,
  addScore,
  sounds,
  fuelPickups,
  particles,
  worldAgeMs
) {
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
        spawnExplosion(particles, enemy.x, enemy.y, "normal");
        spawnFuelDrop(fuelPickups, enemy, true);
        sounds.play("explosion");
        spawnEnemyChunks(particles, enemy);
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        addScore(scorePoints.ENEMY, true, true, { x: enemy.x, y: enemy.y }, "enemy");
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
          spawnFuelDrop(fuelPickups, a);
          const isChunk = a.spriteKey === "chunk";
          const basePoints = isChunk
            ? Math.round(scorePoints.ASTEROID * scoreChunkMultiplier)
            : scorePoints.ASTEROID;
          addScore(basePoints, true, true, { x: a.x, y: a.y }, "asteroid");
          spawnExplosion(particles, a.x, a.y, "normal");
          sounds.play("explosion");
          if (a.spriteKey !== "chunk") {
            spawnAsteroidFragments(a, sector, worldAgeMs ?? 0);
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

export function drawBullets(ctx, bullets) {
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

export function drawEnemyBullets(ctx, enemyBullets) {
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

export function drawFuelPickups(ctx, fuelPickups) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (const fuel of fuelPickups) {
    fuel.draw(ctx);
  }
}

export function spawnBullet(bullets, ship, bulletConfig) {
  const fx = Math.sin(ship.heading);
  const fy = -Math.cos(ship.heading);
  const offset = 14;
  bullets.push({
    x: ship.x + fx * offset,
    y: ship.y + fy * offset,
    vx: fx * bulletConfig.SPEED,
    vy: fy * bulletConfig.SPEED,
    life: bulletConfig.LIFE
  });
}

function spawnEnemyBullet(enemyBullets, enemy, bulletSpeed, enemyBulletLife) {
  const fx = Math.sin(enemy.heading);
  const fy = -Math.cos(enemy.heading);
  const offset = 14;
  enemyBullets.push({
    x: enemy.x + fx * offset,
    y: enemy.y + fy * offset,
    vx: fx * bulletSpeed,
    vy: fy * bulletSpeed,
    life: enemyBulletLife,
    owner: enemy
  });
}

export function updateEnemies(
  enemies,
  ship,
  dt,
  activeStars,
  activeSectors,
  minimapRange,
  enemyFireRange,
  enemyFireCooldown,
  enemyBullets,
  bulletSpeed,
  enemyBulletLife,
  sounds
) {
  const inRange = [];
  for (const enemy of enemies) {
    const dx = ship.x - enemy.x;
    const dy = ship.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const isInRange = dist <= minimapRange;
    if (isInRange) {
      inRange.push(enemy);
    }
    enemy.update(dt, ship.x, ship.y, true);
    const sector = findSectorForPosition(activeSectors, enemy.x, enemy.y);
    const rivers = sector?.runtimeRivers ?? [];
    applyForcesToEntity(enemy, dt, activeStars, rivers, CONFIG);
    integrate(enemy, dt);
    if (enemy.canFire() && dist <= enemyFireRange) {
      sounds.play("enemy_laser");
      spawnEnemyBullet(enemyBullets, enemy, bulletSpeed, enemyBulletLife);
      enemy.resetFireCooldown(enemyFireCooldown);
    }
  }
  return inRange;
}

export function drawEnemies(ctx, enemies) {
  for (const enemy of enemies) {
    enemy.draw(ctx);
  }
}

export function getEnemySpawnCountForSector(currentSector) {
  if (!currentSector || currentSector.zone === "start") {
    return 0;
  }
  const hazard = currentSector.spawnProfile?.hazards ?? 1;
  let base = 0;
  if (currentSector.zone === "outer") {
    base = Math.random() < 0.5 ? 1 : 2;
  } else {
    base = Math.random() < 0.5 ? 1 : 0;
  }
  return Math.max(0, Math.round(base * hazard));
}

function spawnAsteroidFragments(asteroid, sector, spawnTimeMs) {
  const fragmentCap = ASTEROID_FRAGMENTS.MAX_PER_SECTOR;
  const existingChunks = sector.asteroids.filter((chunk) => chunk.spriteKey === "chunk").length;
  const available = Math.max(0, fragmentCap - existingChunks);
  if (available <= 0) {
    return;
  }
  const fragmentCount = Math.min(available, 2 + Math.floor(Math.random() * 4));
  const baseSpeed = Math.hypot(asteroid.vx, asteroid.vy);
  for (let i = 0; i < fragmentCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = baseSpeed * (0.2 + Math.random() * 0.6) + 30 + Math.random() * 150;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const fragmentRadius = Math.max(4, asteroid.radius * (0.25 + Math.random() * 0.3));
    const chunk = new Asteroid(asteroid.x, asteroid.y, vx, vy, fragmentRadius, 0, null, "chunk");
    chunk.spawnTimeMs = spawnTimeMs;
    chunk.ttlMs = ASTEROID_FRAGMENTS.TTL_MS;
    sector.asteroids.push(chunk);
  }
}

function spawnFuelDrop(fuelPickups, source, guaranteed = false) {
  if (!guaranteed && Math.random() > FUEL_PICKUP.DROP_CHANCE) {
    return;
  }
  fuelPickups.push(new FuelPickup(source.x, source.y, source.vx, source.vy));
}

export function updateEnemyPings(enemyPings, dt) {
  for (let i = enemyPings.length - 1; i >= 0; i--) {
    enemyPings[i].life -= dt;
    if (enemyPings[i].life <= 0) {
      enemyPings.splice(i, 1);
    }
  }
}

export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update(dt);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function spawnExplosion(particles, x, y, type = "normal") {
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

function spawnEnemyChunks(particles, enemy) {
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
