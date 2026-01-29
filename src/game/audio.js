import { CONFIG } from "./config.js";

const SOUND_DEFS = CONFIG.AUDIO.SOUNDS;

const clampVolume = (value) => Math.max(0, Math.min(1, value));

class SoundManager {
  constructor(defs) {
    this.defs = defs;
    this.pool = new Map();
    this.loopHandles = new Map();
    this.preloaded = false;
    this.unlocked = false;
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

  unlock() {
    if (this.unlocked) {
      return;
    }
    this.preload();
    this.unlocked = true;
    const warm = (audio) => {
      audio.muted = true;
      audio.currentTime = 0;
      try {
        audio.load();
      } catch (err) {}
      const playResult = audio.play();
      if (playResult && typeof playResult.then === "function") {
        playResult.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        }).catch(() => {
          audio.muted = false;
        });
      } else {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }
    };
    for (const pool of this.pool.values()) {
      for (const audio of pool) {
        warm(audio);
      }
    }
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
    const playResult = audio.play();
    if (playResult && typeof playResult.then === "function") {
      playResult.catch(() => {});
    }
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
    if (def.loopMode === "native") {
      let pool = this.pool.get(key);
      if (!pool) {
        pool = [];
        this.pool.set(key, pool);
      }
      let audio = pool[0];
      if (!audio) {
        audio = new Audio(def.src);
        audio.preload = "auto";
        pool.push(audio);
      }
      audio.loop = true;
      audio.volume = clampVolume(volume);
      audio.currentTime = 0;
      this.loopHandles.set(key, {
        audio,
        stop: () => {
          audio.loop = false;
          audio.pause();
          audio.currentTime = 0;
        }
      });
      const playResult = audio.play();
      if (playResult && typeof playResult.then === "function") {
        playResult.catch(() => {
          this.stopLoop(key);
        });
      }
      return;
    }
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
      const playResult = audio.play();
      if (playResult && typeof playResult.then === "function") {
        playResult.catch(() => {
          if (!stopped) {
            this.stopLoop(key);
          }
        });
      }
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

export const sounds = new SoundManager(SOUND_DEFS);

class MusicManager {
  constructor(tracks, volume = 0.5) {
    this.tracks = tracks;
    this.volume = volume;
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.volume = volume;
    this.index = 0;
    this.playing = false;
    this.unlocked = false;
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
    const playResult = this.audio.play();
    if (playResult && typeof playResult.then === "function") {
      playResult.catch(() => {
        if (this.playing) {
          this.playing = false;
          this.audio.removeEventListener("ended", this.onEnded);
        }
      });
    }
  }

  unlock() {
    if (this.unlocked) {
      return;
    }
    if (!this.tracks.length) {
      return;
    }
    this.unlocked = true;
    if (!this.audio.src) {
      this.audio.src = this.tracks[this.index];
    }
    this.audio.muted = true;
    this.audio.currentTime = 0;
    try {
      this.audio.load();
    } catch (err) {}
    const playResult = this.audio.play();
    if (playResult && typeof playResult.then === "function") {
      playResult.then(() => {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.muted = false;
      }).catch(() => {
        this.audio.muted = false;
      });
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.muted = false;
    }
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

export const music = new MusicManager(
  CONFIG.AUDIO.MUSIC.TRACKS,
  CONFIG.AUDIO.MUSIC.VOLUME
);

