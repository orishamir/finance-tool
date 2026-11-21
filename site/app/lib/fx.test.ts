// Exchange rates from the ECB's reference rates (D26): the cross rate, the label, the stale clock, the series file.
import { describe, expect, it } from "vitest";
import { fxLabel, hasRate, nisPer, nisPerNumber, nisPerQuoted, type FxSnapshot } from "./fx";
import { loadFx } from "./fx.server";

const fx: FxSnapshot = {
  date: "2026-10-23",
  checked: "2026-10-25",
  perEur: { USD: 1.1193, ILS: 3.4939, JPY: 175.51, GBP: 0.83728 },
  attribution: "הבנק המרכזי האירופי (ECB)",
  staleAfterDays: 5,
  sourceUrl: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
};

describe("nisPer", () => {
  it("is the cross rate ILS per EUR / code per EUR", () => {
    expect(nisPerNumber(fx, "USD")).toBeCloseTo(3.4939 / 1.1193, 10);
    expect(nisPerNumber(fx, "USD")!).toBeCloseTo(3.1215, 4);
    expect(nisPerNumber(fx, "GBP")!).toBeCloseTo(3.4939 / 0.83728, 10);
  });
  it("gives the euro its own ILS rate and the shekel 1", () => {
    expect(nisPerNumber(fx, "EUR")).toBe(3.4939);
    expect(nisPerNumber(fx, "ILS")).toBe(1);
    expect(nisPerNumber(fx, "NIS")).toBe(1);
  });
  it("is null for a currency the ECB does not publish", () => {
    expect(nisPerNumber(fx, "XYZ")).toBeNull();
    expect(nisPer(fx, "XYZ", "2026-10-25")).toBeNull();
    expect(hasRate(fx, "USD")).toBe(true);
    expect(hasRate(fx, "XYZ")).toBe(false);
    expect(nisPerNumber({ ...fx, perEur: { USD: 1.1 } }, "USD")).toBeNull();
  });
  it("quotes yen per 100", () => {
    const q = nisPerQuoted(fx, "JPY")!;
    expect(q.per).toBe(100);
    expect(q.value).toBeCloseTo((3.4939 / 175.51) * 100, 10);
    expect(q.value).toBeCloseTo(1.9906, 3);
    expect(nisPerQuoted(fx, "USD")).toMatchObject({ per: 1 });
  });
  it("returns a computed value with the Hebrew label, the ECB source and both inputs", () => {
    const v = nisPer(fx, "USD", "2026-10-25")!;
    expect(v.state).toBe("computed");
    expect(v.unit).toBe("nis");
    expect(v.value as number).toBeCloseTo(3.1215, 4);
    expect(v.about).toBe("מחושב משערי הייחוס של הבנק המרכזי האירופי, 23.10.2026");
    expect(fxLabel(fx)).toBe(v.about);
    expect(v.notes).toContain("ECB");
    expect(Object.keys(v.computed_from!.inputs)).toHaveLength(2);
    const input = Object.values(v.computed_from!.inputs)[0] as { source: { url: string; strength: string } };
    expect(input.source.url).toContain("ecb.europa.eu");
    expect(v.weakest).toBe("primary");
    expect(v.stale).toBeNull();
  });
  it("one input for the euro", () => {
    expect(Object.keys(nisPer(fx, "EUR", "2026-10-25")!.computed_from!.inputs)).toHaveLength(1);
  });
  it("goes stale after stale_after_days", () => {
    expect(nisPer(fx, "USD", "2026-10-28")!.stale).toBeNull();
    expect(nisPer(fx, "USD", "2026-10-29")!.stale).toEqual({ since: "2026-10-23", cadence: "daily" });
  });
});

describe("the collected series file", () => {
  it("loads into a snapshot with USD, ILS, JPY and an attribution", () => {
    const s = loadFx()!;
    expect(s).not.toBeNull();
    expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const code of ["USD", "ILS", "JPY"]) expect(s.perEur[code]).toBeGreaterThan(0);
    expect(s.attribution).toContain("הבנק המרכזי האירופי");
    expect(nisPer(s, "USD", s.date)!.value as number).toBeGreaterThan(1);
  });
});
