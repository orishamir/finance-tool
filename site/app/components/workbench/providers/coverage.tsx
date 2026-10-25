// The provider coverage line (flow 28 step 8, design-spec 16.3): every provider once, the ranked group collapsed and
// the not-comparable group open, with the invariant (counts equal rows) checked in development.
import { Link } from "react-router";
import { r2, r4workbench as c } from "../../../copy";
import { countForm } from "../../../lib/compare";
import type { CoverageView } from "../../../lib/providers";
import { computed } from "../../../lib/value";
import { Num } from "../../provenance";
import { reasonSentence } from "./row";
import { CoverageFold, FoldGroup } from "../../kit";

/** A count with its own form (the numeral in words for one and two, the digit otherwise) and the word that agrees with it. */
function CountWord({ n, forms, value, numerals }: { n: number; forms: { one: string; other: string }; value: ReturnType<typeof computed>; numerals: { one: string; two: string } }) {
  const f = countForm(n, forms, numerals);
  return (
    <>
      <Num value={value} {...(f.numeral ? { display: f.numeral } : {})} /> {f.word}
    </>
  );
}

export function ProviderCoverage({ coverage, today, instrumentClass, channelWord }: { coverage: CoverageView; today: string; instrumentClass: string; channelWord: string }) {
  const t = c.providers.coverage;
  const count = (n: number, about: string) => computed(n, "count", "F-83", {}, { today, about });
  const ranked = coverage.ranked.length;
  const not = coverage.notComparable.length;
  if (import.meta.env.DEV && (ranked + not !== coverage.considered || !coverage.invariantOk)) console.error("provider coverage: counts do not equal rows", coverage);
  const groups = [
    { key: "ranked", label: t.groups.ranked, rows: coverage.ranked.map((r) => ({ id: r.id, name: r.name, note: null as string | null })), open: false },
    { key: "not", label: t.groups.notComparable, rows: coverage.notComparable.map((r) => ({ id: r.id, name: r.name, note: reasonSentence(r.reason, instrumentClass, channelWord) })), open: true },
  ].filter((g) => g.rows.length > 0);
  return (
    <CoverageFold
      lead={
        <>
          {ranked === 1 && coverage.considered > 1 ? (
            <>
              {t.oneRanked.before}
              <Num value={count(ranked, t.groups.ranked)} />
              {t.oneRanked.mid}
              <Num value={count(coverage.considered, "ספקים")} />
              {t.oneRanked.after}
            </>
          ) : (
            <>
              {coverage.considered === 1 ? t.sentence.verbOne : t.sentence.verbMany}
              {coverage.considered === 1 || coverage.considered === 2 ? (
                <Num value={count(coverage.considered, "ספקים")} display={coverage.considered === 1 ? t.sentence.one : t.sentence.two} />
              ) : (
                <>
                  <Num value={count(coverage.considered, "ספקים")} />
                  {t.sentence.after}
                </>
              )}
              {t.sentence.colon}
              <CountWord n={ranked} forms={t.sentence.ranked} value={count(ranked, t.groups.ranked)} numerals={t.sentence.numerals} />
              {t.sentence.sep}
              <CountWord n={not} forms={{ one: t.sentence.not, other: t.sentence.not }} value={count(not, t.groups.notComparable)} numerals={t.sentence.numerals} />
              {t.sentence.end}
            </>
          )}
        </>
      }
      openLabel={r2.result.coverageOpen}
      closeLabel={r2.result.coverageClose}
      pad="snug"
      bodyPad="snug"
      bodyClassName="flex flex-col gap-1"
    >
      {groups.map((g) => (
        <FoldGroup key={g.key} title={g.label} count={g.rows.length} defaultOpen={g.open}>
          <ul className="flex flex-col">
            {g.rows.map((r) => (
              <li key={r.id} className="flex items-baseline gap-2 flex-wrap py-2 border-b border-border last:border-b-0">
                <Link to={`/companies/${r.id}`} className="text-link hover:underline">
                  {r.name}
                </Link>
                {r.note && <bdi dir="ltr" className="text-xs text-muted-foreground">{r.note}</bdi>}
              </li>
            ))}
          </ul>
        </FoldGroup>
      ))}
    </CoverageFold>
  );
}
