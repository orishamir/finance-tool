// The securities account's line over the indices (2026-10-25, D27 and D28). The site names no index until the person chooses one:
// before a choice the card shows the range the plan leaves over the known indices and says the ranking uses the lowest of them; after a
// choice it shows the cheapest way for that index and links to every way on the index page. Mounted by `Representative` for the brokerage account.
import { Link } from "react-router";
import { ownTermsCopy } from "../../copy";
import type { IndexReading } from "../../lib/compare-index";
import { Tpl } from "../exposure-mode/tpl";
import { Num } from "../provenance";
import { Button, cx } from "../ui";

const t = ownTermsCopy.index;

export interface IndexCardProps {
  reading: IndexReading | null;
  /** The way the ranking uses; null when the comparison could not run any (the account then ranks on the site's example fund). */
  ranked: { indexId: string } | null;
  /** The known indices, by id and Hebrew name. */
  known: { id: string; name: string }[];
  /** The chosen index id, as stored. */
  chosenId: string | undefined;
  onChoose: (id: string | undefined) => void;
}

export function IndexCard({ reading, ranked, known, chosenId, onChoose }: IndexCardProps) {
  if (!reading) return null;
  const chosen = reading.kind === "chosen" ? reading.index : null;
  return (
    <div className="flex flex-col gap-1.5 text-sm" data-index-card>
      {reading.kind === "range" ? (
        <>
          <p className="font-medium">
            <Tpl t={t.range} vars={{ low: <Num value={reading.low.value} />, high: <Num value={reading.high.value} /> }} />
          </p>
          <p className="text-xs text-muted-foreground">{ranked ? t.rangeNote : t.notRun}</p>
        </>
      ) : reading.way ? (
        <>
          <p className="text-xs text-muted-foreground">
            {t.chosen}: <bdi>{chosen!.name}</bdi>
          </p>
          <p className="font-medium">
            <Tpl t={t.cheapest} vars={{ broker: <bdi>{reading.way.providerName}</bdi>, fund: <bdi>{reading.way.fundName}</bdi> }} />
          </p>
          {!ranked && <p className="text-xs text-muted-foreground">{t.notRun}</p>}
          <Link to={`/invest/${chosen!.id}`} className="text-link hover:underline min-h-9 inline-flex items-center self-start">
            {t.all}
          </Link>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">{t.noWay}</p>
      )}
      <div role="group" aria-label={t.groupLabel} className="flex flex-wrap items-center gap-2" data-index-chips>
        {reading.kind === "range" && <span className="text-xs text-muted-foreground">{t.pickLabel}</span>}
        {known.map((i) => {
          const on = i.id === chosenId;
          return (
            <button
              key={i.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChoose(i.id)}
              className={cx("min-h-target px-3 rounded-md border text-sm", on ? "border-entered bg-entered-subtle text-entered" : "border-border bg-card text-foreground hover:bg-accent")}
            >
              <bdi>{i.name}</bdi>
            </button>
          );
        })}
        {chosenId && (
          <Button variant="quiet" className="text-sm min-h-9" onClick={() => onChoose(undefined)}>
            {t.clear}
          </Button>
        )}
      </div>
    </div>
  );
}
