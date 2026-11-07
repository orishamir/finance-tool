// The shared sheet says when more of it lies below its edge (independent check of pass 5: a gap sheet's third year sat under the edge with
// nothing saying more followed).
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { moreBelow, Sheet, watchMoreBelow, type MoreEnv } from "./Sheet";
import { site } from "../copy";

describe("the sheet's sign that more follows", () => {
  it("is on while the body runs past its bottom edge, and off at the end", () => {
    expect(moreBelow({ scrollHeight: 900, scrollTop: 0, clientHeight: 540 })).toBe(true);
    expect(moreBelow({ scrollHeight: 900, scrollTop: 358, clientHeight: 540 })).toBe(true);
    expect(moreBelow({ scrollHeight: 900, scrollTop: 359.5, clientHeight: 540 })).toBe(false);
    expect(moreBelow({ scrollHeight: 400, scrollTop: 0, clientHeight: 400 })).toBe(false);
  });
  it("every sheet carries it, outside its scrolling body, unseen by a screen reader and off until measured", () => {
    const out = renderToString(createElement(Sheet, { open: true, onClose: () => undefined, children: createElement("p", null, "x") }));
    const at = out.indexOf('class="sheet-more"');
    expect(at).toBeGreaterThan(out.indexOf('class="sheet-body"'));
    expect(out.slice(at, at + 80)).toContain('aria-hidden="true"');
    expect(out.slice(at, at + 80)).not.toContain("data-more");
    // the body closes before it: the sign is not part of what scrolls
    expect(out.slice(out.indexOf('class="sheet-body"'), at)).toMatch(/<p>x<\/p><\/div><div $/);
  });
  it("says it in words beside the arrow (pass 7: a fade alone read as the sheet cut off)", () => {
    const out = renderToString(createElement(Sheet, { open: true, onClose: () => undefined, children: createElement("p", null, "x") }));
    const at = out.indexOf('class="sheet-more"');
    expect(out.slice(at, at + 400)).toContain(site.moreBelow);
  });
});

describe("the sign follows the sheet while it is open (pass 7: it was measured after renders only, and a fold opening inside left it stale)", () => {
  // a body whose height and scroll the test sets, and observers it fires by hand
  const make = () => {
    const listeners: (() => void)[] = [];
    const sizeCbs: (() => void)[] = [];
    const mutationCbs: (() => void)[] = [];
    const observed: unknown[] = [];
    let disconnected = 0;
    const child = { id: "c1" } as unknown as Element;
    const body = {
      scrollHeight: 400, scrollTop: 0, clientHeight: 400, children: [child] as ArrayLike<Element>,
      addEventListener: (_: "scroll", f: () => void) => listeners.push(f),
      removeEventListener: (_: "scroll", f: () => void) => listeners.splice(listeners.indexOf(f), 1),
    };
    const env: MoreEnv = {
      ResizeObserver: class { constructor(cb: () => void) { sizeCbs.push(cb); } observe(el: Element) { observed.push(el); } disconnect() { disconnected++; } },
      MutationObserver: class { constructor(cb: () => void) { mutationCbs.push(cb); } observe() {} disconnect() { disconnected++; } },
    };
    return { body, env, listeners, sizeCbs, mutationCbs, observed, child, disconnected: () => disconnected };
  };
  it("measures at once, then on scroll", () => {
    const m = make();
    const seen: boolean[] = [];
    m.body.scrollHeight = 900;
    watchMoreBelow(m.body, (x) => seen.push(x), m.env);
    expect(seen).toEqual([true]);
    m.body.scrollTop = 500;
    m.listeners.forEach((f) => f());
    expect(seen.at(-1)).toBe(false);
  });
  it("measures again when a block inside grows (a fold opening), the body and each block watched", () => {
    const m = make();
    const seen: boolean[] = [];
    watchMoreBelow(m.body, (x) => seen.push(x), m.env);
    expect(seen).toEqual([false]);
    expect(m.observed).toContain(m.child);
    m.body.scrollHeight = 700;
    m.sizeCbs.forEach((f) => f());
    expect(seen.at(-1)).toBe(true);
    // a block added or replaced is watched too
    const added = { id: "c2" } as unknown as Element;
    m.body.children = [m.child, added];
    m.mutationCbs.forEach((f) => f());
    expect(m.observed).toContain(added);
  });
  it("lets go of everything when the sheet closes", () => {
    const m = make();
    const stop = watchMoreBelow(m.body, () => undefined, m.env);
    stop();
    expect(m.listeners).toEqual([]);
    expect(m.disconnected()).toBe(2);
  });
  it("the sheet runs it on its body while open, and opens every time at the top (no scroll handler in the markup to stand in for it)", () => {
    const src = readFileSync(join(__dirname, "Sheet.tsx"), "utf8");
    expect(src).toMatch(/return watchMoreBelow\(body\.current, setMore\);\s*\}, \[open\]\);/);
    expect(src).toMatch(/if \(\(!wasOpen\.current \|\| lastView\.current !== view\) && body\.current\) body\.current\.scrollTop = 0;/);
    // the provenance sheet shows one figure after another in one open sheet: each drill-in and back is a new view (independent check of pass 7)
    expect(readFileSync(join(__dirname, "provenance.tsx"), "utf8")).toMatch(/<Sheet [^>]*view=\{stack\.length\}/);
    expect(src).not.toMatch(/onScroll=/);
  });
});

describe("the sign never covers a line (independent check of pass 7: the cue over the last line hid it in a still shot, and a reader misread it)", () => {
  const css = readFileSync(join(__dirname, "../app.css"), "utf8");
  const rule = (sel: string) => new RegExp(`\\n\\s*${sel.replace(/[.[\]*]/g, "\\$&")} \\{([^}]*)\\}`).exec(css)?.[1] ?? "";
  it("sits in a strip of its own under the body, in the flow, at one height whether it shows or not", () => {
    const strip = rule(".sheet-more");
    expect(strip).not.toBe("");
    expect(strip).not.toMatch(/position:\s*(absolute|fixed|sticky)/);
    expect(strip).not.toMatch(/gradient/);
    expect(strip).toMatch(/flex-shrink:\s*0/);
    expect(strip).toMatch(/\bheight:/);
    // showing it changes no size: only colour and opacity
    expect(rule(".sheet-more[data-more]")).not.toMatch(/height|padding|margin|display/);
    expect(rule(".sheet-more[data-more] > *")).not.toMatch(/height|padding|margin|display/);
  });
});
