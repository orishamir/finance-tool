// D90 revised: a fee card's verdict follows what bringing the fee to the average is worth, the figure under its
// reduction field, not what the fee costs: "שווה להתקשר" beside a cut worth 108 or 187 NIS over ten years reads as advice to call.
// Checked on the rendered words of every fee card the fee page draws, over several plans: "worth negotiating" never
// sits beside a worth below the threshold, and a card that says "not now" says when the discount ends.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { r3fees } from "../../copy";
import { compareBundle } from "../../lib/compare.server";
import { buildFeesData } from "../../lib/fees.server";
import { feeLines } from "@finance-tool/engine";
import { buildFees, feeInputs, lineRate, ruleMap, type FeesResult, type LineView } from "../../lib/fees";
import { FeeRow } from "./FeeRow";

const bundle = compareBundle();
const data = buildFeesData();
const rules = ruleMap(bundle, data);
const plans: Record<string, number>[] = [
  {},
  { amount_now: 60_000, monthly_deposit: 0, horizon_years: 10 },
  { amount_now: 300_000, monthly_deposit: 3_000, horizon_years: 25 },
  { amount_now: 1_000_000, monthly_deposit: 10_000, horizon_years: 40 },
];
const wrappers = ["kupat-gemel-lehashkaa", "keren-hishtalmut", "brokerage-account", "government-bond", "makam", "money-market-fund-daily"];

/** Every card's words, with the worth the field shows (the first "שווה <figure> ₪" after the field's label), and the line behind it. */
function cards() {
  const out: { page: string; text: string; worthShown: number | null; worthNis: number; reason: string; line: LineView; better: string[]; anyWithout: boolean }[] = [];
  for (const entered of plans) {
    const inputs = feeInputs(bundle, null, { entered, age: null, employment: null });
    for (const id of wrappers) {
      const r: FeesResult = buildFees(bundle, data, { kind: "wrapper", wrapperId: id }, inputs);
      if (r.kind !== "ok") continue;
      for (const line of r.analysis.lines) {
        const html = renderToStaticMarkup(
          createElement(MemoryRouter, null, createElement(FeeRow, { line, an: r.analysis, subject: r.subject, years: inputs.g.horizonYears, thresholds: r.analysis.thresholds, reduction: null, onReduce: () => {}, rules })),
        );
        const text = html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/\s+/g, " ");
        // the field's label is said twice (for screen readers and on the screen): the worth follows the last
        const at = text.lastIndexOf(r3fees.reduction.label);
        const after = at < 0 ? "" : text.slice(at + r3fees.reduction.label.length);
        const m = after.match(/שווה\s*([\d,]+(?:\.\d+)?)\s*₪/);
        // apart from the page's code: the options on the page's own comparison that rank above the product (or every ranked one, when the
        // product has no place) and charge no such fee, or a lower rate of it than the rate the card judges
        const set = r.comparison;
        const own = set?.ranks[id];
        const judged = line.judgedFraction ?? line.rateFraction;
        const better = (set?.candidates ?? [])
          .filter((c) => c.id !== id && c.plan && set!.ranks[c.id] !== undefined && (own === undefined || set!.ranks[c.id]!.rank < own.rank))
          .filter((c) => !feeLines(c.plan!).includes(line.line) || (judged !== undefined && (lineRate(c.plan!, line.line) ?? Infinity) < judged - 1e-12))
          .map((c) => c.id);
        const anyWithout = (set?.candidates ?? []).some((c) => c.id !== id && c.plan && c.run && !feeLines(c.plan).includes(line.line));
        out.push({ page: `${id} ${JSON.stringify(entered)} ${line.line}`, text, worthShown: m ? Number(m[1]!.replace(/,/g, "")) : null, worthNis: line.worthNis, reason: line.reason, line, better, anyWithout });
      }
    }
  }
  return out;
}

describe("a fee card's verdict follows the worth beside it (D90 revised)", () => {
  const all = cards();
  const threshold = 1000;
  // the verdict's words, not the line that says what would make a cut worth it ("שווה להתמקח כשסכום היום …", held in the card's room too)
  const says = (text: string) => text.split(r3fees.verdict.negotiate!).slice(1).some((rest) => !rest.startsWith(" כש"));
  const negotiate = all.filter((c) => says(c.text));

  it("'worth negotiating' never sits beside a worth below the threshold", () => {
    for (const c of negotiate) {
      expect(c.worthShown, c.page).not.toBeNull();
      expect(c.worthShown!, c.page).toBeGreaterThanOrEqual(threshold);
      expect(c.worthNis, c.page).toBeGreaterThanOrEqual(threshold);
    }
  });

  it("the check is not empty: some plans make a cut worth negotiating, and some cards show a smaller worth without it", () => {
    expect(negotiate.length).toBeGreaterThan(0);
    const small = all.filter((c) => c.worthShown !== null && c.worthShown < threshold);
    expect(small.length).toBeGreaterThan(0);
    for (const c of small) expect(says(c.text), c.page).toBe(false);
  });

  it("a card that is not worth negotiating now because the discount ends later says 'not now' and when the discount ends", () => {
    const later = all.filter((c) => c.reason === "check-after");
    expect(later.length).toBeGreaterThan(0);
    for (const c of later) {
      expect(c.text, c.page).toContain(r3fees.verdictLater);
      expect(c.text, c.page).toContain(r3fees.reason.ends.lead.trim());
      expect(c.text, c.page).toContain(r3fees.reason.ends.end.replace(/^:\s*/, ""));
    }
  });
});

