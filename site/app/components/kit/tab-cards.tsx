// Tabs drawn as cards in a row (the index page's "לפני שמחליטים"): each card a question, its answer in a few words and one line under it,
// one panel open under the row. The whole card is the tab (choose by tapping the option itself), a button with plain words inside: the
// tab list holds only tabs, so an answer's figure is plain text here, and its sheet opens from the same figure in the panel. The open card
// has the action colour's border, the raised fill and its question in the action colour, and a mark that is no colour: a pointer on its
// bottom edge toward the panel where the cards stand in one row (from 1024 px), and a word below that, where they stand over one another.
// The keys are TabStrip's: the arrows move between tabs, Home and End to the ends. The row is one column on a phone, two on a tablet and
// the cards side by side, equal widths, from 1024 px. The chart and layout checks find the row by `data-tab-cards` and open each tab,
// since a closed tab's panel is not in the page.
import { useId, type ReactNode } from "react";
import { cx } from "./cx";
import { panelId, tabId, tabKeys } from "./tab-strip";

export interface TabCard {
  key: string;
  /** The question the card's panel answers. */
  question: string;
  /** The answer in a few words, as plain text: no control inside a tab. */
  answer: ReactNode;
  /** One line under the answer: what the answer rests on. */
  note?: ReactNode;
}

export function TabCards({ tabs, current, onChange, ariaLabel, idBase, openWord, children }: { tabs: TabCard[]; current: string; onChange: (key: string) => void; ariaLabel: string; idBase: string; /** On the open card below 1024 px, where no pointer joins it to the panel ("פתוח למטה"). */ openWord: string; /** The open tab's panel. */ children: ReactNode }) {
  const uid = useId();
  const keys = tabKeys(tabs, current, onChange, idBase);
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={ariaLabel} data-tab-cards className="grid gap-3 md:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none">
        {tabs.map((t) => {
          const on = t.key === current;
          const words = `${uid}-${t.key}`;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={tabId(idBase, t.key)}
              aria-selected={on}
              aria-controls={panelId(idBase)}
              aria-labelledby={`${words}-q ${words}-a`}
              {...(t.note !== undefined ? { "aria-describedby": `${words}-n` } : {})}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(t.key)}
              onKeyDown={keys}
              className={cx(
                "relative flex min-w-0 flex-col gap-1 rounded-lg border px-4 py-3.5 text-start transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring",
                on ? "border-primary bg-popover" : "cursor-pointer border-border bg-card hover:bg-accent/60",
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span id={`${words}-q`} className={cx("text-xs", on ? "text-primary" : "text-muted-foreground")}>
                  {t.question}
                </span>
                {on && <span className="shrink-0 text-xs font-medium text-primary lg:hidden">{openWord}</span>}
              </span>
              <span id={`${words}-a`} className="text-xl font-semibold leading-snug">
                {t.answer}
              </span>
              {t.note !== undefined && (
                <span id={`${words}-n`} className="text-xs text-muted-foreground">
                  {t.note}
                </span>
              )}
              {/* the pointer toward the panel, where the cards stand in one row: a square turned to stand on the corner its clip keeps */}
              {on && <span aria-hidden="true" className="absolute -bottom-[7px] start-1/2 translate-x-1/2 hidden size-3 rotate-45 border border-primary bg-popover [clip-path:polygon(100%_0,100%_100%,0_100%)] lg:block" />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId(idBase)} aria-labelledby={tabId(idBase, current)}>
        {children}
      </div>
    </div>
  );
}

/**
 * How every panel under the cards opens: a small line naming the analysis in the action colour, then its conclusion as the headline.
 * `end`: a control at the end of the small line's row (a chart card's switch between periods), which wraps under it where the row is short.
 */
export function PanelHead({ kicker, end, children }: { kicker: ReactNode; end?: ReactNode; /** The conclusion. */ children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {end ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-sm text-primary">{kicker}</p>
          <div className="ms-auto">{end}</div>
        </div>
      ) : (
        <p className="text-sm text-primary">{kicker}</p>
      )}
      <h3 className="text-xl font-semibold leading-snug">{children}</h3>
    </div>
  );
}
