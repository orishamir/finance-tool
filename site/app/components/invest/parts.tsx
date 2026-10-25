// Shared pieces of the index page: the label chip and its sheet, the "what do the labels mean" list, and the sentence for a
// cell the engine could not price.
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import type { RuleRecord } from "@finance-tool/schema";
import { invest as c, r4workbench } from "../../copy";
import { allLabels, type Label } from "../../lib/labels";
import type { Reason } from "../../lib/invest";
import { reasonSentence } from "../workbench/providers/row";
import { RuleRef } from "../provenance";
import { Sheet } from "../Sheet";
import { Disclosure, cx } from "../ui";
import { LabelIcon } from "./icons";

// ---------------------------------------------------------------- labels

const OpenCtx = createContext<(l: Label, el: HTMLElement) => void>(() => {});

/** One sheet for the whole page: a tap on any label opens it with that label's meaning and rules. */
export function LabelSheetHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<{ label: Label; anchor: HTMLElement } | null>(null);
  const id = useId();
  return (
    <OpenCtx.Provider value={(label, anchor) => setOpen({ label, anchor })}>
      {children}
      <Sheet open={open !== null} onClose={() => setOpen(null)} anchor={open?.anchor ?? null} pc="popover" height={70} labelledBy={id}>
        {open && (
          <div className="flex flex-col gap-3">
            <h2 id={id} className="text-lg font-semibold flex items-center gap-2">
              <LabelIcon name={open.label.icon} size={18} />
              {open.label.text}
            </h2>
            <p className="max-w-measure">{open.label.explain}</p>
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
              {c.labelsSheet.rules}:
              {open.label.rules.map((r) => (
                <RuleRef key={r} id={r} />
              ))}
            </p>
          </div>
        )}
      </Sheet>
    </OpenCtx.Provider>
  );
}

const toneClass: Record<Label["tone"], string> = {
  neutral: "bg-muted text-foreground",
  caution: "bg-caution-subtle text-caution-foreground",
  open: "bg-blocked-subtle text-blocked-foreground",
};

/** A label: an icon and two or three words; colour never alone (the open tone also carries the lock icon). */
export function LabelChip({ label }: { label: Label }) {
  const open = useContext(OpenCtx);
  return (
    <button type="button" onClick={(e) => open(label, e.currentTarget)} className={cx("inline-flex items-center gap-1 text-xs font-medium rounded-sm px-1.5 py-0.5 min-h-6 hover:brightness-110", toneClass[label.tone])} data-label={label.id}>
      <LabelIcon name={label.icon} />
      {label.text}
    </button>
  );
}

export function LabelRow({ labels, className }: { labels: Label[]; className?: string }) {
  if (labels.length === 0) return null;
  return (
    <span className={cx("flex flex-wrap gap-1.5", className)}>
      {labels.map((l) => (
        <LabelChip key={l.id} label={l} />
      ))}
    </span>
  );
}

/** "מה אומרות התוויות?": every label of the page, by family. */
export function LabelsLegend() {
  const by = new Map<string, Label[]>();
  for (const l of allLabels()) by.set(l.family, [...(by.get(l.family) ?? []), l]);
  return (
    <Disclosure label={c.funds.whatLabels}>
      <dl className="flex flex-col gap-4 pt-2">
        {[...by.entries()].map(([family, list]) => (
          <div key={family} className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium">{(c.labelFamilies as Record<string, string>)[family]}</dt>
            {list.map((l) => (
              <dd key={l.id} className="flex flex-col gap-1">
                <LabelChip label={l} />
                <span className="text-sm text-muted-foreground max-w-measure">{l.explain}</span>
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </Disclosure>
  );
}

// ---------------------------------------------------------------- reasons

/** The sentence for a price the engine or the site could not give. */
export function reasonText(r: Reason, cls: string): string {
  switch (r.code) {
    case "fund-type":
      return c.reasons.fundType;
    case "need-yield":
      return c.reasons.needYield;
    case "need-rate":
      return c.reasons.needRate(r.currency);
    case "no-fund-rate":
      return c.reasons.noBroker;
    default:
      return reasonSentence(r, cls, r4workbench.providers.behaviour.channelOptions.direct);
  }
}
