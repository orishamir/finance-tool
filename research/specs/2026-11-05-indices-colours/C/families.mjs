// Option C: each hue family on the page and its one meaning; every pair of families through the validator (two at a time),
// to show which families sit close even though they never share a chart. Writes families.json. Run from the repository root.
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { H, CARD, check } from "./lab.mjs";
import { C } from "./tokens.mjs";
const here = dirname(fileURLToPath(import.meta.url));
export const FAM = [
  ["teal", C.pick, "פעולה, קישור, הבחירה שלכם, ★ הזול"],
  ["magenta", C.israel, "קרן שנקנית בישראל"],
  ["orange", C.abroad, "נקנית בחו״ל, והמרת המטבע שמשלמים כדי לקנות בחו״ל"],
  ["gold", C.keep, "דמי משמרת ודמי ניהול חשבון"],
  ["rose", C.trade, "עמלות קנייה ומכירה"],
  ["blue", "blue-300", "מספר שהזנתם"],
  ["violet", "violet-400", "מספר מחושב"],
  ["amber", "amber-400", "דורש תשומת לב"],
  ["red", "red-400", "חסום בכלל פתוח (וגם שגיאה בשדה)"],
  ["green", "green-400", "נבדק (לא מצויר בעמוד)"],
  ["neutral", C.rest, "בלי צבע: דיו, מבנה, העמלות זו על זו, נטרול מט״ח (מלא/חלול), תוויות אחרות"],
];
const rows = [];
for (let i = 0; i < FAM.length; i++) for (let j = i + 1; j < FAM.length; j++) {
  const r = check([H(FAM[i][1]), H(FAM[j][1])], CARD, "all");
  rows.push({ a: FAM[i][0], b: FAM[j][0], normal: r.normal, cvd: r.cvd });
}
writeFileSync(join(here, "families.json"), JSON.stringify({ families: FAM.map(([f, k, he]) => ({ family: f, step: k, hex: H(k), he })), pairs: rows }, null, 1));
for (const r of rows.filter((r) => r.normal < 15 || r.cvd < 8).sort((x, y) => x.normal - y.normal)) console.log(`${r.a}/${r.b} normal ${r.normal} CVD ${r.cvd}`);
