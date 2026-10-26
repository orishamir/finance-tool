// The line under a card that names the instrument its run stands for, with its fee and the provider whose tariff is used
// (2026-10-24, scenario audits): "לפי {fund or track} בדמי ניהול {fee} ותעריפון {provider}", a "להחליף" control that opens an
// inline field for the fee level the person enters (D4: it replaces the instrument's fee in the ranking), and, for a deposit,
// the own rate. Entered values are blue (D7). Mounted by rows.tsx in place of its `RepresentativeLine`.
// 2026-10-24 (sc-broker): for the brokerage wrapper "להחליף" also offers the providers the providers page ranks; the person's
// choice replaces the representative's tariff in the run, is marked "בחרתם" beside the line and has its own reset.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ownTermsCopy } from "../../copy";
import { feeFor, feeTargetOf, workbenchHref, type ProviderOutcome, type ProviderOutcomes, type RunGoal, type WrapperEntry } from "../../lib/compare";
import type { SiteValue } from "../../lib/value";
import { Tpl } from "../exposure-mode/tpl";
import { Num } from "../provenance";
import { Button, cx, PercentField, Sentence, Tag } from "../kit";
import { IndexCard, type IndexCardProps } from "./index-card";

const t = ownTermsCopy.line;
const tp = ownTermsCopy.provider;

export interface RepresentativeProps {
  w: WrapperEntry;
  g: Pick<RunGoal, "ownFees" | "ownRates" | "ownProviders">;
  today: string;
  /** Sets the entered fee (% a year) or clears it. */
  onFee?: (wrapperId: string, pct: number | undefined) => void;
  /** Sets the entered deposit rate (% a year) or clears it. */
  onRate?: (wrapperId: string, pct: number | undefined) => void;
  /** Sets the provider whose tariff the run uses (a provider id of `w.providers`) or clears it. */
  onProvider?: (wrapperId: string, id: string | undefined) => void;
  /** The wrapper run once per provider, best first (computed when the picker is open); empty when the run cannot be made yet. */
  outcomes?: () => ProviderOutcomes;
  /** One provider's figure as a value object, so it shows its provenance. */
  figureOf?: (o: ProviderOutcome) => SiteValue;
  /** The securities account over the indices (2026-10-25, D27): the card names no index by itself, so the representative fund's name is not shown while this is set. */
  index?: IndexCardProps;
}

export function Representative({ w, g, today, onFee, onRate, onProvider, outcomes, figureOf, index }: RepresentativeProps) {
  const [open, setOpen] = useState(false);
  const r = w.representative;
  const target = feeTargetOf(w);
  const isDeposit = w.id === "bank-deposit" && w.cashRate !== undefined;
  const ownFee = g.ownFees?.[w.id];
  const ownRate = g.ownRates?.[w.id];
  const ownProvider = g.ownProviders?.[w.id];
  const chosen = ownProvider !== undefined && r?.chosen === true;
  const canPick = !!w.providers && !!onProvider && Object.keys(w.providers).length > 1;
  const canEnter = (target !== null && !!onFee) || (isDeposit && !!onRate) || canPick;
  if (!r && !canEnter) return null;
  const fee = target ? feeFor(w, g, today) : undefined;
  const href = workbenchHref(w.id);
  const entered = ownFee !== undefined || ownRate !== undefined || chosen;
  const showFields = open || entered;
  return (
    <div className="flex flex-col gap-1.5" data-representative>
      {index && <IndexCard {...index} />}
      <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        {r && !index && (
          <span>
            <Tpl t={t.named} vars={{ name: <bdi>{r.name}</bdi> }} />
            {fee && <Tpl t={t.fee} vars={{ fee: <Num value={fee} size="cell" /> }} />}
            {r.provider && <Tpl t={r.pickedBy === "site" ? t.tariffCheapest : t.tariff} vars={{ provider: <bdi>{r.provider}</bdi> }} />}
            {t.end}
          </span>
        )}
        {chosen && (
          <>
            <Tag tone="entered">{tp.chosen}</Tag>
            <Button variant="quiet" className="text-sm min-h-9" onClick={() => onProvider?.(w.id, undefined)}>
              {tp.reset}
            </Button>
          </>
        )}
        {canEnter && !showFields && (
          <Button variant="quiet" className="-ms-2 text-sm min-h-9" onClick={() => setOpen(true)}>
            {t.change}
          </Button>
        )}
        {href && (
          <Link to={href} className="text-link hover:underline min-h-9 inline-flex items-center">
            {t.workbench}
          </Link>
        )}
      </p>
      {showFields && (
        <div className={cx("flex flex-col gap-2", canPick ? "max-w-md" : "max-w-xs")}>
          {target && onFee && (
            <>
              <PercentField label={t.feeLabel} value={ownFee ?? null} isEntered={ownFee !== undefined} range={{ min: 0, max: 50 }} onCommit={(n) => onFee(w.id, n)} onReset={() => onFee(w.id, undefined)} optional />
              {r?.classMinFee && (
                <Sentence size="xs" tone="muted">
                  <Tpl t={t.classMin} vars={{ fee: <Num value={r.classMinFee} size="cell" /> }} />
                </Sentence>
              )}
            </>
          )}
          {canPick && <ProviderPicker w={w} chosen={chosen} outcomes={outcomes} figureOf={figureOf} onPick={(id) => onProvider?.(w.id, id)} />}
          {isDeposit && onRate && (
            <PercentField label={t.rateLabel} value={ownRate ?? null} isEntered={ownRate !== undefined} range={{ min: 0, max: 50 }} onCommit={(n) => onRate(w.id, n)} onReset={() => onRate(w.id, undefined)} optional />
          )}
          <Button
            variant="quiet"
            className="self-start -ms-2 text-sm min-h-9"
            onClick={() => {
              if (ownFee !== undefined) onFee?.(w.id, undefined);
              if (ownRate !== undefined) onRate?.(w.id, undefined);
              if (chosen) onProvider?.(w.id, undefined);
              setOpen(false);
            }}
          >
            {ownRate !== undefined && ownFee === undefined ? t.rateReset : ownFee === undefined && chosen ? tp.reset : t.reset}
          </Button>
        </div>
      )}
    </div>
  );
}

