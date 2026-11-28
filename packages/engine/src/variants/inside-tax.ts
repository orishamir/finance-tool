// The tax a fund bears on what it receives from its index (A-11, method F-107 and F-133): which case a fund is in, from what it is, and
// the two ends of that tax from the rates the rule files hold. One classification serves the run (`fundOf`) and every label a page shows
// (site/app/lib/labels.ts), so a fund is never counted one way and labelled another.
import { assertNever, type FundRecord } from "@finance-tool/schema";
import { heldDividendTax, netDeduction, type RatedPart } from "../formulas/inside-tax.ts";
import type { InsideTaxEndsLabel } from "../result.ts";

/** The fund countries F-107's table has a row for (TXF-54 to TXF-57). */
export type FundCountry = "ireland" | "luxembourg" | "us" | "israel";

/** A fund record's domicile as F-107's row; undefined for a country the table has none for, or one not known (TXF-53). */
export function fundCountryOf(domicile: string): FundCountry | undefined {
  switch (domicile) {
    case "IE":
      return "ireland";
    case "LU":
      return "luxembourg";
    case "US":
      return "us";
    case "IL":
      return "israel";
    default:
      return undefined;
  }
}

/** The company countries whose own rates the rule base has read (TXF-53), each a figure name of the rules in F-107's table. */
export type CompanyCountry = "us" | "uk" | "ch" | "fr" | "de" | "nl" | "jp" | "ca";

/** Where the companies of an index the person added are, among the regions F-107 bounds (method F-107, "On an index the person added"). */
export type DividendRegion = "us" | "europe" | "world";

/** F-107: the countries each region is bounded over, those of TXF-53 in it. */
export const REGION_COUNTRIES: Record<DividendRegion, readonly CompanyCountry[]> = {
  us: ["us"],
  europe: ["uk", "ch", "fr", "de", "nl"],
  world: ["us", "uk", "ch", "fr", "de", "nl", "jp", "ca"],
};

/** A part of an index whose dividends the site holds: its companies' countries (one on a collected index, a region's on an added one), yield and share, fractions. */
export interface DividendPart {
  countries: readonly CompanyCountry[];
  yield: number;
  weight: number;
}

/**
 * What the site holds of an index's dividends: on a collected index its parts from the provider's factsheet and the rule that gives its net
 * version's deduction (`net_deduction_rule`, null where it is not known); on an index the person added, the region they named and the
 * yield they typed, a fraction (D44), whose part spans the region's countries.
 */
export type IndexDividends = CollectedDividends | AddedDividends;
export type CollectedDividends = { source: "collected"; parts: readonly DividendPart[]; netRule: string | null };
export type AddedDividends = { source: "added"; region: DividendRegion; yield: number };

/** The parts an index's dividends give: a collected index's own; an added one's whole index over its region's countries. */
function partsOf(d: IndexDividends | undefined): readonly DividendPart[] {
  if (!d) return [];
  return d.source === "collected" ? d.parts : [{ countries: REGION_COUNTRIES[d.region], yield: d.yield, weight: 1 }];
}

/** A rule figure: the rule and the figure's name. */
type FigureRef = readonly [rule: string, figure: string];

/**
 * One cell of F-107 (b)'s table: the rate where the fund's claim is accepted and the company country's own rate, and, where they differ, the
 * open question that holds the claim open (the run's flag on the accepted rate).
 */
interface Cell {
  low: FigureRef;
  high: FigureRef;
  question?: string;
}

const DOMESTIC = "TXF-53";
const own = (c: CompanyCountry): FigureRef => [DOMESTIC, c];
const settled = (ref: FigureRef): Cell => ({ low: ref, high: ref });
const domestic = (c: CompanyCountry): Cell => settled(own(c));
const claim = (low: FigureRef, c: CompanyCountry, question: string): Cell => ({ low, high: own(c), question });

/**
 * F-107 (b)'s table, each fund country's row with its rule and a cell per company country, every rate a figure of a rule in `data/rules/`.
 * A cell whose low end the rule base leaves at the domestic rate (a treaty not read) is the domestic rate at both ends.
 */
