// Replaces the bundled OpenTrader path wordmark (function Tue) with "innisfailures" text.
// Run after copying pro/frontend/dist; `pnpm ui:sync` runs this automatically.
const fs = require("fs");
const path = "apps/cli/frontend/assets/index-Du-vO1Hr.js";
let s = fs.readFileSync(path, "utf8");
const needle = "function Tue(){const{mode:c}=F_()";
const start = s.indexOf(needle);
if (start < 0) {
  console.error("Tue() wordmark not found — bundle may have changed.");
  process.exit(1);
}
let depth = 0;
let i = start + needle.indexOf("{");
for (; i < s.length; i++) {
  const ch = s[i];
  if (ch === "{") depth++;
  if (ch === "}") {
    depth--;
    if (depth === 0) {
      const neu = `function Tue(){const{mode:c}=F_(),e=c==="light"?"black":"white";return I.jsx("svg",{fill:"none",height:"48",viewBox:"0 0 720 140",xmlns:"http://www.w3.org/2000/svg",role:"img","aria-label":"innisfailures",preserveAspectRatio:"xMidYMid meet",children:I.jsx("text",{x:"50%",y:"55%",dominantBaseline:"middle",textAnchor:"middle",fill:e,fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif",fontSize:"78",fontWeight:"700",letterSpacing:"-0.03em",children:"innisfailures"})})}`;
      s = s.slice(0, start) + neu + s.slice(i + 1);
      fs.writeFileSync(path, s);
      console.log("Wordmark patched: OpenTrader path SVG -> innisfailures text.");
      process.exit(0);
    }
  }
}
console.error("brace mismatch");
process.exit(1);
