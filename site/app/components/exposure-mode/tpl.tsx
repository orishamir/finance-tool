// A copy string with `{name}` places filled by React nodes (a Num, a link, a bdi): the strings stay whole, as copy.md writes them.
import { Fragment, type ReactNode } from "react";

export function Tpl({ t, vars }: { t: string; vars: Record<string, ReactNode> }) {
  const parts = t.split(/\{(\w+)\}/);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <Fragment key={i}>{vars[p] ?? `{${p}}`}</Fragment> : p === "" ? null : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/** The same fill for text only. */
export function fill(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
