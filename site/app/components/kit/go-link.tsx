// Links within the site. `GoLink` sends the reader on at the end of a part ("השוואה לפיקדונות בבנקים אחרים ←", "קרן השתלמות בכל
// החברות ←"): its words in the link colour and an arrow after them, held to the last word (the designer's mocks, 2026-11-10). `TextLink`
// is every other link to a page of the site, underlined under the pointer: in the link colour, or in the muted ink or the text's own
// colour where the words around it set the ink (a breadcrumb, a name that opens its page).
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
  inline: "",
  line: "inline-flex w-fit items-center gap-1 min-h-target",
} as const;

/**
 * The ink. `link`: the link colour. `muted`: the muted ink of the line it stands in (a breadcrumb, a house's name among muted words).
 * `plain`: the text's own colour and weight, for a name that is itself the link to its page (a track's name in a list, a product's in a
 * table): the row says it is a link by its place and its underline under the pointer.
 */
const TONE = {
  link: "text-link",
  muted: "text-muted-foreground",
  plain: "",
} as const;

/** A link to a page of the site. Its words take the size of the text around it; `className` places it (`shrink-0`, `self-center`) or sets a name's weight, never restyles it. */
export function TextLink({ look = "inline", tone = "link", className, children, ...rest }: Omit<ComponentProps<typeof Link>, "className" | "children"> & { look?: keyof typeof LOOK; tone?: keyof typeof TONE; className?: string; children: ReactNode }) {
  return (
    <Link className={cx(LOOK[look], TONE[tone], "hover:underline", className)} {...rest}>
      {children}
    </Link>
  );
}
