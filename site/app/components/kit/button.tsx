// Buttons (design-system 3.9). Role tokens only.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "./cx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "quiet" | "destructive" | "icon" | "inline";
  /** `quiet` and `destructive` only: no side padding, so the words line up with the text above and below them (a text action at a line's start). */
  flush?: boolean;
  /**
   * `sm`: on `quiet` and `destructive`, 13 px words with no height of their own and a 44 px tap area, for a text action inside a line of
   * small text; on `icon`, a 36 px round button in the muted ink, its tap area still 44 px, for one that floats over content (a sheet's
   * back and close). `compact`: on `quiet`, a text action among chips (the rules page's examples): 44 px high on a phone, where the chips
   * may stand in a strip that scrolls sideways and would cut a tap area off, and from `lg` 28 px high with a 44 px tap area. On `ghost`,
   * an icon alone in a 36 px round face with a 44 px tap area (its words in `aria-label`).
   */
  size?: "sm" | "compact";
  /** The room between an icon and the words: `sm` 6 px (a back arrow before its word, a copy mark); 8 px otherwise. */
  gap?: "sm";
  children: ReactNode;
};

/**
 * An action. `primary` once per screen, `secondary` for the rest, `quiet` for a text-style action, `destructive` for a quiet one that
 * deletes, `icon` for a 44 px icon-only button. `outline`: a bordered button on the card's own surface, the face `MenuPicker` has, for an
 * action that stands beside such a picker in a bar (the fee page's "קישור לעסקה"); `ghost`: a quiet action that takes something away and
 * can be undone at once, in the muted ink with no edge, the danger colour only under the pointer or the focus (a fee's "להסיר את העמלה",
 * its bin and its words). `inline`: an action inside a sentence, around words that may wrap with it (a name that
 * picks a pair, the way back from a choice that changed something else): underlined in the link colour, on the sentence's lines, its
 * 44 px target a layer reaching 12 px above and below the words, so it takes no more height than they do (a layer, not a margin pulled
 * in: a way back wrapped onto two lines in a narrow cell was drawn over the note, 390 px). A disabled text action reads in the muted ink.
 */
export function Button({ variant = "secondary", flush, size, gap, className, children, type = "button", ...rest }: ButtonProps) {
  if (variant === "inline")
    return (
      <button type={type} className={cx("relative rounded-md text-start text-link underline underline-offset-[3px] hover:no-underline transition-colors duration-[var(--duration-fast)] before:absolute before:inset-x-0 before:-inset-y-3", className)} {...rest}>
        {children}
      </button>
    );
  const side = flush ? "px-0" : "px-2";
  // a text action's height: the 44 px target, in a line of small text the line's own height with the target as its tap area, or among chips the target on a phone and a low button with a tap area from lg
  const textHeight = { sm: "text-xs tap-area", compact: "min-h-target lg:min-h-7 lg:tap-area", none: "min-h-target" }[size === "sm" || size === "compact" ? size : "none"];
  // a disabled text action is muted and not underlined under the pointer
  const textAction = "enabled:hover:underline disabled:text-muted-foreground";
  const styles = {
    primary: "bg-primary text-primary-foreground font-medium h-field px-5 rounded-md hover:brightness-110",
    secondary: "bg-secondary text-secondary-foreground font-medium h-field lg:h-10 lg:tap-area px-5 rounded-md hover:bg-accent",
    outline: "min-h-target px-4 rounded-md border border-input bg-card text-foreground hover:bg-accent",
    ghost: cx(
      "text-muted-foreground hover:bg-accent hover:text-destructive focus-visible:text-destructive",
      size === "sm" ? "size-9 tap-area rounded-full" : cx("min-h-target rounded-md", side),
    ),
    quiet: cx("text-link rounded-md", textAction, textHeight, side),
    // A quiet button that deletes. Its own variant: `text-destructive` added to `quiet` lost to `text-link` in the stylesheet.
    destructive: cx("text-destructive rounded-md", textAction, textHeight, side),
    icon: size === "sm"
      ? "size-9 tap-area inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
      : "size-target inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent",
  }[variant];
  return (
    <button type={type} className={cx("inline-flex items-center justify-center transition-colors duration-[var(--duration-fast)]", gap === "sm" ? "gap-1.5" : "gap-2", styles, className)} {...rest}>
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
