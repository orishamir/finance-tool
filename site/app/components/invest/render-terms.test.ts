// A house's terms on the indices page (D106, `TermsPopup`): the deal popup filled from the house's latest price list, inside the kit's
// `ReadOnly`, which is never saved or changed. Rendered on the collected data: on an index with a fund bought abroad, at a house whose list
// has no case for it, the terms say what the list lacks and offer nothing that changes the deal, while the editable popup on the same
// deal offers to add that case. Under each fee's name, the terms keep the one average of what the plan buys.
import { createElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { houseAverage, invest, numbers, provenance as provenanceWords, site } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { buildInvest, dealOnFunds, hasKinds, knownIndices, type IndexRef } from "../../lib/invest";
import { dealProviderId, withDeals } from "../../lib/deal-account/bundle";
import { houseDeal } from "../../lib/deal-account/house-deal";
import { dealStore } from "../../lib/fee-deal/store";
import type { FeesData } from "../../lib/fee-page-data";
import { allFunds, pickOfHeadline } from "./pair";
import { DealPopup, TermsPopup, type DealWorld } from "./deal-account";
import { FIXED_AVERAGES, bundle, html, plan, shown, t } from "./render-fixtures";

const w = invest.dealAccount;
const data = feesData();

/** The terms of house `house` on `world`, as the popup draws them, on `on` (the fee page's data unless given). */
const terms = (world: DealWorld, house: string, on: FeesData = data): string | null => {
  const first = houseDeal(`house:${house}`, on, t);
  if (!first) return null;
  const popup: ReactElement = createElement(TermsPopup, { data: on, today: t, first, world, house, headId: "terms", onOwn: () => undefined });
  return html(popup);
};

/** The popup on a new deal filled from house `house`'s latest list, editable, as the page opens it from the house. */
const editable = (world: DealWorld, house: string): string | null => {
  const first = houseDeal(`house:${house}`, data, t);
  if (!first) return null;
  return html(createElement(DealPopup, { data, today: t, saved: [], writable: true, first, world, headId: "deal", onDeleted: () => undefined }));
};

/** The words that open the line under a fee saying what the deal lacks for the funds bought abroad (`AbroadCaseLine`). */
const LACKS = w.abroad.lacks("").slice(0, 20);

/** Each button's words: its spoken name where it has one, else its text. */
const buttons = (out: string): string[] => [...out.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => /aria-label="([^"]*)"/.exec(m[1] ?? "")?.[1] ?? shown(m[2] ?? "").trim());

/** The page's world on `index`: its plan, its funds, the pair its headline picks. */
function worldOn(index: IndexRef): DealWorld {
  const view = buildInvest({ bundle, index, plan });
  const head = pickOfHeadline(view);
  return { bundle, index, plan, view, pick: head ? { house: head.house, fund: head.fund } : null, kinds: hasKinds(view) && !!bundle.dollarRange };
}

/**
 * An index with a fund bought abroad, and a house whose latest list has no case for it: the deal the list fills, priced on that fund on the
 * page's plan, waits on a case of a trade or a conversion.
 */
function abroadGap(): { world: DealWorld; house: string } | null {
  for (const index of knownIndices(bundle)) {
    const world = worldOn(index);
    const abroad = allFunds(world.view).filter((x) => x.option === "abroad").map((f) => f.rec.id);
    if (abroad.length === 0) continue;
    for (const h of data.houses) {
      const deal = houseDeal(`house:${h.id}`, data, t);
      if (!deal) continue;
      const got = dealOnFunds({ bundle: withDeals(bundle, [deal], data.kinds), index, plan, fundIds: abroad, providerId: dealProviderId(deal.id) });
      for (const at of got.values()) {
        const missing = at.kind === "fail" && at.reason.code === "deal-unpriced" ? at.reason.missing : null;
        if (missing?.why === "case" && (missing.kind === "trade" || missing.kind === "fx")) return { world, house: h.id };
      }
    }
  }
  return null;
}

describe("a house's terms (TermsPopup, read-only)", () => {
  const found = abroadGap();
  it("the data has an index with a fund bought abroad at a house whose list has no case for it", () => {
    expect(found).not.toBeNull();
  });
  it("say what the house's list lacks for the funds bought abroad, and offer nothing that changes the deal: the only buttons are the figures' sources, the fold and the way to enter terms of one's own", () => {
    if (!found) throw new Error("no index has a fund bought abroad at a house whose list lacks its case");
    const { world, house } = found;
    const writes = [vi.spyOn(dealStore, "update"), vi.spyOn(dealStore, "set")];
    const out = terms(world, house) ?? "";
    expect(shown(out)).toContain(LACKS);
    expect(shown(out)).not.toContain(w.abroad.add);
    const short = world.view.providers.find((p) => p.id === house)?.short ?? house;
    const other = buttons(out).filter((b) => !b.endsWith(`, ${numbers.details}`) && b !== provenanceWords.idRef.question && b !== site.close && b !== w.fromHouse(short));
    expect(other).toEqual([]);
    // nothing was written to the device's deals while the terms were drawn
    for (const write of writes) expect(write).not.toHaveBeenCalled();
    for (const write of writes) write.mockRestore();
  });
});

describe("the editable deal popup on the same house's list", () => {
  it("offers to add the case the list lacks for the funds bought abroad", () => {
    const found = abroadGap();
    if (!found) throw new Error("no index has a fund bought abroad at a house whose list lacks its case");
    const out = editable(found.world, found.house) ?? "";
    expect(shown(out)).toContain(LACKS);
    expect(buttons(out)).toContain(`+ ${w.abroad.add}`);
  });
});

describe("the averages under a fee's name in a house's terms", () => {
  it("are the one column of what the plan buys, never every column of the fee's kind", () => {
    const world = worldOn(knownIndices(bundle)[0]!);
    const house = world.pick?.house;
    if (!house) throw new Error("the first index's headline picks no house");
    // the house's every column fixed: a trade's kind holds three, so every column would name each of them
    const on: FeesData = { ...data, houses: data.houses.map((h) => (h.id === house ? { ...h, everyColumn: FIXED_AVERAGES } : h)) };
    const text = shown(terms(world, house, on) ?? "");
    const lines = [...text.matchAll(new RegExp(`${houseAverage.paidBy("[^ ]+(?: [^ ]+)?")}(.{0,60})`, "g"))].map((m) => m[1] ?? "");
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) for (const name of Object.values(houseAverage.columns)) expect(line).not.toContain(name);
  });
});
