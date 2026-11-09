// The deposits page's offers from the real records: a deposit whose table prints a rate for each exit period shows the bank's one figure
// beside them (Mizrahi-Tefahot 189, read from its newest file, not an older one), and a deposit only for new joiners is limited.
import { describe, expect, it } from "vitest";
import { buildDepositBrowser } from "./deposit-browser.server";

describe("the deposits page's offers", () => {
  const data = buildDepositBrowser();
  const offer = (id: string) => data.offers.find((o) => o.id === id);

  it("shows Lychee's printed effective rate, with its doubt", () => {
    const o = offer("mizrahi-tefahot-litchi-kvua-shana-189");
    expect(o?.rate_offered.value).toBe(1.52);
    expect(o?.rate_offered.doubt).toBeTruthy();
  });

  it("limits One Zero's deposit for new joiners, and only it of One Zero's", () => {
    expect(offer("one-zero-hisachon-shnati-kvua-12m")?.limited).toBe(true);
    expect(offer("one-zero-hisachon-shnati-mishtana-12m")?.limited).toBe(false);
    expect(offer("one-zero-hisachon-yomi-12m")?.limited).toBe(false);
  });
});
