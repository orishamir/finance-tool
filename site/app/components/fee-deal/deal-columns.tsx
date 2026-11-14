// The fee page's columns for entering the deal (method §10.6), in the page in their reading order, so the Tab key reads them as the eye
// does: one card with what the deal is about as a line over its fees (all of it, in full, while the deal has no kind), and, where the
// window has the room, the chosen fee's toolbox in a column of its own (28rem), the card taking the rest; narrower, the toolbox stands under
// its fee in the card, and a phone stacks them. Each has its own place in the grid whatever the deal holds, so the first fee, and the
// toolbox coming with it, move nothing.
import type { ReactNode } from "react";
import { Card } from "../kit";

/** The columns: `setup` (what the deal is about), `fees` (none while the deal has no kind), and `toolbox` in its own column (none where it has no room). */
export function DealColumns({ setup, fees, toolbox }: { setup: ReactNode; fees: ReactNode | null; toolbox: ReactNode | null }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 min-[80rem]:grid-cols-[minmax(0,1fr)_28rem]">
      <Card className="flex flex-col gap-4 min-[80rem]:col-start-1 min-[80rem]:row-start-1">
        {setup}
        {fees && <div className="border-t border-border pt-4">{fees}</div>}
      </Card>
      {toolbox}
    </div>
  );
}
