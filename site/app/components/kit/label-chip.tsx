// A fund's labels (design-system 2.8; in the kit since 2026-10-27, when the company page's fund table became their second page):
// a chip of an icon and two or three words, a row of them, and the one sheet per page that a tap opens with the label's meaning
// and its rules. The words and the rules come from lib/labels.ts.
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { Ban, Clock, Coins, FileText, Globe, HandCoins, House, Layers, Lock, Percent, PiggyBank, Repeat, ShieldCheck, Sun, TriangleAlert, type LucideProps } from "lucide-react";
import { invest as c } from "../../copy";
import type { Label, LabelIconKey } from "../../lib/labels";
import { RuleRef } from "../provenance";
import { Sheet } from "../Sheet";
import { cx } from "./cx";

// Lucide, 1.75px stroke, none mirrors
const icons: Record<LabelIconKey, React.ComponentType<LucideProps>> = {
  home: House,
  globe: Globe,
  clock: Clock,
  layers: Layers,
  coins: Coins,
  shield: ShieldCheck,
  file: FileText,
  lock: Lock,
  alert: TriangleAlert,
  ban: Ban,
  percent: Percent,
  repeat: Repeat,
  sun: Sun,
  piggy: PiggyBank,
  handCoins: HandCoins,
};

export function LabelIcon({ name, size = 14 }: { name: LabelIconKey; size?: number }) {
  const Icon = icons[name];
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />;
}

const OpenCtx = createContext<(l: Label, el: HTMLElement) => void>(() => {});

/** One sheet for the whole page: a tap on any label opens it with that label's meaning and rules. The page loads those rules. */
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

const toneClass: Record<Exclude<Label["tone"], "neutral">, string> = {
  caution: "bg-caution-subtle text-caution-foreground border-caution/40",
  open: "bg-blocked-subtle text-blocked-foreground border-blocked/40",
};

/** A neutral label takes its family's colour (founder, 2026-10-27): the icon and words in it, a faint fill and edge of it. */
const familyClass: Partial<Record<Label["family"], string>> = {
  held: "text-label-held bg-label-held/10 border-label-held/35",
  trade: "text-label-trade bg-label-trade/12 border-label-trade/40",
  follow: "text-label-follow bg-label-follow/14 border-label-follow/45",
  currency: "text-label-currency bg-label-currency/12 border-label-currency/40",
  tax: "text-label-tax bg-label-tax/12 border-label-tax/40",
  payout: "text-label-payout bg-label-payout/12 border-label-payout/40",
};

const chipClass = (label: Label) => (label.tone === "neutral" ? (familyClass[label.family] ?? "bg-muted text-foreground border-border") : toneClass[label.tone]);
const chipShape = "inline-flex items-center gap-1 text-xs font-medium rounded-full border px-2 py-0.5 min-h-6 whitespace-nowrap";

/** A label: an icon and two or three words; colour never alone (the icon and the words carry it; the open tone also has the lock). */
export function LabelChip({ label }: { label: Label }) {
  const open = useContext(OpenCtx);
  return (
    <button type="button" onClick={(e) => open(label, e.currentTarget)} className={cx(chipShape, "hover:brightness-110", chipClass(label))} data-label={label.id}>
      <LabelIcon name={label.icon} />
      {label.text}
    </button>
  );
}

/**
 * Filter a list by one label (founder, 2026-10-27): each label that splits the list, with how many rows carry it; a tap keeps only
 * those rows, a second tap or "all" shows every row again. Only offer labels that some rows have and some do not.
 */
export function LabelFilter({ options, value, onChange, lead, allLabel }: { options: { label: Label; count: number }[]; value: string | null; onChange: (id: string | null) => void; lead: ReactNode; allLabel: string }) {
  if (options.length === 0) return null;
  return (
    <div className="flex md:flex-wrap items-center gap-1.5 max-md:overflow-x-auto max-md:pb-1" role="group" aria-label={typeof lead === "string" ? lead : undefined}>
      <span className="text-sm text-muted-foreground me-1 shrink-0">{lead}</span>
      {options.map(({ label, count }) => {
        const on = value === label.id;
        return (
          <button key={label.id} type="button" aria-pressed={on} onClick={() => onChange(on ? null : label.id)} className={cx(chipShape, "shrink-0 min-h-8 hover:brightness-110", chipClass(label), on && "ring-2 ring-current ring-offset-1 ring-offset-card")}>
            <LabelIcon name={label.icon} />
            {label.text}
            <span className="tabular-nums opacity-75">{count}</span>
          </button>
        );
      })}
      {value !== null && (
        <button type="button" onClick={() => onChange(null)} className="shrink-0 text-sm text-link hover:underline min-h-8 px-1">
          {allLabel}
        </button>
      )}
    </div>
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
