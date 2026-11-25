// A house's terms on the indices page (D106, `TermsPopup`): the deal popup filled from the house's latest price list, inside the kit's
// `ReadOnly`, which is never saved or changed. Rendered on the collected data: on an index with a fund bought abroad, at a house whose list
// has no case for it, the editable popup offers to add that case, and the terms offer nothing that changes the deal.
import { createElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { invest, numbers, provenance as provenanceWords, site } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { buildInvest, hasKinds, knownIndices } from "../../lib/invest";
import { dealFromTemplate } from "../../lib/fee-deal/templates";
import { newDeal } from "../../lib/fee-deal/model";
import { ACCOUNT_KIND } from "../../lib/fee-deal/kinds";
import { dealStore } from "../../lib/fee-deal/store";
import { ReadOnly } from "../kit";
import { allFunds, pickOfHeadline } from "./pair";
import { TermsPopup, type DealWorld } from "./deal-account";
import { bundle, html, plan, shown, t } from "./render-fixtures";

const w = invest.dealAccount;
const data = feesData();

/** The terms of house `house` on `world`, as the popup draws them, read-only or, to find what the editor would offer, editable. */
const terms = (world: DealWorld, house: string, readOnly: boolean): string | null => {
  const first = dealFromTemplate(newDeal(ACCOUNT_KIND), `house:${house}`, data, t);
  if (!first) return null;
  const popup: ReactElement = createElement(TermsPopup, { data, today: t, saved: [], writable: true, first, world, house, headId: "terms", onOwn: () => undefined });
  return html(readOnly ? createElement(ReadOnly, null, popup) : popup);
};

/** Each button's words: its spoken name where it has one, else its text. */
const buttons = (out: string): string[] => [...out.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => /aria-label="([^"]*)"/.exec(m[1] ?? "")?.[1] ?? shown(m[2] ?? "").trim());

/** An index with a fund bought abroad, and a house whose latest list has no case for it: the editable popup offers to add it. */
function abroadGap(): { world: DealWorld; house: string } | null {
  for (const index of knownIndices(bundle)) {
    const view = buildInvest({ bundle, index, plan });
    if (!allFunds(view).some((f) => f.option === "abroad")) continue;
    const head = pickOfHeadline(view);
    const world: DealWorld = { bundle, index, plan, view, pick: head ? { house: head.house, fund: head.fund } : null, kinds: hasKinds(view) && !!bundle.dollarRange };
    for (const h of data.houses) {
      const house = h.id;
      if (terms(world, house, false)?.includes(w.abroad.add)) return { world, house };
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
    const out = terms(world, house, true) ?? "";
    expect(shown(out)).toContain(w.abroad.lacks("").slice(0, 20));
    const short = world.view.providers.find((p) => p.id === house)?.short ?? house;
    const other = buttons(out).filter((b) => !b.endsWith(`, ${numbers.details}`) && b !== provenanceWords.idRef.question && b !== site.close && b !== w.fromHouse(short));
    expect(other).toEqual([]);
    // nothing was written to the device's deals while the terms were drawn
    for (const write of writes) expect(write).not.toHaveBeenCalled();
    for (const write of writes) write.mockRestore();
  });
});
