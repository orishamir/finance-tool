// The fees the reading leaves out (lib/fee-deal/left-out.ts), as notes in the panel each stands on: each on a line with why, its name
// opening its card. Where no panel stands (no fee is read), the same lines stand as a plain list, after the sentence that none is read.
import { feeDeal as copy } from "../../copy";
import type { BanSaid } from "../../lib/fee-deal/kinds";
import type { FeeRef } from "../../lib/fee-deal/deal-read";
import { leavesOut, type LeftOut } from "../../lib/fee-deal/left-out";
import { cx } from "../kit";
import { FeeOpen, markedLine, useFeeMark, useLineOpen } from "./links";
import { UnreadWords, refName } from "./words";

/** The id of the reading's section under the columns. */
export const READING_ID = "deal-reading";

/**
 * A fee not read: a price of it not given yet; no case of it for what the reading is read for (F-114), which the line says (`unmatched`),
 * or a case whose sums are in a currency the deal does not know (`noCurrency`) or printed for other currencies only (`notPrinted`); or
 * banned by law here, which the line says with its rules (`banned`).
 */
function LeftLine({ fee, unmatched, noCurrency, notPrinted, banned }: { fee: FeeRef; unmatched?: boolean; noCurrency?: boolean; notPrinted?: boolean; banned?: BanSaid }) {
  const { marked, handlers } = useFeeMark(fee.fee);
  const onClick = useLineOpen(fee.fee);
  return (
    <li className={cx("flex flex-wrap items-baseline gap-x-1", markedLine(marked), onClick && "cursor-pointer")} {...handlers} onClick={onClick} data-left-out={fee.fee}>
      <FeeOpen fee={fee} after={copy.price.sep} />
      <span>
        <UnreadWords banned={banned} noCurrency={noCurrency} notPrinted={notPrinted} unmatched={unmatched} fee={refName(fee)} />
      </span>
    </li>
  );
}

/** The fees a panel leaves out, as lines of its notes list (`<li>`s); nothing where it leaves none out. */
export function LeftOutNotes({ left }: { left: LeftOut | undefined }) {
  if (!left || !leavesOut(left)) return null;
  return (
    <>
      {left.unpriced.map((f) => (
        <LeftLine key={f.fee} fee={f} />
      ))}
      {left.unmatched.map((f) => (
        <LeftLine key={f.fee} fee={f} unmatched noCurrency={!!f.noCurrency} notPrinted={!!f.notPrinted} />
      ))}
      {left.banned.map((f) => (
        <LeftLine key={f.fee} fee={f} banned={f.ban} />
      ))}
      {left.unread.length > 0 && (
        <li>
          {copy.leftOut.unread}
          {left.unread.map((f) => refName(f)).join(", ")}
        </li>
      )}
    </>
  );
}

/** Where no panel stands: that no fee is read yet (`empty`), and the fees left out as a plain list; nothing where neither is so. */
export function LeftOutList({ left, empty }: { left: LeftOut; empty?: boolean }) {
  if (!leavesOut(left) && !empty) return null;
  const lines = left.unpriced.length + left.unmatched.length + left.banned.length > 0;
  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
      {empty && !lines && <p>{copy.leftOut.noneRead}</p>}
      <ul className="flex flex-col gap-1">
        <LeftOutNotes left={left} />
      </ul>
    </div>
  );
}
