import { startGame } from "./game/gameLoop.js";
import { showStartScreen } from "./ui/startScreen.js";
import { showGameOverModal } from "./ui/gameoverModal.js";
import { loadGameState, resetGameState } from "./game/gameState.js";
import { loadSectorIndex, resetSectorIndex } from "./game/sectorIndex.js";
import { sounds, music } from "./game/audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let audioUnlocked = false;
const unlockAudio = () => {
  if (audioUnlocked) {
    return;
  }
  audioUnlocked = true;
  sounds.unlock();
  music.unlock();
};

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const handleFirstInput = () => {
  unlockAudio();
  window.removeEventListener("pointerdown", handleFirstInput);
  window.removeEventListener("touchstart", handleFirstInput);
};

window.addEventListener("pointerdown", handleFirstInput, { passive: true });
window.addEventListener("touchstart", handleFirstInput, { passive: true });

const uiRoot = document.getElementById("ui-root");
let gameController = null;
let demoController = null;
let escListener = null;
let gameState = loadGameState();
let sectorIndex = loadSectorIndex();

function exitToMenuFromUI() {
  if (escListener) {
    window.removeEventListener("keydown", escListener);
    escListener = null;
  }
  gameController = null;
  showStartScreenWithDemo();
}

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
    autopilotDefault: true,
    onExitToMenu: () => showStartScreenWithDemo()
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
  }, {
    onExitToMenu: () => exitToMenuFromUI()
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

