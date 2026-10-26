// Concentric rings, each its own share from 0 to 100% (D34, 2026-10-26: a track's stock and currency exposure in the company page's
// table). A ring is not a slice: the measures overlap, so they never share one circle. The numbers beside the rings carry the meaning;
// the drawing is decoration for the eye and hidden from screen readers.
import { cx } from "./cx";

export interface Ring {
  id: string;
  /** 0 to 1; a share above 100% is drawn full and its number says how much. */
  fraction: number;
  /** The colour role of the filled part, as a stroke class (`stroke-chart-stocks`). */
  className: string;
}

/** The outermost ring first. `size` is the drawing's width in px; each ring is 3.5 px wide with a 1.5 px gap. */
export function ShareRings({ rings, size = 36, className }: { rings: Ring[]; size?: number; className?: string }) {
  const stroke = 3.5;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className={cx("shrink-0", className)}>
      {rings.map((r, i) => {
        const radius = c - stroke / 2 - i * (stroke + 1.5);
        const length = 2 * Math.PI * radius;
        const filled = Math.max(0, Math.min(1, r.fraction)) * length;
        return (
          <g key={r.id}>
            <circle cx={c} cy={c} r={radius} fill="none" strokeWidth={stroke} className="stroke-chart-grid" />
            {filled > 0 && <circle cx={c} cy={c} r={radius} fill="none" strokeWidth={stroke} strokeDasharray={`${filled} ${length}`} transform={`rotate(-90 ${c} ${c})`} className={r.className} />}
          </g>
        );
      })}
    </svg>
  );
}
