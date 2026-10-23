// Shared primitives (design-system 3.9, design-spec 1.3): button, tag, callout, disclosure, segmented
// control, card. Styled with role tokens only.
import { useId, useRef, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { IconAlert, IconChevronDown, IconInfo, IconLock } from "./icons";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "icon"; children: ReactNode };

export function Button({ variant = "secondary", className, children, type = "button", ...rest }: ButtonProps) {
  const styles = {
    primary: "bg-primary text-primary-foreground font-medium h-field px-5 rounded-md hover:brightness-110",
    secondary: "bg-secondary text-secondary-foreground font-medium h-field lg:h-10 px-5 rounded-md hover:bg-accent",
    quiet: "text-link min-h-target px-2 rounded-md hover:underline",
    icon: "size-target inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent",
  }[variant];
  return (
    <button type={type} className={cx("inline-flex items-center justify-center gap-2 transition-colors duration-[var(--duration-fast)]", styles, className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({ to, children, className, variant = "secondary" }: { to: string; children: ReactNode; className?: string; variant?: "primary" | "secondary" }) {
  const styles = variant === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent";
  return (
    <Link to={to} className={cx("inline-flex items-center justify-center gap-2 font-medium h-field lg:h-10 px-5 rounded-md", styles, className)}>
      {children}
    </Link>
  );
}

export function Tag({ tone = "neutral", icon, children, className }: { tone?: "neutral" | "computed" | "entered" | "caution" | "blocked" | "positive" | "parameter"; icon?: ReactNode; children: ReactNode; className?: string }) {
  const styles = {
    neutral: "bg-muted text-foreground",
    parameter: "bg-secondary text-foreground",
    computed: "bg-computed-subtle text-computed",
    entered: "bg-entered-subtle text-entered",
    caution: "bg-caution-subtle text-caution-foreground",
    blocked: "bg-blocked-subtle text-blocked-foreground",
    positive: "bg-positive-subtle text-positive-foreground",
  }[tone];
  return (
    <span className={cx("inline-flex items-center gap-1 text-xs font-medium rounded-sm px-1.5 py-px whitespace-nowrap align-middle", styles, className)}>
      {icon}
      {children}
    </span>
  );
}

export function Callout({ tone, title, children, className }: { tone: "caution" | "blocked" | "info"; title?: ReactNode; children: ReactNode; className?: string }) {
  const styles = {
    caution: "bg-caution-subtle text-caution-foreground",
    blocked: "bg-blocked-subtle text-blocked-foreground",
    info: "bg-card text-foreground border border-border",
  }[tone];
  const icon = tone === "caution" ? <IconAlert size={18} className="text-caution shrink-0 mt-0.5" /> : tone === "blocked" ? <IconLock size={18} className="text-blocked shrink-0 mt-0.5" /> : <IconInfo size={18} className="text-primary shrink-0 mt-0.5" />;
  return (
    <div role="note" className={cx("flex gap-2.5 text-sm rounded-md px-3.5 py-3", styles, className)}>
      {icon}
      <div className="flex flex-col gap-1 min-w-0">
        {title && <span className="font-medium">{title}</span>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/** Native details/summary (works before scripts), 44px summary, chevron rotating on open. */
export function Disclosure({ label, openLabel, children, className, defaultOpen, summaryClassName }: { label: ReactNode; openLabel?: ReactNode; children: ReactNode; className?: string; defaultOpen?: boolean; summaryClassName?: string }) {
  return (
    <details className={cx("group", className)} open={defaultOpen}>
      <summary className={cx("flex items-center justify-between gap-3 min-h-target cursor-pointer list-none select-none rounded-md [&::-webkit-details-marker]:hidden", summaryClassName)}>
        <span className="group-open:hidden">{label}</span>
        <span className="hidden group-open:inline">{openLabel ?? label}</span>
        <IconChevronDown className="text-muted-foreground shrink-0 transition-transform duration-[var(--duration-fast)] group-open:rotate-180" />
      </summary>
      {children}
    </details>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** role="group" with aria-pressed buttons; arrow keys move between options (design-spec 1.3). */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className, labelledBy }: { label?: string; options: SegmentOption<T>[]; value: T | null; onChange: (v: T) => void; className?: string; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    const i = Math.max(0, enabled.findIndex((o) => o.value === value));
    const next = e.key === "Home" ? 0 : e.key === "End" ? enabled.length - 1 : e.key === "ArrowLeft" ? (i + 1) % enabled.length : (i - 1 + enabled.length) % enabled.length;
    onChange(enabled[next]!.value);
    ref.current?.querySelectorAll("button")[options.indexOf(enabled[next]!)]?.focus();
  };
  return (
    <div ref={ref} role="group" aria-label={label} aria-labelledby={labelledBy} onKeyDown={onKey} className={cx("inline-flex w-full rounded-md bg-muted p-[3px] gap-[3px]", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
          className={cx(
            "flex-1 min-h-target lg:min-h-10 px-3 rounded-[5px] text-sm transition-colors duration-[var(--duration-fast)] disabled:text-muted-foreground disabled:cursor-not-allowed",
            value === o.value ? "bg-secondary font-medium text-foreground shadow-sm" : "text-foreground hover:bg-accent/60",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className, as: As = "div", ...rest }: { children: ReactNode; className?: string; as?: "div" | "section" | "li" | "article"; id?: string; "aria-labelledby"?: string }) {
  return (
    <As className={cx("bg-card border border-border rounded-lg p-4 md:p-6", className)} {...rest}>
      {children}
    </As>
  );
}

/** A labelled field wrapper used by the values panel and the paste card. */
export function useFieldIds() {
  const id = useId();
  return { input: `${id}-in`, hint: `${id}-hint`, error: `${id}-err`, label: `${id}-label` };
}
