import { Ship } from "../entities/ship.js";
import { EnemyShip } from "../entities/enemyShip.js";
import { BeaconRelic } from "../entities/beaconRelic.js";
import { UpgradeStation } from "../entities/upgradeStation.js";
import { Camera } from "./camera.js";
import { SectorManager, SECTOR_SIZE, SECTOR_TYPES } from "./sectorManager.js";
import { computeStarAccelAt, integrate } from "./physics.js";
import { applyForcesToEntity } from "./forceFields.js";
import { sounds, music } from "./audio.js";
import { getSectorMeta, saveSectorIndex, setSectorMeta } from "./sectorIndex.js";
import { createDefaultGameState, saveGameState } from "./gameState.js";
import { showShipDestroyedModal } from "../ui/shipDestroyedModal.js";
import { showUpgradeStationModal } from "../ui/upgradeStationModal.js";
import { drawRivers } from "./riverRender.js";
import { getRiversForSector } from "./riverNetwork.js";
import { getStationInfoForSector, pickStationPosition } from "./stationSystem.js";
import { createRng } from "./rng.js";
import {
  ALERT,
  HUD_COLORS,
  HUD_FONT,
  MINIMAP,
  drawAutopilotToggle,
  drawAlerts,
  getAutopilotButtonRect,
  drawBeaconSignalHud,
  drawBearingIndicators,
  drawFuelGauge,
  drawMiniMap,
  drawStationIndicators,
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
  drawResourcePickups,
  getEnemySpawnCountForSector,
  handleBulletHits,
  handleFuelPickups,
  handleResourcePickups,
  spawnBullet,
  spawnExplosion,
  updateBullets,
  updateEnemies,
  updateEnemyBullets,
  updateEnemyPings,
  updateFuelPickups,
  updateResourcePickups,
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
  SECTOR,
  RIVER,
  AUTOPILOT,
  UPGRADES,
  STATION
} = CONFIG;

