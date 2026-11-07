// The built-pages guard (site/scripts/hebrew-quotes.mjs, run after the build) and the kit's gershayim: an ASCII double quote between two
// Hebrew letters in what a page shows fails, and a company name from the data drawn through the kit shows the gershayim (lead, 2026-11-07:
// "בע"מ with an ASCII quote").
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
// @ts-expect-error a plain ES module script, without types
import { hebrewQuotes, shownText } from "../../../scripts/hebrew-quotes.mjs";
import { MixedName, NameLine, gershayim } from "./name";
import { DocLink } from "./doc-link";

describe("the built-pages guard reads what a page shows", () => {
  it("finds a quote between Hebrew letters in text and in a title, and not in a script or in a quoted name", () => {
    const html = `<p>מיטב גמל ופנסיה בע&quot;מ</p><a title="אג&quot;ח">x</a><script>var a = 'בע"מ';</script><p>"קרן" S&P "500"</p><p>בע״מ</p>`;
    const found = hebrewQuotes(shownText(html));
    expect(found).toHaveLength(2);
    expect(found[0]).toContain('בע"מ');
  });
});

describe("a name from the data drawn through the kit shows the gershayim", () => {
  it("MixedName, NameLine, DocLink and gershayim", () => {
    for (const html of [
      renderToStaticMarkup(createElement(MixedName, null, 'מיטב גמל ופנסיה בע"מ')),
      renderToStaticMarkup(createElement(NameLine, null, 'הראל גמל אג"ח')),
      renderToStaticMarkup(createElement(DocLink, { href: "https://example.com", children: 'תעריפון מיטב טרייד בע"מ' })),
    ]) {
      expect(hebrewQuotes(shownText(html)), html).toEqual([]);
      expect(html).toContain("״");
    }
    expect(gershayim('בע"מ')).toBe("בע״מ");
  });
});
