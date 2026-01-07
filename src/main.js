import { startGame } from "./game/gameLoop.js";
import { showStartScreen } from "./ui/startScreen.js";
import { showGameOverModal } from "./ui/gameoverModal.js";

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

function beginGame() {
  if (escListener) {
    window.removeEventListener("keydown", escListener);
    escListener = null;
  }
  gameController = startGame(canvas, ctx, (stats) => {
    if (escListener) {
      window.removeEventListener("keydown", escListener);
      escListener = null;
    }
    gameController = null;
    showGameOverModal(uiRoot, stats, () => {
      showStartScreen(uiRoot, beginGame);
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
    showStartScreen(uiRoot, beginGame);
  };
  window.addEventListener("keydown", escListener);
}

showStartScreen(uiRoot, beginGame);

