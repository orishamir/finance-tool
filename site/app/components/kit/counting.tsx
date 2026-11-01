// Which figures count to a new value on their own (founder, 2026-11-01). The page frame turns it on, so every computed amount or percent counts;
// what the person typed and a sourced fact change at once, and a reading under the pointer turns it off, since it must answer the hand.
import { createContext, useContext, type ReactNode } from "react";

const Ctx = createContext(false);

export const useCounting = () => useContext(Ctx);

export function CountingFigures({ on = true, children }: { on?: boolean; children: ReactNode }) {
  return <Ctx.Provider value={on}>{children}</Ctx.Provider>;
}

/** Whether a figure of this state and unit counts when it is inside `CountingFigures`. */
export const countsByItself = (state: string, unit: string) => state === "computed" && /^(nis|pct)/.test(unit);
