// Buttons (design-system 3.9). Role tokens only.
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "./cx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "destructive" | "icon"; children: ReactNode };

/** An action. `primary` once per screen, `secondary` for the rest, `quiet` for a text-style action, `destructive` for a quiet one that deletes, `icon` for a 44 px icon-only button. */
export function Button({ variant = "secondary", className, children, type = "button", ...rest }: ButtonProps) {
  const styles = {
    primary: "bg-primary text-primary-foreground font-medium h-field px-5 rounded-md hover:brightness-110",
    secondary: "bg-secondary text-secondary-foreground font-medium h-field lg:h-10 px-5 rounded-md hover:bg-accent",
    quiet: "text-link min-h-target px-2 rounded-md hover:underline",
    // A quiet button that deletes. Its own variant: `text-destructive` added to `quiet` lost to `text-link` in the stylesheet (2026-10-24).
    destructive: "text-destructive min-h-target px-2 rounded-md hover:underline",
    icon: "size-target inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent",
  }[variant];
  return (
    <button type={type} className={cx("inline-flex items-center justify-center gap-2 transition-colors duration-[var(--duration-fast)]", styles, className)} {...rest}>
      {children}
    </button>
  );
}

/** A link that looks like a button. Use for navigation; use `Button` for an action. */
export function LinkButton({ to, children, className, variant = "secondary", onClick }: { to: string; children: ReactNode; className?: string; variant?: "primary" | "secondary"; onClick?: () => void }) {
  const styles = variant === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent";
  return (
    <Link to={to} onClick={onClick} className={cx("inline-flex items-center justify-center gap-2 font-medium h-field lg:h-10 px-5 rounded-md", styles, className)}>
      {children}
    </Link>
  );
}
