// A computed figure's working (lib/working.ts): the symbols of a drawn line are found as whole symbols, the line with values put in is made
// from the line and the inputs, and, for every figure a builder marks as a line of math, that line worked out (tex-eval.ts) comes to the
// figure its sheet heads with, to its last digit. The lines of a difference or a sum add up to the figure as written.
import { describe, expect, it } from "vitest";
import { paidInAsEntered, stretchRange, yearlyChanges } from "@finance-tool/engine";
import { formulaKeys, invest } from "../copy";
import { addedOf, inflationOf, leftOf, nominalOf } from "../components/invest/receipt";
import { loadFormulaTex } from "./data.server";
import { texNumber } from "./format";
import { dollarStretchChange, dollarYearChange, monthEndRate, nisPer } from "./fx";
import { loadFx, loadFxHistory } from "./fx.server";
import { buildIndicesBundle } from "./providers.server";
import { receiptChain } from "./receipt";
import { allPricedPairs } from "./receipt-fixtures";
import { evalTex } from "./tex-eval";
import { buildProductView } from "./track-browser";
import { buildTrackBrowser } from "./track-browser.server";
import { exposureShares } from "./track-exposure";
import { computed, entered, type SiteValue } from "./value";
import { digitsFor, headText, keyOfLine, paidInWorking, readable, receiptLines, standsFor, symbolsIn, withValues, type FormulaWorking } from "./working";

const tex = loadFormulaTex();
const today = "2026-11-26";

describe("the symbols of a drawn line", () => {
  it("are found whole: not inside a longer symbol, a script or a command", () => {
    const at = (line: string, symbols: string[]) => symbolsIn(line, symbols).map((f) => f.symbol);
    expect(at(String.raw`P = C_0 + 12 \times n \times C`, ["P", "C_0", "C", "n"])).toEqual(["P", "C_0", "n", "C"]);
    expect(at(String.raw`S_c = \frac{E_{\text{ILS}}}{E_c}`, ["S_c", String.raw`E_{\text{ILS}}`, "E_c", "E", "c", "r"])).toEqual(["S_c", String.raw`E_{\text{ILS}}`, "E_c"]);
    expect(at(String.raw`\left(\frac{r_{t+12H}}{r_t}\right)^{1/H} - 1`, ["r_t", "r_{t+12H}", "H"])).toEqual(["r_{t+12H}", "r_t", "H"]);
    expect(at(String.raw`Y^{nom} = Y \times I_T`, ["Y", "Y^{nom}", "I_T"])).toEqual(["Y^{nom}", "Y", "I_T"]);
  });
});

