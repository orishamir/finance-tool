// Buttons (design-system 3.9). Role tokens only.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "./cx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "destructive" | "icon";
  /** `quiet` and `destructive` only: no side padding, so the words line up with the text above and below them (a text action at a line's start). */
  flush?: boolean;
  /**
   * `quiet` and `destructive`: 13 px words with no height of their own and a 44 px tap area, for a text action inside a line of small text.
   * `icon`: a 36 px round button in the muted ink, its tap area still 44 px, for one that floats over content (a sheet's back and close).
   */
  size?: "sm";
  children: ReactNode;
};

/** An action. `primary` once per screen, `secondary` for the rest, `quiet` for a text-style action, `destructive` for a quiet one that deletes, `icon` for a 44 px icon-only button. */
export function Button({ variant = "secondary", flush, size, className, children, type = "button", ...rest }: ButtonProps) {
  const side = flush ? "px-0" : "px-2";
  const small = size === "sm";
  // a text action's height: the 44 px target, or in a line of small text the line's own height with the target as its tap area
  const textHeight = small ? "text-xs tap-area" : "min-h-target";
  const styles = {
    primary: "bg-primary text-primary-foreground font-medium h-field px-5 rounded-md hover:brightness-110",
    secondary: "bg-secondary text-secondary-foreground font-medium h-field lg:h-10 lg:tap-area px-5 rounded-md hover:bg-accent",
    quiet: cx("text-link rounded-md hover:underline", textHeight, side),
    // A quiet button that deletes. Its own variant: `text-destructive` added to `quiet` lost to `text-link` in the stylesheet.
    destructive: cx("text-destructive rounded-md hover:underline", textHeight, side),
    icon: small
      ? "size-9 tap-area inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
      : "size-target inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent",
  }[variant];
  return (
    <button type={type} className={cx("inline-flex items-center justify-center gap-2 transition-colors duration-[var(--duration-fast)]", styles, className)} {...rest}>
      {children}
    </button>
  );
}

/**
 * A link that looks like a button. Use for navigation; use `Button` for an action. Its words often carry a name (a house, a product),
 * so they may wrap on a phone: the height is a minimum, one line keeps the field's height and two lines grow the button rather than
 * spill out of it, balanced so no word stands alone on the second (a house's page at 390 px).
 */
export function LinkButton({ to, children, className, variant = "secondary", onClick }: { to: string; children: ReactNode; className?: string; variant?: "primary" | "secondary"; onClick?: () => void }) {
  const styles = variant === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent";
  return (
    <Link to={to} onClick={onClick} className={cx("inline-flex items-center justify-center gap-2 font-medium min-h-field lg:min-h-10 lg:tap-area py-1.5 px-5 rounded-md text-center text-balance", styles, className)}>
      {children}
    </Link>
  );
}
