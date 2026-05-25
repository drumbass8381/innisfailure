import fs from "fs";

const bundle = fs.readFileSync("apps/cli/frontend/assets/index-Du-vO1Hr.js", "utf8");

const routeRe = /path:\s*"([^"]+)"/g;
const toRe = /to:\s*"([^"]+)"/g;
const labelRe = /children:\s*"([^"]{3,40})"/g;

const paths = new Set();
const tos = new Set();
const labels = new Set();

for (const m of bundle.matchAll(routeRe)) paths.add(m[1]);
for (const m of bundle.matchAll(toRe)) tos.add(m[1]);
for (const m of bundle.matchAll(labelRe)) {
  const t = m[1];
  if (/^[A-Za-z]/.test(t) && !t.includes("${")) labels.add(t);
}

console.log("=== path: ===");
console.log([...paths].sort().join("\n"));
console.log("\n=== to: ===");
console.log([...tos].sort().join("\n"));
console.log("\n=== children labels (sample) ===");
console.log(
  [...labels]
    .filter((l) => /bot|exchange|setting|grid|dca|trade|paper|agent|whale|news|backtest/i.test(l))
    .sort()
    .join("\n"),
);

const menuIdx = bundle.indexOf("My exchanges");
if (menuIdx >= 0) console.log("\n=== menu context ===\n", bundle.slice(menuIdx - 800, menuIdx + 1200));