describe("a line with its values put in", () => {
  const value = (v: number, unit: SiteValue["unit"] = "nis_millions"): SiteValue => ({ ...entered(v, unit, today), state: "sourced", source: { url: "local", title: "x", publisher: "x", strength: "primary" }, update_rule: "market" });
  it("puts each input's number where its symbol stands, the thousands in TeX's braces", () => {
    const w: FormulaWorking = { kind: "formula", entry: "F-87", line: 0, symbols: { e: "E", a: "A" } };
    expect(withValues(String.raw`s = \frac{E}{A} \times 100`, w, { e: value(1325.38), a: value(1332.41) }, 10)).toBe(String.raw`s = \frac{1{,}325.38}{1{,}332.41} \times 100`);
  });
  it("writes a percent with TeX's percent sign and a negative in brackets", () => {
    const w: FormulaWorking = { kind: "formula", entry: "F-107", line: 0, symbols: { r: String.raw`\rho`, y: "y_{US}", s: "s_{US}" } };
    expect(withValues(String.raw`w = \rho \times y_{US} \times s_{US}`, w, { r: value(15, "pct"), y: value(-1.2, "pct"), s: value(62.5, "pct") }, 6)).toBe(String.raw`w = 15\% \times (-1.2\%) \times 62.5\%`);
  });
  it("writes a sum over a symbol several inputs stand for as their values added up", () => {
    const w: FormulaWorking = { kind: "formula", entry: "F-99", line: 0, symbols: {}, terms: "A_i" };
    expect(withValues(String.raw`S = \sum_i A_i`, w, { a: value(1), b: value(2.5), c: value(1000) }, 6)).toBe(String.raw`S = 1 + 2.5 + 1{,}000`);
  });
  it("is none where a symbol of its right side has no input, or an input no number", () => {
    const w: FormulaWorking = { kind: "formula", entry: "F-107", line: 0, symbols: { r: String.raw`\rho`, y: "y_{US}" } };
    expect(withValues(String.raw`w = \rho \times y_{US} \times s_{US}`, w, { r: value(15, "pct"), y: value(1.2, "pct") }, 6)).toBeNull();
    expect(withValues(String.raw`w = \rho \times y_{US}`, w, { r: value(15, "pct"), y: { ...value(1), value: null, notes: "x" } }, 6)).toBeNull();
  });
  it("reads as math only numbers, operators, brackets and the commands of a calculation", () => {
    expect(readable(String.raw` \left(\frac{3.5}{2}\right)^{1/10} - 1 + 15\% \times \min(1, 2)`)).toBe(true);
    expect(readable(String.raw` 2 \times n`)).toBe(false);
    expect(readable(String.raw` \sum_i 2`)).toBe(false);
  });
  it("prints a number to the digits asked, never fewer than its whole part, trailing zeros dropped", () => {
    expect(texNumber(1.218994419994757, 6)).toBe("1.21899");
    expect(texNumber(123456789.4, 6)).toBe("123{,}456{,}789");
    expect(texNumber(0.0123456, 3)).toBe("0.0123");
    expect(texNumber(-2.5, 6)).toBe("-2.5");
  });
});

describe("the evaluator the tests work lines out with", () => {
  it("reads the operations, fractions, powers, brackets, percents, min and max", () => {
    expect(evalTex(String.raw`s = \frac{1{,}325.38}{1{,}332.41} \times 100`)).toBeCloseTo((1325.38 / 1332.41) * 100, 12);
    expect(evalTex(String.raw`\left(\frac{4}{2}\right)^{1/2} - 1`)).toBeCloseTo(Math.SQRT2 - 1, 12);
    expect(evalTex(String.raw`15\% \times (-1.2\%) \times 62.5\%`)).toBeCloseTo(0.15 * -0.012 * 0.625, 15);
    expect(evalTex(String.raw`P = 10{,}000 + 12 \times 10 \times 500`)).toBe(70000);
    expect(evalTex(String.raw`\max(1, \min(5, 3)) - 2 \div 4`)).toBe(2.5);
  });
  it("throws on a symbol left in the line", () => {
    expect(() => evalTex(String.raw`2 \times n`)).toThrow();
  });
});

/** Every value reachable from `roots` through the inputs of what is computed. */
function walk(roots: readonly (SiteValue | null | undefined)[]): SiteValue[] {
  const seen = new Set<SiteValue>();
  const go = (v: SiteValue | null | undefined) => {
    if (!v || typeof v !== "object" || seen.has(v)) return;
    seen.add(v);
    for (const input of Object.values((v.computed_from?.inputs ?? {}) as Record<string, SiteValue>)) go(input);
  };
  for (const r of roots) go(r);
  return [...seen];
}

/** The number a head writes, with the size of its last digit: "−7.73%" is −7.73 to 0.01, "1,234 ₪" 1,234 to 1. */
function headNumber(head: string): { n: number; unit: number } {
  const t = head.replace(/[^\d.−-]/g, "");
  const n = Number(t.replace("−", "-"));
  const decimals = t.includes(".") ? t.length - t.indexOf(".") - 1 : 0;
  return { n, unit: 10 ** -decimals };
}

/** The drawn lines whose own symbol is a percent in percent numbers (`× 100`); any other line works out a percent figure as a fraction. */
const PERCENT_LINES = new Set(["F-87#0", "F-88#0"]);
const PERCENT_UNITS = new Set(["pct", "pct_per_year", "pct_of_deposit", "pct_of_trade", "pct_of_balance_per_period"]);

/**
 * Checks each figure marked as a line of math: its symbols are the line's and its key's, each stands for one of its inputs, every input with
 * a number stands for one, and the line with its values put in comes to the head's figure within half its last digit. Returns the lines,
 * by name, that were drawn with no values.
 */
