// Number, date and identifier formats: docs/design-system.md 2.7. Always Intl with he-IL; never hand-built.
import { numbers, values as valuesCopy } from "../copy";
import { countPhrase } from "./count";
import { numberFormat, plainNumber, withMinus } from "./number-format";
import { agorotOfShekels } from "./agorot";

export { countPhrase, type CountWords } from "./count";
export { withMinus } from "./number-format";

const he = "he-IL";

/** Hebrew alphabetical order, for sorting names. */
export const heCollator = new Intl.Collator("he");
const currency = numberFormat({ style: "currency", currency: "ILS", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyWhole = numberFormat({ style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const dollars = numberFormat({ style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dollarsWhole = numberFormat({ style: "currency", currency: "USD", maximumFractionDigits: 0 });
const euros = numberFormat({ style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pounds = numberFormat({ style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
/**
 * A sum written with two decimals, its ".00" dropped: a whole amount never shows cents or agorot ("60,000 $", "10 ₪", not "10.00 ₪"). The
 * cents are the formatter's own, rounded once on the value's shortest decimal, so 9.995 ₪ is "10 ₪" and never "10.00 ₪".
 */
const withCents = (f: Intl.NumberFormat, v: number): string => f.format(v).replace(/\.00(?!\d)/, "");
// a price per share is a fraction of a cent (0.0035 $): up to four decimals
const dollarsFine = numberFormat({ style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const shekelsFine = numberFormat({ style: "currency", currency: "ILS", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const eurosFine = numberFormat({ style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const poundsFine = numberFormat({ style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const percent = numberFormat({ style: "percent", maximumFractionDigits: 2 });
const percent3 = numberFormat({ style: "percent", maximumFractionDigits: 3 });
/** A small percent to its first two significant digits (`0.0012%`). */
const percentSmall = numberFormat({ style: "percent", maximumSignificantDigits: 2 });
/** A percent with every decimal a price list prints, up to six (`0.0875%`), none added. */
const percentPrinted = numberFormat({ style: "percent", maximumFractionDigits: 6 });
/** An ECB reference rate, to the four decimals the ECB publishes it with. */
const ecbRate = numberFormat({ maximumFractionDigits: 4 });
const compactNumber = numberFormat({ maximumFractionDigits: 1 });
const compactFormat = (v: number) => withMinus(compactNumber.format(v));
const date = new Intl.DateTimeFormat(he, { day: "2-digit", month: "2-digit", year: "numeric" });
const period = new Intl.DateTimeFormat(he, { month: "long", year: "numeric" });
const monthAlone = new Intl.DateTimeFormat(he, { month: "long" });

/**
 * Intl's he-IL currency text carries a right-to-left mark and a no-break space around the sign. Copied into a note or a
 * spreadsheet they travel as invisible characters; the number is isolated by its own element on the page
 * (`<bdi dir="ltr">`, `unicode-bidi: isolate`), so the right-to-left mark is dropped and the space is an ordinary one (the left-to-right mark before a minus sign stays).
 */
const plainMarks = (text: string) => text.replace(/\u200f/g, "").replace(/[\u00a0\u202f]/g, " ");

// a straight quote between two Hebrew letters is a gershayim ("ת"א"): drawn as one, a fund's name quoted in a title keeps its own quotes
export const GERSHAYIM = /(?<=[\u05d0-\u05ea])"(?=[\u05d0-\u05ea])/g;
/** An abbreviation's straight quote written as the gershayim (docs/copy.md 10.4): the data spells ני"ע, the page shows ני״ע. */
export const gershayim = (text: string) => text.replace(GERSHAYIM, "\u05f4");

/** A scale mark's number and word: from a billion in billions, the word a figure's short form uses (`nisBillions`), so an axis and the figure above it read in one form. */
function compactNisParts(v: number): { num: string; word: string | null } {
  const a = Math.abs(v);
  if (a >= 1e9) return { num: compactFormat(v / 1e9), word: numbers.billion };
  if (a >= 1e6) return { num: compactFormat(v / 1e6), word: numbers.compact.million };
  if (a >= 1e3) return { num: compactFormat(v / 1e3), word: numbers.compact.thousand };
  return { num: compactFormat(v), word: null };
}

/**
 * A billion or more in its short form, always with two decimals (`2.30 מיליארד ₪`, `1,250.00 מיליארד ₪`): a figure with one decimal beside
 * one with two read as different precisions.
 */
const billions = numberFormat({ minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nisBillions = (v: number) => `${withMinus(billions.format(v / 1e9))} ${numbers.billion} ₪`;

/**
 * A row with a figure in the short form writes its other large figures in it too, from a hundred million up (`0.76 מיליארד ₪`): a smaller
 * one keeps its digits, so costs of 9 and 14 million beside 1.86 billion did not both read "0.01 מיליארד ₪".
 */
export const SHORT_IN_ROW = 1e8;

/**
 * A figure's text with every shekel amount of `from` or more ("2,296,540,223 ₪", "+2,296,540,223 ₪") in its short form, or null when it
 * has none. A phone shows it from a billion, so a typed plan's figure is never cut by its fixed column; a computer from a
 * thousand billion. A row that writes one of its figures short passes `SHORT_IN_ROW`, so its figures read in one form: "758,833,521 ₪"
 * beside "1.57 מיליארד ₪" read as the larger of the two.
 */
export function shortBillions(text: string, from = 1e9): string | null {
  let hit = false;
  const out = text.replace(/(\d{1,3}(?:,\d{3})+)(?:\.\d+)? ₪/g, (whole, digits: string) => {
    const v = Number(digits.replace(/,/g, ""));
    if (v < from) return whole;
    hit = true;
    return nisBillions(v);
  });
  return hit ? out : null;
}

export const fmt = {
  /** `1,234.50 ₪` (two decimals, method §13). */
  // a whole amount never shows agorot: "10 ₪", not "10.00 ₪"
  nis: (v: number) => withMinus(plainMarks(withCents(currency, v))),
  /** `1,234 ₪`, whole shekels. `isolate`: wrapped in a left-to-right isolate, for an amount inside Hebrew text with no element of its own (none by default). */
  nisWhole: (v: number, { isolate = false }: SignedOptions = {}) => isolated(withMinus(plainMarks(currencyWhole.format(v))), { isolate }),
  /** `7 $`, `0.35 $`: a bound or a fee a foreign or bank price list prints in dollars; a whole amount shows no cents, as `nis` (wording.md). */
  usd: (v: number) => withMinus(plainMarks(withCents(dollars, v))),
  /** `60,000 $`: a whole amount a law sets in dollars, with no cents. */
  usdWhole: (v: number) => withMinus(plainMarks(dollarsWhole.format(v))),
  /** `25 €` and `5.50 £`: a bound a price list prints in euros or pounds, for trades abroad; a whole amount shows no cents. */
  eur: (v: number) => withMinus(plainMarks(withCents(euros, v))),
  gbp: (v: number) => withMinus(plainMarks(withCents(pounds, v))),
  /** `22.70 מיליארד $`: a dollar amount of a billion or more in its short form, two decimals as `nisBillions`. */
  usdBillions: (v: number) => `${withMinus(billions.format(v / 1e9))} ${numbers.billion} $`,
  /** `20,000`, `3,844.80`: an amount written before its currency's word in a Hebrew line (an amount abroad, "20,000 ליש״ט"): whole, or with
   *  the two decimals the law prints, never rounded and never converted. */
  amount: (v: number) => (Number.isInteger(v) ? plainNumber(v) : withMinus(fixed(2, "decimal").format(v))),
  /** `0.0035 $`: a price per share. */
  usdFine: (v: number) => withMinus(plainMarks(dollarsFine.format(v))),
  /** `0.005 ₪`, `0.004 €`, `0.003 £`: a price per unit typed in shekels, euros or pounds. */
  nisFine: (v: number) => withMinus(plainMarks(shekelsFine.format(v))),
  eurFine: (v: number) => withMinus(plainMarks(eurosFine.format(v))),
  gbpFine: (v: number) => withMinus(plainMarks(poundsFine.format(v))),
  /** Data stores percent numbers (`1.05` is 1.05%). */
  pct: (v: number) => {
    // a figure that really has a third decimal (a 0.015% trustee fee, a 1.115% sum) keeps it; everything else rounds to two
    const thousandths = v * 1000;
    return Math.abs(thousandths - Math.round(thousandths)) < 1e-6 && Math.abs(v * 100 - Math.round(v * 100)) > 1e-6 ? withMinus(percent3.format(v / 100)) : withMinus(percent.format(v / 100));
  },
  /**
   * A percent that never reads 0% when it is not nothing (an average a house charged, F-122): `pct`, or, where `pct` would round a figure
   * other than zero to 0%, its first two significant digits (`0.0012%`).
   */
  pctNonZero: (v: number) => (v !== 0 && Math.abs(v) < 0.005 ? withMinus(percentSmall.format(v / 100)) : fmt.pct(v)),
  /** A percent as its source prints it or the person typed it, with all its decimals (`0.0875%`, `0.5%`): a sourced or typed rate is never rounded. */
  pctPrinted: (v: number) => withMinus(percentPrinted.format(v / 100)),
  /** The number `pct` shows, as a number: what a field prefilled from a displayed percentage holds (0.4293 reads 0.43). */
  pctShown: (v: number) => {
    const thousandths = v * 1000;
    return Math.abs(thousandths - Math.round(thousandths)) < 1e-6 && Math.abs(v * 100 - Math.round(v * 100)) > 1e-6 ? Math.round(thousandths) / 1000 : Math.round(v * 100) / 100;
  },
  number: plainNumber,
  /**
   * A share of a whole in percent (a price's share of its cap, `57.14` is 57.14%): a whole percent (`57%`), except below 1% and between
   * 99% and 100%, where one decimal keeps it from reading `0%` or `100%` when it is neither (`0.4%`, `99.6%`; `0.1%` at least and `99.9%`
   * at most there).
   */
  share: (v: number) => {
    if (v > 0 && v < 1) return fixed(1, "percent").format(Math.max(0.1, Math.round(v * 10) / 10) / 100);
    if (v > 99 && v < 100) return fixed(1, "percent").format(Math.min(99.9, Math.round(v * 10) / 10) / 100);
    return withMinus(fixed(0, "percent").format(v / 100));
  },
  /**
   * `22.10.2026` from `2026-10-22`. A document that prints only a month is dated `2025-11` (fees schema); it is said as the
   * month, `נובמבר 2025`, never with an invented first day.
   */
  date: (iso: string) => (/^\d{4}-\d{2}$/.test(iso) ? period.format(new Date(iso + "-01T00:00:00")) : date.format(new Date(iso + "T00:00:00"))),
  /** `ספטמבר 2026` from `2026-09`. */
  period: (ym: string) => period.format(new Date(ym + "-01T00:00:00")),
  /** `מרץ` from `2027-03`: a month's name without its year, where the year stands once above several months (the kit's month picker). */
  monthName: (ym: string) => monthAlone.format(new Date(ym + "-01T00:00:00")),
  /** Chart ticks, as running text: `200 אלף ₪`, `1.5 מיליון ₪`. A scale mark, not a figure (design-system Q4). */
  compactNis: (v: number) => {
    const p = compactNisParts(v);
    return p.word ? `${p.num} ${p.word} ₪` : `${p.num} ₪`;
  },
  /**
   * The same mark for an SVG `<text>`, spelled in visual left-to-right order inside a left-to-right isolate:
   * `₪ אלף 200`. WebKit reorders mixed Hebrew and digits in SVG text on its own and drew "100₪אלף";
   * a text that is already in visual order and isolated is drawn the same way by every engine.
   */
  compactNisAxis: (v: number) => {
    const p = compactNisParts(v);
    return `\u2066₪ ${p.word ? `${p.word} ` : ""}${p.num}\u2069`;
  },
  /** An axis's tick with its unit in the axis's name, as SVG text in visual order (as `compactNisAxis`): `אלף 200` for 200,000, `500` for 500. */
  compactAxis: (v: number) => {
    const p = compactNisParts(v);
    return p.word ? `\u2066${p.word} ${p.num}\u2069` : p.num;
  },
  /**
   * A figure said roughly, after "כ־": to two significant digits (`2,400 ₪`, `350 ₪`), below 100 whole (`25 ₪`), and where that comes to
   * 10,000 or more, in whole thousands in words (`108 אלף ₪`; 9,950 comes to 10,000 and reads `10 אלף ₪`, as 10,000 does). Isolated right
   * to left, as Hebrew writes an amount, so "כ־" before it never takes its shekel sign to the other side.
   */
  nisRough: (v: number) => {
    const a = Math.abs(v);
    const unit = a >= 100 ? 10 ** (Math.floor(Math.log10(a)) - 1) : 1;
    const rough = Math.round(v / unit) * unit;
    return `\u2067${Math.abs(rough) >= 1e4 ? fmt.compactNis(Math.round(v / 1e3) * 1e3) : fmt.nisWhole(rough)}\u2069`;
  },
  /** A shekel amount in billions, always with two decimals: `19.14 מיליארד ₪`. */
  nisBillions,
  /** A whole-shekel amount with its sign (`signed`): `+4,875 ₪`, `−1,524 ₪`, `0 ₪`. */
  signedNisWhole: (v: number, options: SignedOptions = {}) => signed(v, fmt.nisWhole(Math.abs(v)), options),
  /**
   * A percent (data's percent numbers, `1.05` is 1.05%) with its sign (`signed`): `+18.5%`, `−2.38%`. `digits`: exactly that many
   * decimals (`signedPct(3, 1)` is `+3.0%`); without it, the decimals `pct` shows.
   */
  signedPct: (v: number, digits?: number, options: SignedOptions = {}) => signed(v, digits === undefined ? fmt.pct(Math.abs(v)) : fixed(digits, "percent").format(Math.abs(v) / 100), options),
  /**
   * A percent without its sign, for a sentence whose words already say up or down: `18.5%` for 18.5 and for −18.5. `digits`: exactly that
   * many decimals; without it, the decimals `pct` shows. Isolated left to right as the signed figures are (`isolate`, the default).
   */
  unsignedPct: (v: number, digits?: number, options: SignedOptions = {}) => isolated(digits === undefined ? fmt.pct(Math.abs(v)) : fixed(digits, "percent").format(Math.abs(v) / 100), options),
  /** A plain number with its sign (`signed`): `+2`, `−18.5`. `digits`: exactly that many decimals; without it, up to two, as `number`. */
  signedNumber: (v: number, digits?: number, options: SignedOptions = {}) => signed(v, digits === undefined ? plainNumber(Math.abs(v)) : fixed(digits, "decimal").format(Math.abs(v)), options),
  /** A plain number with exactly `digits` decimals and no plus sign (`1.5`, `−0.3`), isolated left to right as the signed figures are (`isolate`, the default). */
  decimals: (v: number, digits: number, options: SignedOptions = {}) => isolated(withMinus(fixed(digits, "decimal").format(v)), options),
  /** Hebrew year forms (copy.md §1): שנה, שנתיים, {n} שנים; and the month forms. */
  years: (n: number) => countPhrase(n, numbers.yearWords),
  months: (n: number) => countPhrase(n, numbers.monthWords),
};

/** How a figure is written: `isolate` wraps it in a left-to-right isolate, for a figure inside Hebrew text (the default for a signed one). */
export interface SignedOptions {
  /** False for a figure that is already its own left-to-right element: a chart tick, a `<bdi dir="ltr">`. */
  isolate?: boolean;
}

/** A figure's text in a left-to-right isolate (U+2066 … U+2069), unless `isolate` is false. */
const isolated = (text: string, { isolate = true }: SignedOptions): string => (isolate ? `\u2066${text}\u2069` : text);

/**
 * A figure with its sign, from its text without one (`abs`): "+" before a positive, the true minus sign U+2212 before a negative, and
 * none before a figure that shows as zero (−0.3 ₪ in whole shekels reads "0 ₪", not "−0 ₪"). Isolated left to right (U+2066 … U+2069)
 * by default, so the sign stays on the left of the digits inside Hebrew: a sign is weak in the bidi algorithm and, left to the
 * sentence, lands on their right ("2%−").
 */
function signed(v: number, abs: string, options: SignedOptions): string {
  const sign = !/[1-9]/.test(abs) ? "" : v > 0 ? "+" : "−";
  return isolated(`${sign}${abs}`, options);
}

/** A number or a percent with exactly `digits` decimals. */
const fixed = (digits: number, style: "decimal" | "percent"): Intl.NumberFormat => numberFormat({ style, minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * Display rounding (method §13 unchanged, this is display only). A computed, entered or
 * parameter shekel amount of 10 ₪ or more shows whole shekels (by the kind of value, not its size); a whole-number amount of any size shows no agorot
 * ("10,000 ₪", "0 ₪"), per month and per trade as well. A sourced amount of 1,000 ₪ or more shows no ".00" either ("83,641 ₪",
 * the provident fund's ceiling: "83,641.00 ₪" reads as false precision), and keeps the agorot its source prints ("5,645.29 ₪").
 * A whole amount never shows agorot, sourced ones included ("27 ₪"); every figure under 1,000 ₪ that has agorot keeps them. Table cells follow the same rule. The values themselves are never
 * rounded.
 */
export function nisShown(v: number, state?: "sourced" | "computed" | "entered", parameter = false): string {
  return showsWhole(v, state, parameter) ? fmt.nisWhole(v) : fmt.nis(v);
}

/** Whether `nisShown` writes an amount in whole shekels, else with its agorot. */
function showsWhole(v: number, state: "sourced" | "computed" | "entered" | undefined, parameter: boolean): boolean {
  const derived = state === "computed" || state === "entered" || parameter;
  // what the site calculates (or the person entered) shows whole shekels, except a cost of a few shekels, where rounding changes the meaning;
  // a figure set by law or a price list keeps the agorot it prints
  return (derived && (Math.abs(v) >= 10 || Number.isInteger(v))) || (Math.abs(v) >= 1000 && Number.isInteger(v));
}

/** The units of a sum of shekels that `formatValue` writes by the display rule (`nisShown`). */
const SHEKEL_SUMS: ReadonlySet<string> = new Set(["nis", "nis_per_month", "nis_per_trade", "nis_per_transfer"]);

/**
 * The number a shekel amount reads as on the page: the number `formatValue` writes, read back from its text, so the two are one rounding
 * (method §13). A figure worked out from shown amounts starts from these, so it agrees with them as written. Any other unit is returned
 * as it is.
 */
export function amountShown(v: number, unit: string, state?: "sourced" | "computed" | "entered", parameter = false): number {
  if (!SHEKEL_SUMS.has(unit)) return v;
  const text = formatValue(v, unit, state, parameter);
  const n = Number(text.replace(/[^\d.]/g, ""));
  return text.includes("\u2212") ? -n : n;
}

/**
 * A lead that ends in a maqaf ("ב־", "מ־", "תעריפון מ־") before what follows it: the maqaf joins a one-letter prefix to digits
 * ("ב־2025", "מ־1,000 ₪"), and before a Hebrew word the letter is simply written on the word ("מנובמבר 2025", "בשנה", "בשנתיים";
 * copy.md 10). Returns the lead as it is written before `next`.
 */
export const joinLead = (lead: string, next: string): string => (lead.endsWith("\u05be") && /^[\u05d0-\u05ea]/.test(next.trimStart()) ? lead.slice(0, -1) : lead);

/** The currency of a unit that is a sum of money; none for a price per unit, a fraction of a cent that keeps its own decimals (`formatValue`). */
export const currencyOfUnit = (unit: string): string | null =>
  unit.endsWith("_per_share") ? null : /^nis/.test(unit) ? "ILS" : /^usd/.test(unit) ? "USD" : /^eur/.test(unit) ? "EUR" : /^gbp/.test(unit) ? "GBP" : null;

/**
 * A sum the person typed, as they typed it, in any currency: a whole sum with no decimals ("15 $", "1,000 ₪"), any other with its two
 * ("12.75 ₪", "7.50 €"). A sum the site works out keeps the number rules (`formatValue`). Undefined for a unit that is no sum of money.
 */
export function typedSum(v: number, unit: string): string | undefined {
  const f = sumForms(unit);
  return f ? withMinus(plainMarks(withCents(f.cents, v))) : undefined;
}

/**
 * A sum the site works out, in any currency, by the rule for shekels (`nisShown`): whole units ("3,529 $", "952 ₪"), except a sum under
 * ten that has cents ("3.20 $"). Undefined for a unit that is no sum of money.
 */
export function computedSum(v: number, unit: string): string | undefined {
  const f = sumForms(unit);
  return f ? withMinus(plainMarks((Math.abs(v) >= 10 || Number.isInteger(v) ? f.whole : f.cents).format(v))) : undefined;
}

/** The two forms of a sum in a unit's currency, whole and with two decimals; none for a unit that is no sum of money. */
function sumForms(unit: string): { whole: Intl.NumberFormat; cents: Intl.NumberFormat } | null {
  const cur = currencyOfUnit(unit);
  if (!cur) return null;
  return { whole: numberFormat({ style: "currency", currency: cur, maximumFractionDigits: 0 }), cents: numberFormat({ style: "currency", currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
}

/**
 * A `Num` display for the sum a flat price holds up to (F-12, F-13), whole as the price list prints it: a dollar sum with no cents drops
 * them ("99 $", not "99.00 $", which a dollar price keeps); any other sum keeps its unit's form.
 */
export const wholeSum = (unit: string) => (n: number): string | undefined => (/^usd/.test(unit) && Number.isInteger(n) ? fmt.usdWhole(n) : undefined);

/** A figure's text by its unit. Dates and periods arrive as `text` values in ISO form. `state` applies the display rounding to shekel amounts (`nisShown`). */
export function formatValue(value: number | string | boolean | null, unit: string, state?: "sourced" | "computed" | "entered", parameter = false): string {
  if (value === null) return numbers.unknown;
  if (typeof value === "boolean") return value ? numbers.yes : numbers.no;
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return fmt.date(value);
    if (/^\d{4}-\d{2}$/.test(value)) return fmt.period(value);
    if (numbers.enums[value]) return numbers.enums[value]!;
    const dm = /^(\d{1,2}) ([A-Z][a-z]+)$/.exec(value);
    if (dm && numbers.monthsHe[dm[2]!]) return `${dm[1]} ${numbers.monthsHe[dm[2]!]}`;
    return value;
  }
  if (SHEKEL_SUMS.has(unit)) return state ? nisShown(value, state, parameter) : fmt.nis(value);
  switch (unit) {
    case "nis_per_share":
      return fmt.nisFine(value);
    case "eur_per_share":
      return fmt.eurFine(value);
    case "gbp_per_share":
      return fmt.gbpFine(value);
    case "usd":
      return Math.abs(value) >= 1e9 ? fmt.usdBillions(value) : fmt.usd(value);
    case "usd_per_trade":
    case "usd_per_event":
      return fmt.usd(value);
    case "usd_per_share":
      return fmt.usdFine(value);
    case "eur":
      return fmt.eur(value);
    case "gbp":
    case "gbp_per_trade":
      return fmt.gbp(value);
    case "nis_millions":
      return `${fmt.number(value)} ${numbers.nisMillions}`;
    case "nis_per_usd":
      return `${fmt.number(agorotOfShekels(value))} ${numbers.agorotPerDollar}`;
    case "agorot":
    case "agorot_per_usd":
      return `${fmt.number(value)} ${numbers.agorot}`;
    case "trade_ccy_per_trade":
      return `${fmt.number(value)} ${numbers.inTradeCurrency}`;
    case "fx_per_eur":
      return withMinus(ecbRate.format(value));
    case "pct":
    case "pct_per_year":
    case "pct_of_deposit":
    case "pct_of_trade":
    case "pct_of_balance_per_period":
      return fmt.pct(value);
    default:
      return fmt.number(value);
  }
}

/** Unit word beside an input field (values sheet). */
export function unitWord(unit: string): string {
  if (unit.startsWith("nis")) return valuesCopy.units.nis;
  if (unit === "agorot") return valuesCopy.units.agorot;
  if (unit.startsWith("pct")) return valuesCopy.units.pct;
  if (unit.startsWith("usd")) return valuesCopy.units.usd;
  if (unit.startsWith("eur")) return valuesCopy.units.eur;
  if (unit.startsWith("gbp")) return valuesCopy.units.gbp;
  if (unit === "years") return valuesCopy.units.years;
  return "";
}

/**
 * The one parser for every number a person types. Strips spaces (also no-break and thin), ₪, % and bidi
 * marks; a minus sign in any dash form. With both separators, the last is the decimal point ("1.234,5", "1,234.5"); a single point is a
 * decimal point. A comma alone depends on the kind of figure (`kind`):
 * - `amount` (the default, a sum of money or a count): a comma is a thousands separator only in correct groups, one to three digits
 *   before the first comma, none of them a leading zero, and three after each ("12,000", "1,234,567"); a single comma followed by one or
 *   two digits, or by three after a lone zero, is a decimal point ("2,5" is 2.5, "4,25" is 4.25, "0,125" is 0.125). Commas in the wrong
 *   places, with three digits or more after each and a first group with no leading zero, are thousands separators misplaced and are
 *   dropped (founder, 2026-11-23): "1000,000" is 1,000,000, "1,0000" is 10,000. Fewer than three after one ("10,00,000", "1,234,5") is
 *   still no number, as it may be a decimal typed wrong.
 * - `rate` (a percentage, a rate, a price per unit): a single comma is always a decimal point, as an Israeli reader types one ("0,125"
 *   is 0.125, "1,000" is 1); several commas read as an amount's.
 * Anything else, letters included, is NaN. Returns a number or NaN, never a guess.
 */
export type NumberKind = "amount" | "rate";

export function parseNumber(text: string, kind: NumberKind = "amount"): number {
  let t = text.replace(/[\s\u00a0\u202f\u200e\u200f\u202a-\u202e\u2066-\u2069₪%]/g, "").replace(/[−–—‐-]/g, "-");
  if (t === "" || /[^\d.,+-]/.test(t)) return Number.NaN;
  const neg = t.startsWith("-");
  t = t.replace(/^[+-]/, "");
  if (/[+-]/.test(t)) return Number.NaN;
  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");
  let intPart = t;
  let frac = "";
  if (lastComma >= 0 && lastDot >= 0) {
    const sep = Math.max(lastComma, lastDot);
    intPart = t.slice(0, sep);
    frac = t.slice(sep + 1);
    // the other separator must be the thousands one, used consistently
    const other = lastComma > lastDot ? "." : ",";
    if (intPart.includes(lastComma > lastDot ? "," : ".")) return Number.NaN;
    intPart = intPart.split(other).join("");
  } else if (lastComma >= 0) {
    const parts = t.split(",");
    const last = parts[parts.length - 1]!;
    // the groups before the first comma and after each are a thousands separator's: one to three digits with no leading zero, then threes
    const grouped = /^[1-9]\d{0,2}$/.test(parts[0]!) && parts.slice(1).every((p) => p.length === 3);
    // thousands separators in the wrong places: each comma with three digits or more after it, the first group's digits not led by a zero
    const misplaced = /^[1-9]\d*$/.test(parts[0] ?? "") && parts.slice(1).every((p) => p.length >= 3);
    const decimal = parts.length === 2 && last.length >= 1 && (kind === "rate" || last.length <= 2 || (last.length === 3 && /^0?$/.test(parts[0]!)));
    if (decimal && !(kind === "amount" && grouped)) {
      intPart = parts[0]!;
      frac = last;
    } else if (grouped || misplaced) intPart = parts.join("");
    else return Number.NaN;
  } else if (lastDot >= 0) {
    const parts = t.split(".");
    if (parts.length === 2) {
      intPart = parts[0]!;
      frac = parts[1]!;
    } else if (parts.slice(1).every((p) => p.length === 3) && parts[0]!.length >= 1) intPart = parts.join("");
    else return Number.NaN;
  }
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(frac) || (intPart === "" && frac === "")) return Number.NaN;
  const n = Number(`${intPart || "0"}${frac ? "." + frac : ""}`);
  return neg ? -n : n;
}

/**
 * An amount with its unit as plain words inside Hebrew (a fee's name, a case's step, a menu's line): left to right in an isolate of its
 * own, its number and sign joined by a no-break space, so it is neither reordered ("עד 10 $", never "$ 10 עד") nor wrapped apart.
 */
export const amountWords = (text: string): string => `\u2066${text.replace(/ /g, "\u00a0")}\u2069`;

/**
 * A number in TeX, for a calculation's line with its values put in (`lib/working.ts`): at most `significant` significant digits, never fewer
 * than its whole part has, trailing zeros dropped, the thousands separator in TeX's braces (`1{,}325.38`, so TeX spaces it as a separator
 * and not as a list's comma) and a hyphen for a minus, which TeX draws as the minus sign.
 */
export function texNumber(v: number, significant: number): string {
  const a = Math.abs(v);
  const place = a === 0 ? 0 : Math.floor(Math.log10(a));
  const decimals = Math.min(20, Math.max(0, significant - 1 - place));
  return numberFormat({ maximumFractionDigits: decimals }, "en-US").format(v).replace(/,/g, "{,}");
}

/** Thousands separators for a typed field, left to right (`1,500`, `5`, `-2.5`). */
export function formatTyped(n: number): string {
  return numberFormat({ maximumFractionDigits: 4 }, "en-US").format(n);
}

/**
 * A whole amount written with one point and exactly three digits after it, a first group of one to three digits ("1.000", "12.500"): a
 * thousands separator in the European way or a decimal point, it cannot be told which. `parseNumber` reads it as a decimal; a field of
 * whole shekels says it is unclear rather than take 1 for 1,000.
 */
export function isDotThousands(text: string): boolean {
  return /^[+\-−–—‐]?[1-9]\d{0,2}\.\d{3}$/.test(text.replace(/[\s  ‎‏‪-‮⁦-⁩₪]/g, ""));
}

/**
 * A whole amount's box as the person types (`NumberField`'s `groupAsTyped`): the text `raw` with its thousands separators set, given the
 * text the box held before (`before`). Digits typed or deleted inside the separators the box itself set are grouped again ("1,234" less
 * its last digit is "123"); a comma the person typed or pasted is read by `parseNumber`'s rules, and the text is grouped only when it is a
 * whole amount that way ("1000,000" is "1,000,000"); otherwise it stays as typed, so its error shows ("2,5", "10,00,000", "01,000").
 * A text with anything but digits, commas and spaces stays as typed.
 */
export function groupTyped(raw: string, before: string): string {
  if (!/^[\d,\s]*$/.test(raw)) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return raw.trim() === "" ? "" : raw;
  const regroup = (text: string) => formatTyped(Number(text.replace(/\D/g, "")));
  const commas = (text: string) => text.split(",").length - 1;
  // the box held its own grouping (or nothing), and no comma came in: the commas in `raw` are the box's
  const boxs = before.trim() === "" || (/^[\d,]+$/.test(before) && before === regroup(before));
  if (boxs && commas(raw) <= commas(before)) return regroup(raw);
  const n = parseNumber(raw);
  return Number.isInteger(n) && n >= 0 ? formatTyped(n) : raw;
}
