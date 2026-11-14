// A company page's tracks table, drawn as the server draws it: each fee head says the year of the average it shows and carries a "?"
// beside its sort button, whose cards are the average and, where it names the product, the fee's own card (feeMarkTerms).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { help as helpCopy, track as trackCopy, trackBrowser as t } from "../../copy";
import { loadRules, loadTerms } from "../../lib/data.server";
import type { SiteValue } from "../../lib/value";
import { buildProductView, feeRangeOf, type SortId, type TbGroup } from "../../lib/track-browser";
import { buildTrackBrowser } from "../../lib/track-browser.server";
import { ProvenanceProvider } from "../provenance";
import { FeeNum } from "../kit";
import { ChildFeeNote, TrackList } from "./list";

const data = buildTrackBrowser();
const terms = Object.fromEntries(loadTerms().map((x) => [x.he, x]));

const draw = (product: string) => {
  const view = buildProductView(data, product)!;
  const group: TbGroup = { key: `p:${view.id}`, by: "company", title: view.name, tracks: view.tracks.slice(0, 3), total: view.tracks.length, assets: null, fees: feeRangeOf(view.tracks, data.today) };
  const list = createElement(TrackList, { view, groups: [group], by: "company", sort: { id: "fee", dir: 1 }, sortable: new Set<SortId>(["fee", "dep"]), onSort: () => {}, feeYear: "2025", period: data.reportPeriod, compact: "with-deposit", fixed: true });
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms, dimensions: {}, today: data.today }, children: list })));
};
const mark = (about: string) => `aria-label="${helpCopy.markLabel.replace("{about}", about)}"`;

describe("a company page's fee heads", () => {
  it("say the year of the average under the fee's name, and carry a \"?\" outside the sort button", () => {
    const html = draw("kupat-gemel-lehashkaa");
    expect(html).toContain(t.columns.average.replace("{year}", "2025"));
    expect(html).toContain(mark(t.help.fee));
    expect(html).toContain(mark(t.help.deposit));
    // the mark is the sort button's neighbour, never inside it
    expect(html).not.toMatch(/<button[^>]*>(?:(?!<\/button>).)*<button/s);
  });
});

describe("a pension product's fees (CAT-39)", () => {
  it("say under the fee head that they are the whole fund's, and a provident product's do not", () => {
    expect(draw("pension-comprehensive")).toContain(`${t.columns.average.replace("{year}", "2025")}, ${trackCopy.feeWhole}`);
    expect(draw("kupat-gemel-lehashkaa")).not.toContain(trackCopy.feeWhole);
  });
});

describe("a child-savings product's fees (CS OQ9)", () => {
  it("say under the fee head that they are what members over 21 paid, and another product's do not", () => {
    expect(draw("child-savings-provident")).toContain(`${t.columns.average.replace("{year}", "2025")}, ${trackCopy.feeOver21}`);
    expect(draw("kupat-gemel-lehashkaa")).not.toContain(trackCopy.feeOver21);
  });
});

describe("the child-savings fee note (CS OQ9)", () => {
  it("says the age from CS-18's figure, and says nothing without it", () => {
    const age = loadRules()["CS-18"]!.figures!.nii_pays_until_age as unknown as SiteValue;
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms, dimensions: {}, today: data.today }, children: createElement(ChildFeeNote, { age }) })));
    expect(html).toContain(`>${String(age.value)}<`);
    expect(html).toContain(t.childFee.before);
    expect(renderToStaticMarkup(createElement(ChildFeeNote, { age: null }))).toBe("");
  });
});

describe("a fee the regulator left empty", () => {
  it("says in words that it was not reported yet, not a dash", () => {
    const view = buildProductView(data, "kupat-gemel-lehashkaa")!;
    const empty = view.tracks.find((x) => x.fee.value === null);
    expect(empty).toBeDefined();
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms, dimensions: {}, today: data.today }, children: createElement(FeeNum, { value: empty!.fee }) })));
    expect(html).toContain(trackCopy.feeNotReported);
    expect(html).not.toContain("—");
  });
  it("and so does an empty yield, in its cell, with its window beside it", () => {
    const view = buildProductView(data, "provident-for-annuity")!;
    const empty = view.tracks.filter((x) => (x.y3?.value === null && !x.young3) || (x.y5?.value === null && !x.young5)).slice(0, 3);
    expect(empty.length).toBeGreaterThan(0);
    const group: TbGroup = { key: "p:empty", by: "company", title: view.name, tracks: empty, total: empty.length, assets: null, fees: feeRangeOf(empty, data.today) };
    const list = createElement(TrackList, { view, groups: [group], by: "company", sort: { id: "fee", dir: 1 }, sortable: new Set<SortId>(["fee"]), onSort: () => {}, feeYear: "2025", period: data.reportPeriod, compact: "with-deposit", fixed: true });
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms, dimensions: {}, today: data.today }, children: list })));
    expect(html).toContain(trackCopy.feeNotReported);
    expect(html).not.toMatch(/>—</);
  });
});
