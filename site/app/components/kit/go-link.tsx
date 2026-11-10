// A link within the site that sends the reader on, at the end of a part ("השוואה לפיקדונות בבנקים אחרים ←", "קרן השתלמות בכל החברות ←"):
// its words in the link colour and an arrow after them, held to the last word (the designer's mocks, 2026-11-10).
import type { ReactNode } from "react";
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
