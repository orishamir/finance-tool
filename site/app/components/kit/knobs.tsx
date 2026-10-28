import type { ReactNode } from "react";
import { FieldState, RangeField, type RangeFieldProps } from "./fields";
import { Tag } from "./tag";

/** What one step of a knob does to the result: the step in words ("עוד שנה"), the change it makes, and its size for the bar. */
export interface KnobEffect {
  step: ReactNode;
  delta: ReactNode;
  /** The change as a plain number, compared across the knobs: the largest fills its bar. */
  size: number;
}

export interface Knob extends RangeFieldProps {
  id: string;
  effect?: KnobEffect | null;
}

/**
 * The plan's numbers as sliders that stay on screen, for a page meant to be played with (the indices page, founder 2026-10-28).
 * Under each slider a line says in words what one more step does to the result, with a bar so the rows compare at a glance;
 * the row that moves the result most is named.
 */
export function KnobStrip({ knobs, lead, most }: { knobs: Knob[]; lead?: ReactNode; most: string }) {
  const top = Math.max(0, ...knobs.map((k) => Math.abs(k.effect?.size ?? 0)));
  return (
    <div className="flex flex-col gap-3">
      {lead && <p className="text-sm text-muted-foreground">{lead}</p>}
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {knobs.map(({ id, effect, ...field }) => (
          <RangeField
            key={id}
            {...field}
            footer={
              <div className="flex flex-col">
                {effect && <EffectLine effect={effect} frac={top > 0 ? Math.abs(effect.size) / top : 0} most={top > 0 && Math.abs(effect.size) === top ? most : null} />}
                {field.isEntered && <FieldState entered onReset={field.onReset} disabled={field.disabled} />}
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}

function EffectLine({ effect, frac, most }: { effect: KnobEffect; frac: number; most: string | null }) {
  return (
    <div className="flex flex-col gap-1.5 pt-1 text-sm">
      <span className="flex flex-wrap items-center gap-x-2">
        <span className="text-muted-foreground">{effect.step}</span>
        <span className="font-medium whitespace-nowrap">{effect.delta}</span>
        {most && <Tag>{most}</Tag>}
      </span>
      <span className="relative h-2 rounded-sm bg-muted" aria-hidden="true">
        <span className="absolute inset-y-0 start-0 rounded-sm bg-chart-value" style={{ width: `${Math.max(0, Math.min(1, frac)) * 100}%` }} />
      </span>
    </div>
  );
}
