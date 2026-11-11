// A whole split into a few parts as one bar of shares (the index page's receipt: what went on the way, by who took it): the parts side by
// side from the start, 2 px apart (charts.md), each as long as its share. A part writes its name and share inside it where they fit, measured
// (chart-text.ts); a part too narrow for them writes them in a key above the bar, by its colour, on a line held at one height. The amounts
// themselves are the caller's, written beside the bar; the bar says shares only. The chart check finds it by `data-chart` and reads its start
// (`data-zero`) and its parts (`data-mark`).
import { useEffect, useRef, useState } from "react";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { cx } from "./cx";

export interface SharePart {
  id: string;
  name: string;
  /** Whole percent; the parts' shares add up to 100 (lib/receipt.ts `sharesOf`). A part at 0 is not drawn. */
  share: number;
  /** The part's colour role, a `bg-` class (`bg-chart-by-account`). */
  className: string;
  /** Light ink on a dark fill (the tax's rose); dark ink otherwise. */
  lightInk?: boolean;
}

/** The px around a part's words inside it. */
const PAD = 12;
const GAP = 2;

export const shareText = (p: SharePart) => `${p.name} · ${p.share}%`;

export function ShareBar({ parts, label }: { parts: SharePart[]; /** The bar's spoken summary. */ label: string }) {
  const root = useRef<HTMLDivElement>(null);
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
  const live = parts.filter((p) => p.share > 0);
  const room = Math.max(0, px - GAP * (live.length - 1));
  // before the bar is measured (the server's render) nothing is written in it or in the key; the key's line keeps its height
  const fits = live.map((p) => px > 0 && chartTextWidth(shareText(p), CHART_TEXT_PX) + PAD <= (room * p.share) / 100);
  const keyed = live.filter((_, i) => px > 0 && !fits[i]);
  return (
    <div ref={root} className="flex w-full min-w-0 flex-col gap-1.5" data-chart="share-bar">
      <div className="flex min-h-5 flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-muted-foreground" aria-hidden="true">
        {keyed.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className={cx("inline-block size-2.5 rounded-[2px]", p.className)} />
            <bdi>{shareText(p)}</bdi>
          </span>
        ))}
      </div>
      <div role="img" aria-label={label} className="flex h-5 gap-0.5" data-zero="">
        {live.map((p, i) => (
          <span
            key={p.id}
            className={cx(
              "flex min-w-1 items-center justify-center overflow-hidden text-xs font-semibold leading-5 tabular-nums whitespace-nowrap",
              i === 0 && "rounded-s-sm",
              i === live.length - 1 && "rounded-e-sm",
              p.lightInk ? "text-foreground" : "text-background",
              p.className,
            )}
            style={{ flex: `${p.share} 1 0` }}
            data-mark="part"
          >
            {fits[i] && <bdi>{shareText(p)}</bdi>}
          </span>
        ))}
      </div>
    </div>
  );
}
