// What opens when a value of the open case is tapped (design-system 11, "Cases and parts"): a list to tick (what is bought, the channel, what
// is held, the currency; several may be ticked for one case, and "בכל …" is one of the values), a track's name with the switch that makes
// it the person's own, or a range's side and top; and what a thing of the band's head opens, its values and the action that drops it.
// They stand in `ValueMenuSheet`: a card beside the value on a computer, a sheet from the
// foot of the screen on a phone.
import { useId, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { dealCases as copy } from "../../copy";
import { Sheet } from "../Sheet";
import { Button } from "./button";
import { cx } from "./cx";
import { InlineSelect, TextField } from "./fields";
import { Tag } from "./tag";

/** A short line that heads a menu, in the muted ink: what is chosen there ("מה קונים במקרה הזה. אפשר לסמן כמה."). */
function MenuTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * A list of values to tick, several at once. Each row is one target: a box, the value, and "נבחר" with the action colour's outline when
 * ticked, never colour alone. `other` is the last row, a value of the person's own ("+ משהו אחר, בשם משלכם").
 */
export function TickMenu({ title, options, ticked, onToggle, other }: { title: ReactNode; options: { id: string; label: ReactNode }[]; ticked: string[]; onToggle: (id: string) => void; other?: { onClick: () => void; label?: string } }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-1">
      <MenuTitle id={id}>{title}</MenuTitle>
      {options.map((o) => {
        const on = ticked.includes(o.id);
        return (
          <label key={o.id} className={cx("flex min-h-target cursor-pointer items-center gap-2.5 rounded-md px-2.5", on ? "outline-2 -outline-offset-2 outline-primary" : "hover:bg-accent")}>
            <input type="checkbox" checked={on} onChange={() => onToggle(o.id)} className="size-5 shrink-0 accent-[var(--primary)]" />
            <span className="min-w-0 flex-1">{o.label}</span>
            {on && <Tag tone="primary">{copy.chosen}</Tag>}
          </label>
        );
      })}
      {other && (
        <Button variant="quiet" gap="sm" onClick={other.onClick} className="self-start">
          <Plus size={16} strokeWidth={1.75} aria-hidden />
          {other.label ?? copy.menus.other}
        </Button>
      )}
    </div>
  );
}

/**
 * On or off, as a switch: the track and its knob, and the words beside it; the whole line is the target. The knob stands at the end when on,
 * on the action colour's track.
 */
export function Switch({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (on: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex min-h-target w-fit items-center gap-3">
      <button type="button" role="switch" id={id} aria-checked={checked} onClick={() => onChange(!checked)} className={cx("tap-area relative h-6 w-10 shrink-0 rounded-full transition-colors duration-[var(--duration-fast)]", checked ? "bg-primary" : "bg-muted-foreground/40")}>
        <span aria-hidden className={cx("absolute top-0.5 size-5 rounded-full transition-[inset-inline-start] duration-[var(--duration-fast)]", checked ? "start-[1.125rem] bg-primary-foreground" : "start-0.5 bg-foreground")} />
      </button>
      <label htmlFor={id} className="cursor-pointer font-medium">
        {label}
      </label>
    </div>
  );
}

/** A track's name as the price list writes it, and the switch that makes it the person's own track (one track of a fee is). */
export function TrackMenu({ name, onName, mine, onMine }: { name: string; onName: (name: string) => void; mine: boolean; onMine: (on: boolean) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <TextField label={copy.menus.trackName} value={name} onChange={onName} />
      <Switch label={copy.menus.myTrack} checked={mine} onChange={onMine} />
    </div>
  );
}

/**
 * A range's case: "עד" its top or "מעל" the case before it, the number in its box with its unit (`figure`: the kit's `FigureField`, its
 * unit a choice where the price's currency is one), and the case before it in words (`before`: "עד 100 $"). The last case of a range is
 * always "מעל" the one before it, so a range has no gap.
 */
export function RangeMenu({ title, side, onSide, figure, before }: { title: ReactNode; side: "upTo" | "over"; onSide: (side: "upTo" | "over") => void; figure: ReactNode; before?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <MenuTitle>{title}</MenuTitle>
      <div className="flex flex-wrap items-center gap-2">
        <InlineSelect
          chip
          label={copy.menus.side}
          options={[
            { id: "upTo", name: copy.menus.upTo },
            { id: "over", name: copy.menus.over },
          ]}
          value={side}
          onChange={(v) => v && onSide(v as "upTo" | "over")}
        />
        {figure}
      </div>
      {before && (
        <p className="text-sm text-muted-foreground">
          {copy.menus.before} {before}
        </p>
      )}
    </div>
  );
}

/**
 * What a thing of a band's head opens while its fee is open: the values the cases name for it (`values`, each once, in the muted ink where
 * it is any value), the action that stops the price changing by it (`stop`, its words naming the thing), and one line under it on what that
 * does to the cases (`after`).
 */
export function ThingMenu({ title, values, stop, onStop, after }: { title: ReactNode; values: { text: ReactNode; any?: boolean }[]; stop: string; onStop: () => void; after: ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <MenuTitle id={id}>{title}</MenuTitle>
        <ul aria-labelledby={id} className="flex flex-col gap-1">
          {values.map((v, k) => (
            <li key={k} className={cx("text-sm", v.any ? "text-muted-foreground" : "font-medium")}>
              {v.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-start gap-1 border-t border-border pt-3">
        <Button variant="outline" onClick={onStop}>
          {stop}
        </Button>
        <p className="text-sm text-muted-foreground">{after}</p>
      </div>
    </div>
  );
}

/**
 * The card a value's menu opens in: beside the value (`anchor`) on a computer, a sheet from the foot of the screen on a phone (the kit's
 * `Sheet`). `label` is its spoken name.
 */
export function ValueMenuSheet({ open, onClose, anchor, label, children }: { open: boolean; onClose: () => void; anchor: HTMLElement | null; label: string; children: ReactNode }) {
  const id = useId();
  return (
    <Sheet open={open} onClose={onClose} anchor={anchor} pc="popover" labelledBy={id}>
      <h2 id={id} className="sr-only">
        {label}
      </h2>
      {children}
    </Sheet>
  );
}
