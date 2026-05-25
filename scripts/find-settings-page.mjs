import fs from "fs";

const s = fs.readFileSync("apps/cli/frontend/assets/index-Du-vO1Hr.js", "utf8");
const needle = 'settings:"/dashboard/settings"';
const i = s.indexOf(needle);
console.log("route map at", i);

// Find lazy route for settings
for (const pat of ["settings", "App settings", "path:\"/dashboard/settings\""]) {
  let idx = 0;
  let n = 0;
  while ((idx = s.indexOf(pat, idx + 1)) >= 0 && n < 5) {
    if (pat === "App settings" || pat.includes("path")) {
      console.log("\n---", pat, idx, "---\n", s.slice(idx - 120, idx + 200));
      n++;
    }
  }
}
