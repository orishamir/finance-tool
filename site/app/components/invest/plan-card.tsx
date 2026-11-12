// The index page's plan card, first in the side rail (D26): the four plan numbers one under the other, and one line under them with what
// the return is, the inflation and, on a foreign index, the dollar rate the page runs on, ending in the button that opens the assumptions
// (where the inflation is changed, and where the rest of what the results rest on is said).
import type { ReactNode } from "react";
import { invest as c } from "../../copy";
import { nisPer, type FxSnapshot } from "../../lib/fx";
import type { SiteValue } from "../../lib/value";
import { LeadTail, Num } from "../provenance";
import { Button, Card, HelpMark, LongestCase, Tag } from "../kit";

/**
 * `example`: no number entered yet, so every one is the site's example. `dollar`: an index priced in shekels reads no exchange rate, so the
 * line shows none. The line is held at its longest case (the site's example, and the dollar, named), so entering a first number or
 * moving to another index never moves the rail under it.
 */
export function PlanCard({ knobs, onOpen, fx, today, example, dollar, inflation, returnHelp }: {
  knobs: ReactNode;
  onOpen: () => void;
  fx: FxSnapshot | undefined;
  today: string;
  example: boolean;
  dollar: boolean;
  /** The inflation the page runs on, a figure with its own sheet (its source, or entered). */
  inflation: SiteValue;
  /** What the return is and whether the lists' order holds at another (`returnHelpOf`): the "?" beside the return. */
  returnHelp?: string;
}) {
  const usd = fx ? nisPer(fx, "USD", today) : null;
  const line = (ex: boolean, withDollar = dollar) => (
    <p className="text-xs text-muted-foreground">
      {ex && <>{c.plan.siteExample} · </>}
      {/* the "?" held to the last word before it, so it never stands on a line of its own */}
      {returnHelp ? (
        <LeadTail lead={c.plan.knobs.retBefore}>
          <HelpMark about={c.foot.returnAbout} text={returnHelp} />
        </LeadTail>
      ) : (
        c.plan.knobs.retBefore
      )}
      {" · "}
      {c.plan.knobs.others} <Num value={inflation} /> {c.plan.knobs.perYear}
      {withDollar &&
        (usd ? (
          <>
            {" · "}
            {c.plan.dollar} <Num value={usd} exact />
          </>
        ) : (
          <>
            {" · "}
            <Tag tone="caution">{c.plan.dollarMissing}</Tag>
          </>
        ))}
      {" · "}
      <Button variant="quiet" flush size="sm" className="align-baseline" onClick={onOpen}>
        {c.plan.panelTitle}
      </Button>
    </p>
  );
  return (
    <Card as="section" pad="tight" className="flex flex-col gap-3" aria-label={c.plan.heading}>
      <h2 className="text-lg font-semibold">{c.plan.heading}</h2>
      {knobs}
      <div className="border-t border-border pt-3">
        <LongestCase className="min-w-0" cases={[line(true, true)]}>
          {line(example)}
        </LongestCase>
      </div>
    </Card>
  );
}
