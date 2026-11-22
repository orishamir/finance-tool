// The study fund page's figures as values: each figure the page shows is recorded with what it rests on, so a test reads what a sheet
// would open (a mock of the provenance number that renders as it does and keeps its props).
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nisOf } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { guideSignature } from "../../copy";

/** Each figure the page drew, with the text it showed. */
const seen: { value: SiteValue; text: string }[] = [];
let drawn: { value: SiteValue; text: string }[] = [];

// The provenance number is swapped for one that renders the same and records its props, for this file only: the test files of a worker
// share their modules (vitest.config.ts, `isolate: false`), so the swap is made on fresh copies of the site's modules and taken back with
// fresh copies again after the file, and no other file sees it.
beforeAll(async () => {
  vi.resetModules();
  vi.doMock("../provenance", async (original) => {
    const m = await original<typeof import("../provenance")>();
    type NumProps = Parameters<typeof m.Num>[0];
    type NisProps = Parameters<typeof m.NisNum>[0];
    const textOf = (v: SiteValue, display: NumProps["display"]) => (typeof display === "function" && typeof v.value === "number" ? String(display(v.value)) : typeof display === "string" ? display : "");
    return {
      ...m,
      Num: (props: NumProps) => {
        seen.push({ value: props.value, text: textOf(props.value, props.display) });
        return createElement(m.Num, props);
      },
      NisNum: (props: NisProps) => {
        const n = typeof props.value.value === "number" ? props.value.value : 0;
        seen.push({ value: props.value, text: nisOf(props.value, props.abs ? Math.abs(n) : n, { signed: !!props.signed }) });
        return createElement(m.NisNum, props);
      },
    };
  });
  const { ProvenanceProvider } = await import("../provenance");
  const { SignatureFrame } = await import("./index");
  const { InputsProvider } = await import("../../lib/inputs");
  const { buildGuidePage } = await import("../../lib/guide.server");
  const p = buildGuidePage("keren-hishtalmut")!;
  renderToString(
    createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(ProvenanceProvider, { data: { rules: p.rules, terms: {}, dimensions: {}, today: p.today }, children: createElement(SignatureFrame, { id: "keren-hishtalmut", data: p.signature!, today: p.today, timeline: null }) as ReactNode }) })),
  );
  drawn = [...seen];
});

afterAll(() => {
  vi.doUnmock("../provenance");
  vi.resetModules();
});

/** A figure and every figure it was worked out from, down to the inputs. */
function* within(v: SiteValue): Generator<SiteValue> {
  yield v;
  for (const input of Object.values(v.computed_from?.inputs ?? {})) yield* within(input as SiteValue);
}

/** The signed shekels a figure's text shows: "−3,300 ₪" is −3300, "+54,000" 54000. */
const shekels = (text: string) => {
  const m = /([−+-]?)([\d,]+)/.exec(text.replace(/[⁦-⁩‎‏]/g, ""));
  return m ? (m[1] === "−" || m[1] === "-" ? -1 : 1) * Number(m[2]!.replace(/,/g, "")) : NaN;
};

describe("study fund page: figures as their sheets hold them", () => {
  it("draws figures", () => expect(drawn.length).toBeGreaterThan(10));

  it("what was paid in (F-106) rests on no return: no such figure, shown or inside another, is marked as resting on the assumed return", () => {
    const paid = drawn.flatMap((d) => [...within(d.value)]).filter((v) => v.computed_from?.formula === "F-106");
    expect(paid.length).toBeGreaterThan(2);
    for (const v of paid) expect(v.onAssumedReturn, v.about).toBeUndefined();
  });

  it("the tax from the salary on the employer's money rests on no return either", () => {
    const about = new Set<string>([guideSignature.hishtalmut.story.about.taxSalary, guideSignature.hishtalmut.story.about.lockSalaryTax]);
    const salary = drawn.flatMap((d) => [...within(d.value)]).filter((v) => v.about && about.has(v.about));
    expect(salary.length).toBeGreaterThan(0);
    for (const v of salary) expect(v.onAssumedReturn, v.about).toBeUndefined();
  });

  it("the bar's parts, as shown, add up to what is left as shown, on hundreds of shekels where they rest on the assumed return (method.md F-96)", () => {
    const story = guideSignature.hishtalmut.story;
    const parts = new Map<string, number>();
    let left: number | null = null;
    for (const d of drawn.filter((x) => x.value.reconciled)) {
      const n = shekels(d.text);
      // the figure carries the number its line shows
      expect(Math.abs(n), d.value.about).toBe(Math.abs(d.value.value as number));
      if (d.value.about === story.about.left) left = n;
      else parts.set(`${d.value.about}|${Math.sign(n)}`, n);
    }
    expect(left).not.toBeNull();
    expect(parts.size).toBeGreaterThanOrEqual(4);
    expect([...parts.values()].reduce((a, n) => a + n, 0)).toBe(left);
    expect(left! % 100).toBe(0);
    for (const [k, n] of parts) if (k.startsWith(story.about.fee) || k.startsWith(story.about.tax) || k.startsWith(story.about.taxWithdrawal)) expect(Math.abs(n) % 100, k).toBe(0);
  });
});
