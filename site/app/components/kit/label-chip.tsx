// A fund's labels (design-system 2.8; in the kit because the company page's fund table is their second page):
// a chip of an icon and two or three words, a row of them, and the one sheet per page that a tap opens with the label's meaning
// and its rules. The words and the rules come from lib/labels.ts.
import { createContext, useContext, useId, useState, type ReactNode } from "react";
import { Activity, ArrowRightLeft, Ban, BadgePercent, Blend, Building2, CalendarClock, Coins, Currency, DollarSign, Euro, EyeOff, FileClock, FilePen, FileSignature, Gavel, Globe, HandCoins, House, JapaneseYen, Landmark, Lock, Megaphone, Percent, Package, PiggyBank, PoundSterling, ReceiptText, Scale, ScrollText, ShieldCheck, SwissFranc, TrendingUpDown, UserPlus, type LucideProps } from "lucide-react";
import { invest as c } from "../../copy";
import type { Label, LabelIconKey } from "../../lib/labels";
import { RuleRef } from "../provenance";
import { Sheet } from "../Sheet";
import { cx } from "./cx";
import { DocLink } from "./doc-link";

// Lucide, 1.75px stroke, none mirrors
const icons: Record<LabelIconKey, React.ComponentType<LucideProps>> = {
  home: House,
  landmark: Landmark,
  globe: Globe,
  pulse: Activity,
  calendarClock: CalendarClock,
  box: Package,
  swap: ArrowRightLeft,
  fileClock: FileClock,
  blend: Blend,
  dollar: DollarSign,
  euro: Euro,
  pound: PoundSterling,
  yen: JapaneseYen,
  franc: SwissFranc,
  currency: Currency,
  shield: ShieldCheck,
  trendUpDown: TrendingUpDown,
  badgePercent: BadgePercent,
  percent: Percent,
  lock: Lock,
  gavel: Gavel,
  piggy: PiggyBank,
  handCoins: HandCoins,
  filePen: FilePen,
  receipt: ReceiptText,
  scroll: ScrollText,
  eyeOff: EyeOff,
  fileSignature: FileSignature,
  ban: Ban,
  megaphone: Megaphone,
  userPlus: UserPlus,
  building: Building2,
  coins: Coins,
  scale: Scale,
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
            {open.label.rules.length > 0 && (
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                {c.labelsSheet.rules}:
                {open.label.rules.map((r) => (
                  <RuleRef key={r} id={r} titled />
                ))}
              </p>
            )}
            {open.label.doc && (
              <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2">
                {open.label.docLead ?? c.labelsSheet.doc}:
                <DocLink href={open.label.doc.href}>{open.label.doc.title}</DocLink>
              </p>
            )}
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

/** A neutral label takes its family's colour: the icon and words in it, a faint fill and edge of it. */
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

/** A label: an icon and two or three words; colour never alone (the icon and the words carry it; the open tone also has the lock). Its tap area
 *  reaches 44 px high, beyond the drawn chip, so a row of chips keeps its height. */
export function LabelChip({ label, still = false, words = false }: { label: Label; /** Drawn only, not a button: inside a control of its own (a tile of TileChoice), where a tap is the control's. */ still?: boolean; /** Words only, in the line's own colour, no chip: a kind that follows a product's name ("קבועה לשנה, מבצע"); a tap still opens its meaning. */ words?: boolean }) {
  const open = useContext(OpenCtx);
  if (words)
    return (
      <button type="button" onClick={(e) => open(label, e.currentTarget)} className="term" data-label={label.id}>
        {label.text}
      </button>
    );
  if (still)
    return (
      <span className={cx(chipShape, chipClass(label))} data-label={label.id}>
        <LabelIcon name={label.icon} />
        {label.text}
      </span>
    );
  return (
    <button type="button" onClick={(e) => open(label, e.currentTarget)} className={cx(chipShape, "relative before:absolute before:inset-x-0 before:-inset-y-[11px] hover:brightness-110", chipClass(label))} data-label={label.id}>
      <LabelIcon name={label.icon} />
      {label.text}
    </button>
  );
}

/**
 * Filter a list by one label: each label that splits the list, with how many rows carry it; a tap keeps only
 * those rows, a second tap or "all" shows every row again. Only offer labels that some rows have and some do not.
 */
export function LabelFilter({ options, value, onChange, lead, allLabel }: { options: { label: Label; count: number }[]; value: string | null; onChange: (id: string | null) => void; lead: ReactNode; allLabel: string }) {
  if (options.length === 0) return null;
  return (
    <div className="label-strip flex md:flex-wrap items-center gap-1.5 max-md:pb-1" role="group" aria-label={typeof lead === "string" ? lead : undefined}>
      <span className="text-sm text-muted-foreground me-1 shrink-0">{lead}</span>
      {options.map(({ label, count }) => {
        const on = value === label.id;
        return (
          <button key={label.id} type="button" aria-pressed={on} onClick={() => onChange(on ? null : label.id)} className={cx(chipShape, "shrink-0 min-h-8 tap-area hover:brightness-110", chipClass(label), on && "ring-2 ring-current ring-offset-1 ring-offset-card")}>
            <LabelIcon name={label.icon} />
            {label.text}
            <span className="tabular-nums opacity-75">{count}</span>
          </button>
        );
      })}
      {value !== null && (
        <button type="button" onClick={() => onChange(null)} className="shrink-0 text-sm text-link hover:underline min-h-8 tap-area px-1">
          {allLabel}
        </button>
      )}
    </div>
  );
}

export function LabelRow({ labels, className, still }: { labels: Label[]; className?: string; /** See LabelChip. */ still?: boolean }) {
  if (labels.length === 0) return null;
  return (
    <span className={cx("flex flex-wrap gap-1.5", className)}>
      {labels.map((l) => (
        <LabelChip key={l.id} label={l} still={still} />
      ))}
    </span>
  );
}
