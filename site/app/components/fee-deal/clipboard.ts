// The fee page's own clipboard (Ctrl+C on a cell, Ctrl+V on another cell, a head or the cells chosen; paste.ts): the cell copied last, by
// the thing its grip lifts, for the session. The system clipboard is not used: what is copied is a place in the deal, read as it stands
// when it is pasted.
import type { Clip } from "../../lib/fee-deal/paste";

let copied: Clip | null = null;

export const clipboard = {
  get: (): Clip | null => copied,
  set: (c: Clip) => {
    copied = c;
  },
};
