// The figures and statements of a guide's note on other countries (D114), each as the note writes it and each through `Num`, so a tap
// opens the page it was read on with that page's own words. An amount keeps its own currency, never converted.
import { abroad as copy } from "../../copy";
import { Num } from "../../components/provenance";
import { countPhrase, type CountWords } from "../../lib/count";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";

const numberOf = (v: SiteValue) => Number(v.value);

/** An amount in its own currency, the currency's word after it ("20,000 ליש״ט"), the two decimals a law prints kept ("3,844.80 אירו").
 *  `bare`: the figure alone, where the line already said the currency ("40,000 אירו בשנה, 200,000 בסך הכול"). */
export function AbroadAmount({ v, bare }: { v: SiteValue; bare?: boolean }) {
  const text = fmt.amount(numberOf(v));
  const figure = <Num value={{ ...v, written: text }} display={text} />;
  return bare ? figure : <span className="whitespace-nowrap">{figure} {copy.currency[v.unit]}</span>;
}

/** A number of years with its word ("5 שנים"). */
export function AbroadYears({ v }: { v: SiteValue }) {
  return <Num value={v} display={fmt.years(numberOf(v))} />;
}

/** A number in digits, the line's own words around it (an age, "פי 3"); a half as "½" ("59½"). */
export function AbroadFigure({ v }: { v: SiteValue }) {
  const n = numberOf(v);
  const text = n % 1 === 0.5 ? `${fmt.number(Math.floor(n))}½` : fmt.number(n);
  return <Num value={{ ...v, written: text }} display={text} />;
}

/** A count said in words where Hebrew says it so ("שתי מניות"; copy.md 10.4). */
export function AbroadCount({ v, words }: { v: SiteValue; words: CountWords }) {
  const text = countPhrase(numberOf(v), words);
  return <Num value={{ ...v, written: text }} display={text} />;
}

/** A statement read on the page, in the guide's words ("אין", "בכל עת"). */
export function AbroadSaid({ v, children }: { v: SiteValue; children: string }) {
  return <Num value={v} display={children} />;
}

/** The year an amount holds for, from its own dates: "2026", or a tax year that spans two calendar years as "2026 עד 2027". Nothing without a start date. */
export function AbroadPeriod({ v }: { v: SiteValue }) {
  const from = v.effective_from?.slice(0, 4);
  const to = v.effective_to?.slice(0, 4);
  if (!from) return null;
  return to && to !== from ? (
    <>
      <bdi>{from}</bdi> {copy.yearTo} <bdi>{to}</bdi>
    </>
  ) : (
    <bdi>{from}</bdi>
  );
}
