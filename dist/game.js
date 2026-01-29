// ===== FILE: src/game/config.js =====
(function(){
"use strict";
// Centralized tuning values for gameplay, visuals, audio, and generation.
// Keep this file human-readable; prefer descriptive grouping over flat lists.

// Storage keys.
const STORAGE = {
  GAME_STATE_KEY: "spaceGame_gameState_v1",
  SECTOR_INDEX_KEY: "spaceGame_sectorIndex_v1",
  MOUSE_AIM_KEY: "spaceSurveyor_mouseAim"
};

// Debug toggles for development.
const DEBUG = {
  VECTORS: true
};

// Camera controls and screen shake.
const CAMERA = {
  ZOOM: {
    MIN: 0.4,
    MAX: 2.0,
    SPEED: 0.7,
    WHEEL_STEP: 0.12
  },
  SHAKE: {
    DURATION: 0.35,
    HIT: 6,
    SURVEY: 3,
    FIRE: 0.6
  }
};

// Core gameplay pacing.
const GAMEPLAY = {
  ACTIVE_SECTOR_RANGE: 1,
  STARTING_LIVES: 3,
  INVULN_DURATION: 1.25,
  GAME_OVER_DELAY: 0.7,
  RESPAWN_DELAY: 0.6,
  INTRO: {
    ALERT_DURATION: 3,
    START_DELAY: 1.2,
    SCORE_TIMEOUT: 10,
    FUEL_RATIO: 0.8,
    LONGRUN_TRANSITIONS: 2,
    STAR_PULL_ACCEL: 60,
    HIGHLIGHT_DURATION: 1.4,
    VIGNETTE_DURATION: 1.6,
    RIVER_HIGHLIGHT_DURATION: 1.4
  }
};

// Scoring values and popup styling.
const SCORE = {
  CHUNK_MULTIPLIER: 0.5,
  POINTS: {
    ASTEROID: 5,
    ENEMY: 25,
    FUEL: 15,
    SURVEY: 40
  },
  POPUP: {
    LIFE: 1.1,
    RISE: 26,
    SCALE_START: 0.6,
    SCALE_END: 1.25,
    GROW_TIME: 0.22,
    EDGE_MARGIN: 24,
    FONT_SIZE: 18
  },
  POPUP_COLORS: {
    survey: "rgba(120, 200, 190, 0.95)",
    fuel: "rgba(120, 220, 180, 0.95)",
    enemy: "rgba(200, 110, 110, 0.95)",
    asteroid: "rgba(210, 185, 150, 0.95)",
    chain: "rgba(120, 220, 255, 0.95)",
    gate: "rgba(170, 210, 220, 0.95)",
    generic: "rgba(230, 240, 240, 0.95)"
  }
};

// Resource pickups dropped by asteroids.
const RESOURCE = {
  DROP_CHANCE: 0.5,
  DROP_BASE_VALUE: 8,
  CHILD_VALUE_DECAY: 0.6,
  MIN_DROP_VALUE: 1,
  PICKUP_RADIUS: 18,
  SPRITE_SRC: "assets/ui/sprites/money.png",
  HUD_ICON_SIZE: 14,
  TTL_MS: 30000
};

// Upgrade economy and effects.
const UPGRADES = {
  FIRE_RATE: {
    levelMax: 10,
    baseCost: 30,
    costMult: 1.45,
    effect: {
      cooldownMsBase: 260,
      cooldownMsMin: 90
    }
  },
  HULL: {
    levelMax: 10,
    baseCost: 25,
    costMult: 1.42,
    effect: {
      maxLivesBase: GAMEPLAY.STARTING_LIVES,
      livesPerLevel: 1
    }
  },
  COLLECTOR: {
    levelMax: 10,
    baseCost: 20,
    costMult: 1.4,
    effect: {
      radiusBase: 0,
      radiusPerLevel: 28,
      pullStrengthBase: 0,
      pullStrengthPerLevel: 0.015,
      pullStrengthMax: 0.2
    }
  },
  REPAIR: {
    baseCost: 12,
    costPerLife: 8
  }
};

// Beacon exposure system.
const BEACON = {
  OBSERVER_RADIUS: 900,
  MIN_STAR_DIST: 300,
  OBSERVE_RATE: 0.00002,
  RETURN_BONUS: 0.02,
  SURVEY_BONUS: 0.05,
  MIDCYCLE_PENALTY: 0.03,
  VISIT_COOLDOWN: 600,
  SIGNAL_CYCLE: 60
};

// Calibration gates and sizing reference.
const CALIBRATION = {
  // Ship radius reference for gate sizing, not the collision radius.
  SHIP_RADIUS: 24,
  GATE: {
    SPAWN_MIN: 2,
    SPAWN_MAX: 7,
    FADE_TIME: 1.5,
    LIFETIME: 40,
    EXCLUSION_RADIUS: 220,
    CRUISE_MIN: 180,
    CRUISE_MAX: 260,
    CRUISE_SPEED: 220,
    SPAWN_LATERAL: 220,
    BASE_THICKNESS: 2,
    POLE_RATIO: 0.14,
    EDGE_OFFSET: 60,
    BASE_VIEW_RADIUS: 900,
    CHAIN_MIN: 3,
    CHAIN_MAX: 9,
    CHAIN_ARC_MIN: Math.PI / 10,
    CHAIN_ARC_MAX: Math.PI / 5,
    CHAIN_HUE_FALLOFF: 0.6,
    GATE_SCORE_BASE: 10,
    CHAIN_SCORE_BASE: 10,
    CHAIN_ATTEMPTS: 6,
    WEIGHTS: {
      CHAIN_GATE: 0.5,
      EXIT_ALIGNMENT_GATE: 0.25,
      DISPLACEMENT_GATE: 0.15,
      SHUTDOWN_GATE: 0.1
    },
    TYPES: {
      CHAIN: "CHAIN_GATE",
      DISPLACEMENT: "DISPLACEMENT_GATE",
      EXIT: "EXIT_ALIGNMENT_GATE",
      SHUTDOWN: "SHUTDOWN_GATE"
    },
    COLORS: {
      CHAIN: "rgba(80, 200, 255, 0.7)",
      DISPLACEMENT: "rgba(200, 120, 255, 0.7)",
      EXIT: "rgba(255, 190, 90, 0.7)",
      SHUTDOWN: "rgba(220, 70, 70, 0.75)"
    },
    WIDTH_MULTIPLIERS: {
      CHAIN_GATE: 1.6,
      DISPLACEMENT_GATE: 2.2,
      EXIT_ALIGNMENT_GATE: 1.3,
      SHUTDOWN_GATE: 2.0
    }
  }
};

// Upgrade station placement and safe zone rules.
const STATION = {
  SPRITE_SRC: "assets/ui/sprites/upgrade_station.png",
  SAFE_ZONE_RADIUS: 140,
  COLLIDER_RADIUS: 50,
  SPRITE_SCALE: 2,
  WAVE_PERIOD: 2.4,
  WAVE_EXPAND_RATIO: 0.2,
  WAVE_ALPHA: 0.22,
  DOCK_RADIUS: 65,
  DOCK_PULL_STRENGTH: 0.09,
  DOCK_DAMPING: 0.9,
  RIVER_NEGATION_RADIUS: 140,
  ENEMY_REPEL_RADIUS: 160,
  ENEMY_REPEL_STRENGTH: 0.12,
  SCAN_RANGE_CELLS: 5,
  UNIQUE_GRID_SIZE: 5,
  START_STATION_TIER_CAP: 3,
  MARKER_EDGE_INDICATOR: true,
  PLACEMENT_CHANCE_BASE: 0.05,
  PLACEMENT_CHANCE_RING_SCALE: 0.015
};

// Background layers and transient events.
const BACKGROUND = {
  STARFIELD: {
    DENSITY: 0.002,
    ALPHA: 0.45,
    BRIGHTNESS_MIN: 180,
    BRIGHTNESS_MAX: 255,
    PARALLAX: 0.03
  },
  DUSTFIELD: {
    DENSITY: 0.0012,
    ALPHA: 0.22,
    BRIGHTNESS_MIN: 80,
    BRIGHTNESS_MAX: 160,
    PARALLAX: 0.015
  },
  FARFIELD: {
    DENSITY: 0.0007,
    ALPHA: 0.18,
    BRIGHTNESS_MIN: 110,
    BRIGHTNESS_MAX: 190,
    PARALLAX: 0.008
  },
  SLICE: {
    DENSITY: 0.001,
    ALPHA: 0.22,
    ROT_SPEED: 0.00005,
    PARALLAX: 0.01,
    ARC: Math.PI * 1.1
  },
  EVENTS: {
    MIN_INTERVAL: 3.5,
    MAX_INTERVAL: 7.5,
    MAX_ACTIVE: 5,
    EDGE_MARGIN: 80,
    CLUSTER_CHANCE: 0.35,
    CLUSTER_MIN: 2,
    CLUSTER_MAX: 3,
    CLUSTER_OFFSET: 140
  },
  PALETTE: [
    [255, 80, 220],
    [80, 240, 255],
    [200, 255, 90],
    [255, 150, 60],
    [160, 90, 255],
    [255, 90, 140]
  ],
  NEBULA: {
    ALPHA: 0.2,
    ROT_SPEED: 0.00003,
    PARALLAX: 0.006,
    RADIUS_SCALE: 0.6,
    RING_WIDTH: 0.16,
    BLOB_COUNT: 28
  }
};

// Particle and trail effects.
const EFFECTS = {
  THRUST_PARTICLES: {
    RATE: 36,
    SPEED_MIN: 40,
    SPEED_MAX: 140,
    LIFE_MIN: 0.18,
    LIFE_MAX: 0.45,
    SIZE_MIN: 1.4,
    SIZE_MAX: 3.2,
    SPREAD: 0.45,
    OFFSET: 12
  },
  TRAIL_SPARKS: {
    RATE: 18,
    SPEED_MIN: 30,
    SPEED_MAX: 160,
    LIFE_MIN: 0.12,
    LIFE_MAX: 0.4,
    SIZE_MIN: 1.1,
    SIZE_MAX: 2.8,
    SPREAD: 0.8,
    OFFSET: 10
  },
  TRAIL_DISPERSE: {
    BASE_WIDTH: 3,
    SPREAD: 10
  },
  TRAIL_COLOR: {
    SPEED: 520,
    SLOW: [90, 140, 220],
    FAST: [200, 240, 255]
  },
  CONTROL_DISABLE: {
    DURATION: 10,
    PULSE_MIN: 0.25,
    PULSE_MAX: 0.6
  }
};

// Input tuning.
const INPUT = {
  TOUCH: {
    DEADZONE: 12,
    MAX_RADIUS_MIN: 60,
    MAX_RADIUS_MAX: 110,
    MOVE_ZONE: 0.5,
    HINT_ALPHA: 0.22,
    ACTIVE_ALPHA: 0.45
  }
};

// Autopilot behavior and HUD toggle.
  const AUTOPILOT = {
    DEMO_SEED: 1357913579,
    BUTTON: {
      WIDTH: 140,
      HEIGHT: 34,
      Y_OFFSET: 22
    },
    SPEED_MAX: 200,
    COURSE: {
      LOOKAHEAD_DIST: 1200,
      LOOKAHEAD_TIME_MAX: 5,
      CORRIDOR_RADIUS: 40,
      AVOID_ANGLE_DEG: 16,
      ERROR_BLEND_RATIO: 0.2,
      TURN_EPSILON: 0.04
    },
    COLORS: {
      ON_FILL: "rgba(120, 210, 190, 0.35)",
      OFF_FILL: "rgba(40, 60, 70, 0.25)",
      BORDER: "rgba(170, 210, 220, 0.7)",
      ON_TEXT: "rgba(220, 250, 240, 0.95)",
    OFF_TEXT: "rgba(140, 170, 180, 0.7)",
    GLOW: "rgba(120, 220, 190, 0.6)"
  },
  ALERTS: {
    ENGAGED: "AUTOPILOT ENGAGED",
    DISENGAGED: "AUTOPILOT DISENGAGED"
  },
  FIRE: {
    CONE_DEG: 25,
    RANGE_MULT: 0.9,
    PAUSE_MIN: 0.15,
    PAUSE_MAX: 0.35,
    HAZARD_CLEAR_DIST: 220,
    PRIORITY_RANGE: 900,
    PRIORITY_REAR_ANGLE_DEG: 120
  },
    FUEL: {
      HIGH: 0.6,
      MID: 0.3,
      CRITICAL: 0.15
    },
    AVOID: {
      STAR_BODY_BUFFER: 40,
      ASTEROID_BODY_BUFFER: 30,
      STATION_BUFFER: 80,
      BEACON_BUFFER: 140
    },
    TARGET: {
      FUEL_RANGE: 1200,
      FUEL_ANGLE_DEG: 40,
      BRAKE_DISTANCE: 260,
      THRUST_ANGLE_DEG: 50
    },
    THRUST: {
      CRUISE_SPEED: 200,
      SPEED_FLOOR: 130,
      COAST_TIME: 1.6,
      BURST_MIN: 0.25,
      BURST_COOLDOWN: 0,
      ALIGN_POWER: 1.6,
      MIN_POWER: 0.35,
      ERROR_RATIO_DEADBAND: 0.035
    },
    GRAVITY: {
      COMPENSATION: 0.7,
      MAX_BLEND: 0.6,
      THRUST_RATIO: 0.6,
      CLOSE_PUSH: 0.9
    },
    RIVER: {
      ALIGN_DOT_MIN: 0.45
    }
  };

// HUD look and feel.
const HUD = {
  FONT: "'Orbitron', 'Bank Gothic', 'Eurostile', 'Consolas', monospace",
  ALERT: {
    DURATION: 2,
    FADE: 0.25
  },
  COLORS: {
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
  },
  MINIMAP: {
    SIZE: 200,
    RANGE: 3000
  },
  COMPASS: {
    WIDTH: 320,
    HEIGHT: 78,
    Y_OFFSET: 55,
    FOV: Math.PI,
    TICK_DEG: 15
  },
  BEARING: {
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
  },
    SCAN_PULSE: {
      PERIOD: 2400,
      RADIUS_MIN: 16,
      RADIUS_MAX: 160,
      LINE_WIDTH: 2
    },
    STATUS: {
      PANEL_WIDTH: 230,
      PANEL_WIDTH_COMPACT: 200,
      ROW_HEIGHT: 24,
      ROW_HEIGHT_COMPACT: 19,
      ICON_SIZE: 16,
      ICON_SIZE_COMPACT: 13,
      VALUE_FONT: 16,
      VALUE_FONT_COMPACT: 13,
      VALUE_GLOW: 10
    }
  };

// UI-specific endpoints and thresholds.
const UI = {
  SCOREBOARD: {
    ENDPOINT: "/api/score/",
    MIN_QUALIFY_SCORE: 100,
    NAME_MAX_LENGTH: 12
  }
};

// Physics constants.
const PHYSICS = {
  GRAVITY_G: 4000,
  SOFTENING: 80,
  DAMPING: 0.999
};

// Player projectile tuning.
const BULLET = {
  SPEED: 900,
  LIFE: 1.2,
  COOLDOWN: 0.26,
  FIRE_LOCKOUT: 0.5
};

// Player ship tuning and visuals.
const SHIP = {
  ROT_SPEED: 2.5,
  THRUST: 200,
  MAX_FUEL: 400,
  THRUST_FUEL_RATE: 18,
  ROT_FUEL_RATE: 0,
  DRAW_SIZE: 24,
  COLLISION_RADIUS: 12,
  SPRITE_SRC: "assets/ui/sprites/ship.png",
  THRUST_LOOP_SEGMENT: 0.4,
  THRUST_LOOP_CROSSFADE: 0.16,
  THRUST_VISUAL: {
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
  },
  TRAIL: {
    MAX: 200,
    MIN_DIST: 6,
    FADE_SPEED: 24,
    FADE_STEP: 0.02
  }
};

// Enemy ship tuning and spawn behavior.
const ENEMY = {
  ROT_SPEED: 2.5,
  THRUST: 120,
  MAX_SPEED: 180,
  STRAFE_RANGE: 520,
  STRAFE_BUFFER: 90,
  DRAW_SIZE: 36,
  SPRITE_SRC: "assets/ui/sprites/enemy_ship.png",
  HIT_RADIUS: 12,
  FIRE_COOLDOWN: BULLET.COOLDOWN * 2,
  SPAWN_MARGIN: 120,
  RANGE_SCALE: 2 / 3
};

// Pickup visuals and spawn tuning.
const PICKUPS = {
  FUEL: {
    AMOUNT_RATIO: 1.0,
    WIDTH: 12,
    HEIGHT: 24,
    RADIUS: 14,
    DROP_CHANCE: 1 / 4,
    TTL_MS: 30000,
    ROT_SPEED_MIN: 0.5,
    ROT_SPEED_MAX: 1.1,
    SPRITE_SRC: "assets/ui/sprites/fuel.png"
  },
  ENEMY_CHUNK: {
    COUNT_MIN: 5,
    COUNT_MAX: 9,
    SPEED_MIN: 90,
    SPEED_MAX: 240,
    SIZE_MIN: 8,
    SIZE_MAX: 16,
    LIFE_MIN: 0.5,
    LIFE_MAX: 1.2,
    ROT_SPEED_MIN: 2.0,
    ROT_SPEED_MAX: 5.0,
    SPRITE_SRC: "assets/ui/sprites/enemy_chunk.png"
  }
};

// Beacon relic visual defaults.
const BEACON_RELIC = {
  SPRITE_SRC: "assets/ui/sprites/beacon.png",
  SIZE: 180,
  SHIMMER_SPEED: 0.35
};

// Goal / survey target tuning.
const GOAL = {
  SPRITE_SRC: "assets/ui/sprites/fuel.png",
  WIDTH: 12,
  HEIGHT: 24,
  MARGIN: 300,
  MIN_SHIP_DIST: 900,
  MIN_STAR_DIST: 300,
  ROT_SPEED_MIN: 0.4,
  ROT_SPEED_MAX: 1.0,
  ANCHOR_RADIUS_DEFAULT: 480
};

// End zone visuals and sizing.
const END_ZONE = {
  SPRITE_SRC: "assets/ui/sprites/scan_point.png",
  WIDTH: 30,
  HEIGHT: 16,
  MARGIN: 120,
  MIN_GOAL_DIST: 600,
  MIN_STAR_DIST: 300,
  ROT_SPEED: 2.2,
  PULSE_SPEED: 3.2,
  PULSE_AMOUNT: 0.08
};

// Asteroid visuals and generation tuning.
const ASTEROID = {
  SPRITE_SRC: "assets/ui/sprites/asteroid.png",
  CHUNK_SPRITE_SRC: "assets/ui/sprites/asteroid_chunk.png",
  ROT_SPEED_MIN: 0.05,
  ROT_SPEED_MAX: 0.18,
  FRAGMENTS: {
    TTL_MS: 10000,
    MAX_PER_SECTOR: 60
  },
  GENERATION: {
    COUNT: 12,
    SPEED_MIN: 5,
    SPEED_MAX: 120,
    RADIUS_MIN: 10,
    RADIUS_MAX: 44,
    SPAWN_MARGIN: 400,
    CLUSTER: {
      COUNT_MIN: 2,
      COUNT_MAX: 4,
      RADIUS_MIN: 220,
      RADIUS_MAX: 520
    }
  }
};

// Star visuals and generation tuning.
const STAR = {
  SPRITES: {
    yellow: "assets/ui/sprites/yellow_star.png",
    red: "assets/ui/sprites/red_star.png",
    blue: "assets/ui/sprites/blue_star.png"
  },
  DEFAULTS: {
    MASS: 1500,
    BODY_RADIUS: 60,
    BODY_COLOR: "gold",
    WELL_FILL: "rgba(255, 255, 200, 0.06)",
    WELL_STROKE: "rgba(255, 255, 200, 0.2)",
    MINIMAP_COLOR: "gold",
    SPRITE_KEY: "yellow",
    GRAVITY_RADIUS_MULTIPLIER: 3,
    PULSE_SPEED: 1.0,
    PULSE_AMOUNT: 0.06
  },
  GENERATION: {
    MASS_MIN: 1200,
    MASS_MAX: 2200,
    MARGIN: 400,
    BODY_RADIUS: 42,
    WELL: {
      BASE_RADIUS: 441,
      VARIANCE: 0.2
    },
    ROTATION: {
      YELLOW_MIN: 0.25,
      YELLOW_MAX: 0.35,
      RED_MIN: 0.4,
      RED_MAX: 0.55,
      BLUE_MIN: 0.6,
      BLUE_MAX: 0.8
    },
    PULSE: {
      YELLOW_SPEED_MIN: 0.7,
      YELLOW_SPEED_MAX: 1.0,
      RED_SPEED_MIN: 0.9,
      RED_SPEED_MAX: 1.2,
      BLUE_SPEED_MIN: 1.1,
      BLUE_SPEED_MAX: 1.5,
      YELLOW_AMOUNT: 0.05,
      RED_AMOUNT: 0.08,
      BLUE_AMOUNT: 0.12
    },
    TYPES: {
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
    },
    RATE_MULTIPLIER: 3,
    PLACEMENT: {
      MAX_TRIES_PER_STAR: 18,
      MAX_CONSECUTIVE_FAILURES: 6
    }
  },
  MOTION: {
    SAFETY_BUFFER: 120
  }
};

// Field composition that shapes spatial layouts across many sectors.
const FIELD = {
  SIZE_SECTORS: 8,
  TYPES: {
    GEOMETRIC_LATTICE: "GEOMETRIC_LATTICE",
    GEOMETRIC_RADIAL: "GEOMETRIC_RADIAL",
    BRAIDED_FLOW: "BRAIDED_FLOW",
    SPARSE_VOID: "SPARSE_VOID",
    CHAOTIC_CLUSTER: "CHAOTIC_CLUSTER"
  },
  STAR_MULTIPLIERS: {
    GEOMETRIC_LATTICE: 1.0,
    GEOMETRIC_RADIAL: 0.95,
    BRAIDED_FLOW: 0.9,
    SPARSE_VOID: 0.2,
    CHAOTIC_CLUSTER: 1.1
  },
  VOID_ALLOWED_MAX_RING: 6,
  VOID_ZERO_STAR_PROB: 0.55
};

// Space river network and force tuning.
const RIVER = {
  WIDTH_MIN: 120,
  WIDTH_MAX: 900,
  STRENGTH_BASE: 23.3,
  STRENGTH_MULTIPLIER: 3,
  STRENGTH_EXPONENT: 1.0,
  EDGE_FALLOFF_POWER: 2.0,
  TIME_SCALE: 1.0,
  VS_STAR_RATIO_MAX: 0.6,
  WORLD_DENSITY: 0.22,
  MIN_PER_SECTOR: 2,
  PER_SECTOR_MAX: 2,
  CHANNEL_SECTOR_BIAS: 0.65,
  DISABLED_SECTOR_TYPES: ["SIGNAL_ORIGIN"],
  POLYLINE_SPACING: 120,
  BACKBONE_SPAN_CELLS: 3,
  DRIFT_AMPLITUDE: 3.6,
  DRIFT_RATE: 0.03,
  ANCHOR: {
    CELL_SIZE_SECTORS: 12,
    SEARCH_RADIUS: 2.5,
    SNAP_RADIUS: 350
  },
  RENDER: {
    SHIMMER_RATE: 0.006,
    WAVE_AMPLITUDE: 18,
    WAVE_LENGTH: 420,
    WAVE_SPEED: 0.25,
    PULSE_RATE: 0.35,
    PULSE_AMOUNT: 0.2,
    BASE_COLOR_VARIANCE: 16,
    CHROMA_SPLIT: {
      OFFSETS: [-0.06, 0.06, 0.1],
      ALPHA: 0.06,
      WIDTH_SCALE: 0.16,
      COLORS: [
        [90, 210, 255],
        [255, 150, 220],
        [140, 255, 210]
      ]
    },
    FLOW_DASH: {
      LENGTH: 140,
      GAP: 220,
      WIDTH: 2.5,
      ALPHA: 0.14,
      SPEED: 0.6,
      COLOR: [210, 240, 255]
    },
    SCINTILLATION: {
      ENABLED: true,
      RATE: 0.18,
      WAVELENGTH: 220,
      STRENGTH: 0.6,
      HUE_SHIFT: 0.18
    },
    OUTER_ALPHA: 0.06,
    MID_ALPHA: 0.1,
    CORE_ALPHA: 0.14
  }
};

// Sector generation and persistence tuning.
const SECTOR = {
  SIZE: 6000,
  ENTRY_SAFE_RADIUS: 900,
  START_SAFE_RADIUS: 1600,
  BEACON_SAFE_PADDING: 320,
  MIN_ORIGIN_RING: 8,
  ORIGIN_COOLDOWN: 11,
  ECHO_MIN_EXPOSURE: 0.2,
  TYPES: {
    GENERIC: "GENERIC",
    DEAD_QUIET: "DEAD_QUIET",
    ECHO: "ECHO",
    ANOMALY: "ANOMALY",
    DERELICT_FIELD: "DERELICT_FIELD",
    SIGNAL_ORIGIN: "SIGNAL_ORIGIN"
  },
  MOODS: ["NEUTRAL", "QUIET", "UNSETTLING", "FAMILIAR", "ARTIFICIAL"],
  ANOMALY_MODIFIERS: [
    "SCANNER_JITTER",
    "RANGE_DRIFT",
    "ORIENTATION_DRIFT",
    "PULSE_GHOSTS"
  ],
  SPAWN_PROFILES: {},
  SEED_SALT: {
    TYPE: 101,
    MOOD: 202,
    ANOMALY: 303,
    ECHO: 404,
    BEACON: 505,
    STARS: 606,
    GOAL: 707,
    END_ZONE: 808,
    ASTEROIDS: 909,
    PATTERN: 955,
    FIELD: 1001,
    RIVER: 1111,
    ANCHOR: 1222,
    STATION: 1333
  },
  ZONES: {
    start: { id: "start", asteroidMultiplier: 0.5 },
    middle: { id: "middle", asteroidMultiplier: 1.0 },
    outer: { id: "outer", asteroidMultiplier: 1.3 }
  }
};

SECTOR.SPAWN_PROFILES = {
  [SECTOR.TYPES.GENERIC]: {
    stars: 1.0,
    asteroids: 1.0,
    scanPoints: 1.0,
    hazards: 1.0
  },
  [SECTOR.TYPES.DEAD_QUIET]: {
    stars: 0.2,
    asteroids: 0.1,
    scanPoints: 0.2,
    hazards: 0.3
  },
  [SECTOR.TYPES.DERELICT_FIELD]: {
    stars: 0.8,
    asteroids: 1.4,
    scanPoints: 0.8,
    hazards: 1.2
  },
  [SECTOR.TYPES.ANOMALY]: {
    stars: 0.6,
    asteroids: 0.6,
    scanPoints: 1.2,
    hazards: 1.5
  },
  [SECTOR.TYPES.ECHO]: {
    stars: 1.0,
    asteroids: 1.0,
    scanPoints: 0.9,
    hazards: 1.0
  },
  [SECTOR.TYPES.SIGNAL_ORIGIN]: {
    stars: 0.4,
    asteroids: 0.05,
    scanPoints: 0.2,
    hazards: 0.6
  }
};

// Audio file map and music playlist.
const AUDIO = {
  SOUNDS: {
    start_game: { src: "assets/sounds/mp3/start_game.mp3", volume: 0.9 },
    laser: { src: "assets/sounds/mp3/laser.mp3", volume: 0.13 },
    enemy_laser: { src: "assets/sounds/mp3/laser.mp3", volume: 0.06},
    explosion: { src: "assets/sounds/mp3/explosion.mp3", volume: 0.75 },
    lost_life: { src: "assets/sounds/mp3/lost_life.mp3", volume: 0.9 },
    got_fuel: { src: "assets/sounds/mp3/got_fuel.mp3", volume: 0.8 },
    got_money: { src: "assets/sounds/mp3/got_money.mp3", volume: 0.85 },
    bought: { src: "assets/sounds/mp3/bought.mp3", volume: 0.85 },
    at_station: { src: "assets/sounds/mp3/at_station.mp3", volume: 0.45 },
    got_gate: { src: "assets/sounds/mp3/got_gate.mp3", volume: 1 },
    got_survey: { src: "assets/sounds/mp3/got_survey.mp3", volume: 0.7 },
    game_over: { src: "assets/sounds/mp3/game_over.mp3", volume: 0.6 },
    thrust: { src: "assets/sounds/mp3/thrust.mp3", volume: 0.4 },
    thrust_rotate: { src: "assets/sounds/mp3/thrust.mp3", volume: 0 }
  },
  MUSIC: {
    TRACKS: [
      "assets/sounds/mp3/1. failed_before.mp3",
      "assets/sounds/mp3/2. remind_me_later.mp3",
      "assets/sounds/mp3/3. take_it_easy.mp3",
      "assets/sounds/mp3/4. where_the_time_goes.mp3",
      "assets/sounds/mp3/5. the_noise_in_my_head.mp3",
      "assets/sounds/mp3/6. noonquil.mp3"
    ],
    VOLUME: 0.45
  }
};

const CONFIG = {
  STORAGE,
  DEBUG,
  CAMERA,
  GAMEPLAY,
  SCORE,
  RESOURCE,
  UPGRADES,
  BEACON,
  CALIBRATION,
  STATION,
  BACKGROUND,
  EFFECTS,
  INPUT,
  AUTOPILOT,
  HUD,
  UI,
  PHYSICS,
  BULLET,
  SHIP,
  ENEMY,
  PICKUPS,
  BEACON_RELIC,
  GOAL,
  END_ZONE,
  ASTEROID,
  STAR,
  FIELD,
  RIVER,
  SECTOR,
  AUDIO
};
window.CONFIG = CONFIG;
})();
// ===== FILE: src/game/audio.js =====
(function(){
"use strict";

const SOUND_DEFS = CONFIG.AUDIO.SOUNDS;

const clampVolume = (value) => Math.max(0, Math.min(1, value));

class SoundManager {
  constructor(defs) {
    this.defs = defs;
    this.pool = new Map();
    this.loopHandles = new Map();
    this.preloaded = false;
    this.muted = false;
    this.mutedKeys = new Set();
  }

  preload() {
    if (this.preloaded) {
      return;
    }
    for (const [key, def] of Object.entries(this.defs)) {
      const audio = new Audio(def.src);
      audio.preload = "auto";
      audio.volume = clampVolume(def.volume ?? 1);
      this.pool.set(key, [audio]);
    }
    this.preloaded = true;
  }

  play(key) {
    const def = this.defs[key];
    if (!def) {
      return;
    }
    if (this.muted || this.mutedKeys.has(key)) {
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
    audio.volume = clampVolume(def.volume ?? 1);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  startLoop(key, segmentSeconds = 0.4, crossfadeSeconds = 0.16) {
    if (this.muted || this.mutedKeys.has(key)) {
      return;
    }
    if (this.loopHandles.has(key)) {
      return;
    }
    const def = this.defs[key];
    if (!def) {
      return;
    }
    const volume = clampVolume(def.volume ?? 1);
    const fadeMs = Math.max(20, crossfadeSeconds * 1000);
    const segmentMs = Math.max(100, segmentSeconds * 1000);
    const intervalMs = Math.max(40, segmentMs - fadeMs);

    const makeAudio = () => {
      const audio = new Audio(def.src);
      audio.preload = "auto";
      audio.volume = clampVolume(volume);
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
        audio.volume = clampVolume(from + (to - from) * t);
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
      audio.volume = fadeIn ? 0 : clampVolume(volume);
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
        audio.volume = clampVolume(volume);
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
        a.volume = clampVolume(volume);
        b.volume = clampVolume(volume);
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

  setMuted(muted) {
    const next = Boolean(muted);
    if (this.muted === next) {
      return;
    }
    this.muted = next;
    if (this.muted) {
      for (const key of this.loopHandles.keys()) {
        this.stopLoop(key);
      }
    }
  }

  setKeyMuted(key, muted) {
    if (!key) {
      return;
    }
    if (muted) {
      this.mutedKeys.add(key);
      this.stopLoop(key);
    } else {
      this.mutedKeys.delete(key);
    }
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

const music = new MusicManager(
  CONFIG.AUDIO.MUSIC.TRACKS,
  CONFIG.AUDIO.MUSIC.VOLUME
);
window.sounds = sounds;
window.music = music;
})();
// ===== FILE: src/entities/ship.js =====
(function(){
"use strict";


const { SHIP } = CONFIG;
const ROT_SPEED = SHIP.ROT_SPEED;     // radians/sec
const THRUST = SHIP.THRUST;
const MAX_FUEL = SHIP.MAX_FUEL;
const THRUST_FUEL_RATE = SHIP.THRUST_FUEL_RATE;
const ROT_FUEL_RATE = SHIP.ROT_FUEL_RATE;

const SHIP_SPRITE = new Image();
SHIP_SPRITE.src = SHIP.SPRITE_SRC;
const SHIP_DRAW_SIZE = SHIP.DRAW_SIZE;
const THRUST_LOOP_SEGMENT = SHIP.THRUST_LOOP_SEGMENT;
const THRUST_LOOP_CROSSFADE = SHIP.THRUST_LOOP_CROSSFADE;
const THRUST_VISUAL = SHIP.THRUST_VISUAL;

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
    const controlsDisabled = Boolean(input?.disableControls);
    if (controlsDisabled) {
      this.thrusting = 0;
      this.kickTimer = 0;
      this.stopThrustLoop();
      this.stopRotateLoop();
      return;
    }
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
// ===== FILE: src/entities/enemyShip.js =====
(function(){
"use strict";

const { ENEMY } = CONFIG;
const ENEMY_ROT_SPEED = ENEMY.ROT_SPEED;
const ENEMY_THRUST = ENEMY.THRUST;
const ENEMY_MAX_SPEED = ENEMY.MAX_SPEED;
const ENEMY_STRAFE_RANGE = ENEMY.STRAFE_RANGE;
const ENEMY_STRAFE_BUFFER = ENEMY.STRAFE_BUFFER;
const ENEMY_DRAW_SIZE = ENEMY.DRAW_SIZE;
const ENEMY_SPRITE = new Image();
ENEMY_SPRITE.src = ENEMY.SPRITE_SRC;

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
// ===== FILE: src/entities/beaconRelic.js =====
(function(){
"use strict";

const { BEACON_RELIC } = CONFIG;
const BEACON_SPRITE = new Image();
BEACON_SPRITE.src = BEACON_RELIC.SPRITE_SRC;

class BeaconRelic {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.size = Number.isFinite(options.size) ? options.size : BEACON_RELIC.SIZE;
    this.shimmerPhase = Number.isFinite(options.shimmerPhase) ? options.shimmerPhase : 0;
    this.shimmerSpeed = Number.isFinite(options.shimmerSpeed) ? options.shimmerSpeed : BEACON_RELIC.SHIMMER_SPEED;
  }

  update(dt) {
    this.shimmerPhase += dt * this.shimmerSpeed;
  }

  draw(ctx) {
    const size = this.size;
    ctx.save();
    ctx.translate(this.x, this.y);

    const sprite = BEACON_SPRITE;
    if (sprite.complete && sprite.naturalWidth > 0) {
      ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = "rgba(12, 16, 20, 0.9)";
      ctx.strokeStyle = "rgba(120, 200, 190, 0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-size * 0.35, -size * 0.45);
      ctx.lineTo(size * 0.28, -size * 0.5);
      ctx.lineTo(size * 0.5, -size * 0.1);
      ctx.lineTo(size * 0.35, size * 0.45);
      ctx.lineTo(-size * 0.15, size * 0.35);
      ctx.lineTo(-size * 0.48, -size * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    const pulse = 0.35 + 0.3 * Math.sin(this.shimmerPhase * Math.PI * 2);
    ctx.globalCompositeOperation = "lighter";
    const glow = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size * 0.8);
    glow.addColorStop(0, `rgba(160, 220, 205, ${0.25 * pulse})`);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
window.BeaconRelic = BeaconRelic;
})();
// ===== FILE: src/entities/upgradeStation.js =====
(function(){
"use strict";

const { STATION } = CONFIG;
const STATION_SPRITE = new Image();
STATION_SPRITE.src = STATION.SPRITE_SRC;

class UpgradeStation {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.id = options.id ?? `${x},${y}`;
    this.safeRadius = options.safeRadius ?? STATION.SAFE_ZONE_RADIUS;
    this.dockRadius = options.dockRadius ?? STATION.DOCK_RADIUS;
    this.isStartStation = Boolean(options.isStartStation);
    this.tierCap = options.tierCap ?? null;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const baseSize = Math.max(70, this.safeRadius * 0.8);
    const scaleFactor = STATION.SPRITE_SCALE ?? 1;
    const size = baseSize * scaleFactor;
    if (STATION_SPRITE.complete && STATION_SPRITE.naturalWidth > 0) {
      const scale = size / STATION_SPRITE.naturalWidth;
      const drawW = STATION_SPRITE.naturalWidth * scale;
      const drawH = STATION_SPRITE.naturalHeight * scale;
      ctx.drawImage(STATION_SPRITE, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = "rgba(80, 200, 140, 0.85)";
      ctx.strokeStyle = "rgba(180, 255, 210, 0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 32 * scaleFactor, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    const period = STATION.WAVE_PERIOD ?? 2.4;
    const expand = STATION.WAVE_EXPAND_RATIO ?? 0.2;
    const alpha = STATION.WAVE_ALPHA ?? 0.22;
    const startRadius = size * 0.55;
    for (let i = 0; i < 2; i++) {
      const phase = ((performance.now() / 1000) / period + i * 0.5) % 1;
      const radius = startRadius * (1 + expand * phase);
      const fade = Math.pow(1 - phase, 2) * alpha;
      if (fade <= 0.01) {
        continue;
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(130, 240, 200, ${fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}
window.UpgradeStation = UpgradeStation;
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
// ===== FILE: src/entities/star.js =====
(function(){
"use strict";

const { STAR } = CONFIG;
const STAR_SPRITES = {
  yellow: new Image(),
  red: new Image(),
  blue: new Image()
};
STAR_SPRITES.yellow.src = STAR.SPRITES.yellow;
STAR_SPRITES.red.src = STAR.SPRITES.red;
STAR_SPRITES.blue.src = STAR.SPRITES.blue;

const DEFAULTS = STAR.DEFAULTS;

class Star {
  constructor(x, y, options = {}) {
    const opts = typeof options === "number" ? { mass: options } : options;
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.motion = opts.motion ?? null;
    this.mass = opts.mass ?? DEFAULTS.MASS;
    this.radius = opts.bodyRadius ?? DEFAULTS.BODY_RADIUS;
    this.bodyColor = opts.bodyColor ?? DEFAULTS.BODY_COLOR;
    this.wellFill = opts.wellFill ?? DEFAULTS.WELL_FILL;
    this.wellStroke = opts.wellStroke ?? DEFAULTS.WELL_STROKE;
    this.minimapColor = opts.minimapColor ?? DEFAULTS.MINIMAP_COLOR;
    this.spriteKey = opts.spriteKey ?? DEFAULTS.SPRITE_KEY;
    this.gravityRadius = opts.gravityRadius ?? (this.radius * DEFAULTS.GRAVITY_RADIUS_MULTIPLIER);
    this.rotation = opts.rotation ?? 0;
    this.rotationSpeed = opts.rotationSpeed ?? 0;
    this.pulsePhase = opts.pulsePhase ?? Math.random() * Math.PI * 2;
    this.pulseSpeed = opts.pulseSpeed ?? DEFAULTS.PULSE_SPEED;
    this.pulseAmount = opts.pulseAmount ?? DEFAULTS.PULSE_AMOUNT;
    this.pulseScale = 1;
  }

  update(dt, timeSeconds = null) {
    this.rotation += this.rotationSpeed * dt;
    this.pulsePhase += this.pulseSpeed * dt;
    this.pulseScale = 1 + Math.sin(this.pulsePhase) * this.pulseAmount;
    if (this.motion && Number.isFinite(timeSeconds)) {
      if (this.motion.type === "orbit") {
        const angle = (this.motion.phase ?? 0) + timeSeconds * (this.motion.angularSpeed ?? 0);
        const radius = this.motion.radius ?? 0;
        const center = this.motion.center ?? { x: this.baseX, y: this.baseY };
        this.x = center.x + Math.cos(angle) * radius;
        this.y = center.y + Math.sin(angle) * radius;
      }
    } else {
      this.x = this.baseX;
      this.y = this.baseY;
    }
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
// ===== FILE: src/entities/goal.js =====
(function(){
"use strict";

const { GOAL } = CONFIG;

class Goal {
  constructor(x, y, width, height, options = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = new Image();
    this.sprite.src = GOAL.SPRITE_SRC;
    const rotation = Number.isFinite(options.rotation)
      ? options.rotation
      : Math.random() * Math.PI * 2;
    const speed = Number.isFinite(options.rotationSpeed)
      ? Math.abs(options.rotationSpeed)
      : GOAL.ROT_SPEED_MIN + Math.random() * (GOAL.ROT_SPEED_MAX - GOAL.ROT_SPEED_MIN);
    this.rotation = rotation;
    this.rotationSpeed = Number.isFinite(options.rotationSpeed)
      ? options.rotationSpeed
      : (Math.random() < 0.5 ? -1 : 1) * speed;
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

const { END_ZONE } = CONFIG;
const SCAN_SPRITE = new Image();
SCAN_SPRITE.src = END_ZONE.SPRITE_SRC;
const SCAN_ROT_SPEED = END_ZONE.ROT_SPEED;
const SCAN_PULSE_SPEED = END_ZONE.PULSE_SPEED;
const SCAN_PULSE_AMOUNT = END_ZONE.PULSE_AMOUNT;

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
// ===== FILE: src/entities/asteroid.js =====
(function(){
"use strict";

const { ASTEROID } = CONFIG;
const ASTEROID_SPRITE = new Image();
ASTEROID_SPRITE.src = ASTEROID.SPRITE_SRC;
const ASTEROID_CHUNK_SPRITE = new Image();
ASTEROID_CHUNK_SPRITE.src = ASTEROID.CHUNK_SPRITE_SRC;
const ASTEROID_ROT_SPEED_MIN = ASTEROID.ROT_SPEED_MIN;
const ASTEROID_ROT_SPEED_MAX = ASTEROID.ROT_SPEED_MAX;

class Asteroid {
  constructor(
    x,
    y,
    vx,
    vy,
    radius = 16,
    rotation = 0,
    rotationSpeed = null,
    spriteKey = "asteroid",
    options = {}
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.rotation = rotation;
    this.spriteKey = spriteKey;
    this.generation = Number.isFinite(options.generation) ? options.generation : 0;
    this.isFragment = Boolean(options.isFragment);
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
// ===== FILE: src/game/rng.js =====
(function(){
"use strict";
function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashInts(...values) {
  let hash = 2166136261;
  for (const value of values) {
    let v = value | 0;
    hash ^= v;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed) {
  return mulberry32(seed);
}

function randomRange(rng, min, max) {
  return min + (max - min) * rng();
}

function randomInt(rng, min, maxInclusive) {
  return Math.floor(randomRange(rng, min, maxInclusive + 1));
}

function pickWeighted(rng, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) {
    return entries[0]?.id ?? null;
  }
  let roll = rng() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry.id;
    }
  }
  return entries[entries.length - 1]?.id ?? null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
window.hashInts = hashInts;
window.createRng = createRng;
window.randomRange = randomRange;
window.randomInt = randomInt;
window.pickWeighted = pickWeighted;
window.clamp = clamp;
})();
// ===== FILE: src/game/sectorIndex.js =====
(function(){
"use strict";

const SECTOR_INDEX_KEY = CONFIG.STORAGE.SECTOR_INDEX_KEY;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getSectorKey(sx, sy) {
  return `${sx},${sy}`;
}

function loadSectorIndex() {
  try {
    const stored = localStorage.getItem(SECTOR_INDEX_KEY);
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    return isPlainObject(parsed) ? parsed : {};
  } catch (err) {
    return {};
  }
}

function saveSectorIndex(index) {
  try {
    const payload = isPlainObject(index) ? index : {};
    localStorage.setItem(SECTOR_INDEX_KEY, JSON.stringify(payload));
  } catch (err) {
    // Ignore storage failures.
  }
}

function resetSectorIndex() {
  const empty = {};
  saveSectorIndex(empty);
  return empty;
}

function getSectorMeta(index, sx, sy) {
  if (!isPlainObject(index)) {
    return null;
  }
  return index[getSectorKey(sx, sy)] ?? null;
}

function setSectorMeta(index, sx, sy, meta) {
  if (!isPlainObject(index)) {
    return meta;
  }
  index[getSectorKey(sx, sy)] = meta;
  return meta;
}
window.getSectorKey = getSectorKey;
window.loadSectorIndex = loadSectorIndex;
window.saveSectorIndex = saveSectorIndex;
window.resetSectorIndex = resetSectorIndex;
window.getSectorMeta = getSectorMeta;
window.setSectorMeta = setSectorMeta;
})();
// ===== FILE: src/game/gameState.js =====
(function(){
"use strict";

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

function createDefaultGameState(seed = generateSeed()) {
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

function normalizeGameState(raw) {
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

function loadGameState() {
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

function saveGameState(state) {
  try {
    const normalized = normalizeGameState(state);
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(normalized));
  } catch (err) {
    // Ignore storage failures.
  }
}

function resetGameState() {
  const next = createDefaultGameState(generateSeed());
  saveGameState(next);
  return next;
}
window.createDefaultGameState = createDefaultGameState;
window.normalizeGameState = normalizeGameState;
window.loadGameState = loadGameState;
window.saveGameState = saveGameState;
window.resetGameState = resetGameState;
})();
// ===== FILE: src/game/riverNetwork.js =====
(function(){
"use strict";


function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function intersectsRect(a, b) {
  return !(
    a.x + a.width < b.x
    || a.x > b.x + b.width
    || a.y + a.height < b.y
    || a.y > b.y + b.height
  );
}

function computeBounds(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function closestDistanceToPolyline(points, pos) {
  let best = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = pos.x - a.x;
    const apy = pos.y - a.y;
    const denom = abx * abx + aby * aby;
    let t = denom === 0 ? 0 : (apx * abx + apy * aby) / denom;
    t = clampValue(t, 0, 1);
    const cx = a.x + abx * t;
    const cy = a.y + aby * t;
    const dist = Math.hypot(pos.x - cx, pos.y - cy);
    if (dist < best) {
      best = dist;
    }
  }
  return best;
}

function getFieldType(worldSeed, sx, sy) {
  const fieldSize = CONFIG.FIELD.SIZE_SECTORS;
  const fx = Math.floor(sx / fieldSize);
  const fy = Math.floor(sy / fieldSize);
  const seed = hashInts(worldSeed, fx, fy, CONFIG.SECTOR.SEED_SALT.FIELD);
  const rng = createRng(seed);
  const types = Object.values(CONFIG.FIELD.TYPES);
  return types[randomInt(rng, 0, types.length - 1)];
}

function getAnchorCandidates(worldSeed, pos, radiusWorld) {
  const anchors = [];
  const cellSize = CONFIG.RIVER.ANCHOR.CELL_SIZE_SECTORS * CONFIG.SECTOR.SIZE;
  const minX = Math.floor((pos.x - radiusWorld) / cellSize);
  const maxX = Math.floor((pos.x + radiusWorld) / cellSize);
  const minY = Math.floor((pos.y - radiusWorld) / cellSize);
  const maxY = Math.floor((pos.y + radiusWorld) / cellSize);

  for (let cx = minX; cx <= maxX; cx++) {
    for (let cy = minY; cy <= maxY; cy++) {
      const seed = hashInts(worldSeed, cx, cy, CONFIG.SECTOR.SEED_SALT.ANCHOR);
      const rng = createRng(seed);
      const baseX = (cx + 0.5) * cellSize;
      const baseY = (cy + 0.5) * cellSize;
      const jitter = cellSize * 0.25;
      const ax = baseX + (rng() - 0.5) * jitter;
      const ay = baseY + (rng() - 0.5) * jitter;
      const dist = Math.hypot(ax - pos.x, ay - pos.y);
      if (dist <= radiusWorld) {
        anchors.push({
          id: seed,
          x: ax,
          y: ay
        });
      }
    }
  }
  return anchors;
}

function snapAnchor(worldSeed, point, radiusWorld) {
  const anchors = getAnchorCandidates(worldSeed, point, radiusWorld);
  if (anchors.length === 0) {
    return null;
  }
  let best = anchors[0];
  let bestDist = Math.hypot(best.x - point.x, best.y - point.y);
  for (let i = 1; i < anchors.length; i++) {
    const current = anchors[i];
    const dist = Math.hypot(current.x - point.x, current.y - point.y);
    if (dist < bestDist) {
      best = current;
      bestDist = dist;
    }
  }
  return best;
}

function trimPolylineToBounds(points, bounds, margin) {
  if (!points || points.length < 2) {
    return null;
  }
  const trimmed = [];
  let wasInside = false;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const inside = (
      p.x >= bounds.x - margin
      && p.x <= bounds.x + bounds.size + margin
      && p.y >= bounds.y - margin
      && p.y <= bounds.y + bounds.size + margin
    );
    if (inside) {
      if (!wasInside && i > 0) {
        trimmed.push(points[i - 1]);
      }
      trimmed.push(p);
    } else if (wasInside) {
      trimmed.push(p);
    }
    wasInside = inside;
  }
  return trimmed.length >= 2 ? trimmed : null;
}

function buildBackbone(worldSeed, worldAgeTicks, cellX, cellY, density) {
  const seed = hashInts(worldSeed, cellX, cellY, CONFIG.SECTOR.SEED_SALT.RIVER);
  const rng = createRng(seed);
  if (rng() > density) {
    return null;
  }
  const cellSize = CONFIG.FIELD.SIZE_SECTORS * CONFIG.SECTOR.SIZE;
  const centerX = (cellX + 0.5) * cellSize + (rng() - 0.5) * cellSize * 0.4;
  const centerY = (cellY + 0.5) * cellSize + (rng() - 0.5) * cellSize * 0.4;
  const angle = rng() * Math.PI * 2;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  const width = CONFIG.RIVER.WIDTH_MIN + rng() * (CONFIG.RIVER.WIDTH_MAX - CONFIG.RIVER.WIDTH_MIN);
  const phase = rng() * Math.PI * 2;
  const spanCells = CONFIG.RIVER.BACKBONE_SPAN_CELLS;
  const halfLength = cellSize * spanCells;
  const spacing = CONFIG.RIVER.POLYLINE_SPACING;
  const count = Math.max(2, Math.ceil((halfLength * 2) / spacing));
  const points = [];

  for (let i = 0; i <= count; i++) {
    const t = -halfLength + i * spacing;
    const baseX = centerX + dirX * t;
    const baseY = centerY + dirY * t;
    const driftPhase = worldAgeTicks * CONFIG.RIVER.DRIFT_RATE + phase + t * 0.0006;
    const drift = Math.sin(driftPhase) * CONFIG.RIVER.DRIFT_AMPLITUDE;
    const px = baseX + -dirY * drift;
    const py = baseY + dirX * drift;
    points.push({ x: px, y: py });
  }

  return {
    id: seed,
    width,
    points
  };
}

function scoreSegment(segment, bounds, shipPos) {
  const centerX = bounds.x + bounds.size / 2;
  const centerY = bounds.y + bounds.size / 2;
  const center = shipPos ?? { x: centerX, y: centerY };
  const points = segment.points;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x >= bounds.x && p.x <= bounds.x + bounds.size && p.y >= bounds.y && p.y <= bounds.y + bounds.size) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }
  let spanScore = 0;
  if (minX !== Infinity) {
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    spanScore = Math.max(spanX, spanY) / bounds.size;
  }
  const centerDist = closestDistanceToPolyline(points, { x: centerX, y: centerY });
  if (centerDist <= bounds.size * 0.18) {
    spanScore += 0.35;
  }
  const distToShip = closestDistanceToPolyline(points, center);
  return spanScore * 1000 - distToShip * 0.1 + segment.width * 0.5;
}

function getRiversForSector(
  worldSeed,
  worldAgeTicks,
  sectorX,
  sectorY,
  bounds,
  fieldType = null,
  shipPos = null
) {
  const resolvedField = fieldType ?? getFieldType(worldSeed, sectorX, sectorY);
  const baseDensity = clampValue(
    CONFIG.RIVER.WORLD_DENSITY + (resolvedField === CONFIG.FIELD.TYPES.SPARSE_VOID ? CONFIG.RIVER.CHANNEL_SECTOR_BIAS : 0),
    0,
    1
  );
  const cellSize = CONFIG.FIELD.SIZE_SECTORS * CONFIG.SECTOR.SIZE;
  const cellX = Math.floor((bounds.x + bounds.size / 2) / cellSize);
  const cellY = Math.floor((bounds.y + bounds.size / 2) / cellSize);
  const baseSpan = CONFIG.RIVER.BACKBONE_SPAN_CELLS + 1;
  const minPerSector = Math.max(0, CONFIG.RIVER.MIN_PER_SECTOR ?? 0);
  const candidates = new Map();

  const collectCandidates = (density, spanBonus) => {
    const span = baseSpan + spanBonus;
    for (let dx = -span; dx <= span; dx++) {
      for (let dy = -span; dy <= span; dy++) {
        const backbone = buildBackbone(worldSeed, worldAgeTicks, cellX + dx, cellY + dy, density);
        if (!backbone) {
          continue;
        }
        const halfW = backbone.width / 2;
        const trimmed = trimPolylineToBounds(backbone.points, bounds, halfW + 200);
        if (!trimmed) {
          continue;
        }
        const anchorRadius = CONFIG.RIVER.ANCHOR.SEARCH_RADIUS * CONFIG.SECTOR.SIZE;
        const headAnchor = snapAnchor(worldSeed, trimmed[0], anchorRadius);
        const tailAnchor = snapAnchor(worldSeed, trimmed[trimmed.length - 1], anchorRadius);
        if (headAnchor) {
          trimmed[0] = { x: headAnchor.x, y: headAnchor.y };
        }
        if (tailAnchor) {
          trimmed[trimmed.length - 1] = { x: tailAnchor.x, y: tailAnchor.y };
        }
        const bbox = computeBounds(trimmed);
        const segment = {
          id: `${backbone.id}:${sectorX},${sectorY}`,
          backboneId: backbone.id,
          width: backbone.width,
          strength: null,
          points: trimmed,
          bbox,
          anchors: [headAnchor, tailAnchor].filter(Boolean)
        };
        segment.score = scoreSegment(segment, bounds, shipPos);
        if (!candidates.has(segment.id)) {
          candidates.set(segment.id, segment);
        }
      }
    }
  };

  collectCandidates(baseDensity, 0);
  if (minPerSector > 0 && candidates.size < minPerSector) {
    collectCandidates(1, 2);
  }

  if (candidates.size === 0) {
    return [];
  }

  const ordered = [...candidates.values()];
  ordered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.width !== a.width) return b.width - a.width;
    return String(a.backboneId).localeCompare(String(b.backboneId));
  });

  const maxPerSector = Math.max(CONFIG.RIVER.PER_SECTOR_MAX, minPerSector);
  const picked = ordered.slice(0, maxPerSector);
  return picked;
}

function getFieldTypeForSector(worldSeed, sx, sy) {
  return getFieldType(worldSeed, sx, sy);
}

function filterRiversByView(rivers, viewRect) {
  if (!Array.isArray(rivers) || rivers.length === 0) {
    return [];
  }
  const margin = CONFIG.RIVER.WIDTH_MAX * 0.6;
  const view = {
    x: viewRect.x - margin,
    y: viewRect.y - margin,
    width: viewRect.width + margin * 2,
    height: viewRect.height + margin * 2
  };
  return rivers.filter((segment) => {
    if (!segment?.bbox) {
      return true;
    }
    return intersectsRect(segment.bbox, view);
  });
}
window.getRiversForSector = getRiversForSector;
window.getFieldTypeForSector = getFieldTypeForSector;
window.filterRiversByView = filterRiversByView;
})();
// ===== FILE: src/game/stationSystem.js =====
(function(){
"use strict";


const { STATION, SECTOR, GOAL, BEACON } = CONFIG;
const GRID_SIZE = STATION.UNIQUE_GRID_SIZE;

function getStationSeed(worldSeed, sx, sy) {
  return hashInts(worldSeed, sx, sy, SECTOR.SEED_SALT.STATION);
}

function getStationChance(ring) {
  const base = STATION.PLACEMENT_CHANCE_BASE;
  const scale = STATION.PLACEMENT_CHANCE_RING_SCALE;
  return clamp(base + ring * scale, 0, 0.4);
}

function getStationInfoForSector(worldSeed, sx, sy, ring) {
  if (sx === 0 && sy === 0) {
    return {
      hasStation: true,
      stationId: `start-${worldSeed}`,
      isStartStation: true,
      tierCap: STATION.START_STATION_TIER_CAP
    };
  }
  const gx = Math.floor(sx / GRID_SIZE);
  const gy = Math.floor(sy / GRID_SIZE);
  const gridSeed = hashInts(worldSeed, gx, gy, SECTOR.SEED_SALT.STATION);
  const rng = createRng(gridSeed);
  if (rng() > getStationChance(ring)) {
    return {
      hasStation: false
    };
  }
  const offsetX = randomInt(rng, 0, GRID_SIZE - 1);
  const offsetY = randomInt(rng, 0, GRID_SIZE - 1);
  const stationSx = gx * GRID_SIZE + offsetX;
  const stationSy = gy * GRID_SIZE + offsetY;
  if (stationSx !== sx || stationSy !== sy) {
    return {
      hasStation: false
    };
  }
  return {
    hasStation: true,
    stationId: `${gridSeed}:${stationSx},${stationSy}`,
    isStartStation: false,
    tierCap: null
  };
}

function pickStationPosition(rng, bounds, safePoint, safeRadius, beaconPos = null) {
  const margin = GOAL.MARGIN;
  let pos = null;
  for (let tries = 0; tries < 30; tries++) {
    const candidate = {
      x: randomRange(rng, bounds.x + margin, bounds.x + bounds.size - margin),
      y: randomRange(rng, bounds.y + margin, bounds.y + bounds.size - margin)
    };
    if (safePoint) {
      const dx = candidate.x - safePoint.x;
      const dy = candidate.y - safePoint.y;
      if (Math.hypot(dx, dy) < safeRadius + STATION.SAFE_ZONE_RADIUS) {
        continue;
      }
    }
    if (beaconPos) {
      const dx = candidate.x - beaconPos.x;
      const dy = candidate.y - beaconPos.y;
      const minDist = BEACON.MIN_STAR_DIST + STATION.SAFE_ZONE_RADIUS;
      if (Math.hypot(dx, dy) < minDist) {
        continue;
      }
    }
    pos = candidate;
    break;
  }
  if (!pos) {
    pos = {
      x: bounds.x + bounds.size * 0.5 + (rng() - 0.5) * bounds.size * 0.1,
      y: bounds.y + bounds.size * 0.5 + (rng() - 0.5) * bounds.size * 0.1
    };
  }
  return pos;
}
window.getStationInfoForSector = getStationInfoForSector;
window.pickStationPosition = pickStationPosition;
})();
// ===== FILE: src/game/sectorManager.js =====
(function(){
"use strict";










const SECTOR_SIZE = CONFIG.SECTOR.SIZE;
const SECTOR_TYPES = CONFIG.SECTOR.TYPES;

const { SECTOR, STAR: STAR_CONFIG, ASTEROID, GOAL, END_ZONE, FIELD, STATION } = CONFIG;
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
const STATION_SAFE_RADIUS = STATION.SAFE_ZONE_RADIUS;
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
  const sectorCenter = {
    x: bounds.x + bounds.size / 2,
    y: bounds.y + bounds.size / 2
  };
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
      const centerDx = candidate.x - sectorCenter.x;
      const centerDy = candidate.y - sectorCenter.y;
      if (Math.hypot(centerDx, centerDy) < gravityRadius) {
        continue;
      }
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

function generateEndZone(rng, bounds, goalX, goalY, station = null) {
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
    if (station) {
      const sx = x - station.x;
      const sy = y - station.y;
      if (Math.hypot(sx, sy) < STATION_SAFE_RADIUS) {
        continue;
      }
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

function generateGoal(rng, bounds, stars, safePoint, safeRadius, anchor = null, station = null) {
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
    if (station) {
      const sx = gx - station.x;
      const sy = gy - station.y;
      if (Math.hypot(sx, sy) < STATION_SAFE_RADIUS) {
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

    asteroids.push(new Asteroid(pos.x, pos.y, vx, vy, radius, rotation, rotationSpeed, "asteroid", {
      generation: 0,
      isFragment: false
    }));
  }
  return asteroids;
}

class SectorManager {
  constructor(options = {}) {
    const opts = options ?? {};
    this.current = null;
    this.sectors = new Map();
    this.worldSeed = Number.isFinite(opts.worldSeed) ? opts.worldSeed : 0;
    this.sectorIndex = opts.sectorIndex ?? {};
    this.gameState = opts.gameState ?? null;
    this.persist = opts.persist !== false;
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
    const stationInfo = getStationInfoForSector(this.worldSeed, sx, sy, ring);
    if (normalized.hasStation === undefined) {
      normalized.hasStation = Boolean(stationInfo?.hasStation);
      updated = true;
    }
    if (normalized.hasStation) {
      if (!normalized.stationId && stationInfo?.stationId) {
        normalized.stationId = stationInfo.stationId;
        updated = true;
      }
      if (normalized.stationTierCap === undefined) {
        normalized.stationTierCap = stationInfo?.tierCap ?? null;
        updated = true;
      }
      if (!normalized.stationPos) {
        const rng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.STATION));
        normalized.stationPos = pickStationPosition(
          rng,
          this.getBounds(sx, sy),
          safePoint,
          safeRadius,
          normalized.beaconPosition
        );
        updated = true;
      }
      if (normalized.stationDiscovered === undefined) {
        normalized.stationDiscovered = Boolean(stationInfo?.isStartStation);
        updated = true;
      }
    } else {
      if (normalized.stationDiscovered === undefined) {
        normalized.stationDiscovered = false;
        updated = true;
      }
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
      if (this.persist) {
        saveSectorIndex(this.sectorIndex);
      }
    }
    return normalized;
  }

  createSectorMeta(sx, sy, ring, safePoint, safeRadius) {
    const existing = getSectorMeta(this.sectorIndex, sx, sy);
    const existingHasType = Object.values(SECTOR_TYPES).includes(existing?.sectorType);
    if (existing && existingHasType) {
      return this.normalizeSectorMeta(existing, sx, sy, ring, safePoint, safeRadius);
    }
    const priorStation = existingHasType ? null : existing;

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
    const stationInfo = getStationInfoForSector(this.worldSeed, sx, sy, ring);
    const hasStation = Boolean(stationInfo?.hasStation);
    const stationId = hasStation ? (priorStation?.stationId ?? stationInfo.stationId) : null;
    const stationTierCap = hasStation ? (priorStation?.stationTierCap ?? stationInfo.tierCap) : null;
    const stationDiscovered = hasStation
      ? Boolean(stationInfo?.isStartStation || priorStation?.stationDiscovered)
      : false;
    const stationPos = hasStation
      ? (priorStation?.stationPos ?? pickStationPosition(
        createRng(this.getSectorSeed(sx, sy, SEED_SALT.STATION)),
        this.getBounds(sx, sy),
        safePoint,
        safeRadius,
        beaconPosition
      ))
      : null;
    const patternId = getPatternBehaviorForField(fieldType);
    const patternParamsSeed = this.getSectorSeed(sx, sy, SEED_SALT.PATTERN);

    const meta = {
      sectorType,
      sectorMood,
      beaconPlaced,
      beaconPosition,
      hasStation,
      stationId,
      stationPos,
      stationDiscovered,
      stationTierCap,
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
      if (this.persist) {
        saveGameState(this.gameState);
      }
    }
    if (this.persist) {
      saveSectorIndex(this.sectorIndex);
    }
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
    const station = meta.hasStation && meta.stationPos
      ? {
        id: meta.stationId ?? `${sx},${sy}`,
        x: meta.stationPos.x,
        y: meta.stationPos.y,
        safeRadius: STATION.SAFE_ZONE_RADIUS,
        colliderRadius: STATION.COLLIDER_RADIUS,
        dockRadius: STATION.DOCK_RADIUS,
        isStartStation: Boolean(meta.stationTierCap === STATION.START_STATION_TIER_CAP),
        tierCap: meta.stationTierCap ?? null,
        discovered: Boolean(meta.stationDiscovered)
      }
      : null;
    const goalAnchor = meta.sectorType === SECTOR_TYPES.SIGNAL_ORIGIN && meta.beaconPosition
      ? { x: meta.beaconPosition.x, y: meta.beaconPosition.y, radius: 520 }
      : null;
    const goalRng = createRng(this.getSectorSeed(sx, sy, SEED_SALT.GOAL));
    const goal = generateGoal(goalRng, bounds, stars, entryOrigin, safeRadius, goalAnchor, station);
    const endZone = generateEndZone(
      createRng(this.getSectorSeed(sx, sy, SEED_SALT.END_ZONE)),
      bounds,
      goal.x,
      goal.y,
      station
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
      station,
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
window.SectorManager = SectorManager;
window.SECTOR_SIZE = SECTOR_SIZE;
window.SECTOR_TYPES = SECTOR_TYPES;
})();
// ===== FILE: src/game/physics.js =====
(function(){
"use strict";

const GRAVITY_G = CONFIG.PHYSICS.GRAVITY_G;
const { SOFTENING, DAMPING } = CONFIG.PHYSICS;

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

function computeStarAccelAt(pos, stars, config = null) {
  const gravityG = config?.PHYSICS?.GRAVITY_G ?? GRAVITY_G;
  const softening = config?.PHYSICS?.SOFTENING ?? SOFTENING;
  let ax = 0;
  let ay = 0;
  for (const star of stars) {
    const dx = star.x - pos.x;
    const dy = star.y - pos.y;
    const r = Math.hypot(dx, dy);
    if (Number.isFinite(star.gravityRadius) && r > star.gravityRadius) {
      continue;
    }

    const r2 = dx * dx + dy * dy + softening * softening;
    const rSoft = Math.sqrt(r2);
    const force = (gravityG * star.mass) / r2;
    ax += (dx / rSoft) * force;
    ay += (dy / rSoft) * force;
  }
  return { ax, ay };
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
window.computeStarAccelAt = computeStarAccelAt;
window.integrate = integrate;
window.applyDamping = applyDamping;
window.GRAVITY_G = GRAVITY_G;
})();
// ===== FILE: src/game/forceFields.js =====
(function(){
"use strict";


function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getRiverStrength(width, riverConfig) {
  const minW = riverConfig.WIDTH_MIN;
  const maxW = riverConfig.WIDTH_MAX;
  const w = clampValue(width, minW, maxW);
  const wn = (w - minW) / Math.max(1, maxW - minW);
  const base = riverConfig.STRENGTH_BASE;
  const multiplier = riverConfig.STRENGTH_MULTIPLIER ?? 1;
  const exponent = riverConfig.STRENGTH_EXPONENT;
  const strength = base * Math.pow(1 / (wn + 0.15), exponent);
  const scaled = strength * multiplier;
  return clampValue(scaled, base * 0.25 * multiplier, base * 6 * multiplier);
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
  return {
    x: ax + abx * t,
    y: ay + aby * t,
    t
  };
}

function findClosestPointOnPolyline(points, pos) {
  let best = null;
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
        tangentX: segX / segLen,
        tangentY: segY / segLen
      };
    }
  }
  return best;
}

function computeStarAccelMagnitude(pos, stars, config = CONFIG) {
  if (!stars || stars.length === 0) {
    return 0;
  }
  const accel = computeStarAccelAt(pos, stars, config);
  return Math.hypot(accel.ax, accel.ay);
}

function computeRiverAccel(pos, rivers, config = CONFIG) {
  if (!Array.isArray(rivers) || rivers.length === 0) {
    return { ax: 0, ay: 0 };
  }
  const riverCfg = config.RIVER;
  let ax = 0;
  let ay = 0;

  for (const river of rivers) {
    const points = river?.points;
    if (!points || points.length < 2) {
      continue;
    }
    const width = Number.isFinite(river.width) ? river.width : riverCfg.WIDTH_MIN;
    const halfW = width / 2;
    const closest = findClosestPointOnPolyline(points, pos);
    if (!closest || closest.dist > halfW) {
      continue;
    }
    const r = closest.dist / halfW;
    const edge = Math.pow(1 - r, riverCfg.EDGE_FALLOFF_POWER);
    const strength = Number.isFinite(river.strength)
      ? river.strength * (riverCfg.STRENGTH_MULTIPLIER ?? 1)
      : getRiverStrength(width, riverCfg);
    ax += closest.tangentX * strength * edge;
    ay += closest.tangentY * strength * edge;
  }

  return { ax, ay };
}

function applyForcesToEntity(entity, dt, stars, rivers, config = CONFIG, flags = {}) {
  if (!entity) {
    return;
  }
  const affectByStars = flags.affectByStars !== false;
  const affectByRivers = flags.affectByRivers !== false;
  let starAccelMag = 0;

  if (affectByRivers) {
    starAccelMag = computeStarAccelMagnitude(entity, stars, config);
  }
  if (affectByStars) {
    applyGravity(entity, stars, dt);
  }
  if (affectByRivers) {
    const riverAccel = computeRiverAccel(entity, rivers, config);
    let ax = riverAccel.ax;
    let ay = riverAccel.ay;
    const mag = Math.hypot(ax, ay);
    if (mag > 0 && starAccelMag > 0) {
      const maxMag = starAccelMag * config.RIVER.VS_STAR_RATIO_MAX;
      if (mag > maxMag) {
        const scale = maxMag / mag;
        ax *= scale;
        ay *= scale;
      }
    }
    if (ax !== 0 || ay !== 0) {
      const timeScale = config.RIVER.TIME_SCALE ?? 1;
      entity.vx += ax * dt * timeScale;
      entity.vy += ay * dt * timeScale;
    }
  }
}
window.computeStarAccelMagnitude = computeStarAccelMagnitude;
window.computeRiverAccel = computeRiverAccel;
window.applyForcesToEntity = applyForcesToEntity;
})();
// ===== FILE: src/ui/shipDestroyedModal.js =====
(function(){
"use strict";
function showShipDestroyedModal(root, _remainingLives, onClose) {
  if (!root) {
    return null;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay ship-destroyed-modal";

  const panel = document.createElement("div");
  panel.className = "ship-destroyed-panel";

  const title = document.createElement("div");
  title.className = "ship-destroyed-title";
  title.textContent = "Ship Destroyed";

  const subtitle = document.createElement("div");
  subtitle.className = "ship-destroyed-subtitle";
  subtitle.textContent = "Press Space to continue";

  panel.appendChild(title);
  panel.appendChild(subtitle);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  let closed = false;
  let canClose = false;
  const unlockTimer = window.setTimeout(() => {
    canClose = true;
  }, 150);

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
    if (!canClose || event.repeat || event.code !== "Space") {
      return;
    }
    event.preventDefault();
    close();
  };

  window.addEventListener("keydown", onKeyDown);

  function cleanup() {
    window.clearTimeout(unlockTimer);
    window.removeEventListener("keydown", onKeyDown);
    overlay.remove();
  }

  return {
    destroy: cleanup,
    close
  };
}
window.showShipDestroyedModal = showShipDestroyedModal;
})();
// ===== FILE: src/ui/upgradeStationModal.js =====
(function(){
"use strict";
function showUpgradeStationModal(root, state, onAction) {
  if (!root) {
    return null;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay upgrade-station-modal";

  const panel = document.createElement("div");
  panel.className = "upgrade-panel";

  const title = document.createElement("div");
  title.className = "upgrade-title";
  title.textContent = "Upgrade Station";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "upgrade-close";
  closeButton.textContent = "Close";
  closeButton.setAttribute("aria-label", "Close upgrade menu");
  closeButton.addEventListener("click", () => {
    if (onAction) {
      onAction("close");
    }
  });

  const currency = document.createElement("div");
  currency.className = "upgrade-currency";

  const tierCap = document.createElement("div");
  tierCap.className = "upgrade-tier";

  const list = document.createElement("div");
  list.className = "upgrade-list";

  const createRow = (label, actionKey) => {
    const row = document.createElement("div");
    row.className = "upgrade-row";

    const name = document.createElement("div");
    name.className = "upgrade-name";
    name.textContent = label;

    const level = document.createElement("div");
    level.className = "upgrade-level";

    const cost = document.createElement("div");
    cost.className = "upgrade-cost";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-button";
    button.textContent = "Purchase";
    button.addEventListener("click", () => {
      if (onAction) {
        onAction(actionKey);
      }
    });

    row.appendChild(name);
    row.appendChild(level);
    row.appendChild(cost);
    row.appendChild(button);

    return { row, level, cost, button };
  };

  const fireRow = createRow("Fire Rate", "fireRate");
  const hullRow = createRow("Hull Strength", "hull");
  const collectorRow = createRow("Collector", "collector");
  const repairRow = createRow("Repair Hull", "repair");

  list.appendChild(fireRow.row);
  list.appendChild(hullRow.row);
  list.appendChild(collectorRow.row);
  list.appendChild(repairRow.row);

  panel.appendChild(title);
  panel.appendChild(closeButton);
  panel.appendChild(currency);
  panel.appendChild(tierCap);
  panel.appendChild(list);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  const update = (next) => {
    const data = next ?? state;
    currency.textContent = `Resource: ${Math.round(data.currency ?? 0)}`;
    tierCap.textContent = data.tierCap ? `Tier cap: ${data.tierCap}` : "Tier cap: none";

    fireRow.level.textContent = `Level ${data.upgrades.fireRateLevel} / ${data.caps.fireRateLevel}`;
    fireRow.cost.textContent = data.costs.fireRate !== null ? `${data.costs.fireRate}` : "MAX";
    fireRow.button.disabled = data.costs.fireRate === null || (data.currency ?? 0) < data.costs.fireRate;

    hullRow.level.textContent = `Level ${data.upgrades.hullLevel} / ${data.caps.hullLevel}`;
    hullRow.cost.textContent = data.costs.hull !== null ? `${data.costs.hull}` : "MAX";
    hullRow.button.disabled = data.costs.hull === null || (data.currency ?? 0) < data.costs.hull;

    collectorRow.level.textContent = `Level ${data.upgrades.collectorLevel} / ${data.caps.collectorLevel}`;
    collectorRow.cost.textContent = data.costs.collector !== null ? `${data.costs.collector}` : "MAX";
    collectorRow.button.disabled = data.costs.collector === null || (data.currency ?? 0) < data.costs.collector;

    const missing = Math.max(0, (data.maxLives ?? 0) - (data.lives ?? 0));
    repairRow.level.textContent = missing > 0 ? `${missing} missing` : "Fully repaired";
    repairRow.cost.textContent = data.costs.repair !== null ? `${data.costs.repair}` : "N/A";
    repairRow.button.disabled = data.costs.repair === null || (data.currency ?? 0) < data.costs.repair;
  };

  update(state);

  function destroy() {
    overlay.remove();
  }

  return {
    update,
    destroy
  };
}
window.showUpgradeStationModal = showUpgradeStationModal;
})();
// ===== FILE: src/game/riverRender.js =====
(function(){
"use strict";


function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mixColor(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function jitterColor(color, seed, amount) {
  const phase = (seed % 997) * 0.017;
  const jitter = amount * 0.5;
  const r = color[0] + Math.sin(phase) * jitter;
  const g = color[1] + Math.sin(phase + 2.1) * jitter;
  const b = color[2] + Math.sin(phase + 4.2) * jitter;
  return [
    clampValue(Math.round(r), 0, 255),
    clampValue(Math.round(g), 0, 255),
    clampValue(Math.round(b), 0, 255)
  ];
}

function rgba(color, alpha) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function drawPolyline(ctx, points) {
  if (!points || points.length < 2) {
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function buildDistances(points) {
  if (!points || points.length === 0) {
    return [];
  }
  const distances = new Array(points.length);
  distances[0] = 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.hypot(dx, dy);
    distances[i] = total;
  }
  return distances;
}

function drawScintillatedLine(ctx, points, distances, baseColor, baseAlpha, timeSeconds, scintillation, direction = 1) {
  if (!points || points.length < 2) {
    return;
  }
  const enabled = scintillation?.ENABLED !== false;
  const strength = clampValue(scintillation?.STRENGTH ?? 0, 0, 1);
  if (!enabled || strength <= 0 || !Number.isFinite(timeSeconds)) {
    ctx.strokeStyle = rgba(baseColor, baseAlpha);
    drawPolyline(ctx, points);
    return;
  }
  const wavelength = Math.max(20, scintillation?.WAVELENGTH ?? 240);
  const rate = scintillation?.RATE ?? 0.2;
  const hueShift = clampValue(scintillation?.HUE_SHIFT ?? 0, 0, 1);
  const phaseBase = timeSeconds * rate * direction;
  for (let i = 1; i < points.length; i++) {
    const dist = distances?.[i] ?? 0;
    const phase = (phaseBase + dist / wavelength) * Math.PI * 2;
    const t = 0.5 + 0.5 * Math.sin(phase);
    const alphaScale = 1 - strength + strength * (0.6 + 0.4 * t);
    const color = hueShift > 0 ? mixColor(baseColor, [255, 255, 255], hueShift * t) : baseColor;
    ctx.strokeStyle = rgba(color, baseAlpha * alphaScale);
    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
}

function buildUndulatedPoints(points, timeSeconds, wave, phaseOffset) {
  if (!points || points.length < 2) {
    return points;
  }
  const amplitude = wave.WAVE_AMPLITUDE ?? 0;
  const length = wave.WAVE_LENGTH ?? 1;
  const speed = wave.WAVE_SPEED ?? 0;
  if (amplitude <= 0 || length <= 0 || !Number.isFinite(timeSeconds)) {
    return points;
  }
  const totalCount = points.length;
  const out = new Array(totalCount);
  let distance = 0;
  out[0] = { x: points[0].x, y: points[0].y };
  for (let i = 1; i < totalCount; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const segLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    distance += segLen;
    const prevIdx = Math.max(0, i - 1);
    const nextIdx = Math.min(totalCount - 1, i + 1);
    const a = points[prevIdx];
    const b = points[nextIdx];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const edgeT = Math.min(i / (totalCount - 1), (totalCount - 1 - i) / (totalCount - 1));
    const edgeScale = clampValue(edgeT / 0.15, 0, 1);
    const phase = (distance / length) * Math.PI * 2 + timeSeconds * speed + phaseOffset;
    const offset = Math.sin(phase) * amplitude * edgeScale;
    out[i] = {
      x: curr.x + nx * offset,
      y: curr.y + ny * offset
    };
  }
  return out;
}

function buildOffsetPoints(points, offset) {
  if (!points || points.length < 2 || offset === 0) {
    return points;
  }
  const totalCount = points.length;
  const out = new Array(totalCount);
  out[0] = { x: points[0].x, y: points[0].y };
  for (let i = 1; i < totalCount; i++) {
    const prevIdx = Math.max(0, i - 1);
    const nextIdx = Math.min(totalCount - 1, i + 1);
    const a = points[prevIdx];
    const b = points[nextIdx];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const edgeT = Math.min(i / (totalCount - 1), (totalCount - 1 - i) / (totalCount - 1));
    const edgeScale = clampValue(edgeT / 0.15, 0, 1);
    const p = points[i];
    out[i] = {
      x: p.x + nx * offset * edgeScale,
      y: p.y + ny * offset * edgeScale
    };
  }
  return out;
}

function collectAnchors(rivers) {
  const anchors = new Map();
  for (const river of rivers) {
    if (!river?.anchors) {
      continue;
    }
    for (const anchor of river.anchors) {
      if (!anchor || anchors.has(anchor.id)) {
        continue;
      }
      anchors.set(anchor.id, { ...anchor });
    }
  }
  return [...anchors.values()];
}

function snapAnchorToStar(anchor, stars) {
  if (!stars || stars.length === 0) {
    return { ...anchor, snapped: false };
  }
  const snapRadius = CONFIG.RIVER.ANCHOR.SNAP_RADIUS;
  let best = null;
  let bestDist = snapRadius;
  for (const star of stars) {
    const dx = anchor.x - star.x;
    const dy = anchor.y - star.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= bestDist) {
      bestDist = dist;
      best = star;
    }
  }
  if (!best) {
    return { ...anchor, snapped: false };
  }
  return {
    ...anchor,
    x: best.x,
    y: best.y,
    snapped: true
  };
}

function anchorHuePhase(anchorId, worldAgeTicks) {
  const base = (anchorId % 997) * 0.013;
  return base + worldAgeTicks * 0.01;
}

function drawRivers(ctx, rivers, viewRect, worldAgeTicks, activeStars = [], timeSeconds = null, highlight = 0) {
  if (!Array.isArray(rivers) || rivers.length === 0) {
    return;
  }

  const visible = viewRect ? filterRiversByView(rivers, viewRect) : rivers;
  if (visible.length === 0) {
    return;
  }

  const shimmerRate = CONFIG.RIVER.RENDER.SHIMMER_RATE;
  const baseColors = [
    [90, 210, 255],
    [200, 120, 255],
    [120, 180, 255]
  ];
  const wave = CONFIG.RIVER.RENDER;
  const chroma = wave.CHROMA_SPLIT;
  const flowDash = wave.FLOW_DASH;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (const river of visible) {
    const width = clampValue(river.width ?? CONFIG.RIVER.WIDTH_MIN, 40, CONFIG.RIVER.WIDTH_MAX);
    const phase = (river.backboneId % 1024) * 0.005 + worldAgeTicks * shimmerRate;
    const wavePhase = (river.backboneId % 2048) * 0.003;
    const waveTime = Number.isFinite(timeSeconds) ? timeSeconds : worldAgeTicks;
    const basePulse = 1 - (wave.PULSE_AMOUNT ?? 0) * 0.5
      + Math.sin(waveTime * (wave.PULSE_RATE ?? 0.35) + phase) * (wave.PULSE_AMOUNT ?? 0);
    const pulseBoost = 1 + Math.max(0, Math.min(1, highlight)) * 0.5;
    const pulse = clampValue(basePulse * pulseBoost, 0, 2.2);
    const cacheTick = Math.floor(waveTime);
    if (!river._renderCache || river._renderCache.tick !== cacheTick) {
      const undulated = buildUndulatedPoints(river.points, cacheTick, wave, wavePhase);
      river._renderCache = {
        tick: cacheTick,
        points: undulated,
        distances: buildDistances(undulated),
        offsets: new Map()
      };
    }
    const points = river._renderCache.points;
    const distances = river._renderCache.distances;
    const shift = 0.5 + 0.5 * Math.sin(phase);
    const variance = wave.BASE_COLOR_VARIANCE ?? 0;
    const baseGlow = mixColor(baseColors[0], baseColors[1], shift);
    const baseCore = mixColor(baseColors[2], baseColors[1], 1 - shift);
    const glow = variance > 0 ? jitterColor(baseGlow, river.backboneId, variance) : baseGlow;
    const core = variance > 0 ? jitterColor(baseCore, river.backboneId + 19, variance) : baseCore;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (chroma?.OFFSETS?.length && chroma?.COLORS?.length) {
      const chromaAlpha = chroma.ALPHA ?? 0.08;
      const chromaWidth = chroma.WIDTH_SCALE ?? 0.2;
      for (let i = 0; i < chroma.OFFSETS.length; i++) {
        const offsetFactor = chroma.OFFSETS[i];
        const baseColor = chroma.COLORS[i % chroma.COLORS.length];
        const color = variance > 0 ? jitterColor(baseColor, river.backboneId + i * 37, variance) : baseColor;
        const offset = width * offsetFactor;
        const offsetKey = `${offset.toFixed(2)}:${chromaWidth.toFixed(2)}`;
        let offsetPoints = river._renderCache.offsets.get(offsetKey);
        if (!offsetPoints) {
          offsetPoints = buildOffsetPoints(points, offset);
          river._renderCache.offsets.set(offsetKey, offsetPoints);
        }
        ctx.lineWidth = Math.max(3, width * chromaWidth);
        ctx.strokeStyle = rgba(color, chromaAlpha * pulse);
        drawPolyline(ctx, offsetPoints);
      }
    }

    ctx.lineWidth = width * 0.7;
    ctx.strokeStyle = rgba(glow, CONFIG.RIVER.RENDER.OUTER_ALPHA * (0.75 + shift * 0.35) * pulse);
    drawPolyline(ctx, points);

    const scintillation = CONFIG.RIVER.RENDER.SCINTILLATION;
    const direction = river.backboneId % 2 === 0 ? 1 : -1;
    ctx.lineWidth = Math.max(10, width * 0.32);
    drawScintillatedLine(
      ctx,
      points,
      distances,
      core,
      CONFIG.RIVER.RENDER.MID_ALPHA * (0.8 + shift * 0.25) * pulse,
      waveTime,
      scintillation,
      direction
    );

    ctx.lineWidth = Math.max(4, width * 0.12);
    drawScintillatedLine(
      ctx,
      points,
      distances,
      core,
      CONFIG.RIVER.RENDER.CORE_ALPHA * pulse,
      waveTime,
      scintillation,
      direction
    );

    if (flowDash) {
      const dashLen = flowDash.LENGTH ?? 120;
      const gap = flowDash.GAP ?? 200;
      const speed = flowDash.SPEED ?? 0.5;
      ctx.save();
      ctx.lineWidth = Math.max(1.5, flowDash.WIDTH ?? 2);
      ctx.strokeStyle = rgba(flowDash.COLOR ?? core, (flowDash.ALPHA ?? 0.2) * pulse);
      ctx.setLineDash([dashLen, gap]);
      ctx.lineDashOffset = -(waveTime * speed * (dashLen + gap));
      drawPolyline(ctx, points);
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  const anchors = collectAnchors(visible);
  for (const anchor of anchors) {
    const snapped = snapAnchorToStar(anchor, activeStars);
    const phase = anchorHuePhase(anchor.id, worldAgeTicks);
    const t = 0.5 + 0.5 * Math.sin(phase);
    const outerColor = mixColor(baseColors[0], baseColors[1], t);
    const innerColor = mixColor(baseColors[2], baseColors[1], 1 - t);
    const baseRadius = 110;
    const radius = snapped.snapped ? baseRadius * 1.15 : baseRadius;
    const outerAlpha = CONFIG.RIVER.RENDER.OUTER_ALPHA;
    const midAlpha = CONFIG.RIVER.RENDER.MID_ALPHA;
    const coreAlpha = CONFIG.RIVER.RENDER.CORE_ALPHA * (snapped.snapped ? 0.9 : 1);

    ctx.save();
    const gradOuter = ctx.createRadialGradient(
      snapped.x,
      snapped.y,
      0,
      snapped.x,
      snapped.y,
      radius * 1.8
    );
    gradOuter.addColorStop(0, rgba(outerColor, outerAlpha));
    gradOuter.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradOuter;
    ctx.beginPath();
    ctx.arc(snapped.x, snapped.y, radius * 1.8, 0, Math.PI * 2);
    ctx.fill();

    const gradMid = ctx.createRadialGradient(
      snapped.x,
      snapped.y,
      0,
      snapped.x,
      snapped.y,
      radius
    );
    gradMid.addColorStop(0, rgba(innerColor, midAlpha));
    gradMid.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradMid;
    ctx.beginPath();
    ctx.arc(snapped.x, snapped.y, radius, 0, Math.PI * 2);
    ctx.fill();

    const gradCore = ctx.createRadialGradient(
      snapped.x,
      snapped.y,
      0,
      snapped.x,
      snapped.y,
      radius * 0.5
    );
    gradCore.addColorStop(0, rgba(innerColor, coreAlpha));
    gradCore.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradCore;
    ctx.beginPath();
    ctx.arc(snapped.x, snapped.y, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
window.drawRivers = drawRivers;
})();
// ===== FILE: src/game/hud.js =====
(function(){
"use strict";

const {
  FONT: HUD_FONT,
  ALERT,
  COLORS: HUD_COLORS,
  MINIMAP,
  COMPASS,
  BEARING,
  SCAN_PULSE,
  STATUS
} = CONFIG.HUD;
const { STATION, AUTOPILOT } = CONFIG;

function normalizeAngle(angle) {
  return ((angle + Math.PI) % (Math.PI * 2)) - Math.PI;
}

function drawHudFrame(ctx, x, y, width, height, options = {}) {
  const notch = options.notch ?? 12;
  const fillStart = options.fillStart ?? HUD_COLORS.PANEL_START;
  const fillEnd = options.fillEnd ?? HUD_COLORS.PANEL_END;
  const stroke = options.stroke ?? HUD_COLORS.PANEL_STROKE;
  const glow = options.glow ?? HUD_COLORS.ACCENT_GLOW;
  const glowBlur = options.glowBlur ?? 10;
  const fill = options.fill !== false;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + notch, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width - notch, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (fill) {
    const grad = ctx.createLinearGradient(x, y, x + width, y + height);
    grad.addColorStop(0, fillStart);
    grad.addColorStop(1, fillEnd);
    ctx.fillStyle = grad;
    ctx.shadowColor = glow;
    ctx.shadowBlur = glowBlur;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.shadowColor = glow;
  ctx.shadowBlur = glowBlur * 0.55;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawHudTick(ctx, x, y, width, inset = 10) {
  ctx.save();
  ctx.strokeStyle = HUD_COLORS.PANEL_TICK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + inset, y);
  ctx.lineTo(x + width - inset, y);
  ctx.stroke();
  ctx.restore();
}

function drawStatIcon(ctx, type, x, y, size, color, glow) {
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, s * 0.12);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = glow;
  ctx.shadowBlur = s * 0.7;

  if (type === "ship") {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(s * 0.55, s * 0.7);
    ctx.lineTo(0, s * 0.35);
    ctx.lineTo(-s * 0.55, s * 0.7);
    ctx.closePath();
    ctx.stroke();
  } else if (type === "time") {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s * 0.3);
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.25, 0);
    ctx.stroke();
  } else if (type === "survey") {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.35, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s * 0.35, -s * 0.1, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "distance") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, 0);
    ctx.lineTo(s * 0.7, 0);
    ctx.stroke();
    const ticks = [-0.4, -0.1, 0.2, 0.5];
    for (const t of ticks) {
      ctx.beginPath();
      ctx.moveTo(s * t, -s * 0.2);
      ctx.lineTo(s * t, s * 0.2);
      ctx.stroke();
    }
  } else if (type === "resource") {
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.58, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, -s * 0.35);
    ctx.lineTo(-s * 0.2, s * 0.35);
    ctx.stroke();
  } else if (type === "speed") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, 0);
    ctx.lineTo(s * 0.4, 0);
    ctx.lineTo(s * 0.15, -s * 0.3);
    ctx.moveTo(s * 0.4, 0);
    ctx.lineTo(s * 0.15, s * 0.3);
    ctx.stroke();
  }

  ctx.restore();
}

function drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, stations, screenW, screenH, isCompact, anomalyEffects = null, highlights = null) {
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
  const range = MINIMAP.RANGE * (anomalyEffects?.rangeScale ?? 1);

  const x0 = screenW - size - edge;
  const y0 = edge;
  const cx = x0 + size / 2;
  const cy = y0 + size / 2;
  const goalHighlight = highlights?.goal ?? 0;
  const exitHighlight = highlights?.exit ?? 0;
  const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.006);

  ctx.save();

  // background
  ctx.fillStyle = HUD_COLORS.MAP_BG;
  ctx.fillRect(x0, y0, size, size);
  drawHudFrame(ctx, x0, y0, size, size, {
    fill: false,
    notch: isCompact ? 12 : 16,
    glowBlur: 10
  });
  drawHudTick(ctx, x0, y0 + 8, size);

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

  // upgrade stations
  if (Array.isArray(stations)) {
    for (const station of stations) {
      const dx = station.x - ship.x;
      const dy = station.y - ship.y;
      if (Math.abs(dx) > range || Math.abs(dy) > range) {
        continue;
      }
      const mx = cx + (dx / range) * (size / 2);
      const my = cy + (dy / range) * (size / 2);
      ctx.save();
      ctx.fillStyle = "rgba(120, 220, 180, 0.95)";
      ctx.strokeStyle = "rgba(200, 255, 230, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx, my - 5);
      ctx.lineTo(mx + 4, my);
      ctx.lineTo(mx, my + 5);
      ctx.lineTo(mx - 4, my);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
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
        if (exitHighlight > 0) {
          const alpha = Math.min(1, exitHighlight) * (0.35 + 0.35 * pulse);
          ctx.strokeStyle = `rgba(160, 230, 220, ${alpha})`;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(zx - 8, zy - 8, 16, 16);
        }
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
        if (goalHighlight > 0) {
          const alpha = Math.min(1, goalHighlight) * (0.35 + 0.35 * pulse);
          ctx.strokeStyle = `rgba(160, 230, 220, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(gx, gy, 6 + 2 * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();
}

function getNearestScanTarget(ship, activeSectors) {
  let nearest = null;
  let fallback = null;
  for (const sector of activeSectors) {
    if (!sector.endZone) {
      continue;
    }
    const ex = sector.endZone.x + sector.endZone.width / 2;
    const ey = sector.endZone.y + sector.endZone.height / 2;
    const dx = ex - ship.x;
    const dy = ey - ship.y;
    const dist2 = dx * dx + dy * dy;
    if (!sector.goalDelivered) {
      if (!nearest || dist2 < nearest.dist2) {
        nearest = { x: ex, y: ey, dist2 };
      }
    } else if (!fallback || dist2 < fallback.dist2) {
      fallback = { x: ex, y: ey, dist2 };
    }
  }
  return nearest ?? fallback;
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

function drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, enemiesInRange, screenW, screenH, anomalyEffects = null) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }

  const scanTargets = [];
  const fallbackTargets = [];
  for (const sector of activeSectors) {
    if (sector.endZone) {
      const ex = sector.endZone.x + sector.endZone.width / 2;
      const ey = sector.endZone.y + sector.endZone.height / 2;
      const dx = ex - ship.x;
      const dy = ey - ship.y;
      const entry = { x: ex, y: ey, dist2: dx * dx + dy * dy };
      if (sector.goalDelivered) {
        fallbackTargets.push(entry);
      } else {
        scanTargets.push(entry);
      }
    }
  }
  const targets = scanTargets.length > 0 ? scanTargets : fallbackTargets;
  targets.sort((a, b) => a.dist2 - b.dist2);

  const hasFuel = fuelPickups && fuelPickups.length > 0;
  const hasEnemies = enemiesInRange && enemiesInRange.length > 0;
  if (targets.length === 0 && !hasFuel && !hasEnemies) {
    return;
  }

  const centerX = screenW / 2;
  const centerY = screenH / 2;
  const angleOffset = anomalyEffects?.angleOffset ?? 0;
  const radiusOffset = anomalyEffects?.radiusOffset ?? 0;
  const jitter = anomalyEffects?.jitter ?? 0;
  const ghostPulse = anomalyEffects?.ghostPulse ?? 0;
  const scanColor = HUD_COLORS.ACCENT;
  const scanGlow = HUD_COLORS.ACCENT_GLOW;
  const fuelColor = HUD_COLORS.PANEL_TEXT;
  const dangerColor = HUD_COLORS.ENEMY;
  const dangerGlow = "rgba(255, 90, 90, 0.9)";

  function drawDot(angle, size, alpha, color, glow) {
    const x = centerX + Math.cos(angle + angleOffset) * (BEARING.RADIUS + radiusOffset);
    const y = centerY + Math.sin(angle + angleOffset) * (BEARING.RADIUS + radiusOffset);
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
    const radius = BEARING.RADIUS + radiusOffset + drift;
    const x = centerX + Math.cos(angle + angleOffset) * radius;
    const y = centerY + Math.sin(angle + angleOffset) * radius;
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

  if (targets.length > 0) {
    const primary = targets[0];
    const angle = Math.atan2(primary.y - ship.y, primary.x - ship.x) + jitter;
    drawChevronPair(angle, BEARING.SCAN_PRIMARY_ALPHA, 1, 0, scanStyle);
  }
  if (targets.length > 1) {
    const secondary = targets[1];
    const angle = Math.atan2(secondary.y - ship.y, secondary.x - ship.x) - jitter;
    drawChevronPair(angle, BEARING.SCAN_SECONDARY_ALPHA, 0.85, Math.PI / 2, scanStyle);
  }

  if (ghostPulse > 0.92) {
    const ghostAngle = Math.sin(performance.now() * 0.001) * Math.PI;
    drawChevronPair(ghostAngle, 0.2, 0.7, Math.PI / 3, {
      color: "rgba(120, 200, 190, 0.6)",
      glow: "rgba(120, 200, 190, 0.25)",
      lineWidth: 1.4,
      glowBlur: 6,
      pulseBase: 0.6,
      pulseRange: 0.2,
      pulseSpeed: BEARING.PULSE_SPEED * 1.6
    });
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

function drawStationIndicators(ctx, ship, stations, screenW, screenH, camera) {
  if (!STATION.MARKER_EDGE_INDICATOR || !Array.isArray(stations) || stations.length === 0) {
    return;
  }
  const centerX = screenW / 2;
  const centerY = screenH / 2;
  const margin = 26;
  const halfW = screenW / 2 - margin;
  const halfH = screenH / 2 - margin;
  for (const station of stations) {
    const sx = (station.x - ship.x) * camera.zoom + centerX + (camera.shakeX ?? 0);
    const sy = (station.y - ship.y) * camera.zoom + centerY + (camera.shakeY ?? 0);
    if (sx >= 0 && sx <= screenW && sy >= 0 && sy <= screenH) {
      continue;
    }
    const dx = sx - centerX;
    const dy = sy - centerY;
    const angle = Math.atan2(dy, dx);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const tx = Math.abs(dirX) > 0.0001 ? halfW / Math.abs(dirX) : halfW;
    const ty = Math.abs(dirY) > 0.0001 ? halfH / Math.abs(dirY) : halfH;
    const t = Math.min(tx, ty);
    const x = centerX + dirX * t;
    const y = centerY + dirY * t;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(120, 220, 180, 0.9)";
    ctx.strokeStyle = "rgba(200, 255, 230, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -6);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawFuelGauge(ctx, ship, screenW, screenH, isCompact, highlight = 0) {
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
  drawHudFrame(ctx, x, y, panelW, panelH, { notch: isCompact ? 12 : 16, glowBlur: 10 });
  drawHudTick(ctx, x, y + 8, panelW);

  if (highlight > 0) {
    const alpha = Math.min(1, highlight) * 0.4;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(170, 230, 210, ${alpha})`;
    ctx.shadowColor = "rgba(120, 220, 190, 0.7)";
    ctx.shadowBlur = 18;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x + 4, y + 4, panelW - 8, panelH - 8);
    ctx.restore();
  }

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

function drawStatusHud(ctx, ship, lives, surveyed, timeSpent, distanceFromOrigin, resourceCurrency, screenW, screenH, controlLabel = "", isCompact = false) {
  const speed = Math.hypot(ship.vx, ship.vy);
  const distance = Number.isFinite(distanceFromOrigin) ? distanceFromOrigin : 0;
  const resource = Number.isFinite(resourceCurrency) ? Math.max(0, Math.floor(resourceCurrency)) : 0;
  const edge = isCompact ? 12 : 18;
  const lines = [
    { icon: "ship", value: lives },
    { icon: "survey", value: surveyed },
    { icon: "time", value: `${timeSpent.toFixed(1)}s` },
    { icon: "distance", value: `${distance.toFixed(0)}u` },
    { icon: "resource", value: resource },
    { icon: "speed", value: speed.toFixed(1) }
  ];
  const showControls = !isCompact && controlLabel;
  const lineH = isCompact ? STATUS.ROW_HEIGHT_COMPACT : STATUS.ROW_HEIGHT;
  const basePad = isCompact ? 12 : 16;
  const panelW = Math.min(
    isCompact ? STATUS.PANEL_WIDTH_COMPACT : STATUS.PANEL_WIDTH,
    screenW - edge * 2
  );
  const panelH = basePad * 2 + lineH * lines.length + (showControls ? lineH : 0);
  const x = edge;
  const y = edge;
  const iconSize = isCompact ? STATUS.ICON_SIZE_COMPACT : STATUS.ICON_SIZE;
  const valueFont = isCompact ? STATUS.VALUE_FONT_COMPACT : STATUS.VALUE_FONT;

  ctx.save();
  drawHudFrame(ctx, x, y, panelW, panelH, { notch: isCompact ? 12 : 16, glowBlur: 12 });
  drawHudTick(ctx, x, y + 8, panelW);

  const iconX = x + basePad + iconSize * 0.4;
  const valueX = x + panelW - basePad;
  let cursorY = y + basePad + lineH * 0.5;
  for (const line of lines) {
    drawStatIcon(ctx, line.icon, iconX, cursorY, iconSize, HUD_COLORS.ACCENT, HUD_COLORS.ACCENT_GLOW);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
    ctx.font = `bold ${valueFont}px ${HUD_FONT}`;
    ctx.shadowColor = HUD_COLORS.ACCENT_GLOW;
    ctx.shadowBlur = STATUS.VALUE_GLOW;
    ctx.fillText(line.value, valueX, cursorY);
    ctx.shadowBlur = 0;
    cursorY += lineH;
  }

  if (showControls) {
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = HUD_COLORS.PANEL_MUTED;
    ctx.font = `${isCompact ? 10 : 11}px ${HUD_FONT}`;
    ctx.fillText(controlLabel, x + basePad, cursorY + 2);
  }
  ctx.restore();
}

function getAutopilotButtonRect(screenW, screenH, isCompact = false) {
  const scale = isCompact ? 0.85 : 1;
  const width = AUTOPILOT.BUTTON.WIDTH * scale;
  const height = AUTOPILOT.BUTTON.HEIGHT * scale;
  const x = screenW / 2 - width / 2;
  const y = screenH - height - AUTOPILOT.BUTTON.Y_OFFSET;
  return { x, y, width, height };
}

function drawAutopilotToggle(ctx, active, screenW, screenH, isCompact = false) {
  const rect = getAutopilotButtonRect(screenW, screenH, isCompact);
  const colors = AUTOPILOT.COLORS;
  ctx.save();
  drawHudFrame(ctx, rect.x, rect.y, rect.width, rect.height, {
    fillStart: active ? colors.ON_FILL : colors.OFF_FILL,
    fillEnd: active ? colors.ON_FILL : colors.OFF_FILL,
    stroke: colors.BORDER,
    glow: active ? colors.GLOW : HUD_COLORS.ACCENT_GLOW,
    glowBlur: active ? 12 : 8,
    notch: isCompact ? 10 : 12
  });
  drawHudTick(ctx, rect.x, rect.y + 6, rect.width, 12);
  ctx.fillStyle = active ? colors.ON_TEXT : colors.OFF_TEXT;
  ctx.font = `${isCompact ? 11 : 12}px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AUTOPILOT", rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.restore();
  return rect;
}

function drawScoreHud(ctx, score, multiplier, pulse, screenW, screenH, isCompact, highlight = 0) {
  const displayScore = Math.max(0, Math.floor(score));
  const scoreText = displayScore.toString().padStart(7, "0");
  const edge = isCompact ? 12 : 18;
  const offsetX = isCompact ? 10 : 24;
  const panelW = Math.min(isCompact ? 260 : 320, screenW - edge * 2);
  const panelH = isCompact ? 70 : 78;
  const x = screenW - panelW - edge + offsetX;
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
  drawHudFrame(ctx, x, y, panelW, panelH, { notch: isCompact ? 16 : 24, glowBlur: 12 });
  drawHudTick(ctx, x, y + 8, panelW);

  ctx.textAlign = "left";
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.font = `${labelFont}px ${HUD_FONT}`;
  ctx.fillText("SCORE", labelX, labelY);

  const scoreX = labelX + 100;
  const scoreY = y + (isCompact ? 50 : 54);
  const highlightPulse = Math.max(0, Math.min(1, highlight));
  const pulseT = Math.min(1, pulse / 1.2);
  const pulseEase = Math.pow(pulseT, 0.75);
  const pulseScale = 1 + pulseEase * 0.26 + highlightPulse * 0.18;
  const glow = 14 + pulseEase * 60 + pulse * 12 + highlightPulse * 40;
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
  ctx.shadowColor = "rgba(255, 240, 200, 0.95)";
  ctx.shadowBlur = glow + 10;
  ctx.fillStyle = "rgba(255, 250, 230, 1)";
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillText(scoreText, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 250, 230, 1)";
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.fillText(scoreText, 0, 0);
  ctx.restore();
  ctx.strokeStyle = "rgba(255, 230, 180, 0.6)";
  ctx.lineWidth = 1.6;
  ctx.save();
  ctx.translate(scoreX, scoreY);
  ctx.scale(pulseScale, pulseScale);
  ctx.strokeText(scoreText, 0, 0);
  ctx.restore();

  const badgeScale = 1 + highlightPulse * 0.18;
  const badgeR = (isCompact ? 13 : 15) * badgeScale;
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

function drawBeaconSignalHud(ctx, strength, screenW, screenH, isCompact) {
  const edge = isCompact ? 12 : 18;
  const panelH = isCompact ? 70 : 78;
  const baseY = screenH - panelH - edge;
  const width = isCompact ? 120 : 150;
  const height = isCompact ? 8 : 10;
  const x = screenW - width - edge;
  const y = baseY - (isCompact ? 18 : 22);
  const fill = Math.max(0, Math.min(1, strength));

  ctx.save();
  ctx.fillStyle = "rgba(6, 10, 12, 0.75)";
  ctx.strokeStyle = "rgba(120, 200, 190, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = "rgba(120, 200, 190, 0.75)";
  ctx.fillRect(x + 1, y + 1, Math.max(0, (width - 2) * fill), height - 2);
  ctx.font = `${isCompact ? 8 : 9}px ${HUD_FONT}`;
  ctx.fillStyle = "rgba(220, 235, 235, 0.75)";
  ctx.textAlign = "right";
  ctx.fillText("CARRIER", x + width, y - 4);
  ctx.restore();
}

function drawCompassHud(ctx, ship, activeSectors, enemies, fuelPickups, screenW, screenH, anomalyEffects = null) {
  if (!activeSectors || activeSectors.length === 0) {
    return;
  }

  const rangeScale = anomalyEffects?.rangeScale ?? 1;
  const range = MINIMAP.RANGE * rangeScale;
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
    const rel = normalizeAngle(Math.atan2(dx, -dy) - (ship.heading + (anomalyEffects?.angleOffset ?? 0)));
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

function drawAlerts(ctx, alerts, alertClock, screenW, screenH) {
  if (!alerts || alerts.length === 0) {
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
  const fontSize = 36;
  ctx.font = `${fontSize}px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = screenW * 0.5;
  const y = screenH * 0.5 - 100;
  const metrics = ctx.measureText(active.text);
  const textWidth = metrics.width;
  const textHeight = fontSize * 1.2;
  const time = performance.now();
  const pulse = 0.6 + 0.4 * Math.sin(time * 0.004);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const haloRadius = Math.max(textWidth, textHeight) * (0.7 + pulse * 0.2);
  const halo = ctx.createRadialGradient(
    x,
    y - textHeight * 0.1,
    textHeight * 0.2,
    x,
    y,
    haloRadius
  );
  halo.addColorStop(0, "rgba(120, 200, 190, 0.45)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.lineWidth = 3;
  ctx.strokeStyle = HUD_COLORS.ALERT_STROKE;
  ctx.fillStyle = HUD_COLORS.PANEL_TEXT;
  ctx.strokeText(active.text, x, y);
  ctx.fillText(active.text, x, y);

  ctx.save();
  ctx.globalAlpha *= 0.35;
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = HUD_COLORS.ACCENT_SOFT;
  const jitter = Math.sin(time * 0.02 + elapsed * 6) * 1.5;
  ctx.fillText(active.text, x + jitter, y);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha *= 0.25 + pulse * 0.12;
  const left = x - textWidth / 2 - 6;
  const top = y - textHeight;
  const width = textWidth + 12;
  const scanGap = 6;
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  for (let iy = 0; iy <= textHeight; iy += scanGap) {
    const scanJitter = Math.sin(time * 0.03 + iy * 0.6) * 6;
    ctx.fillRect(left + scanJitter, top + iy, width, 2);
  }
  ctx.restore();

  const flareDuration = 0.6;
  if (elapsed < flareDuration) {
    const flareT = Math.max(0, Math.min(1, elapsed / flareDuration));
    const sweepStart = x - textWidth * 0.7;
    const sweepEnd = x + textWidth * 0.7;
    const sweepX = sweepStart + (sweepEnd - sweepStart) * flareT;
    const flareW = textWidth * 0.45;
    const flareH = textHeight * 0.6;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.beginPath();
    ctx.rect(left, y - textHeight * 0.9, width, textHeight * 1.4);
    ctx.clip();
    const flare = ctx.createLinearGradient(sweepX - flareW / 2, y, sweepX + flareW / 2, y);
    flare.addColorStop(0, "rgba(255, 255, 255, 0)");
    flare.addColorStop(0.5, "rgba(255, 240, 200, 0.75)");
    flare.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = flare;
    ctx.fillRect(sweepX - flareW / 2, y - flareH / 2, flareW, flareH);
    ctx.restore();
  }
  ctx.restore();
}
window.drawMiniMap = drawMiniMap;
window.drawScanPulse = drawScanPulse;
window.drawBearingIndicators = drawBearingIndicators;
window.drawStationIndicators = drawStationIndicators;
window.drawFuelGauge = drawFuelGauge;
window.drawStatusHud = drawStatusHud;
window.getAutopilotButtonRect = getAutopilotButtonRect;
window.drawAutopilotToggle = drawAutopilotToggle;
window.drawScoreHud = drawScoreHud;
window.drawBeaconSignalHud = drawBeaconSignalHud;
window.drawCompassHud = drawCompassHud;
window.drawAlerts = drawAlerts;
window.ALERT = ALERT;
window.BEARING = BEARING;
window.COMPASS = COMPASS;
window.HUD_COLORS = HUD_COLORS;
window.HUD_FONT = HUD_FONT;
window.MINIMAP = MINIMAP;
window.SCAN_PULSE = SCAN_PULSE;
})();
// ===== FILE: src/game/visualEffects.js =====
(function(){
"use strict";


const {
  SCORE: { POPUP: SCORE_POPUP, POPUP_COLORS: SCORE_POPUP_COLORS },
  EFFECTS: { CONTROL_DISABLE, TRAIL_DISPERSE, TRAIL_COLOR }
} = CONFIG;

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgba(color, alpha, scale = 1) {
  const r = Math.max(0, Math.min(255, Math.round(color[0] * scale)));
  const g = Math.max(0, Math.min(255, Math.round(color[1] * scale)));
  const b = Math.max(0, Math.min(255, Math.round(color[2] * scale)));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawTrail(ctx, trail, speed = 0) {
  if (!Array.isArray(trail) || trail.length < 2) {
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

function drawScreenEffects(ctx, screenW, screenH, vignettePulse = 0) {
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

  if (vignettePulse > 0) {
    const alpha = Math.min(1, vignettePulse) * 0.25;
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.005);
    ctx.save();
    ctx.globalAlpha = alpha * pulse;
    const pulseGrad = ctx.createRadialGradient(centerX, centerY, minRadius * 0.7, centerX, centerY, maxRadius);
    pulseGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    pulseGrad.addColorStop(1, "rgba(0, 0, 0, 0.55)");
    ctx.fillStyle = pulseGrad;
    ctx.fillRect(0, 0, screenW, screenH);
    ctx.restore();
  }
}

function drawControlDisableOverlay(ctx, canvas, camera, remaining, shipRadius) {
  if (remaining <= 0) {
    return;
  }
  const centerX = canvas.width / 2 + camera.shakeX;
  const centerY = canvas.height / 2 + camera.shakeY;
  const baseRadius = (shipRadius * 0.9) * camera.zoom;
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.01);
  const glowRadius = baseRadius * (1.2 + 0.25 * pulse);
  const alpha = CONTROL_DISABLE.PULSE_MIN
    + (CONTROL_DISABLE.PULSE_MAX - CONTROL_DISABLE.PULSE_MIN) * pulse;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const grad = ctx.createRadialGradient(
    centerX,
    centerY,
    baseRadius * 0.4,
    centerX,
    centerY,
    glowRadius
  );
  grad.addColorStop(0, `rgba(220, 70, 70, ${alpha})`);
  grad.addColorStop(1, "rgba(220, 70, 70, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const labelY = centerY - glowRadius - 12;
  const timerText = `${Math.max(0, remaining).toFixed(1)}s`;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 3;
  ctx.strokeStyle = HUD_COLORS.ALERT_STROKE;
  ctx.fillStyle = "rgba(235, 90, 90, 0.95)";
  ctx.font = `bold 13px ${HUD_FONT}`;
  ctx.strokeText("Controls Disabled!", centerX, labelY);
  ctx.fillText("Controls Disabled!", centerX, labelY);
  ctx.textBaseline = "top";
  ctx.font = `bold 16px ${HUD_FONT}`;
  ctx.strokeText(timerText, centerX, labelY + 6);
  ctx.fillText(timerText, centerX, labelY + 6);
  ctx.restore();
}

function drawScorePopups(ctx, canvas, camera, ship, popups) {
  if (!Array.isArray(popups) || popups.length === 0) {
    return;
  }
  const centerX = canvas.width / 2 + camera.shakeX;
  const centerY = canvas.height / 2 + camera.shakeY;
  const maxX = canvas.width / 2 - SCORE_POPUP.EDGE_MARGIN;
  const maxY = canvas.height / 2 - SCORE_POPUP.EDGE_MARGIN;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${SCORE_POPUP.FONT_SIZE}px ${HUD_FONT}`;

  for (const popup of popups) {
    const t = clampValue(popup.age / popup.life, 0, 1);
    const grow = clampValue(t / SCORE_POPUP.GROW_TIME, 0, 1);
    const scale = lerp(SCORE_POPUP.SCALE_START, SCORE_POPUP.SCALE_END, grow);
    const alpha = 1 - t;
    const rise = SCORE_POPUP.RISE * t;

    let sx = (popup.x - ship.x) * camera.zoom + centerX;
    let sy = (popup.y - ship.y) * camera.zoom + centerY;

    if (
      sx < SCORE_POPUP.EDGE_MARGIN
      || sx > canvas.width - SCORE_POPUP.EDGE_MARGIN
      || sy < SCORE_POPUP.EDGE_MARGIN
      || sy > canvas.height - SCORE_POPUP.EDGE_MARGIN
    ) {
      const dx = sx - centerX;
      const dy = sy - centerY;
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        const safeDx = Math.abs(dx) > 0.01 ? Math.abs(dx) : 0.01;
        const safeDy = Math.abs(dy) > 0.01 ? Math.abs(dy) : 0.01;
        const scaleClamp = Math.min(maxX / safeDx, maxY / safeDy);
        sx = centerX + dx * scaleClamp;
        sy = centerY + dy * scaleClamp;
      } else {
        sx = centerX;
        sy = centerY;
      }
    }

    ctx.save();
    ctx.translate(sx, sy - rise);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = popup.color;
    ctx.strokeStyle = HUD_COLORS.ALERT_STROKE;
    ctx.lineWidth = 3;
    const text = `+${popup.value}`;
    ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawParticles(ctx, particles) {
  if (!particles || particles.length === 0) {
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
window.drawTrail = drawTrail;
window.drawBackgroundEvents = drawBackgroundEvents;
window.drawScreenEffects = drawScreenEffects;
window.drawControlDisableOverlay = drawControlDisableOverlay;
window.drawScorePopups = drawScorePopups;
window.drawParticles = drawParticles;
window.CONTROL_DISABLE = CONTROL_DISABLE;
window.SCORE_POPUP = SCORE_POPUP;
window.SCORE_POPUP_COLORS = SCORE_POPUP_COLORS;
window.TRAIL_COLOR = TRAIL_COLOR;
window.TRAIL_DISPERSE = TRAIL_DISPERSE;
})();
// ===== FILE: src/entities/resourcePickup.js =====
(function(){
"use strict";

const { RESOURCE } = CONFIG;
const RESOURCE_SPRITE = new Image();
RESOURCE_SPRITE.src = RESOURCE.SPRITE_SRC;

class ResourcePickup {
  constructor(x, y, vx, vy, value, spawnTimeMs = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.value = Math.max(RESOURCE.MIN_DROP_VALUE, Math.round(value));
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.6);
    this.spawnTimeMs = spawnTimeMs;
    this.ttlMs = RESOURCE.TTL_MS;
    this.ageMs = 0;
  }

  update(dt) {
    this.rotation += this.rotationSpeed * dt;
  }

  draw(ctx) {
    const size = RESOURCE.PICKUP_RADIUS;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (RESOURCE_SPRITE.complete && RESOURCE_SPRITE.naturalWidth > 0) {
      const scale = (size * 2) / RESOURCE_SPRITE.naturalWidth;
      const drawW = RESOURCE_SPRITE.naturalWidth * scale;
      const drawH = RESOURCE_SPRITE.naturalHeight * scale;
      ctx.drawImage(RESOURCE_SPRITE, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      ctx.fillStyle = "rgba(120, 220, 180, 0.9)";
      ctx.strokeStyle = "rgba(210, 255, 230, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.8, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (this.ttlMs && this.ttlMs > 0) {
      const remaining = Math.max(0, this.ttlMs - (this.ageMs ?? 0));
      const ratio = Math.max(0, Math.min(1, remaining / this.ttlMs));
      ctx.rotate(-this.rotation);
      ctx.save();
      ctx.strokeStyle = "rgba(170, 255, 210, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();
      ctx.fillStyle = "rgba(220, 255, 230, 0.9)";
      ctx.font = "10px Orbitron, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.ceil(remaining / 1000), 0, size + 14);
      ctx.restore();
    }
    ctx.restore();
  }
}
window.ResourcePickup = ResourcePickup;
})();
// ===== FILE: src/game/combatSystem.js =====
(function(){
"use strict";





const { PICKUPS, ENEMY, ASTEROID, RESOURCE, STATION } = CONFIG;
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
  TTL_MS: PICKUPS.FUEL.TTL_MS,
  ROT_SPEED_MIN: PICKUPS.FUEL.ROT_SPEED_MIN,
  ROT_SPEED_MAX: PICKUPS.FUEL.ROT_SPEED_MAX
};
const RESOURCE_DROP = {
  BASE_VALUE: RESOURCE.DROP_BASE_VALUE,
  DECAY: RESOURCE.CHILD_VALUE_DECAY,
  MIN_VALUE: RESOURCE.MIN_DROP_VALUE,
  RADIUS: RESOURCE.PICKUP_RADIUS,
  CHANCE: RESOURCE.DROP_CHANCE,
  TTL_MS: RESOURCE.TTL_MS
};
const ASTEROID_FRAGMENTS = ASTEROID.FRAGMENTS;

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
  constructor(x, y, vx, vy, spawnTimeMs = 0) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.rotation = Math.atan2(vy, vx);
    const speed = FUEL_PICKUP.ROT_SPEED_MIN
      + Math.random() * (FUEL_PICKUP.ROT_SPEED_MAX - FUEL_PICKUP.ROT_SPEED_MIN);
    this.rotationSpeed = (Math.random() < 0.5 ? -1 : 1) * speed;
    this.spawnTimeMs = spawnTimeMs;
    this.ttlMs = FUEL_PICKUP.TTL_MS;
    this.ageMs = 0;
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
    if (this.ttlMs && this.ttlMs > 0) {
      const remaining = Math.max(0, this.ttlMs - (this.ageMs ?? 0));
      const ratio = Math.max(0, Math.min(1, remaining / this.ttlMs));
      ctx.rotate(-this.rotation);
      ctx.save();
      ctx.strokeStyle = "rgba(240, 210, 150, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, FUEL_PICKUP.RADIUS + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 230, 190, 0.9)";
      ctx.font = "10px Orbitron, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.ceil(remaining / 1000), 0, FUEL_PICKUP.RADIUS + 14);
      ctx.restore();
    }
    ctx.restore();
  }
}

function isInStationSafeZone(x, y, stations) {
  if (!Array.isArray(stations) || stations.length === 0) {
    return false;
  }
  for (const station of stations) {
    const dx = x - station.x;
    const dy = y - station.y;
    const radius = station.safeRadius ?? STATION.SAFE_ZONE_RADIUS;
    if (Math.hypot(dx, dy) <= radius) {
      return true;
    }
  }
  return false;
}

function updateBullets(bullets, dt, stations = null) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }
    if (isInStationSafeZone(b.x, b.y, stations)) {
      bullets.splice(i, 1);
    }
  }
}

function updateEnemyBullets(
  enemyBullets,
  enemies,
  ship,
  shipRadius,
  invulnTimer,
  shipVisible,
  handleLifeLoss,
  dt,
  stations = null
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
    if (isInStationSafeZone(b.x, b.y, stations)) {
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

function updateFuelPickups(fuelPickups, activeStars, activeSectors, dt, worldAgeMs = null) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (const fuel of fuelPickups) {
    if (Number.isFinite(worldAgeMs) && Number.isFinite(fuel.spawnTimeMs)) {
      fuel.ageMs = Math.max(0, worldAgeMs - fuel.spawnTimeMs);
    }
    fuel.update(dt);
    const sector = findSectorForPosition(activeSectors, fuel.x, fuel.y);
    const rivers = sector?.runtimeRivers ?? [];
    applyForcesToEntity(fuel, dt, activeStars, rivers, CONFIG);
    integrate(fuel, dt);
  }
}

function updateResourcePickups(resourcePickups, activeStars, activeSectors, dt, worldAgeMs = null) {
  if (resourcePickups.length === 0) {
    return;
  }
  for (const pickup of resourcePickups) {
    if (Number.isFinite(worldAgeMs) && Number.isFinite(pickup.spawnTimeMs)) {
      pickup.ageMs = Math.max(0, worldAgeMs - pickup.spawnTimeMs);
    }
    pickup.update(dt);
    const sector = findSectorForPosition(activeSectors, pickup.x, pickup.y);
    const rivers = sector?.runtimeRivers ?? [];
    applyForcesToEntity(pickup, dt, activeStars, rivers, CONFIG);
    integrate(pickup, dt);
  }
}

function handleFuelPickups(fuelPickups, ship, shipRadius, scorePoints, addScore, sounds) {
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

function handleResourcePickups(resourcePickups, ship, shipRadius, addResource, sounds) {
  if (resourcePickups.length === 0) {
    return;
  }
  for (let i = resourcePickups.length - 1; i >= 0; i--) {
    const pickup = resourcePickups[i];
    const dx = ship.x - pickup.x;
    const dy = ship.y - pickup.y;
    if (Math.hypot(dx, dy) < RESOURCE_DROP.RADIUS + shipRadius) {
      addResource(pickup.value);
      sounds?.play("got_money");
      resourcePickups.splice(i, 1);
    }
  }
}

function handleBulletHits(
  bullets,
  enemies,
  activeSectors,
  scorePoints,
  scoreChunkMultiplier,
  addScore,
  sounds,
  fuelPickups,
  resourcePickups,
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
        spawnFuelDrop(fuelPickups, enemy, true, worldAgeMs ?? 0);
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
          spawnFuelDrop(fuelPickups, a, false, worldAgeMs ?? 0);
          spawnResourceDrop(resourcePickups, a, worldAgeMs ?? 0);
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

function drawBullets(ctx, bullets) {
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

function drawEnemyBullets(ctx, enemyBullets) {
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

function drawFuelPickups(ctx, fuelPickups) {
  if (fuelPickups.length === 0) {
    return;
  }
  for (const fuel of fuelPickups) {
    fuel.draw(ctx);
  }
}

function drawResourcePickups(ctx, resourcePickups) {
  if (resourcePickups.length === 0) {
    return;
  }
  for (const pickup of resourcePickups) {
    pickup.draw(ctx);
  }
}

function spawnBullet(bullets, ship, bulletConfig) {
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

function updateEnemies(
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

function drawEnemies(ctx, enemies) {
  for (const enemy of enemies) {
    enemy.draw(ctx);
  }
}

function getEnemySpawnCountForSector(currentSector) {
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
    const generation = Number.isFinite(asteroid.generation) ? asteroid.generation + 1 : 1;
    const chunk = new Asteroid(asteroid.x, asteroid.y, vx, vy, fragmentRadius, 0, null, "chunk", {
      generation,
      isFragment: true
    });
    chunk.spawnTimeMs = spawnTimeMs;
    chunk.ttlMs = ASTEROID_FRAGMENTS.TTL_MS;
    sector.asteroids.push(chunk);
  }
}

function spawnFuelDrop(fuelPickups, source, guaranteed = false, spawnTimeMs = 0) {
  if (!guaranteed && Math.random() > FUEL_PICKUP.DROP_CHANCE) {
    return;
  }
  fuelPickups.push(new FuelPickup(source.x, source.y, source.vx, source.vy, spawnTimeMs));
}

function spawnResourceDrop(resourcePickups, source, spawnTimeMs) {
  if (!resourcePickups) {
    return;
  }
  if (Math.random() > RESOURCE_DROP.CHANCE) {
    return;
  }
  const generation = Number.isFinite(source.generation) ? source.generation : 0;
  const value = Math.max(
    RESOURCE_DROP.MIN_VALUE,
    Math.round(RESOURCE_DROP.BASE_VALUE * Math.pow(RESOURCE_DROP.DECAY, generation))
  );
  const driftAngle = Math.random() * Math.PI * 2;
  const driftSpeed = 20 + Math.random() * 60;
  const vx = Math.cos(driftAngle) * driftSpeed + source.vx * 0.15;
  const vy = Math.sin(driftAngle) * driftSpeed + source.vy * 0.15;
  const pickup = new ResourcePickup(source.x, source.y, vx, vy, value, spawnTimeMs);
  pickup.ttlMs = RESOURCE_DROP.TTL_MS;
  resourcePickups.push(pickup);
}

function updateEnemyPings(enemyPings, dt) {
  for (let i = enemyPings.length - 1; i >= 0; i--) {
    enemyPings[i].life -= dt;
    if (enemyPings[i].life <= 0) {
      enemyPings.splice(i, 1);
    }
  }
}

function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update(dt);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function spawnExplosion(particles, x, y, type = "normal") {
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
window.Particle = Particle;
window.updateBullets = updateBullets;
window.updateEnemyBullets = updateEnemyBullets;
window.updateFuelPickups = updateFuelPickups;
window.updateResourcePickups = updateResourcePickups;
window.handleFuelPickups = handleFuelPickups;
window.handleResourcePickups = handleResourcePickups;
window.handleBulletHits = handleBulletHits;
window.drawBullets = drawBullets;
window.drawEnemyBullets = drawEnemyBullets;
window.drawFuelPickups = drawFuelPickups;
window.drawResourcePickups = drawResourcePickups;
window.spawnBullet = spawnBullet;
window.updateEnemies = updateEnemies;
window.drawEnemies = drawEnemies;
window.getEnemySpawnCountForSector = getEnemySpawnCountForSector;
window.updateEnemyPings = updateEnemyPings;
window.updateParticles = updateParticles;
window.spawnExplosion = spawnExplosion;
})();
// ===== FILE: src/game/gameLoop.js =====
(function(){
"use strict";





















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
const keys = {};
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  keys[key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

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

function startGame(canvas, ctx, uiRoot, gameState, sectorIndex, onGameOver, options = {}) {
  const demoMode = Boolean(options?.demoMode);
  const autopilotDefault = Boolean(options?.autopilotDefault);
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
  let lastInteractHeld = false;
  let lastEscapeHeld = false;
  let autopilotActive = autopilotDefault;
  let lastAutopilotKey = false;
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
  const hasTouchInput = ("ontouchstart" in window) || (navigator.maxTouchPoints ?? 0) > 0;
  let interactButton = null;
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

  if (uiRoot && hasTouchInput) {
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
  }

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
    if (interactButton) {
      interactButton.remove();
      interactButton = null;
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
    const toggleKeyHeld = keys["p"];
    if (!docked && toggleKeyHeld && !lastAutopilotKey) {
      setAutopilotActive(!autopilotActive, true);
    }
    lastAutopilotKey = Boolean(toggleKeyHeld);
    const autopilotEngaged = autopilotActive && !inputBlocked && !docked;
    let externalInput = null;
    let autopilotFire = false;
    let keyboardRotationInput = 0;
    let keyboardThrustInput = 0;
    let shipInSafeZone = false;
    let shipFullyInsideSafeZone = false;
    if (!inputBlocked && !autopilotEngaged) {
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
    const interactHeld = keys["e"] || (docked && keys[" "]);
    const escapeHeld = keys["escape"];
    const interactTriggered = Boolean(interactPressed || (interactHeld && !lastInteractHeld));
    const escapeTriggered = Boolean(escapeHeld && !lastEscapeHeld);
    lastInteractHeld = interactHeld;
    lastEscapeHeld = escapeHeld;
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
      } else if (interactTriggered || escapeTriggered) {
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

    if (ship.fuel <= 0 && keys["q"]) {
      keys["q"] = false;
      handleLifeLoss("normal");
      return;
    }

    const spaceFires = keys[" "] && !docked;
    const manualFire = spaceFires || (mouseAimEnabled && mouse.leftDown) || touch.fireId !== null;
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
    ? "CTRL: TOUCH + KEYS"
    : (mouseAimEnabled ? "CTRL: MOUSE + KEYS" : "CTRL: KEYS");
  const anomalyEffects = getAnomalyEffects(sector, time);
  const distanceFromOrigin = Math.hypot(ship.x - originX, ship.y - originY);
  drawBearingIndicators(ctx, ship, activeSectors, fuelPickups, enemiesInRange, hudW, hudH, anomalyEffects);
  drawMiniMap(ctx, ship, activeSectors, enemiesInRange, enemyPings, stationMarkers, hudW, hudH, isCompactHud, anomalyEffects, introHighlight);
  drawFuelGauge(ctx, ship, hudW, hudH, isCompactHud, introHighlight.fuel);
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
// ===== FILE: src/ui/startScreen.js =====
(function(){
"use strict";

function showStartScreen(root, onStart, onReset) {
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
  credit.innerHTML = 'a game by <span class="start-subtitle-name">wingtipstudio.com</span> &middot; All Rights Reserved';
  overlay.appendChild(credit);

  const bgObjects = createBackgroundObjects(bgLayer, 6, 4);

  let started = false;
  const start = (shouldReset = false) => {
    if (started) {
      return;
    }
    started = true;
    if (shouldReset && onReset) {
      onReset();
    }
    sounds.play("start_game");
    cleanup();
    if (onStart) {
      onStart();
    }
  };

  const onKeyDown = (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      start(true);
    }
  };

  button.addEventListener("click", () => start(true));
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

const { SCOREBOARD } = CONFIG.UI;
const SCORE_ENDPOINT = SCOREBOARD.ENDPOINT;
const MIN_QUALIFY_SCORE = SCOREBOARD.MIN_QUALIFY_SCORE;
const NAME_MAX_LENGTH = SCOREBOARD.NAME_MAX_LENGTH;

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
let demoController = null;
let escListener = null;
let gameState = loadGameState();
let sectorIndex = loadSectorIndex();

function resetWorld() {
  gameState = resetGameState();
  sectorIndex = resetSectorIndex();
}

function stopDemo() {
  if (demoController && typeof demoController.exitToMenu === "function") {
    demoController.exitToMenu();
  }
  demoController = null;
}

function startDemo() {
  stopDemo();
  demoController = startGame(canvas, ctx, uiRoot, null, null, null, {
    demoMode: true,
    autopilotDefault: true
  });
}

function showStartScreenWithDemo() {
  startDemo();
  showStartScreen(uiRoot, () => {
    stopDemo();
    beginGame();
  }, resetWorld);
}

function beginGame() {
  stopDemo();
  if (escListener) {
    window.removeEventListener("keydown", escListener);
    escListener = null;
  }
  gameController = startGame(canvas, ctx, uiRoot, gameState, sectorIndex, (stats) => {
    if (escListener) {
      window.removeEventListener("keydown", escListener);
      escListener = null;
    }
    gameController = null;
    showGameOverModal(uiRoot, stats, () => {
      showStartScreenWithDemo();
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
    showStartScreenWithDemo();
  };
  window.addEventListener("keydown", escListener);
}

showStartScreenWithDemo();
})();