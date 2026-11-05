// The recommended colours for the indices page, in one place: palette steps from site/app/theme.css.
export const R = {
  fee: "orange-500", // every part of an account's fee bar: one colour, the site's fee colour; parts split by a gap and named in words
  kTracking: "rose-300", // Israeli tracking fund (dot, strip tick); was teal-300 in the D59 drawing
  kEtf: "gold-200", // Israeli ETF; gold as in the D59 drawing
  kForeign: "magenta-400", // foreign fund: bought abroad (circle) or on the Tel Aviv exchange (triangle)
  pickRing: "neutral-100", // the reader's pick (ring), the best pair's outline, the dashed path, as in the D59 drawing
  band: "neutral-700", // the strips' range band (structure)
  hedge: "teal-600", // the hedging chart's fund bars: solid without hedging, hollow with it (teal: value)
  chip: "neutral-400", // every label chip's ink: no family colour; icon and words
  blockedWords: "red-400", // on this page, open-rule chip and tag words, and an input error: red-400 (the lock's colour)
  period: ["neutral-50", "neutral-300", "neutral-500"], // own-price sheet period strip, in time order, with words
};
export const LABEL = {
  fee: "עמלות החשבון (כל חלק בשמו)", kTracking: "קרן מחקה ישראלית", kEtf: "קרן סל ישראלית", kForeign: "קרן חוץ", pickRing: "הבחירה שלכם, הזוג הטוב והדרך",
};
