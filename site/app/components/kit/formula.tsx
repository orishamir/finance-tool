// A formula in math type, with a key to its symbols, and the working of one figure: a formula's sheet shows the math docs/method.md writes
// for it, in place of a link to the document; a figure's sheet shows its own line of math with its values put in, or the lines of a
// difference or a sum. KaTeX and its stylesheet load the first time a formula shows, not with every page; once loaded, a formula draws in
// its first render, so a sheet opened again does not shift. Drawn only, with no hidden MathML copy for screen readers.
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { assertNever } from "@finance-tool/schema";
import { cx } from "./cx";
import { useIsoLayoutEffect } from "../../lib/hooks";

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

/**
 * Marks a box that scrolls sideways with the edges past which more of it lies (`data-more-start`, `data-more-end`), on its scroll and on
 * any change of its size or of what it holds, so the edge fades and says the line goes on.
 */
function useScrollEdges(ref: RefObject<HTMLElement | null>, watch: unknown) {
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      // the box is always left to right (math), so its scroll runs from 0 at its start
      const start = el.scrollLeft > 1;
      const end = el.scrollWidth - el.clientWidth - el.scrollLeft > 1;
      el.toggleAttribute("data-more-start", start);
      el.toggleAttribute("data-more-end", end);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const sizes = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(check);
    sizes?.observe(el);
    if (el.firstElementChild) sizes?.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", check);
      sizes?.disconnect();
    };
  }, [ref, watch]);
}

/**
 * TeX in math type: `display` for a formula on its own line, inline for a symbol. Always left to right, isolated from the Hebrew around it.
 * A display line wider than its box scrolls inside it, its edge fading where more of it lies (`useScrollEdges`); `start` sets it at the
 * box's start instead of its middle, for lines read one under another.
 */