export const INSIDE_TAX_ROWS: Record<FundCountry, { rule: string; cells: Record<CompanyCountry, Cell> }> = {
  ireland: {
    rule: "TXF-54",
    cells: {
      us: claim(["TXF-16", "irish_fund_us_dividend_treaty_rate"], "us", "TXF-OQ7"),
      uk: domestic("uk"),
      ch: claim(["TXF-54", "ch_accepted"], "ch", "TXF-OQ29"),
      fr: claim(["TXF-54", "fr_accepted"], "fr", "TXF-OQ29"),
      de: claim(["TXF-54", "de_accepted"], "de", "TXF-OQ29"),
      nl: domestic("nl"),
      jp: domestic("jp"),
      ca: domestic("ca"),
    },
  },
  luxembourg: {
    rule: "TXF-55",
    cells: {
      us: domestic("us"),
      uk: domestic("uk"),
      ch: domestic("ch"),
      fr: claim(["TXF-55", "fr_accepted"], "fr", "TXF-OQ29"),
      de: claim(["TXF-55", "de_accepted"], "de", "TXF-OQ29"),
      nl: domestic("nl"),
      jp: domestic("jp"),
      ca: domestic("ca"),
    },
  },
  us: {
    rule: "TXF-56",
    cells: {
      us: settled(["TXF-56", "us"]),
      uk: domestic("uk"),
      ch: settled(["TXF-56", "ch"]),
      fr: claim(["TXF-56", "fr_treaty"], "fr", "TXF-OQ29"),
      de: claim(["TXF-56", "de_accepted"], "de", "TXF-OQ29"),
      nl: domestic("nl"),
      jp: claim(["TXF-56", "jp_treaty"], "jp", "TXF-OQ29"),
      ca: claim(["TXF-56", "ca_treaty"], "ca", "TXF-OQ29"),
    },
  },
  israel: {
    rule: "TXF-57",
    cells: {
      us: claim(["TXF-57", "us_accepted"], "us", "TXS-OQ24"),
      uk: domestic("uk"),
      ch: claim(["TXF-57", "ch_accepted"], "ch", "TXF-OQ30"),
      fr: claim(["TXF-57", "fr_accepted"], "fr", "TXF-OQ30"),
      de: claim(["TXF-57", "de_accepted"], "de", "TXF-OQ30"),
      nl: domestic("nl"),
      jp: domestic("jp"),
      ca: domestic("ca"),
    },
  },
};

/** The flag of a figure bounded over a region's countries: countries the rule base has not read are outside its bounds (G-44). */
const REGION_FLAG = "TXF-OQ29";

/** Every flag an inside-tax figure can carry: the questions of F-107's open cells and the region's. */
export const INSIDE_TAX_FLAGS: readonly string[] = [
  ...new Set([...Object.values(INSIDE_TAX_ROWS).flatMap((row) => Object.values(row.cells).flatMap((c) => (c.question ? [c.question] : []))), REGION_FLAG]),
];

/**
 * What A-11 is for a fund the run counts it for, at one end or two:
 * - `held`: it holds the shares and bears F-107 (b)'s rates, at the accepted rate (`accepted`, a collected fund) or at both ends (a typed one);
 * - `net`: a swap fund with no years, read as paying the net index, bears its deduction (F-133 (a)): the fund's own statement, or the
 *   site's reading for a typed fund;
 * - `futures-net`: a typed futures fund on a collected index, 0 to the net index's deduction;
 * - `synthetic-domestic`: a typed swap or futures fund on an index the person added, 0 to the highest domestic rate over each part's countries;
 * - `way-not-known`: a typed fund whose way of following was not said, the widest of `held` and its swap reading (`net`, or the highest
 *   domestic rate, `domestic`);
 * - `none`: 0, where its years carry what it bore (F-133 (b)).
 */
export type InsideTaxBasis =
  | { kind: "held"; fund: FundCountry; ends: "accepted" | "both" }
  | { kind: "net"; statement: "fund" | "reading" }
  | { kind: "futures-net" }
  | { kind: "synthetic-domestic" }
  | { kind: "way-not-known"; fund: FundCountry; swap: "net" | "domestic" }
  | { kind: "none" };

