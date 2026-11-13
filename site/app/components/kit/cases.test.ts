// A fee's cases and parts in the kit: the gallery shows each piece, a case says the person's track and the open case in words as well
// as by colour, a used part is told by its ✓ and in words, and the reading's row is not drawn for a deal whose fees do not change.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { dealCases as words } from "../../copy";
import { ProvenanceProvider } from "../provenance";
import { KitGallery } from "./gallery";
import { CaseRow, ConditionBand, OpenCase, PartChip, PartEdit, ReadForBand, Toolbox } from "./index";

const today = "2026-11-13";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const html = (el: React.ReactElement) => renderToString(h(MemoryRouter, null, h(ProvenanceProvider, { data, children: el })));
/** A piece alone, without the provider's own sheet around it. */
const bare = (el: React.ReactElement) => renderToString(h(MemoryRouter, null, el));

describe("the gallery's cases and parts", () => {
  const out = html(h(KitGallery, { today }));
  it("names every piece", () => {
    for (const name of ["PartChip, PartEdit", "ConditionBand, CaseRow, CaseFold, CaseSlot, OpenCase", "SlimFee, FeeBlock", "Toolbox, ToolBlank", "AskValues", "TickMenu, TrackMenu, RangeMenu, Switch, ValueMenuSheet", "ReadForBand"]) {
      expect(out, name).toContain(`>${name}</code>`);
    }
  });
});

describe("a fee's band", () => {
  const band = (children: React.ReactNode) => html(h(ConditionBand, { things: [{ id: "a", name: "א" }], addCase: { onAdd: () => undefined }, children }));
  it("heads with what the price changes by and ends with the action that adds a case", () => {
    const out = band(null);
    expect(out).toContain(words.changesBy);
    expect(out).toContain(words.addCase);
  });
  it("says the person's own track in words beside its value", () => {
    const out = band(h(CaseRow, { when: [{ text: "ערך" }, { text: "מסלול", mine: true }], label: "לפתוח", onOpen: () => undefined, children: null }));
    expect(out).toContain(words.mine);
  });
  it("marks the open case by its word, not only its outline", () => {
    const out = band(h(OpenCase, { slots: null, children: null }));
    expect(out).toContain(words.chosen);
  });
  it("a row that opens is one button, named for the case", () => {
    const out = band(h(CaseRow, { when: [{ text: "ערך" }], label: "לפתוח את המקרה", onOpen: () => undefined, children: null }));
    expect(out).toMatch(/<button[^>]*aria-label="לפתוח את המקרה"/);
  });
});

describe("a part", () => {
  it("at rest is no control of its own: a tap is its row's", () => {
    expect(bare(h(PartChip, { kind: "bound", mark: "min", lead: "מינימום", figure: "8", unit: "$" }))).not.toContain("<button");
  });
  it("in edit has its ✕, named", () => {
    expect(html(h(PartEdit, { kind: "note", onRemove: () => undefined, children: "גם על הוראה שלא בוצעה" }))).toContain(`aria-label="${words.removePart}"`);
  });
});

describe("the toolbox", () => {
  const groups = [{ id: "g", kind: "bound" as const, name: "מינימום ומקסימום", parts: [{ id: "min", label: "מינימום", used: true }, { id: "max", label: "מקסימום" }] }];
  it("keeps a used part in place, says it in words and takes no tap on it", () => {
    const out = html(h(Toolbox, { target: "מקרה", groups, onAdd: () => undefined }));
    expect(out).toContain(words.toolbox.used);
    expect(out.match(/<button[^>]*disabled/g)).toHaveLength(1);
  });
  it("on a phone shows one group at a time, under a row of the groups", () => {
    const two = [...groups, { id: "h", kind: "note" as const, name: "עוד על המחיר", parts: [{ id: "n", label: "הערה" }] }];
    const out = html(h(Toolbox, { target: "מקרה", groups: two, onAdd: () => undefined, sheet: true }));
    expect(out).toContain(`aria-label="${words.toolbox.groups}"`);
    expect(out).not.toContain("הערה");
  });
});

describe("the reading's row", () => {
  it("is not drawn for a deal with nothing to pick", () => {
    expect(bare(h(ReadForBand, { picks: [] }))).toBe("");
  });
  it("leads with its words and a pick for each thing", () => {
    const out = html(h(ReadForBand, { picks: [{ name: "מה קונים", items: [{ id: "a", label: "בחו״ל" }], value: "a", onSelect: () => undefined }] }));
    expect(out).toContain(words.read.lead);
    expect(out).toContain("בחו״ל");
  });
});
