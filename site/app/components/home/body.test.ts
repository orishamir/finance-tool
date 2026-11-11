// The first page: the deposits row's figure is the deposits page's own heading figure as that page opens, picked at build from the same
// data with the same pick, never typed; the example claims are the rules page's own and open it with the claim typed; every group's way
// in is there.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { home, rulesFront } from "../../copy";
import { buildDepositBrowser } from "../../lib/deposit-browser.server";
import { periodBest, START_KIND, START_TERM } from "../../lib/deposit-browser";
import { parseFilters } from "../../lib/rules-filter";
import { loader } from "../../routes/home";
import { ProvenanceProvider } from "../provenance";
import { HOME_CLAIMS, HomeBody, claimHref, type HomeDeposit } from "./body";

const render = (deposit: HomeDeposit | null, guideTypes = [{ id: "keren-hishtalmut", name: "קרן השתלמות" }]) =>
  renderToString(
    createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms: {}, dimensions: {}, today: "2026-11-11" }, children: createElement(HomeBody, { guideTypes, deposit }) })),
  ).replace(/<!-- -->/g, "");

const got = await loader();

describe("the deposits row", () => {
  const data = buildDepositBrowser();

  it("names the offer the deposits page's heading names as it opens: a year, a fixed rate, P-05's amount", () => {
    expect(START_TERM).toBe("y1");
    expect(START_KIND).toBe("fixed");
    const pick = periodBest(data, START_TERM, START_KIND, data.start).pick;
    expect(pick).not.toBeNull();
    expect(got.deposit).not.toBeNull();
    expect(got.deposit!.rate).toEqual(pick!.rate_offered);
    expect(got.deposit!.bank).toBe(data.banks.find((b) => b.id === pick!.bank)!.name);
    expect(got.deposit!.amount).toBe(data.start);
  });

  it("is open to everyone: unlinked, with no condition", () => {
    const pick = periodBest(data, START_TERM, START_KIND, data.start).pick!;
    expect(pick.linkage).toBe("none");
    expect(pick.limited).toBe(false);
  });

  it("keeps the figure's own state and source, and writes no figure in its words", () => {
    expect(got.deposit!.rate.source?.url).toBeTruthy();
    expect(JSON.stringify(home.compare.deposits)).not.toMatch(/\d/);
    const out = render(got.deposit);
    expect(out).toContain(got.deposit!.bank);
    expect(out).toContain(`${String(got.deposit!.rate.value)}%`);
  });

  it("says what the page answers in words when no offer is picked", () => {
    expect(render(null)).toContain(home.compare.deposits.plain);
  });
});

describe("the example claims", () => {
  it("are the rules page's own examples", () => {
    expect(HOME_CLAIMS).toHaveLength(2);
    for (const c of HOME_CLAIMS) expect(rulesFront.ask.examples).toContain(c);
  });

  it("open the rules page with the claim typed in its field", () => {
    for (const c of HOME_CLAIMS) {
      const href = claimHref(c);
      expect(href.startsWith("/rules?")).toBe(true);
      expect(parseFilters(href.slice("/rules".length)).q).toBe(c);
    }
  });
});

describe("the page", () => {
  const out = render(got.deposit);

  it("has the three groups, in order", () => {
    const at = [home.understand.head, home.compare.head, home.check.head].map((h) => out.indexOf(`>${h}<`));
    expect(at.every((i) => i > 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("links each way in", () => {
    for (const href of ["/guide/keren-hishtalmut", "/guide", "/deposits", "/tracks", "/indices", "/companies", "/rules", "/not-covered"]) expect(out).toContain(`href="${href}"`);
    for (const c of HOME_CLAIMS) expect(out).toContain(`href="${claimHref(c).replace(/&/g, "&amp;")}"`);
  });
});
