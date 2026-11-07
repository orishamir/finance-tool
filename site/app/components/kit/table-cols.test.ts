// A column a phone leaves out leaves the table's grid with its cells (#190): a <col> kept at width 0 while its cells were hidden took the
// next cell into it, and two figures of the indices page's hedge table were drawn over each other at 390 px.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FixedTable, PHONE_GONE, TableCols } from "./index";

describe("a column left out on a phone", () => {
  it("hides its <col> on a phone, not a width of 0", () => {
    const html = renderToStaticMarkup(createElement("table", null, createElement(TableCols, { widths: ["auto", { pc: "20%", phone: "0" }, "auto"] })));
    const cols = html.match(/<col [^>]*>/g) ?? [];
    expect(cols).toHaveLength(3);
    expect(cols[1]).toContain("max-md:hidden");
    expect(cols[1]).not.toContain("w-(--w-phone)");
    expect(cols[0]).not.toContain("max-md:hidden");
  });
  it("FixedTable hides the column's head and cells with the same class", () => {
    const html = renderToStaticMarkup(createElement(FixedTable, { rowHead: "y", columns: [{ id: "a", head: "A" }, { id: "b", head: "B", hideOnPhone: true }, { id: "c", head: "C" }], rows: [{ key: "1", head: "1", cells: ["x", "y", "z"] }] }));
    expect(html.match(new RegExp(`class="${PHONE_GONE}"`, "g"))).toHaveLength(2);
  });
});
