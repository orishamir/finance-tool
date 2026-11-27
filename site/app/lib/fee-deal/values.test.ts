// A deal's computed figures say what they are of where a plain name says it: a held rate for a quarter read as its yearly rate (F-111) heads
// its sheet with the fee's name, its unit saying "a year". A yearly sum (F-111) and a price's share of its cap (F-113) carry no name, since
// the name alone under "120 ₪" or "40%" would read as the fee's own price; their line waits for words of their own.
import { describe, expect, it } from "vitest";
import { guideBlocks } from "../../copy";
import { priceView, standingView, type PriceView } from "./deal-read";
import { reading } from "./values";
import { typed, type Price } from "./model";
import { entered } from "../value";
import type { DealKind } from "./kinds";

const TODAY = "2026-11-12";

describe("a reading of the fee page says what it is of", () => {
  it("a reading built with a name carries it, and one built without carries none", () => {
    const input = { "deal:custody": entered(0.1, "pct_of_balance_per_period", TODAY) };
    expect(reading(0.4, "pct_per_year", "F-111", input, TODAY, "דמי ניהול").about).toBe("דמי ניהול");
    expect(reading(0.4, "pct_per_year", "F-111", input, TODAY).about).toBeUndefined();
  });

  it("a held rate for a quarter, read as its yearly rate, is the custody fee's", () => {
    const p: Price = { form: "held", rate: typed(0.1), per: 3, every: 3 };
    const view = priceView([{ kind: "custody" }], 0, p, TODAY);
    expect(view.yearly?.state).toBe("computed");
    expect(view.yearly?.about).toBe(guideBlocks.fees.custody.name);
  });

  it("a held rate of a fee of the person's own is read under the name they gave it", () => {
    const p: Price = { form: "held", rate: typed(0.1), per: 3, every: 3 };
    const view = priceView([{ kind: "own", name: "דמי שמירה" }], 0, p, TODAY);
    expect(view.yearly?.about).toBe("דמי שמירה");
  });

  it("a sum every quarter, read as its yearly sum, carries no name", () => {
    const p: Price = { form: "sum", amount: typed(30), every: 3 };
    const view = priceView([{ kind: "fixed_period" }], 0, p, TODAY);
    expect(view.yearly?.state).toBe("computed");
    expect(view.yearly?.about).toBeUndefined();
  });

  it("a held rate's share of a yearly cap carries no name", () => {
    const kind: DealKind = {
      id: "keren-hishtalmut",
      name: "",
      bases: ["balance"],
      regulator: "cma",
      caps: { balance: { value: 1.3, unit: "pct_per_year", source: { url: "https://example.org", title: "t", publisher: "p", strength: "primary" }, checked: TODAY, effective_from: null, effective_to: null, update_rule: "law", state: "sourced", rule_ids: ["PF-04"] } },
    } as unknown as DealKind;
    const p: Price = { form: "held", rate: typed(0.65), per: 12, every: 1 };
    const fees = [{ kind: "balance" as const }];
    const view: PriceView = priceView(fees, 0, p, TODAY);
    const s = standingView({ kind, deal: { provider: undefined } as never, today: TODAY }, fees, 0, p, view);
    expect(s.share?.state).toBe("computed");
    expect(s.share?.about).toBeUndefined();
  });
});