/** The providers the brokerage option can run on, with what each leaves at the end when the run can be made; the one in use is marked. */
function ProviderPicker({ w, chosen, outcomes, figureOf, onPick }: { w: WrapperEntry; chosen: boolean; outcomes: (() => ProviderOutcomes) | undefined; figureOf: ((o: ProviderOutcome) => SiteValue) | undefined; onPick: (id: string) => void }) {
  const { site, rows } = useMemo(() => {
    const ran = outcomes?.() ?? { site: null, providers: [] };
    const named = ran.providers.length > 0 ? ran.providers : Object.entries(w.providers ?? {}).map(([id, p]) => ({ id, name: p.name, channel: p.channel })).sort((a, b) => a.name.localeCompare(b.name, "he"));
    return { site: ran.site, rows: named as (Pick<ProviderOutcome, "id" | "name" | "channel"> & Partial<ProviderOutcome>)[] };
  }, [w, outcomes]);
  const mine = chosen ? w.representative?.providerId : undefined;
  const label = (x: Pick<ProviderOutcome, "name" | "channel">) => (
    <span className="flex-1 basis-full sm:basis-0 min-w-0 text-sm">
      <bdi>{x.name}</bdi>
      {tp.channel[x.channel] && <span className="text-xs text-muted-foreground"> · {tp.channel[x.channel]}</span>}
    </span>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">{tp.heading}</p>
      <p className="text-xs text-muted-foreground">{tp.hint}</p>
      <ul className="flex flex-col divide-y divide-border border border-border rounded-md" data-provider-list>
        {site && (
          <li data-provider-site className="px-3 py-1 min-h-target flex items-center gap-x-3 gap-y-0.5 flex-wrap bg-accent">
            {label(site)}
            {figureOf && <Num value={figureOf(site)} size="cell" />}
            <span className="text-xs text-muted-foreground min-w-14 text-center">{tp.siteChoice}</span>
          </li>
        )}
        {rows.map((x) => (
          <li key={x.id} data-provider={x.id} data-chosen={x.id === mine ? "" : undefined} data-site={x.current ? "" : undefined} className={cx("px-3 py-1 flex items-center gap-x-3 gap-y-0.5 flex-wrap", (x.id === mine || x.current) && "bg-accent")}>
            {label(x)}
            {x.real !== undefined && figureOf && <Num value={figureOf(x as ProviderOutcome)} size="cell" />}
            {x.id === mine ? (
              <span className="text-xs text-muted-foreground min-w-14 text-center">{tp.chosen}</span>
            ) : x.current ? (
              <span className="text-xs text-muted-foreground min-w-14 text-center">{tp.siteChoice}</span>
            ) : (
              <Button variant="quiet" className="text-sm min-h-target min-w-14" onClick={() => onPick(x.id)}>
                {tp.pick}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
