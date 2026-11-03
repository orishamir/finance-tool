// A provident wrapper's provider tab (flows 15.5, design-spec 17 edge cases): a sourced listing of managers' list fees
// from the snapshots, not ranked, with the line that the ranking for these wrappers is by track. One card per company;
// its name links to the company page by the regulator's company id.
import { Link } from "react-router";
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import { companyHref, type Listing, type RowTariff } from "../../../lib/providers";
import { IconClock, IconExternal } from "../../icons";
import { LeadTail, Num, NumAfter } from "../../provenance";
import { Callout, Card } from "../../kit";

export function ProvidentListing({ listing, wrapperId }: { listing: Listing; wrapperId: string }) {
  const t = c.providers.provident;
  const baseWord: Record<string, string> = { balance: t.balance, deposit: t.deposit, direct_expenses: "הוצאות ישירות" };
  const { cards, companies } = listing;
  return (
    <div className="flex flex-col gap-4">
      <Callout tone="info">
        {t.note}{" "}
        <Link to={`/tracks/${wrapperId}`} className="text-link hover:underline">
          {t.toTracks}
        </Link>
      </Callout>
      {cards.length === 0 ? (
        <Callout tone="caution">{c.providers.allMissing}</Callout>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl lg:text-2xl font-semibold">{t.label}</h2>
          {companies > 0 && (
            <p className="text-sm text-muted-foreground">
              {t.covered.before}
              {cards.length === 1 ? t.covered.one : (<><bdi dir="ltr" className="tabular-nums">{cards.length}</bdi>{t.covered.many}</>)}
              {t.covered.mid}
              <bdi dir="ltr" className="tabular-nums">{companies}</bdi>
              {t.covered.after}{" "}
              <Link to={`/tracks/${wrapperId}`} className="text-link hover:underline">
                {t.toTracks}
              </Link>
            </p>
          )}
          <ul className="grid gap-3 md:grid-cols-2">
            {cards.map((card) => {
              const href = companyHref(card);
              return (
                <Card as="li" pad="tight" key={card.provider} className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-semibold">
                    {href ? (
                      <Link to={href} className="text-link hover:underline">
                        {card.providerName}
                      </Link>
                    ) : (
                      card.providerName
                    )}
                  </h3>
                  {card.lines.map((l) => (
                    <div key={l.id} className="flex flex-col gap-0.5">
                      {!l.line.includes(baseWord[l.base] ?? l.base) && !/\d/.test(l.line) && (
                        <p className="text-sm text-muted-foreground">
                          <bdi>{l.line}</bdi>
                        </p>
                      )}
                      <p className="flex items-baseline gap-2">
                        <span className="text-sm text-muted-foreground">{baseWord[l.base] ?? l.base}</span>
                        <span className="text-xl font-semibold">
                          <Num value={l.rate} />
                        </span>
                      </p>
                    </div>
                  ))}
                  <TariffLine tariff={card.tariff} />
                </Card>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

export function TariffLine({ tariff, noPublished = true }: { tariff: RowTariff; noPublished?: boolean }) {
  const t = c.providers;
  return (
    <p className="text-sm flex flex-col gap-0.5">
      <span>
        {tariff.published ? (
          <>
            <NumAfter lead={t.tariffLine.before} value={tariff.published} />
            <NumAfter lead={t.tariffLine.mid} value={tariff.snapshot} />
          </>
        ) : (
          <>
            <span className="text-caution-foreground">{noPublished ? c.noPublishedDate : ""}</span>
            {" · "}
            <NumAfter lead={t.tariffLine.collected} value={tariff.snapshot} />
          </>
        )}{" "}
        <a href={tariff.href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-9 align-middle">
          {t.tariffLink} <span className="text-xs text-muted-foreground">({t.formats[tariff.format]})</span>
          <IconExternal size={14} />
        </a>
      </span>
      {tariff.stale && (
        <span className="text-caution-foreground flex items-start gap-1.5">
          <IconClock size={14} className="text-caution mt-1 shrink-0" />
          <span>
            <LeadTail lead={c.staleTariff.before}>
              <bdi dir="ltr">{fmt.date(tariff.snapshot.value as string)}</bdi>
            </LeadTail>
            {c.staleTariff.after}
          </span>
        </span>
      )}
    </p>
  );
}