// D90 revised: "worth avoiding" does not fit a product ranked first or second among every option. A card says "avoid" only when an option without the fee, or with a lower one, ranks above the product on the page's own
// comparison for the same plan; otherwise it gives the negotiate verdict alone. Checked on the rendered words of every card.
describe("a fee card says 'avoid' only with something better to pick (D90 revised the same day)", () => {
  const all = cards();
  const avoidWord = r3fees.verdict.avoid!;

  it("no card says 'avoid' on a product that no option without the fee, or with a lower one, outranks", () => {
    for (const c of all.filter((x) => x.text.includes(avoidWord))) {
      expect(c.better.length, c.page).toBeGreaterThan(0);
      // the card names the options it means, every one of them ranked above the product
      for (const o of c.line.removedBy) expect(c.better, c.page).toContain(o.id);
    }
  });

  it("the check is not empty: some cards say 'avoid', and some cards whose fee would pass the cost test say the negotiate verdict alone", () => {
    expect(all.some((c) => c.text.includes(avoidWord))).toBe(true);
    const held = all.filter((c) => c.anyWithout && c.better.length === 0 && c.line.costNis >= 1000);
    expect(held.length).toBeGreaterThan(0);
    for (const c of held) expect(c.text.includes(avoidWord), c.page).toBe(false);
  });

  it("no card keeps the softened 'relatively expensive' word", () => {
    for (const c of all) expect(c.text, c.page).not.toContain("יקר יחסית");
  });
});

// company names from the data showed בע"מ with an ASCII quote. The fee page draws in the browser, so the built-pages
// guard (scripts/hebrew-quotes.mjs) never sees it: its cards and its strip are checked here, as rendered.
describe("the fee page writes an abbreviation with its gershayim", () => {
  it("no card and no strip shows an ASCII quote between two Hebrew letters", async () => {
    const { SubjectStrip } = await import("./parts");
    for (const c of cards()) expect(c.text, c.page).not.toMatch(/[א-ת]"[א-ת]/);
    const inputs = feeInputs(bundle, null, { entered: {}, age: null, employment: null });
    for (const id of wrappers) {
      const r = buildFees(bundle, data, { kind: "wrapper", wrapperId: id }, inputs);
      if (r.kind !== "ok") continue;
      const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SubjectStrip, { subject: { ...r.subject, record: 'מיטב גמל ופנסיה בע"מ' }, publisherNames: {} })));
      expect(html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"'), id).not.toMatch(/[א-ת]"[א-ת]/);
    }
  });
});

// "what would push the 187 ₪ past 1,000 ₪?". The card's line names an amount today and a number of years;
// each is checked here by building the page again at that value, as a reader who types it would: the cut must then be worth the threshold,
// and a year fewer must not be (the fewest years, not just enough).
describe("the 'worth negotiating when' line states values that really reach the threshold", () => {
  it("the amount and the years it names give a cut worth the negotiate threshold", async () => {
    const { feeSensitivity } = await import("../../lib/fees");
    let checked = 0;
    for (const entered of [{}, { amount_now: 60_000, monthly_deposit: 0, horizon_years: 10 }, { horizon_years: 3 }] as Record<string, number>[]) {
      for (const id of ["kupat-gemel-lehashkaa", "keren-hishtalmut"]) {
        const at = (e: Record<string, number>) => {
          const r = buildFees(bundle, data, { kind: "wrapper", wrapperId: id }, feeInputs(bundle, null, { entered: e, age: null, employment: null }));
          if (r.kind !== "ok") throw new Error(`${id} ${r.kind}`);
          return r;
        };
        const r = at(entered);
        const T = r.analysis.thresholds.values.negotiateNis;
        const s = feeSensitivity(r.args, r.analysis, bundle)!;
        for (const [line, x] of Object.entries(s.reach)) {
          const base = r.analysis.lines.find((l) => l.line === line)!;
          expect(base.worthNis, `${id} ${line}`).toBeLessThan(T);
          if (x?.amountNow !== undefined) {
            const w = at({ ...entered, amount_now: x.amountNow }).analysis.lines.find((l) => l.line === line)!.worthNis;
            expect(w, `${id} ${line} at ${x.amountNow}`).toBeGreaterThanOrEqual(T);
            checked++;
          }
          if (x?.horizonYears !== undefined) {
            const w = at({ ...entered, horizon_years: x.horizonYears }).analysis.lines.find((l) => l.line === line)!.worthNis;
            expect(w, `${id} ${line} at ${x.horizonYears} years`).toBeGreaterThanOrEqual(T);
            const fewer = at({ ...entered, horizon_years: x.horizonYears - 1 }).analysis.lines.find((l) => l.line === line)!.worthNis;
            expect(fewer, `${id} ${line} at ${x.horizonYears - 1} years`).toBeLessThan(T);
            checked++;
          }
        }
      }
    }
    // the study fund at the page's numbers names 170,000 ₪, and at 60,000 ₪ for ten years names 190,000 ₪ or 36 years
    expect(checked).toBeGreaterThanOrEqual(3);
  }, 60_000);
});
