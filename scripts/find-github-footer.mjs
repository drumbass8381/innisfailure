import fs from "fs";

const s = fs.readFileSync("apps/cli/frontend/assets/index-Du-vO1Hr.js", "utf8");
const patterns = ["href:rue", "aue({", "Do,href:rue", "rue,", "nue,"];

for (const pat of patterns) {
  let idx = 0;
  let count = 0;
  while ((idx = s.indexOf(pat, idx + 1)) >= 0 && count < 3) {
    console.log(`\n--- ${pat} @ ${idx} ---`);
    console.log(s.slice(idx - 100, idx + 250));
    count++;
  }
}

// sidebar footer near Pue drawer
const footerNeedle = "children:nue";
let f = s.indexOf(footerNeedle);
console.log("\nfooter needle", f, f >= 0 ? s.slice(f - 200, f + 400) : "not found");
