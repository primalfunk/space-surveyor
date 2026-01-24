import { Star } from "../entities/star.js";
import { Goal } from "../entities/goal.js";
import { EndZone } from "../entities/endZone.js";
import { Asteroid } from "../entities/asteroid.js";
import { clamp, createRng, hashInts, pickWeighted, randomInt, randomRange } from "./rng.js";
import { getSectorMeta, saveSectorIndex, setSectorMeta } from "./sectorIndex.js";
import { saveGameState } from "./gameState.js";
import { CONFIG } from "./config.js";
import { getFieldTypeForSector } from "./riverNetwork.js";

export const SECTOR_SIZE = CONFIG.SECTOR.SIZE;
export const SECTOR_TYPES = CONFIG.SECTOR.TYPES;

const { SECTOR, STAR: STAR_CONFIG, ASTEROID, GOAL, END_ZONE, FIELD } = CONFIG;
const STAR_GEN = STAR_CONFIG.GENERATION;
const STAR = STAR_GEN;
const STAR_WELL = STAR_GEN.WELL;
const STAR_ROTATION = STAR_GEN.ROTATION;
const STAR_PULSE = STAR_GEN.PULSE;
const STAR_TYPES = STAR_GEN.TYPES;
const STAR_PLACEMENT = STAR_GEN.PLACEMENT;
const STAR_MOTION = STAR_CONFIG.MOTION;
const ASTEROIDS = ASTEROID.GENERATION;
const ASTEROID_CLUSTER = ASTEROID.GENERATION.CLUSTER;
const ENTRY_SAFE_RADIUS = SECTOR.ENTRY_SAFE_RADIUS;
const BEACON_SAFE_PADDING = SECTOR.BEACON_SAFE_PADDING;
const MIN_ORIGIN_RING = SECTOR.MIN_ORIGIN_RING;
const ORIGIN_COOLDOWN = SECTOR.ORIGIN_COOLDOWN;
const ECHO_MIN_EXPOSURE = SECTOR.ECHO_MIN_EXPOSURE;
const SECTOR_MOODS = SECTOR.MOODS;
const ANOMALY_MODIFIERS = SECTOR.ANOMALY_MODIFIERS;
const SPAWN_PROFILES = SECTOR.SPAWN_PROFILES;
const SEED_SALT = SECTOR.SEED_SALT;
const STAR_RATE_MULTIPLIER = STAR_GEN.RATE_MULTIPLIER;
const ZONES = SECTOR.ZONES;
const FIELD_TYPES = FIELD.TYPES;
const PATTERN_VERSION = 1;


function randomPointInBounds(rng, bounds, margin) {
  return {
    x: randomRange(rng, bounds.x + margin, bounds.x + bounds.size - margin),
    y: randomRange(rng, bounds.y + margin, bounds.y + bounds.size - margin)
  };
}

