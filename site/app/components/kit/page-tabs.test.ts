// The page tabs and the sortable head: the current tab is marked and is a link, the head says its sort state, and a column
// that sorts carries aria-sort on its head cell.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { trackBrowser } from "../../copy";
import { PageTabs, ProductTable, SortHead } from "./index";

const render = (el: React.ReactElement) => renderToStaticMarkup(createElement(MemoryRouter, null, el));

describe("PageTabs", () => {
  const tabs = [
    { key: "company", label: trackBrowser.tabs.byCompany, href: "/companies" },
    { key: "product", label: trackBrowser.tabs.byProduct, href: "/tracks" },
  ];
  it("makes each tab a link and marks only the current one", () => {
    const html = render(createElement(PageTabs, { tabs, current: "product", ariaLabel: trackBrowser.tabs.aria }));
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain('href="/tracks"');
    expect(html).toContain('href="/companies"');
  });
});

describe("SortHead", () => {
  it("shows the arrow of its state, in a slot every state has", () => {
    const state = (s: "none" | "ascending" | "descending") => render(createElement(SortHead, { label: "נכסים", state: s, onPress: () => {} }));
    expect(state("ascending")).toContain("▲");
    expect(state("descending")).toContain("▼");
    expect(state("none")).toContain("⇅");
    // the bold width is held by an unseen copy of the label, so pressing it moves nothing
    expect(state("none")).toContain("invisible font-bold");
  });
});

describe("ProductTable", () => {
  const row = (key: string) => ({ key, cells: [key, "x"], phone: createElement("span", null, key) });
  it("sets aria-sort on a sorted column's head and draws a group's heading as a row group", () => {
    const html = render(
      createElement(ProductTable, {
        columns: [
          { id: "a", head: "a", sort: "descending" },
          { id: "b", head: "b" },
        ],
        groups: [{ key: "g", heading: { title: "הראל", line: "16" }, rows: [row("r1")] }],
      }),
    );
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain('scope="rowgroup"');
    expect(html).toContain("הראל");
    // before the page is in the browser both layouts are drawn, so the pre-rendered page has the phone list and the table
    expect(html).toContain("md:hidden");
    expect(html).toContain("hidden md:block");
  });
});
