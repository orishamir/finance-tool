// A brand's funds (D33): one row per fund record of the brand's fund managers, with its number, what it follows, Maya's page of the
// fund and its fees as the manager's own sourced figures. Only collected records: the full list is the manager's, on Maya (CAT-43).
import { Link } from "react-router";
import { brands as copy, invest } from "../../copy";
import type { BrandFundRow } from "../../lib/brands.server";
import { IconDrillIn, IconExternal } from "../icons";
import { Num } from "../provenance";
import { Card, KeyValue } from "../kit";
import type { SiteValue } from "../../lib/value";

const c = invest.funds;

function FeeValue({ value }: { value: SiteValue | null }) {
  return value ? <Num value={value} /> : <span className="text-muted-foreground">{c.notCollected}</span>;
}

export function BrandFundList({ funds }: { funds: BrandFundRow[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {funds.map((f) => (
        <BrandFundCard key={f.id} f={f} />
      ))}
    </ul>
  );
}

function BrandFundCard({ f }: { f: BrandFundRow }) {
  return (
    <Card as="li" pad="tight" id={`fund-${f.id}`} className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold leading-snug">
          <bdi>{f.name}</bdi>
        </h3>
        <span className="text-sm text-muted-foreground">
          {c.manager}: <bdi>{f.manager}</bdi>
        </span>
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {f.number && (
            <span>
              {c.number} <bdi dir="ltr" className="font-mono">{f.number}</bdi>
            </span>
          )}
          {f.mayaHref && (
            <a href={f.mayaHref} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1">
              {c.mayaPage} <IconExternal size={14} />
            </a>
          )}
        </span>
        {f.follows && (
          <Link to={f.follows.href} className="text-sm text-link hover:underline inline-flex items-center gap-1 self-start min-h-target">
            <span>
              {copy.funds.follows} <bdi>{f.follows.name || copy.funds.moneyMarket}</bdi>
            </span>
            <IconDrillIn size={16} />
          </Link>
        )}
      </div>
      <dl className="flex flex-col gap-0.5 max-w-sm">
        <KeyValue label={c.fixed}>
          <FeeValue value={f.fixed} />
        </KeyValue>
        <KeyValue label={c.variable}>
          <FeeValue value={f.variable} />
        </KeyValue>
        <KeyValue label={c.trustee}>
          <FeeValue value={f.trustee} />
        </KeyValue>
      </dl>
    </Card>
  );
}
