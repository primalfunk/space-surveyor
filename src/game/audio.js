const SOUND_DEFS = {
  start_game: { src: "assets/sounds/mp3/start_game.mp3", volume: 0.9 },
  laser: { src: "assets/sounds/mp3/laser.mp3", volume: 0.75 },
  enemy_laser: { src: "assets/sounds/mp3/laser.mp3", volume: 0.375 },
  explosion: { src: "assets/sounds/mp3/explosion.mp3", volume: 0.85 },
  lost_life: { src: "assets/sounds/mp3/lost_life.mp3", volume: 0.9 },
  got_fuel: { src: "assets/sounds/mp3/got_fuel.mp3", volume: 0.8 },
  got_survey: { src: "assets/sounds/mp3/got_survey.mp3", volume: 0.85 },
  game_over: { src: "assets/sounds/mp3/game_over.mp3", volume: 0.9 },
  thrust: { src: "assets/sounds/mp3/thrust.mp3", volume: 0.7 },
  thrust_rotate: { src: "assets/sounds/mp3/thrust.mp3", volume: 0.2 }
};

class SoundManager {
  constructor(defs) {
    this.defs = defs;
    this.pool = new Map();
    this.loopHandles = new Map();
    this.preloaded = false;
  }

  preload() {
    if (this.preloaded) {
      return;
    }
    for (const [key, def] of Object.entries(this.defs)) {
      const audio = new Audio(def.src);
      audio.preload = "auto";
      audio.volume = def.volume ?? 1;
      this.pool.set(key, [audio]);
    }
    this.preloaded = true;
  }

  play(key) {
    const def = this.defs[key];
    if (!def) {
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
    audio.volume = def.volume ?? 1;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  startLoop(key, segmentSeconds = 0.4, crossfadeSeconds = 0.16) {
    if (this.loopHandles.has(key)) {
      return;
    }
    const def = this.defs[key];
    if (!def) {
      return;
    }
    const volume = def.volume ?? 1;
    const fadeMs = Math.max(20, crossfadeSeconds * 1000);
    const segmentMs = Math.max(100, segmentSeconds * 1000);
    const intervalMs = Math.max(40, segmentMs - fadeMs);

    const makeAudio = () => {
      const audio = new Audio(def.src);
      audio.preload = "auto";
      audio.volume = volume;
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
        audio.volume = from + (to - from) * t;
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
      audio.volume = fadeIn ? 0 : volume;
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
        audio.volume = volume;
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
        a.volume = volume;
        b.volume = volume;
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

export const music = new MusicManager([
  "assets/sounds/mp3/1. failed_before.mp3",
  "assets/sounds/mp3/2. remind_me_later.mp3",
  "assets/sounds/mp3/3. take_it_easy.mp3",
  "assets/sounds/mp3/4. where_the_time_goes.mp3",
  "assets/sounds/mp3/5. the_noise_in_my_head.mp3",
  "assets/sounds/mp3/6. noonquil.mp3"
], 0.45);

