import { Ship } from "../entities/ship.js";
import { EnemyShip } from "../entities/enemyShip.js";
import { BeaconRelic } from "../entities/beaconRelic.js";
import { Camera } from "./camera.js";
import { SectorManager, SECTOR_SIZE, SECTOR_TYPES } from "./sectorManager.js";
import { applyGravity, integrate } from "./physics.js";
import { sounds, music } from "./audio.js";
import { getSectorMeta, saveSectorIndex, setSectorMeta } from "./sectorIndex.js";
import { saveGameState } from "./gameState.js";
import { showShipDestroyedModal } from "../ui/shipDestroyedModal.js";
import {
  ALERT,
  HUD_COLORS,
  HUD_FONT,
  MINIMAP,
  drawAlerts,
  drawBeaconSignalHud,
  drawBearingIndicators,
  drawFuelGauge,
  drawMiniMap,
  drawScanPulse,
  drawScoreHud,
  drawStatusHud
} from "./hud.js";
import {
  CONTROL_DISABLE,
  SCORE_POPUP,
  SCORE_POPUP_COLORS,
  TRAIL_COLOR,
  drawBackgroundEvents,
  drawControlDisableOverlay,
  drawParticles,
  drawScorePopups,
  drawScreenEffects,
  drawTrail
} from "./visualEffects.js";
import {
  Particle,
  drawBullets,
  drawEnemies,
  drawEnemyBullets,
  drawFuelPickups,
  getEnemySpawnCountForSector,
  handleBulletHits,
  handleFuelPickups,
  spawnBullet,
  spawnExplosion,
  updateBullets,
  updateEnemies,
  updateEnemyBullets,
  updateEnemyPings,
  updateFuelPickups,
  updateParticles
} from "./combatSystem.js";
import { CONFIG } from "./config.js";

const {
  DEBUG,
  CAMERA,
  GAMEPLAY,
  SCORE,
  BEACON,
  CALIBRATION,
  BACKGROUND,
  EFFECTS,
  INPUT,
  BULLET,
  ENEMY,
  SHIP,
  STORAGE,
  SECTOR
} = CONFIG;

const { ZOOM, SHAKE } = CAMERA;
const {
  ACTIVE_SECTOR_RANGE,
  STARTING_LIVES,
  INVULN_DURATION,
  GAME_OVER_DELAY,
  RESPAWN_DELAY
} = GAMEPLAY;
const { CHUNK_MULTIPLIER: SCORE_CHUNK_MULTIPLIER, POINTS: SCORE_POINTS } = SCORE;
const { SHIP_RADIUS: CALIBRATION_SHIP_RADIUS, GATE: CALIBRATION_GATE } = CALIBRATION;
const {
  STARFIELD,
  DUSTFIELD,
  FARFIELD,
  SLICE: BACKGROUND_SLICE,
  EVENTS: BACKGROUND_EVENTS,
  PALETTE: PSYCHE_PALETTE,
  NEBULA
} = BACKGROUND;
const { THRUST_PARTICLES, TRAIL_SPARKS } = EFFECTS;
const { TOUCH } = INPUT;
const START_SAFE_RADIUS = SECTOR.START_SAFE_RADIUS;
const PLAYER_EFFECTIVE_RANGE = BULLET.SPEED * BULLET.LIFE;
const ENEMY_RANGE_SCALE = ENEMY.RANGE_SCALE;
const ENEMY_EFFECTIVE_RANGE = PLAYER_EFFECTIVE_RANGE * ENEMY_RANGE_SCALE;
const ENEMY_FIRE_RANGE = ENEMY_EFFECTIVE_RANGE * 1.1;
const ENEMY_BULLET_LIFE = BULLET.LIFE * ENEMY_RANGE_SCALE;
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

