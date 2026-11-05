import { execFileSync } from "node:child_process";
import { hx } from "./ok.mjs";
const V = "/tmp/claude-1000/bundled-skills/2.1.317/517ab0877f5e9fb238369786541b5caa/dataviz/scripts/validate_palette.js";
const pairs = [
  ["lime-300","green-400","tracking fund vs positive"],["olive-500","green-400","ETF vs positive"],["lime-300","gold-200","tracking fund vs custody fee"],
  ["olive-500","gold-200","ETF vs custody fee"],["brown-600","orange-500","TASE-foreign vs trade fee"],["brown-600","red-500","TASE-foreign vs open-rule chip words"],
  ["brown-600","red-400","TASE-foreign vs blocked"],["brown-600","neutral-500","TASE-foreign vs rest of cost"],["lime-300","olive-500","tracking vs ETF"],
  ["rose-300","red-300","fixed fee vs input error"],["rose-300","red-400","fixed fee vs blocked"],["gold-200","amber-300","custody vs caution chip"],
  ["gold-200","amber-400","custody vs caution"],["orange-500","red-500","trade fee vs open-rule chip"],["orange-500","amber-400","trade vs caution"],
  ["orange-500","red-400","trade vs blocked"],["magenta-400","violet-400","abroad vs computed"],["magenta-400","rose-300","abroad vs fixed fee"],
  ["lime-300","teal-300","tracking vs link"],["olive-500","amber-400","ETF vs caution"],["lime-300","amber-300","tracking vs caution chip"],
  ["olive-500","amber-500","ETF vs amber-500"],
];
for (const [a,b,why] of pairs) {
  let t; try { t = execFileSync("node",[V,`${hx(a)},${hx(b)}`,"--mode","dark","--surface",hx("neutral-950")],{encoding:"utf8"}); } catch(e){ t=e.stdout; }
  const n = t.match(/Normal-vision floor.*?ΔE ([\d.]+)/)?.[1], c = t.match(/CVD separation.*?ΔE ([\d.]+) \((\w+)\)/);
  console.log(`${why.padEnd(40)} ${a}/${b} ${hx(a)}/${hx(b)}  normal ${n}  cvd ${c?.[1]} ${c?.[2]}`);
}
