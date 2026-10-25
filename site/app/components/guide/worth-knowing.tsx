// "שווה לדעת" (synthesis 3.7): two or three pinned facts per wrapper guide page, each the rule's Hebrew title,
// its first figure, the rule chip and the weak-strength tag. Nothing renders when no row can be shown.
//
// 2026-10-25 (current-account page): a row can also be a fact computed from the published records, not a rule
// (`WorthFactRow`): it carries its own content, every figure in it through `Num`, and is listed after the rule rows.
import type { ReactNode } from "react";
import type { RuleRecord } from "@finance-tool/schema";
import { guideWorth as copy, provenance as provCopy } from "../../copy";
import { ruleFigure, type SiteValue } from "../../lib/value";
import { Num, RuleRef, StrengthLabel } from "../provenance";
import { GuideSection } from "./sections";

export interface WorthRow {
  kind?: "rule";
  id: string;
  title: string;
  figure: SiteValue | null;
  weak: "institution" | "secondary" | null;
}

/** A fact the site computes from collected records (no rule behind it): the sentence, with its figures in `Num`. */
export interface WorthFactRow {
  kind: "fact";
  id: string;
  content: ReactNode;
}

/** The rows for one wrapper: pinned ids whose record is loaded and has a Hebrew title, at most three. */
export function worthRows(ids: readonly string[] | undefined, rules: Record<string, RuleRecord>, today: string): WorthRow[] {
  const rows: WorthRow[] = [];
  for (const id of ids ?? []) {
    const r = rules[id];
    if (!r?.title_he) continue;
    const first = Object.keys(r.figures ?? {}).find((n) => ruleFigure(r, n, today));
    rows.push({ kind: "rule", id, title: r.title_he, figure: first ? ruleFigure(r, first, today) : null, weak: r.strength === "institution" || r.strength === "secondary" ? r.strength : null });
    if (rows.length === 3) break;
  }
  return rows;
}

export function WorthKnowing({ rows, facts = [] }: { rows: WorthRow[]; facts?: WorthFactRow[] }) {
  if (rows.length === 0 && facts.length === 0) return null;
  return (
    <GuideSection id="worth" title={copy.title}>
      <p className="text-muted-foreground max-w-measure">{copy.line}</p>
      <ul className="flex flex-col gap-3 max-w-measure">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border pb-3">
            <span>{r.title}</span>
            {r.figure && (
              <span className="whitespace-nowrap">
                <Num value={r.figure} />
                {["months", "years", "days", "business_days", "usd", "eur"].includes(r.figure.unit) && (provCopy.unit as Record<string, string>)[r.figure.unit] && <span className="text-muted-foreground"> {(provCopy.unit as Record<string, string>)[r.figure.unit]}</span>}
              </span>
            )}
            <RuleRef id={r.id} />
            {r.weak && <StrengthLabel strength={r.weak} />}
          </li>
        ))}
        {facts.map((f) => (
          <li key={f.id} className="border-b border-border pb-3">
            {f.content}
          </li>
        ))}
      </ul>
    </GuideSection>
  );
}
