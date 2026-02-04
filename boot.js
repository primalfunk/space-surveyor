(() => {
  const canvas = document.getElementById("game");
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const bootSeed = Date.now() * (typeof performance !== "undefined" ? performance.now() : 1);
  const TWO_PI = Math.PI * 2;
  const baseAngleStep = Math.PI / 60;
  const inputClamp = 4;
  const anchorRadius = 18;
  const anchorLineLength = 34;
  const anchorThickness = 1.2;
  const voidColor = "rgb(5, 7, 8)";

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let rafId = null;
  let handoffStart = null;
  let handoffComplete = false;

  const inputState = {
    offsetX: 0,
    offsetY: 0,
    targetX: 0,
    targetY: 0,
    rotation: 0,
    pulse: 0
  };

  const agreements = {
    core: false,
    seed: false,
    assets: false
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    centerX = width * 0.5;
    centerY = height * 0.5;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const hash = (value) => {
    const s = Math.sin(value + bootSeed * 0.000001) * 43758.5453;
    return s - Math.floor(s);
  };

  const onMove = (event) => {
    const dx = (event.clientX - centerX) / (width || 1);
    const dy = (event.clientY - centerY) / (height || 1);
    inputState.targetX = clamp(dx * inputClamp * 6, -inputClamp, inputClamp);
    inputState.targetY = clamp(dy * inputClamp * 6, -inputClamp, inputClamp);
  };

  const onKey = () => {
    inputState.rotation += baseAngleStep;
  };

  const onClick = () => {
    inputState.pulse = 1;
  };

  const detachInputs = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mousedown", onClick);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", resize);
  };

  const attachInputs = () => {
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onClick, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", resize);
  };

  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });

  const loadFonts = () => {
    if (!document.fonts || !document.fonts.load) {
      return Promise.resolve();
    }
    return Promise.all([
      document.fonts.load("500 16px Oxanium"),
      document.fonts.load("700 16px Oxanium")
    ]);
  };

  const preloadTierAssets = () => {
    const urls = [
      "assets/ui/sprites/ship.png",
      "assets/ui/sprites/yellow_star.png",
      "assets/ui/sprites/asteroid.png",
      "assets/ui/sprites/enemy_ship.png",
      "assets/ui/sprites/fuel.png",
      "assets/ui/sprites/crystal.png",
      "assets/ui/sprites/scan_point.png"
    ];
    return Promise.allSettled([
      loadFonts(),
      ...urls.map(loadImage)
    ]);
  };

  const coreReady = new Promise((resolve) => {
    let resolved = false;
    window.__GAME_READY__ = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      agreements.core = true;
      resolve();
    };
  });

  const seedReady = new Promise((resolve) => {
    let resolved = false;
    window.__WORLD_SEED_READY__ = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      agreements.seed = true;
      resolve();
    };
    if (Number.isFinite(window.__WORLD_SEED__)) {
      agreements.seed = true;
      resolve();
    }
  });

  const assetsReady = preloadTierAssets().then(() => {
    agreements.assets = true;
  });

  const allReady = Promise.all([coreReady, seedReady, assetsReady]).then(() => {
    handoffStart = performance.now();
  });

  const bundleCandidates = ["game.bundle.js", "dist/game.bundle.js"];
  const injectScript = (src) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  };
  const looksLikeHtml = (text) => {
    const trimmed = text.trimStart();
    return trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.startsWith("<");
  };
  const loadBundle = async () => {
    for (const candidate of bundleCandidates) {
      try {
        const res = await fetch(candidate, { cache: "no-store" });
        if (!res.ok) {
          continue;
        }
        const text = await res.text();
        if (!text || looksLikeHtml(text)) {
          continue;
        }
        const blob = new Blob([text], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = () => URL.revokeObjectURL(url);
        document.body.appendChild(script);
        return;
      } catch (err) {
        // Try next candidate.
      }
    }
    injectScript(bundleCandidates[0]);
  };
  void loadBundle();

  const getPhase = () => {
    if (!agreements.core) {
      return 0;
    }
    if (!agreements.seed) {
      return 1;
    }
    if (!agreements.assets) {
      return 2;
    }
    return 3;
  };

  const drawAnchor = (time, phase, alphaScale, rotation) => {
    const pulse = inputState.pulse;
    const ringAlpha = 0.35 + phase * 0.15 + pulse * 0.2;
    const lineAlpha = 0.25 + phase * 0.18 + pulse * 0.25;
    const ringSpan = phase >= 1 ? TWO_PI : TWO_PI * 0.72;
    const lineLength = anchorLineLength + phase * 6;
    const jitter = phase >= 2 ? 0.6 : 1.4;
    const jitterPhase = hash(time * 0.002);
    const jitterOffset = (jitterPhase - 0.5) * jitter;

    ctx.save();
    ctx.translate(centerX + inputState.offsetX, centerY + inputState.offsetY);
    ctx.rotate(rotation + jitterOffset * 0.01);

    ctx.strokeStyle = `rgba(190, 220, 230, ${ringAlpha * alphaScale})`;
    ctx.lineWidth = anchorThickness;
    ctx.beginPath();
    ctx.arc(0, 0, anchorRadius, -Math.PI / 2, -Math.PI / 2 + ringSpan);
    ctx.stroke();

    ctx.strokeStyle = `rgba(170, 210, 230, ${lineAlpha * alphaScale})`;
    ctx.beginPath();
    ctx.moveTo(0, -lineLength);
    ctx.lineTo(0, lineLength);
    ctx.stroke();

    if (phase >= 2) {
      ctx.beginPath();
      ctx.moveTo(-lineLength * 0.9, 0);
      ctx.lineTo(lineLength * 0.9, 0);
      ctx.stroke();
    }

    if (phase >= 3) {
      ctx.beginPath();
      ctx.arc(0, 0, anchorRadius * 0.55, 0, TWO_PI);
      ctx.stroke();
    }

    ctx.restore();
  };

  const draw = (time) => {
    ctx.fillStyle = voidColor;
    ctx.fillRect(0, 0, width, height);

    const phase = getPhase();
    const alphaScale = 0.9;
    const rotation = inputState.rotation;
    drawAnchor(time, phase, alphaScale, rotation);
  };

  const loop = (time) => {
    if (handoffComplete) {
      return;
    }

    inputState.offsetX += (inputState.targetX - inputState.offsetX) * 0.18;
    inputState.offsetY += (inputState.targetY - inputState.offsetY) * 0.18;
    inputState.pulse = Math.max(0, inputState.pulse - 0.035);

    if (handoffStart !== null) {
      const elapsed = time - handoffStart;
      const progress = clamp(elapsed / 750, 0, 1);
      const scale = 1 + progress * 3.2;
      const fade = 1 - progress;
      ctx.fillStyle = voidColor;
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      drawAnchor(time, 3, fade, inputState.rotation);
      ctx.restore();
      if (progress >= 1 && !handoffComplete) {
        handoffComplete = true;
        detachInputs();
        if (typeof window.startApp === "function") {
          window.startApp();
        }
        return;
      }
    } else {
      draw(time);
    }

    rafId = requestAnimationFrame(loop);
  };

  resize();
  attachInputs();
  draw(performance.now());
  rafId = requestAnimationFrame(loop);
  void allReady;
})();
