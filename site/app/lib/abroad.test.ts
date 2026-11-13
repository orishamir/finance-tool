// The note on other countries (D114) as the guides ship it: every record under data/abroad/ has the guide's words for each country it
// found a product in, every fact the words name is in the record, amounts keep their currency, and the sheet reads the page's own words.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ProvenanceProvider } from "../components/provenance";
import { abroadPlaces } from "../components/guide/abroad";
import { AbroadNote } from "../components/kit";
import { guideContent } from "../content/guide";
import { abroadView } from "./abroad";
import { loadAbroad } from "./data.server";

const ids = ["kupat-gemel-lehashkaa", "keren-hishtalmut"];
const html = (el: React.ReactElement) => renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-13" }, children: el })));

describe("the note on other countries", () => {
  for (const id of ids) {
    const record = loadAbroad(id)!;
    const view = abroadView(record);
    const words = guideContent[id]!.abroad!;

    it(`${id}: the guide has words for every country the record found, and they name only facts the record holds`, () => {
      const places = abroadPlaces(view, words);
      expect(places).not.toBeNull();
      expect(places!.map((p) => p.id)).toEqual(["gb", "us", "fr", "it"]);
      expect(() => html(createElement(AbroadNote, { places: places!, start: view.opensOn, heads: words.heads }))).not.toThrow();
    });

    it(`${id}: an amount keeps its own currency and the page's words, without the record's working notes`, () => {
      for (const c of view.countries) {
        if (!c.found) continue;
        for (const v of Object.values(c.facts)) {
          expect(v.quote?.length).toBeGreaterThan(7);
          expect(v.notes).toBeUndefined();
          if (["gbp", "usd", "eur"].includes(v.unit)) expect(v.unitText).toBeTruthy();
        }
      }
    });
  }

  it("writes a figure the law prints with decimals as it prints them, and an amount in its own currency", () => {
    const keren = abroadPlaces(abroadView(loadAbroad("keren-hishtalmut")!), guideContent["keren-hishtalmut"]!.abroad!)!;
    const out = html(createElement(AbroadNote, { places: keren, start: "fr", heads: guideContent["keren-hishtalmut"]!.abroad!.heads }));
    expect(out).toContain("3,844.80");
    expect(out).toContain("אירו");
    const kupat = abroadPlaces(abroadView(loadAbroad("kupat-gemel-lehashkaa")!), guideContent["kupat-gemel-lehashkaa"]!.abroad!)!;
    const out2 = html(createElement(AbroadNote, { places: kupat, start: "gb", heads: guideContent["kupat-gemel-lehashkaa"]!.abroad!.heads }));
    for (const w of ["20,000", "ליש״ט", "7,500", "150,000", "40,000", "200,000", "59½"]) expect(out2, w).toContain(w);
    expect(out2).not.toMatch(/₪/);
  });
});
