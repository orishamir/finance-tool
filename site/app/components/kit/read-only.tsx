// The kit's read-only mode: inside `ReadOnly`, the pieces that show what a deal holds (a fee's card, its cases, their parts and figures)
// show it as it stands and draw nothing that changes it: no add, grip, knob, bin or switch, no figure edited in place, nothing that opens a
// case or a menu, nothing lifted; and a price in plain words, with no frame or chip that reads as a field to fill or a menu to open. Each
// such piece reads the mode itself. One mode in one place, so a host that shows a price list in the deal editor's own pieces (the indices
// page's terms view) gets the same cards with nothing to edit, and a piece added later reads the same mode.
import { createContext, useContext, type ReactNode } from "react";

const Mode = createContext(false);

export function ReadOnly({ children }: { children: ReactNode }) {
  return <Mode.Provider value={true}>{children}</Mode.Provider>;
}

/** Whether the piece stands inside `ReadOnly`. */
export const useReadOnly = (): boolean => useContext(Mode);
