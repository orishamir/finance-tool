// The "לפי ספק" tab leads to /workbench/providers/<wrapper>, a page built only for the wrappers in providerWrapperIds().
// A track page for another wrapper must not show the tab (research/audit/2026-10-25-link-check.md, section 7).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { r4workbench } from "../../copy";
import { prerenderPaths } from "../../lib/paths.server";
import { providerWrapperIds } from "../../lib/providers.server";
import { workbenchWrapperIds } from "../../lib/workbench.server";
import { loader } from "../../routes/workbench-tracks";
import { WorkbenchTabs, type WorkbenchTab } from "./workbench";

const tabs = (current: WorkbenchTab, wrapperId: string, hasProviders?: boolean, extra: object = {}) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(WorkbenchTabs, { current, wrapperId, hasProviders, ...extra })));

describe("the workbench tabs", () => {
  it("child savings in a provident fund has a track page and no providers page", () => {
    expect(workbenchWrapperIds()).toContain("child-savings-provident");
    expect(providerWrapperIds()).not.toContain("child-savings-provident");
    expect(prerenderPaths()).not.toContain("/workbench/providers/child-savings-provident");
  });

  it("drops the provider tab where there is no providers page, and the strip with it when only the current tab is left", () => {
    expect(tabs("track", "child-savings-provident", false)).toBe("");
    const withFund = tabs("track", "child-savings-provident", false, { fundHref: "/workbench/funds/x" });
    expect(withFund).not.toContain(r4workbench.tabs.byProvider);
    expect(withFund).not.toContain("/workbench/providers/");
    expect(withFund).toContain(r4workbench.tabs.byFund);
  });

  it("keeps the provider tab where the page exists", () => {
    const html = tabs("track", "kupat-gemel-lehashkaa", true);
    expect(html).toContain(r4workbench.tabs.byProvider);
    expect(html).toContain("/workbench/providers/kupat-gemel-lehashkaa");
    // the providers page itself always shows its own tab
    expect(tabs("provider", "brokerage-account", false)).toContain(r4workbench.tabs.byProvider);
  });

  it("the track page's loader says which wrappers have a providers page", async () => {
    const out = async (wrapper: string) => (await loader({ params: { wrapper } } as never)) as { hasProviders: boolean };
    expect((await out("child-savings-provident")).hasProviders).toBe(false);
    expect((await out("kupat-gemel-lehashkaa")).hasProviders).toBe(true);
  }, 120_000);

  it("every providers link on a track page is a page the site pre-renders", () => {
    const paths = new Set(prerenderPaths());
    for (const w of workbenchWrapperIds()) {
      const html = tabs("track", w, providerWrapperIds().includes(w));
      for (const m of html.matchAll(/href="(\/workbench\/providers\/[^"]+)"/g)) expect(paths.has(m[1]!), `${w}: ${m[1]}`).toBe(true);
    }
  });
});
