// A page's head: its title, the lede under it, and what stands above or beside them. Every page's head has the same top padding and
// the same title and lede sizes, so pages read as one site; a section of a page under it is `Section`.
import type { ReactNode } from "react";
import { cx } from "./cx";

export function PageHead({ title, lede, crumb, tabs, marks, aside, pickerHost, rule, children, className }: {
  /** The page's one `h1`. */
  title: ReactNode;
  /** What the page answers, under the title: muted, at body size, no wider than the measure. */
  lede?: ReactNode;
  /** The way back (the shell's `Breadcrumb`), above the title. */
  crumb?: ReactNode;
  /** The page's views (`PageTabs`), above everything else in the head. */
  tabs?: ReactNode;
  /** Tags inside the heading after the title, wrapping with it (a track's "ברירת המחדל"). */
  marks?: ReactNode;
  /** Beside the title, taking the rest of its line and moving under it where the line has no room for 16rem (the rules page's field). */
  aside?: ReactNode;
  /** A title that holds a `MenuPicker`: the list's host, laid right after the heading (the picker's `listHost`); the title's lines make room for the picker's button. */
  pickerHost?: (el: HTMLDivElement | null) => void;
  /** A hairline under the head, where the page's body starts with a part of its own (a company's page). */
  rule?: boolean;
  /** Under the lede: what else belongs to the head (a legend of the number marks, a line of examples, a callout). */
  children?: ReactNode;
  /** Places the head or hides it (`hidden` while a view covers it), never restyles it. */
  className?: string;
}) {
  const beside = given(aside);
  return (
    <header className={cx("flex flex-col gap-5 lg:gap-6 pt-2 lg:pt-8", rule && "pb-5 border-b border-border", className)}>
      {tabs}
      <div className="flex flex-col gap-3">
        {crumb}
        <div className={cx(beside && "flex flex-wrap items-center gap-x-6 gap-y-2", pickerHost && "relative")}>
          <h1 className={cx("text-2xl lg:text-3xl font-semibold", given(marks) && "flex flex-wrap items-center gap-3", pickerHost && "leading-[1.5]")}>
            {title}
            {marks}
          </h1>
          {pickerHost && <div ref={pickerHost} className="absolute inset-x-0 top-0" />}
          {beside && <div className="flex-1 min-w-[16rem] max-w-3xl">{aside}</div>}
        </div>
        {given(lede) && (typeof lede === "string" ? <p className={LEDE}>{lede}</p> : <div className={LEDE}>{lede}</div>)}
        {children}
      </div>
    </header>
  );
}

/** Whether a slot holds anything to draw (a caller passes `cond && <X />`). */
const given = (x: ReactNode): boolean => x !== undefined && x !== null && x !== false && x !== "";

// no word alone on the lede's last line (a mark alone on a line)
const LEDE = "text-muted-foreground max-w-measure text-pretty";
