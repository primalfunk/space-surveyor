export function showUpgradeStationModal(root, state, onAction) {
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
