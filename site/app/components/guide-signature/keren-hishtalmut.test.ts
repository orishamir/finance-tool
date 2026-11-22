// The study fund page's figures as values: each figure the page shows is recorded with what it rests on, so a test reads what a sheet
// would open (a mock of the provenance number that renders as it does and keeps its props).
import { createElement } from "react";
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
  const p = buildGuidePage("keren-hishtalmut");
  if (!p?.signature) throw new Error("the study fund page has no drawing");
  const frame = createElement(SignatureFrame, { id: "keren-hishtalmut", data: p.signature, today: p.today, timeline: null });
  renderToString(createElement(MemoryRouter, null, createElement(InputsProvider, null, createElement(ProvenanceProvider, { data: { rules: p.rules, terms: {}, dimensions: {}, today: p.today } } as never, frame))));
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

/** The signed agorot a figure's text shows: "−3,300 ₪" is −330000, "+54,000" 5400000, "0.31 ₪" 31. */
const agorot = (text: string) => {
  const m = /([−+-]?)([\d,]+(?:\.\d\d)?)/.exec(text.replace(/[⁦-⁩‎‏]/g, ""));
  return m ? (m[1] === "−" || m[1] === "-" ? -1 : 1) * Math.round(Number((m[2] ?? "").replace(/,/g, "")) * 100) : NaN;
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

  it("the bar's parts, as shown, add up to what is left as shown, the return before fees taking what the rounding leaves (method.md F-96)", () => {
    const story = guideSignature.hishtalmut.story;
    const ab = story.about;
    // the bar's own parts by what they are (the tile above the bar names the tax as the bar's tax part may: the bar, drawn after it, wins)
    const barAbout = new Set<string>([ab.own, ab.extra, ab.extraSelf, ab.gain, ab.fee, ab.taxSalary, ab.taxWithdrawal, ab.tax]);
    const parts = new Map<string, number>();
    const shownAs = new Map<string, number>();
    for (const d of drawn.filter((x) => x.value.reconciled)) {
      const n = agorot(d.text);
      // the figure carries the number its line shows
      expect(Math.abs(n), d.value.about).toBe(Math.round(Math.abs(d.value.value as number) * 100));
      if (d.value.about) shownAs.set(d.value.about, n);
      if (d.value.about && barAbout.has(d.value.about)) parts.set(`${d.value.about}|${Math.sign(n)}`, n);
    }
    const left = shownAs.get(ab.left);
    expect(left).toBeDefined();
    expect(parts.size).toBeGreaterThanOrEqual(4);
    expect([...parts.values()].reduce((a, n) => a + n, 0)).toBe(left);
    expect((left ?? NaN) % 10_000).toBe(0);
  });

  it("the early withdrawal's sentence adds up to the column: what enters, plus what the return gives back, less what it asks for (method.md F-98)", () => {
    const ab = guideSignature.hishtalmut.story.about;
    const shownAs = new Map<string, number>();
    for (const d of drawn.filter((x) => x.value.reconciled)) if (d.value.about) shownAs.set(d.value.about, Math.abs(agorot(d.text)));
    const first = shownAs.get(ab.first);
    expect(first, "the example withdraws before the lock ends").toBeDefined();
    expect((first ?? NaN) + (shownAs.get(ab.back) ?? 0) - (shownAs.get(ab.owed) ?? 0)).toBe(shownAs.get(ab.left));
  });
});
