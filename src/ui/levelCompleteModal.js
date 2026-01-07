export function showLevelCompleteModal(root, onClose) {
  if (!root) {
    return null;
  }

  const overlay = document.createElement("div");
  overlay.className = "overlay level-complete-modal";

  const panel = document.createElement("div");
  panel.className = "level-complete-panel";

  const title = document.createElement("div");
  title.className = "level-complete-title";
  title.textContent = "Level Complete";

  const subtitle = document.createElement("div");
  subtitle.className = "level-complete-subtitle";
  subtitle.textContent = "Press any key to return";

  panel.appendChild(title);
  panel.appendChild(subtitle);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  let closed = false;
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
    event.preventDefault();
    close();
  };

  overlay.addEventListener("pointerdown", close);
  window.addEventListener("keydown", onKeyDown);

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

