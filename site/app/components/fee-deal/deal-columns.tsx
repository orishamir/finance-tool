// The fee page's columns for entering the deal (method §10.6), in the page in their reading order, so the Tab key reads them as the eye
// does: a card with what the deal is about (all of it, in full, while the deal has no kind), its fees' cards under it, and, where the
// window has the room, the chosen fee's toolbox in a column of its own (28rem), the card taking the rest; narrower, the toolbox stands under
// its fee in the card, and a phone stacks them. Each has its own place in the grid whatever the deal holds, so the first fee, and the
// toolbox coming with it, move nothing. A figure the person typed shows in the entered ink, with no highlight behind it.
import type { ReactNode } from "react";
import { Card } from "../kit";

/** The columns: `setup` (what the deal is about), `fees` (none while the deal has no kind), and `toolbox` in its own column (none where it has no room). */
export function DealColumns({ setup, fees, toolbox }: { setup: ReactNode; fees: ReactNode | null; toolbox: ReactNode | null }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 min-[80rem]:grid-cols-[minmax(0,1fr)_28rem]">
      <div className="flex flex-col gap-6 min-[80rem]:col-start-1 min-[80rem]:row-start-1">
        {/* once the deal has a kind (it has fees), what it is about is a strip of two lines, in a low card (founder, 2026-11-20) */}
        <Card pad={fees ? "strip" : "default"}>{setup}</Card>
        {/* the fees' cards stand on the page, not in a card of the same surface; while something is carried they keep their height
            (`data-carry-hold`, kit/lift.tsx): what a drop would leave draws inside */}
        {fees && <div data-carry-hold="">{fees}</div>}
      </div>
      {toolbox}
    </div>
  );
}
