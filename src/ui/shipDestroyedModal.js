export function showShipDestroyedModal(root, _remainingLives, onClose) {
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
