// A self-directed (IRA) fund, told apart in one place (lib/self-directed.ts) for the track, company, tracks and fee pages, over the
// regulator's September 2026 files (data/cma/): IRA-03 counts 15 such funds from 7 managing companies in 2026-09.
import { describe, expect, it } from "vitest";
import { loadCma } from "./data.server";
import { feesData } from "./fees.server";
import { dealFromTrack } from "./fee-deal/templates";
import { buildProductView } from "./track-browser";
import { buildTrackBrowser } from "./track-browser.server";
import { isSelfDirectedName, selfDirectedProduct } from "./self-directed";

describe("the name of a self-directed fund", () => {
  it("says בניהול אישי or IRA as a word of its own", () => {
    expect(isSelfDirectedName("מיטב גמל בניהול אישי")).toBe(true);
    expect(isSelfDirectedName("אקטיון גמל  IRA")).toBe(true);
    expect(isSelfDirectedName("מגדל לתגמולים בניהול אישי IRA")).toBe(true);
    expect(isSelfDirectedName("MIRAGE")).toBe(false);
    expect(isSelfDirectedName("תגמולים ואישית לפיצויים")).toBe(false);
    expect(isSelfDirectedName("מיטב גמל לבני 50 עד 60")).toBe(false);
  });

  it("maps a fund of the provident type to the IRA provident product and a study fund's to the IRA study fund, and nothing else (IRA-01, IRA-03)", () => {
    expect(selfDirectedProduct("provident-for-annuity", "מיטב גמל בניהול אישי")).toBe("ira-provident");
    expect(selfDirectedProduct("keren-hishtalmut", "מיטב השתלמות בניהול אישי")).toBe("ira-hishtalmut");
    expect(selfDirectedProduct("kupat-gemel-lehashkaa", "גמל להשקעה בניהול אישי")).toBeNull();
    expect(selfDirectedProduct(null, "מרכזית בניהול אישי")).toBeNull();
    expect(selfDirectedProduct("provident-for-annuity", "מיטב גמל לבני 50 עד 60")).toBeNull();
  });
});

describe("the regulator's files", () => {
  const ira = loadCma().tracks.filter((x) => x.selfDirected);

  it("hold IRA-03's 15 self-directed funds of 7 companies: 8 provident, 7 study funds", () => {
    expect(ira).toHaveLength(15);
    expect(new Set(ira.map((x) => x.companyId)).size).toBe(7);
    expect(ira.filter((x) => x.selfDirected === "ira-provident").map((x) => x.fundId).sort((a, b) => a - b)).toEqual([1486, 1514, 1541, 2023, 2098, 8888, 14938, 15367]);
    expect(ira.filter((x) => x.selfDirected === "ira-hishtalmut").map((x) => x.fundId).sort((a, b) => a - b)).toEqual([1487, 1515, 1542, 2024, 2100, 8890, 14936]);
  });
});

describe("the pages agree on which funds are self-directed", () => {
  it("the tracks page lists them under their regulator type, their yields not shown", () => {
    const all = buildTrackBrowser();
    const annuity = buildProductView(all, "provident-for-annuity")!;
    const meitav = annuity.tracks.find((x) => x.id === 1486)!;
    expect(meitav.selfManaged).toBe(true);
    expect(annuity.tracks.filter((x) => x.selfManaged).map((x) => x.id).sort((a, b) => a - b)).toEqual([1486, 1514, 1541, 2023, 2098, 8888, 14938, 15367]);
  });

  it("a company's page shows them as products of their own, out of the ordinary product's list, its range and its cap", () => {
    const tb = buildTrackBrowser("512065202");
    const ids = (id: string) => tb.products.find((p) => p.id === id)?.rows.map((r) => r.f) ?? [];
    expect(ids("ira-provident")).toEqual([1486]);
    expect(ids("ira-hishtalmut")).toEqual([1487]);
    expect(ids("provident-for-annuity")).not.toContain(1486);
    expect(ids("keren-hishtalmut")).not.toContain(1487);
    expect(tb.products.find((p) => p.id === "ira-provident")?.name).toBe("קופת גמל בניהול אישי");
  });

  it("the fee page fills an IRA deal from an IRA fund, which offers the trading and custody fees beside the manager's", () => {
    const data = feesData();
    expect(data.tracks.find((x) => x.id === 1486)?.wrapperId).toBe("ira-provident");
    expect(data.tracks.find((x) => x.id === 1487)?.wrapperId).toBe("ira-hishtalmut");
    expect(data.tracks.find((x) => x.id === 103)?.wrapperId).toBe("provident-for-annuity");
    expect(dealFromTrack(1486, data, loadCma().periodValue.checked)?.kind).toBe("ira-provident");
  });
});