/** A-11 as the run counts it: its basis, the index parts it rests on, the index's net rule, and F-133 (b)'s years where they apply. */
export interface InsideTax {
  basis: InsideTaxBasis;
  parts: readonly DividendPart[];
  /** The rule of the net index's deduction (F-133), where it is known. */
  netRule?: string;
  /** F-133 (b): F-92 (b)'s mean shortfall beyond the fees charged, before its floor, from years against that net index. */
  years?: { shortfall: number };
}

/**
 * Why a fund's inside tax is not counted, each said by its own label: a US fund that keeps its income (TXF-50); a swap, futures or mixed
 * fund the method has no deduction for (the S&P 500, the NASDAQ-100, mixed or collected futures with no years); a fund whose way of
 * following is not recorded or holds only some of the shares; an index with no part whose yield the site holds; a fund of a country F-107
 * has no row for.
 */
export type NotCounted = "us-keeps" | "synthetic" | "some-shares" | "no-parts" | "domicile";

/**
 * The case a fund is in (method A-11, F-107, F-133): its record's own figure or published gap stands; A-11 is counted (`InsideTax`);
 * its tax is counted in its gap against a gross index (F-133 (c)); or it is not counted, and why.
 */
export type InsideTaxCase = { kind: "own-figure" } | { kind: "counted"; tax: InsideTax } | { kind: "gap-gross" } | { kind: "not-counted"; why: NotCounted };

/** What the classification reads of a fund. */
export interface InsideTaxFund {
  domicile: string;
  replication: NonNullable<FundRecord["replication"]>["method"] | null;
  distribution: FundRecord["distribution_policy"];
  /** The record holds a withholding figure of its own or a published 12-month gap (A-11 (1), (2)). */
  ownFigure: boolean;
  /** The site read none of the fund's documents: a fund the person typed (D44). */
  typed: boolean;
}

/** What a fund's years give: its mean shortfall against a net benchmark (F-92 (d) compares it), or whether it is compared on a gross one. */
export interface InsideTaxYears {
  net: { shortfall: number } | null;
  gross: boolean;
}

/** One rule for every fund, collected or typed (method F-107): the case it is in, from what it is, its index and its years. */
export function insideTaxOf(fund: InsideTaxFund, dividends: IndexDividends | undefined, years: InsideTaxYears): InsideTaxCase {
  if (fund.ownFigure) return { kind: "own-figure" };
  const country = fundCountryOf(fund.domicile);
  const parts = partsOf(dividends);
  const netRule = dividends?.source === "collected" ? dividends.netRule : null;
  const keeps = country === "us" && fund.distribution !== "distributing";
  const counted = (basis: InsideTaxBasis, extra: Pick<InsideTax, "years"> = {}): InsideTaxCase => ({ kind: "counted", tax: { basis, parts, ...(netRule ? { netRule } : {}), ...extra } });
  const notCounted = (why: NotCounted): InsideTaxCase => ({ kind: "not-counted", why });
  const heldBasis = (c: FundCountry): InsideTaxBasis => ({ kind: "held", fund: c, ends: fund.typed ? "both" : "accepted" });
  // F-133 (b): years against a net index whose deduction is known, whatever way the fund follows it; w is F-107's where F-107 applies
  if (years.net && netRule && parts.length > 0) {
    const held = fund.replication === "physical" && country !== undefined && !keeps;
    return counted(held ? heldBasis(country) : { kind: "none" }, { years: years.net });
  }
  if (keeps) return notCounted("us-keeps");
  if (years.gross) return { kind: "gap-gross" };
  switch (fund.replication) {
    case "mixed":
      return country ? notCounted("some-shares") : notCounted("domicile");
    // what a swap or futures deduct is the index's, whatever the fund's country (TXS-41, F-133 (a))
    case "swap":
    case "futures": {
      if (parts.length === 0) return notCounted("synthetic");
      if (dividends?.source === "added") return fund.typed ? counted({ kind: "synthetic-domestic" }) : notCounted("synthetic");
      if (!netRule) return notCounted("synthetic");
      if (fund.replication === "swap") return counted({ kind: "net", statement: fund.typed ? "reading" : "fund" });
      return fund.typed ? counted({ kind: "futures-net" }) : notCounted("synthetic");
    }
    case "physical":
      if (!country) return notCounted("domicile");
      return parts.length === 0 ? notCounted("no-parts") : counted(heldBasis(country));
    case null: {
      if (!country) return notCounted("domicile");
      if (parts.length === 0) return notCounted("no-parts");
      // a US fund that pays out bears no US tax on its US companies however it follows its index (TXF-56); its other parts as it holds them
      if (country === "us" && !fund.typed) return counted(heldBasis(country));
      if (!fund.typed) return notCounted("some-shares");
      if (dividends?.source === "added") return counted({ kind: "way-not-known", fund: country, swap: "domestic" });
      return netRule ? counted({ kind: "way-not-known", fund: country, swap: "net" }) : notCounted("some-shares");
    }
    default:
      return assertNever(fund.replication);
  }
}

