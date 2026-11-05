import { run, pick, H, CARD, POP, SEL } from "./run.mjs";
const g = (name, status, meanings, pairs, surface = CARD) => ({ name, status, meanings, pairs, surface });
const groups = [
  g("Account rows: fee bar per row + its legend (stays)", "stays", [["trade: buy and sell fee", "orange-500"], ["custody fee", "gold-200"], ["fixed account fee", "red-500"], ["currency conversion fee", "magenta-400"], ["rest of the account cost (remainder)", "neutral-500"]], "all"),
  g("Account rows: fee bar, chromatic parts only", "stays", [["trade", "orange-500"], ["custody", "gold-200"], ["fixed", "red-500"], ["fx", "magenta-400"]], "all"),
  g("Account rows: fee bar in legend order (adjacent)", "stays", [["trade", "orange-500"], ["custody", "gold-200"], ["fixed", "red-500"], ["fx", "magenta-400"], ["remainder", "neutral-500"]], "adjacent"),
  g("Account rows: fee bar on the selected row's teal tint", "stays", [["trade", "orange-500"], ["custody", "gold-200"], ["fixed", "red-500"], ["fx", "magenta-400"]], "all", SEL),
  g("Own-account sheet: list vs yours cost bars + legend (popover)", "stays", [["trade", "orange-500"], ["custody", "gold-200"], ["fixed", "red-500"], ["fx", "magenta-400"], ["remainder", "neutral-500"]], "all", POP),
  g("Own-account sheet: period strip (first / middle / after)", "stays", [["the group's prices from the start", "teal-500"], ["only some still hold", "teal-200"], ["the price list after", "gold-200"]], "all", POP),
  g("Fund list group heads + dollar section fund bars (unhedged / hedged)", "stays", [["keeps the index's currency (unhedged)", "teal-300"], ["neutralises the currency (hedged)", "gold-200"]], "all"),
  g("Fund label chips (icon and words), one row and the filter row", "stays", [["held: where it is held", "neutral-200"], ["trade: how it trades", "teal-200"], ["follow: how it tracks", "magenta-400"], ["currency: exposure / hedged", "gold-200"], ["tax", "rose-400"], ["payout: accumulating / distributing", "green-300"], ["asks something of you (caution)", "amber-200"], ["open tax rule (blocked)", "red-200"]], "all"),
  g("Fund label chips: the six family hues only", "stays", [["held", "neutral-200"], ["trade", "teal-200"], ["follow", "magenta-400"], ["currency", "gold-200"], ["tax", "rose-400"], ["payout", "green-300"]], "all"),
  g("NEW result card strips (mockup: account, fund)", "new", [["the account strip: same fund at every account", "teal-300"], ["the fund strip: every fund at that account", "gold-200"]], "all"),
  g("NEW all-pairs dot plot by kind of fund (mockup k1..k4)", "new", [["Israeli tracking fund", "teal-300"], ["Israeli ETF", "gold-200"], ["foreign fund on TASE", "green-300"], ["fund bought abroad", "magenta-400"]], "all"),
  g("NEW dot plot + its ring/best outline (foreground)", "new", [["Israeli tracking fund", "teal-300"], ["Israeli ETF", "gold-200"], ["foreign fund on TASE", "green-300"], ["fund bought abroad", "magenta-400"], ["ring / best outline / path", "neutral-100"]], "all"),
  g("LEAVES hero cost bars (two bars + legend)", "leaves", [["trade", "orange-500"], ["custody", "gold-200"], ["fixed", "red-500"], ["fx", "magenta-400"], ["remainder", "neutral-500"], ["fund's own fees", "green-300"], ["tax", "rose-600"]], "all"),
  g("LEAVES plan-number change chart (levers)", "leaves", [["monthly deposit", "orange-500"], ["years", "gold-200"], ["amount today", "teal-300"], ["return a year", "magenta-400"]], "all"),
  g("LEAVES stairs", "leaves", [["start", "neutral-600"], ["account", "teal-300"], ["kind of fund", "magenta-400"], ["fund", "gold-200"], ["more money", "gain"], ["less money", "loss"]], "all"),
  g("Status and ink hues on the page (never series)", "stays", [["link/action teal", "teal-300"], ["entered blue", "blue-300"], ["computed violet", "violet-400"], ["caution amber", "amber-400"], ["blocked red", "red-400"], ["positive green", "green-400"]], "all"),
];
const res = [];
for (const G of groups) {
  const hexes = G.meanings.map(([, k]) => H(k));
  const out = run(hexes, G.surface, G.pairs);
  const lines = ["Lightness band", "Chroma floor", "CVD separation", "Normal-vision floor", "Contrast vs surface"].map((n) => pick(out, n));
  // every pair through the validator, two colours at a time
  const pairs = [];
  for (let i = 0; i < hexes.length; i++) for (let j = i + 1; j < hexes.length; j++) {
    const o = run([hexes[i], hexes[j]], G.surface, "all");
    const nv = +(pick(o, "Normal-vision").match(/ΔE ([\d.]+)/) || [])[1];
    const cv = +(pick(o, "CVD separation").match(/ΔE ([\d.]+)/) || [])[1];
    const cvk = (pick(o, "CVD separation").match(/\((\w+)\)/) || [])[1];
    if (nv < 15 || cv < 8) pairs.push(`${G.meanings[i][1]} ${hexes[i]} / ${G.meanings[j][1]} ${hexes[j]}: normal ${nv}, CVD ${cv} (${cvk})`);
  }
  res.push({ ...G, hexes, lines, weak: pairs, cmd: `validate_palette.js "${hexes.join(",")}" --mode dark --surface "${G.surface}"${G.pairs === "all" ? " --pairs all" : ""}` });
}
console.log(JSON.stringify(res, null, 1));
