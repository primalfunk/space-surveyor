import { startGame } from "./game/gameLoop.js";
import { showStartScreen } from "./ui/startScreen.js";
import { showGameOverModal } from "./ui/gameoverModal.js";
import { loadGameState, resetGameState } from "./game/gameState.js";
import { loadSectorIndex, resetSectorIndex } from "./game/sectorIndex.js";

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
let escListener = null;
let gameState = loadGameState();
let sectorIndex = loadSectorIndex();

function resetWorld() {
  gameState = resetGameState();
  sectorIndex = resetSectorIndex();
}

function beginGame() {
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
      showStartScreen(uiRoot, beginGame, resetWorld);
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
    showStartScreen(uiRoot, beginGame, resetWorld);
  };
  window.addEventListener("keydown", escListener);
}

showStartScreen(uiRoot, beginGame, resetWorld);

