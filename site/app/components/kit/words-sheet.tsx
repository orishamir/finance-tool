// A short explanation of the page's own, in a sheet: a title and a body that may hold figures, each opening its own sheet as a figure does.
// `OwnSheet` is the sheet itself, opened from whatever the caller draws (a receipt line's name).
import { useId, type ReactNode } from "react";
import { Sheet } from "../Sheet";

/** The sheet: `title` heads it, `children` under it; open while `anchor`, what opened it, is set. */
export function OwnSheet({ anchor, onClose, title, children }: { anchor: HTMLElement | null; onClose: () => void; title: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <Sheet open={anchor !== null} onClose={onClose} anchor={anchor} pc="popover" height={70} labelledBy={id}>
      {anchor && (
        <div className="flex flex-col gap-3">
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </Sheet>
  );
}
