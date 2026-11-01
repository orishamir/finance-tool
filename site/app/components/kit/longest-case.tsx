// A block whose content varies by choice (design-system 2.5a, "nothing moves when a number changes"): it holds its longest case at every
// width, so a longer name or another line never moves what stands below it. A height written by hand holds at one width only, and
// `useHeldHeight` moves once, the first time the long case comes up. Every case is laid out, unseen, in the same cell as what is shown.
import type { ReactNode } from "react";
import { cx } from "./cx";

export function LongestCase({ cases, children, className }: { /** What the block can hold, laid out unseen: a sample figure may stand in for a figure that changes. */ cases: ReactNode[]; children: ReactNode; className?: string }) {
  return (
    <div className={cx("grid *:[grid-area:1/1] *:min-w-0", className)}>
      {cases.map((x, i) => (
        <div key={i} aria-hidden="true" className="invisible">
          {x}
        </div>
      ))}
      <div>{children}</div>
    </div>
  );
}
