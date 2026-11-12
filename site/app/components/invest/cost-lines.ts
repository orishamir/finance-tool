// The account's cost lines on the index page: their colours, their order and their names, one for every bar and legend that draws them
// (the lists, the custom index's list, the own-account panel). A fee type the page has no name or colour of its own for is drawn as
// "other", one part and one legend item, so no legend names the same thing twice and none is left without a name.
import type { FeeLine } from "@finance-tool/engine";
import { invest as c } from "../../copy";

const CLASS: Record<string, string> = { trade: "bg-chart-cost-trade", custody: "bg-chart-cost-custody", fixed: "bg-chart-cost-fixed", fx: "bg-chart-cost-fx" };

/** The order of the lines in every bar and in the legend, whatever the price list's own (charts.md: the parts in one order in every bar,
 *  and the legend's the same). */
const LINE_ORDER = [...Object.keys(CLASS), "other"];

/** A line's legend item: a bank's current account (F-102, D64) is a fee for keeping an account too, and shares the account fee's colour and
 *  item; a type with no colour of its own is "other". */
export const lineOf = (line: FeeLine): string => (line === "account" ? "fixed" : line in CLASS ? line : "other");

/** A legend item's colour (`lineOf`'s ids). */
export const lineClass = (item: string): string => CLASS[item] ?? "bg-chart-cost-other";

/** A legend item's place in the bars and the legend (`lineOf`'s ids). */
export const lineRank = (item: string): number => LINE_ORDER.indexOf(item);

/** Lines in the legend's order; a bank's current account just after the account fee, whose item it shares. */
export const byLegend = <L extends { line: FeeLine }>(ls: readonly L[]): L[] =>
  [...ls].sort((a, b) => lineRank(lineOf(a.line)) - lineRank(lineOf(b.line)) || Number(a.line === "account") - Number(b.line === "account") || (a.line < b.line ? -1 : a.line > b.line ? 1 : 0));

/** A legend names every account line whichever row or pair is shown, in one order, so its items keep their places from one pick to the next.
 *  An index in shekels has no conversion line to name. */
export const legendLines = (israeli: boolean, used: readonly string[]) => [...Object.keys(CLASS).filter((l) => l !== "fx" || !israeli), ...(used.includes("other") ? ["other"] : [])];

/** A legend item's name: the account fee's item stands for a bank's current account too, which shares its colour, where a bar shown has
 *  one (`current`); else it names the securities account's fee alone (a legend item names only what is drawn). */
export const legendName = (item: string, current = true) => (item === "fixed" ? (current ? c.pair.legendAccount : c.pair.legendSecurities) : (c.pair.lines[item] ?? c.pair.lines.other));

/** Whether any of these account lines is a bank's current account (F-102). */
export const hasCurrent = (lines: readonly { line: FeeLine }[]) => lines.some((l) => l.line === "account");

/** A part's name: the line's own where it has one (the current account), else its legend item's. */
export const partName = (line: FeeLine) => c.pair.lines[line] ?? c.pair.lines[lineOf(line)] ?? c.pair.lines.other;
