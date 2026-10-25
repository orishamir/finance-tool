// A sentence that carries numbers and links (the 2026-10-25 what-if bug). Plain inline text: no layout prop exists, so it cannot be
// turned into a flex or grid container whose children (each text piece, each Num) would become separate lines.
import { Fragment, type ReactNode } from "react";
import { cx } from "./cx";

const SIZE = { xs: "text-xs", sm: "text-sm", base: "", lg: "text-lg" } as const;
const TONE = { default: "", muted: "text-muted-foreground", entered: "text-entered", strong: "font-medium" } as const;

/** Splits a copy string at its `{name}` places and fills them with nodes (a Num, a link, a bdi): the strings stay whole, as copy.md writes them. */
function fillTemplate(t: string, vars: Record<string, ReactNode>): ReactNode {
  return t.split(/\{(\w+)\}/).map((p, i) => (i % 2 === 1 ? <Fragment key={i}>{vars[p] ?? `{${p}}`}</Fragment> : p === "" ? null : <Fragment key={i}>{p}</Fragment>));
}

/** Text with numbers inside it: give it the pieces as children (`before <Num/> after`) or a copy string `t` with `{name}` places and their `vars`. Never put it in a flex row; put it next to other things instead. */
export function Sentence({ children, t, vars, as = "p", size = "base", tone = "default", measure }: { children?: ReactNode; t?: string; vars?: Record<string, ReactNode>; as?: "p" | "span" | "div"; size?: keyof typeof SIZE; tone?: keyof typeof TONE; /** Cap the line length at 38 rem. */ measure?: boolean }) {
  const Tag = as;
  return <Tag className={cx(SIZE[size], TONE[tone], measure && "max-w-measure") || undefined}>{t !== undefined ? fillTemplate(t, vars ?? {}) : children}</Tag>;
}

/** The same fill as `Sentence` for a place that needs a node, not a block: one span. */
export function Tpl({ t, vars }: { t: string; vars: Record<string, ReactNode> }) {
  return <span>{fillTemplate(t, vars)}</span>;
}

/** The same fill for text only. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
