const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
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
