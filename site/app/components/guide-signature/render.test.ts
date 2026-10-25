// Smoke: each G1 visual renders on the server with its page data, inside the providers the guide page gives.
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { buildGuidePage } from "../../lib/guide.server";
import { InputsProvider } from "../../lib/inputs";
import { GoalsProvider } from "../../lib/goal";
import { ProvenanceProvider } from "../provenance";
import { SignatureFrame, signatureRegistry } from "./index";

describe("signature visuals render", () => {
  for (const id of Object.keys(signatureRegistry)) {
    it(id, () => {
      const p = buildGuidePage(id)!;
      const tree = createElement(MemoryRouter, null, createElement(InputsProvider, { children: createElement(GoalsProvider, { presets: {}, children: createElement(ProvenanceProvider, { data: { rules: p.rules, terms: {}, dimensions: {}, today: p.today }, children: createElement(SignatureFrame, { id, data: p.signature!, today: p.today, timeline: null }) }) }) }));
      const html = renderToString(tree);
      expect(html.length).toBeGreaterThan(500);
      expect(html).toContain("num");
    });
  }
});