function checkFormulas(values: readonly SiteValue[]): { checked: number; noValues: Set<string> } {
  let checked = 0;
  const noValues = new Set<string>();
  for (const v of values) {
    const w = v.computed_from?.working;
    if (w?.kind !== "formula" || typeof v.value !== "number") continue;
    const name = `${w.entry}#${w.line}`;
    const line = tex[w.entry]?.[w.line] ?? "";
    expect(line, name).not.toBe("");
    const inputs = (v.computed_from?.inputs ?? {}) as Record<string, SiteValue>;
    const keyRows = formulaKeys[w.entry]?.symbols ?? [];
    const key = keyRows.map(([s]) => s);
    for (const k of Object.keys(w.symbols)) expect(inputs[k], `${name}: ${k}`).toBeTruthy();
    for (const s of [...Object.values(w.symbols), ...(w.terms ? [w.terms] : [])]) {
      expect(key, `${name}: ${s}`).toContain(s);
      expect(symbolsIn(line, [s]).length, `${name}: ${s} in the line`).toBeGreaterThan(0);
    }
    // every input that holds a number stands for a symbol of the line, and the key lists each once
    const standing = [...standsFor(w, inputs).values()].flat().sort();
    for (const [k, input] of Object.entries(inputs)) if (typeof input.value === "number") expect(standing, `${name}: input ${k} stands for a symbol`).toContain(k);
    expect(keyOfLine(line, keyRows, w, inputs).flatMap((r) => r.inputs.map((x) => x.key)).sort(), name).toEqual(standing);
    // the key has a row for the symbol a line with an "=" works out, the figure the sheet heads with, and only one
    expect(keyOfLine(line, keyRows, w, inputs).filter((r) => r.result).map((r) => r.tex), name).toHaveLength(line.includes("=") ? 1 : 0);
    const head = headText(v, false);
    const worked = withValues(line, w, inputs, digitsFor(head));
    if (worked === null) {
      noValues.add(name);
      continue;
    }
    const { n, unit } = headNumber(head);
    const scale = PERCENT_UNITS.has(v.unit) && !PERCENT_LINES.has(name) ? 100 : 1;
    const got = evalTex(worked) * scale;
    expect(Math.abs(got - n), `${name} ${v.about ?? ""}: ${worked} = ${got}, the head ${head}`).toBeLessThanOrEqual(unit * 0.501);
    checked++;
  }
  return { checked, noValues };
}

/** The lines of each difference and sum add up, as the page writes each, to the figure as its head writes it. */
function checkReceipts(values: readonly SiteValue[]): number {
  let checked = 0;
  for (const v of values) {
    const w = v.computed_from?.working;
    if (!w || w.kind === "formula" || typeof v.value !== "number") continue;
    const lines = receiptLines(w, (v.computed_from?.inputs ?? {}) as Record<string, SiteValue>);
    if (lines.some((l) => typeof l.input.value !== "number")) continue;
    const sum = lines.reduce((t, l) => t + (l.sign === "minus" ? -1 : 1) * headNumber(headText(l.input, false)).n, 0);
    const { n, unit } = headNumber(headText(v, false));
    expect(Math.abs(sum - n), `${v.computed_from?.formula ?? ""} ${v.about ?? ""}: ${lines.map((l) => l.key).join(" / ")}`).toBeLessThanOrEqual(unit * 0.501);
    checked++;
  }
  return checked;
}

