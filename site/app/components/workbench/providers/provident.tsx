// A provident wrapper's provider tab (flows 15.5, design-spec 17 edge cases): a sourced listing of managers' list fees
// from the snapshots, not ranked, with the line that the ranking for these wrappers is by track.
import { Link } from "react-router";
import { r4workbench as c } from "../../../copy";
import type { ListingRow } from "../../../lib/providers";
import { Num } from "../../provenance";
import { Callout } from "../../ui";
import { TariffLine } from "./parts";

export function ProvidentListing({ rows, wrapperId }: { rows: ListingRow[]; wrapperId: string }) {
  const t = c.providers.provident;
  const baseWord: Record<string, string> = { balance: t.balance, deposit: t.deposit, direct_expenses: "הוצאות ישירות" };
  return (
    <div className="flex flex-col gap-4">
      <Callout tone="info">
        {t.note}{" "}
        <Link to={`/workbench/tracks/${wrapperId}`} className="text-link hover:underline">
          {t.toTracks}
        </Link>
      </Callout>
      {rows.length === 0 ? (
        <Callout tone="caution">{c.providers.allMissing}</Callout>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl lg:text-2xl font-semibold">{t.label}</h2>
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li key={r.id} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1.5">
                <h3 className="text-lg font-semibold">
                  <Link to={`/companies/${r.provider}`} className="text-link hover:underline">
                    {r.providerName}
                  </Link>
                </h3>
                {r.line !== (baseWord[r.base] ?? r.base) && (
                  <p className="text-sm text-muted-foreground">
                    <bdi>{r.line}</bdi>
                  </p>
                )}
                <p className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">{baseWord[r.base] ?? r.base}</span>
                  <span className="text-xl font-semibold">
                    <Num value={r.rate} />
                  </span>
                </p>
                <TariffLine tariff={r.tariff} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