export function startGame(canvas, ctx, uiRoot, gameState, sectorIndex, onGameOver) {
  sounds.preload();
  music.start();
  const startX = SECTOR_SIZE / 2;
  const startY = SECTOR_SIZE / 2;
  const ship = new Ship(startX, startY);
  const camera = new Camera(ship);
  const sectorManager = new SectorManager({
    worldSeed: Number.isFinite(gameState?.worldSeed) ? gameState.worldSeed : 0,
    sectorIndex,
    gameState,
    startSafeRadius: START_SAFE_RADIUS
  });
  let sector = sectorManager.getSectorForPosition(
    ship.x,
    ship.y
  );
  let activeSectors = sectorManager.getSectorsAround(
    ship.x,
    ship.y,
    ACTIVE_SECTOR_RANGE
  );
  const trail = [];
  const SHIP_RADIUS = SHIP.COLLISION_RADIUS;
  const TRAIL_MAX = SHIP.TRAIL.MAX;
  const TRAIL_MIN_DIST = SHIP.TRAIL.MIN_DIST;
  const TRAIL_FADE_SPEED = SHIP.TRAIL.FADE_SPEED;
  const TRAIL_FADE_STEP = SHIP.TRAIL.FADE_STEP;
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
  const STARFIELD_PARALLAX = STARFIELD.PARALLAX;
  const DUSTFIELD_PARALLAX = DUSTFIELD.PARALLAX;
  const FARFIELD_PARALLAX = FARFIELD.PARALLAX;
  const particles = [];
  const bullets = [];
  const enemyBullets = [];
  const enemies = [];
  const fuelPickups = [];
  const alerts = [];
  const scorePopups = [];

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
  let fireLockout = BULLET.FIRE_LOCKOUT;
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
  let lastSectorKey = null;
  let lastSectorRef = null;
  let wasInBeaconZone = false;
  let wasInActiveMotif = false;
  let beaconScanPenalty = 0;
  let stateDirty = false;
  let lastStateSave = 0;
  let calibrationScore = 0;
  let gateSpawnTimer = randomRange(CALIBRATION_GATE.SPAWN_MIN, CALIBRATION_GATE.SPAWN_MAX);
  let activeGates = [];
  let chainProgress = 0;
  let gateCorrection = null;
  let controlsDisabledTimer = 0;
  let deathPauseActive = false;
  let deathModal = null;
  const beaconSignal = {
    phase: 0,
    motif: "INVOCATION",
    strength: 0
  };
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
  const mouseAimStorageKey = STORAGE.MOUSE_AIM_KEY;
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

  function getScorePopupColor(eventType) {
    return SCORE_POPUP_COLORS[eventType] ?? SCORE_POPUP_COLORS.generic;
  }

  function spawnScorePopup(value, worldPos, eventType) {
    if (!worldPos || !Number.isFinite(worldPos.x) || !Number.isFinite(worldPos.y)) {
      return;
    }
    const display = Math.max(0, Math.round(value));
    if (display <= 0) {
      return;
    }
    scorePopups.push({
      value: display,
      x: worldPos.x,
      y: worldPos.y,
      age: 0,
      life: SCORE_POPUP.LIFE,
      color: getScorePopupColor(eventType)
    });
  }

  function addScore(points, applyMultiplier = false, trackCombat = false, worldPos = null, eventType = "generic") {
    const applied = applyMultiplier ? points * scoreMultiplier : points;
    score += applied;
    if (trackCombat) {
      combatScore += points;
    }
    scorePulse = Math.min(2.0, scorePulse + 0.8);
    spawnScorePopup(applied, worldPos, eventType);
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

  function getGateWidth(type) {
    const multiplier = CALIBRATION_GATE.WIDTH_MULTIPLIERS[type] ?? 1.6;
    return CALIBRATION_SHIP_RADIUS * 2 * multiplier;
  }

  function getGateColor(type) {
    if (type === CALIBRATION_GATE.TYPES.DISPLACEMENT) return CALIBRATION_GATE.COLORS.DISPLACEMENT;
    if (type === CALIBRATION_GATE.TYPES.EXIT) return CALIBRATION_GATE.COLORS.EXIT;
    if (type === CALIBRATION_GATE.TYPES.SHUTDOWN) return CALIBRATION_GATE.COLORS.SHUTDOWN;
    return CALIBRATION_GATE.COLORS.CHAIN;
  }

  function pickGateType() {
    const types = Object.values(CALIBRATION_GATE.TYPES);
    const weights = CALIBRATION_GATE.WEIGHTS;
    let total = 0;
    for (const type of types) {
      total += Math.max(0, weights?.[type] ?? 0);
    }
    if (total <= 0) {
      return CALIBRATION_GATE.TYPES.CHAIN;
    }
    let roll = Math.random() * total;
    for (const type of types) {
      const weight = Math.max(0, weights?.[type] ?? 0);
      roll -= weight;
      if (roll <= 0) {
        return type;
      }
    }
    return types[types.length - 1];
  }

  function isSectorGateEligible(currentSector) {
    if (!currentSector) {
      return false;
    }
    if (currentSector.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN) {
      return false;
    }
    if (currentSector.sectorType === SECTOR_TYPES.DEAD_QUIET) {
      return false;
    }
    return true;
  }

  function rectContainsPoint(rect, px, py) {
    return px >= rect.x && px <= rect.x + rect.width
      && py >= rect.y && py <= rect.y + rect.height;
  }

  function distanceToRect(rect, px, py) {
    const cx = clampValue(px, rect.x, rect.x + rect.width);
    const cy = clampValue(py, rect.y, rect.y + rect.height);
    return Math.hypot(px - cx, py - cy);
  }

  function getTravelDirection() {
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > 1) {
      return { x: ship.vx / speed, y: ship.vy / speed };
    }
    return { x: Math.sin(ship.heading), y: -Math.cos(ship.heading) };
  }

  function getNearestCalibrationTarget() {
    let best = null;
    for (const current of activeSectors) {
      if (current.goal && !current.goalCollected) {
        const gx = current.goal.x + current.goal.width / 2;
        const gy = current.goal.y + current.goal.height / 2;
        const dist = Math.hypot(gx - ship.x, gy - ship.y);
        if (!best || dist < best.dist) {
          best = { x: gx, y: gy, dist };
        }
      }
      if (current.endZone && !current.goalDelivered) {
        const ex = current.endZone.x + current.endZone.width / 2;
        const ey = current.endZone.y + current.endZone.height / 2;
        const dist = Math.hypot(ex - ship.x, ey - ship.y);
        if (!best || dist < best.dist) {
          best = { x: ex, y: ey, dist };
        }
      }
    }
    return best;
  }

  function getExitTarget() {
    const target = getNearestCalibrationTarget();
    if (target) {
      return target;
    }
    const dir = getTravelDirection();
    const fallbackDist = SECTOR_SIZE * 0.6;
    return { x: ship.x + dir.x * fallbackDist, y: ship.y + dir.y * fallbackDist };
  }

  function rotateVector(vec, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: vec.x * cos - vec.y * sin,
      y: vec.x * sin + vec.y * cos
    };
  }

  function isWithinBounds(point, bounds, margin) {
    return point.x >= bounds.x + margin
      && point.x <= bounds.x + bounds.size - margin
      && point.y >= bounds.y + margin
      && point.y <= bounds.y + bounds.size - margin;
  }

  function isGateLocationClear(candidate, halfSpan) {
    if (sector.goal && !sector.goalCollected) {
      if (rectContainsPoint(sector.goal, candidate.x, candidate.y)) {
        return false;
      }
      if (distanceToRect(sector.goal, candidate.x, candidate.y) < CALIBRATION_GATE.EXCLUSION_RADIUS) {
        return false;
      }
    }
    if (sector.endZone && !sector.goalDelivered) {
      if (rectContainsPoint(sector.endZone, candidate.x, candidate.y)) {
        return false;
      }
      if (distanceToRect(sector.endZone, candidate.x, candidate.y) < CALIBRATION_GATE.EXCLUSION_RADIUS) {
        return false;
      }
    }

    for (const star of sector.stars) {
      const starRadius = Number.isFinite(star.gravityRadius) ? star.gravityRadius : 0;
      if (starRadius <= 0) {
        continue;
      }
      const dx = candidate.x - star.x;
      const dy = candidate.y - star.y;
      if (Math.hypot(dx, dy) < starRadius + halfSpan) {
        return false;
      }
    }
    return true;
  }

  function buildGate(type, center, axis, normal, width, poleRadius) {
    return {
      type,
      center,
      axis,
      normal,
      width,
      poleRadius,
      color: getGateColor(type),
      thickness: CALIBRATION_GATE.BASE_THICKNESS,
      state: "spawning",
      fadeTimer: 0,
      lifeTimer: 0,
      prevPlane: null,
      resolved: false
    };
  }

  function createSingleGate(viewRadius, type, bounds, dir, axis, margin) {
    const apertureWidth = getGateWidth(type);
    const poleRadius = apertureWidth * CALIBRATION_GATE.POLE_RATIO;
    const halfSpan = apertureWidth / 2 + poleRadius;
    const maxDist = viewRadius - CALIBRATION_GATE.EDGE_OFFSET - halfSpan;
    if (maxDist <= 0) {
      return null;
    }
    const minDist = Math.max(halfSpan, maxDist * 0.9);

    for (let tries = 0; tries < 12; tries++) {
      const distance = randomRange(minDist, maxDist);
      const lateral = randomRange(-CALIBRATION_GATE.SPAWN_LATERAL, CALIBRATION_GATE.SPAWN_LATERAL);
      const candidate = {
        x: ship.x + dir.x * distance + axis.x * lateral,
        y: ship.y + dir.y * distance + axis.y * lateral
      };
      candidate.x = clampValue(candidate.x, bounds.x + margin, bounds.x + bounds.size - margin);
      candidate.y = clampValue(candidate.y, bounds.y + margin, bounds.y + bounds.size - margin);

      if (!isGateLocationClear(candidate, halfSpan)) {
        continue;
      }

      return buildGate(type, candidate, axis, dir, apertureWidth, poleRadius);
    }
    return null;
  }

  function createChainGateSeries(viewRadius, bounds, dir, axis, margin) {
    const type = CALIBRATION_GATE.TYPES.CHAIN;
    const apertureWidth = getGateWidth(type);
    const poleRadius = apertureWidth * CALIBRATION_GATE.POLE_RATIO;
    const halfSpan = apertureWidth / 2 + poleRadius;
    const maxDist = viewRadius - CALIBRATION_GATE.EDGE_OFFSET - halfSpan;
    if (maxDist <= 0) {
      return null;
    }
    const minDist = Math.max(halfSpan, maxDist * 0.9);
    const chainCount = Math.floor(
      randomRange(CALIBRATION_GATE.CHAIN_MIN, CALIBRATION_GATE.CHAIN_MAX + 1)
    );

    const turnDir = Math.random() < 0.5 ? -1 : 1;
    for (let attempt = 0; attempt < CALIBRATION_GATE.CHAIN_ATTEMPTS; attempt++) {
      const radius = randomRange(minDist, maxDist);
      const span = randomRange(CALIBRATION_GATE.CHAIN_ARC_MIN, CALIBRATION_GATE.CHAIN_ARC_MAX);
      const step = chainCount > 1 ? span / (chainCount - 1) : 0;
      const start = 0;
      const gates = [];
      let valid = true;

      for (let i = 0; i < chainCount; i++) {
        const arcDir = rotateVector(dir, (start + step * i) * turnDir);
        const candidate = {
          x: ship.x + arcDir.x * radius,
          y: ship.y + arcDir.y * radius
        };
        if (!isWithinBounds(candidate, bounds, margin)) {
          valid = false;
          break;
        }
        if (!isGateLocationClear(candidate, halfSpan)) {
          valid = false;
          break;
        }
        gates.push(buildGate(type, candidate, axis, dir, apertureWidth, poleRadius));
      }

      if (valid) {
        return gates;
      }
    }
    return null;
  }

  function createGate(viewRadius) {
    if (!isSectorGateEligible(sector)) {
      return null;
    }
    if (!Number.isFinite(viewRadius) || viewRadius <= 0) {
      return null;
    }
    const bounds = sector.bounds;
    const dir = getTravelDirection();
    const axis = { x: -dir.y, y: dir.x };
    const margin = 260;
    const type = pickGateType();

    if (type === CALIBRATION_GATE.TYPES.CHAIN) {
      return createChainGateSeries(viewRadius, bounds, dir, axis, margin);
    }

    const single = createSingleGate(viewRadius, type, bounds, dir, axis, margin);
    return single ? [single] : null;
  }

  function applyGateEffect(gate) {
    const type = gate.type;
    const target = getNearestCalibrationTarget();
    sounds.play("got_gate");
    if (type === CALIBRATION_GATE.TYPES.CHAIN) {
      calibrationScore += 1;
      chainProgress += 1;
      const points = CALIBRATION_GATE.CHAIN_SCORE_BASE * chainProgress;
      addScore(points, false, false, gate.center, "chain");
      return;
    }
    addScore(CALIBRATION_GATE.GATE_SCORE_BASE, false, false, gate.center, "gate");
    if (type === CALIBRATION_GATE.TYPES.DISPLACEMENT) {
      if (!target) {
        return;
      }
      const dx = target.x - ship.x;
      const dy = target.y - ship.y;
      const dist = Math.hypot(dx, dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;
      const offset = Math.max(CALIBRATION_GATE.EXCLUSION_RADIUS, 240);
      ship.x = target.x - dirX * offset;
      ship.y = target.y - dirY * offset;
      lastShipX = ship.x;
      lastShipY = ship.y;
      lastTrailX = ship.x;
      lastTrailY = ship.y;
      trail.length = 0;
      const heading = Math.atan2(dx, -dy);
      ship.heading = heading;
      const speed = clampValue(Math.hypot(ship.vx, ship.vy), CALIBRATION_GATE.CRUISE_MIN, CALIBRATION_GATE.CRUISE_MAX);
      ship.vx = Math.sin(heading) * speed;
      ship.vy = -Math.cos(heading) * speed;
      gateCorrection = null;
      return;
    }
    if (type === CALIBRATION_GATE.TYPES.SHUTDOWN) {
      controlsDisabledTimer = Math.max(controlsDisabledTimer, CONTROL_DISABLE.DURATION);
      ship.stopThrustLoop();
      ship.stopRotateLoop();
      ship.thrusting = 0;
      return;
    }
    if (type === CALIBRATION_GATE.TYPES.EXIT) {
      const desired = getExitTarget();
      const dx = desired.x - ship.x;
      const dy = desired.y - ship.y;
      const heading = Math.atan2(dx, -dy);
      ship.heading = heading;
      ship.vx = Math.sin(heading) * CALIBRATION_GATE.CRUISE_SPEED;
      ship.vy = -Math.cos(heading) * CALIBRATION_GATE.CRUISE_SPEED;
      gateCorrection = null;
    }
  }

  function updateGate(dt) {
    if (activeGates.length === 0) {
      return;
    }
    const remaining = [];
    for (const gate of activeGates) {
      if (gate.state === "spawning") {
        gate.fadeTimer += dt;
        if (gate.fadeTimer >= CALIBRATION_GATE.FADE_TIME) {
          gate.state = "active";
          gate.fadeTimer = 0;
        }
        remaining.push(gate);
        continue;
      }

      if (gate.state === "active") {
        gate.lifeTimer += dt;
        if (gate.lifeTimer >= CALIBRATION_GATE.LIFETIME) {
          gate.state = "fading";
          gate.fadeTimer = 0;
          remaining.push(gate);
          continue;
        }

        const dx = ship.x - gate.center.x;
        const dy = ship.y - gate.center.y;
        const planeDist = dx * gate.normal.x + dy * gate.normal.y;
        if (gate.prevPlane !== null) {
          if ((gate.prevPlane > 0 && planeDist <= 0) || (gate.prevPlane < 0 && planeDist >= 0)) {
            const lateral = Math.abs(dx * gate.axis.x + dy * gate.axis.y);
            if (lateral <= gate.width / 2) {
              gate.resolved = true;
              applyGateEffect(gate);
            }
            gate.state = "fading";
            gate.fadeTimer = 0;
          }
        }
        gate.prevPlane = planeDist;
        remaining.push(gate);
        continue;
      }

      if (gate.state === "fading") {
        gate.fadeTimer += dt;
        if (gate.fadeTimer < CALIBRATION_GATE.FADE_TIME) {
          remaining.push(gate);
        }
      }
    }
    activeGates = remaining;
  }

  function applyGateCorrection(dt) {
    if (!gateCorrection) {
      return;
    }
    gateCorrection.elapsed += dt;
    const t = clampValue(gateCorrection.elapsed / gateCorrection.duration, 0, 1);
    const heading = lerpAngle(gateCorrection.startHeading, gateCorrection.targetHeading, t);
    const speed = gateCorrection.startSpeed + (gateCorrection.targetSpeed - gateCorrection.startSpeed) * t;
    ship.heading = heading;
    ship.vx = Math.sin(heading) * speed;
    ship.vy = -Math.cos(heading) * speed;
    if (t >= 1) {
      gateCorrection = null;
    }
  }

  function drawGate(ctx) {
    if (activeGates.length === 0) {
      return;
    }
    for (const gate of activeGates) {
      const fade = gate.state === "spawning"
        ? clampValue(gate.fadeTimer / CALIBRATION_GATE.FADE_TIME, 0, 1)
        : gate.state === "fading"
          ? 1 - clampValue(gate.fadeTimer / CALIBRATION_GATE.FADE_TIME, 0, 1)
          : 1;
      if (fade <= 0) {
        continue;
      }

      const axis = gate.axis;
      const normal = gate.normal;
      const half = gate.width / 2;
      const left = {
        x: gate.center.x - axis.x * half,
        y: gate.center.y - axis.y * half
      };
      const right = {
        x: gate.center.x + axis.x * half,
        y: gate.center.y + axis.y * half
      };
      const poleRadius = gate.poleRadius * (gate.type === CALIBRATION_GATE.TYPES.DISPLACEMENT ? 1.15 : 1);
      const color = gate.color;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = gate.thickness;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      if (gate.type === CALIBRATION_GATE.TYPES.CHAIN) {
        const offset = gate.thickness * 2;
        ctx.lineWidth = gate.thickness;
        ctx.beginPath();
        ctx.moveTo(left.x + normal.x * offset, left.y + normal.y * offset);
        ctx.lineTo(right.x + normal.x * offset, right.y + normal.y * offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(left.x - normal.x * offset, left.y - normal.y * offset);
        ctx.lineTo(right.x - normal.x * offset, right.y - normal.y * offset);
        ctx.stroke();
      } else if (gate.type === CALIBRATION_GATE.TYPES.DISPLACEMENT) {
        ctx.lineWidth = gate.thickness * 2.8;
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      } else if (gate.type === CALIBRATION_GATE.TYPES.SHUTDOWN) {
        ctx.lineWidth = gate.thickness * 2.4;
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      } else if (gate.type === CALIBRATION_GATE.TYPES.EXIT) {
        ctx.lineWidth = gate.thickness * 1.4;
        const dashLen = gate.thickness * 4;
        const gap = gate.thickness * 3;
        const total = gate.width;
        let drawn = 0;
        while (drawn < total) {
          const seg = Math.min(dashLen, total - drawn);
          const t0 = drawn / total;
          const t1 = (drawn + seg) / total;
          ctx.beginPath();
          ctx.moveTo(left.x + (right.x - left.x) * t0, left.y + (right.y - left.y) * t0);
          ctx.lineTo(left.x + (right.x - left.x) * t1, left.y + (right.y - left.y) * t1);
          ctx.stroke();
          drawn += seg + gap;
        }
      }

      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(left.x, left.y, poleRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(right.x, right.y, poleRadius, 0, Math.PI * 2);
      ctx.stroke();

      if (gate.type === CALIBRATION_GATE.TYPES.EXIT) {
        const notchSize = poleRadius * 0.45;
        const notchDir = { x: normal.x, y: normal.y };
        ctx.beginPath();
        ctx.moveTo(left.x + notchDir.x * notchSize, left.y + notchDir.y * notchSize);
        ctx.lineTo(left.x + axis.x * notchSize * 0.4, left.y + axis.y * notchSize * 0.4);
        ctx.lineTo(left.x - axis.x * notchSize * 0.4, left.y - axis.y * notchSize * 0.4);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(right.x + notchDir.x * notchSize, right.y + notchDir.y * notchSize);
        ctx.lineTo(right.x + axis.x * notchSize * 0.4, right.y + axis.y * notchSize * 0.4);
        ctx.lineTo(right.x - axis.x * notchSize * 0.4, right.y - axis.y * notchSize * 0.4);
        ctx.closePath();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  function markStateDirty() {
    stateDirty = true;
  }

  function saveStateIfNeeded() {
    if (!gameState) {
      return;
    }
    if (!stateDirty) {
      return;
    }
    if (timeSpent - lastStateSave < 2) {
      return;
    }
    saveGameState(gameState);
    lastStateSave = timeSpent;
    stateDirty = false;
  }

  function pauseForLifeLoss(outcome) {
    if (deathPauseActive) {
      return;
    }
    deathPauseActive = true;
    ship.stopThrustLoop();
    ship.stopRotateLoop();
    if (deathModal && typeof deathModal.close === "function") {
      deathModal.close();
    }
    deathModal = showShipDestroyedModal(uiRoot, lives, () => {
      deathPauseActive = false;
      deathModal = null;
      if (outcome === "respawn") {
        queueRespawn();
      } else if (outcome === "gameover") {
        endGame();
      }
    });
  }

  function handleLifeLoss(explosionType) {
    triggerShake(SHAKE.HIT);
    if (explosionType) {
      spawnExplosion(particles, ship.x, ship.y, explosionType);
    }
    lives -= 1;
    shipVisible = false;
    if (lives <= 0) {
      sounds.play("game_over");
      pauseForLifeLoss("gameover");
      return;
    }
    sounds.play("lost_life");
    pauseForLifeLoss("respawn");
  }

  function pushLimited(list, entry, max) {
    if (!Array.isArray(list)) {
      return;
    }
    list.push(entry);
    if (list.length > max) {
      list.splice(0, list.length - max);
    }
  }

  function getSectorKey(sector) {
    return sector ? `${sector.sx},${sector.sy}` : "";
  }

  function ensureSectorMeta(sector) {
    if (!sector) {
      return null;
    }
    const meta = getSectorMeta(sectorIndex, sector.sx, sector.sy);
    if (meta) {
      return meta;
    }
    const fallback = {
      sectorType: sector.sectorType ?? SECTOR_TYPES.GENERIC,
      sectorMood: sector.sectorMood ?? "NEUTRAL",
      beaconPlaced: Boolean(sector.beacon),
      beaconPosition: sector.beacon ? { x: sector.beacon.x, y: sector.beacon.y } : null,
      generatedAtExposure: Math.max(0, gameState?.beacon?.exposure ?? 0),
      visited: false,
      surveyComplete: false,
      lastVisitedAt: null,
      anomalyModifier: sector.anomalyModifier ?? null,
      echoTag: sector.echoTag ?? null
    };
    setSectorMeta(sectorIndex, sector.sx, sector.sy, fallback);
    saveSectorIndex(sectorIndex);
    return fallback;
  }

  function updateSectorMeta(sector, updater) {
    const meta = ensureSectorMeta(sector);
    if (!meta) {
      return null;
    }
    updater(meta);
    setSectorMeta(sectorIndex, sector.sx, sector.sy, meta);
    saveSectorIndex(sectorIndex);
    return meta;
  }

  function isActiveMotif(motif) {
    return motif === "INVOCATION" || motif === "RESPONSE";
  }

  function updateBeaconSignal(dt, observing) {
    const cycle = BEACON.SIGNAL_CYCLE;
    const step = dt / cycle;
    beaconSignal.phase = (beaconSignal.phase + step) % 1;
    const phase = beaconSignal.phase;
    if (phase < 0.25) {
      beaconSignal.motif = "INVOCATION";
    } else if (phase < 0.5) {
      beaconSignal.motif = "RESPONSE";
    } else if (phase < 0.75) {
      beaconSignal.motif = "DRIFT";
    } else {
      beaconSignal.motif = "FRACTURE";
    }
    const pulseRate = observing ? 3.1 : 2.4;
    const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2 * pulseRate);
    beaconSignal.strength = 0.35 + 0.65 * pulse;
  }

  function applyBeaconExposure(delta) {
    if (!gameState?.beacon) {
      return;
    }
    gameState.beacon.exposure = Math.max(0, (gameState.beacon.exposure ?? 0) + delta);
    markStateDirty();
  }

  function shouldHedge(exposure) {
    return exposure >= 0.6;
  }

  function hedgeText(text, exposure) {
    if (!shouldHedge(exposure)) {
      return text;
    }
    const hedges = [
      `Signal suggests: ${text}`,
      `Uncertain reading: ${text}`,
      `Appears consistent with: ${text}`
    ];
    const index = Math.floor(((exposure * 10) % hedges.length));
    return hedges[index];
  }

  function getSectorAlert(sector, meta, exposure) {
    if (!sector || !meta) {
      return null;
    }
    const type = meta.sectorType ?? sector.sectorType ?? SECTOR_TYPES.GENERIC;
    if (meta.surveyComplete && type !== SECTOR_TYPES.SIGNAL_ORIGIN) {
      return null;
    }
    if (type === SECTOR_TYPES.GENERIC) {
      return null;
    }
    if (type === SECTOR_TYPES.SIGNAL_ORIGIN) {
      return hedgeText("Signal origin detected.", exposure);
    }
    if (type === SECTOR_TYPES.DEAD_QUIET) {
      return hedgeText("Dead quiet sector.", exposure);
    }
    if (type === SECTOR_TYPES.DERELICT_FIELD) {
      return hedgeText("Derelict field signatures.", exposure);
    }
    if (type === SECTOR_TYPES.ANOMALY) {
      return hedgeText("Anomalous scan return.", exposure);
    }
    if (type === SECTOR_TYPES.ECHO) {
      if (meta.echoTag) {
        return hedgeText(`Echo pattern aligns with ${meta.echoTag}.`, exposure);
      }
      return hedgeText("Echo signatures detected.", exposure);
    }
    return null;
  }

  function getAnomalyEffects(sector, timeMs) {
    if (!sector?.anomalyModifier) {
      return null;
    }
    const t = timeMs * 0.001;
    const modifier = sector.anomalyModifier;
    if (modifier === "SCANNER_JITTER") {
      return {
        jitter: Math.sin(t * 6.2) * 0.06
      };
    }
    if (modifier === "RANGE_DRIFT") {
      return {
        radiusOffset: Math.sin(t * 0.8) * 6,
        rangeScale: 1 + Math.sin(t * 0.6) * 0.04
      };
    }
    if (modifier === "ORIENTATION_DRIFT") {
      return {
        angleOffset: Math.sin(t * 0.35) * 0.08
      };
    }
    if (modifier === "PULSE_GHOSTS") {
      return {
        ghostPulse: 0.5 + 0.5 * Math.sin(t * 2.4)
      };
    }
    return null;
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

  function updateScorePopups(dt) {
    if (scorePopups.length === 0) {
      return;
    }
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const popup = scorePopups[i];
      popup.age += dt;
      if (popup.age >= popup.life) {
        scorePopups.splice(i, 1);
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
    updateParticles(particles, dt);
    updateEnemyBullets(enemyBullets, enemies, ship, SHIP_RADIUS, invulnTimer, shipVisible, handleLifeLoss, dt);
    updateEnemyPings(enemyPings, dt);
    updateAlerts(dt);
    updateScorePopups(dt);
    updateShake(dt);
    updateBackgroundEvents(dt);
    if (controlsDisabledTimer > 0) {
      controlsDisabledTimer = Math.max(0, controlsDisabledTimer - dt);
    }
    if (deathPauseActive) {
      saveStateIfNeeded();
      return;
    }
    if (pendingGameOver) {
      gameOverTimer = Math.max(0, gameOverTimer - dt);
      if (gameOverTimer === 0) {
        finalizeGameOver();
      }
      saveStateIfNeeded();
      return;
    }
    if (respawnTimer > 0) {
      respawnTimer = Math.max(0, respawnTimer - dt);
      if (respawnTimer === 0) {
        respawn();
        shipVisible = true;
      }
      saveStateIfNeeded();
      return;
    }
    const controlsDisabled = controlsDisabledTimer > 0;
    let externalInput = null;
    let keyboardRotationInput = 0;
    let keyboardThrustInput = 0;
    if (!controlsDisabled) {
      if (keys["arrowleft"] || keys["a"]) keyboardRotationInput -= 1;
      if (keys["arrowright"] || keys["d"]) keyboardRotationInput += 1;
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
    }
    if (controlsDisabled) {
      externalInput = { disableControls: true };
    }
    ship.update(dt, externalInput);
    applyGateCorrection(dt);
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
    updateBullets(bullets, dt);

    sector = sectorManager.getSectorForPosition(ship.x, ship.y);
    activeSectors = sectorManager.getSectorsAround(ship.x, ship.y, ACTIVE_SECTOR_RANGE);

    const viewRadius = getViewRadius(canvas, camera);
    if (activeGates.length === 0) {
      gateSpawnTimer -= dt;
      if (gateSpawnTimer <= 0) {
        const spawned = createGate(viewRadius);
        if (Array.isArray(spawned) && spawned.length > 0) {
          activeGates = spawned;
          chainProgress = 0;
        }
        const spawnScale = clampValue(
          viewRadius / CALIBRATION_GATE.BASE_VIEW_RADIUS,
          0.7,
          1.6
        );
        gateSpawnTimer = randomRange(CALIBRATION_GATE.SPAWN_MIN, CALIBRATION_GATE.SPAWN_MAX) * spawnScale;
      }
    }

    const sectorKey = getSectorKey(sector);
    if (sectorKey && sectorKey !== lastSectorKey) {
      if (lastSectorRef && wasInBeaconZone && wasInActiveMotif && lastSectorRef.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN) {
        if (gameState?.beacon) {
          gameState.beacon.leftMidCycleCount = (gameState.beacon.leftMidCycleCount ?? 0) + 1;
          applyBeaconExposure(-BEACON.MIDCYCLE_PENALTY);
        }
      }

      const meta = updateSectorMeta(sector, (entry) => {
        entry.visited = true;
        entry.lastVisitedAt = Date.now();
      });
      const exposure = gameState?.beacon?.exposure ?? 0;
      const alertText = getSectorAlert(sector, meta, exposure);
      if (alertText) {
        queueAlert(alertText, 0, ALERT.DURATION * 1.2);
      }
      if (gameState) {
        gameState.furthestRing = Math.max(gameState.furthestRing ?? 0, sector.ring ?? 0);
        if (!gameState.history) {
          gameState.history = { recentSectors: [], recentSurveys: [], recentBeaconVisits: [] };
        }
        pushLimited(gameState.history.recentSectors, {
          id: sectorKey,
          ring: sector.ring,
          type: sector.sectorType
        }, 20);
        markStateDirty();
      }

      lastSectorKey = sectorKey;
      lastSectorRef = sector;
    }

    if (beaconScanPenalty > 0) {
      beaconScanPenalty = Math.max(0, beaconScanPenalty - dt);
    }

    let inBeaconZone = false;
    if (sector?.beacon) {
      const dx = ship.x - sector.beacon.x;
      const dy = ship.y - sector.beacon.y;
      const dist = Math.hypot(dx, dy);
      const radius = Number.isFinite(sector.beacon.radius) ? sector.beacon.radius : BEACON.OBSERVER_RADIUS;
      inBeaconZone = dist <= radius;
      updateBeaconSignal(dt, inBeaconZone);

      if (inBeaconZone) {
        if (!wasInBeaconZone) {
          const now = Date.now();
          const lastVisit = gameState?.history?.recentBeaconVisits?.slice(-1)[0];
          const lastTime = Number.isFinite(lastVisit?.at) ? lastVisit.at : 0;
          const cooldownOk = (now - lastTime) / 1000 >= BEACON.VISIT_COOLDOWN;
          if (gameState?.beacon) {
            gameState.beacon.visitCount = (gameState.beacon.visitCount ?? 0) + 1;
            if (cooldownOk) {
              applyBeaconExposure(BEACON.RETURN_BONUS);
            }
          }
          if (gameState?.history) {
            pushLimited(gameState.history.recentBeaconVisits, { id: sectorKey, at: now }, 30);
          }
          markStateDirty();
        }

        if (gameState?.beacon) {
          const penalty = beaconScanPenalty > 0 ? 0.6 : 1;
          gameState.beacon.totalObservedSeconds = (gameState.beacon.totalObservedSeconds ?? 0) + dt;
          applyBeaconExposure(dt * BEACON.OBSERVE_RATE * penalty);
        }
      }
    } else {
      beaconSignal.strength = 0;
    }

    wasInBeaconZone = inBeaconZone;
    wasInActiveMotif = isActiveMotif(beaconSignal.motif);

    // --- gravity debug accumulation ---
    ship.debugGravityX = 0;
    ship.debugGravityY = 0;

    const activeStars = activeSectors.flatMap((s) => s.stars);
    for (const activeSector of activeSectors) {
      if (activeSector.beacon && !activeSector.beaconEntity) {
        activeSector.beaconEntity = new BeaconRelic(activeSector.beacon.x, activeSector.beacon.y, {
          size: 190,
          shimmerPhase: (activeSector.sx + activeSector.sy) * 0.5
        });
      }
      if (!activeSector.goalCollected && typeof activeSector.goal.update === "function") {
        activeSector.goal.update(dt);
      }
      if (!activeSector.goalDelivered && typeof activeSector.endZone.update === "function") {
        activeSector.endZone.update(dt);
      }
      if (activeSector.beaconEntity && typeof activeSector.beaconEntity.update === "function") {
        activeSector.beaconEntity.update(dt);
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
    updateGate(dt);
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
    updateFuelPickups(fuelPickups, activeStars, dt);
    enemiesInRange = updateEnemies(
      enemies,
      ship,
      dt,
      activeStars,
      MINIMAP.RANGE,
      ENEMY_FIRE_RANGE,
      ENEMY.FIRE_COOLDOWN,
      enemyBullets,
      BULLET.SPEED,
      ENEMY_BULLET_LIFE,
      sounds
    );
    handleFuelPickups(fuelPickups, ship, SHIP_RADIUS, SCORE_POINTS, addScore, sounds);
    handleBulletHits(
      bullets,
      enemies,
      activeSectors,
      SCORE_POINTS,
      SCORE_CHUNK_MULTIPLIER,
      addScore,
      sounds,
      fuelPickups,
      particles
    );
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
        handleLifeLoss("star");
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
            handleLifeLoss("normal");
            return;
          }
        }
      }
    }

    if (ship.fuel <= 0 && keys["q"]) {
      keys["q"] = false;
      handleLifeLoss("normal");
      return;
    }

    const wantsFire = !controlsDisabled
      && (keys[" "] || (mouseAimEnabled && mouse.leftDown) || touch.fireId !== null);
    if (shipVisible && wantsFire && fireCooldown === 0 && fireLockout === 0) {
      spawnBullet(bullets, ship, BULLET);
      sounds.play("laser");
      triggerShake(SHAKE.FIRE, 0.12);
      fireCooldown = BULLET.COOLDOWN;
    }

    if (!sector.goalCollected && sector.goal.containsPoint(ship.x, ship.y, SHIP_RADIUS)) {
      sector.goalCollected = true;
      ship.fuel = ship.maxFuel;
      if (inBeaconZone) {
        beaconScanPenalty = Math.max(beaconScanPenalty, 10);
      }
    }

    if (!sector.goalDelivered && sector.endZone.containsPoint(ship.x, ship.y, SHIP_RADIUS)) {
      sector.goalDelivered = true;
      ship.fuel = ship.maxFuel;
      surveyed += 1;
      scoreMultiplier = 1 + surveyed;
      addScore(SCORE_POINTS.SURVEY, false, false, { x: ship.x, y: ship.y }, "survey");
      queueAlert("Sector surveyed.");
      queueAlert("Fuel tanks refilled!", ALERT.DURATION);
      triggerShake(SHAKE.SURVEY);
      sounds.play("got_survey");
      const wasSurveyed = ensureSectorMeta(sector)?.surveyComplete;
      const meta = updateSectorMeta(sector, (entry) => {
        entry.surveyComplete = true;
        entry.lastVisitedAt = Date.now();
      });
      if (meta?.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN && !wasSurveyed) {
        applyBeaconExposure(BEACON.SURVEY_BONUS);
      }
      if (gameState?.history) {
        pushLimited(gameState.history.recentSurveys, {
          id: getSectorKey(sector),
          ring: sector.ring,
          count: surveyed
        }, 30);
        markStateDirty();
      }
      console.log("[survey] completed", {
        sector: `${sector.sx},${sector.sy}`,
        surveyed
      });
      const spawned = spawnEnemyForSurvey();
      if (spawned > 0) {
        queueAlert("Enemies have been alerted as to your position.", ALERT.DURATION * 2);
      }
    }

    saveStateIfNeeded();
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
    if (activeSector.beaconEntity) {
      activeSector.beaconEntity.draw(ctx);
    }
    for (const asteroid of activeSector.asteroids) {
      asteroid.draw(ctx);
    }
  }
  drawGate(ctx);
  drawFuelPickups(ctx, fuelPickups);
  drawEnemies(ctx, enemies);
  drawEnemyBullets(ctx, enemyBullets);
  drawBullets(ctx, bullets);
  drawParticles(ctx, particles);
  if (shipVisible) {
    if (controlsDisabledTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ship.draw(ctx, shipSpeed);
      ctx.restore();
    } else {
      ship.draw(ctx, shipSpeed);
    }
  }
  camera.resetTransform(ctx);

  if (DEBUG.VECTORS) {
    drawDebugVectors(ctx, ship);
  }
  drawScreenEffects(ctx, canvas.width, canvas.height);
  if (controlsDisabledTimer > 0 && shipVisible) {
    drawControlDisableOverlay(ctx, canvas, camera, controlsDisabledTimer, CALIBRATION_SHIP_RADIUS);
  }
  drawScorePopups(ctx, canvas, camera, ship, scorePopups);
  const hudScale = getHudScale(canvas.width, canvas.height);
  ctx.save();
  ctx.scale(hudScale, hudScale);
  const hudW = canvas.width / hudScale;
  const hudH = canvas.height / hudScale;
  const isCompactHud = Math.min(canvas.width, canvas.height) < 820;
  const controlLabel = touch.isActive
    ? "CTRL: TOUCH + KEYS"
    : (mouseAimEnabled ? "CTRL: MOUSE + KEYS" : "CTRL: KEYS");
  const anomalyEffects = getAnomalyEffects(sector, time);
  drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, enemiesInRange, hudW, hudH, anomalyEffects);
  drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, hudW, hudH, isCompactHud, anomalyEffects);
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
  if (sector?.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN) {
    drawBeaconSignalHud(ctx, beaconSignal.strength, hudW, hudH, isCompactHud);
  }
  drawAlerts(ctx, alerts, alertClock, hudW, hudH);
  ctx.restore();
  drawMouseReticle(ctx, mouse, canvas.width, canvas.height, mouseAimEnabled);
  drawTouchControls(ctx, touch, canvas.width, canvas.height);
}

function lerp(start, end, t) {
  return start + (end - start) * t;
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

function normalizeAngle(angle) {
  return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerpAngle(from, to, t) {
  const delta = normalizeAngle(to - from);
  return from + delta * t;
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
    if (gameState) {
      saveGameState(gameState);
    }
    saveSectorIndex(sectorIndex);
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
    if (gameState) {
      saveGameState(gameState);
    }
    saveSectorIndex(sectorIndex);
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