/**
 * Whether a counted case runs at two ends (method F-107, "One reading, or two ends"), from its structure alone, as a label says it before
 * any rate is read: a held part over several countries or on an open cell, at both ends; a typed synthetic fund, or one whose way is not said.
 */
export function hasTwoEnds(t: InsideTax): boolean {
  const b = t.basis;
  switch (b.kind) {
    case "held":
      return b.ends === "both" && t.parts.some((p) => p.countries.length > 1 || p.countries.some((c) => INSIDE_TAX_ROWS[b.fund].cells[c].question !== undefined));
    case "futures-net":
    case "synthetic-domestic":
    case "way-not-known":
      return true;
    case "net":
    case "none":
      return false;
    default:
      return assertNever(b);
  }
}

/** Whether a case's parts are the whole index: their shares add up to one (an index of US companies, or an added index's region). */
export const coversIndex = (t: Pick<InsideTax, "parts">): boolean => Math.abs(t.parts.reduce((a, p) => a + p.weight, 0) - 1) < 1e-9;

/** A rate a figure of a rule gives, as a fraction: the run reads it through its rule book, a page from the bundle's rules. */
export type RateOf = (rule: string, figure: string) => number;

/** Why a fund's A-11 has two ends, which the doubt on its figure says (method F-107, "One reading, or two ends"). */
export type InsideTaxWhy = InsideTaxEndsLabel["why"];

/** A-11 at each end, the rules it rests on, the open questions its accepted rate leaves, and the net index's deduction where read. */
export interface InsideTaxEnds {
  low: number;
  high: number;
  /** The rule a cautious label on the two ends names, and why there are two (`InsideTaxWhy`); absent at one end. */
  open?: { rule: string; why: InsideTaxWhy };
  /** Rules the run cites beside the figures it reads: TXS-41 where a swap's terms decide it, or on an Israeli fund. */
  cites: string[];
  flags: string[];
  formulas: ("F-107" | "F-133")[];
  /** F-133's `D`, where the case reads it. */
  deduction?: number;
}

/** F-107 (b) on each part: the least accepted rate and the greatest high rate over its countries, times its yield and share. */
function heldEnds(fund: FundCountry, parts: readonly DividendPart[], both: boolean, rate: RateOf): { low: number; high: number; flags: string[] } {
  const row = INSIDE_TAX_ROWS[fund].cells;
  const flags = new Set<string>();
  const low: RatedPart[] = [];
  const high: RatedPart[] = [];
  for (const p of parts) {
    const cells = p.countries.map((c) => row[c]);
    low.push({ rate: Math.min(...cells.map((c) => rate(...c.low))), yield: p.yield, weight: p.weight });
    if (both) high.push({ rate: Math.max(...cells.map((c) => rate(...c.high))), yield: p.yield, weight: p.weight });
    if (p.countries.length > 1) flags.add(REGION_FLAG);
    // at the accepted rate alone, the questions that hold each claim open stand on the figure; at two ends the cautious label says them
    else if (!both) for (const c of cells) if (c.question) flags.add(c.question);
  }
  const w = heldDividendTax(low);
  return { low: w, high: both ? heldDividendTax(high) : w, flags: [...flags] };
}

