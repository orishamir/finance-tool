import { describe, expect, it } from "vitest";
import { allLabels, label } from "./labels";

describe("label icons (2026-11-05 sweep)", () => {
  // labels that say the same thing of a different case share an icon; any other two never do
  const same = [
    ["currency", "currency-many"],
    ["hedged", "hedged-many"],
  ];
  const kin = (a: string, b: string) => same.some((g) => g.includes(a) && g.includes(b));

  it("labels about different things never share an icon", () => {
    const all = allLabels();
    for (const a of all) for (const b of all) if (a.id < b.id && !kin(a.id, b.id)) expect(`${a.id} ${a.icon}`).not.toBe(`${a.id} ${b.icon}`);
  });

  it("a currency label draws that currency's sign, and the general sign for one without its own", () => {
    expect(label("currency", "USD").icon).toBe("dollar");
    expect(label("currency", "EUR").icon).toBe("euro");
    expect(label("currency", "INR").icon).toBe("currency");
    expect(label("currency-foreign").icon).toBe("currency");
  });
});
