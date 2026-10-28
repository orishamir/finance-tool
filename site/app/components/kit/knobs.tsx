import type { ReactNode } from "react";
import { RangeField, type RangeFieldProps } from "./fields";

export interface Knob extends RangeFieldProps {
  id: string;
}

/**
 * The plan's numbers as sliders that stay on screen, for a page meant to be played with (the indices page, founder 2026-10-28):
 * two columns on a computer, one on a phone. What one more step does is `TryButtons`; the result across a range is `ResultCurves`.
 */
export function KnobStrip({ knobs, lead }: { knobs: Knob[]; lead?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
        {knobs.map(({ id, ...field }) => (
          // the state line only once a number is the person's own: an empty line under each slider spread the strip out
          <RangeField key={id} {...field} footer={field.isEntered ? undefined : false} />
        ))}
      </div>
    </div>
  );
}
