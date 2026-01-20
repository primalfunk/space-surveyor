const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const SOURCES = [
  "src/game/audio.js",
  "src/game/physics.js",
  "src/entities/asteroid.js",
  "src/entities/enemyShip.js",
  "src/entities/goal.js",
  "src/entities/endZone.js",
  "src/entities/star.js",
  "src/entities/ship.js",
  "src/game/camera.js",
  "src/game/sectorManager.js",
  "src/ui/startScreen.js",
  "src/ui/gameoverModal.js",
  "src/ui/levelCompleteModal.js",
  "src/game/gameLoop.js",
  "src/main.js"
];

function stripImports(source) {
  return source.replace(/^\s*import .*;\s*$/gm, "");
}

function transformExports(source, exported) {
  let output = source;
  output = output.replace(/export\s+(class|function)\s+([A-Za-z0-9_]+)/g, (match, type, name) => {
    exported.add(name);
    return `${type} ${name}`;
  });
  output = output.replace(/export\s+(const|let|var)\s+([A-Za-z0-9_]+)/g, (match, type, name) => {
    exported.add(name);
    return `${type} ${name}`;
  });
  output = output.replace(/export\s*\{[^}]+\};?\s*/g, "");
  return output;
}

function buildGameBundle() {
  const chunks = [];
  for (const source of SOURCES) {
    const filePath = path.join(ROOT, source);
    const exported = new Set();
    let contents = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
    contents = stripImports(contents);
    contents = transformExports(contents, exported);

    const exportLines = Array.from(exported).map((name) => `window.${name} = ${name};`);
    const block = [
      `// ===== FILE: ${source} =====`,
      "(function(){",
      "\"use strict\";",
      contents.trimEnd(),
      exportLines.length ? exportLines.join("\n") : "",
      "})();",
      ""
    ].filter(Boolean).join("\n");
    chunks.push(block);
  }

  return chunks.join("\n");
}

function buildIndexHtml() {
  const indexPath = path.join(ROOT, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  const scriptTag = /<script\s+type="module"\s+src="[^"]+"><\/script>/;
  if (!scriptTag.test(html)) {
    throw new Error("index.html script tag not found or unexpected format.");
  }
  return html.replace(scriptTag, "<script src=\"game.js\"></script>");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(DIST_DIR);
  const bundle = buildGameBundle();
  fs.writeFileSync(path.join(DIST_DIR, "game.js"), bundle, "utf8");
  const indexHtml = buildIndexHtml();
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), indexHtml, "utf8");
  console.log("Build complete: dist/index.html, dist/game.js");
}

main();
