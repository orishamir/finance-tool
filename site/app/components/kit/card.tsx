// The card surface and the section that holds a heading, a lead and a body (design-system 3.9).
import { useId, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { cx } from "./cx";

/** Padding of a card: `default` for a card on its own, `snug` for a row inside a list, `roomy` for the headline card of a page, `aside` for a side panel, `tight` for a small card, `none` when the body brings its own. */
export type CardPad = "default" | "snug" | "roomy" | "aside" | "tight" | "none";
/** The padding classes of each `CardPad`, shared with the other raised pieces that take Card's choices (`PickCard`). */
export const CARD_PAD: Record<CardPad, string> = { default: "p-4 md:p-6", snug: "p-4 md:p-5", roomy: "p-5 lg:p-6", aside: "p-5", tight: "p-4", none: "" };

type CardProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  as?: "div" | "section" | "li" | "article" | "aside" | "ul" | "header";
  pad?: CardPad;
  /** `accent`: a 2 px border in the action colour, for the one card a list leads with (a search's closest match). `info`: a thin frame in
   *  the info colour, for a note that stands beside the page's own matter, not in it (the guide's note on other countries). */
  edge?: "accent" | "info";
  ref?: Ref<HTMLElement>;
};

/** The one raised surface: a card, a list row, a side panel. Add `flex flex-col gap-*` through `className` for the inside; choose the padding with `pad`, never with a `p-*` class. */
export function Card({ children, className, as = "div", pad = "default", edge, ...rest }: CardProps) {
  const As = as as ElementType;
  return (
    <As className={cx("bg-card", edge === "accent" ? "border-2 border-primary" : edge === "info" ? "border border-info-border" : "border border-border", "rounded-lg", CARD_PAD[pad], className)} {...rest}>
      {children}
    </As>
  );
}

/**
 * Heading sizes: `page` for a section of a page, `card` for the title of a card, `form` for a card of a form, `kick` for the small name in
 * the action colour over a column of a tool, whose parts carry their own headings under it (the fee page's fees and toolbox).
 */
export type SectionLevel = "page" | "card" | "form" | "kick";
const HEADING: Record<SectionLevel, string> = { page: "text-xl lg:text-2xl font-semibold", card: "text-lg font-semibold", form: "text-xl font-semibold", kick: "text-sm font-medium text-primary" };

/** The room between a section's parts (its heading, its lead and each part of its body): `default` 16 px, `snug` 12 px, `tight` 8 px. */
export type SectionGap = "default" | "snug" | "tight";
const GAP: Record<SectionGap, string> = { default: "gap-4", snug: "gap-3", tight: "gap-2" };

/**
 * A heading with an optional lead and an optional action at the end of its row, then the body. Give `id` to make it a target of the
 * section index and of in-page links (it then carries the scroll margin under the sticky header). `headingId` names the heading itself,
 * for a caller that points at it from elsewhere (a sheet titled by it). `under`: lines that belong to the heading (what the heading's
 * company offers, who its members are), 4 px under it, before the section's gap. `gap` is the room between the parts.
 */
export function Section({ id, headingId, title, under, lead, level = "page", action, gap = "default", children, className, as = "section", heading: H = "h2" }: { id?: string; headingId?: string; title: ReactNode; under?: ReactNode; lead?: ReactNode; level?: SectionLevel; action?: ReactNode; gap?: SectionGap; children?: ReactNode; className?: string; as?: "section" | "div"; /** The heading's rank in the page's outline: `h3` for a part inside a section that has its own `h2`. */ heading?: "h2" | "h3" }) {
  const uid = useId();
  const headId = headingId ?? (id ? `${id}-h` : `${uid}-h`);
  const Wrapper = as as ElementType;
  const row = (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
      <H id={headId} className={cx(HEADING[level], "min-w-0")}>
        {title}
      </H>
      {action}
    </div>
  );
  return (
    <Wrapper id={id} aria-labelledby={headId} className={cx("flex flex-col", GAP[gap], id && "anchor-target", className)}>
      {under ? (
        <div className="flex flex-col gap-1">
          {row}
          {under}
        </div>
      ) : (
        row
      )}
      {/* no word alone on the lead's last line (a mark alone on a line) */}
      {lead && <p className="text-muted-foreground max-w-measure text-pretty">{lead}</p>}
      {children}
    </Wrapper>
  );
}