export function Tex({ tex, display = false, start = false, className }: { tex: string; display?: boolean; start?: boolean; className?: string }) {
  const [html, setHtml] = useState(() => (katex ? draw(katex, tex, display) : null));
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let live = true;
    if (katex) setHtml(draw(katex, tex, display));
    else void loadKatex().then((k) => live && setHtml(draw(k, tex, display)));
    return () => {
      live = false;
    };
  }, [tex, display]);
  useScrollEdges(box, html);
  // Until KaTeX is in, the place is held: a display formula by about one fraction's height, a symbol by its letters in plain type.
  if (!display) return html === null ? <span dir="ltr" className={cx("opacity-0", className)}>{tex.replace(/\\text|[\\{}]/g, "")}</span> : <span dir="ltr" className={cx("inline-block", className)} dangerouslySetInnerHTML={{ __html: html }} />;
  if (html === null) return <div ref={box} dir="ltr" className={cx("min-h-14", className)} />;
  return <div ref={box} dir="ltr" data-start={start ? "" : undefined} className={cx("tex-display overflow-x-auto overflow-y-hidden text-lg", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** A row of the key under a figure's line: the symbol, its words, and the figure's inputs that stand for it, each with its name and value. */
export interface WorkedKeyRow {
  tex: string;
  words: string;
  /**
   * The inputs this symbol stands for, each with its value as a figure that opens its own sheet: one stands at the row's end; several (the
   * terms of a sum, a company's tracks) are listed under the words, each by its name.
   */
  inputs: readonly { key: string; name: ReactNode; value: ReactNode }[];
}

/** A line of a difference or a sum: its sign (none on the first line), its name and its value. */
export interface ReceiptRow {
  key: string;
  sign: "minus" | "plus" | null;
  name: ReactNode;
  value: ReactNode;
}

const SIGN = { minus: "−", plus: "+" } as const;

/**
 * A formula and what its symbols stand for, by `variant`:
 * - `formula` (the default): each line in math type (with its name when there are several), then `where` and a two-column key, the
 *   symbol on the start side and its words beside it.
 * - `worked`: one figure's working, its line in symbols, the same line with its values put in (`values`, when it has them) and "=" with
 *   the figure as its head shows it (`result`); under it `where` and the key (`rows`), each row its symbol, its words and the figure's own inputs
 *   for it; `after`, one quiet line at the end (the way to the formula's own sheet).
 * - `receipt`: the lines of a difference or a sum, each with its sign at its start, then "=" and the figure as its head shows it.
 * Math reads left to right inside the right-to-left page; a line too wide for its box scrolls inside it.
 */
export function FormulaBlock(
  props:
    | { variant?: "formula"; lines: readonly { tex: string; label?: string }[]; symbols: readonly (readonly [tex: string, words: string])[]; where: string }
    | { variant: "worked"; label?: string; tex: string; values: string | null; result: ReactNode | null; rows: readonly WorkedKeyRow[]; where: string; after?: ReactNode }
    | { variant: "receipt"; label?: string; lines: readonly ReceiptRow[]; result: ReactNode },
) {
  switch (props.variant) {
    case undefined:
    case "formula":
      return <FormulaLines lines={props.lines} symbols={props.symbols} where={props.where} />;
    case "worked":
      return <Worked label={props.label} tex={props.tex} values={props.values} result={props.result} rows={props.rows} where={props.where} after={props.after} />;
    case "receipt":
      return <Receipt label={props.label} lines={props.lines} result={props.result} />;
    default:
      return assertNever(props);
  }
}

function FormulaLines({ lines, symbols, where }: { lines: readonly { tex: string; label?: string }[]; symbols: readonly (readonly [tex: string, words: string])[]; where: string }) {
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

function Worked({ label, tex, values, result, rows, where, after }: { label?: string; tex: string; values: string | null; result: ReactNode | null; rows: readonly WorkedKeyRow[]; where: string; after?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex flex-col gap-1">
        <Tex tex={tex} display start />
        {values !== null && <Tex tex={values} display start />}
        {values !== null && result !== null && (
          <div dir="ltr" className="text-lg tabular-nums">
            = <bdi>{result}</bdi>
          </div>
        )}
      </div>
      {rows.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">{where}</span>
          <dl className="readout">
            {rows.map((row) => (
              <div key={row.tex} className="readout-row items-start">
                <dt className="flex min-w-0 items-baseline gap-3">
                  <span className="shrink-0 text-foreground">
                    <Tex tex={row.tex} />
                  </span>
                  <span className="min-w-0">
                    {row.words}
                    {row.inputs.length > 1 && (
                      <span className="mt-1 flex flex-col">
                        {row.inputs.map((x) => (
                          <span key={x.key} className="flex min-h-target items-center justify-between gap-3">
                            <span className="min-w-0">{x.name}</span>
                            <span className="shrink-0">{x.value}</span>
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </dt>
                {row.inputs.length === 1 && <dd>{row.inputs[0]!.value}</dd>}
              </div>
            ))}
          </dl>
        </div>
      )}
      {after && <div className="text-sm">{after}</div>}
    </div>
  );
}

function Receipt({ label, lines, result }: { label?: string; lines: readonly ReceiptRow[]; result: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <dl className="readout">
        {lines.map((l) => (
          <div key={l.key} className="readout-row">
            <dt className="flex min-w-0 items-baseline gap-2">
              <span className="w-3 shrink-0 text-center text-foreground">{l.sign ? SIGN[l.sign] : null}</span>
              <span className="min-w-0">{l.name}</span>
            </dt>
            <dd>{l.value}</dd>
          </div>
        ))}
        <div className="readout-row readout-total">
          <dt className="flex min-w-0 items-baseline gap-2">
            <span className="w-3 shrink-0 text-center text-foreground">=</span>
          </dt>
          <dd className="font-semibold tabular-nums">
            <bdi dir="ltr">{result}</bdi>
          </dd>
        </div>
      </dl>
    </div>
  );
}
