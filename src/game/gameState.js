import { CONFIG } from "./config.js";

const GAME_STATE_KEY = CONFIG.STORAGE.GAME_STATE_KEY;
const { UPGRADES } = CONFIG;

function generateSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function clampLevel(value, maxLevel) {
  if (!Number.isFinite(maxLevel)) {
    return Math.max(0, Math.floor(clampNumber(value, 0)));
  }
  return Math.max(0, Math.min(maxLevel, Math.floor(clampNumber(value, 0))));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createDefaultGameState(seed = generateSeed()) {
  return {
    worldSeed: seed,
    worldAgeMs: 0,
    beacon: {
      exposure: 0,
      visitCount: 0,
      totalObservedSeconds: 0,
      leftMidCycleCount: 0
    },
    history: {
      recentSectors: [],
      recentSurveys: [],
      recentBeaconVisits: []
    },
    resourceCurrency: 0,
    upgrades: {
      fireRateLevel: 0,
      hullLevel: 0,
      collectorLevel: 0
    },
    furthestRing: 0,
    newSectorCount: 0,
    lastSignalOriginStep: -1
  };
}

export function normalizeGameState(raw) {
  if (!isPlainObject(raw)) {
    return createDefaultGameState();
  }

  const base = createDefaultGameState(
    Number.isFinite(raw.worldSeed) ? raw.worldSeed : generateSeed()
  );
  const beaconRaw = isPlainObject(raw.beacon) ? raw.beacon : {};
  const historyRaw = isPlainObject(raw.history) ? raw.history : {};

  base.worldSeed = Number.isFinite(raw.worldSeed) ? raw.worldSeed : base.worldSeed;
  if (Number.isFinite(raw.worldAgeMs)) {
    base.worldAgeMs = Math.max(0, Math.floor(clampNumber(raw.worldAgeMs, 0)));
  } else if (Number.isFinite(raw.worldAgeTicks)) {
    base.worldAgeMs = Math.max(0, Math.floor(clampNumber(raw.worldAgeTicks, 0))) * 1000;
  }
  base.beacon.exposure = Math.max(0, clampNumber(beaconRaw.exposure, 0));
  base.beacon.visitCount = Math.max(0, Math.floor(clampNumber(beaconRaw.visitCount, 0)));
  base.beacon.totalObservedSeconds = Math.max(0, clampNumber(beaconRaw.totalObservedSeconds, 0));
  base.beacon.leftMidCycleCount = Math.max(0, Math.floor(clampNumber(beaconRaw.leftMidCycleCount, 0)));

  base.history.recentSectors = ensureArray(historyRaw.recentSectors);
  base.history.recentSurveys = ensureArray(historyRaw.recentSurveys);
  base.history.recentBeaconVisits = ensureArray(historyRaw.recentBeaconVisits);

  base.resourceCurrency = Math.max(0, Math.floor(clampNumber(raw.resourceCurrency, 0)));
  if (isPlainObject(raw.upgrades)) {
    base.upgrades.fireRateLevel = clampLevel(raw.upgrades.fireRateLevel, UPGRADES.FIRE_RATE.levelMax);
    base.upgrades.hullLevel = clampLevel(raw.upgrades.hullLevel, UPGRADES.HULL.levelMax);
    base.upgrades.collectorLevel = clampLevel(raw.upgrades.collectorLevel, UPGRADES.COLLECTOR.levelMax);
  }

  base.furthestRing = Math.max(0, Math.floor(clampNumber(raw.furthestRing, 0)));
  base.newSectorCount = Math.max(0, Math.floor(clampNumber(raw.newSectorCount, 0)));
  base.lastSignalOriginStep = Math.floor(
    clampNumber(raw.lastSignalOriginStep, base.lastSignalOriginStep)
  );

  return base;
}

export function loadGameState() {
  try {
    const stored = localStorage.getItem(GAME_STATE_KEY);
    if (!stored) {
      return createDefaultGameState();
    }
    const parsed = JSON.parse(stored);
    return normalizeGameState(parsed);
  } catch (err) {
    return createDefaultGameState();
  }
}

export function saveGameState(state) {
  try {
    const normalized = normalizeGameState(state);
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(normalized));
  } catch (err) {
    // Ignore storage failures.
  }
}

export function resetGameState() {
  const next = createDefaultGameState(generateSeed());
  saveGameState(next);
  return next;
}
