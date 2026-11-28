// Báo lỗi nếu src import package chưa khai trong package.json
// (node_modules local có thể còn sót package cài tay, nhưng Vercel cài sạch theo lockfile nên build sẽ lỗi).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { builtinModules } from "node:module";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]);
const builtins = new Set(builtinModules);
const re = /(?:from\s+|import\s*\(\s*|import\s+|require\(\s*)["']([^"'./][^"']*)["']/g;
const missing = new Map();

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(name)) scan(p);
  }
}

function scan(file) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(re)) {
    const spec = m[1];
    if (spec.startsWith("@/") || spec.startsWith("node:") || spec.startsWith("virtual:")) continue;
    const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
    if (builtins.has(name) || declared.has(name) || declared.has(`@types/${name}`)) continue;
    if (!missing.has(name)) missing.set(name, new Set());
    missing.get(name).add(file.slice(root.length));
  }
}

walk(join(root, "src"));

if (missing.size) {
  console.error("Import package chưa khai trong FE/package.json:");
  for (const [name, files] of missing) console.error(`  - ${name}  (${[...files].slice(0, 3).join(", ")})`);
  console.error("Chạy: pnpm -C FE add <package>");
  process.exit(1);
}
console.log("check-deps: OK");
