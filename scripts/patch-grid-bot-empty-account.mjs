/**
 * Grid bot create page assumed exchangeAccount.list[0] exists — crashes on fresh Railway deploys.
 */
import fs from "fs";

const path = "apps/cli/frontend/assets/page-BLLkLO7p.js";
let s = fs.readFileSync(path, "utf8");

const oldOs =
  'function os(){const[r]=l.exchangeAccount.list.useSuspenseQuery(),n=r[0],[t]=l.symbol.list.useSuspenseQuery(n.exchangeCode),i=t.find(m=>m.currencyPair==="BTC/USDT")||t[0],[a]=l.symbol.price.useSuspenseQuery({symbolId:i.symbolId}),[{lowPrice:e,highPrice:o}]=l.gridBot.formOptions.useSuspenseQuery({symbolId:i.symbolId});return{exchangeAccount:n,symbol:i,currentPrice:a,lowPrice:e,highPrice:o}}';

const newOs =
  'function os(){const[r]=l.exchangeAccount.list.useSuspenseQuery(),n=r[0];if(!n)return{exchangeAccount:null,symbol:null,currentPrice:null,lowPrice:null,highPrice:null};const[t]=l.symbol.list.useSuspenseQuery(n.exchangeCode),i=(t==null?void 0:t.find(m=>m.currencyPair==="BTC/USDT"))||t==null?void 0:t[0];if(!i)return{exchangeAccount:n,symbol:null,currentPrice:null,lowPrice:null,highPrice:null};const[a]=l.symbol.price.useSuspenseQuery({symbolId:i.symbolId}),[{lowPrice:e,highPrice:o}]=l.gridBot.formOptions.useSuspenseQuery({symbolId:i.symbolId});return{exchangeAccount:n,symbol:i,currentPrice:a,lowPrice:e,highPrice:o}}';

const oldLs =
  'function ls(){var x;const{exchangeAccount:r,symbol:n,lowPrice:t,highPrice:i,currentPrice:a}=os(),e=S();if(D()){const b=(x=n.filters.limits.amount)!=null&&x.min?n.filters.limits.amount.min*10:"";e(z(r.id)),e(E(r.exchangeCode)),e(T(n.symbolId)),e(f(b.toString()||"")),e(j(t)),e(P(i)),e(O(R()))}const m=c(B),y=c(es),h=b=>e(W(b)),g=c(ts);return s.jsx(u,{container:!0,spacing:2,children:s.jsxs(q,{children:[s.jsx(u,{md:9,children:s.jsx(is,{barSize:y,defaultPrice:a,gridLines:g,onBarSizeChange:h,symbolId:m})}),s.jsx(u,{md:3,children:s.jsx(as,{})})]})})}';

const newLs =
  'function ls(){var x;const b=I(),{exchangeAccount:r,symbol:n,lowPrice:t,highPrice:i,currentPrice:a}=os(),e=S();if(!r||!n)return s.jsx(u,{container:!0,spacing:2,children:s.jsxs(w,{sx:{p:3,maxWidth:480},children:[s.jsx("p",{children:"Add an exchange account before creating a grid bot."}),s.jsx(A,{sx:{mt:2},onClick:()=>b({to:C("accounts")}),children:"Go to My exchanges"})]})});if(D()){const $=(x=n.filters.limits.amount)!=null&&x.min?n.filters.limits.amount.min*10:"";e(z(r.id)),e(E(r.exchangeCode)),e(T(n.symbolId)),e(f($.toString()||"")),e(j(t)),e(P(i)),e(O(R()))}const m=c(B),y=c(es),h=$=>e(W($)),g=c(ts);return s.jsx(u,{container:!0,spacing:2,children:s.jsxs(q,{children:[s.jsx(u,{md:9,children:s.jsx(is,{barSize:y,defaultPrice:a,gridLines:g,onBarSizeChange:h,symbolId:m})}),s.jsx(u,{md:3,children:s.jsx(as,{})})]})})}';

if (!s.includes(oldOs)) {
  console.error("os() pattern not found in page-BLLkLO7p.js");
  process.exit(1);
}
if (!s.includes(oldLs)) {
  console.error("ls() pattern not found in page-BLLkLO7p.js");
  process.exit(1);
}

s = s.replace(oldOs, newOs).replace(oldLs, newLs);
fs.writeFileSync(path, s);
console.log("Patched grid-bot create empty exchange account handling.");
