// /deal's reading inside its error boundary (`DealReading`): a reading that throws says, in its place, that the deal could not be read,
// and throws nothing past it, so the editor above stands. The server renderer used here does not catch errors at a boundary, as the browser
// does: `drawn` stands in for it, drawing a boundary's children, and where they throw, the boundary as it draws itself after an error.
// `DealReading` calls no hook, so what it returns is read by calling it.
import { Component, createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { readDealFor, type DealRead } from "../../lib/fee-deal/deal-read";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { DealReading } from "./reading";
import { ToolBoundary } from "../tool-boundary";

const data = feesData();
const TODAY = "2026-11-12";

const page = (el: ReactNode) => renderToStaticMarkup(createElement(MemoryRouter, null, el));

type Boundary = (new (props: object) => Component<object, object>) & { getDerivedStateFromError: (e: unknown) => object };
const isBoundary = (t: unknown): t is Boundary => typeof t === "function" && "getDerivedStateFromError" in t;

/** An element drawn as the browser draws it: a boundary whose children throw as its notice, anything else as it is. */
function drawn(el: ReactElement): string {
  const { type, props } = el as ReactElement<{ children?: ReactNode }>;
  if (isBoundary(type)) {
    try {
      return page(props.children);
    } catch (e) {
      const b = new type(props);
      b.state = { ...b.state, ...type.getDerivedStateFromError(e) };
      return page(b.render());
    }
  }
  return page(el);
}

const deal: FeeDeal = { id: "deal-a", name: "", kind: "brokerage-account", fees: [{ id: "fee-t", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1) } }] }] };
const reading = (read: DealRead, unitPrice: number | null = null, onUnitPrice?: (n: number | null) => void) =>
  DealReading({ input: { read, unitPrice, cap: null, picks: null }, saved: false, fx: data.fx, ...(onUnitPrice ? { onUnitPrice } : {}) });
/** A read with no periods, which breaks what the reading reads. */
const broken = (): DealRead => {
  const read = readDealFor(deal, data.kinds, TODAY);
  return { ...read, reading: { ...read.reading, periods: undefined } } as unknown as DealRead;
};

describe("a reading that throws", () => {
  it("says the deal could not be read, in the reading's place, and throws nothing past it", () => {
    const read = readDealFor(deal, data.kinds, TODAY);
    // a read with no periods breaks what the reading reads
    const broken = { ...read, reading: { ...read.reading, periods: undefined } } as unknown as DealRead;
    const shown = drawn(reading(broken));
    expect(shown).toContain(feeDeal.readFailed.title);
    expect(shown).toContain(feeDeal.readFailed.line);
  });
  it("offers to clear the unit's price typed beside a chart, which stands inside the reading it replaces, and nothing where none is typed", () => {
    const cleared: (number | null)[] = [];
    const el = reading(broken(), 50, (n) => cleared.push(n));
    expect(drawn(el)).toContain(feeDeal.readFailed.reset);
    (el.props as { onReset?: () => void }).onReset?.();
    expect(cleared).toEqual([null]);
    expect(drawn(reading(broken(), null, (n) => cleared.push(n)))).not.toContain(feeDeal.readFailed.reset);
  });
  it("is read again once the deal or the unit's price changes: a new key clears the failure, the same key keeps it", () => {
    expect(ToolBoundary.getDerivedStateFromProps({ children: null, resetKey: "b" }, { failed: true, key: "a" })).toEqual({ failed: false, key: "b" });
    expect(ToolBoundary.getDerivedStateFromProps({ children: null, resetKey: "a" }, { failed: true, key: "a" })).toBeNull();
  });
  it("is not said where the reading reads", () => {
    const shown = drawn(reading(readDealFor(deal, data.kinds, TODAY)));
    expect(shown).not.toContain(feeDeal.readFailed.title);
    expect(shown).toContain("0.1%");
  });
});