/** F-133: the net index's deduction over the parts, each part one company country at its provider's rate. */
function deductionOf(netRule: string, parts: readonly DividendPart[], rate: RateOf): number {
  return netDeduction(
    parts.map((p) => {
      const [c, ...more] = p.countries;
      if (!c || more.length > 0) throw new Error(`F-133: a net index's part is one company country; this one names ${p.countries.length}`);
      return { rate: rate(netRule, c), yield: p.yield, weight: p.weight };
    }),
  );
}

/** The highest domestic rate (TXF-53) over each part's countries, times its yield and share: the high end of a swap or futures on an added index. */
const domesticHigh = (parts: readonly DividendPart[], rate: RateOf): number =>
  heldDividendTax(parts.map((p) => ({ rate: Math.max(...p.countries.map((c) => rate(DOMESTIC, c))), yield: p.yield, weight: p.weight })));

const needNet = (t: InsideTax): string => {
  if (!t.netRule) throw new Error(`F-133: ${t.basis.kind} reads the net index's deduction, and the index has none known`);
  return t.netRule;
};

/** A-11 at its ends for a counted case (method F-107, F-133), every rate read through `rate`. */
export function insideTaxEnds(t: InsideTax, rate: RateOf): InsideTaxEnds {
  const b = t.basis;
  const deduction = t.years ? deductionOf(needNet(t), t.parts, rate) : undefined;
  const withYears = (e: Omit<InsideTaxEnds, "deduction">): InsideTaxEnds => (deduction === undefined ? e : { ...e, deduction, formulas: [...new Set([...e.formulas, "F-133" as const])] });
  switch (b.kind) {
    case "none":
      return withYears({ low: 0, high: 0, cites: [], flags: [], formulas: [] });
    case "held": {
      const e = heldEnds(b.fund, t.parts, b.ends === "both", rate);
      // the rates read are cited by their reading; the row's rule only holds a case at two ends open (its cautious label)
      const rule = INSIDE_TAX_ROWS[b.fund].rule;
      const cites = b.fund === "israel" ? ["TXS-41"] : [];
      return withYears({ low: e.low, high: e.high, ...(e.low !== e.high ? { open: { rule, why: "claim" as const } } : {}), cites, flags: e.flags, formulas: ["F-107"] });
    }
    case "net": {
      const d = deductionOf(needNet(t), t.parts, rate);
      return { low: d, high: d, cites: ["TXS-41"], flags: [], formulas: ["F-133"], deduction: d };
    }
    case "futures-net": {
      const netRule = needNet(t);
      const d = deductionOf(netRule, t.parts, rate);
      return { low: 0, high: d, open: { rule: netRule, why: "futures" }, cites: ["TXS-41"], flags: [], formulas: ["F-133"], deduction: d };
    }
    case "synthetic-domestic":
      return { low: 0, high: domesticHigh(t.parts, rate), open: { rule: DOMESTIC, why: "synthetic" }, cites: ["TXS-41"], flags: t.parts.some((p) => p.countries.length > 1) ? [REGION_FLAG] : [], formulas: ["F-107"] };
    case "way-not-known": {
      const held = heldEnds(b.fund, t.parts, true, rate);
      const swap = b.swap === "net" ? deductionOf(needNet(t), t.parts, rate) : null;
      const low = Math.min(held.low, swap ?? 0);
      const high = Math.max(held.high, swap ?? domesticHigh(t.parts, rate));
      return {
        low,
        high,
        open: { rule: INSIDE_TAX_ROWS[b.fund].rule, why: "way" },
        cites: ["TXS-41"],
        flags: held.flags,
        formulas: swap === null ? ["F-107"] : ["F-107", "F-133"],
        ...(swap === null ? {} : { deduction: swap }),
      };
    }
    default:
      return assertNever(b);
  }
}

/** The parts of a collected index (`us_dividends`, fractions): its US part, the whole index where the record gives no weight. */
export function collectedParts(us: { yield: number; weight: number } | undefined): DividendPart[] {
  return us ? [{ countries: ["us"], yield: us.yield, weight: us.weight }] : [];
}
