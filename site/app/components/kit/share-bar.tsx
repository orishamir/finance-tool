// A whole split into a few parts as one bar of shares (the index page's receipt: what went on the way, by who took it): the parts side by
// side from the start, 2 px apart (charts.md), each as long as its share. One key above the bar, in the bar's order, names every part by its
// colour with its share, so each part is read in the same place whatever its size; nothing is written inside the bar, where only the
// largest part ever had room. The amounts themselves are the caller's, written beside the bar; the bar says shares only. The chart check
// finds it by `data-chart` and reads its start (`data-zero`) and its parts (`data-mark`).
import { cx } from "./cx";

export interface SharePart {
  id: string;
  name: string;
  /** Whole percent; the parts' shares add up to 100 (lib/receipt.ts `sharesOf`). A part at 0 is not drawn, and stays in the key. */
  share: number;
  /** The part's colour role, a `bg-` class (`bg-chart-by-account`). */
  className: string;
  /** In place of the share in the key: what a part that took something, and whose whole share is zero, says ("פחות מ־1%"). */
  words?: string;
}

export function ShareBar({ parts, label }: { parts: SharePart[]; /** The bar's spoken summary. */ label: string }) {
  const live = parts.filter((p) => p.share > 0);
  return (
    <div className="flex w-full min-w-0 flex-col gap-2" data-chart="share-bar">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className={cx("inline-block size-2.5 rounded-[2px]", p.className)} />
            <bdi>{p.name}</bdi>
            <bdi className="font-semibold text-foreground tabular-nums">{p.words ?? `${p.share}%`}</bdi>
          </span>
        ))}
      </div>
      <div role="img" aria-label={label} className="flex h-3 gap-0.5" data-zero="">
        {live.map((p, i) => (
          <span key={p.id} className={cx("min-w-1.5", i === 0 && "rounded-s-sm", i === live.length - 1 && "rounded-e-sm", p.className)} style={{ flex: `${p.share} 1 0` }} data-mark="part" />
        ))}
      </div>
    </div>
  );
}
