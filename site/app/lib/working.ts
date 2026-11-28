// The working of a computed figure (`Working`, packages/schema), kept for the step-by-step explanation of a page's main result; no sheet
// shows it today (the kit's FormulaBlock draws it in the gallery): the lines of a difference or a sum as the page writes them, or
// one line of math docs/method.md draws for the figure's entry, then the same line with the figure's own values put in place of its symbols.
// The line with values is made here from the drawn line and the inputs, never typed: each value is a number in the math, its unit and its
// name stay in the key beside it.
import { PERCENT_UNITS } from "@finance-tool/engine";
import { assertNever, type Working } from "@finance-tool/schema";
import { strength as strengthCopy } from "../copy";
import { formatValue, texNumber } from "./format";
import { isOpenValue, isParameter, type SiteValue } from "./value";

export type FormulaWorking = Extract<Working, { kind: "formula" }>;

/**
 * The figure as a sheet heads with it: the word a value that is not a number was shown as (`display`), the figure as its line writes it
 * (`written`), an open value's word, or the number by the display rule, with its sign where the figure was shown with one (`signed`);
 * `exact`, the two decimals a table cell showed.
 */
export function headText(value: SiteValue, exact: boolean, display?: string): string {
  const param = isParameter(value);
  const state = exact ? undefined : value.state;
  if (value.signed && typeof value.value === "number" && value.value !== 0) return `${value.value > 0 ? "+" : "−"}${formatValue(Math.abs(value.value), value.unit, state, param)}`;
  return (typeof value.value !== "number" ? display : undefined) ?? value.written ?? (isOpenValue(value) ? strengthCopy.open.label : formatValue(value.value, value.unit, state, param));
}

/** The lines of a difference or a sum, in order, each an input with the sign it is taken with: none on the first, a minus or a plus after. */
export function receiptLines(working: Exclude<Working, FormulaWorking>, inputs: Record<string, SiteValue>): { key: string; sign: "minus" | "plus" | null; input: SiteValue }[] {
  const line = (key: string, sign: "minus" | "plus" | null) => {
    const input = inputs[key];
    if (!input) throw new Error(`a computed figure's working names the input "${key}", which its inputs do not hold`);
    return { key, sign, input };
  };
  switch (working.kind) {
    case "difference":
      return [line(working.from, null), line(working.less, "minus")];
    case "sum":
      return working.parts.map((k, i) => line(k, i === 0 ? null : "plus"));
    default:
      return assertNever(working);
  }
}

const isLetter = (c: string | undefined) => !!c && /[A-Za-z]/.test(c);

/**
 * Where each of `symbols` stands in a line of TeX, left to right: the longest that starts at a place, and only as a whole symbol, so `C` is
 * not found inside `C_0`, `E` not inside `E_c`, `c` not as the script of `E_c`, and `r` not inside `\frac`.
 */
export function symbolsIn(tex: string, symbols: readonly string[]): { at: number; symbol: string }[] {
  const longest = [...new Set(symbols)].sort((a, b) => b.length - a.length);
  const out: { at: number; symbol: string }[] = [];
  for (let i = 0; i < tex.length; ) {
    const before = tex[i - 1];
    const found = isLetter(before) || (before !== undefined && "\\_^".includes(before)) ? undefined : longest.find((s) => tex.startsWith(s, i) && !isLetter(tex[i + s.length]) && !"_^".includes(tex[i + s.length] ?? " "));
    if (found) {
      out.push({ at: i, symbol: found });
      i += found.length;
    } else i++;
  }
  return out;
}

/** The commands a line with its values put in may hold, besides numbers, signs and brackets: what `readable` takes as math to work out. */
const MATH_COMMANDS = new Set(["frac", "times", "div", "cdot", "left", "right", "%", "min", "max"]);

/** Whether a line of TeX holds only numbers, operators, brackets and the commands of `MATH_COMMANDS`: a calculation a reader can work out. */
export function readable(tex: string): boolean {
  for (let i = 0; i < tex.length; ) {
    const c = tex.charAt(i);
    if (/\s/.test(c) || /[\d.+\-/()[\]{}^,]/.test(c)) {
      i++;
      continue;
    }
    if (c !== "\\") return false;
    const name = /^\\([A-Za-z]+|.)/.exec(tex.slice(i))?.[1] ?? "";
    if (!MATH_COMMANDS.has(name)) return false;
    i += 1 + name.length;
  }
  return true;
}

/**
 * How many significant digits each value put into a line gets: four more than the figure's head shows, and at least six, so the line
 * worked out comes to the head's figure, a difference of near values among them; a value with fewer digits of its own keeps its own.
 */
export const digitsFor = (head: string): number => Math.min(15, Math.max(6, head.replace(/\D/g, "").replace(/^0+/, "").length + 4));

/** A value as a number in the math (`digitsFor`), a negative one in brackets; null where it holds no number. */
function texValue(v: SiteValue, digits: number): string | null {
  if (typeof v.value !== "number") return null;
  const n = `${texNumber(v.value, digits)}${PERCENT_UNITS.has(v.unit) ? "\\%" : ""}`;
  return v.value < 0 ? `(${n})` : n;
}

