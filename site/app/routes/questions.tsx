// The questions page (founder, 2026-10-24 evening): the common questions (P-09), a one-line answer each from the records of the row,
// then the rules the answer rests on. The answer is a sentence with slots {ID:figure}, rendered as the rule's figure with its unit.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/questions";
import { provenance as provCopy, questions as copy, site, topicName } from "../copy";
import { Num, RuleRef, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { parseAnswer } from "../lib/answer-slots";
import { ruleTitle } from "../lib/rule-title";
import { ruleFigure, weaker, type Strength } from "../lib/value";
import type { RuleRecord } from "@finance-tool/schema";

export async function loader() {
  const { loadChecklistRows, loadPinnedRules, loadRules, pointedRecords, today } = await import("../lib/data.server");
  const { loadRuleUses } = await import("../lib/rule-uses.server");
  const rules = loadRules();
  const pinned = loadPinnedRules();
  const rows = pinned.rows.map((row) => ({ question: row.question_he, answer: row.answer_he ?? null, ids: row.ids.filter((id) => rules[id]) }));
  const used = Object.fromEntries(rows.flatMap((r) => r.ids).map((id) => [id, rules[id]!]));
  return {
    rows,
    rules: used,
    pointed: pointedRecords(used, rules),
    ruleUses: loadRuleUses(Object.keys(used)),
    dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    today: today(),
  };
}

export function meta(_: Route.MetaArgs) {
  return [{ title: `${copy.title} · ${site.name}` }];
}

const unitWords = ["months", "years", "days", "business_days", "usd", "eur"];

function Slot({ id, figure, rules, today }: { id: string; figure: string; rules: Record<string, RuleRecord>; today: string }) {
  const rule = rules[id];
  const v = rule ? ruleFigure(rule, figure, today) : null;
  if (!v) return <>—</>;
  const word = (provCopy.unit as Record<string, string>)[v.unit];
  return (
    <span className="whitespace-nowrap">
      <Num value={{ ...v, notes: "" }} />
      {typeof v.value === "number" && word && unitWords.includes(v.unit) && <> {word}</>}
    </span>
  );
}

function shortTitle(r: RuleRecord): string {
  const t = ruleTitle(r);
  return t.english ? topicName(r.il_finance_file) : t.text;
}

export default function Questions() {
  const data = useLoaderData<typeof loader>();
  const rules = data.rules as Record<string, RuleRecord>;
  const pd = { rules, pointed: data.pointed as Record<string, RuleRecord>, terms: {}, dimensions: data.dimensions, today: data.today, ruleUses: data.ruleUses };
  return (
    <PageShell current="questions" data={pd}>
      <div className="pt-2 lg:pt-8 flex flex-col gap-section">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
        </header>
        <ol className="flex flex-col lg:max-w-3xl">
          {data.rows.map((row, i) => {
            const weakest = row.ids.reduce<Strength | undefined>((w, id) => weaker(w, rules[id]!.strength as Strength), undefined);
            const showStrength = weakest === "institution" || weakest === "secondary";
            return (
              <li key={row.question} className="flex flex-col gap-2 py-5 border-b border-border">
                <h2 id={`q-${i + 1}`} className="text-xl font-semibold scroll-mt-[112px] lg:scroll-mt-[88px]">
                  {row.question}
                </h2>
                {row.answer ? (
                  <p className="max-w-measure">
                    {parseAnswer(row.answer).map((p, k) => (p.kind === "text" ? <span key={k}>{p.text}</span> : <Slot key={k} id={p.id} figure={p.figure} rules={rules} today={data.today} />))}
                  </p>
                ) : (
                  <p className="text-muted-foreground max-w-measure">{copy.noAnswer}</p>
                )}
                {showStrength && weakest && (
                  <div>
                    <StrengthLabel strength={weakest} />
                  </div>
                )}
                <ul className="flex flex-col gap-1">
                  {row.ids.map((id) => (
                    <li key={id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className="min-w-0">{shortTitle(rules[id]!)}</span>
                      <RuleRef id={id} />
                    </li>
                  ))}
                </ul>
                <Link to={`/rules?ids=${row.ids.join(",")}`} className="text-link min-h-target inline-flex items-center hover:underline self-start">
                  {copy.toRules}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </PageShell>
  );
}
