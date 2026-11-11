// The first page's body (flows 6.1): the site's name, one line and the search field, then three groups by what the reader came to do:
// to understand (the guide's kinds, P-10), to compare (the deposits, the tracks, the indices and the companies, each with one line that
// says what the page answers) and to check what they were told (two of the rules page's own example claims, each opening that page with
// the claim typed). From 1024 px the name stands at the start with the search at the end, and the three groups stand side by side; under
// it everything is one column, the groups' rows in one box each, not cards in cards.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { companies, depositBrowser, home as copy, invest, knowledgeEntry, rulesFront, site, trackBrowser } from "../../copy";
import { PageSearchField } from "../shell";
import { Num } from "../provenance";
import { Card, ChipList, GoLink, GoRow, GroupHead, RowList } from "../kit";
import { emptyFilters, filtersToSearch } from "../../lib/rules-filter";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";

/** The deposits row's figure: the deposits page's heading as the page opens (its term, its kind, P-05's amount), from the same pick (F-108). */
export interface HomeDeposit {
  /** The offer's own rate, as the bank prints it (its state and any doubt with it). */
  rate: SiteValue;
  /** The bank's short name, as the deposits page writes it after "בבנק". */
  bank: string;
  amount: number;
}

/** The example claims the home page opens the rules page with: the first two of the rules page's own examples under its field. */
export const HOME_CLAIMS = rulesFront.ask.examples.slice(0, 2);

/** The rules page with a claim typed in its field (`?q=`), the address its own example buttons leave. */
export const claimHref = (claim: string): string => `/rules${filtersToSearch({ ...emptyFilters, q: claim })}`;

/** "הריבית הקבועה הגבוהה לשנה על 10,000 ₪: 3.25% בבנק ירושלים"; with no pick, what the page answers, in words. */
export function DepositLine({ deposit }: { deposit: HomeDeposit | null }) {
  const w = copy.compare.deposits;
  if (!deposit) return <>{w.plain}</>;
  return (
    <>
      {w.lead}
      <bdi dir="ltr">{fmt.number(deposit.amount)} ₪</bdi>
      {w.colon}
      <Num value={deposit.rate} />
      {w.atBank}
      {deposit.bank}
    </>
  );
}

function Group({ id, head, children }: { id: string; head: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 min-w-0">
      <GroupHead as="h2" id={id}>
        {head}
      </GroupHead>
      {children}
    </section>
  );
}

export function HomeBody({ guideTypes, deposit }: { guideTypes: { id: string; name: string }[]; deposit: HomeDeposit | null }) {
  const u = copy.understand;
  const c = copy.compare;
  const k = copy.check;
  return (
    <div className="mx-auto max-w-measure lg:max-w-none flex flex-col gap-10 pt-6 lg:pt-16">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-end">
        <header className="flex flex-col gap-2 lg:col-span-6">
          <h1 className="text-3xl font-semibold">{site.name}</h1>
          <p className="text-lg text-muted-foreground">{site.tagline}</p>
          <p className="text-sm text-muted-foreground">{site.footerNote}</p>
        </header>
        <div className="flex flex-col gap-2 lg:col-span-6">
          <label htmlFor="home-search" className="text-sm font-medium">
            {copy.searchLabel}
          </label>
          <PageSearchField inputId="home-search" />
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-3 lg:gap-x-8 lg:items-start">
        <Group id="home-understand" head={u.head}>
          <Card pad="snug" className="flex flex-col gap-3">
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{u.title}</span>
              <span className="text-sm text-muted-foreground">{u.line}</span>
            </span>
            <ChipList
              heading={u.title}
              headingHidden
              items={guideTypes.map((t) => ({ id: t.id, label: t.name, href: `/guide/${t.id}` }))}
              value={null}
              footer={
                <GoLink to={u.href} className="self-start">
                  {u.all}
                </GoLink>
              }
            />
          </Card>
        </Group>

        <Group id="home-compare" head={c.head}>
          <RowList>
            <GoRow title={depositBrowser.title} line={<DepositLine deposit={deposit} />} to="/deposits" label={depositBrowser.title} />
            <GoRow title={trackBrowser.title} line={c.tracks} to="/tracks" label={trackBrowser.title} />
            <GoRow title={invest.nav} line={c.indices} to="/indices" label={invest.nav} />
            <GoRow title={companies.title} line={c.companies} to="/companies" label={companies.title} />
          </RowList>
        </Group>

        <Group id="home-check" head={k.head}>
          <p className="text-sm text-muted-foreground">{k.lead}</p>
          <RowList>
            {HOME_CLAIMS.map((claim) => (
              <GoRow key={claim} title={k.quoted(claim)} to={claimHref(claim)} label={claim} />
            ))}
          </RowList>
          <GoLink to="/rules" className="self-start">
            {k.all}
          </GoLink>
        </Group>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-8">
        <Link to={site.notCovered.href} className="text-sm text-link min-h-target inline-flex items-center hover:underline self-start lg:self-auto">
          {site.notCovered.label}
        </Link>
        <p className="text-sm text-muted-foreground">
          {knowledgeEntry.homeLine}{" "}
          <Link to="/rules" className="text-link min-h-target inline-flex items-center hover:underline">
            {knowledgeEntry.homeLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
