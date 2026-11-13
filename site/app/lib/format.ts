// Number, date and identifier formats: docs/design-system.md 2.7. Always Intl with he-IL; never hand-built.
import { numbers, values as valuesCopy } from "../copy";
import { countPhrase, plainNumber, withMinus } from "./count";

export { countPhrase, withMinus, type CountWords } from "./count";

const he = "he-IL";

/** Hebrew alphabetical order, for sorting names. */
export const heCollator = new Intl.Collator("he");
const currency = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyWhole = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const dollars = new Intl.NumberFormat(he, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dollarsWhole = new Intl.NumberFormat(he, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const euros = new Intl.NumberFormat(he, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pounds = new Intl.NumberFormat(he, { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
// a price per share is a fraction of a cent (0.0035 $): up to four decimals
const dollarsFine = new Intl.NumberFormat(he, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const shekelsFine = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const eurosFine = new Intl.NumberFormat(he, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const poundsFine = new Intl.NumberFormat(he, { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const percent = new Intl.NumberFormat(he, { style: "percent", maximumFractionDigits: 2 });
const percent3 = new Intl.NumberFormat(he, { style: "percent", maximumFractionDigits: 3 });
/** An ECB reference rate, to the four decimals the ECB publishes it with. */
const ecbRate = new Intl.NumberFormat(he, { maximumFractionDigits: 4 });
const compactNumber = new Intl.NumberFormat(he, { maximumFractionDigits: 1 });
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

function compactNisParts(v: number): { num: string; word: string | null } {
  const a = Math.abs(v);
  if (a >= 1e6) return { num: compactFormat(v / 1e6), word: numbers.compact.million };
  if (a >= 1e3) return { num: compactFormat(v / 1e3), word: numbers.compact.thousand };
  return { num: compactFormat(v), word: null };
}

/**
 * A billion or more in its short form, always with two decimals (`2.30 מיליארד ₪`, `1,250.00 מיליארד ₪`): a figure with one decimal beside
 * one with two read as different precisions.
 */
const billions = new Intl.NumberFormat(he, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
  nis: (v: number) => withMinus(plainMarks((Math.round(Math.abs(v) * 100) % 100 === 0 ? currencyWhole : currency).format(v))),
  /** `1,234 ₪`, whole shekels. `isolate`: wrapped in a left-to-right isolate, for an amount inside Hebrew text with no element of its own (none by default). */
  nisWhole: (v: number, { isolate = false }: SignedOptions = {}) => isolated(withMinus(plainMarks(currencyWhole.format(v))), { isolate }),
  /** `7.00 $`: a bound or a fee a foreign or bank price list prints in dollars (until then a bare "2"). */
  usd: (v: number) => withMinus(plainMarks(dollars.format(v))),
  /** `60,000 $`: a whole amount a law sets in dollars, with no cents. */
  usdWhole: (v: number) => withMinus(plainMarks(dollarsWhole.format(v))),
  /** `25.00 €` and `5.00 £`: a bound a price list prints in euros or pounds, for trades abroad (until then a bare "25"). */
  eur: (v: number) => withMinus(plainMarks(euros.format(v))),
  gbp: (v: number) => withMinus(plainMarks(pounds.format(v))),
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

/** A number or a percent with exactly `digits` decimals, one formatter per kind and count of decimals. */
const fixedFormats = new Map<string, Intl.NumberFormat>();
function fixed(digits: number, style: "decimal" | "percent"): Intl.NumberFormat {
  const key = `${style}:${digits}`;
  let f = fixedFormats.get(key);
  if (!f) fixedFormats.set(key, (f = new Intl.NumberFormat(he, { style, minimumFractionDigits: digits, maximumFractionDigits: digits })));
  return f;
}

/**
 * Display rounding (method §13 unchanged, this is display only). A computed, entered or
 * parameter shekel amount of 10 ₪ or more shows whole shekels (by the kind of value, not its size); a whole-number amount of any size shows no agorot
 * ("10,000 ₪", "0 ₪"), per month and per trade as well. A sourced amount of 1,000 ₪ or more shows no ".00" either ("83,641 ₪",
 * the provident fund's ceiling: "83,641.00 ₪" reads as false precision), and keeps the agorot its source prints ("5,645.29 ₪").
 * A whole amount never shows agorot, sourced ones included ("27 ₪"); every figure under 1,000 ₪ that has agorot keeps them. Table cells follow the same rule. The values themselves are never
 * rounded.
 */
export function nisShown(v: number, state?: "sourced" | "computed" | "entered", parameter = false): string {
  const derived = state === "computed" || state === "entered" || parameter;
  // what the site calculates (or the person entered) shows whole shekels, except a cost of a few shekels, where rounding changes the meaning;
  // a figure set by law or a price list keeps the agorot it prints
  if (derived && (Math.abs(v) >= 10 || Number.isInteger(v))) return fmt.nisWhole(v);
  if (Math.abs(v) >= 1000 && Number.isInteger(v)) return fmt.nisWhole(v);
  return fmt.nis(v);
}

/**
 * A lead that ends in a maqaf ("ב־", "מ־", "תעריפון מ־") before what follows it: the maqaf joins a one-letter prefix to digits
 * ("ב־2025", "מ־1,000 ₪"), and before a Hebrew word the letter is simply written on the word ("מנובמבר 2025", "בשנה", "בשנתיים";
 * copy.md 10). Returns the lead as it is written before `next`.
 */
export const joinLead = (lead: string, next: string): string => (lead.endsWith("\u05be") && /^[\u05d0-\u05ea]/.test(next.trimStart()) ? lead.slice(0, -1) : lead);

const typedForms = new Map<string, { whole: Intl.NumberFormat; cents: Intl.NumberFormat }>();
/** The currency of a unit that is a sum of money; none for a price per unit, a fraction of a cent that keeps its own decimals (`formatValue`). */
const currencyOfUnit = (unit: string): string | null =>
  unit.endsWith("_per_share") ? null : /^nis/.test(unit) ? "ILS" : /^usd/.test(unit) ? "USD" : /^eur/.test(unit) ? "EUR" : /^gbp/.test(unit) ? "GBP" : null;

/**
 * A sum the person typed, as they typed it, in any currency: a whole sum with no decimals ("15 $", "1,000 ₪"), any other with its two
 * ("12.75 ₪", "7.50 €"). A sum the site works out keeps the number rules (`formatValue`). Undefined for a unit that is no sum of money.
 */
export function typedSum(v: number, unit: string): string | undefined {
  const f = sumForms(unit);
  return f ? withMinus(plainMarks((Math.round(Math.abs(v) * 100) % 100 === 0 ? f.whole : f.cents).format(v))) : undefined;
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
  let f = typedForms.get(cur);
  if (!f) {
    f = { whole: new Intl.NumberFormat(he, { style: "currency", currency: cur, maximumFractionDigits: 0 }), cents: new Intl.NumberFormat(he, { style: "currency", currency: cur, minimumFractionDigits: 2, maximumFractionDigits: 2 }) };
    typedForms.set(cur, f);
  }
  return f;
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
  switch (unit) {
    case "nis_per_share":
      return fmt.nisFine(value);
    case "eur_per_share":
      return fmt.eurFine(value);
    case "gbp_per_share":
      return fmt.gbpFine(value);
    case "nis":
    case "nis_per_month":
    case "nis_per_trade":
    case "nis_per_transfer":
      return state ? nisShown(value, state, parameter) : fmt.nis(value);
    case "usd":
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
      return `${fmt.number(value * 100)} ${numbers.agorotPerDollar}`;
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
  if (unit.startsWith("pct")) return valuesCopy.units.pct;
  if (unit.startsWith("usd")) return valuesCopy.units.usd;
  if (unit.startsWith("eur")) return valuesCopy.units.eur;
  if (unit.startsWith("gbp")) return valuesCopy.units.gbp;
  if (unit === "years") return valuesCopy.units.years;
  return "";
}

/**
 * The one parser for every number a person types. Strips spaces (also no-break and thin), ₪, % and bidi
 * marks; a minus sign in any dash form. Decimal point or comma: a single "," followed by one or two digits and no other
 * separator is a decimal point ("2,5" is 2.5, "4,25" is 4.25); a comma followed by exactly three digits is a thousands
 * separator ("12,000" is 12000, "1,234,567" is 1234567); "1.234,5" and "1,234.5" read the last separator as the
 * decimal point. Anything else, letters included, is NaN. Returns a number or NaN, never a guess.
 */
export function parseNumber(text: string): number {
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
    if (parts.length === 2 && last.length >= 1 && last.length <= 2) {
      intPart = parts[0]!;
      frac = last;
    } else if (parts.slice(1).every((p) => p.length === 3) && parts[0]!.length >= 1) intPart = parts.join("");
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

/** Thousands separators for a typed field, left to right (`1,500`, `5`, `-2.5`). */
export function formatTyped(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
}
