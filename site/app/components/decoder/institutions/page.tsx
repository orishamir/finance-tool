// The bank page and the broker page (flows 32, 33), on the company pages' template (components/company/template.tsx): a bank's deposits and
// savings plans as one table each, its current account as one card, its securities account; a broker's securities account alone, with no
// list and no overview. The overview lists each product with its headline fact, then the documents about none of them and the catalogue's
// names.
import type { AdvertisingEntry, FeesSnapshot } from "@finance-tool/schema";
import { catalogue, companyPage as w, r4catalogue as copy } from "../../../copy";
import { IconExternal } from "../../icons";
import { Num, NumAfter } from "../../provenance";
import { PageShell } from "../../shell";
import { Callout, Card, TariffDate, When, gershayim } from "../../kit";
import { BrokerageGroupCard } from "./brokerage-card";
import { BankProductRow } from "./product-row";
import type { InstitutionPageData, ProductGroup } from "./types";
import { withoutLtd } from "../../../lib/company-name";
import { entryIds, splitDocGroups } from "../../../lib/company-page";
import { depositCount, rateRange, termRange } from "../../../lib/bank-table";
import { accountSections } from "./sections";
import { CompanyTemplate, type CompanyPart } from "../../company/template";
import { Overview, type OverviewRow } from "../../company/overview";
import { MoreDocs, ProductDocs, docCount } from "../../company/docs";
import { BankLinks, BankTable } from "../../company/bank-views";
import { companyTermsAnchor } from "../../../lib/scope";

const groupTitle: Record<string, string> = { "bank-deposit": copy.groups.deposits, "savings-plan": copy.groups.savings, "current-account": copy.groups.current };

type Notes = { advertising: readonly AdvertisingEntry[]; groups: FeesSnapshot["groups"] | null; linked: readonly string[] };

