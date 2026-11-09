// A guide page that is prose only: the header, then each section of the copy in order, its block from the page's content file.
import type { ReactNode } from "react";
import type { RuleRecord } from "@finance-tool/schema";
import type { ProseGuideData } from "../../lib/prose-guide.server";
import { ruleFigure, type SiteValue } from "../../lib/value";
import { NumberLegend } from "../provenance";
import { PageShell } from "../shell";
import { GuideFrame, GuideHeader, GuideSection, useCurrentSection, type SectionDef } from "./sections";

export type RuleFigure = (ruleId: string, name: string) => SiteValue | null;

export function ProseGuide<Id extends string>({ copy, data, body, children }: {
  copy: { title: string; lede: string; sections: readonly (SectionDef & { id: Id })[] };
  data: ProseGuideData;
  /** Each section's block, given the page's rule figures. */
  body: (figure: RuleFigure) => Record<Id, ReactNode>;
  /** What follows the last section. */
  children?: ReactNode;
}) {
  const rules = data.rules as Record<string, RuleRecord>;
  const figure: RuleFigure = (id, name) => (rules[id] ? ruleFigure(rules[id]!, name, data.today) : null);
  const pd = { rules, pointed: data.pointed as Record<string, RuleRecord>, terms: data.terms, dimensions: data.dimensions, today: data.today, ruleUses: data.ruleUses };
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const blocks = body(figure);
  return (
    <PageShell current="guide" data={pd}>
      <GuideFrame sections={copy.sections} current={current}>
        <GuideHeader title={copy.title}>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <NumberLegend term />
        </GuideHeader>
        {copy.sections.map((s) => (
          <GuideSection key={s.id} id={s.id} title={s.title}>
            {blocks[s.id]}
          </GuideSection>
        ))}
        {children}
      </GuideFrame>
    </PageShell>
  );
}
