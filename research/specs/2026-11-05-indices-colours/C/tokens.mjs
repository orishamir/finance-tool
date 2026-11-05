// Option C ("one vocabulary"): every colour the indices page draws, as palette steps. The single source for live.mjs,
// gen.mjs, check.mjs and swatches.mjs. Run from the repository root.
export const C = {
  // where the fund is bought (the dot plot's kinds, the strips' ticks, the kind chips); shape tells the kind inside a place
  israel: "magenta-400", // Israeli tracking fund ●, Israeli ETF ■, foreign fund on the Tel Aviv exchange ▲
  abroad: "orange-500", // fund bought abroad ◆, and the currency conversion fee paid to buy it
  // the account's fees, by what they pay for
  trade: "rose-600", // buy-and-sell fee
  keep: "gold-200", // keeping the account: custody fee and fixed account fee
  fx: "orange-500", // currency conversion fee = abroad
  rest: "neutral-400", // the fees on one another (no colour)
  // no colour: hedging is told by fill (solid = moves with the dollar, hollow = hedged)
  unhedged: "neutral-300",
  hedged: "neutral-300",
  plainChip: "neutral-400", // follow, currency, tax, payout chips: icon and words only
  chipCaution: "amber-300", // a chip that asks something of the reader (words and icon), on this page
  chipBlocked: "red-100", // a chip on an open rule (words and lock), on this page
  period: ["neutral-50", "neutral-300", "neutral-500"], // own-price sheet: from the start, some still hold, the price list after (ordinal)
  pick: "teal-300", // the reader's pick (ring), the picked row, ★ the best, links: unchanged
  path: "neutral-100", // the dashed path and the best dot's outline (foreground ink)
};
