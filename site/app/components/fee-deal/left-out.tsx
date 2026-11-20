// The fees the reading leaves out, above its panels (lib/fee-deal/left-out.ts): each on a line with why, its name opening its card; and
// where the deal has fees and none is read yet, that sentence alone.
import { feeDeal as copy } from "../../copy";
import type { BanSaid } from "../../lib/fee-deal/kinds";
import type { FeeRef } from "../../lib/fee-deal/deal-read";
import { leavesOut, type LeftOut } from "../../lib/fee-deal/left-out";
import { Card, cx } from "../kit";
import { FeeOpen, markedLine, useFeeMark, useLineOpen } from "./links";
import { UnreadWords, refName } from "./words";

/** The id of the reading's section under the columns. */
export const READING_ID = "deal-reading";

/**
 * A fee not read: a price of it not given yet; no case of it for what the reading is read for (F-114), which the line says (`unmatched`),
 * or a case whose sums are in a currency the deal does not know (`noCurrency`) or printed for other currencies only (`notPrinted`); or
 * banned by law here, which the line says with its rules (`banned`).
 */
function UnpricedLine({ fee, unmatched, noCurrency, notPrinted, banned }: { fee: FeeRef; unmatched?: boolean; noCurrency?: boolean; notPrinted?: boolean; banned?: BanSaid }) {
  const { marked, handlers } = useFeeMark(fee.fee);
  const onClick = useLineOpen(fee.fee);
  return (
    <li className={cx("flex flex-wrap items-baseline gap-x-1", markedLine(marked), onClick && "cursor-pointer")} {...handlers} onClick={onClick} data-left-out={fee.fee}>
      <FeeOpen fee={fee} after={copy.price.sep} />
      <span className="text-muted-foreground">
        <UnreadWords banned={banned} noCurrency={noCurrency} notPrinted={notPrinted} unmatched={unmatched} fee={refName(fee)} />
      </span>
    </li>
  );
}

/** The card, where the reading leaves a fee out or reads none (`empty`); nothing otherwise. `names`: a fee's name by its id. */
export function LeftOutCard({ left, names, empty }: { left: LeftOut; names: (feeId: string) => string; empty?: boolean }) {
  const lines = left.unpriced.length + left.unmatched.length + left.banned.length > 0;
  if (!leavesOut(left) && !empty) return null;
  return (
    <Card pad="tight" className="flex flex-col gap-2 text-sm">
      {empty && !lines && <p className="text-muted-foreground">{copy.leftOut.noneRead}</p>}
      {lines && (
        <ul className="flex flex-col gap-1">
          {left.unpriced.map((f) => (
            <UnpricedLine key={f.fee} fee={f} />
          ))}
          {left.unmatched.map((f) => (
            <UnpricedLine key={f.fee} fee={f} unmatched noCurrency={!!f.noCurrency} notPrinted={!!f.notPrinted} />
          ))}
          {left.banned.map((f) => (
            <UnpricedLine key={f.fee} fee={f} banned={f.ban} />
          ))}
        </ul>
      )}
      {left.unread.length > 0 && (
        <p className="text-muted-foreground">
          {copy.leftOut.unread}
          {left.unread.map(names).join(", ")}
        </p>
      )}
    </Card>
  );
}