const { ZOOM, SHAKE } = CAMERA;
const {
  ACTIVE_SECTOR_RANGE,
  STARTING_LIVES,
  INVULN_DURATION,
  GAME_OVER_DELAY,
  RESPAWN_DELAY,
  INTRO
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

function getViewRadius(canvas, camera) {
  return (Math.hypot(canvas.width, canvas.height) / 2) / camera.zoom;
}

function getSectorCenter(sx, sy) {
  return {
    x: sx * SECTOR_SIZE + SECTOR_SIZE / 2,
    y: sy * SECTOR_SIZE + SECTOR_SIZE / 2
  };
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function getHudScale(screenW, screenH) {
  const base = Math.min(screenW, screenH);
  const minScale = base < 420 ? 0.65 : 0.75;
  return Math.min(1, Math.max(minScale, base / 900));
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

export function startGame(canvas, ctx, uiRoot, gameState, sectorIndex, onGameOver, options = {}) {
  const demoMode = Boolean(options?.demoMode);
  const autopilotDefault = Boolean(options?.autopilotDefault);
  const onExitToMenu = typeof options?.onExitToMenu === "function" ? options.onExitToMenu : null;
  if (demoMode) {
    gameState = createDefaultGameState(AUTOPILOT.DEMO_SEED);
    sectorIndex = {};
  }
  const allowPersistence = !demoMode;
  sounds.preload();
  sounds.setMuted(demoMode);
  music.start();
  const startX = SECTOR_SIZE / 2;
  const startY = SECTOR_SIZE / 2;
  const originX = startX;
  const originY = startY;
  const ship = new Ship(startX, startY);
  const camera = new Camera(ship);
  const sectorManager = new SectorManager({
    worldSeed: Number.isFinite(gameState?.worldSeed) ? gameState.worldSeed : 0,
    sectorIndex,
    gameState,
    startSafeRadius: START_SAFE_RADIUS,
    persist: allowPersistence
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
  let farthestSector = { sx: sector.sx, sy: sector.sy, distance: 0 };
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
  const resourcePickups = [];
  const alerts = [];
  const scorePopups = [];
  let stationMarkers = [];

  let lastTime = performance.now();
  let running = true;
  let rafId = null;
  let gameOver = false;
  let pendingGameOver = false;
  let gameOverTimer = 0;
  let cachedGameOverStats = null;
  let shipVisible = true;
  let respawnTimer = 0;
  let upgradeLevels = {
    fireRateLevel: 0,
    hullLevel: 0,
    collectorLevel: 0
  };
  let resourceCurrency = 0;
  if (gameState) {
    if (Number.isFinite(gameState.resourceCurrency)) {
      resourceCurrency = Math.max(0, Math.floor(gameState.resourceCurrency));
    }
    if (gameState.upgrades) {
      upgradeLevels = {
        fireRateLevel: Math.min(UPGRADES.FIRE_RATE.levelMax, Math.max(0, Math.floor(gameState.upgrades.fireRateLevel ?? 0))),
        hullLevel: Math.min(UPGRADES.HULL.levelMax, Math.max(0, Math.floor(gameState.upgrades.hullLevel ?? 0))),
        collectorLevel: Math.min(UPGRADES.COLLECTOR.levelMax, Math.max(0, Math.floor(gameState.upgrades.collectorLevel ?? 0)))
      };
    }
  }
  let maxLives = getMaxLives(upgradeLevels.hullLevel);
  let lives = maxLives;
  if (gameState) {
    gameState.resourceCurrency = resourceCurrency;
    gameState.upgrades = {
      fireRateLevel: upgradeLevels.fireRateLevel,
      hullLevel: upgradeLevels.hullLevel,
      collectorLevel: upgradeLevels.collectorLevel
    };
  }
  let surveyed = 0;
  let invulnTimer = 0;
  let timeSpent = 0;
  let distanceTraveled = 0;
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
  const intro = {
    enabled: !demoMode,
    suppressAlerts: !demoMode,
    clock: 0,
    nextAt: 0,
    controlUsed: false,
    firstSurveyComplete: false,
    sectorTransitions: 0,
    lastSectorKey: null,
    releaseAlertsAt: null,
    flags: {
      systems: false,
      goals: false,
      score: false,
      fuel: false,
      weird: false,
      rivers: false,
      stars: false,
      distance: false,
      anomaly: false,
      echo: false,
      movingStars: false,
      station: false
    },
    highlightQueue: [],
    highlights: {
      goal: 0,
      exit: 0,
      score: 0,
      fuel: 0,
      vignette: 0,
      river: 0
    }
  };
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
  let docked = false;
  let dockStation = null;
  let stationEntryLockId = null;
  let upgradeModal = null;
  let interactPressed = false;
  let autopilotActive = autopilotDefault;
  let autopilotFirePause = 0;
  let autopilotThrustCooldown = 0;
  let autopilotThrustBurst = 0;
  let autopilotTurnBias = 1;
  let autopilotButtonRect = null;
  sounds.setKeyMuted("thrust", autopilotActive);
  sounds.setKeyMuted("thrust_rotate", autopilotActive);
  let autopilotTarget = null;
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
  let interactButton = null;
  let exitButton = null;
  let terminateButton = null;
  let terminateRequested = false;
  let mouseAimEnabled = true;
  let wheelZoomStep = 0;
  const pinch = {
    active: false,
    startDist: 0,
    startZoom: 1
  };

  const updateMousePosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    mouse.x = (event.clientX - rect.left) * scaleX;
    mouse.y = (event.clientY - rect.top) * scaleY;
    mouse.hasMoved = true;
  };
  const getAutopilotRectScreen = () => {
    if (autopilotButtonRect) {
      return autopilotButtonRect;
    }
    const hudScale = getHudScale(canvas.width, canvas.height);
    const hudW = canvas.width / hudScale;
    const hudH = canvas.height / hudScale;
    const isCompactHud = Math.min(canvas.width, canvas.height) < 820;
    const rect = getAutopilotButtonRect(hudW, hudH, isCompactHud);
    return {
      x: rect.x * hudScale,
      y: rect.y * hudScale,
      width: rect.width * hudScale,
      height: rect.height * hudScale
    };
  };
  const tryToggleAutopilot = (screenX, screenY) => {
    if (docked || deathPauseActive || pendingGameOver) {
      return false;
    }
    const rect = getAutopilotRectScreen();
    if (!rect) {
      return false;
    }
    const hit = screenX >= rect.x && screenX <= rect.x + rect.width
      && screenY >= rect.y && screenY <= rect.y + rect.height;
    if (!hit) {
      return false;
    }
    setAutopilotActive(!autopilotActive, true);
    return true;
  };

  const onMouseMove = (event) => updateMousePosition(event);
  const onMouseDown = (event) => {
    updateMousePosition(event);
    if (event.button === 0) {
      if (tryToggleAutopilot(mouse.x, mouse.y)) {
        return;
      }
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
      if (tryToggleAutopilot(pos.x, pos.y)) {
        continue;
      }
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
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });
  canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  if (uiRoot) {
    interactButton = document.createElement("button");
    interactButton.type = "button";
    interactButton.className = "interact-button";
    interactButton.textContent = "INTERACT";
    interactButton.style.display = "none";
    interactButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      interactPressed = true;
    });
    uiRoot.appendChild(interactButton);

    exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.className = "exit-button";
    exitButton.textContent = "X";
    exitButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      requestExitToMenu();
    });
    uiRoot.appendChild(exitButton);

    terminateButton = document.createElement("button");
    terminateButton.type = "button";
    terminateButton.className = "terminate-button";
    terminateButton.textContent = "OUT OF FUEL - PRESS TO TERMINATE FLIGHT";
    terminateButton.style.display = "none";
    terminateButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      terminateRequested = true;
    });
    uiRoot.appendChild(terminateButton);
  }

  function cleanupMouseControls() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.removeEventListener("touchcancel", onTouchEnd);
    canvas.removeEventListener("contextmenu", onContextMenu);
    canvas.removeEventListener("wheel", onWheel);
    if (interactButton) {
      interactButton.remove();
      interactButton = null;
    }
    if (exitButton) {
      exitButton.remove();
      exitButton = null;
    }
    if (terminateButton) {
      terminateButton.remove();
      terminateButton = null;
    }
    closeUpgradeModal();
  }

  function respawn() {
    const target = farthestSector ?? { sx: sector?.sx ?? 0, sy: sector?.sy ?? 0, distance: 0 };
    const respawnPoint = getSectorCenter(target.sx, target.sy);
    ship.x = respawnPoint.x;
    ship.y = respawnPoint.y;
    ship.vx = 0;
    ship.vy = 0;
    ship.heading = 0;
    ship.fuel = ship.maxFuel;
    lastTrailX = null;
    lastTrailY = null;
    trail.length = 0;
    invulnTimer = INVULN_DURATION;
    scoreMultiplier = 1;
    ship.stopThrustLoop();
    sector = sectorManager.getSectorForPosition(ship.x, ship.y);
    if (intro.enabled && sector) {
      const sectorKey = `${sector.sx},${sector.sy}`;
      if (intro.lastSectorKey && intro.lastSectorKey !== sectorKey) {
        intro.sectorTransitions += 1;
      }
      intro.lastSectorKey = sectorKey;
    }
    activeSectors = sectorManager.getSectorsAround(ship.x, ship.y, ACTIVE_SECTOR_RANGE);
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

  function syncUpgradeState() {
    maxLives = getMaxLives(upgradeLevels.hullLevel);
    if (gameState) {
      gameState.upgrades = {
        fireRateLevel: upgradeLevels.fireRateLevel,
        hullLevel: upgradeLevels.hullLevel,
        collectorLevel: upgradeLevels.collectorLevel
      };
      markStateDirty();
    }
  }

  function buildUpgradeUiState(station) {
    const tierCap = Number.isFinite(station?.tierCap) ? station.tierCap : null;
    const fireCap = Math.min(UPGRADES.FIRE_RATE.levelMax, tierCap ?? UPGRADES.FIRE_RATE.levelMax);
    const hullCap = Math.min(UPGRADES.HULL.levelMax, tierCap ?? UPGRADES.HULL.levelMax);
    const collectorCap = Math.min(UPGRADES.COLLECTOR.levelMax, tierCap ?? UPGRADES.COLLECTOR.levelMax);
    const missingLives = Math.max(0, maxLives - lives);
    return {
      currency: resourceCurrency,
      lives,
      maxLives,
      tierCap,
      upgrades: {
        fireRateLevel: upgradeLevels.fireRateLevel,
        hullLevel: upgradeLevels.hullLevel,
        collectorLevel: upgradeLevels.collectorLevel
      },
      caps: {
        fireRateLevel: fireCap,
        hullLevel: hullCap,
        collectorLevel: collectorCap
      },
      costs: {
        fireRate: upgradeLevels.fireRateLevel < fireCap
          ? getUpgradeCost(UPGRADES.FIRE_RATE.baseCost, UPGRADES.FIRE_RATE.costMult, upgradeLevels.fireRateLevel)
          : null,
        hull: upgradeLevels.hullLevel < hullCap
          ? getUpgradeCost(UPGRADES.HULL.baseCost, UPGRADES.HULL.costMult, upgradeLevels.hullLevel)
          : null,
        collector: upgradeLevels.collectorLevel < collectorCap
          ? getUpgradeCost(UPGRADES.COLLECTOR.baseCost, UPGRADES.COLLECTOR.costMult, upgradeLevels.collectorLevel)
          : null,
        repair: missingLives > 0
          ? Math.round(UPGRADES.REPAIR.baseCost + missingLives * UPGRADES.REPAIR.costPerLife)
          : null
      }
    };
  }

  function closeUpgradeModal() {
    if (upgradeModal) {
      upgradeModal.destroy();
      upgradeModal = null;
    }
  }

  function openUpgradeModal(station) {
    if (!uiRoot || upgradeModal) {
      return;
    }
    upgradeModal = showUpgradeStationModal(uiRoot, buildUpgradeUiState(station), (action) => {
      if (!action) {
        return;
      }
      if (action === "close") {
        docked = false;
        dockStation = null;
        closeUpgradeModal();
        return;
      }
      const state = buildUpgradeUiState(station);
      if (action === "fireRate" && state.costs.fireRate !== null) {
        if (spendResource(state.costs.fireRate)) {
          upgradeLevels.fireRateLevel += 1;
          syncUpgradeState();
          sounds.play("bought");
        }
      } else if (action === "hull" && state.costs.hull !== null) {
        if (spendResource(state.costs.hull)) {
          upgradeLevels.hullLevel += 1;
          syncUpgradeState();
          sounds.play("bought");
        }
      } else if (action === "collector" && state.costs.collector !== null) {
        if (spendResource(state.costs.collector)) {
          upgradeLevels.collectorLevel += 1;
          syncUpgradeState();
          sounds.play("bought");
        }
      } else if (action === "repair" && state.costs.repair !== null) {
        if (spendResource(state.costs.repair)) {
          lives = maxLives;
          syncUpgradeState();
          sounds.play("bought");
        }
      }
      if (upgradeModal) {
        upgradeModal.update(buildUpgradeUiState(station));
      }
    });
  }

  function queueRespawn() {
    shipVisible = false;
    ship.stopThrustLoop();
    respawnTimer = RESPAWN_DELAY;
  }

  function queueAlert(text, delay = 0, duration = ALERT.DURATION, force = false) {
    if (intro.suppressAlerts && !force) {
      return;
    }
    alerts.push({
      text,
      start: alertClock + delay,
      duration
    });
  }

  function scheduleIntroHighlight(keys, start, duration) {
    if (!intro.enabled) {
      return;
    }
    const list = Array.isArray(keys) ? keys : [keys];
    for (const key of list) {
      intro.highlightQueue.push({
        key,
        start,
        duration
      });
    }
  }

  function triggerIntroHighlight(key, duration) {
    intro.highlights[key] = Math.max(intro.highlights[key] ?? 0, duration);
    if (key === "score") {
      scorePulse = Math.max(scorePulse, 0.8);
    }
  }

  function scheduleIntroAlert(id, text, options = {}) {
    if (!intro.enabled || intro.flags[id]) {
      return;
    }
    const duration = options.duration ?? INTRO.ALERT_DURATION ?? ALERT.DURATION;
    const start = Math.max(alertClock, intro.nextAt);
    queueAlert(text, start - alertClock, duration, true);
    intro.flags[id] = true;
    intro.nextAt = start + duration;
    if (options.highlightKeys) {
      scheduleIntroHighlight(options.highlightKeys, start, options.highlightDuration ?? duration);
    }
    if (options.releaseAlerts) {
      intro.releaseAlertsAt = start + duration;
    }
    if (typeof options.onScheduled === "function") {
      options.onScheduled();
    }
  }

  function setAutopilotActive(next, announce = false) {
    if (autopilotActive === next) {
      return;
    }
    autopilotActive = next;
    autopilotTurnBias = 1;
    sounds.setKeyMuted("thrust", autopilotActive);
    sounds.setKeyMuted("thrust_rotate", autopilotActive);
    if (!next) {
      autopilotFirePause = 0;
      autopilotThrustCooldown = 0;
      autopilotThrustBurst = 0;
      autopilotTarget = null;
      }
      if (announce) {
        const text = next ? AUTOPILOT.ALERTS.ENGAGED : AUTOPILOT.ALERTS.DISENGAGED;
        queueAlert(text, 0, ALERT.DURATION * 1.1);
      }
    }

  function getUpgradeCost(baseCost, costMult, currentLevel) {
    return Math.round(baseCost * Math.pow(costMult, currentLevel));
  }

  function getFireCooldownSeconds(level) {
    const maxLevel = UPGRADES.FIRE_RATE.levelMax;
    const baseMs = UPGRADES.FIRE_RATE.effect.cooldownMsBase;
    const minMs = UPGRADES.FIRE_RATE.effect.cooldownMsMin;
    const t = maxLevel > 0 ? Math.min(1, level / maxLevel) : 0;
    const ms = baseMs - (baseMs - minMs) * t;
    return Math.max(minMs, ms) / 1000;
  }

  function getMaxLives(level) {
    return UPGRADES.HULL.effect.maxLivesBase + level * UPGRADES.HULL.effect.livesPerLevel;
  }

  function getCollectorStats(level) {
    const effect = UPGRADES.COLLECTOR.effect;
    return {
      radius: effect.radiusBase + level * effect.radiusPerLevel,
      strength: Math.min(
        effect.pullStrengthMax,
        effect.pullStrengthBase + level * effect.pullStrengthPerLevel
      )
    };
  }

  function addResource(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    resourceCurrency = Math.max(0, Math.floor(resourceCurrency + amount));
    if (gameState) {
      gameState.resourceCurrency = resourceCurrency;
      markStateDirty();
    }
  }

  function spendResource(cost) {
    if (!Number.isFinite(cost) || cost <= 0 || resourceCurrency < cost) {
      return false;
    }
    resourceCurrency = Math.max(0, Math.floor(resourceCurrency - cost));
    if (gameState) {
      gameState.resourceCurrency = resourceCurrency;
      markStateDirty();
    }
    return true;
  }

  function applyCollectorPull(pickups, collector, dt) {
    if (!pickups || pickups.length === 0) {
      return;
    }
    if (!collector || collector.radius <= 0 || collector.strength <= 0) {
      return;
    }
    const radius = collector.radius;
    const strength = collector.strength;
    for (const pickup of pickups) {
      const dx = ship.x - pickup.x;
      const dy = ship.y - pickup.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 0 || dist > radius) {
        continue;
      }
      const t = 1 - dist / radius;
      const accel = strength * t;
      const nx = dx / dist;
      const ny = dy / dist;
      pickup.vx += nx * accel * dt;
      pickup.vy += ny * accel * dt;
    }
  }

  function drawStationSafeZone(ctx, station, shipInZone, dockedState) {
    if (!station) {
      return;
    }
    const radius = station.safeRadius ?? STATION.SAFE_ZONE_RADIUS;
    const alpha = dockedState ? 0.22 : (shipInZone ? 0.18 : 0.12);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grad = ctx.createRadialGradient(station.x, station.y, radius * 0.2, station.x, station.y, radius);
    grad.addColorStop(0, `rgba(90, 220, 160, ${alpha})`);
    grad.addColorStop(1, "rgba(90, 220, 160, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(station.x, station.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(120, 240, 190, ${alpha * 0.9})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(station.x, station.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function resolveStationCollision(station) {
    if (!station) {
      return;
    }
    const coreRadius = station.colliderRadius ?? STATION.COLLIDER_RADIUS;
    if (!Number.isFinite(coreRadius) || coreRadius <= 0) {
      return;
    }
    const dx = ship.x - station.x;
    const dy = ship.y - station.y;
    const minDist = coreRadius + SHIP_RADIUS;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) {
      const dirX = Math.sin(ship.heading);
      const dirY = -Math.cos(ship.heading);
      ship.x = station.x + dirX * minDist;
      ship.y = station.y + dirY * minDist;
      return;
    }
    if (dist < minDist) {
      const nx = dx / dist;
      const ny = dy / dist;
      ship.x = station.x + nx * minDist;
      ship.y = station.y + ny * minDist;
      const dot = ship.vx * nx + ship.vy * ny;
      if (dot < 0) {
        ship.vx -= dot * nx;
        ship.vy -= dot * ny;
      }
    }
  }

  function drawCollectorField(ctx, radius) {
    if (!Number.isFinite(radius) || radius <= 0) {
      return;
    }
    ctx.save();
    ctx.strokeStyle = "rgba(120, 220, 180, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function getActiveStations() {
    const stations = [];
    for (const activeSector of activeSectors) {
      if (activeSector.station) {
        stations.push(activeSector.station);
      }
    }
    return stations;
  }

  function destroyObjectsInSafeZones(stations) {
    if (!stations || stations.length === 0) {
      return;
    }
    for (const activeSector of activeSectors) {
      if (activeSector.asteroids.length === 0) {
        continue;
      }
      for (let i = activeSector.asteroids.length - 1; i >= 0; i--) {
        const asteroid = activeSector.asteroids[i];
        let remove = false;
        for (const station of stations) {
          const dx = asteroid.x - station.x;
          const dy = asteroid.y - station.y;
          if (Math.hypot(dx, dy) <= station.safeRadius) {
            remove = true;
            break;
          }
        }
        if (remove) {
          activeSector.asteroids.splice(i, 1);
        }
      }
    }

    for (let i = fuelPickups.length - 1; i >= 0; i--) {
      const fuel = fuelPickups[i];
      for (const station of stations) {
        const dx = fuel.x - station.x;
        const dy = fuel.y - station.y;
        if (Math.hypot(dx, dy) <= station.safeRadius) {
          fuelPickups.splice(i, 1);
          break;
        }
      }
    }
    for (let i = resourcePickups.length - 1; i >= 0; i--) {
      const pickup = resourcePickups[i];
      for (const station of stations) {
        const dx = pickup.x - station.x;
        const dy = pickup.y - station.y;
        if (Math.hypot(dx, dy) <= station.safeRadius) {
          resourcePickups.splice(i, 1);
          break;
        }
      }
    }
  }

  function repelEnemiesFromStations(stations, dt) {
    if (!stations || stations.length === 0 || enemies.length === 0) {
      return;
    }
    for (const enemy of enemies) {
      for (const station of stations) {
        const dx = enemy.x - station.x;
        const dy = enemy.y - station.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < STATION.ENEMY_REPEL_RADIUS) {
          const strength = STATION.ENEMY_REPEL_STRENGTH * (1 - dist / STATION.ENEMY_REPEL_RADIUS);
          const nx = dx / dist;
          const ny = dy / dist;
          enemy.vx += nx * strength * dt;
          enemy.vy += ny * strength * dt;
          enemy.x += nx * 8;
          enemy.y += ny * 8;
        }
      }
    }
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

  function normalizeAngle(angle) {
    return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
  }

    function getScanTarget() {
      let best = null;
      let fallback = null;
      for (const current of activeSectors) {
        if (!current.endZone) {
          continue;
        }
        const tx = current.endZone.x + current.endZone.width / 2;
        const ty = current.endZone.y + current.endZone.height / 2;
        const dx = tx - ship.x;
        const dy = ty - ship.y;
        const dist = Math.hypot(dx, dy);
        const weight = current === sector ? 0.7 : 1;
        const score = dist * weight;
        const entry = { x: tx, y: ty, dist, score };
        if (!current.goalDelivered) {
          if (!best || score < best.score) {
            best = entry;
          }
        } else if (!fallback || score < fallback.score) {
          fallback = entry;
        }
      }
      return best ?? fallback;
    }

    function getLockedSurveyTarget() {
      if (autopilotTarget) {
        const dx = autopilotTarget.x - ship.x;
        const dy = autopilotTarget.y - ship.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= AUTOPILOT.TARGET.BRAKE_DISTANCE * 0.6) {
          autopilotTarget = null;
        } else {
          let stillValid = false;
          for (const current of activeSectors) {
            if (!current.endZone) {
              continue;
            }
            const tx = current.endZone.x + current.endZone.width / 2;
            const ty = current.endZone.y + current.endZone.height / 2;
            if (Math.hypot(tx - autopilotTarget.x, ty - autopilotTarget.y) < 1) {
              stillValid = true;
              break;
            }
          }
          if (!stillValid) {
            autopilotTarget = null;
          }
        }
      }
      if (!autopilotTarget) {
        autopilotTarget = getScanTarget();
      }
      return autopilotTarget;
    }

  function getFuelTarget() {
    let best = null;
    for (const fuel of fuelPickups) {
      const dx = fuel.x - ship.x;
      const dy = fuel.y - ship.y;
      const dist = Math.hypot(dx, dy);
      if (!best || dist < best.dist) {
        best = { x: fuel.x, y: fuel.y, dist };
      }
    }
    return best;
  }

  function getPursuitTarget() {
    if (!enemies || enemies.length === 0) {
      return null;
    }
    const speed = Math.hypot(ship.vx, ship.vy);
    const forward = speed > 8
      ? { x: ship.vx / speed, y: ship.vy / speed }
      : { x: Math.sin(ship.heading), y: -Math.cos(ship.heading) };
    const back = { x: -forward.x, y: -forward.y };
    const coneHalfRad = ((AUTOPILOT.FIRE.PRIORITY_REAR_ANGLE_DEG ?? 120) * Math.PI) / 180 / 2;
    const minDot = Math.cos(coneHalfRad);
    const maxRange = AUTOPILOT.FIRE.PRIORITY_RANGE ?? ENEMY_FIRE_RANGE;
    let best = null;
    for (const enemy of enemies) {
      const dx = enemy.x - ship.x;
      const dy = enemy.y - ship.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 0 || dist > maxRange) {
        continue;
      }
      const dirX = dx / dist;
      const dirY = dy / dist;
      const backDot = back.x * dirX + back.y * dirY;
      if (backDot < minDot) {
        continue;
      }
      if (!best || dist < best.dist) {
        best = { enemy, x: enemy.x, y: enemy.y, dist };
      }
    }
    return best;
  }

  function closestPointOnSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;
    const denom = abx * abx + aby * aby;
    if (denom === 0) {
      return { x: ax, y: ay, t: 0 };
    }
    let t = (apx * abx + apy * aby) / denom;
    t = clampValue(t, 0, 1);
    return { x: ax + abx * t, y: ay + aby * t, t };
  }

  function getClosestRiverInfo(pos, rivers) {
    let best = null;
    for (const river of rivers) {
      const points = river?.points;
      if (!points || points.length < 2) {
        continue;
      }
      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const hit = closestPointOnSegment(pos.x, pos.y, a.x, a.y, b.x, b.y);
        const dx = pos.x - hit.x;
        const dy = pos.y - hit.y;
        const dist = Math.hypot(dx, dy);
        if (!best || dist < best.dist) {
          const segX = b.x - a.x;
          const segY = b.y - a.y;
          const segLen = Math.hypot(segX, segY) || 1;
          best = {
            dist,
            width: river.width ?? RIVER.WIDTH_MIN,
            closestX: hit.x,
            closestY: hit.y,
            tangentX: segX / segLen,
            tangentY: segY / segLen
          };
        }
      }
    }
    return best;
  }

    function getAutopilotAvoidance(activeStations, activeStars) {
      const avoid = { x: 0, y: 0 };
      let closest = Infinity;

    const addRepulsion = (hx, hy, limit, weight = 1) => {
      if (!Number.isFinite(limit) || limit <= 0) {
        return;
      }
      const dx = ship.x - hx;
      const dy = ship.y - hy;
      const dist = Math.hypot(dx, dy);
      if (dist <= 0 || dist > limit) {
        return;
      }
      const strength = Math.pow(1 - dist / limit, 2) * weight;
      avoid.x += (dx / dist) * strength;
      avoid.y += (dy / dist) * strength;
      if (dist < closest) {
        closest = dist;
      }
    };

      for (const activeSector of activeSectors) {
        if (activeSector.beacon) {
          const radius = activeSector.beacon.radius ?? BEACON.OBSERVER_RADIUS;
          const limit = radius + AUTOPILOT.AVOID.BEACON_BUFFER;
          addRepulsion(activeSector.beacon.x, activeSector.beacon.y, limit, 1.2);
        }
    }

    if (Array.isArray(activeStars)) {
      for (const star of activeStars) {
        const gravityRadius = Number.isFinite(star.gravityRadius) ? star.gravityRadius : 0;
        if (!Number.isFinite(gravityRadius) || gravityRadius <= 0) {
          continue;
        }
        const limit = gravityRadius + AUTOPILOT.AVOID.STAR_BODY_BUFFER;
        addRepulsion(star.x, star.y, limit, 1.3);
      }
    }

    for (const station of activeStations) {
      const limit = (station.safeRadius ?? STATION.SAFE_ZONE_RADIUS) + AUTOPILOT.AVOID.STATION_BUFFER;
      addRepulsion(station.x, station.y, limit, 1.4);
    }

      return { avoid, closest };
    }

    function getAsteroidThreat(asteroid, horizonTime, buffer) {
      const relX = asteroid.x - ship.x;
      const relY = asteroid.y - ship.y;
      const relVx = (asteroid.vx ?? 0) - ship.vx;
      const relVy = (asteroid.vy ?? 0) - ship.vy;
      const speedSq = relVx * relVx + relVy * relVy;
      let t = 0;
      if (speedSq > 0.001) {
        t = -((relX * relVx + relY * relVy) / speedSq);
      }
      if (!Number.isFinite(t) || t < 0 || t > horizonTime) {
        return null;
      }
      const cx = relX + relVx * t;
      const cy = relY + relVy * t;
      const dist = Math.hypot(cx, cy);
      if (dist > buffer) {
        return null;
      }
      return {
        asteroid,
        t,
        dist,
        buffer,
        px: asteroid.x + (asteroid.vx ?? 0) * t,
        py: asteroid.y + (asteroid.vy ?? 0) * t
      };
    }

    function getCourseAvoidance(desiredDir, lookaheadDist, activeStars, asteroidThreats) {
      let closest = Infinity;
      let hazard = null;
      const ax = ship.x;
      const ay = ship.y;
      const bx = ship.x + desiredDir.x * lookaheadDist;
      const by = ship.y + desiredDir.y * lookaheadDist;

      for (const star of activeStars) {
        const bodyRadius = star.radius ?? 0;
        const gravityRadius = Number.isFinite(star.gravityRadius) ? star.gravityRadius : bodyRadius;
        const limit = gravityRadius + AUTOPILOT.AVOID.STAR_BODY_BUFFER + AUTOPILOT.COURSE.CORRIDOR_RADIUS;
        if (!Number.isFinite(limit) || limit <= 0) {
          continue;
        }
        const hit = closestPointOnSegment(star.x, star.y, ax, ay, bx, by);
        const dx = star.x - hit.x;
        const dy = star.y - hit.y;
        const dist = Math.hypot(dx, dy);
        if (dist < limit && dist < closest) {
          closest = dist;
          hazard = { x: star.x, y: star.y };
        }
      }

      for (const threat of asteroidThreats) {
        if (threat.dist < threat.buffer && threat.dist < closest) {
          closest = threat.dist;
          hazard = { x: threat.px, y: threat.py };
        }
      }

      if (!hazard) {
        return { desiredDir, closest };
      }
      const toHx = hazard.x - ship.x;
      const toHy = hazard.y - ship.y;
      const cross = desiredDir.x * toHy - desiredDir.y * toHx;
      const steerSign = cross === 0 ? 1 : Math.sign(cross);
      const steerAngle = (AUTOPILOT.COURSE.AVOID_ANGLE_DEG * Math.PI) / 180;
      const adjusted = rotateVector(desiredDir, -steerSign * steerAngle);
      return { desiredDir: adjusted, closest };
    }

    function getGravityEscape(activeStars) {
      if (!Array.isArray(activeStars)) {
        return null;
      }
      let closest = null;
      for (const star of activeStars) {
        const gravityRadius = Number.isFinite(star.gravityRadius) ? star.gravityRadius : 0;
        if (!Number.isFinite(gravityRadius) || gravityRadius <= 0) {
          continue;
        }
        const dx = ship.x - star.x;
        const dy = ship.y - star.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0 || dist > gravityRadius) {
          continue;
        }
        if (!closest || dist < closest.dist) {
          closest = { dx, dy, dist };
        }
      }
      if (!closest) {
        return null;
      }
      const mag = closest.dist || 1;
      return { x: closest.dx / mag, y: closest.dy / mag };
    }

    function computeAutopilotInput(dt, activeStars, activeStations) {
      const fuelRatio = ship.maxFuel > 0 ? ship.fuel / ship.maxFuel : 0;
      const avoidData = getAutopilotAvoidance(activeStations, activeStars);
      const pursuitTarget = getPursuitTarget();
      const priorityEnemy = pursuitTarget ? pursuitTarget.enemy : null;
      let desired = null;
      let targetDist = 0;
      let escapeMode = false;

    const avoidMag = Math.hypot(avoidData.avoid.x, avoidData.avoid.y);
    if (avoidMag > 0.001) {
      desired = { x: avoidData.avoid.x, y: avoidData.avoid.y };
      targetDist = avoidMag;
    } else if (pursuitTarget) {
      desired = { x: pursuitTarget.x - ship.x, y: pursuitTarget.y - ship.y };
      targetDist = pursuitTarget.dist;
    } else {
        const surveyTarget = getLockedSurveyTarget();
      const fuelTarget = getFuelTarget();

      let target = null;
      if (fuelRatio < AUTOPILOT.FUEL.CRITICAL && fuelTarget) {
        target = fuelTarget;
      } else if (surveyTarget) {
        if (fuelRatio < AUTOPILOT.FUEL.MID && fuelTarget) {
          const toSurvey = { x: surveyTarget.x - ship.x, y: surveyTarget.y - ship.y };
          const toFuel = { x: fuelTarget.x - ship.x, y: fuelTarget.y - ship.y };
          const distFuel = fuelTarget.dist;
          const surveyLen = Math.hypot(toSurvey.x, toSurvey.y) || 1;
          const fuelLen = Math.hypot(toFuel.x, toFuel.y) || 1;
          const dot = (toSurvey.x * toFuel.x + toSurvey.y * toFuel.y) / (surveyLen * fuelLen);
          const angle = Math.acos(clampValue(dot, -1, 1));
          const angleDeg = (angle * 180) / Math.PI;
          if (distFuel <= AUTOPILOT.TARGET.FUEL_RANGE && angleDeg <= AUTOPILOT.TARGET.FUEL_ANGLE_DEG) {
            target = fuelTarget;
          } else {
            target = surveyTarget;
          }
        } else {
          target = surveyTarget;
        }
      } else if (fuelRatio < AUTOPILOT.FUEL.MID && fuelTarget) {
        target = fuelTarget;
      }

      if (target) {
        desired = { x: target.x - ship.x, y: target.y - ship.y };
        targetDist = target.dist ?? Math.hypot(desired.x, desired.y);
      } else {
        const dx = ship.x - originX;
        const dy = ship.y - originY;
        const dist = Math.hypot(dx, dy);
        desired = dist > 1 ? { x: dx, y: dy } : { x: 1, y: 0 };
        targetDist = dist;
      }
    }

      const escapeDir = getGravityEscape(activeStars);
      if (escapeDir) {
        desired = escapeDir;
        targetDist = null;
        escapeMode = true;
      }

      const desiredMag = Math.hypot(desired.x, desired.y) || 1;
      let desiredDir = { x: desired.x / desiredMag, y: desired.y / desiredMag };

      const lookaheadDist = AUTOPILOT.COURSE.LOOKAHEAD_DIST;
      const shipSpeed = Math.hypot(ship.vx, ship.vy);
      const lookaheadTimeRaw = lookaheadDist / Math.max(60, shipSpeed);
      const lookaheadTime = Math.min(AUTOPILOT.COURSE.LOOKAHEAD_TIME_MAX, lookaheadTimeRaw);
      const asteroidThreats = [];
      for (const activeSector of activeSectors) {
        for (const asteroid of activeSector.asteroids) {
          const buffer = (asteroid.radius ?? 0) + SHIP_RADIUS + AUTOPILOT.AVOID.ASTEROID_BODY_BUFFER;
          const threat = getAsteroidThreat(asteroid, lookaheadTime, buffer);
          if (threat) {
            asteroidThreats.push(threat);
          }
        }
      }
      if (!escapeMode) {
        const courseAdjust = getCourseAvoidance(desiredDir, lookaheadDist, activeStars, asteroidThreats);
        desiredDir = courseAdjust.desiredDir;

        const riverInfo = getClosestRiverInfo(ship, sector?.runtimeRivers ?? []);
        if (riverInfo && riverInfo.dist < (riverInfo.width / 2)) {
          const flowDot = desiredDir.x * riverInfo.tangentX + desiredDir.y * riverInfo.tangentY;
          if (flowDot < AUTOPILOT.RIVER.ALIGN_DOT_MIN) {
            const outX = ship.x - riverInfo.closestX;
            const outY = ship.y - riverInfo.closestY;
            const outMag = Math.hypot(outX, outY) || 1;
            desiredDir = { x: outX / outMag, y: outY / outMag };
            targetDist = outMag;
          }
        }
      }

      const starAccel = computeStarAccelAt(ship, activeStars, CONFIG);
      const accelMag = Math.hypot(starAccel.ax, starAccel.ay);
      if (accelMag > 0) {
        const ax = starAccel.ax / accelMag;
        const ay = starAccel.ay / accelMag;
        const ref = Math.max(1, SHIP.THRUST * AUTOPILOT.GRAVITY.THRUST_RATIO);
        const blend = clampValue(accelMag / ref, 0, AUTOPILOT.GRAVITY.MAX_BLEND);
        desiredDir = {
          x: desiredDir.x - ax * blend * AUTOPILOT.GRAVITY.COMPENSATION,
          y: desiredDir.y - ay * blend * AUTOPILOT.GRAVITY.COMPENSATION
        };
      }

      if (AUTOPILOT.GRAVITY.CLOSE_PUSH > 0) {
        for (const star of activeStars) {
          const dx = ship.x - star.x;
          const dy = ship.y - star.y;
          const dist = Math.hypot(dx, dy);
          const bodyRadius = star.radius ?? 0;
          const limit = bodyRadius + AUTOPILOT.AVOID.STAR_BODY_BUFFER;
          if (dist > 0 && dist < limit) {
            const push = (1 - dist / limit) * AUTOPILOT.GRAVITY.CLOSE_PUSH;
            desiredDir.x += (dx / dist) * push;
            desiredDir.y += (dy / dist) * push;
          }
        }
      }

      const normalizedMag = Math.hypot(desiredDir.x, desiredDir.y) || 1;
      desiredDir = { x: desiredDir.x / normalizedMag, y: desiredDir.y / normalizedMag };

      const baseSpeed = AUTOPILOT.THRUST.CRUISE_SPEED;
      let desiredSpeed = baseSpeed;
      if (Number.isFinite(targetDist)) {
        const coastSpeed = targetDist / Math.max(0.1, AUTOPILOT.THRUST.COAST_TIME);
        desiredSpeed = Math.min(baseSpeed, coastSpeed);
        if (targetDist > AUTOPILOT.TARGET.BRAKE_DISTANCE) {
          desiredSpeed = Math.max(desiredSpeed, AUTOPILOT.THRUST.SPEED_FLOOR);
        }
      }

      const desiredVel = {
        x: desiredDir.x * desiredSpeed,
        y: desiredDir.y * desiredSpeed
      };
      const errorVel = {
        x: desiredVel.x - ship.vx,
        y: desiredVel.y - ship.vy
      };
      const errorMag = Math.hypot(errorVel.x, errorVel.y);
      const errorDir = errorMag > 0
        ? { x: errorVel.x / errorMag, y: errorVel.y / errorMag }
        : desiredDir;
      const errorBlend = clampValue(
        errorMag / Math.max(1, desiredSpeed * AUTOPILOT.COURSE.ERROR_BLEND_RATIO),
        0,
        1
      );
      const steeringRaw = {
        x: desiredDir.x * (1 - errorBlend) + errorDir.x * errorBlend,
        y: desiredDir.y * (1 - errorBlend) + errorDir.y * errorBlend
      };
      const steeringMag = Math.hypot(steeringRaw.x, steeringRaw.y) || 1;
      const steeringDir = { x: steeringRaw.x / steeringMag, y: steeringRaw.y / steeringMag };

      const desiredHeading = Math.atan2(steeringDir.x, -steeringDir.y);
      let angleDiff = normalizeAngle(desiredHeading - ship.heading);
      const turnEpsilon = AUTOPILOT.COURSE.TURN_EPSILON ?? 0.04;
      if (Math.abs(Math.abs(angleDiff) - Math.PI) < turnEpsilon) {
        angleDiff = autopilotTurnBias * (Math.PI - turnEpsilon);
      } else if (angleDiff !== 0) {
        autopilotTurnBias = Math.sign(angleDiff);
      }
      const rotationInput = clampValue(angleDiff / (Math.PI / 4), -1, 1);
      const angleDeg = Math.abs(angleDiff) * (180 / Math.PI);
      let thrustInput = 0;
      let thrustWanted = 0;
      if (angleDeg < AUTOPILOT.TARGET.THRUST_ANGLE_DEG) {
        const errorRatio = baseSpeed > 0 ? errorMag / baseSpeed : 0;
        const errorDeadband = AUTOPILOT.THRUST.ERROR_RATIO_DEADBAND ?? 0;
        const align = Math.max(0, Math.cos(angleDiff));
        if (errorRatio >= errorDeadband) {
          thrustWanted = clampValue(errorRatio, 0, 1);
        } else {
          thrustWanted = 0;
        }
        thrustWanted *= Math.pow(align, AUTOPILOT.THRUST.ALIGN_POWER);
        if (Number.isFinite(targetDist) && targetDist > AUTOPILOT.TARGET.BRAKE_DISTANCE) {
          const minPower = AUTOPILOT.THRUST.MIN_POWER ?? 0;
          if (thrustWanted > 0 && thrustWanted < minPower) {
            thrustWanted = minPower;
          }
        }
      }
      if (thrustWanted > 0) {
        if (AUTOPILOT.THRUST.BURST_COOLDOWN <= 0 || AUTOPILOT.THRUST.BURST_MIN <= 0) {
          autopilotThrustBurst = 0;
          autopilotThrustCooldown = 0;
          thrustInput = thrustWanted;
        } else {
          if (autopilotThrustBurst <= 0 && autopilotThrustCooldown <= 0) {
            autopilotThrustBurst = AUTOPILOT.THRUST.BURST_MIN;
          }
          if (autopilotThrustBurst > 0 && autopilotThrustCooldown <= 0) {
            thrustInput = thrustWanted;
          }
        }
      } else {
        autopilotThrustBurst = 0;
      }

      const hazardClear = avoidData.closest > AUTOPILOT.FIRE.HAZARD_CLEAR_DIST;
      const forward = { x: Math.sin(ship.heading), y: -Math.cos(ship.heading) };
      const coneRad = (AUTOPILOT.FIRE.CONE_DEG * Math.PI) / 180;
      const maxRange = Math.min(ENEMY_FIRE_RANGE, BULLET.SPEED * BULLET.LIFE * AUTOPILOT.FIRE.RANGE_MULT);
      const canFireAt = (dx, dy, dist) => {
        if (dist > maxRange || dist <= 0) {
          return false;
        }
        const dot = (forward.x * dx + forward.y * dy) / dist;
        const angle = Math.acos(clampValue(dot, -1, 1));
        return angle <= coneRad;
      };
      let fire = false;

      if (autopilotFirePause <= 0 && hazardClear) {
        if (priorityEnemy) {
          const dx = priorityEnemy.x - ship.x;
          const dy = priorityEnemy.y - ship.y;
          const dist = Math.hypot(dx, dy);
          fire = canFireAt(dx, dy, dist);
        } else {
          for (const threat of asteroidThreats) {
            const dx = threat.px - ship.x;
            const dy = threat.py - ship.y;
            const dist = Math.hypot(dx, dy);
            if (canFireAt(dx, dy, dist)) {
              fire = true;
              break;
            }
          }
          if (!fire) {
            for (const enemy of enemies) {
              const dx = enemy.x - ship.x;
              const dy = enemy.y - ship.y;
              const dist = Math.hypot(dx, dy);
              if (canFireAt(dx, dy, dist)) {
                fire = true;
                break;
              }
            }
          }
          if (!fire) {
            for (const activeSector of activeSectors) {
              for (const asteroid of activeSector.asteroids) {
                const dx = asteroid.x - ship.x;
                const dy = asteroid.y - ship.y;
                const dist = Math.hypot(dx, dy);
                if (canFireAt(dx, dy, dist)) {
                  fire = true;
                  break;
                }
              }
              if (fire) {
                break;
              }
            }
          }
        }
      }

      return { rotationInput, thrustInput, fire };
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

  function buildGate(type, center, travelDir, width, poleRadius) {
    const mag = Math.hypot(travelDir.x, travelDir.y) || 1;
    const normal = { x: travelDir.x / mag, y: travelDir.y / mag };
    const axis = { x: -normal.y, y: normal.x };
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

  function createSingleGate(viewRadius, type, bounds, dir, margin) {
    const axis = { x: -dir.y, y: dir.x };
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

      return buildGate(type, candidate, dir, apertureWidth, poleRadius);
    }
    return null;
  }

  function createChainGateSeries(viewRadius, bounds, dir, margin) {
    const type = CALIBRATION_GATE.TYPES.CHAIN;
    const axis = { x: -dir.y, y: dir.x };
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
      const span = randomRange(CALIBRATION_GATE.CHAIN_ARC_MIN, CALIBRATION_GATE.CHAIN_ARC_MAX);
      const step = chainCount > 1 ? span / (chainCount - 1) : 0;
      const baseDist = minDist;
      const forwardSpan = Math.max(0, maxDist - baseDist);
      const radius = forwardSpan > 0
        ? forwardSpan / Math.max(0.15, Math.sin(span))
        : maxDist;
      const gates = [];
      let valid = true;

      for (let i = 0; i < chainCount; i++) {
        const angle = step * i;
        const forward = baseDist + radius * Math.sin(angle);
        const lateral = radius * (1 - Math.cos(angle)) * turnDir;
        const pathDir = rotateVector(dir, angle * turnDir);
        const candidate = {
          x: ship.x + dir.x * forward + axis.x * lateral,
          y: ship.y + dir.y * forward + axis.y * lateral
        };
        if (!isWithinBounds(candidate, bounds, margin)) {
          valid = false;
          break;
        }
        if (!isGateLocationClear(candidate, halfSpan)) {
          valid = false;
          break;
        }
        const gate = buildGate(type, candidate, pathDir, apertureWidth, poleRadius);
        gate.chainIndex = i;
        gate.chainCount = chainCount;
        gates.push(gate);
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
    const margin = 260;
    const type = pickGateType();

    if (type === CALIBRATION_GATE.TYPES.CHAIN) {
      return createChainGateSeries(viewRadius, bounds, dir, margin);
    }

    const single = createSingleGate(viewRadius, type, bounds, dir, margin);
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
      let gateAlpha = fade;
      if (gate.type === CALIBRATION_GATE.TYPES.CHAIN) {
        const total = Math.max(1, gate.chainCount ?? 1);
        const progress = Math.max(0, chainProgress ?? 0);
        if (Number.isFinite(gate.chainIndex) && gate.chainIndex >= progress) {
          const remaining = Math.max(1, total - progress);
          const offset = gate.chainIndex - progress;
          const t = remaining > 1 ? offset / (remaining - 1) : 0;
          gateAlpha *= 1 - t * CALIBRATION_GATE.CHAIN_HUE_FALLOFF;
        }
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = gateAlpha;
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
    if (!gameState || !allowPersistence) {
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

  function updateSectorRivers(targetSector, shipPos = null) {
    if (!targetSector) {
      return;
    }
    const worldAgeMs = gameState?.worldAgeMs ?? 0;
    const worldAgeTicks = Math.floor(worldAgeMs / 1000);
    if (RIVER.DISABLED_SECTOR_TYPES?.includes(targetSector.sectorType)) {
      targetSector.runtimeRivers = [];
      targetSector.riversTick = worldAgeTicks;
      return;
    }
    if (targetSector.riversTick === worldAgeTicks && Array.isArray(targetSector.runtimeRivers)) {
      return;
    }
    targetSector.runtimeRivers = getRiversForSector(
      sectorManager.worldSeed,
      worldAgeTicks,
      targetSector.sx,
      targetSector.sy,
      targetSector.bounds,
      targetSector.fieldType,
      shipPos
    );
    targetSector.riversTick = worldAgeTicks;
  }

  function pauseForLifeLoss(outcome) {
    if (deathPauseActive) {
      return;
    }
    deathPauseActive = true;
    setAutopilotActive(false, true);
    ship.stopThrustLoop();
    ship.stopRotateLoop();
    sounds.stopLoop("at_station");
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
    if (demoMode) {
      if (explosionType) {
        spawnExplosion(particles, ship.x, ship.y, explosionType);
      }
      lives = maxLives;
      shipVisible = true;
      respawn();
      return;
    }
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

  function ensureStationMetaForSector(sx, sy) {
    if (!Number.isFinite(sx) || !Number.isFinite(sy)) {
      return null;
    }
    const ring = Math.max(Math.abs(sx), Math.abs(sy));
    const existing = getSectorMeta(sectorIndex, sx, sy) ?? {};
    const info = getStationInfoForSector(sectorManager.worldSeed, sx, sy, ring);
    let updated = false;
    if (existing.hasStation === undefined) {
      existing.hasStation = Boolean(info?.hasStation);
      updated = true;
    }
    if (existing.hasStation) {
      if (!existing.stationId && info?.stationId) {
        existing.stationId = info.stationId;
        updated = true;
      }
      if (existing.stationTierCap === undefined) {
        existing.stationTierCap = info?.tierCap ?? null;
        updated = true;
      }
      if (!existing.stationPos) {
        const rng = createRng(sectorManager.getSectorSeed(sx, sy, SECTOR.SEED_SALT.STATION));
        const bounds = sectorManager.getBounds(sx, sy);
        const safePoint = {
          x: bounds.x + bounds.size / 2,
          y: bounds.y + bounds.size / 2
        };
        existing.stationPos = pickStationPosition(rng, bounds, safePoint, SECTOR.ENTRY_SAFE_RADIUS, existing.beaconPosition);
        updated = true;
      }
      if (existing.stationDiscovered === undefined) {
        existing.stationDiscovered = Boolean(info?.isStartStation);
        updated = true;
      }
    } else if (existing.stationDiscovered === undefined) {
      existing.stationDiscovered = false;
      updated = true;
    }
    if (updated) {
      setSectorMeta(sectorIndex, sx, sy, existing);
      if (allowPersistence) {
        saveSectorIndex(sectorIndex);
      }
    }
    return existing;
  }

  function updateStationDiscovery() {
    if (!sector) {
      return [];
    }
    const range = Math.floor(STATION.SCAN_RANGE_CELLS / 2);
    const markers = [];
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const sx = sector.sx + dx;
        const sy = sector.sy + dy;
        const meta = ensureStationMetaForSector(sx, sy);
        if (!meta?.hasStation || !meta.stationPos) {
          continue;
        }
        if (!meta.stationDiscovered) {
          meta.stationDiscovered = true;
          setSectorMeta(sectorIndex, sx, sy, meta);
          if (allowPersistence) {
            saveSectorIndex(sectorIndex);
          }
        }
        markers.push({
          x: meta.stationPos.x,
          y: meta.stationPos.y,
          sx,
          sy
        });
      }
    }
    return markers;
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
        hasStation: Boolean(sector.station),
        stationId: sector.station?.id ?? null,
        stationPos: sector.station ? { x: sector.station.x, y: sector.station.y } : null,
        stationDiscovered: Boolean(sector.station?.discovered),
        stationTierCap: sector.station?.tierCap ?? null,
        generatedAtExposure: Math.max(0, gameState?.beacon?.exposure ?? 0),
        visited: false,
        surveyComplete: false,
        lastVisitedAt: null,
        anomalyModifier: sector.anomalyModifier ?? null,
      echoTag: sector.echoTag ?? null,
      patternId: sector.patternId ?? null,
      patternParamsSeed: Number.isFinite(sector.patternParamsSeed) ? sector.patternParamsSeed : null,
      patternVersion: Number.isFinite(sector.patternVersion) ? sector.patternVersion : null
    };
    setSectorMeta(sectorIndex, sector.sx, sector.sy, fallback);
    if (allowPersistence) {
      saveSectorIndex(sectorIndex);
    }
    return fallback;
  }

  function updateSectorMeta(sector, updater) {
    const meta = ensureSectorMeta(sector);
    if (!meta) {
      return null;
    }
    updater(meta);
    setSectorMeta(sectorIndex, sector.sx, sector.sy, meta);
    if (allowPersistence) {
      saveSectorIndex(sectorIndex);
    }
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

  function updateIntro(dt, activeStars, simulationIsRunning) {
    if (!intro.enabled || !INTRO || !simulationIsRunning) {
      return;
    }
    intro.clock += dt;

    for (let i = intro.highlightQueue.length - 1; i >= 0; i--) {
      const entry = intro.highlightQueue[i];
      if (alertClock >= entry.start) {
        triggerIntroHighlight(entry.key, entry.duration);
        intro.highlightQueue.splice(i, 1);
      }
    }
    if (intro.releaseAlertsAt !== null && alertClock >= intro.releaseAlertsAt) {
      intro.suppressAlerts = false;
      intro.releaseAlertsAt = null;
    }

    for (const key of Object.keys(intro.highlights)) {
      if (intro.highlights[key] > 0) {
        intro.highlights[key] = Math.max(0, intro.highlights[key] - dt);
      }
    }

    if (!intro.flags.systems && intro.clock >= INTRO.START_DELAY) {
      scheduleIntroAlert("systems", "Systems online. Survey and exit freely.");
    }

    if (!intro.flags.goals && intro.controlUsed) {
      scheduleIntroAlert("goals", "Survey targets increase score. Exits move you onward.", {
        highlightKeys: ["goal", "exit"],
        highlightDuration: INTRO.HIGHLIGHT_DURATION
      });
    }

    if (!intro.flags.score && (intro.firstSurveyComplete || intro.clock >= INTRO.SCORE_TIMEOUT)) {
      scheduleIntroAlert("score", "Momentum matters. Chains and distance amplify score.", {
        highlightKeys: ["score"],
        highlightDuration: INTRO.HIGHLIGHT_DURATION
      });
    }

    if (!intro.flags.fuel && ship.maxFuel > 0) {
      const ratio = ship.fuel / ship.maxFuel;
      if (ratio <= INTRO.FUEL_RATIO) {
        scheduleIntroAlert("fuel", "Fuel is freedom. Drift wisely.", {
          highlightKeys: ["fuel"],
          highlightDuration: INTRO.HIGHLIGHT_DURATION
        });
      }
    }

    const ring = Math.max(Math.abs(sector?.sx ?? 0), Math.abs(sector?.sy ?? 0));
    if (!intro.flags.weird && (intro.sectorTransitions >= 1 || ring >= 1)) {
      scheduleIntroAlert("weird", "Space is not uniform. Patterns emerge further out.", {
        highlightKeys: ["vignette"],
        highlightDuration: INTRO.VIGNETTE_DURATION
      });
    }

    if (!intro.flags.rivers) {
      const riverInfo = getClosestRiverInfo(ship, sector?.runtimeRivers ?? []);
      if (riverInfo && riverInfo.dist < (riverInfo.width / 2)) {
        scheduleIntroAlert("rivers", "Currents shape motion. Ride them.", {
          highlightKeys: ["river"],
          highlightDuration: INTRO.RIVER_HIGHLIGHT_DURATION
        });
      }
    }

    if (!intro.flags.stars && Array.isArray(activeStars) && activeStars.length > 0) {
      const accel = computeStarAccelAt(ship, activeStars, CONFIG);
      const accelMag = Math.hypot(accel.ax, accel.ay);
      if (accelMag >= INTRO.STAR_PULL_ACCEL) {
        scheduleIntroAlert("stars", "Stars bend paths. Respect their pull.");
      }
    }

    if (!intro.flags.distance && intro.sectorTransitions >= INTRO.LONGRUN_TRANSITIONS) {
      scheduleIntroAlert("distance", "Distance is remembered.", {
        highlightKeys: ["score"],
        highlightDuration: INTRO.HIGHLIGHT_DURATION,
        releaseAlerts: true
      });
    }

    if (!intro.flags.anomaly && sector?.sectorType === SECTOR_TYPES.ANOMALY) {
      scheduleIntroAlert("anomaly", "Not everything here is inert.");
    }
    if (!intro.flags.echo && sector?.sectorType === SECTOR_TYPES.ECHO) {
      scheduleIntroAlert("echo", "Not everything here is inert.");
    }
    if (!intro.flags.movingStars && Array.isArray(activeStars) && activeStars.some((star) => star.motion)) {
      scheduleIntroAlert("movingStars", "Not everything here is inert.");
    }
    if (!intro.flags.station && sector?.station) {
      scheduleIntroAlert("station", "Not everything here is inert.");
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
    updateEnemyPings(enemyPings, dt);
    updateAlerts(dt);
    updateScorePopups(dt);
    updateShake(dt);
    updateBackgroundEvents(dt);
    if (controlsDisabledTimer > 0) {
      controlsDisabledTimer = Math.max(0, controlsDisabledTimer - dt);
    }
    const simulationIsRunning = !deathPauseActive && !pendingGameOver && respawnTimer <= 0;
    if (simulationIsRunning && gameState) {
      const dtMs = Math.max(0, Math.round(dt * 1000));
      if (dtMs > 0) {
        gameState.worldAgeMs = (gameState.worldAgeMs ?? 0) + dtMs;
        markStateDirty();
      }
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
    const controlsDisabled = controlsDisabledTimer > 0 || docked;
    const inputBlocked = controlsDisabledTimer > 0;
    if (autopilotFirePause > 0) {
      autopilotFirePause = Math.max(0, autopilotFirePause - dt);
    }
    if (autopilotThrustBurst > 0) {
      autopilotThrustBurst = Math.max(0, autopilotThrustBurst - dt);
      if (autopilotThrustBurst === 0) {
        autopilotThrustCooldown = AUTOPILOT.THRUST.BURST_COOLDOWN;
      }
    } else if (autopilotThrustCooldown > 0) {
      autopilotThrustCooldown = Math.max(0, autopilotThrustCooldown - dt);
    }
    const autopilotEngaged = autopilotActive && !inputBlocked && !docked;
    let externalInput = null;
    let autopilotFire = false;
    let keyboardRotationInput = 0;
    let keyboardThrustInput = 0;
    let shipInSafeZone = false;
    let shipFullyInsideSafeZone = false;
    if (!inputBlocked && !autopilotEngaged) {
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
      if (autopilotEngaged) {
        const autopilotStations = getActiveStations();
        const autopilotStars = activeSectors.flatMap((s) => s.stars);
        const autopilotResult = computeAutopilotInput(dt, autopilotStars, autopilotStations);
        externalInput = {
          rotationInput: autopilotResult.rotationInput,
          thrustInput: autopilotResult.thrustInput
        };
        autopilotFire = autopilotResult.fire;
      } else if (controlsDisabled) {
        externalInput = { disableControls: true };
      }
      if (intro.enabled && !inputBlocked && !autopilotEngaged) {
        const manualInputUsed = keyboardRotationInput !== 0
          || keyboardThrustInput !== 0
          || (externalInput && (
            externalInput.thrustInput !== undefined
            || externalInput.rotationInput !== undefined
            || Number.isFinite(externalInput.aimAngle)
          ));
        if (manualInputUsed) {
          intro.controlUsed = true;
        }
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

    sector = sectorManager.getSectorForPosition(ship.x, ship.y);
    activeSectors = sectorManager.getSectorsAround(ship.x, ship.y, ACTIVE_SECTOR_RANGE);
    for (const activeSector of activeSectors) {
      const shipPos = activeSector === sector ? { x: ship.x, y: ship.y } : null;
      updateSectorRivers(activeSector, shipPos);
    }
    stationMarkers = updateStationDiscovery();
    const activeStations = getActiveStations();
    updateBullets(bullets, dt, activeStations);
    updateEnemyBullets(enemyBullets, enemies, ship, SHIP_RADIUS, invulnTimer, shipVisible, handleLifeLoss, dt, activeStations);

    const currentStation = sector?.station ?? null;
    let stationDx = 0;
    let stationDy = 0;
    let stationDist = 0;
    let stationSafeRadius = 0;
    if (currentStation) {
      stationDx = ship.x - currentStation.x;
      stationDy = ship.y - currentStation.y;
      stationDist = Math.hypot(stationDx, stationDy);
      stationSafeRadius = currentStation.safeRadius ?? STATION.SAFE_ZONE_RADIUS;
      shipInSafeZone = stationDist <= stationSafeRadius;
      shipFullyInsideSafeZone = stationDist <= (stationSafeRadius - SHIP_RADIUS);
    }
    if (!shipInSafeZone) {
      stationEntryLockId = null;
    }
    const interactTriggered = Boolean(interactPressed);
    interactPressed = false;

    if (!docked && currentStation && shipFullyInsideSafeZone && stationEntryLockId !== currentStation.id) {
      stationEntryLockId = currentStation.id;
      setAutopilotActive(false, true);
      docked = true;
      dockStation = currentStation;
      const dist = stationDist || 1;
      const dirX = dist > 0 ? stationDx / dist : Math.sin(ship.heading);
      const dirY = dist > 0 ? stationDy / dist : -Math.cos(ship.heading);
      const targetDist = Math.max(0, stationSafeRadius - SHIP_RADIUS - 1);
      ship.x = currentStation.x + dirX * targetDist;
      ship.y = currentStation.y + dirY * targetDist;
      ship.vx = 0;
      ship.vy = 0;
      ship.stopThrustLoop();
      ship.stopRotateLoop();
      ship.thrusting = 0;
      openUpgradeModal(currentStation);
    }

    if (docked) {
      if (!currentStation || dockStation?.id !== currentStation.id) {
        docked = false;
        dockStation = null;
        closeUpgradeModal();
      } else if (interactTriggered) {
        docked = false;
        dockStation = null;
        closeUpgradeModal();
      }
    }
    if (interactButton) {
      interactButton.style.display = docked ? "block" : "none";
    }
    if (shipInSafeZone) {
      sounds.startLoop("at_station", 2, 0.2);
    } else {
      sounds.stopLoop("at_station");
    }

    const collectorStats = getCollectorStats(upgradeLevels.collectorLevel);
    applyCollectorPull(fuelPickups, collectorStats, dt);
    applyCollectorPull(resourcePickups, collectorStats, dt);

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
      const sectorCenter = getSectorCenter(sector.sx, sector.sy);
      const sectorDistance = Math.hypot(sectorCenter.x - originX, sectorCenter.y - originY);
      if (!farthestSector || sectorDistance > farthestSector.distance) {
        farthestSector = { sx: sector.sx, sy: sector.sy, distance: sectorDistance };
      }
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

    const activeStars = activeSectors.flatMap((s) => s.stars);
    updateIntro(dt, activeStars, simulationIsRunning);
    const worldAgeMs = gameState?.worldAgeMs ?? 0;
    const worldAgeSeconds = worldAgeMs / 1000;
    for (let i = fuelPickups.length - 1; i >= 0; i--) {
      const pickup = fuelPickups[i];
      if (pickup.ttlMs !== undefined && pickup.spawnTimeMs !== undefined) {
        if (worldAgeMs - pickup.spawnTimeMs >= pickup.ttlMs) {
          fuelPickups.splice(i, 1);
        }
      }
    }
    for (let i = resourcePickups.length - 1; i >= 0; i--) {
      const pickup = resourcePickups[i];
      if (pickup.ttlMs !== undefined && pickup.spawnTimeMs !== undefined) {
        if (worldAgeMs - pickup.spawnTimeMs >= pickup.ttlMs) {
          resourcePickups.splice(i, 1);
        }
      }
    }
    for (const activeSector of activeSectors) {
      if (activeSector.beacon && !activeSector.beaconEntity) {
        activeSector.beaconEntity = new BeaconRelic(activeSector.beacon.x, activeSector.beacon.y, {
          size: 190,
          shimmerPhase: (activeSector.sx + activeSector.sy) * 0.5
        });
      }
      if (activeSector.station && !activeSector.stationEntity) {
        activeSector.stationEntity = new UpgradeStation(activeSector.station.x, activeSector.station.y, {
          id: activeSector.station.id,
          safeRadius: activeSector.station.safeRadius,
          dockRadius: activeSector.station.dockRadius,
          isStartStation: activeSector.station.isStartStation,
          tierCap: activeSector.station.tierCap
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
        star.update(dt, worldAgeSeconds);
      }
    }
    if (DEBUG.VECTORS) {
      const accel = computeStarAccelAt(ship, activeStars, CONFIG);
      ship.debugGravityX = accel.ax;
      ship.debugGravityY = accel.ay;
    } else {
      ship.debugGravityX = 0;
      ship.debugGravityY = 0;
    }

    const shipRivers = shipInSafeZone ? [] : (sector?.runtimeRivers ?? []);
      if (docked) {
        ship.vx = 0;
        ship.vy = 0;
      } else {
        applyForcesToEntity(ship, dt, activeStars, shipRivers, CONFIG);
        if (autopilotEngaged && AUTOPILOT.SPEED_MAX > 0) {
          const speed = Math.hypot(ship.vx, ship.vy);
          if (speed > AUTOPILOT.SPEED_MAX) {
            const scale = AUTOPILOT.SPEED_MAX / speed;
            ship.vx *= scale;
            ship.vy *= scale;
          }
        }
        integrate(ship, dt);
        resolveStationCollision(currentStation);
      }
    updateGate(dt);
    const shipSpeed = Math.hypot(ship.vx, ship.vy);
    spawnTrailSparks(dt, shipSpeed);
    const distFromOrigin = Math.hypot(ship.x - originX, ship.y - originY);
    if (distFromOrigin > distanceTraveled) {
      distanceTraveled = distFromOrigin;
    }
    for (const activeSector of activeSectors) {
      for (let i = activeSector.asteroids.length - 1; i >= 0; i--) {
        const asteroid = activeSector.asteroids[i];
        if (asteroid.ttlMs !== undefined && asteroid.spawnTimeMs !== undefined) {
          if (worldAgeMs - asteroid.spawnTimeMs >= asteroid.ttlMs) {
            activeSector.asteroids.splice(i, 1);
            continue;
          }
        }
        if (typeof asteroid.update === "function") {
          asteroid.update(dt);
        }
        applyForcesToEntity(asteroid, dt, activeStars, activeSector.runtimeRivers ?? [], CONFIG);
        integrate(asteroid, dt);
      }
    }
    updateFuelPickups(fuelPickups, activeStars, activeSectors, dt, worldAgeMs);
    updateResourcePickups(resourcePickups, activeStars, activeSectors, dt, worldAgeMs);
    enemiesInRange = updateEnemies(
      enemies,
      ship,
      dt,
      activeStars,
      activeSectors,
      MINIMAP.RANGE,
      ENEMY_FIRE_RANGE,
      ENEMY.FIRE_COOLDOWN,
      enemyBullets,
      BULLET.SPEED,
      ENEMY_BULLET_LIFE,
      sounds
    );
    destroyObjectsInSafeZones(activeStations);
    repelEnemiesFromStations(activeStations, dt);
    handleFuelPickups(fuelPickups, ship, SHIP_RADIUS, SCORE_POINTS, addScore, sounds);
    handleResourcePickups(resourcePickups, ship, SHIP_RADIUS, addResource, sounds);
    handleBulletHits(
      bullets,
      enemies,
      activeSectors,
      SCORE_POINTS,
      SCORE_CHUNK_MULTIPLIER,
      addScore,
      sounds,
      fuelPickups,
      resourcePickups,
      particles,
      worldAgeMs
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

    if (!shipInSafeZone) {
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
    }

    if (ship.fuel <= 0 && terminateRequested) {
      terminateRequested = false;
      handleLifeLoss("normal");
      return;
    }
    terminateRequested = false;

    const manualFire = (mouseAimEnabled && mouse.leftDown) || touch.fireId !== null;
    const wantsFire = !controlsDisabled && !docked
      && (autopilotEngaged ? autopilotFire : manualFire);
    if (shipVisible && wantsFire && fireCooldown === 0 && fireLockout === 0) {
      spawnBullet(bullets, ship, BULLET);
      sounds.play("laser");
      triggerShake(SHAKE.FIRE, 0.12);
      fireCooldown = getFireCooldownSeconds(upgradeLevels.fireRateLevel);
      if (autopilotEngaged) {
        autopilotFirePause = randomRange(AUTOPILOT.FIRE.PAUSE_MIN, AUTOPILOT.FIRE.PAUSE_MAX);
      }
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
      if (intro.enabled) {
        intro.firstSurveyComplete = true;
      }
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
  const maxViewWidth = canvas.width / ZOOM.MIN;
  const maxViewHeight = canvas.height / ZOOM.MIN;
  const worldAgeMs = gameState?.worldAgeMs ?? 0;
  const worldAgeTicks = Math.floor(worldAgeMs / 1000);
  const maxViewRect = {
    x: ship.x - maxViewWidth / 2,
    y: ship.y - maxViewHeight / 2,
    width: maxViewWidth,
    height: maxViewHeight
  };
  const introHighlight = intro.enabled && INTRO
    ? {
      goal: Math.min(1, intro.highlights.goal / INTRO.HIGHLIGHT_DURATION),
      exit: Math.min(1, intro.highlights.exit / INTRO.HIGHLIGHT_DURATION),
      score: Math.min(1, intro.highlights.score / INTRO.HIGHLIGHT_DURATION),
      fuel: Math.min(1, intro.highlights.fuel / INTRO.HIGHLIGHT_DURATION),
      vignette: Math.min(1, intro.highlights.vignette / INTRO.VIGNETTE_DURATION),
      river: Math.min(1, intro.highlights.river / INTRO.RIVER_HIGHLIGHT_DURATION)
    }
    : {
      goal: 0,
      exit: 0,
      score: 0,
      fuel: 0,
      vignette: 0,
      river: 0
    };
  const rivers = activeSectors.flatMap((activeSector) => activeSector.runtimeRivers ?? []);
  const renderStars = activeSectors.flatMap((activeSector) => activeSector.stars);
  drawRivers(ctx, rivers, maxViewRect, worldAgeTicks, renderStars, worldAgeMs / 1000, introHighlight.river);
  const shipSpeed = Math.hypot(ship.vx, ship.vy);
  drawTrail(ctx, trail, shipSpeed);
  drawCollectorField(ctx, getCollectorStats(upgradeLevels.collectorLevel).radius);
  for (const activeSector of activeSectors) {
    if (activeSector.station) {
      const dx = ship.x - activeSector.station.x;
      const dy = ship.y - activeSector.station.y;
      const inZone = Math.hypot(dx, dy) <= (activeSector.station.safeRadius ?? STATION.SAFE_ZONE_RADIUS);
      const isDockedHere = docked && dockStation?.id === activeSector.station.id;
      drawStationSafeZone(ctx, activeSector.station, inZone, isDockedHere);
    }
  }
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
    if (activeSector.stationEntity) {
      activeSector.stationEntity.draw(ctx);
    }
    for (const asteroid of activeSector.asteroids) {
      asteroid.draw(ctx);
    }
  }
  drawGate(ctx);
  drawFuelPickups(ctx, fuelPickups);
  drawResourcePickups(ctx, resourcePickups);
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
  drawScreenEffects(ctx, canvas.width, canvas.height, introHighlight.vignette);
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
    ? "INPUT: TOUCH"
    : "INPUT: MOUSE";
  const anomalyEffects = getAnomalyEffects(sector, time);
  const distanceFromOrigin = Math.hypot(ship.x - originX, ship.y - originY);
  drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, enemiesInRange, hudW, hudH, anomalyEffects);
  drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, stationMarkers, hudW, hudH, isCompactHud, anomalyEffects, introHighlight);
  drawFuelGauge(ctx, ship, hudW, hudH, isCompactHud, introHighlight.fuel);
  if (exitButton) {
    const base = Math.min(hudW, hudH);
    const edge = isCompactHud ? 12 : 20;
    const maxSize = Math.min(hudW - edge * 2, hudH - edge * 2);
    const desiredSize = isCompactHud
      ? Math.min(MINIMAP.SIZE, Math.round(base * 0.28))
      : MINIMAP.SIZE;
    const size = Math.max(120, Math.min(desiredSize, maxSize));
    const x0 = hudW - size - edge;
    const y0 = edge;
    const btnSize = (isCompactHud ? 24 : 30) * hudScale;
    exitButton.style.width = `${btnSize}px`;
    exitButton.style.height = `${btnSize}px`;
    exitButton.style.left = `${(x0 + size - btnSize * 0.7) * hudScale}px`;
    exitButton.style.top = `${(y0 - btnSize * 0.4) * hudScale}px`;
    exitButton.style.display = "block";
  }
  if (terminateButton) {
    const edge = isCompactHud ? 12 : 20;
    const basePanelW = Math.min(isCompactHud ? 260 : 320, hudW - edge * 2);
    const panelW = basePanelW * 0.8;
    const panelH = isCompactHud ? 70 : 78;
    const x = edge;
    const y = hudH - panelH - (isCompactHud ? 10 : 16);
    terminateButton.style.left = `${x * hudScale}px`;
    terminateButton.style.top = `${y * hudScale}px`;
    terminateButton.style.width = `${panelW * hudScale}px`;
    terminateButton.style.height = `${panelH * hudScale}px`;
    terminateButton.style.display = ship.fuel <= 0 && !pendingGameOver ? "flex" : "none";
  }
  drawStatusHud(
    ctx,
    ship,
    lives,
    surveyed,
    timeSpent,
    distanceFromOrigin,
    resourceCurrency,
    hudW,
    hudH,
    controlLabel,
    isCompactHud
  );
  drawScoreHud(ctx, score, scoreMultiplier, scorePulse, hudW, hudH, isCompactHud, introHighlight.score);
  const autoRect = drawAutopilotToggle(ctx, autopilotActive, hudW, hudH, isCompactHud);
  autopilotButtonRect = {
    x: autoRect.x * hudScale,
    y: autoRect.y * hudScale,
    width: autoRect.width * hudScale,
    height: autoRect.height * hudScale
  };
  drawStationIndicators(ctx, ship, stationMarkers, hudW, hudH, camera);
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
    setAutopilotActive(false, true);
    sounds.stopLoop("at_station");
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
      if (allowPersistence) {
        saveGameState(gameState);
      }
    }
    if (allowPersistence) {
      saveSectorIndex(sectorIndex);
    }
    if (onGameOver) {
      onGameOver(cachedGameOverStats);
    }
  }

  function requestExitToMenu() {
    if (!running) {
      return;
    }
    exitToMenu();
    if (onExitToMenu) {
      onExitToMenu();
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
    sounds.stopLoop("at_station");
    cleanupMouseControls();
    if (gameState) {
      if (allowPersistence) {
        saveGameState(gameState);
      }
    }
    if (allowPersistence) {
      saveSectorIndex(sectorIndex);
    }
  }

  function updateZoom(dt) {
    const zoomDelta = wheelZoomStep;
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
