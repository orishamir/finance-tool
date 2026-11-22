// A page that shows one of several parts at a time, chosen from a list at its start side (the company pages: an overview, then each product).
// `SideNav` is that list: a card of links, each an address (`?product=`), so a link to a part and the back button work; the chosen item has
// a teal wash, teal text and a teal bar at its start edge (the designer's mocks), and may show its own parts under it, behind a thin line at
// their start, as links that jump within it. Items may stand under small group labels, and the whole list under one (`heading`). `SidePage`
// lays the list beside the content from lg at every width, whatever the content needs, the list staying in view while the content scrolls;
// a table wider than the room beside it scrolls sideways inside its own card. Under lg the list folds into one line that says what is shown
// and opens it (`PhoneFold`), closing again once an item is chosen.
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "./cx";
import { PhoneFold } from "./phone-fold";

export interface SideNavItem {
  id: string;
  label: ReactNode;
  /** Muted, at the end of the label's line (how many tracks, deposits). */
  count?: ReactNode;
  /** Where the item goes: the page's address with the part chosen. */
  to: string;
  /** Shown under the item while it is chosen: links to the parts inside it (`#id`). */
  parts?: { id: string; label: ReactNode }[];
}

export interface SideNavGroup {
  key: string;
  /** A small label over the group's items; a group without one stands first, with no label. */
  label?: ReactNode;
  items: SideNavItem[];
}

export function SideNav({ groups, current, ariaLabel, heading, onPick }: { groups: SideNavGroup[]; current: string; ariaLabel: string; /** A small label over the whole list ("בעמוד של הבנק"). */ heading?: ReactNode; /** Called when an item is pressed (the fold closes). */ onPick?: () => void }) {
  return (
    <nav aria-label={ariaLabel} className="rounded-lg border border-border bg-card p-2 overflow-hidden">
      {heading && <p className="px-3 pt-2 pb-1.5 text-xs text-muted-foreground">{heading}</p>}
      {groups.map((g) => (
        <div key={g.key} className="flex flex-col">
          {g.label && <p className="px-3 pt-4 pb-1 text-xs text-muted-foreground">{g.label}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.items.map((it) => {
              const on = it.id === current;
              return (
                <li key={it.id} className="flex flex-col">
                  <Link
                    to={it.to}
                    preventScrollReset
                    replace={false}
                    aria-current={on ? "page" : undefined}
                    onClick={onPick}
                    className={cx("relative min-h-target px-3 py-2.5 rounded-md flex items-baseline gap-3", navLook(on))}
                  >
                    {on && <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] rounded-s-md bg-primary" />}
                    <span className="flex-1 min-w-0 leading-snug">{it.label}</span>
                    {it.count != null && (
                      <bdi dir="ltr" className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                        {it.count}
                      </bdi>
                    )}
                  </Link>
                  {on && it.parts && it.parts.length > 0 && (
                    <ul className="flex flex-col ms-3 my-1 border-s border-border">
                      {it.parts.map((p) => (
                        <li key={p.id}>
                          <a href={`#${p.id}`} onClick={onPick} className="flex items-center min-h-target ps-4 pe-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring rounded-sm">
                            {p.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** The chosen item: a teal wash, teal text and a teal bar at its start edge; the others light on hover. */
const navLook = (on: boolean) => cx("transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2", on ? "bg-primary-subtle text-primary font-medium" : "hover:bg-accent/60");

export function SidePage({ nav, summary, more, less, chosen, children }: { /** The `SideNav`; given a function, it receives what closes the fold. */ nav: (close: () => void) => ReactNode; /** What is shown, in a few words, for the folded line under lg. */ summary: ReactNode; more: string; less: string; /** The chosen part: when it changes, the fold closes. */ chosen: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [chosen]);
  return (
    <div data-side-page="" className="flex flex-col gap-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-8 lg:items-start">
      <div data-side-nav="" className="lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-104px)] lg:overflow-y-auto">
        <PhoneFold summary={summary} more={more} less={less} below="lg" open={open} onOpenChange={setOpen}>
          {nav(() => setOpen(false))}
        </PhoneFold>
      </div>
      {/* a table wider than the room beside the list scrolls sideways inside its own card (kit ProductTable); the page never does */}
      <div data-side-content="" className="min-w-0 flex flex-col gap-8">{children}</div>
    </div>
  );
}
