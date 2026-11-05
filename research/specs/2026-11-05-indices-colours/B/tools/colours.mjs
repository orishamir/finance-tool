// Option B's colours: one place, used by the validator run, the live preview and the swatch sheet.
import { hex, H } from "./vlib.mjs";
export const NEW_STEPS = { "lime-300": [0.84, 0.2, 125], "olive-500": [0.64, 0.15, 110], "brown-600": [0.52, 0.12, 45] };
const S = (k) => (NEW_STEPS[k] ? hex(NEW_STEPS[k]) : H(k));
export const ok = (k) => (NEW_STEPS[k] ? `oklch(${NEW_STEPS[k].join(" ")})` : null);
// meaning id -> [Hebrew name on the site, palette step]
export const B = {
  trade: ["עמלות קנייה ומכירה", "orange-500"],
  custody: ["דמי משמרת", "gold-200"],
  fixed: ["דמי ניהול חשבון", "rose-300"],
  fx: ["המרת מטבע", "magenta-400"],
  rest: ["העמלות זו על זו", "neutral-500"],
  ilTracking: ["קרן מחקה ישראלית", "lime-300"],
  ilEtf: ["קרן סל ישראלית", "olive-500"],
  taseForeign: ["קרן חוץ בבורסה בתל אביב", "brown-600"],
  abroad: ["קרן שנקנית בחו״ל", "magenta-400"],
  pick: ["הבחירה שלכם (טבעת)", "neutral-100"],
  best: ["★ הזוג שמשאיר הכי הרבה", "neutral-100"],
  band: ["טווח הרצועה", "neutral-700"],
  hedgeBoth: ["בלי נטרול (מלא) / עם נטרול (חלול)", "neutral-300"],
  chipNeutral: ["תווית רגילה", "neutral-100"],
  chipCaution: ["תווית שמבקשת משהו מכם", "amber-300"],
  chipOpen: ["תווית על כלל מס פתוח 🔒", "red-500"],
  periodStart: ["המחירים מההתחלה", "neutral-200"],
  periodSome: ["רק חלק מהמחירים", "neutral-300"],
  periodAfter: ["המחירון אחר כך", "neutral-400"],
};
export const X = Object.fromEntries(Object.entries(B).map(([k, [, s]]) => [k, S(s)]));
export const step = (k) => B[k][1];
export const SURF = { card: H("neutral-950"), popover: H("neutral-900"), picked: "#222927" };
