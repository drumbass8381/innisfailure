/**
 * Patches the bundled Pro UI: remove GitHub footer, expand sidebar menu.
 * Run after ui:sync / copying frontend dist (see root package.json ui:sync).
 */
import fs from "fs";

const bundlePath = "apps/cli/frontend/assets/index-Du-vO1Hr.js";
let s = fs.readFileSync(bundlePath, "utf8");

const oldNav =
  'uR=({size:c})=>I.jsxs(Wf,{size:"lg",children:[I.jsx(BT,{href:ii("bot"),icon:I.jsx(V4,{}),size:c,children:"Bots"}),I.jsx(BT,{href:ii("accounts"),icon:I.jsx(Sue,{}),size:c,children:"My exchanges"}),I.jsx(BT,{href:ii("settings"),icon:I.jsx(vue,{}),size:c,children:"Settings"})]});';

const newNav =
  'uR=({size:c})=>I.jsxs(Wf,{size:"lg",children:[I.jsx(BT,{href:ii("bot"),icon:I.jsx(V4,{}),size:c,children:"Bots"}),I.jsx(BT,{href:ii("strategies"),size:c,children:"Strategies"}),I.jsx(BT,{href:ii("grid-bot/create"),size:c,children:"Grid bots"}),I.jsx(BT,{href:ii("dca-bot/create"),size:c,children:"DCA bots"}),I.jsx(BT,{href:"/hub/index.html",size:c,children:"Intelligence"}),I.jsx(BT,{href:"/hub/agentic.html",size:c,children:"Agentic trading"}),I.jsx(BT,{href:"/hub/news.html",size:c,children:"Semantic news"}),I.jsx(BT,{href:"/hub/whales.html",size:c,children:"Whale wallets"}),I.jsx(BT,{href:"/hub/paper.html",size:c,children:"Paper portfolio"}),I.jsx(BT,{href:ii("accounts"),icon:I.jsx(Sue,{}),size:c,children:"My exchanges"}),I.jsx(BT,{href:ii("settings"),icon:I.jsx(vue,{}),size:c,children:"Settings"})]});';

if (!s.includes(oldNav)) {
  console.error("Sidebar nav pattern not found — bundle may have changed.");
  process.exit(1);
}
s = s.replace(oldNav, newNav);

const oldFooter =
  'cR=({size:c})=>I.jsxs(Wf,{size:"lg",sx:{flexGrow:"unset"},children:[I.jsx(ea,{}),I.jsx(BT,{append:I.jsx(nue,{}),href:rue,icon:I.jsx(aue,{}),size:c,target:"_blank",children:null})]});';

const newFooter =
  'cR=({size:c})=>I.jsxs(Wf,{size:"lg",sx:{flexGrow:"unset",alignItems:"center",gap:1},children:[I.jsx(ea,{}),I.jsx(nue,{})]});';

if (!s.includes(oldFooter)) {
  console.error("Sidebar footer pattern not found — bundle may have changed.");
  process.exit(1);
}
s = s.replace(oldFooter, newFooter);

const oldMobile =
  'function _ue(){const c=C9(),e=t=>t===c.pathname?"var(--joy-palette-neutral-plainHoverBg)":void 0;return I.jsxs(I.Fragment,{children:[I.jsx(ai,{color:"neutral",component:Do,href:ii("bot"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("bot"))},children:"Bots"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("strategies"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("strategies"))},children:"Strategies"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("accounts"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("accounts"))},children:"Exchange Accounts"})]})}';

const newMobile =
  'function _ue(){const c=C9(),e=t=>t===c.pathname?"var(--joy-palette-neutral-plainHoverBg)":void 0;return I.jsxs(I.Fragment,{children:[I.jsx(ai,{color:"neutral",component:Do,href:ii("bot"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("bot"))},children:"Bots"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("strategies"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("strategies"))},children:"Strategies"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("grid-bot/create"),size:"lg",variant:"plain",children:"Grid bots"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("dca-bot/create"),size:"lg",variant:"plain",children:"DCA bots"}),I.jsx(ai,{color:"neutral",component:Do,href:"/hub/index.html",size:"lg",variant:"plain",children:"Intelligence"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("accounts"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("accounts"))},children:"Exchange Accounts"}),I.jsx(ai,{color:"neutral",component:Do,href:ii("settings"),size:"lg",variant:"plain",sx:{backgroundColor:e(ii("settings"))},children:"Settings"})]})}';

if (s.includes(oldMobile)) {
  s = s.replace(oldMobile, newMobile);
} else {
  console.warn("Mobile nav pattern not found — skipped mobile patch.");
}

fs.writeFileSync(bundlePath, s);
console.log("Sidebar patched: GitHub removed, menu expanded.");
