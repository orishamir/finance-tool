// (ב) The broker × option grid: rows are brokers sorted by their cheapest cell, columns are the options. A cell is the
// broker's cost over the horizon in today's shekels, "לא זמין" (a sourced fact), "אין שורה בתעריפון", or the reason the engine
// could not price it; the cheapest cell of each column is marked, the person's broker is highlighted.
import { useState } from "react";
import { invest as c } from "../../copy";
import type { BrokerCell, InvestView, OptionId } from "../../lib/invest";
import { brokerLabels } from "../../lib/labels";
import { IconExternal, IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, cx, Tag } from "../kit";
import { LabelRow, reasonText } from "./parts";
import { ProviderLink } from "./sections";

const TOP = 6;
const OPTION_CLS: Record<OptionId, string> = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "etf_units", abroad: "foreign_securities" };

export function BrokerGrid({ view }: { view: InvestView }) {
  const [all, setAll] = useState(false);
  const options = view.options.filter((o) => o.exists && !o.notRunnable);
  const cellOf = (o: (typeof options)[number], id: string): BrokerCell | undefined => o.cells.find((x) => x.providerId === id);
  const cheapest = (o: (typeof options)[number]) => o.bestCell?.providerId ?? null;
  const rank = (id: string) => {
    const costs = options.flatMap((o) => {
      const cell = cellOf(o, id);
      return cell?.kind === "cost" ? [cell.costN!] : [];
    });
    return costs.length ? Math.min(...costs) : Infinity;
  };
  const rows = [...view.providers].sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name, "he"));
  // the person's broker is always shown, even outside the top rows
  const shown = all ? rows : rows.filter((p, i) => i < TOP || p.id === view.yourBroker);
  const hidden = rows.length - shown.length;
  const hasIbkr = view.providers.some((p) => p.id === "interactive-brokers");
  return (
    <section className="flex flex-col gap-3" aria-labelledby="invest-grid">
      <h2 id="invest-grid" className="text-lg font-semibold">
        {c.grid.heading}
      </h2>
      <p className="text-sm text-muted-foreground max-w-measure">{c.grid.sub}</p>
      <div className="overflow-x-auto -mx-gutter px-gutter">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-sm" aria-label={c.grid.tableLabel}>
          <thead>
            <tr>
              <th scope="col" className="text-start font-medium py-2 pe-3 sticky start-0 bg-background z-10">
                {c.grid.broker}
              </th>
              {options.map((o) => (
                <th key={o.id} scope="col" className="text-start font-medium py-2 px-2 align-bottom">
                  {c.options.titles[o.id]}
                  {o.open && <IconLock size={14} className="inline ms-1 text-blocked-foreground" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const yours = p.id === view.yourBroker;
              return (
                <tr key={p.id} className={cx(yours && "bg-entered-subtle")}>
                  <th scope="row" className={cx("text-start font-normal py-2.5 pe-3 border-t border-border sticky start-0 z-10", yours ? "bg-entered-subtle" : "bg-background")}>
                    <span className="flex flex-col gap-1">
                      <ProviderLink p={p} className="font-medium" />
                      <span className="flex flex-wrap gap-1">
                        {yours && <Tag tone="entered">{c.grid.yours}</Tag>}
                        {p.foreign && <LabelRow labels={brokerLabels(p, false)} />}
                      </span>
                    </span>
                  </th>
                  {options.map((o) => (
                    <td key={o.id} className="py-2.5 px-2 border-t border-border align-top">
                      <Cell cell={cellOf(o, p.id)} best={cheapest(o) === p.id} cls={OPTION_CLS[o.id]} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(hidden > 0 || all) && rows.length > TOP && (
        <Button variant="secondary" className="self-start" onClick={() => setAll((v) => !v)}>
          {all ? c.grid.less : c.grid.more(hidden)}
        </Button>
      )}
      {hasIbkr && <p className="text-xs text-muted-foreground max-w-measure">{c.grid.fixedOnly}</p>}
    </section>
  );
}

function Cell({ cell, best, cls }: { cell: BrokerCell | undefined; best: boolean; cls: string }) {
  if (!cell) return <span className="text-muted-foreground">{c.grid.none}</span>;
  if (cell.kind === "cost" && cell.cost)
    return (
      <span className="flex flex-col gap-0.5">
        <span className={cx("inline-flex items-center gap-1 w-fit rounded-sm px-1", best && "bg-positive-subtle text-positive-foreground font-medium")}>
          <Num value={cell.cost} />
          {best && <span className="text-xs">{c.grid.cheapest}</span>}
        </span>
        {cell.venue && <span className="text-xs text-muted-foreground">{c.grid.viaExchange(c.options.exchange[cell.venue]!)}</span>}
      </span>
    );
  if (cell.kind === "unavailable")
    return (
      <span className="flex flex-col gap-0.5">
        <Tag tone="caution">{c.grid.unavailable}</Tag>
        {cell.availability && (
          <a href={cell.availability.source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-link hover:underline inline-flex items-center gap-1" title={cell.availability.note ?? cell.availability.source.title}>
            {c.grid.sourceOf} <IconExternal size={14} />
          </a>
        )}
      </span>
    );
  if (cell.kind === "no-line") return <span className="text-muted-foreground">{c.grid.noLine}</span>;
  return <span className="text-xs text-muted-foreground max-w-56 block">{cell.reason ? reasonText(cell.reason, cls) : c.grid.none}</span>;
}
