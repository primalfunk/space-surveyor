const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const ASSETS_DIR = path.join(ROOT, "assets");
const ENTRY = "src/main.js";

function stripImports(source) {
  // Strip single-line and multi-line ES module import statements.
  return source.replace(/^\s*import[\s\S]*?;\s*$/gm, "");
}

function transformExports(source, exported) {
  let output = source;
  const addExport = (exportName, localName = exportName) => {
    exported.set(exportName, localName);
  };

  output = output.replace(/export\s+(class|function)\s+([A-Za-z0-9_]+)/g, (match, type, name) => {
    addExport(name);
    return `${type} ${name}`;
  });
  output = output.replace(/export\s+(const|let|var)\s+([A-Za-z0-9_]+)/g, (match, type, name) => {
    addExport(name);
    return `${type} ${name}`;
  });
  output = output.replace(/export\s*\{([^}]+)\}\s*;?/g, (match, names) => {
    const parts = names.split(",").map((part) => part.trim()).filter(Boolean);
    for (const part of parts) {
      const [localName, exportName] = part.split(/\s+as\s+/).map((segment) => segment.trim());
      addExport(exportName || localName, localName);
    }
    return "";
  });
  return output;
}

function buildGameBundle() {
  const graph = new Map();
  collectModule(path.join(ROOT, ENTRY), graph);
  const ordered = topoSort(path.join(ROOT, ENTRY), graph);

  const chunks = [];
  for (const filePath of ordered) {
    const source = path.relative(ROOT, filePath).replace(/\\/g, "/");
    const exported = new Map();
    let contents = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
    contents = stripImports(contents);
    contents = transformExports(contents, exported);

    const exportLines = Array.from(exported.entries()).map(
      ([exportName, localName]) => `window.${exportName} = ${localName};`
    );
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

function collectModule(filePath, graph) {
  if (graph.has(filePath)) {
    return;
  }
  const source = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
  const imports = Array.from(source.matchAll(/import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']\s*;/g))
    .map((match) => match[1])
    .filter((spec) => spec.startsWith("."))
    .map((spec) => resolveImport(filePath, spec));

  graph.set(filePath, imports);
  for (const dep of imports) {
    collectModule(dep, graph);
  }
}

function resolveImport(fromPath, spec) {
  const basePath = path.resolve(path.dirname(fromPath), spec);
  if (fs.existsSync(basePath)) {
    return basePath;
  }
  if (fs.existsSync(`${basePath}.js`)) {
    return `${basePath}.js`;
  }
  throw new Error(`Missing import "${spec}" from ${fromPath}`);
}

function topoSort(entryPath, graph) {
  const visiting = new Set();
  const visited = new Set();
  const order = [];

  const visit = (node) => {
    if (visited.has(node)) {
      return;
    }
    if (visiting.has(node)) {
      throw new Error(`Circular dependency detected at ${node}`);
    }
    visiting.add(node);
    const deps = graph.get(node) || [];
    for (const dep of deps) {
      visit(dep);
    }
    visiting.delete(node);
    visited.add(node);
    order.push(node);
  };

  visit(entryPath);
  return order;
}

function buildIndexHtml() {
  const indexPath = path.join(ROOT, "index.html");
  return fs.readFileSync(indexPath, "utf8");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".mp3":
      return "audio/mpeg";
    case ".ogg":
      return "audio/ogg";
    case ".wav":
      return "audio/wav";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

function collectFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      files.push(...collectFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function buildAssetMap() {
  const files = collectFiles(ASSETS_DIR);
  return files.map((filePath) => {
    const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
    const mime = getMimeType(filePath);
    const data = fs.readFileSync(filePath);
    const base64 = data.toString("base64");
    return {
      path: rel,
      dataUri: `data:${mime};base64,${base64}`
    };
  });
}

function inlineAssets(text, assetMap) {
  let output = text;
  const sorted = [...assetMap].sort((a, b) => b.path.length - a.path.length);
  for (const asset of sorted) {
    output = output.split(`"${asset.path}"`).join(`"${asset.dataUri}"`);
    output = output.split(`'${asset.path}'`).join(`'${asset.dataUri}'`);
    output = output.split(`(${asset.path})`).join(`(${asset.dataUri})`);
  }
  return output;
}

function reportUnresolvedAssets(label, text) {
  const matches = text.match(/assets\/[^"' )]+/g);
  if (!matches || matches.length === 0) {
    return;
  }
  const unique = Array.from(new Set(matches));
  console.warn(`[build] Unresolved asset refs in ${label}:`);
  for (const entry of unique) {
    console.warn(`  - ${entry}`);
  }
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      clearDir(full);
      fs.rmdirSync(full);
    } else {
      fs.unlinkSync(full);
    }
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  ensureDir(dest);
  for (const entry of fs.readdirSync(src)) {
    const from = path.join(src, entry);
    const to = path.join(dest, entry);
    const stat = fs.lstatSync(from);
    if (stat.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function main() {
  ensureDir(DIST_DIR);
  clearDir(DIST_DIR);
  const bundle = buildGameBundle();
  const assetMap = buildAssetMap();
  const inlinedBundle = inlineAssets(bundle, assetMap);
  reportUnresolvedAssets("game.js", inlinedBundle);
  fs.writeFileSync(path.join(DIST_DIR, "game.js"), inlinedBundle, "utf8");
  const indexHtml = buildIndexHtml();
  const inlinedIndex = inlineAssets(indexHtml, assetMap);
  reportUnresolvedAssets("index.html", inlinedIndex);
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), inlinedIndex, "utf8");
  console.log("Build complete: dist/index.html, dist/game.js (assets inlined)");
}

main();
