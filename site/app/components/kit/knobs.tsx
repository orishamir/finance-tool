import type { ReactNode } from "react";
import { RangeField, type RangeFieldProps } from "./fields";
import { cx } from "./cx";

export interface Knob extends RangeFieldProps {
  id: string;
}

/**
 * The plan's numbers as sliders that stay on screen, for a page meant to be played with (the indices page, founder 2026-10-28):
 * one row on a wide computer, two columns on a smaller one, one on a phone (tightened 2026-10-31). The result across a range is `ResultCurves`.
 */
export function KnobStrip({ knobs, lead }: { knobs: Knob[]; lead?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      <div className={cx("grid gap-x-6 gap-y-1 md:grid-cols-2", knobs.length === 4 && "xl:grid-cols-4")}>
        {knobs.map(({ id, ...field }) => (
          // the state line only once a number is the person's own: an empty line under each slider spread the strip out
          <RangeField key={id} {...field} footer={field.isEntered ? undefined : false} />
        ))}
      </div>
    </div>
  );
}
