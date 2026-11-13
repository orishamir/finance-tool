// A company page's tracks table, drawn as the server draws it: each fee head says the year of the average it shows and carries a "?"
// beside its sort button, whose cards are the average and, where it names the product, the fee's own card (feeMarkTerms).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { help as helpCopy, trackBrowser as t } from "../../copy";
import { loadTerms } from "../../lib/data.server";
import { buildProductView, feeRangeOf, type SortId, type TbGroup } from "../../lib/track-browser";
import { buildTrackBrowser } from "../../lib/track-browser.server";
import { ProvenanceProvider } from "../provenance";
import { TrackList } from "./list";

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
