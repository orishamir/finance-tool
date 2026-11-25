// What a house's documents hold that its price leaves out (D106, lib/left-out), in two shapes. A line under the house's price whose words
// open it: a sheet (each thing that can change what some reader pays, its reason and the price list at its page; then the rest by name),
// or, where the host has its own view of the house's terms, that view. And a fold inside that view, one line while folded: opened, each
// thing that can change the price with its reason and document, two side by side where the fold is wide, and the rest by name in a
// second fold. Nothing on hover alone.
import type { ReactNode } from "react";
import { leftOut as c } from "../../copy";
import { sheetOf, type LeftOutView } from "../../lib/left-out";
import { IconAlert } from "../icons";
import { Term } from "../provenance";
import { cx } from "./cx";
import { Disclosure } from "./disclosure";
import { DocLink } from "./doc-link";

/** The line's tappable words: how many things can change the price, or, where the record marks none, how many it leaves out. */
const countWords = (view: LeftOutView): string => (view.changes.length > 0 ? c.canChange(view.changes.length) : c.some(view.others.length));

/**
 * "לא נכלל במחיר: 2 דברים שיכולים לשנות אותו" (or, where the record marks nothing so, "7 דברים מהמסמכים"); `more`, after a dot, is another
 * thing the price leaves out (the deal's lines a price list did not fill). Its words open the sheet. Null with nothing left out.
 */
export function LeftOutLine({ view, house, more, className }: { view: LeftOutView | null; house: string; more?: ReactNode; className?: string }) {
  if (!view && !more) return null;
  return (
    // the words wrap as the line does: a term keeps itself on one line elsewhere
    <p className={cx("text-xs text-muted-foreground [&_.term]:whitespace-normal", className)} data-left-out={view?.changes.length ?? 0}>
      {c.lead}{" "}
      {view && (
        <Term id={[]} name={c.title(house)} {...sheetOf(view)}>
          {countWords(view)}
        </Term>
      )}
      {view && more && " · "}
      {more}
    </p>
  );
}

/** The things not counted in the price, by their names, one under the other. */
function Names({ names }: { names: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-1 pb-3 text-sm text-muted-foreground">
      {/* the record's order, which never changes while it is shown: a place is a stable key, where two things may share a name */}
      {names.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/**
 * The fold of what the price leaves out, in a view of the house's terms: one line while folded, in the caution colour with its alert mark
 * where something can change what some reader pays, plain grey where nothing can. Opened, each such thing under its short name, with its
 * reason and its document, two side by side where the fold is 40 rem wide or more; then the rest by name, folded again ("עוד 8 דברים
 * שבמסמכים ולא בחישוב"), or, where nothing can change the price, listed at once. `defaultOpen`: it opens open (the gallery shows it so).
 */
export function LeftOutFold({ view, defaultOpen }: { view: LeftOutView; defaultOpen?: boolean }) {
  const warn = view.changes.length > 0;
  return (
    <Disclosure
      spread
      {...(defaultOpen ? { defaultOpen } : {})}
      className={cx("@container rounded-lg border px-3", warn ? "border-caution-border" : "border-border")}
      label={
        <span className={cx("flex items-start gap-2 text-sm", !warn && "text-muted-foreground")}>
          {warn && <IconAlert size={16} className="mt-1 shrink-0 text-caution" />}
          <span>
            {c.lead} {countWords(view)}
          </span>
        </span>
      }
    >
      {warn && (
        <ul className="grid gap-x-6 gap-y-4 pb-3 @[40rem]:grid-cols-2">
          {/* by place, as the names are (`Names`) */}
          {view.changes.map((ch, k) => (
            <li key={k} className="flex min-w-0 flex-col gap-1 border-s-2 border-caution ps-3 text-sm">
              <h3 className="font-semibold">{ch.head}</h3>
              {ch.lines.map((l, j) => (
                <div key={j} className="flex flex-col items-start gap-1">
                  <p className="text-muted-foreground">{l.text}</p>
                  {l.doc && (
                    <DocLink look="inline" href={l.doc.href}>
                      {l.doc.title}
                    </DocLink>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
      {view.others.length > 0 &&
        (warn ? (
          <Disclosure spread className="border-t border-border" summaryClassName="text-sm" label={c.otherCount(view.others.length)}>
            <Names names={view.others} />
          </Disclosure>
        ) : (
          <Names names={view.others} />
        ))}
    </Disclosure>
  );
}
