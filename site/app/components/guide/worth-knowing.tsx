// "שווה לדעת" (synthesis 3.7): two or three pinned facts per wrapper guide page, each the rule's Hebrew title,
// its first figure, D48's chip ("חוקים וכללים · 1", which opens the rule's card) and the weak-strength tag, as cards side by side with the figure as the card's headline.
// Nothing renders when no row can be shown.
//
// current-account page: a row can also be a fact computed from the published records, not a rule
// (`WorthFactRow`): it carries its own content, every figure in it through `Num`, and is listed after the rule rows.
//
// `abroad`, the note on how the product works in other countries (D114), closes the section, after the cards, at the cards' full width.
import type { ReactNode } from "react";
import type { RuleRecord } from "@finance-tool/schema";
import { guideWorth as copy, provenance as provCopy } from "../../copy";
import { figureYear, ruleFigure, type SiteValue } from "../../lib/value";
import { wordUnits } from "../../lib/rule-row";
import { Num, RuleRef, StrengthLabel } from "../provenance";
import { Card } from "../kit";
import { GuideSection } from "./sections";

export interface WorthRow {
  kind?: "rule";
  id: string;
  title: string;
  figure: SiteValue | null;
  /** The figure is a legal cap (its name holds `cap`, as `balance_cap`): shown with "עד" so it never reads as the rate charged. */
  upTo?: boolean;
  /** What the figure is, from its record's `figure_names_he`: a number under the rule's title alone ("83%") says nothing of what it counts. */
  name?: string | null;
  /** The calendar year a yearly figure is for (its `effective_from` to `effective_to`, or its tax year), so last year's count never reads as today's. */
  year?: string | null;
  weak: "institution" | "secondary" | null;
}

/** A fact the site computes from collected records (no rule behind it): the sentence, with its figures in `Num`. */
export interface WorthFactRow {
  kind: "fact";
  id: string;
  content: ReactNode;
}

/** The rows for one wrapper: pinned ids whose record is loaded and has a Hebrew title, at most three. */
/**
 * A figure name that is a legal cap, shown with "עד": its name holds `cap` as a word (`balance_cap`, `deposit_cap_after_21`),
 * but not a minimum (`min_market_cap_usd`) nor a market capitalisation (`market_cap_coverage`), which are no ceiling on what is charged.
 */
export const isCapName = (name: string) => /(^|_)cap(_|$)/.test(name) && !/(^|_)min(_|$)/.test(name) && !/(^|_)market_cap(_|$)/.test(name);

/** A figure name that is the amount written in the law before indexation (`base_ceiling`, KGL-02): never the amount in force, so a row does not show it. */
export const isBaseName = (name: string) => name.startsWith("base_");

export function worthRows(ids: readonly string[] | undefined, rules: Record<string, RuleRecord>, today: string): WorthRow[] {
  const rows: WorthRow[] = [];
  for (const id of ids ?? []) {
    const r = rules[id];
    if (!r?.title_he) continue;
    const first = Object.keys(r.figures ?? {}).find((n) => !isBaseName(n) && ruleFigure(r, n, today));
    const figure = first ? ruleFigure(r, first, today) : null;
    rows.push({
      kind: "rule",
      id,
      title: r.title_he,
      figure,
      upTo: first !== undefined && isCapName(first),
      name: first ? (r.figure_names_he?.[first] ?? null) : null,
      year: figure ? figureYear(figure) : null,
      weak: r.strength === "institution" || r.strength === "secondary" ? r.strength : null,
    });
    if (rows.length === 3) break;
  }
  return rows;
}

export function WorthKnowing({ rows, facts = [], abroad }: { rows: WorthRow[]; facts?: WorthFactRow[]; abroad?: ReactNode }) {
  if (rows.length === 0 && facts.length === 0 && !abroad) return null;
  return (
    <GuideSection id="worth" title={copy.title}>
      <p className="text-muted-foreground max-w-measure">{copy.line}</p>
      <ul data-wide className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Card pad="snug" className="h-full flex flex-col gap-1">
              {r.figure && (
                <span className="text-2xl font-semibold whitespace-nowrap">
                  {r.upTo && <span className="text-base font-normal text-muted-foreground">{copy.upTo} </span>}
                  <Num value={r.figure} />
                  {wordUnits.has(r.figure.unit) && (provCopy.unit as Record<string, string>)[r.figure.unit] && <span className="text-base font-normal text-muted-foreground"> {(provCopy.unit as Record<string, string>)[r.figure.unit]}</span>}
                </span>
              )}
              {r.figure && r.name && (
                <span className="text-sm text-muted-foreground">
                  {r.name}
                  {r.year && (
                    <>
                      {" "}
                      {copy.inYear} <bdi dir="ltr">{r.year}</bdi>
                    </>
                  )}
                </span>
              )}
              <span>{r.title}</span>
              <span className="mt-auto flex flex-wrap items-center gap-x-2">
                <RuleRef id={r.id} />
                {r.weak && <StrengthLabel strength={r.weak} />}
              </span>
            </Card>
          </li>
        ))}
        {facts.map((f) => (
          <li key={f.id}>
            <Card pad="snug" className="h-full">
              {f.content}
            </Card>
          </li>
        ))}
      </ul>
      {abroad && <div data-wide>{abroad}</div>}
    </GuideSection>
  );
}