export function InstitutionPage({ data, notes }: { data: InstitutionPageData; /** What the page says beside the prices: advertising against the documents, group prices (D57 amended). */ notes?: Notes }) {
  const known = new Set(Object.keys(data.rules));
  const isBank = data.kind === "bank";
  const tariff = data.tariff;
  const path = `/companies/${data.id}`;
  const name = withoutLtd(data.name);
  const hasAccount = !!tariff && !tariff.missing;
  const groups = data.groups.filter((g) => g.products.length > 0);
  const productIds = [...groups.map((g) => g.wrapperId), ...(tariff ? ["brokerage"] : [])];
  const docs = splitDocGroups(data.terms.groups, productIds);
  const sections = hasAccount ? accountSections({ fees: tariff.lines.length > 0, canBuy: tariff.availability.length > 0, claims: (notes?.advertising ?? []).length > 0, groups: !!notes?.groups }) : [];

  const bankPart = (g: ProductGroup): CompanyPart => {
    const label = groupTitle[g.wrapperId] ?? g.wrapperName;
    const docGroups = docs.byProduct[g.wrapperId] ?? [];
    const single = g.products.length === 1;
    return {
      id: g.wrapperId,
      label,
      ...(single ? {} : { count: depositCount(g.products) }),
      anchors: [...g.products.map((p) => `product-${p.id}`), ...entryIds(docGroups)],
      body: (
        <>
          {single ? (
            <BankProductRow p={g.products[0]!} known={known} wrapperName={g.wrapperName} />
          ) : (
            <>
              <BankTable kind={g.wrapperId === "bank-deposit" ? "deposits" : "savings"} products={g.products} known={known} asOf={data.depositsAsOf} />
              <BankLinks wrapperId={g.wrapperId} wrapperName={g.wrapperName} {...(g.wrapperId === "bank-deposit" ? { compare: { to: "/deposits", label: w.deposits.compare } } : {})} />
            </>
          )}
          <ProductDocs product={label} groups={docGroups} />
        </>
      ),
    };
  };
  const docsAnchor = "brokerage-docs";
  const brokerageDocs = docCount(docs.byProduct.brokerage ?? [], (x) => known.has(x));
  const parts: CompanyPart[] = [
    ...groups.map(bankPart),
    ...(tariff
      ? [
          {
            id: "brokerage",
            label: copy.groups.brokerage,
            parts: [...sections.map((s) => ({ id: s.id, label: s.title })), ...(brokerageDocs ? [{ id: docsAnchor, label: w.docs.part(brokerageDocs) }] : [])],
            anchors: [...sections.map((s) => s.id), docsAnchor, ...entryIds(docs.byProduct.brokerage)],
            body: (
              <BrokerageGroupCard id={data.id} tariff={tariff} kind={data.kind} advertising={notes?.advertising} groups={notes?.groups} linked={notes?.linked} docs={<ProductDocs product={copy.groups.brokerage} groups={docs.byProduct.brokerage ?? []} id={docsAnchor} />} />
            ),
          },
        ]
      : []),
  ];

  // the products' headline facts: a table's count and its lowest and highest rate over the periods it spans, the current account's rate, the
  // account's parts and its price list's date
  const rows: OverviewRow[] = parts.map((p) => {
    const g = groups.find((x) => x.wrapperId === p.id);
    const base = { id: p.id, title: p.label, to: `${path}?product=${encodeURIComponent(p.id)}`, label: p.label };
    if (g) {
      const range = rateRange(g.products);
      const many = g.products.length > 1;
      const current = g.products.every((x) => x.currentAccount);
      return {
        ...base,
        end: many ? (g.wrapperId === "bank-deposit" ? w.units.deposits : w.units.plans)(depositCount(g.products)) : copy.count.one,
        ...(range
          ? {
              fact: {
                label: current ? w.overviewFact.current : w.overviewFact.rate(termRange(g.products)),
                value:
                  many && range.low.value !== range.high.value ? (
                    <>
                      <Num value={range.low} /> {w.overviewLine.to} <Num value={range.high} />
                    </>
                  ) : (
                    <Num value={range.high} />
                  ),
              },
            }
          : {}),
        date: data.depositsAsOf ? <NumAfter lead={w.overviewFact.asOf} value={data.depositsAsOf} /> : undefined,
      };
    }
    return {
      ...base,
      fact: { label: w.overviewFact.parts, value: hasAccount ? sections.map((s) => s.title).join(", ") : copy.missingTariff, words: true },
      date: tariff?.published ? <TariffDate dated={tariff.dated} checked={false} date={(lead) => <NumAfter lead={lead} value={tariff.published!} />} /> : tariff ? <NumAfter lead={copy.ledeTariff} value={tariff.snapshot} /> : undefined,
    };
  });
  const notCollected = isBank && !data.hasDeposits ? (
    <span className="inline-flex flex-wrap items-center gap-x-3">
      {`${copy.depositsNotCollected.before}${data.name}${copy.depositsNotCollected.after}`}
      {data.rateTable && (
        <a href={data.rateTable.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline min-h-target">
          {copy.rateTableLink}
          <IconExternal size={16} />
        </a>
      )}
    </span>
  ) : null;

  const names =
    data.catalogue.length > 0 ? (
      <section id="inst-also" aria-labelledby="inst-also-h" className="flex flex-col gap-3 scroll-mt-[112px] lg:scroll-mt-[88px]">
        <h2 id="inst-also-h" className="text-xl lg:text-2xl font-semibold">
          {catalogue.alsoCalled}
        </h2>
        <Card as="div" pad="none">
          <ul className="flex flex-col divide-y divide-border">
            {data.catalogue.map((u) => (
              <li key={u.id} className="flex flex-col gap-1 p-4">
                <span className="font-medium flex flex-col gap-0.5">
                  {u.names.map((n) => (
                    <bdi key={n}>{n}</bdi>
                  ))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {catalogue.seenAt} <bdi dir="ltr">{u.where}</bdi> <NumAfter lead={catalogue.seenOn} value={u.seen} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    ) : null;
  const after = (
    <>
      <MoreDocs company={data.terms.name} whose={isBank ? w.docs.bank : name} groups={docs.rest} id={companyTermsAnchor} />
      {names}
    </>
  );

  return (
    <PageShell current="decoder" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: data.terms.dimensions, today: data.today, ...(data.terms.company ? { company: data.terms.company } : {}), pageCompanies: data.terms.pageCompanies }}>
      <CompanyTemplate
        path={path}
        name={name}
        line={isBank ? `${copy.classWord.bank} · ${gershayim(data.name)}` : copy.brokerClassLine}
        header={
          hasAccount && tariff.stale ? (
            <Callout tone="caution">
              <When iso={String(tariff.snapshot.value)} lead={copy.card.stale.before} />
              {copy.card.stale.after}
            </Callout>
          ) : undefined
        }
        {...(isBank ? { listLabel: w.bankList } : {})}
        parts={parts}
        overview={{
          anchors: [companyTermsAnchor, "inst-also", ...entryIds(docs.rest)],
          body: (
            <Overview heading={isBank ? w.whatsInBank : w.whatsIn(name)} rows={rows} quiet={notCollected ? [notCollected] : []}>
              {after}
            </Overview>
          ),
        }}
        single={
          <div className="flex flex-col gap-section pt-4">
            {notCollected && <p className="text-sm text-muted-foreground max-w-measure">{notCollected}</p>}
            {after}
          </div>
        }
      />
    </PageShell>
  );
}
