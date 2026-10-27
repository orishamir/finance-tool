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
