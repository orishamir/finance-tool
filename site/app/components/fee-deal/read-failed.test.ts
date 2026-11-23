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
const reading = (read: DealRead) => DealReading({ input: { read, unitPrice: null, cap: null, picks: null }, saved: false, fx: data.fx });

describe("a reading that throws", () => {
  it("says the deal could not be read, in the reading's place, and throws nothing past it", () => {
    const read = readDealFor(deal, data.kinds, TODAY);
    // a read with no periods breaks what the reading reads
    const broken = { ...read, reading: { ...read.reading, periods: undefined } } as unknown as DealRead;
    const shown = drawn(reading(broken));
    expect(shown).toContain(feeDeal.readFailed.title);
    expect(shown).toContain(feeDeal.readFailed.line);
  });
  it("is not said where the reading reads", () => {
    const shown = drawn(reading(readDealFor(deal, data.kinds, TODAY)));
    expect(shown).not.toContain(feeDeal.readFailed.title);
    expect(shown).toContain("0.1%");
  });
});