function applyVariance(rng, value, variance) {
  const factor = 1 - variance + rng() * (variance * 2);
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

function getZoneConfig(ring) {
  if (ring === 0) {
    return ZONES.start;
  }
  if (ring === 1) {
    return ZONES.middle;
  }
  return ZONES.outer;
}

function normalizeSectorType(value) {
  return Object.values(SECTOR_TYPES).includes(value) ? value : SECTOR_TYPES.GENERIC;
}

function normalizeSectorMood(value) {
  return SECTOR_MOODS.includes(value) ? value : "NEUTRAL";
}

function getInfluenceBand(exposure) {
  if (exposure < 0.15) return 0;
  if (exposure < 0.35) return 1;
  if (exposure < 0.6) return 2;
  if (exposure < 0.9) return 3;
  return 4;
}

function buildSpawnProfile(sectorType, exposure) {
  const base = SPAWN_PROFILES[sectorType] ?? SPAWN_PROFILES[SECTOR_TYPES.GENERIC];
  const profile = { ...base };
  const band = getInfluenceBand(exposure);
  if (band >= 4) {
    profile.scanPoints *= 0.85;
  }
  return profile;
}

function chooseSectorType(rng, exposure, ring, cooldownReady) {
  const influence = Math.max(0, exposure);
  const echoEligible = influence >= ECHO_MIN_EXPOSURE;
  const band = getInfluenceBand(influence);
  let deadQuiet = 0.08 + 0.18 * influence;
  let derelict = 0.06 + 0.1 * influence;
  let anomaly = 0.04 + 0.22 * influence;
  let echo = echoEligible ? 0.02 + 0.25 * (influence - ECHO_MIN_EXPOSURE) : 0;
  let origin = (ring >= MIN_ORIGIN_RING && cooldownReady) ? (0.01 + 0.02 * influence) : 0;

  if (band >= 1) {
    deadQuiet += 0.03 * band;
  }
  if (band >= 3) {
    anomaly += 0.03 * (band - 2);
  }

  const entries = [
    { id: SECTOR_TYPES.GENERIC, weight: 1.0 },
    { id: SECTOR_TYPES.DEAD_QUIET, weight: Math.max(0, deadQuiet) },
    { id: SECTOR_TYPES.DERELICT_FIELD, weight: Math.max(0, derelict) },
    { id: SECTOR_TYPES.ANOMALY, weight: Math.max(0, anomaly) },
    { id: SECTOR_TYPES.ECHO, weight: Math.max(0, echo) },
    { id: SECTOR_TYPES.SIGNAL_ORIGIN, weight: Math.max(0, origin) }
  ];

  return pickWeighted(rng, entries) ?? SECTOR_TYPES.GENERIC;
}

function chooseSectorMood(rng, sectorType, exposure) {
  if (sectorType === SECTOR_TYPES.DEAD_QUIET) return "QUIET";
  if (sectorType === SECTOR_TYPES.ANOMALY) return "UNSETTLING";
  if (sectorType === SECTOR_TYPES.ECHO) return "FAMILIAR";
  if (sectorType === SECTOR_TYPES.DERELICT_FIELD) return "ARTIFICIAL";
  if (sectorType === SECTOR_TYPES.SIGNAL_ORIGIN) return "UNSETTLING";

  const moods = exposure >= 0.6 ? ["NEUTRAL", "QUIET", "FAMILIAR"] : ["NEUTRAL", "QUIET"];
  return moods[randomInt(rng, 0, moods.length - 1)];
}

function pickAnomalyModifier(rng) {
  return ANOMALY_MODIFIERS[randomInt(rng, 0, ANOMALY_MODIFIERS.length - 1)];
}

function scaleCountRange(range, multiplier) {
  const min = Math.max(0, Math.floor(range.min * multiplier));
  const max = Math.max(min, Math.floor(range.max * multiplier));
  return { min, max };
}

function mutateEchoTag(value, rng) {
  if (typeof value !== "string") {
    return null;
  }
  const parts = value.split(",");
  if (parts.length === 2) {
    const sx = Number(parts[0]);
    const sy = Number(parts[1]);
    if (Number.isFinite(sx) && Number.isFinite(sy)) {
      const dx = rng() < 0.5 ? randomInt(rng, -2, 2) : 0;
      const dy = dx === 0 ? randomInt(rng, -2, 2) : 0;
      const nx = sx + (dx === 0 ? 1 : dx);
      const ny = sy + (dy === 0 ? -1 : dy);
      return `${nx},${ny}`;
    }
  }
  const chars = value.split("");
  if (chars.length > 1) {
    const a = randomInt(rng, 0, chars.length - 1);
    const b = (a + randomInt(rng, 1, chars.length - 1)) % chars.length;
    [chars[a], chars[b]] = [chars[b], chars[a]];
    const mutated = chars.join("");
    return mutated === value ? `${value}_` : mutated;
  }
  return `${value}_`;
}

function pickEchoTag(rng, history) {
  const recent = Array.isArray(history?.recentSectors) ? history.recentSectors : [];
  if (recent.length === 0) {
    return null;
  }
  const entry = recent[randomInt(rng, 0, recent.length - 1)];
  const raw = typeof entry === "string" ? entry : entry?.id;
  const mutated = mutateEchoTag(raw, rng);
  return mutated ?? null;
}

function pickBeaconPosition(rng, bounds, safePoint, safeRadius) {
  let pos = null;
  for (let tries = 0; tries < 40; tries++) {
    const candidate = randomPointInBounds(rng, bounds, GOAL.MARGIN);
    const dx = candidate.x - safePoint.x;
    const dy = candidate.y - safePoint.y;
    if (Math.hypot(dx, dy) < safeRadius + BEACON_SAFE_PADDING) {
      continue;
    }
    pos = candidate;
    break;
  }
  if (!pos) {
    pos = randomPointInBounds(rng, bounds, GOAL.MARGIN);
  }
  return pos;
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

function getPatternBehaviorForField(fieldType) {
  if (fieldType === FIELD_TYPES.GEOMETRIC_LATTICE) return "ORTHOGONAL_BEHAVIOR";
  if (fieldType === FIELD_TYPES.GEOMETRIC_RADIAL) return "RADIAL_BEHAVIOR";
  if (fieldType === FIELD_TYPES.BRAIDED_FLOW) return "LINEAR_BEHAVIOR";
  if (fieldType === FIELD_TYPES.CHAOTIC_CLUSTER) return "CLUSTER_BEHAVIOR";
  if (fieldType === FIELD_TYPES.SPARSE_VOID) return "CHAOTIC_BEHAVIOR";
  return "CHAOTIC_BEHAVIOR";
}

function getFieldTypeForPattern(patternId, fallback) {
  if (patternId === "ORTHOGONAL_BEHAVIOR") return FIELD_TYPES.GEOMETRIC_LATTICE;
  if (patternId === "RADIAL_BEHAVIOR") return FIELD_TYPES.GEOMETRIC_RADIAL;
  if (patternId === "LINEAR_BEHAVIOR") return FIELD_TYPES.BRAIDED_FLOW;
  if (patternId === "CLUSTER_BEHAVIOR") return FIELD_TYPES.CHAOTIC_CLUSTER;
  if (patternId === "CHAOTIC_BEHAVIOR") return FIELD_TYPES.SPARSE_VOID;
  return fallback ?? FIELD_TYPES.CHAOTIC_CLUSTER;
}

function createStarPattern(rng, bounds, fieldType, patternId) {
  const resolvedField = getFieldTypeForPattern(patternId, fieldType);
  const center = {
    x: bounds.x + bounds.size / 2,
    y: bounds.y + bounds.size / 2
  };
  if (resolvedField === FIELD_TYPES.GEOMETRIC_LATTICE) {
    const gridCount = 3;
    const spacing = bounds.size / (gridCount + 1);
    return {
      type: resolvedField,
      center,
      gridCount,
      spacing,
      jitter: spacing * 0.2
    };
  }
  if (resolvedField === FIELD_TYPES.GEOMETRIC_RADIAL) {
    return {
      type: resolvedField,
      center: {
        x: center.x + (rng() - 0.5) * bounds.size * 0.08,
        y: center.y + (rng() - 0.5) * bounds.size * 0.08
      },
      ringMin: bounds.size * 0.18,
      ringMax: bounds.size * 0.38
    };
  }
  if (resolvedField === FIELD_TYPES.BRAIDED_FLOW) {
    const angle = rng() * Math.PI * 2;
    const dir = { x: Math.cos(angle), y: Math.sin(angle) };
    return {
      type: resolvedField,
      center,
      dir,
      cross: { x: -dir.y, y: dir.x },
      span: bounds.size * 0.35,
      spread: bounds.size * 0.2
    };
  }
  if (resolvedField === FIELD_TYPES.CHAOTIC_CLUSTER) {
    return {
      type: resolvedField,
      center: randomPointInBounds(rng, bounds, STAR.MARGIN),
      clusterRadius: bounds.size * 0.28
    };
  }
  return {
    type: resolvedField,
    center
  };
}

function pickStarCandidate(rng, bounds, margin, pattern, starIndex) {
  const type = pattern?.type;
  if (type === FIELD_TYPES.GEOMETRIC_LATTICE) {
    const col = randomInt(rng, 0, pattern.gridCount - 1);
    const row = randomInt(rng, 0, pattern.gridCount - 1);
    const jitterX = (rng() - 0.5) * pattern.jitter;
    const jitterY = (rng() - 0.5) * pattern.jitter;
    const x = bounds.x + pattern.spacing * (col + 1) + jitterX;
    const y = bounds.y + pattern.spacing * (row + 1) + jitterY;
    return {
      x: clamp(x, bounds.x + margin, bounds.x + bounds.size - margin),
      y: clamp(y, bounds.y + margin, bounds.y + bounds.size - margin)
    };
  }
  if (type === FIELD_TYPES.GEOMETRIC_RADIAL) {
    if (starIndex === 0) {
      return {
        x: clamp(pattern.center.x, bounds.x + margin, bounds.x + bounds.size - margin),
        y: clamp(pattern.center.y, bounds.y + margin, bounds.y + bounds.size - margin)
      };
    }
    const angle = rng() * Math.PI * 2;
    const radius = randomRange(rng, pattern.ringMin, pattern.ringMax);
    const x = pattern.center.x + Math.cos(angle) * radius;
    const y = pattern.center.y + Math.sin(angle) * radius;
    return {
      x: clamp(x, bounds.x + margin, bounds.x + bounds.size - margin),
      y: clamp(y, bounds.y + margin, bounds.y + bounds.size - margin)
    };
  }
  if (type === FIELD_TYPES.BRAIDED_FLOW) {
    const t = randomRange(rng, -1, 1);
    const offset = randomRange(rng, -pattern.spread, pattern.spread);
    const baseX = pattern.center.x + pattern.dir.x * t * pattern.span;
    const baseY = pattern.center.y + pattern.dir.y * t * pattern.span;
    const x = baseX + pattern.cross.x * offset;
    const y = baseY + pattern.cross.y * offset;
    return {
      x: clamp(x, bounds.x + margin, bounds.x + bounds.size - margin),
      y: clamp(y, bounds.y + margin, bounds.y + bounds.size - margin)
    };
  }
  if (type === FIELD_TYPES.CHAOTIC_CLUSTER) {
    const angle = rng() * Math.PI * 2;
    const radius = randomRange(rng, 0, pattern.clusterRadius);
    const x = pattern.center.x + Math.cos(angle) * radius;
    const y = pattern.center.y + Math.sin(angle) * radius;
    return {
      x: clamp(x, bounds.x + margin, bounds.x + bounds.size - margin),
      y: clamp(y, bounds.y + margin, bounds.y + bounds.size - margin)
    };
  }
  return randomPointInBounds(rng, bounds, margin);
}

function generateStars(
  rng,
  bounds,
  ring,
  starMultiplier,
  safePoint,
  safeRadius,
  fieldType,
  patternInfo = {},
  safetyTargets = null
) {
  const stars = [];
  const counts = getStarCountsForRing(ring);
  const rateMultiplier = starMultiplier * STAR_RATE_MULTIPLIER;
  const scaled = {
    red: scaleCountRange(counts.red, rateMultiplier),
    yellow: scaleCountRange(counts.yellow, rateMultiplier),
    blue: scaleCountRange(counts.blue, rateMultiplier)
  };
  const minCounts = {
    red: scaled.red.min,
    yellow: scaled.yellow.min,
    blue: scaled.blue.min
  };
  const targetCounts = {
    red: randomInt(rng, scaled.red.min, scaled.red.max),
    yellow: randomInt(rng, scaled.yellow.min, scaled.yellow.max),
    blue: randomInt(rng, scaled.blue.min, scaled.blue.max)
  };
  let starBudget = targetCounts.red + targetCounts.yellow + targetCounts.blue;
  const minTotal = minCounts.red + minCounts.yellow + minCounts.blue;
  const isSparseVoid = fieldType === FIELD_TYPES.SPARSE_VOID && ring <= FIELD.VOID_ALLOWED_MAX_RING;

  if (isSparseVoid) {
    if (rng() < FIELD.VOID_ZERO_STAR_PROB) {
      return stars;
    }
    starBudget = 1;
  } else if (starBudget < minTotal) {
    starBudget = minTotal;
  }

  const starPlan = [];
  if (!isSparseVoid) {
    for (const type of ["red", "yellow", "blue"]) {
      for (let i = 0; i < minCounts[type]; i++) {
        starPlan.push(type);
      }
    }
  }
  const remaining = Math.max(0, starBudget - starPlan.length);
  const weightEntries = ["red", "yellow", "blue"].map((type) => {
    const base = targetCounts[type] - (isSparseVoid ? 0 : minCounts[type]);
    return { id: type, weight: Math.max(0, base) };
  });
  let weightTotal = weightEntries.reduce((sum, entry) => sum + entry.weight, 0);
  if (weightTotal <= 0) {
    weightEntries[0].weight = Math.max(1, targetCounts.red);
    weightEntries[1].weight = Math.max(1, targetCounts.yellow);
    weightEntries[2].weight = Math.max(1, targetCounts.blue);
    weightTotal = weightEntries.reduce((sum, entry) => sum + entry.weight, 0);
  }
  for (let i = 0; i < remaining; i++) {
    const nextType = pickWeighted(rng, weightEntries) ?? "red";
    starPlan.push(nextType);
  }

  const patternSeed = Number.isFinite(patternInfo?.patternParamsSeed)
    ? patternInfo.patternParamsSeed
    : hashInts(Math.floor(bounds.x), Math.floor(bounds.y), ring, SEED_SALT.PATTERN);
  const patternRng = createRng(patternSeed);
  const pattern = createStarPattern(patternRng, bounds, fieldType, patternInfo?.patternId);
  let starIndex = 0;
  let failureStreak = 0;

  for (const entry of starPlan) {
    const type = getStarTypeConfig(entry);
    const baseMass = randomRange(rng, STAR.MASS_MIN, STAR.MASS_MAX);
    const mass = applyVariance(rng, baseMass * type.massMultiplier, STAR_WELL.VARIANCE);
    const gravityRadius = applyVariance(
      rng,
      STAR_WELL.BASE_RADIUS * type.wellMultiplier,
      STAR_WELL.VARIANCE
    );
    const bodyRadius = STAR.BODY_RADIUS;
    const [rotMin, rotMax] = getStarRotationRange(type.id);
    const rotSpeed = randomRange(rng, rotMin, rotMax) * (rng() < 0.5 ? -1 : 1);
    const pulseCfg = getStarPulseConfig(type.id);
    const pulseSpeed = randomRange(rng, pulseCfg.speedMin, pulseCfg.speedMax);
    const pulseAmount = pulseCfg.amount;
    const pulsePhase = randomRange(rng, 0, Math.PI * 2);
    const rotation = randomRange(rng, 0, Math.PI * 2);
    const motion = null;

    let pos = null;
    for (let tries = 0; tries < STAR_PLACEMENT.MAX_TRIES_PER_STAR; tries++) {
      const candidate = pickStarCandidate(patternRng, bounds, STAR.MARGIN, pattern, starIndex);
      if (safePoint) {
        const dx = candidate.x - safePoint.x;
        const dy = candidate.y - safePoint.y;
        const minDist = Math.max(safeRadius, gravityRadius + 200);
        if (Math.hypot(dx, dy) < minDist) {
          continue;
        }
      }
      if (safetyTargets && motion) {
        const center = motion.center ?? candidate;
        const radius = motion.radius ?? 0;
        const buffer = STAR_MOTION.SAFETY_BUFFER;
        if (safetyTargets.goal && safetyTargets.goal.minDist !== undefined) {
          const dx = center.x - safetyTargets.goal.x;
          const dy = center.y - safetyTargets.goal.y;
          if (Math.hypot(dx, dy) < safetyTargets.goal.minDist + gravityRadius + radius + buffer) {
            continue;
          }
        }
        if (safetyTargets.endZone && safetyTargets.endZone.minDist !== undefined) {
          const dx = center.x - safetyTargets.endZone.x;
          const dy = center.y - safetyTargets.endZone.y;
          if (Math.hypot(dx, dy) < safetyTargets.endZone.minDist + gravityRadius + radius + buffer) {
            continue;
          }
        }
        if (safetyTargets.beacon && safetyTargets.beacon.minDist !== undefined) {
          const dx = center.x - safetyTargets.beacon.x;
          const dy = center.y - safetyTargets.beacon.y;
          if (Math.hypot(dx, dy) < safetyTargets.beacon.minDist + gravityRadius + radius + buffer) {
            continue;
          }
        }
      }

      let overlap = false;
      for (const star of stars) {
        const dx = candidate.x - star.x;
        const dy = candidate.y - star.y;
        const dist = Math.hypot(dx, dy);
        if (dist < bodyRadius + star.radius) {
          overlap = true;
          break;
        }
        const minWellDist = (gravityRadius + star.gravityRadius) * 0.9;
        if (dist < minWellDist) {
          overlap = true;
          break;
        }
      }
      if (overlap) {
        continue;
      }
      pos = candidate;
      break;
    }
    if (!pos) {
      failureStreak += 1;
      if (failureStreak >= STAR_PLACEMENT.MAX_CONSECUTIVE_FAILURES) {
        break;
      }
      continue;
    }

    stars.push(new Star(pos.x, pos.y, {
      mass,
      bodyRadius,
      gravityRadius,
      bodyColor: type.bodyColor,
      wellFill: type.wellFill,
      wellStroke: type.wellStroke,
      minimapColor: type.minimapColor,
      spriteKey: type.spriteKey,
      rotation: rotation,
      rotationSpeed: rotSpeed,
      pulsePhase,
      pulseSpeed,
      pulseAmount,
      motion
    }));
    starIndex += 1;
    failureStreak = 0;
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

function generateGoal(rng, bounds, stars, safePoint, safeRadius, anchor = null) {
  let goalX = bounds.x + bounds.size / 2 - GOAL.WIDTH / 2;
  let goalY = bounds.y + bounds.size / 2 - GOAL.HEIGHT / 2;
  const anchorRadius = anchor?.radius ?? GOAL.ANCHOR_RADIUS_DEFAULT;

  for (let i = 0; i < 20; i++) {
    let pos = null;
    if (anchor?.x !== undefined && anchor?.y !== undefined) {
      const angle = randomRange(rng, 0, Math.PI * 2);
      const dist = randomRange(rng, anchorRadius * 0.4, anchorRadius);
      const ax = anchor.x + Math.cos(angle) * dist;
      const ay = anchor.y + Math.sin(angle) * dist;
      pos = {
        x: clamp(ax, bounds.x + GOAL.MARGIN, bounds.x + bounds.size - GOAL.MARGIN),
        y: clamp(ay, bounds.y + GOAL.MARGIN, bounds.y + bounds.size - GOAL.MARGIN)
      };
    } else {
      pos = randomPointInBounds(rng, bounds, GOAL.MARGIN);
    }
    const gx = pos.x;
    const gy = pos.y;

    if (safePoint) {
      const sx = gx - safePoint.x;
      const sy = gy - safePoint.y;
      if (Math.hypot(sx, sy) < safeRadius) {
        continue;
      }
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

  const rotation = randomRange(rng, 0, Math.PI * 2);
  const rotationSpeed = randomRange(rng, GOAL.ROT_SPEED_MIN, GOAL.ROT_SPEED_MAX) * (rng() < 0.5 ? -1 : 1);

  return new Goal(goalX, goalY, GOAL.WIDTH, GOAL.HEIGHT, {
    rotation,
    rotationSpeed
  });
}

function generateAsteroids(rng, bounds, asteroidMultiplier, safePoint, safeRadius, options = {}) {
  const asteroids = [];
  const count = Math.max(1, Math.round(ASTEROIDS.COUNT * asteroidMultiplier));
  const clusterCount = options.cluster
    ? randomInt(rng, ASTEROID_CLUSTER.COUNT_MIN, ASTEROID_CLUSTER.COUNT_MAX)
    : 0;
  const clusters = [];
  if (clusterCount > 0) {
    for (let i = 0; i < clusterCount; i++) {
      let center = null;
      for (let tries = 0; tries < 30; tries++) {
        const candidate = randomPointInBounds(rng, bounds, ASTEROIDS.SPAWN_MARGIN);
        if (safePoint) {
          const dx = candidate.x - safePoint.x;
          const dy = candidate.y - safePoint.y;
          if (Math.hypot(dx, dy) < safeRadius + ASTEROID_CLUSTER.RADIUS_MIN) {
            continue;
          }
        }
        center = candidate;
        break;
      }
      if (center) {
        clusters.push({
          x: center.x,
          y: center.y,
          radius: randomRange(rng, ASTEROID_CLUSTER.RADIUS_MIN, ASTEROID_CLUSTER.RADIUS_MAX)
        });
      }
    }
  }

  for (let i = 0; i < count; i++) {
    let pos = null;
    let vx = 0;
    let vy = 0;
    for (let tries = 0; tries < 40; tries++) {
      let candidate = null;
      if (clusters.length > 0) {
        const cluster = clusters[randomInt(rng, 0, clusters.length - 1)];
        const angle = randomRange(rng, 0, Math.PI * 2);
        const dist = randomRange(rng, 0, cluster.radius);
        candidate = {
          x: clamp(cluster.x + Math.cos(angle) * dist, bounds.x + ASTEROIDS.SPAWN_MARGIN, bounds.x + bounds.size - ASTEROIDS.SPAWN_MARGIN),
          y: clamp(cluster.y + Math.sin(angle) * dist, bounds.y + ASTEROIDS.SPAWN_MARGIN, bounds.y + bounds.size - ASTEROIDS.SPAWN_MARGIN)
        };
      } else {
        candidate = randomPointInBounds(rng, bounds, ASTEROIDS.SPAWN_MARGIN);
      }

      if (safePoint) {
        const dx = candidate.x - safePoint.x;
        const dy = candidate.y - safePoint.y;
        const minSpawnDist = safeRadius + ASTEROIDS.SPAWN_MARGIN;
        if (Math.hypot(dx, dy) < minSpawnDist) {
          continue;
        }
      }

      const travelAngle = randomRange(rng, 0, Math.PI * 2);
      const speed = randomRange(rng, ASTEROIDS.SPEED_MIN, ASTEROIDS.SPEED_MAX) * (options.speedScale ?? 1);
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
      const speed = randomRange(rng, ASTEROIDS.SPEED_MIN, ASTEROIDS.SPEED_MAX) * (options.speedScale ?? 1);
      vx = Math.cos(travelAngle) * speed;
      vy = Math.sin(travelAngle) * speed;
    }

    const radius = randomRange(rng, ASTEROIDS.RADIUS_MIN, ASTEROIDS.RADIUS_MAX) * (options.radiusScale ?? 1);
    const rotation = randomRange(rng, 0, Math.PI * 2);
    const rotationSpeed = randomRange(rng, 0.05, 0.18) * (rng() < 0.5 ? -1 : 1);

    asteroids.push(new Asteroid(pos.x, pos.y, vx, vy, radius, rotation, rotationSpeed));
  }
  return asteroids;
}

export class SectorManager {
  constructor(options = {}) {
    const opts = options ?? {};
    this.current = null;
    this.sectors = new Map();
    this.worldSeed = Number.isFinite(opts.worldSeed) ? opts.worldSeed : 0;
    this.sectorIndex = opts.sectorIndex ?? {};
    this.gameState = opts.gameState ?? null;
    this.entrySafeRadius = Number.isFinite(opts.entrySafeRadius) ? opts.entrySafeRadius : ENTRY_SAFE_RADIUS;
    this.startSafeRadius = Number.isFinite(opts.startSafeRadius) ? opts.startSafeRadius : this.entrySafeRadius;
  }

  getSectorSeed(sx, sy, salt = 0) {
    return hashInts(this.worldSeed, sx, sy, salt);
  }

  getCooldownReady() {
    const lastOrigin = Number.isFinite(this.gameState?.lastSignalOriginStep)
      ? this.gameState.lastSignalOriginStep
      : -1;
    if (lastOrigin < 0) {
      return true;
    }
    return (this.gameState?.newSectorCount ?? 0) - lastOrigin >= ORIGIN_COOLDOWN;
  }

  normalizeSectorMeta(meta, sx, sy, ring, safePoint, safeRadius) {
    const baseSeed = this.getSectorSeed(sx, sy);
    let updated = false;
    const fieldType = getFieldTypeForSector(this.worldSeed, sx, sy);
    const normalized = { ...meta };
    const prevType = normalized.sectorType;
    const prevMood = normalized.sectorMood;
    normalized.sectorType = normalizeSectorType(normalized.sectorType);
    normalized.sectorMood = normalizeSectorMood(normalized.sectorMood);
    if (prevType !== normalized.sectorType || prevMood !== normalized.sectorMood) {
      updated = true;
    }
    if (normalized.generatedAtExposure === undefined || !Number.isFinite(normalized.generatedAtExposure)) {
      normalized.generatedAtExposure = Math.max(0, this.gameState?.beacon?.exposure ?? 0);
      updated = true;
    }
    if (normalized.sectorType === SECTOR_TYPES.ANOMALY && !normalized.anomalyModifier) {
      const rng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.ANOMALY));
      normalized.anomalyModifier = pickAnomalyModifier(rng);
      updated = true;
    }
    if (normalized.sectorType === SECTOR_TYPES.ECHO && !normalized.echoTag) {
      const rng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.ECHO));
      normalized.echoTag = pickEchoTag(rng, this.gameState?.history);
      updated = true;
    }
    if (normalized.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN) {
      if (!normalized.beaconPlaced) {
        normalized.beaconPlaced = true;
        updated = true;
      }
      if (!normalized.beaconPosition) {
        const rng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.BEACON));
        normalized.beaconPosition = pickBeaconPosition(rng, this.getBounds(sx, sy), safePoint, safeRadius);
        updated = true;
      }
    } else if (normalized.beaconPlaced) {
      normalized.beaconPlaced = false;
      normalized.beaconPosition = null;
      updated = true;
    }
    if (normalized.visited === undefined) {
      normalized.visited = false;
      updated = true;
    }
    if (normalized.surveyComplete === undefined) {
      normalized.surveyComplete = false;
      updated = true;
    }
    if (!normalized.patternId) {
      normalized.patternId = getPatternBehaviorForField(fieldType);
      updated = true;
    }
    if (!Number.isFinite(normalized.patternParamsSeed)) {
      normalized.patternParamsSeed = this.getSectorSeed(sx, sy, SEED_SALT.PATTERN);
      updated = true;
    }
    if (!Number.isFinite(normalized.patternVersion)) {
      normalized.patternVersion = PATTERN_VERSION;
      updated = true;
    }
    if (updated) {
      setSectorMeta(this.sectorIndex, sx, sy, normalized);
      saveSectorIndex(this.sectorIndex);
    }
    return normalized;
  }

  createSectorMeta(sx, sy, ring, safePoint, safeRadius) {
    const existing = getSectorMeta(this.sectorIndex, sx, sy);
    if (existing) {
      return this.normalizeSectorMeta(existing, sx, sy, ring, safePoint, safeRadius);
    }

    const fieldType = getFieldTypeForSector(this.worldSeed, sx, sy);
    const influence = Math.max(0, this.gameState?.beacon?.exposure ?? 0);
    const cooldownReady = this.getCooldownReady();
    const typeRng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.TYPE));
    const sectorType = chooseSectorType(typeRng, influence, ring, cooldownReady);
    const moodRng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.MOOD));
    const sectorMood = chooseSectorMood(moodRng, sectorType, influence);
    const anomalyModifier = sectorType === SECTOR_TYPES.ANOMALY
      ? pickAnomalyModifier(createRng(this.getSectorSeed(sx, sy, SEED_SALT.ANOMALY)))
      : null;
    const echoTag = sectorType === SECTOR_TYPES.ECHO
      ? pickEchoTag(createRng(this.getSectorSeed(sx, sy, SEED_SALT.ECHO)), this.gameState?.history)
      : null;
    const beaconPlaced = sectorType === SECTOR_TYPES.SIGNAL_ORIGIN;
    const beaconPosition = beaconPlaced
      ? pickBeaconPosition(createRng(this.getSectorSeed(sx, sy, SEED_SALT.BEACON)), this.getBounds(sx, sy), safePoint, safeRadius)
      : null;
    const patternId = getPatternBehaviorForField(fieldType);
    const patternParamsSeed = this.getSectorSeed(sx, sy, SEED_SALT.PATTERN);

    const meta = {
      sectorType,
      sectorMood,
      beaconPlaced,
      beaconPosition,
      generatedAtExposure: influence,
      visited: false,
      surveyComplete: false,
      lastVisitedAt: null,
      anomalyModifier,
      echoTag,
      patternId,
      patternParamsSeed,
      patternVersion: PATTERN_VERSION
    };

    setSectorMeta(this.sectorIndex, sx, sy, meta);
    if (this.gameState) {
      this.gameState.newSectorCount = (this.gameState.newSectorCount ?? 0) + 1;
      if (sectorType === SECTOR_TYPES.SIGNAL_ORIGIN) {
        this.gameState.lastSignalOriginStep = this.gameState.newSectorCount;
      }
      saveGameState(this.gameState);
    }
    saveSectorIndex(this.sectorIndex);
    return meta;
  }

  getBounds(sx, sy) {
    return {
      x: sx * SECTOR_SIZE,
      y: sy * SECTOR_SIZE,
      size: SECTOR_SIZE
    };
  }

  getSectorAt(sx, sy) {
    const key = `${sx},${sy}`;
    if (this.sectors.has(key)) {
      const cached = this.sectors.get(key);
      if (cached) {
        if (!cached.fieldType) {
          cached.fieldType = getFieldTypeForSector(this.worldSeed, sx, sy);
        }
        if (!cached.patternId) {
          cached.patternId = getPatternBehaviorForField(cached.fieldType);
        }
        if (!Number.isFinite(cached.patternParamsSeed)) {
          cached.patternParamsSeed = this.getSectorSeed(sx, sy, SEED_SALT.PATTERN);
        }
        if (!Number.isFinite(cached.patternVersion)) {
          cached.patternVersion = PATTERN_VERSION;
        }
      }
      return cached;
    }

    const ring = Math.max(Math.abs(sx), Math.abs(sy));
    const bounds = this.getBounds(sx, sy);
    const fieldType = getFieldTypeForSector(this.worldSeed, sx, sy);
    const zone = getZoneConfig(ring);
    const entryOrigin = {
      x: bounds.x + bounds.size / 2,
      y: bounds.y + bounds.size / 2
    };
    const safeRadius = ring === 0 ? this.startSafeRadius : this.entrySafeRadius;
    const meta = this.createSectorMeta(sx, sy, ring, entryOrigin, safeRadius);
    const influence = Math.max(0, meta.generatedAtExposure ?? 0);
    const spawnProfile = buildSpawnProfile(meta.sectorType, influence);
    const fieldMultiplier = FIELD.STAR_MULTIPLIERS[fieldType] ?? 1;
    const patternId = meta.patternId ?? getPatternBehaviorForField(fieldType);
    const patternParamsSeed = Number.isFinite(meta.patternParamsSeed)
      ? meta.patternParamsSeed
      : this.getSectorSeed(sx, sy, SEED_SALT.PATTERN);
    const patternVersion = Number.isFinite(meta.patternVersion)
      ? meta.patternVersion
      : PATTERN_VERSION;
    const starRng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.STARS));
    const stars = generateStars(
      starRng,
      bounds,
      ring,
      spawnProfile.stars * fieldMultiplier,
      ring === 0 ? entryOrigin : null,
      ring === 0 ? safeRadius : 0,
      fieldType,
      {
        patternId,
        patternParamsSeed,
        patternVersion
      }
    );
    const goalAnchor = meta.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN && meta.beaconPosition
      ? { x: meta.beaconPosition.x, y: meta.beaconPosition.y, radius: 520 }
      : null;
    const goalRng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.GOAL));
    const goal = generateGoal(goalRng, bounds, stars, entryOrigin, safeRadius, goalAnchor);
    const endZone = generateEndZone(
      createRng(this.getSectorSeed(sx, sy, SEED_SALT.END_ZONE)),
      bounds,
      goal.x,
      goal.y
    );
    const asteroidMultiplier = zone.asteroidMultiplier * spawnProfile.asteroids;
    const asteroidRng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.ASTEROIDS));
    const asteroidOptions = {
      cluster: meta.sectorType === SECTOR_TYPES.DERELICT_FIELD,
      speedScale: meta.sectorType === SECTOR_TYPES.DERELICT_FIELD ? 0.6 : 1,
      radiusScale: meta.sectorType === SECTOR_TYPES.DERELICT_FIELD ? 1.1 : 1
    };
    const asteroids = generateAsteroids(
      asteroidRng,
      bounds,
      asteroidMultiplier,
      entryOrigin,
      safeRadius,
      asteroidOptions
    );

    const sector = {
      sx,
      sy,
      bounds,
      zone: zone.id,
      ring,
      fieldType,
      patternId,
      patternParamsSeed,
      patternVersion,
      sectorType: meta.sectorType,
      sectorMood: meta.sectorMood,
      anomalyModifier: meta.anomalyModifier ?? null,
      echoTag: meta.echoTag ?? null,
      spawnProfile,
      beacon: meta.beaconPlaced ? {
        x: meta.beaconPosition?.x ?? bounds.x + bounds.size / 2,
        y: meta.beaconPosition?.y ?? bounds.y + bounds.size / 2,
        radius: 900
      } : null,
      stars,
      goal,
      endZone,
      asteroids,
      goalCollected: meta.surveyComplete ? true : false,
      goalDelivered: meta.surveyComplete ? true : false
    };
    this.sectors.set(key, sector);
    return sector;
  }

  getSectorForPosition(x, y) {
    const sx = Math.floor(x / SECTOR_SIZE);
    const sy = Math.floor(y / SECTOR_SIZE);
    this.current = this.getSectorAt(sx, sy);
    return this.current;
  }

  getSectorsAround(x, y, range = 1) {
    const sx = Math.floor(x / SECTOR_SIZE);
    const sy = Math.floor(y / SECTOR_SIZE);
    const sectors = [];
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        sectors.push(this.getSectorAt(sx + dx, sy + dy));
      }
    }
    return sectors;
  }
}
