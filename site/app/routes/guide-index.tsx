// The guide list (flows 6.4): where the money is held, what it is invested in, and the not-covered card.
import type { ReactNode } from "react";
import { Link, useLoaderData } from "react-router";
import { guideIndex as copy, limitedBondFund, mutualFunds, site } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { PageShell } from "../components/shell";
import { Card, ChipList, cx, gershayim, GroupHead, PageHead, RowArrow, RowList, Section } from "../components/kit";
import { groupGuides } from "../lib/guide-nav";

export async function loader() {
  const { loadTerms, loadProducts, today } = await import("../lib/data.server");
  const { exposureFolds, loadExposures } = await import("../lib/instruments.server");
  const { isSecurity } = await import("@finance-tool/schema");
  const terms = loadTerms();
  const line = (name: string) => terms.find((t) => t.he === name)?.explanation ?? null;
  const products = loadProducts();
  // D6: "איפה הכסף מוחזק" lists only wrappers; a security (makam, a bond, a money-market fund) is what the money is invested in
  // a name that must be decoded also shows the plain name the product's own record carries
  const wrappers = products.filter((w) => !isSecurity(w)).map((w) => ({ id: w.id, name: w.names.he[0]!, line: line(w.names.he[0]!), plain: (copy.plainSubtitleFor as readonly string[]).includes(w.id) ? (w.names.he[1] ?? null) : null }));
  const securities = products.filter(isSecurity);
  const folds = exposureFolds();
  const exposures: ExposureItem[] = [];
  for (const e of loadExposures()) {
    const into = securities.find((x) => x.id === folds[e.id]);
    if (!into) exposures.push({ key: e.id, name: e.names.he[0] ?? e.id, line: e.one_line_he ?? line(e.names.he[0] ?? ""), href: `/exposure/${e.id}`, kinds: [] });
    // an exposure that a security held directly is has that security's page (makam; both kinds of government bond share one)
    else if (!exposures.some((x) => x.key === into.id)) exposures.push({ key: into.id, name: into.names.he[0]!, line: line(into.names.he[0]!) ?? line(e.names.he[0] ?? ""), href: `/guide/${into.id}`, kinds: [] });
  }
  // the money-market funds are one entry: a fund held as units, whose kinds each have a page
  const funds = securities.filter((x) => x.held_as === "fund_units");
  if (funds.length > 0) {
    const name = funds[0]!.names.he[0]!;
    exposures.push({ key: "money-market-funds", name, line: line(name), href: `/guide/${funds[0]!.id}`, kinds: funds.map((f) => ({ href: `/guide/${f.id}`, label: copy.fundKinds[f.id] ?? f.names.he[0]! })) });
  }
  // a guide of its own, no product id: not an option in the comparison
  exposures.push({ key: "limited-bond-fund", name: limitedBondFund.title, line: limitedBondFund.indexLine, href: "/guide/limited-bond-fund", kinds: [] });
  // funds of every kind, before the kinds that have pages of their own (D55)
  exposures.push({ key: "mutual-funds", name: mutualFunds.title, line: mutualFunds.indexLine, href: "/guide/mutual-funds", kinds: [] });
  exposures.sort((a, b) => rank(a.key) - rank(b.key));
  return { wrappers, exposures, today: today() };
}

interface ExposureItem {
  key: string;
  name: string;
  line: string | null;
  href: string;
  kinds: { href: string; label: string }[];
}

/** The cash-like and bond entries first, short to long, then the rest in file order. */
const exposureOrder = ["shekel-cash", "mutual-funds", "money-market-funds", "makam", "government-bond", "limited-bond-fund"];
const rank = (key: string) => (exposureOrder.includes(key) ? exposureOrder.indexOf(key) : exposureOrder.length);

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

/** A group's guides: rows of one box on a phone (`RowList`), cards two and three across from `md`. */
function GuideList({ children }: { children: ReactNode }) {
  return <RowList className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:rounded-none md:border-0 md:bg-transparent md:divide-y-0 md:overflow-visible">{children}</RowList>;
}

/** A guide's card; inside a `GuideList` on a phone it is a row of the list's box, with no frame of its own. */
const inList = "max-md:rounded-none max-md:border-0 max-md:bg-transparent";

function InstrumentCard({ href, name, line, plain, quiet }: { href: string; name: string; line: string | null; plain?: string | null; quiet?: boolean }) {
  return (
    <li>
      <Link to={href} className="block h-full">
        <Card pad="snug" className={cx("h-full flex items-start justify-between gap-4 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)]", quiet ? "bg-background" : inList)}>
          <span className="flex flex-col gap-1">
            <span className="font-semibold md:text-lg">{gershayim(name)}</span>
            {plain && (
              <span className="text-sm">
                {copy.alsoCalled} <bdi>{gershayim(plain)}</bdi>
              </span>
            )}
            {line && <span className="text-sm text-muted-foreground">{gershayim(line)}</span>}
          </span>
          <RowArrow className="mt-1" />
        </Card>
      </Link>
    </li>
  );
}

export default function GuideIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="guide" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section">
        <PageHead title={copy.title} lede={copy.lede} />
        <Section title={copy.group1.title} lead={copy.group1.line}>
          <div className="flex flex-col gap-6">
            {groupGuides(data.wrappers.map((w) => w.id)).map((g) => (
              <div key={g.id} className="flex flex-col gap-3">
                <GroupHead>{copy.purposeGroups[g.id] ?? g.id}</GroupHead>
                <GuideList>
                  {g.ids.map((id) => {
                    const w = data.wrappers.find((x) => x.id === id)!;
                    return <InstrumentCard key={w.id} href={`/guide/${w.id}`} name={w.name} line={w.line} plain={w.plain} />;
                  })}
                </GuideList>
              </div>
            ))}
          </div>
        </Section>
        {data.exposures.length > 0 && (
          <Section title={copy.group2.title} lead={copy.group2.line}>
            <GuideList>
              {data.exposures.map((e) =>
                e.kinds.length > 0 ? (
                  <li key={e.key}>
                    <Card pad="snug" className={cx("h-full flex flex-col gap-2", inList)}>
                      <Link to={e.href} className="flex items-start justify-between gap-4 hover:underline">
                        <span className="font-semibold md:text-lg">{gershayim(e.name)}</span>
                        <RowArrow className="mt-1" />
                      </Link>
                      {e.line && <span className="text-sm text-muted-foreground">{gershayim(e.line)}</span>}
                      <ChipList heading={`${gershayim(e.name)} ${copy.fundKindsLine}`} headingHidden items={e.kinds.map((k) => ({ id: k.href, label: gershayim(k.label), href: k.href }))} value={null} />
                    </Card>
                  </li>
                ) : (
                  <InstrumentCard key={e.key} href={e.href} name={e.name} line={e.line} />
                ),
              )}
            </GuideList>
          </Section>
        )}
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <InstrumentCard href={site.notCovered.href} name={copy.last.title} line={copy.last.line} quiet />
        </ul>
      </div>
    </PageShell>
  );
}
