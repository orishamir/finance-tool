// The short names of the track browser (D54): the names are the regulator's, September 2026 (data/cma/), so each case is a real company.
import { describe, expect, it } from "vitest";
import { buildProductView } from "./track-browser";
import { buildTrackBrowser } from "./track-browser.server";
import { kindLabel, kindWordSet, nameAddsToKind, nameSaysKind, normName, shortTrackNames } from "./track-names";

const data = buildTrackBrowser();
const shortOf = (productId: string, company: string, fundName: string) => {
  const view = buildProductView(data, productId)!;
  return view.tracks.find((x) => x.companyName === company && x.fullName === fundName)?.short;
};

describe("short names, from the real tracks", () => {
  it("Harel in the investment funds loses the company and the product, and keeps the track's own words", () => {
    expect(shortOf("kupat-gemel-lehashkaa", "הראל", 'הראל גמל להשקעה אשראי ואג"ח')).toBe('אשראי ואג"ח');
    expect(shortOf("kupat-gemel-lehashkaa", "הראל", "הראל גמל להשקעה מניות סחיר")).toBe("מניות סחיר");
  });

  it("a leading dash or the word מסלול goes, and a dash glued to one side is the same dash", () => {
    expect(shortOf("kupat-gemel-lehashkaa", "הראל", 'הראל גמל להשקעה מסלול סחיר- אג"ח עם מניות (עד 25% מניות)')).toBe('סחיר - אג"ח עם מניות (עד 25% מניות)');
    expect(shortOf("child-savings-provident", "הפניקס", "הפניקס חיסכון לילד- שריעה")).toBe("שריעה");
    expect(shortOf("child-savings-provident", "הפניקס", "הפניקס חיסכון לילד - הלכה")).toBe("הלכה");
  });

  it("a cut stops before a word of a kind's name, with its Hebrew prefix letter too (Analyst, child savings)", () => {
    expect(shortOf("child-savings-provident", "אנליסט", "אנליסט מסלולית - קופת גמל להשקעה לחיסכון ארוך טווח לילד - מסלול לחוסכים המעדיפים סיכון מועט")).toBe("לחוסכים המעדיפים סיכון מועט");
    expect(shortOf("child-savings-provident", "הפניקס", "הפניקס חיסכון לילד - חוסכים המעדיפים סיכון מוגבר")).toBe("חוסכים המעדיפים סיכון מוגבר");
  });

  it("Mor in the study funds loses the whole product name, and keeps what follows it", () => {
    expect(shortOf("keren-hishtalmut", "מור", "מור קרן השתלמות לשכירים ולעצמאים - כללי")).toBe("כללי");
    expect(shortOf("keren-hishtalmut", "מור", "מור קרן השתלמות לשכירים ולעצמאים - אשראי ואג\"ח")).toBe("אשראי ואג\"ח");
  });

  it("a company with one track loses only its own name", () => {
    const view = buildProductView(data, "keren-hishtalmut")!;
    const one = view.companies.find((c) => c.tracks.length === 1)!;
    expect(one.tracks[0]!.short).toBe(one.tracks[0]!.fullName.replace(new RegExp(`^${one.name}\\s*`), ""));
    expect(one.tracks[0]!.short).not.toBe("");
  });

  it("the full name stays whole on every track", () => {
    for (const p of data.products) {
      const view = buildProductView(data, p.id)!;
      for (const x of view.tracks) expect(x.fullName.length).toBeGreaterThan(0);
      expect(view.tracks.every((x) => x.short.length > 0)).toBe(true);
    }
  });
});

describe("the pieces", () => {
  it("normName ignores spaces, quotes, dashes, brackets and case", () => {
    expect(normName('אג"ח - סחיר (עד 25%)')).toBe(normName("אג״ח סחיר עד 25%"));
    expect(normName("S&P 500")).toBe("s&p500");
  });

  it("kindLabel drops the product the child-savings kinds repeat", () => {
    expect(kindLabel("חיסכון לילד -חוסכים המעדיפים סיכון גבוה")).toBe("חוסכים המעדיפים סיכון גבוה");
    expect(kindLabel("כללי")).toBe("כללי");
  });

  it("the kind shows as a chip only where the short name does not say it, and the name under a kind only where it says more", () => {
    expect(nameSaysKind("אשראי ואג\"ח עם מניות (עד 25% מניות)", 'אשראי ואג"ח')).toBe(true);
    expect(nameSaysKind("הלכה", "הלכה יהודית")).toBe(false);
    expect(nameSaysKind("כללי", "")).toBe(false);
    expect(nameAddsToKind("מניות", "מניות")).toBe(false);
    expect(nameAddsToKind("מניות סחיר", "מניות")).toBe(true);
  });

  it("a name that would be left empty stays whole", () => {
    const m = shortTrackNames("הראל", [{ key: 1, name: "הראל" }], kindWordSet([]));
    expect(m.get(1)).toBe("הראל");
  });
});
