import { Star } from "../entities/star.js";
import { Goal } from "../entities/goal.js";
import { EndZone } from "../entities/endZone.js";
import { Asteroid } from "../entities/asteroid.js";

export const SECTOR_SIZE = 6000;
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

export class SectorManager {
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

