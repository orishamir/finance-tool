// Section 1 of the index page: every investment house with its cheapest way at it (the founder, 2026-10-26: the house is the choice
// that matters, the fund type a byproduct). Israeli houses ranked by what is left, foreign brokers as their own group, the houses that
// do not compute last with their reason. A row picks the house for the funds section below it.
import { Link } from "react-router";
import { invest as c } from "../../copy";
import type { HouseRow, InvestView } from "../../lib/invest";
import { brokerLabels } from "../../lib/labels";
import { IconExternal } from "../icons";
import { Num } from "../provenance";
import { Button, Card, cx, Disclosure, LabelRow, RankBadge, Section, Sentence, Tag } from "../kit";
import { OptionTag, reasonText } from "./parts";
import { ProviderLink } from "./sections";

const TOP = 5;
const CLS = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "etf_units", abroad: "foreign_securities" } as const;

export function HousesSection({ view, chosen, onPick }: { view: InvestView; chosen: string | null; onPick: (id: string) => void }) {
  const computes = (r: HouseRow) => !!(r.best || r.generic);
  const il = view.houses.filter((r) => r.group === "il" && computes(r));
  const foreign = view.houses.filter((r) => r.group === "foreign" && computes(r));
  const rest = view.houses.filter((r) => !computes(r));
  const shown = il.filter((r, i) => i < TOP || r.provider.id === view.yourBroker);
  const folded = il.filter((r) => !shown.includes(r));
  const rowOf = (r: HouseRow, rank: number | null) => <HouseItem key={r.provider.id} view={view} row={r} rank={rank} chosen={chosen === r.provider.id} onPick={onPick} />;
  return (
    <Section id="invest-houses" level="card" title={c.houses.heading} lead={c.houses.sub}>
      <p className="text-sm text-muted-foreground max-w-measure">{c.houses.tap}</p>
      <ol className="flex flex-col gap-2" aria-label={c.houses.listLabel}>
        {shown.map((r) => rowOf(r, il.indexOf(r) + 1))}
      </ol>
      {folded.length > 0 && (
        <Disclosure label={c.houses.more(folded.length)} openLabel={c.houses.less}>
          <ol className="flex flex-col gap-2 pt-2" aria-label={c.houses.listLabel}>
            {folded.map((r) => rowOf(r, il.indexOf(r) + 1))}
          </ol>
        </Disclosure>
      )}
      {foreign.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <h3 className="font-semibold">{c.houses.foreignHeading}</h3>
          <p className="text-sm text-muted-foreground max-w-measure">{c.houses.foreignSub}</p>
          <ol className="flex flex-col gap-2" aria-label={c.houses.foreignHeading}>
            {foreign.map((r, i) => rowOf(r, i + 1))}
          </ol>
          {foreign.some((r) => r.provider.id === "interactive-brokers") && <p className="text-xs text-muted-foreground max-w-measure">{c.houses.fixedOnly}</p>}
        </div>
      )}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <h3 className="font-semibold">{c.houses.notComputed}</h3>
          <ul className="flex flex-col gap-1.5">
            {rest.map((r) => (
              <li key={r.provider.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <ProviderLink p={r.provider} short className="font-medium" />
                <NoWay row={r} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

function NoWay({ row }: { row: HouseRow }) {
  if (row.unavailable) {
    const a = row.unavailable;
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
        <Tag tone="caution">{c.houses.unavailable}</Tag>
        <a href={a.source.url} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1" title={a.note ?? a.source.title}>
          {c.houses.sourceOf} <IconExternal size={14} />
        </a>
      </span>
    );
  }
  const cls = row.entries[0] ? CLS[row.entries[0].fund.option] : "etf_units";
  return <span className="text-muted-foreground">{row.reason ? reasonText(row.reason, cls) : c.houses.noWay}</span>;
}

function HouseItem({ view, row: r, rank, chosen, onPick }: { view: InvestView; row: HouseRow; rank: number | null; chosen: boolean; onPick: (id: string) => void }) {
  const yours = r.provider.id === view.yourBroker;
  const pick = () => onPick(r.provider.id);
  const best = r.best;
  return (
    <Card
      as="li"
      pad="tight"
      className={cx("flex flex-col gap-2 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_auto_auto_auto] md:items-center md:gap-4 cursor-pointer hover:bg-accent/40", chosen && "border-primary border-2")}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("a,button,[data-label]")) pick();
      }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <RankBadge rank={best ? rank : null} />
        <div className="flex flex-col gap-1 min-w-0">
          <ProviderLink p={r.provider} short className="font-semibold" />
          <span className="flex flex-wrap gap-1">
            {yours && <Tag tone="entered">{c.houses.yours}</Tag>}
            {r.provider.foreign && <LabelRow labels={brokerLabels(r.provider, false)} />}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        {best ? (
          <>
            <span>
              <bdi className="font-medium">{best.fund.name}</bdi>
            </span>
            <span>
              <OptionTag option={best.fund.option} />
            </span>
          </>
        ) : (
          <Sentence size="sm" tone="muted">
            {c.houses.costNote}
          </Sentence>
        )}
      </div>
      <dl className="contents">
        <Figure label={best ? c.houses.left : c.houses.cost}>{best ? <Num value={best.price!.value} /> : r.generic?.cost ? <Num value={r.generic.cost} /> : null}</Figure>
        <Figure label={c.houses.gap}>{r.gap ? <Num value={r.gap} /> : null}</Figure>
      </dl>
      <Button variant={chosen ? "secondary" : "quiet"} onClick={pick} aria-pressed={chosen}>
        {chosen ? c.houses.chosen : c.houses.show}
      </Button>
    </Card>
  );
}

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 md:flex-col md:items-end md:gap-0 md:min-w-24 text-end">
      <dt className="text-xs text-muted-foreground">{children ? label : ""}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}
