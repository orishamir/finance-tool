// The index page's plan card, first on the page (over the receipt's ticket from 1280 px): its heading and the plan's tiles. What the results rest on
// is said where each figure is: the receipt's caption names the inflation its figures are in today's money by, and each figure's sheet
// lists what its run read, the exchange rate among them where the run reads one (F-84).
import type { ReactNode } from "react";
import { invest as c } from "../../copy";
import { Card } from "../kit";

/** The card's heading, which the plan's knobs set at the start of their own first line (`KnobStrip`'s `head`). */
export const planHeading = <h2 className="text-lg font-semibold">{c.plan.heading}</h2>;

/** The card around the plan's knobs. */
export function PlanCard({ knobs }: { knobs: ReactNode }) {
  return (
    <Card as="section" pad="tight" className="flex flex-col gap-3" aria-label={c.plan.heading}>
      {knobs}
    </Card>
  );
}
