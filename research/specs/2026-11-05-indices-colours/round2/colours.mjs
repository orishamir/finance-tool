// Round 2: today's colours and the two variants' colour tables, as palette steps of site/app/theme.css (hex by ../rec/lib.mjs).
// The founder's priority (2026-11-05): inside a chart every part has its own clearly different hue; within one chart or panel a
// colour means one thing; a distant section may reuse a hue with another meaning; red, amber, green are status; blue and violet
// are never a series. Both variants share the fee bar, the chips, the own-price sheet's period strip; they differ in the fund kinds
// (dot plot, result card strips, their legends) and the hedging chart.

// Shared by V1 and V2
const FEE = { trade: "orange-500", custody: "gold-200", fixed: "magenta-400", fx: "neutral-200", other: "neutral-500", text: "neutral-950" };
const CHIP = {
  // label family -> ink (words, icon and edge); red only for an open rule or a real unknown, amber for a caution
  held: "neutral-400", // where the fund is held (Israel, a foreign fund on the Tel Aviv exchange, bought abroad): grey
  trade: "teal-300", // how it trades (ETF all day, tracking fund once a day): its own family, as on 27 October (teal-200 today; teal-200 is 8.1 / 4.1 from the white tax chip)
  follow: "magenta-400", // how it tracks the index
  currency: "gold-200", // exposure to the dollar, or hedged
  payout: "orange-500", // accumulating or distributing
  tax: "neutral-100", // a known tax fact (dividend tax inside the fund, tax on currency changes, tax on each distribution): calm, not red
  caution: "amber-200", open: "red-400",
};
// The own-price sheet's period strip: two hues, words in both. Teal while the group's prices hold (today's teal family, one step lighter
// so that it clears the grey "rest" part), near white for the price list after (gold today, which is also the custody fee in this panel)
const PERIOD = { group: "teal-400", groupText: "neutral-950", after: "neutral-50", afterText: "neutral-950" };
// The hedging section: today's pair of 29 October (teal without hedging, gold with it), and hollow for hedged as in the all-pairs chart
const HEDGE = { unhedged: "teal-400", hedged: "gold-200", hedgedHollow: true }; // teal-400: teal-300 is 15.9 / 10.6 from the bright dollar bars

export const V = {
  V1: {
    name: "Four kinds in four hues, only in the all-pairs chart",
    fee: FEE, chip: CHIP, period: PERIOD,
    kinds: { "il-tracking": "teal-300", "il-etf": "gold-200", "tase-foreign": "magenta-400", abroad: "orange-500" },
    mergeForeign: false,
    pick: "neutral-100", // pick ring and dashed path; the best pair is a star beside its dot
    lock: "red-400", // shown, not ranked: its tax rule is open; the blocked red (`--blocked`, the open-rule chip's lock); 11.0 / 10.1 from the orange dot under it (red-300 is 14.6 from gold, red-700 too dark at 2.4:1)
    strips: { mode: "two", account: "neutral-100", fund: "teal-400", band: "neutral-700" }, // no kind colour in the strips; the account strip names its fund
    hedge: HEDGE,
  },
  V2: {
    name: "Three kinds coloured in the result card and the all-pairs chart; the pick in the lists' teal",
    fee: FEE, chip: CHIP, period: PERIOD,
    kinds: { "il-tracking": "neutral-100", "il-etf": "gold-200", "tase-foreign": "magenta-400", abroad: "magenta-400" },
    mergeForeign: true,
    pick: "teal-300",
    lock: "red-400", // the blocked red, as the open-rule chip
    strips: { mode: "kind", band: "neutral-700" },
    hedge: HEDGE,
  },
};

// Today (the live page, and the 5 November drawings for the dot plot and the result card)
export const TODAY = {
  fee: { trade: "orange-500", custody: "gold-200", fixed: "red-500", fx: "magenta-400", other: "neutral-500" },
  kinds: { "il-tracking": "teal-300", "il-etf": "gold-200", "tase-foreign": "green-300", abroad: "magenta-400" },
  pick: "neutral-100",
  strips: { account: "teal-300", fund: "gold-200", band: "neutral-700" },
  hedge: { unhedged: "teal-300", hedged: "gold-200" },
  chip: { held: "neutral-200", trade: "teal-200", follow: "magenta-400", currency: "gold-200", tax: "rose-400", payout: "green-300", caution: "amber-200", open: "red-200" },
  period: { group: "teal-500", some: "teal-200", after: "gold-200" },
  dollar: { bright: "neutral-100", dim: "neutral-300" },
};

export const KIND_HE = {
  "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "קרן חוץ שנקנית בחו״ל", foreign: "קרן חוץ",
};
export const FEE_HE = { trade: "עמלות קנייה ומכירה", custody: "דמי משמרת", fixed: "דמי ניהול חשבון", fx: "המרת מטבע", other: "העמלות זו על זו" }; // one name for the grey part in the lists and in the sheet (the sheet says "עמלות אחרות" today); for the Hebrew editor
