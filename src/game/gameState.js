import { CONFIG } from "./config.js";

const GAME_STATE_KEY = CONFIG.STORAGE.GAME_STATE_KEY;

function generateSeed() {
  return Math.floor(Math.random() * 0xffffffff);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createDefaultGameState(seed = generateSeed()) {
  return {
    worldSeed: seed,
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
  base.beacon.exposure = Math.max(0, clampNumber(beaconRaw.exposure, 0));
  base.beacon.visitCount = Math.max(0, Math.floor(clampNumber(beaconRaw.visitCount, 0)));
  base.beacon.totalObservedSeconds = Math.max(0, clampNumber(beaconRaw.totalObservedSeconds, 0));
  base.beacon.leftMidCycleCount = Math.max(0, Math.floor(clampNumber(beaconRaw.leftMidCycleCount, 0)));

  base.history.recentSectors = ensureArray(historyRaw.recentSectors);
  base.history.recentSurveys = ensureArray(historyRaw.recentSurveys);
  base.history.recentBeaconVisits = ensureArray(historyRaw.recentBeaconVisits);

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