describe("every figure marked as a line of math comes to its head when its line is worked out", () => {
  it("the share of a provident track exposed to shares and to foreign currency, and a company's assets in a product (F-87, F-88, F-99)", () => {
    const data = buildTrackBrowser();
    const values: SiteValue[] = [];
    for (const p of data.products) {
      for (const r of p.rows) {
        const e = exposureShares(r.h, p.templates.holdings, p.period, data.today);
        for (const v of [e?.stock, e?.currency]) if (v) values.push(v);
      }
      for (const c of buildProductView(data, p.id)?.companies ?? []) if (c.assets) values.push(c.assets);
    }
    const { checked, noValues } = checkFormulas(values);
    expect(checked).toBeGreaterThan(500);
    expect([...noValues]).toEqual([]);
  });

  it("a cross rate, and the dollar's change in each year and over each stretch (F-84, F-93)", () => {
    const fx = loadFx();
    const history = loadFxHistory();
    if (!fx || !history) throw new Error("the ECB's rates are in data/series");
    const values: SiteValue[] = Object.keys(fx.perEur).flatMap((c) => nisPer(fx, c, today) ?? []);
    values.push(...history.points.map((p) => monthEndRate(history, p, today, p.date)));
    values.push(...yearlyChanges(history.points).map((y) => dollarYearChange(history, y.year, y.pct, today, String(y.year))));
    for (const years of [1, 3, 10, 20]) {
      const s = stretchRange(history.points, years);
      if (!s) continue;
      const y = [invest.planInputs.years, years] as const;
      values.push(dollarStretchChange(history, s.lowAt, s.low, y, today, "low"), dollarStretchChange(history, s.highAt, s.high, y, today, "high"));
    }
    const { checked, noValues } = checkFormulas(values);
    expect(checked).toBeGreaterThan(200);
    expect([...noValues]).toEqual([]);
  });

  it("what was paid in, the US tax inside an Irish fund, a receipt line in the shekels of the horizon and what the inflation takes (F-106, F-107, F-129, F-130)", () => {
    const bundle = buildIndicesBundle();
    const roots: SiteValue[] = [];
    for (const [index, years, monthly] of [["index-sp500", 10, 500], ["index-msci-world", 25, 0], ["index-msci-acwi", 7, 1000]] as const) {
      for (const pc of allPricedPairs(bundle, index, { years, monthly })) {
        const ch = receiptChain(pc);
        roots.push(pc.paidIn, pc.left, pc.fund, pc.tax, pc.baseValue, inflationOf(pc, ch, invest.pair.taxLine, bundle.today), addedOf(pc, bundle.today), leftOf(pc, bundle.today), nominalOf(pc, pc.left, invest.receipt.left, bundle.today));
      }
    }
    const values = walk(roots);
    const { checked, noValues } = checkFormulas(values);
    const entries = new Set(values.flatMap((v) => (v.computed_from?.working?.kind === "formula" ? [v.computed_from.working.entry] : [])));
    // the rates a run in a foreign currency reads, cross rates, are among the inputs too
    expect([...entries].sort()).toEqual(["F-106", "F-107", "F-129", "F-130", "F-84"]);
    expect(checked).toBeGreaterThan(100);
    // the S&P 500 is an index of US companies alone: its funds' US tax has no weight among the inputs (the method's 1), so its line is
    // drawn with the key and no values
    expect([...noValues]).toEqual(["F-107#0"]);
    expect(checkReceipts(values)).toBeGreaterThan(100);
    // a line the receipt writes in whole shekels keeps its own working where the figure as written is that number (`asWritten`), and the
    // checks above work each such working out to the number its row shows
    const rewritten: string[] = [invest.receipt.parts.account, invest.receipt.parts.fund, invest.pair.waiting];
    const lines = values.filter((v) => v.computed_from?.formula === "F-129").flatMap((v) => Object.entries(v.computed_from!.inputs as Record<string, SiteValue>).filter(([k]) => rewritten.includes(k)).map(([, x]) => x));
    expect(lines.length).toBeGreaterThan(10);
    expect(lines.filter((x) => x.computed_from?.working?.kind === "formula").length).toBeGreaterThan(lines.length / 2);
  });

  it("what was paid in, at any amount, monthly deposit and years (F-106, the guides' timeline and the receipt)", () => {
    for (const [a, m, n] of [[0, 0, 1], [10000, 500, 10], [123456, 3210, 37], [1, 1, 50]] as const) {
      const inputs = { a: entered(a, "nis", today), m: entered(m, "nis_per_month", today), n: entered(n, "years", today) };
      const v = computed(paidInAsEntered(a, m, n), "nis", "F-106", inputs, { today, working: paidInWorking("a", "m", "n") });
      expect(checkFormulas([v]).checked).toBe(1);
    }
  });
});
