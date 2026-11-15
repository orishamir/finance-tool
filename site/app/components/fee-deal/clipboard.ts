// The fee page's own clipboard (Ctrl+C on a cell, Ctrl+V on another cell or a head; paste.ts): a snapshot of the cell copied last, as it
// stood when copied, for the session; editing or deleting the cell after it changes nothing of it. The system clipboard is not used.
import type { Clip } from "../../lib/fee-deal/paste";

let copied: Clip | null = null;

export const clipboard = {
  get: (): Clip | null => copied,
  set: (c: Clip) => {
    copied = c;
  },
};
