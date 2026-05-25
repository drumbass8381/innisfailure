import fs from "fs";

const s = fs.readFileSync("apps/cli/frontend/assets/index-Du-vO1Hr.js", "utf8");
const m = s.match(/iA="([^"]+)"/);
console.log("iA", m?.[1]);
