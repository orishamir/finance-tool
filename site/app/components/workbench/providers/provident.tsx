// A provident wrapper's provider tab (flows 15.5, design-spec 17 edge cases): a sourced listing of managers' list fees
// from the snapshots, not ranked, with the line that the ranking for these wrappers is by track. One card per company;
// its name links to the company page by the regulator's company id.
import { Link } from "react-router";
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import { companyHref, type Listing, type RowTariff } from "../../../lib/providers";
import { IconClock, IconExternal } from "../../icons";
import { Num, NumAfter } from "../../provenance";
import { Callout, Card, TariffDate, When } from "../../kit";

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
                  {card.lines.map((l) => {
                    // D56, D83: an offer is not a price; the row shows what the binding documents allow, the offer as a note under it
                    const binding = l.offer && l.revertsTo ? l.revertsTo : null;
                    return (
                      <div key={l.id} className="flex flex-col gap-0.5">
                        {!l.line.includes(baseWord[l.base] ?? l.base) && !/\d/.test(l.line) && (
                          <p className="text-sm text-muted-foreground">
                            <bdi>{l.line}</bdi>
                          </p>
                        )}
                        <p className="flex items-baseline gap-2">
                          <span className="text-sm text-muted-foreground">{baseWord[l.base] ?? l.base}</span>
                          <span className="text-xl font-semibold">
                            {binding ? (
                              <>
                                {t.upTo} <Num value={binding} />
                              </>
                            ) : (
                              <Num value={l.rate} />
                            )}
                          </span>
                        </p>
                        {binding && (
                          <p className="text-sm text-muted-foreground">
                            <Num value={l.rate} /> {t.offerRate}
                          </p>
                        )}
                        {l.revertsTo && !l.offer && (
                          <p className="text-sm text-muted-foreground">
                            {t.discount.row} <Num value={l.revertsTo} />
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {/* what a discount is, how long it lasts and when it ends earlier, said once a card (A-19, PF-13, PF-14) */}
                  {card.discount && (
                    <p className="text-sm text-muted-foreground">
                      {card.discount.own ? t.discountNote.own.before : t.discountNote.before}{" "}
                      <Num value={card.discount.period} display={card.discount.own ? fmt.months(Number(card.discount.period.value)) : fmt.years(Number(card.discount.period.value))} /> {t.discountNote.after}
                    </p>
                  )}
                  {/* the offer's condition, quoted once a card however many rows it covers (Hebrew editor, 2026-11-07) */}
                  {[...new Set(card.lines.map((l) => l.offer).filter((o): o is string => !!o))].map((o) => (
                    <p key={o} className="text-sm text-muted-foreground">
                      {t.offer.before}<bdi>{o}</bdi>{t.offer.after}
                    </p>
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

export function TariffLine({ tariff }: { tariff: RowTariff }) {
  const t = c.providers;
  return (
    <p className="text-sm flex flex-col gap-0.5">
      <span>
        <TariffDate dated={tariff.dated} checked={false} date={(lead) => <NumAfter lead={lead} value={tariff.published!} />} />
        <NumAfter lead={t.tariffLine.mid} value={tariff.snapshot} />{" "}
        <a href={tariff.href} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-target align-middle">
          {t.tariffLink} <span className="text-xs text-muted-foreground">({t.formats[tariff.format]})</span>
          <IconExternal size={14} />
        </a>
      </span>
      {tariff.stale && (
        <span className="text-caution-foreground flex items-start gap-1.5">
          <IconClock size={14} className="text-caution mt-1 shrink-0" />
          <span>
            <When iso={tariff.snapshot.value as string} lead={c.staleTariff.before} />
            {c.staleTariff.after}
          </span>
        </span>
      )}
    </p>
  );
}
