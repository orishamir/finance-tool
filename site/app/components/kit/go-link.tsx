// Links within the site. `GoLink` sends the reader on at the end of a part ("השוואה לפיקדונות בבנקים אחרים ←", "קרן השתלמות בכל
// החברות ←"): its words in the link colour and an arrow after them, held to the last word (the designer's mocks, 2026-11-10). `TextLink`
// is every other link to a page of the site, in one look: the link colour, underlined under the pointer.
import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router";
import { IconArrowForward } from "../icons";
import { cx } from "./cx";

export function GoLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={cx("inline-flex items-center gap-1.5 min-h-target text-sm font-medium text-link hover:underline", className)}>
      <span>{children}</span>
      <IconArrowForward size={16} aria-hidden="true" className="shrink-0" />
    </Link>
  );
}

/**
 * `inline`: words in running text, at the text's size and on its lines (no tap area of its own: it would cover the lines above and below).
 * `line`: a link on a line of its own, or among controls: a 44 px target as wide as its words, its words and an icon centred in it.
 */
const LOOK = {
  inline: "text-link hover:underline",
  line: "inline-flex w-fit items-center gap-1 min-h-target text-link hover:underline",
} as const;

/** A link to a page of the site. Its words take the size of the text around it; `className` places it (`shrink-0`, `self-center`), never restyles it. */
export function TextLink({ look = "inline", className, children, ...rest }: Omit<ComponentProps<typeof Link>, "className" | "children"> & { look?: keyof typeof LOOK; className?: string; children: ReactNode }) {
  return (
    <Link className={cx(LOOK[look], className)} {...rest}>
      {children}
    </Link>
  );
}
