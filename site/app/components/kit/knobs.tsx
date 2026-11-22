import type { ReactNode } from "react";
import { RangeField, type RangeFieldProps } from "./fields";
import { cx } from "./cx";

export interface Knob extends RangeFieldProps {
  id: string;
}

/**
 * The plan's numbers as sliders that stay on screen, for a page meant to be played with (the indices page):
 * one row on a wide computer, two columns on a smaller one, one on a phone (tightened). The result across a range is `ResultCurves`.
 */
export function KnobStrip({ knobs, lead, stacked = false }: { knobs: Knob[]; lead?: ReactNode; /** One field under the other at every width (a narrow side card). */ stacked?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      <div className={cx("grid gap-x-6 gap-y-1", !stacked && "md:grid-cols-2", !stacked && knobs.length === 4 && "xl:grid-cols-4")}>
        {knobs.map(({ id, ...field }) => (
          // no line under a slider: the reset sits beside its label, so a number becoming the person's own moves nothing
          <RangeField key={id} {...field} footer={false} />
        ))}
      </div>
    </div>
  );
}
