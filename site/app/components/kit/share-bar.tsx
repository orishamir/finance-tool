// A whole split into a few parts as one bar of shares (a deal's reading on the fee page): the parts side by
// side from the start, 2 px apart (charts.md), each as long as its share. One key above the bar, in the bar's order, names every part by its
// colour with its share, so each part is read in the same place whatever its size; nothing is written inside the bar, where only the
// largest part ever had room. A bare bar has no key (the rows beside it name its parts, in its order) and runs left to right from its
// largest part, which carries its sum inside it. The amounts themselves are the caller's, written beside the bar; the bar says shares only. The chart check
// finds it by `data-chart` and reads its start (`data-zero`) and its parts (`data-mark`).
import { cx } from "./cx";
import { MixedName } from "./name";

export interface SharePart {
  id: string;
  name: string;
  /** Whole percent; the parts' shares add up to 100. A part at 0 is not drawn, and stays in the key. */
  share: number;
  /** The part's colour role, a `bg-` class (`bg-chart-by-account`). */
  className: string;
  /** In place of the share in the key: what a part that took something, and whose whole share is zero, says ("פחות מ־1%"). */
  words?: string;
}

export function ShareBar({ parts, label, bare }: { parts: SharePart[]; /** The bar's spoken summary. */ label: string; /** No key: the rows beside the bar name its parts (a reading's list, largest first as the bar runs), the parts run left to right from the largest, and the largest part's `words` are written inside it, 24 px tall. */ bare?: boolean }) {
  const live = parts.filter((p) => p.share > 0);
  if (bare) {
    const sorted = [...live].sort((a, b) => b.share - a.share);
    const largest = sorted[0] ?? null;
    return (
      <div role="img" aria-label={label} dir="ltr" className="flex h-6 w-full min-w-0 gap-0.5" data-chart="share-bar" data-zero="">
        {sorted.map((p, i) => (
          <span key={p.id} className={cx("flex min-w-1.5 items-center justify-center overflow-hidden text-xs font-semibold text-background tabular-nums", i === 0 && "rounded-s-sm", i === sorted.length - 1 && "rounded-e-sm", p.className)} style={{ flex: `${p.share} 1 0` }} data-mark="part">
            {p === largest && p.words && p.share >= 30 ? <bdi className="whitespace-nowrap">{p.words}</bdi> : null}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex w-full min-w-0 flex-col gap-2" data-chart="share-bar">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className={cx("inline-block size-2.5 rounded-[2px]", p.className)} />
            <MixedName>{p.name}</MixedName>
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
