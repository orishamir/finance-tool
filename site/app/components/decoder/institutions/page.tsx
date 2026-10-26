// The bank page and the broker page (flows 32, 33; design-spec 20): a bank's deposits, savings plans and current
// account as product rows, its brokerage card, the catalogue's names, the paste card; a broker's card alone.
import { useState } from "react";
import { Link } from "react-router";
import { buttons, catalogue, companies as companiesCopy, r4catalogue as copy } from "../../../copy";
import { fmt } from "../../../lib/format";
import { IconAlert, IconDrillIn, IconExternal } from "../../icons";
import { LeadTail, NumAfter, NumberLegend } from "../../provenance";
import { Breadcrumb, PageShell } from "../../shell";
import { Button, Callout, Card, Disclosure } from "../../kit";
import { PasteCard } from "../tracks";
import { BrokerageGroupCard } from "./brokerage-card";
import { CompanyTerms } from "../company-terms";
import { BankProductRow } from "./product-row";
import type { InstitutionPageData } from "./types";

function countLine(n: number) {
  if (n === 1) return copy.count.one;
  if (n === 2) return copy.count.two;
  return `${fmt.number(n)} ${copy.count.many}`;
}

const groupTitle: Record<string, string> = { "bank-deposit": copy.groups.deposits, "savings-plan": copy.groups.savings, "current-account": copy.groups.current };

function CopyLine({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <Button
      variant="quiet"
      className="text-sm self-start"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setState("done");
          window.setTimeout(() => setState("idle"), 2000);
        } catch {
          setState("failed");
        }
      }}
    >
      {state === "done" ? buttons.copied : buttons.copy}
    </Button>
  );
}

export function InstitutionPage({ data }: { data: InstitutionPageData }) {
  const known = new Set(Object.keys(data.rules));
  const isBank = data.kind === "bank";
  const tariff = data.tariff;
  const notCollected = `${copy.depositsNotCollected.before}${data.name}${copy.depositsNotCollected.after}`;
  const wrapperName = (id: string) => data.groups.find((g) => g.wrapperId === id)?.wrapperName ?? "";
  const brokerage = <BrokerageGroupCard id={data.id} tariff={tariff} kind={data.kind} />;
  return (
    <PageShell current="decoder" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: data.terms.dimensions, today: data.today, ...(data.terms.company ? { company: data.terms.company } : {}) }}>
      <div className="lg:flex lg:gap-12 lg:items-start pt-2 lg:pt-8">
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/companies", label: companiesCopy.back }} current={data.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">
              <bdi>{data.name}</bdi>
            </h1>
            {isBank ? (
              <p className="text-sm lg:text-base text-muted-foreground max-w-measure">
                {copy.ledeIntro}
                {(data.depositsAsOf || (tariff && !tariff.missing)) && " "}
                {data.depositsAsOf && (
                  <>
                    <NumAfter lead={copy.ledeDeposits} value={data.depositsAsOf} />
                    {tariff && !tariff.missing && "; "}
                  </>
                )}
                {tariff && !tariff.missing && (
                  <>
                    <NumAfter lead={copy.ledeTariff} value={tariff.snapshot} />
                  </>
                )}
                {(data.depositsAsOf || (tariff && !tariff.missing)) && "."}
              </p>
            ) : (
              <p className="text-sm lg:text-base text-muted-foreground max-w-measure">{copy.brokerClassLine}</p>
            )}
            <NumberLegend />
            {tariff && !tariff.missing && tariff.stale && (
              <Callout tone="caution">
                <LeadTail lead={copy.card.stale.before}>
                  <bdi dir="ltr">{fmt.date(String(tariff.snapshot.value))}</bdi>
                </LeadTail>
                {copy.card.stale.after}
              </Callout>
            )}
          </header>

          {isBank && (
            <section aria-labelledby="inst-groups" className="flex flex-col gap-3.5">
              <h2 id="inst-groups" className="sr-only">
                {data.name}
              </h2>
              {!data.hasDeposits && (
                <Disclosure
                  defaultOpen
                  className="flex flex-col gap-2"
                  summaryClassName="min-h-12 md:min-h-14"
                  label={
                    <span className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-3">
                      <span className="text-lg lg:text-xl font-semibold">{copy.groups.deposits}</span>
                    </span>
                  }
                >
                  <Card as="div" className="flex flex-col gap-2.5">
                    <p className="max-w-measure">{notCollected}</p>
                    <CopyLine text={notCollected} />
                    {data.rateTable && (
                      <a href={data.rateTable.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline min-h-target text-sm self-start">
                        {copy.rateTableLink}
                        <IconExternal size={16} />
                      </a>
                    )}
                  </Card>
                </Disclosure>
              )}
              {data.groups.map((g, i) => (
                <Disclosure
                  key={g.wrapperId}
                  defaultOpen={i === 0}
                  className="flex flex-col gap-2"
                  summaryClassName="min-h-12 md:min-h-14"
                  label={
                    <span className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-3">
                      <span className="text-lg lg:text-xl font-semibold">{groupTitle[g.wrapperId] ?? g.wrapperName}</span>
                      <span className="text-sm text-muted-foreground">{countLine(g.products.length)}</span>
                    </span>
                  }
                >
                  <Link to={`/guide/${g.wrapperId}`} className="inline-flex items-center gap-0.5 min-h-target text-sm text-link hover:underline self-start px-1">
                    {copy.groupLink} {g.wrapperName}
                    <IconDrillIn size={16} />
                  </Link>
                  {g.wrapperId === "bank-deposit" && g.products.length === 1 && (
                    <p className="text-sm text-muted-foreground max-w-measure px-1">
                      {copy.oneTariff.before}
                      <Link to="/idle-cash" className="text-link hover:underline">
                        {copy.oneTariff.link}
                      </Link>
                      {copy.oneTariff.after}
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    {g.products.map((p) => (
                      <BankProductRow key={p.id} p={p} known={known} wrapperName={wrapperName(p.wrapperId)} />
                    ))}
                  </div>
                </Disclosure>
              ))}
              <Disclosure
                className="lg:hidden flex flex-col gap-2"
                summaryClassName="min-h-12 md:min-h-14"
                defaultOpen={!data.hasDeposits}
                label={<span className="text-lg font-semibold">{copy.groups.brokerage}</span>}
              >
                {brokerage}
              </Disclosure>
            </section>
          )}

          {!isBank && brokerage}

          {data.catalogue.length > 0 && (
            <section aria-labelledby="inst-also" className="flex flex-col gap-3">
              <h2 id="inst-also" className="text-xl lg:text-2xl font-semibold">
                {catalogue.alsoCalled}
              </h2>
              <Card as="div" className="p-0 md:p-0">
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
          )}
          <CompanyTerms name={data.terms.name} groups={data.terms.groups} />
          <PasteCard className="lg:hidden" />
        </div>

        <aside className="hidden lg:flex w-[38%] max-w-[420px] shrink-0 flex-col gap-4 pt-[100px]" aria-label="עוד">
          {isBank && brokerage}
          <PasteCard />
        </aside>
      </div>
    </PageShell>
  );
}
