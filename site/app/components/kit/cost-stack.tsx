// A cost split into its parts as one horizontal bar (the index page): the parts in their own hues side by side,
// the bar's length the total on a scale shared by every bar it is compared with. Bars that compare are drawn one above the other
// ("10x easier to comprehend when the bars are above each other"). A total beyond the scale is drawn to the edge with a break mark.
//
// It moves and answers: when a figure changes, every part's width and the amount written in it glide to the new value
// (the chart glide of chart-glide.tsx, so one that keeps changing never restarts), and a part that falls to zero shrinks to nothing, keeping its
// place, rather than vanishing. Pointing at a part, or tapping it, shows a box with every part's name and amount and the total, the part
// pointed at with its share, what it is when the name does not say, and where its price comes from.
//
// Every part that holds shekels writes its amount (the "fees on fees" remainder was a 0.3 px sliver with no amount, and
// the amounts beside it fell 2 to 75 ₪ short of the total): inside the part where it fits, else, on a `md` bar, under the bar at the part's
// place, with its colour; and always in the box. The rounding that makes the amounts add up to the total never goes to a part whose amount
// is not written.
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { kit as kitCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { useGlidingSeries, type GlideSeries } from "./chart-glide";
import { useChartPick } from "./chart-interact";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { cx } from "./cx";

export interface CostPart {
  id: string;
  value: number;
  /** The part's colour role, a `bg-` class (`bg-chart-cost-trade`). */
  className: string;
  /** Written inside the part when it is wide enough: `true` for its amount in whole shekels, gliding with the part; or the caller's own text. */
  inside?: true | ReactNode;
  /** The part's name: with it, pointing at the part (on `md`, also tapping it) shows its name, amount and share of the bar. */
  name?: string;
  /** What the part is, when its name alone does not say it: one sentence in the same box, under its name. */
  about?: ReactNode;
  /** Where the part's price comes from ("the price list", "what you entered"), written in the same box under its name. */
  source?: ReactNode;
  /** The legend item this part belongs to, when it is not `id`. */
  legendId?: string;
  /** Whose cost the part is ("account"): with the bar's `groups`, the parts of a group write amounts that add up to that group's figure. */
  group?: string;
}

/**
 * Whole shekels that add up to `target` (by default the rounded sum; largest remainder): a sentence of parts never disagrees with its total.
 * `can`: the parts whose amounts are written; the rounding goes only to them, and an amount not written is only rounded.
 */
export function wholeParts(xs: number[], target = Math.round(xs.reduce((a, x) => a + x, 0)), can?: readonly boolean[]): number[] {
  const ok = (i: number) => !can || !!can[i];
  // rounding moves each part by less than a shekel, and a target made of rounded figures (a bar's total is the rounded value without costs
  // less the rounded value left, less a group's rounded figure) is up to a shekel and a half from its exact sum: a target further off than
  // both is a part missing from the sum, never rounding (with the remainder dropped, its shekels went to the
  // other parts and every sum still matched; a hedged pair on MSCI ACWI was 1.46 off with one written part, and the page fell over)
  // plus the float's own precision on a huge total (a plan typed at 1,000 billion ₪ for 40 years at 50% gives
  // figures near 10^18, whose last 512 ₪ a double cannot hold; the guard fired on every bar there)
  const room = Math.max(1, xs.filter((_, i) => ok(i)).length) + 1.5 + Math.abs(target) * 1e-12;
  const off = target - xs.reduce((a, x) => a + x, 0);
  // a check for the builders: in tests and in development it stops the render; on the site the page goes on with the amounts rounded
  if (Math.abs(off) > room + 1e-6) {
    const msg = `wholeParts: the target ${target} is ${off.toFixed(2)} from the parts' sum, more than a shekel a part (${room})`;
    if (import.meta.env.DEV) throw new Error(msg);
    console.error(msg);
  }
  const out = xs.map((x, i) => (ok(i) ? Math.floor(x) : Math.round(x)));
  const order = xs.map((x, i) => ({ i, r: x - Math.floor(x) })).filter((x) => ok(x.i)).sort((a, b) => b.r - a.r);
  if (order.length === 0) return out;
  let left = target - out.reduce((a, x) => a + x, 0);
  for (let k = 0; left > 0; k++, left--) out[order[k % order.length]!.i]! += 1;
  for (let k = order.length - 1; left < 0; k--, left++) out[order[((k % order.length) + order.length) % order.length]!.i]! -= 1;
  return out;
}

/** Which parts write their amount: in or under the bar (`inside: true`), or in the box (a name). */
const writesOf = (parts: readonly CostPart[]) => parts.map((p) => p.value > 0 && (p.inside === true || !!p.name));

/**
 * The whole shekels of each part: a group with a figure of its own written elsewhere (`groups`, "the account charges 1,043 ₪") first gets
 * that figure, shared among its parts, and the other parts share what is left of the total (the account list said 1,043 and the
 * bar's account parts added up to 1,044, the bar's rounding having handed a shekel to an account part).
 */
function wholesOf(parts: readonly CostPart[], total: number, written: readonly boolean[], groups?: Readonly<Record<string, number>>): number[] {
  const inGroup = (i: number) => { const g = parts[i]!.group; return g !== undefined && groups?.[g] !== undefined ? g : null; };
  const out = new Array<number>(parts.length).fill(0);
  const share = (idx: number[], target: number) => {
    if (idx.length === 0) return;
    const w = wholeParts(idx.map((i) => parts[i]!.value), target, idx.map((i) => written[i]!));
    idx.forEach((i, k) => (out[i] = w[k]!));
  };
  const named = [...new Set(parts.map((_, i) => inGroup(i)).filter((g): g is string => g !== null))];
  for (const g of named) share(parts.map((_, i) => i).filter((i) => inGroup(i) === g), groups![g]!);
  const rest = parts.map((_, i) => i).filter((i) => inGroup(i) === null);
  share(rest, total - named.reduce((a, g) => a + groups![g]!, 0));
  return out;
}
/**
 * The whole-shekel amount a bar writes for each part, as CostStack writes it, adding up to `total` (else the parts' rounded sum); 0 for a
 * part it does not write. Figures beside the bars that speak of their parts (a difference between two bars) are made from these, so they
 * agree with what the bars write ("החשבון: 1 ₪ יותר" beside two bars whose account parts both came to 1,057).
 */
export function writtenAmounts(parts: readonly CostPart[], total?: number, groups?: Readonly<Record<string, number>>): number[] {
  const w = writesOf(parts);
  return wholesOf(parts, total ?? Math.round(parts.reduce((a, p) => a + p.value, 0)), w, groups).map((x, i) => (w[i] ? x : 0));
}

/** The px an amount written under the bar takes: its colour mark, its 13 px figures (measured, chart-text.ts), and a little air (`air`). */
const labelPx = (text: string, air = 8) => 8 + 4 + Math.ceil(chartTextWidth(text, CHART_TEXT_PX)) + air;

/**
 * Where each amount written under the bar starts, in px from the bar's start: under its part, pushed along so none overlaps the one before,
 * then pulled back from the bar's end. `at`: each label's centre, in px from the bar's start, in the bar's order.
 */
export function placeLabels(at: readonly number[], widths: readonly number[], room: number, gap = 4): number[] {
  const pos = at.map((c, i) => c - widths[i]! / 2);
  for (let i = 0; i < pos.length; i++) pos[i] = Math.max(pos[i]!, i === 0 ? 0 : pos[i - 1]! + widths[i - 1]! + gap);
  for (let i = pos.length - 1; i >= 0; i--) pos[i] = Math.max(0, Math.min(pos[i]!, (i === pos.length - 1 ? room : pos[i + 1]! - gap) - widths[i]!));
  return pos;
}

/** The part colours on which an amount inside reads better in light ink. */
// the tax's rose too: near-black on it read at 3.55:1, white at 4.73:1
const DARK_FILLS: ReadonlySet<string> = new Set(["bg-chart-cost-other", "bg-chart-tax"]);

/** A part's width is at least a sliver while its bar has anything, and a part this thin has no edge of its own. */
const THIN = 0.003;
/** The bar's whole length, as a share of the scale, below which the parts are drawn larger so a small cost stays visible. */
const SLIVER = 0.01;

/**
 * `scale`: the total that fills the whole width. `size`: `sm` for a list row, `md` for a figure of its own. `label` is the bar's spoken
 * summary; the figures beside it are the caller's. `highlight`: the legend item set apart, on every bar it is compared with.
 * A `sm` bar sits in a row that picks the row on a tap: a mouse's click is left to the row (pointing shows the box), and a finger's tap
 * shows the part's box and still picks the row (on a phone a tap showed nothing of the part). A part of the bar that is not in `parts` any more
 * keeps its place and shrinks to nothing. `total`: the whole-shekel total the caller writes beside the bar; the amounts written in the parts,
 * under the bar and in its box are whole shekels that add up to it (693 + 354 + 719 + 5,555 = 7,321 beside 7,323). Without
 * it, to the parts' own rounded sum. A `md` bar keeps a line under it, at one height, for the amounts too narrow to write inside; the root
 * carries the total and the amounts written (`data-total`, `data-amounts`), which a render test holds together on the pages. The chart
 * check (site/scripts/chart-check) finds it by `data-chart` and reads the bar's start (`data-zero`) and its parts (`data-mark`).
 */
export function CostStack({ parts, scale, size = "md", label, highlight, total: writtenTotal, groups }: { parts: CostPart[]; scale: number; size?: "sm" | "md"; label: string; highlight?: string | null; total?: number; /** A group's whole-shekel figure written elsewhere on the page (`{ account: 1043 }`): its parts' amounts add up to it. */ groups?: Readonly<Record<string, number>> }) {
  const pick = useChartPick();
  const root = useRef<HTMLDivElement>(null);
  // the bar's width in px, so an amount is written inside a part only where it fits
  const [px, setPx] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const read = () => setPx(el.clientWidth);
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  // a part the caller no longer gives stays, at zero, so it can shrink away from where it stood
  const last = useRef(new Map<string, CostPart>());
  for (const p of parts) last.current.set(p.id, p);
  const given = new Set(parts.map((p) => p.id));
  const list = [...parts, ...[...last.current.values()].filter((p) => !given.has(p.id)).map((p) => ({ ...p, value: 0 }))];

  const target: GlideSeries = {};
  for (const p of list) target[p.id] = [{ year: 0, v: p.value }];
  const glide = useGlidingSeries(target);
  const shown = (p: CostPart) => Math.max(0, glide[p.id]?.[0]?.v ?? p.value);

  const total = list.reduce((a, p) => a + p.value, 0);
  // a part's amount is written when it is in the box (it has a name) or written in or under the bar (`inside: true`)
  const written = writesOf(list);
  // each part's amount in whole shekels, adding up to the total written beside the bar; while a part glides, offset by its rounding
  const shownSum = writtenTotal ?? Math.round(total);
  const wholes = wholesOf(list, shownSum, written, groups);
  const shows = (i: number) => written[i]! && wholes[i]! > 0;
  const amountOf = (p: CostPart, i: number) => Math.round(shown(p) + (wholes[i]! - p.value));
  const shownTotal = list.reduce((a, p) => a + shown(p), 0);
  const broken = scale > 0 && total > scale;
  // the length the parts are measured on: the scale, or the bar's own when it is longer; a small bar is drawn larger, so a sliver stays
  let whole = scale > 0 ? Math.max(scale, shownTotal) : shownTotal;
  if (shownTotal > 0) whole = Math.min(whole, shownTotal / SLIVER);
  const widths = list.map((p) => (whole > 0 ? shown(p) / whole : 0));
  const live = widths.map((w) => w > THIN);
  const firstLive = live.indexOf(true);
  const lastLive = live.lastIndexOf(true);
  const starts = widths.map((_, i) => widths.slice(0, i).reduce((a, w) => a + w, 0));
  // the text inside each part, where it fits: 13 px figures at their measured width (chart-text.ts) and 5 px of air at both sides; a
  // caller's own text is taken as six figures wide
  const inner = list.map((p, i) => (p.inside === true ? amountOf(p, i).toLocaleString("he-IL") : p.inside));
  const fits = list.map((_, i) => widths[i]! * px >= chartTextWidth(typeof inner[i] === "string" ? (inner[i] as string) : "000000", CHART_TEXT_PX) + 10);
  // on a `md` bar, an amount too narrow for its part is written under the bar, at the part's place
  const under = size === "md" ? list.map((p, i) => i).filter((i) => list[i]!.inside === true && shows(i) && !fits[i]) : [];
  const underText = under.map((i) => amountOf(list[i]!, i).toLocaleString("he-IL"));
  // where the amounts with their air don't fit side by side under the bar, they give up the air: placed with it, the last ones were pushed
  // back over each other (the chart check: at 320 px the kit's "693" ran its colour mark into "3")
  const underAir = underText.reduce((a, t) => a + labelPx(t) + 4, -4) <= px ? 8 : 0;
  const underAt = placeLabels(under.map((i) => (starts[i]! + widths[i]! / 2) * px), underText.map((t) => labelPx(t, underAir)), px);

  // a tap outside lets go of a part kept by a tap
  const pinned = pick.pinned;
  const clear = pick.clear;
  useEffect(() => {
    if (!pinned) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) clear();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [pinned, clear]);

  const activeAt = list.findIndex((p) => p.name && pick.active === p.id && shows(list.indexOf(p)));
  const boxRows = list.map((p, i) => ({ p, i })).filter(({ p, i }) => p.name && shows(i));
  return (
    <div ref={root} className="relative w-full min-w-0" data-chart="cost-stack" data-total={shownSum} data-amounts={list.map((_, i) => (shows(i) ? wholes[i] : null)).filter((x) => x !== null).join(",")}>
      <div role="img" aria-label={label} className={cx("flex", size === "sm" ? "h-3" : "h-7")} data-zero="">
        {list.map((p, i) => {
          const w = widths[i]!;
          const named = !!p.name && p.value > 0;
          const text = size === "md" && fits[i] ? inner[i] : null;
          return (
            <span
              key={p.id}
              {...(named ? pick.bind(p.id, size === "md" ? true : "touch") : {})}
              className={cx(
                "relative flex shrink-0 items-center justify-center text-xs font-semibold tabular-nums whitespace-nowrap",
                // the remainder's grey is dark (re-picked through the palette validator) and the tax's rose mid-dark: their amounts are written in light ink
                DARK_FILLS.has(p.className) ? "text-foreground" : "text-background",
                live[i] && i !== lastLive && "border-e border-card",
                i === firstLive && "rounded-s-sm",
                i === lastLive && "rounded-e-sm",
                named && "cursor-pointer",
                size === "md" && named && "before:absolute before:inset-x-0 before:-inset-y-2",
                "transition-opacity duration-[var(--duration-fast)]",
                p.className,
                (highlight ? highlight !== (p.legendId ?? p.id) : pick.active && pick.active !== p.id) && "opacity-20",
              )}
              style={{ width: `${w * 100}%` }}
              data-mark="part"
            >
              <span className="overflow-hidden">{text}</span>
            </span>
          );
        })}
      </div>
      {/* the line under a `md` bar, held at one height whether it writes one amount, several or none */}
      {size === "md" && (
        <div className="relative h-5" aria-hidden="true">
          {under.map((i, k) => {
            const p = list[i]!;
            const dim = highlight ? highlight !== (p.legendId ?? p.id) : pick.active && pick.active !== p.id;
            return (
              <Fragment key={p.id}>
                {/* a short tick from the part, so an amount pushed along still points at its sliver */}
                <span className={cx("absolute top-0 h-1 w-px bg-muted-foreground", dim && "opacity-20")} style={{ insetInlineStart: (starts[i]! + widths[i]! / 2) * px }} />
                <span
                  {...(p.name ? pick.bind(p.id, true) : {})}
                  className={cx("absolute top-1 flex items-center gap-1 text-xs leading-4 text-muted-foreground tabular-nums whitespace-nowrap transition-opacity duration-[var(--duration-fast)]", p.name && "cursor-pointer", dim && "opacity-20")}
                  style={{ insetInlineStart: underAt[k] }}
                >
                  <span className={cx("inline-block size-2 rounded-[2px]", p.className)} />
                  <bdi dir="ltr">{underText[k]}</bdi>
                </span>
              </Fragment>
            );
          })}
        </div>
      )}
      {activeAt >= 0 && <Box rows={boxRows.map(({ p, i }) => ({ part: p, amount: wholes[i]! }))} active={list[activeAt]!.id} share={list[activeAt]!.value / total} total={shownSum} toStart={starts[activeAt]! + widths[activeAt]! / 2 > 0.5} />}
      {broken && <span aria-hidden="true" className={cx("absolute top-0 start-[82%] w-1.5 -skew-x-[20deg] bg-card", size === "sm" ? "h-3" : "h-7")} />}
    </div>
  );
}

/**
 * The box of a bar as a whole: every part's name and amount, the one pointed at with its share, what it is and its source, then the total.
 * It stands from one end of the bar and is moved along, before paint, so it stays on the screen (a list row's bar on a 320 px
 * phone is narrower than the box, which ran 65 px past the screen's edge once a tap showed it).
 */
function Box({ rows, active, share, total, toStart }: { rows: { part: CostPart; /** Whole shekels, of the parts that add up to the total. */ amount: number }[]; active: string; share: number; total: number; toStart: boolean }) {
  const box = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.transform = "";
    const r = el.getBoundingClientRect();
    const room = document.documentElement.clientWidth;
    const edge = 8;
    const dx = r.left < edge ? edge - r.left : r.right > room - edge ? room - edge - r.right : 0;
    if (dx) el.style.transform = `translateX(${dx}px)`;
  });
  return (
    <span ref={box} className={cx("absolute bottom-full mb-1 z-20 pointer-events-none flex w-max max-w-64 flex-col gap-0.5 rounded-md border border-border bg-popover px-2 py-1 text-xs font-normal text-foreground leading-snug whitespace-normal text-start shadow-sm", toStart ? "end-0" : "start-0")}>
      {rows.map(({ part, amount }) => (
        <span key={part.id} className="flex flex-col">
          <span className={cx("flex items-baseline gap-1.5", part.id === active ? "font-semibold" : "text-muted-foreground")}>
            <span className={cx("inline-block size-2 shrink-0 rounded-[2px] self-center", part.className)} />
            <span>
              <bdi>{part.name}</bdi>: <bdi dir="ltr">{fmt.nisWhole(amount)}</bdi>
              {part.id === active && <> ({kitCopy.chart.shareOf(Math.round(share * 100))})</>}
            </span>
          </span>
          {part.id === active && part.about && <span className="ps-3.5">{part.about}</span>}
          {part.id === active && part.source && <span className="ps-3.5 text-muted-foreground">{part.source}</span>}
        </span>
      ))}
      <span className="mt-0.5 border-t border-border pt-0.5 font-semibold">
        {kitCopy.chart.total}: <bdi dir="ltr">{fmt.nisWhole(total)}</bdi>
      </span>
    </span>
  );
}