/** The right side of a line, from after its one `=`; the whole line where it has none. */
function rightOf(tex: string): { left: string; right: string } {
  const at = tex.indexOf("=");
  return at < 0 ? { left: "", right: tex } : { left: tex.slice(0, at + 1), right: tex.slice(at + 1) };
}

/** The end of a sub- or superscript that starts at `i` (after its `_` or `^`): a braced group, a command, or one character. */
function scriptEnd(tex: string, i: number): number {
  if (tex[i] === "{") {
    let depth = 0;
    for (let j = i; j < tex.length; j++) {
      if (tex[j] === "{") depth++;
      else if (tex[j] === "}" && --depth === 0) return j + 1;
    }
    return tex.length;
  }
  if (tex[i] === "\\") return i + 1 + (/^\\([A-Za-z]+|.)/.exec(tex.slice(i))?.[1]?.length ?? 0);
  return i + 1;
}

/** The inputs each symbol of a line stands for, in the inputs' order: those `symbols` names, and every other input that holds a number for `terms`. */
export function standsFor(working: FormulaWorking, inputs: Record<string, SiteValue>): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const key of Object.keys(inputs)) {
    const symbol = working.symbols[key] ?? (typeof inputs[key]?.value === "number" ? working.terms : undefined);
    if (symbol !== undefined) out.set(symbol, [...(out.get(symbol) ?? []), key]);
  }
  return out;
}

/**
 * The drawn line with this figure's values put in place of its symbols (`standsFor`), or null where it cannot be: the figure or an
 * input holds no number, a symbol several inputs stand for is not the term of a sum, or a symbol of the line's right side is left with no
 * value (`readable`). A sum over a symbol several inputs stand for (`\sum_i A_i`) is written out as their values added up.
 */
export function withValues(tex: string, working: FormulaWorking, inputs: Record<string, SiteValue>, digits: number): string | null {
  const keysOf = standsFor(working, inputs);
  const valuesOf = (symbol: string): string[] | null => {
    const out: string[] = [];
    for (const key of keysOf.get(symbol) ?? []) {
      const input = inputs[key];
      const t = input ? texValue(input, digits) : null;
      if (t === null) return null;
      out.push(t);
    }
    return out;
  };
  const { left, right } = rightOf(tex);
  let out = "";
  let i = 0;
  const symbols = [...keysOf.keys()];
  const found = symbolsIn(right, symbols);
  // each sum over a symbol, its operator and limits with the symbol after them
  const sums: { from: number; to: number; text: string }[] = [];
  for (const m of right.matchAll(/\\sum/g)) {
    let j = m.index + 4;
    for (let k = 0; k < 2 && (right[j] === "_" || right[j] === "^"); k++) j = scriptEnd(right, j + 1);
    while (right[j] === " ") j++;
    const term = found.find((f) => f.at === j);
    if (!term) return null;
    const values = valuesOf(term.symbol);
    if (!values || values.length === 0) return null;
    const whole = right.slice(0, m.index).trim() === "" && right.slice(j + term.symbol.length).trim() === "";
    sums.push({ from: m.index, to: j + term.symbol.length, text: whole ? values.join(" + ") : `\\left(${values.join(" + ")}\\right)` });
  }
  for (const f of found) {
    const sum = sums.find((s) => f.at >= s.from && f.at < s.to);
    if (sum) {
      if (f.at > sum.from + 4 && f.at + f.symbol.length === sum.to) {
        out += right.slice(i, sum.from) + sum.text;
        i = sum.to;
      }
      continue;
    }
    const values = valuesOf(f.symbol);
    if (!values || values.length !== 1) return null;
    out += right.slice(i, f.at) + values[0];
    i = f.at + f.symbol.length;
  }
  out += right.slice(i);
  return readable(out) ? `${left}${out}` : null;
}

/**
 * The key to a line: each symbol of the entry's key that stands in the line, in the key's order, with its words and the inputs that stand
 * for it (none for a symbol that is no input of this figure: what the line works out, a constant of the entry). `result` marks the symbol
 * the line works out, the one left of its `=` that no input stands for: the figure the sheet heads with.
 */
export function keyOfLine(tex: string, key: readonly (readonly [tex: string, words: string])[], working: FormulaWorking, inputs: Record<string, SiteValue>): { tex: string; words: string; result: boolean; inputs: { key: string; input: SiteValue }[] }[] {
  const symbols = key.map(([s]) => s);
  const inLine = new Set(symbolsIn(tex, symbols).map((f) => f.symbol));
  const leftSide = new Set(symbolsIn(rightOf(tex).left, symbols).map((f) => f.symbol));
  const keysOf = standsFor(working, inputs);
  return key
    .filter(([s]) => inLine.has(s))
    .map(([s, words]) => {
      const standing = (keysOf.get(s) ?? []).flatMap((k) => (inputs[k] ? [{ key: k, input: inputs[k] }] : []));
      return { tex: s, words, result: leftSide.has(s) && standing.length === 0, inputs: standing };
    });
}

/** F-106's line, `P = C_0 + 12 × n × C`: what was paid in, in today's money, by the inputs that hold the amount now, the monthly deposit and the years. */
export function paidInWorking(amount: string, monthly: string, years: string): FormulaWorking {
  return { kind: "formula", entry: "F-106", line: 0, symbols: { [amount]: "C_0", [monthly]: "C", [years]: "n" } };
}
