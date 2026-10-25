// The card surface and the section that holds a heading, a lead and a body (design-system 3.9).
import { useId, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { cx } from "./cx";

/** Padding of a card: `default` for a card on its own, `snug` for a row inside a list, `roomy` for the headline card of a page, `aside` for a side panel, `tight` for a small card, `none` when the body brings its own. */
export type CardPad = "default" | "snug" | "roomy" | "aside" | "tight" | "none";
const PAD: Record<CardPad, string> = { default: "p-4 md:p-6", snug: "p-4 md:p-5", roomy: "p-5 lg:p-6", aside: "p-5", tight: "p-4", none: "" };

type CardProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: ReactNode;
  as?: "div" | "section" | "li" | "article" | "aside" | "ul" | "header";
  pad?: CardPad;
  ref?: Ref<HTMLElement>;
};

/** The one raised surface: a card, a list row, a side panel. Add `flex flex-col gap-*` through `className` for the inside; choose the padding with `pad`, never with a `p-*` class. */
export function Card({ children, className, as = "div", pad = "default", ...rest }: CardProps) {
  const As = as as ElementType;
  return (
    <As className={cx("bg-card border border-border rounded-lg", PAD[pad], className)} {...rest}>
      {children}
    </As>
  );
}

/** Heading sizes: `page` for a section of a page, `card` for the title of a card, `form` for a card of a form. */
export type SectionLevel = "page" | "card" | "form";
const HEADING: Record<SectionLevel, string> = { page: "text-xl lg:text-2xl font-semibold", card: "text-lg font-semibold", form: "text-xl font-semibold" };

/**
 * A heading with an optional lead and an optional action at the end of its row, then the body. Give `id` to make it a target of the
 * section index and of in-page links (it then carries the scroll margin under the sticky header).
 */
export function Section({ id, title, lead, level = "page", action, children, className, as = "section" }: { id?: string; title: ReactNode; lead?: ReactNode; level?: SectionLevel; action?: ReactNode; children?: ReactNode; className?: string; as?: "section" | "div" }) {
  const uid = useId();
  const headId = id ? `${id}-h` : `${uid}-h`;
  const Wrapper = as as ElementType;
  return (
    <Wrapper id={id} aria-labelledby={headId} className={cx("flex flex-col gap-4", id && "scroll-mt-[112px] lg:scroll-mt-[88px]", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id={headId} className={HEADING[level]}>
          {title}
        </h2>
        {action}
      </div>
      {lead && <p className="text-muted-foreground max-w-measure">{lead}</p>}
      {children}
    </Wrapper>
  );
}
