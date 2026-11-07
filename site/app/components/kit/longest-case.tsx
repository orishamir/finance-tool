// A block whose content varies by choice (design-system 2.5a, "nothing moves when a number changes"): it holds its longest case at every
// width, so a longer name or another line never moves what stands below it. A height written by hand holds at one width only, and
// `useHeldHeight` moves once, the first time the long case comes up. Every case is laid out, unseen, in the same cell as what is shown.
import { createContext, useContext, type ReactNode } from "react";
import { cx } from "./cx";

const UnseenCtx = createContext(false);
/** Inside a case laid out unseen: a figure there is not on the page (the legend counts only what is shown). */
export const useUnseen = () => useContext(UnseenCtx);

/** What is laid out unseen to hold a height (a row's other states, PickList `cases`): a figure inside is not on the page. */
export function Unseen({ children }: { children: ReactNode }) {
  return <UnseenCtx.Provider value={true}>{children}</UnseenCtx.Provider>;
}

export function LongestCase({ cases, children, className }: { /** What the block can hold, laid out unseen: a sample figure may stand in for a figure that changes. */ cases: ReactNode[]; children: ReactNode; className?: string }) {
  return (
    <div className={cx("grid *:[grid-area:1/1] *:min-w-0", className)}>
      {cases.map((x, i) => (
        <div key={i} aria-hidden="true" className="invisible">
          <UnseenCtx.Provider value={true}>{x}</UnseenCtx.Provider>
        </div>
      ))}
      <div>{children}</div>
    </div>
  );
}
