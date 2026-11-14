// The fee page's columns for entering the deal (method §10.6), in the page in their reading order, so the Tab key reads them as the eye
// does: what the deal is (21rem), its fees, and where the window has the room the chosen fee's toolbox, the two sharing the rest 1.25 to 1;
// narrower, the toolbox stands under its card in the fees' column, and a phone stacks the two columns. Each column has its own place in the
// grid whatever the deal holds, so the first fee, and the toolbox coming with it, move nothing.
import type { ReactNode } from "react";
import { Card } from "../kit";

/** The columns: `setup` (what the deal is), `fees` (none while the deal has no kind), and `toolbox` in its own column (none where it has no room). */
export function DealColumns({ setup, fees, toolbox }: { setup: ReactNode; fees: ReactNode | null; toolbox: ReactNode | null }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] min-[80rem]:grid-cols-[minmax(0,21rem)_minmax(0,1.25fr)_minmax(0,1fr)]">
      <Card className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">{setup}</Card>
      {fees && <Card className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">{fees}</Card>}
      {toolbox}
    </div>
  );
}
