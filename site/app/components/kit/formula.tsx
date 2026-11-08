// A formula in math type, with a key to its symbols: a formula's sheet shows the math docs/method.md writes for it, in place of a link
// to the document (founder, 2026-11-08). KaTeX and its stylesheet load the first time a formula shows, not with every page; once loaded,
// a formula draws in its first render, so a sheet opened again does not shift. Drawn only, with no hidden MathML copy for screen readers
// (founder, 2026-11-08: "disable special cases we have for screen readers").
import { useEffect, useState } from "react";
import { cx } from "./cx";

type Katex = typeof import("katex").default;
let katex: Katex | undefined;
let loading: Promise<Katex> | undefined;
const loadKatex = () => (loading ??= Promise.all([import("katex"), import("katex/dist/katex.min.css")]).then(([m]) => (katex = m.default)));
const drawn = new Map<string, string>();
const draw = (k: Katex, tex: string, display: boolean) => {
  const key = `${display ? "D" : "I"}${tex}`;
  let html = drawn.get(key);
  if (html === undefined) drawn.set(key, (html = k.renderToString(tex, { displayMode: display, throwOnError: false, output: "html" })));
  return html;
};

/** TeX in math type: `display` for a formula on its own lines, centred; inline for a symbol. Always left to right, isolated from the Hebrew around it. */
export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const [html, setHtml] = useState(() => (katex ? draw(katex, tex, display) : null));
  useEffect(() => {
    let live = true;
    if (katex) setHtml(draw(katex, tex, display));
    else void loadKatex().then((k) => live && setHtml(draw(k, tex, display)));
    return () => {
      live = false;
    };
  }, [tex, display]);
  const Tag = display ? "div" : "span";
  // Until KaTeX is in, the place is held: a display formula by about one fraction's height, a symbol by its letters in plain type.
  if (html === null) return <Tag dir="ltr" className={cx(display ? "min-h-14" : "opacity-0", className)}>{display ? null : tex.replace(/\\text|[\\{}]/g, "")}</Tag>;
  return <Tag dir="ltr" className={cx(display ? "tex-display overflow-x-auto overflow-y-hidden text-lg" : "inline-block", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * A formula and what its symbols stand for: each line in math type (with its name when there are several), then `where` and a two-column
 * key, the symbol on the start side and its words beside it.
 */
export function FormulaBlock({ lines, symbols, where }: { lines: readonly { tex: string; label?: string }[]; symbols: readonly (readonly [tex: string, words: string])[]; where: string }) {
  return (
    <div className="flex flex-col gap-3">
      {lines.map((l) => (
        <div key={l.tex} className="flex flex-col gap-1">
          {l.label && <span className="text-sm text-muted-foreground">{l.label}</span>}
          <Tex tex={l.tex} display />
        </div>
      ))}
      {symbols.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{where}</span>
          <dl className="grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-1.5 text-sm">
            {symbols.map(([tex, words]) => (
              <div key={tex} className="contents">
                <dt>
                  <Tex tex={tex} />
                </dt>
                <dd className="min-w-0">{words}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
