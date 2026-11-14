// A fee's cases and parts in the kit: the gallery shows each piece, a case says the person's track and the open case in words as well
// as by colour, a used part is told by its ✓ and in words, and the reading's row is not drawn for a deal whose fees do not change.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { dealCases as words } from "../../copy";
import { ProvenanceProvider } from "../provenance";
import { KitGallery } from "./gallery";
import { AddSlot, CaseGrid, CaseRow, CaseTable, ConditionBand, ConditionHead, FeePalette, OpenCase, PartChip, PartEdit, ReadForBand, Toolbox } from "./index";

const today = "2026-11-13";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const html = (el: React.ReactElement) => renderToString(h(MemoryRouter, null, h(ProvenanceProvider, { data, children: el })));
/** A piece alone, without the provider's own sheet around it. */
const bare = (el: React.ReactElement) => renderToString(h(MemoryRouter, null, el));

describe("the gallery's cases and parts", () => {
  const out = html(h(KitGallery, { today }));
  it("names every piece", () => {
    for (const name of ["PartChip, PartEdit", "ConditionHead, ConditionBand, CaseRow, CaseGroup, CaseSlot, OpenCase", "CaseTable, CaseGrid, SharedLine, AddSlot", "FeePalette", "SlimFee, FeeBlock", "Toolbox, ToolBlank", "AskValues", "TickMenu, TrackMenu, RangeMenu, ThingMenu, Switch, ValueMenuSheet", "ReadForBand"]) {
      expect(out, name).toContain(`>${name}</code>`);
    }
  });
});

describe("a fee's band", () => {
  const band = (children: React.ReactNode) => html(h(ConditionBand, { things: [{ id: "a", name: "א" }], children }));
  it("heads with what the price changes by and its things alone: adding stands where the new case will", () => {
    const out = band(null);
    expect(out).toContain(words.changesBy);
    expect(bare(h(ConditionHead, { things: [{ id: "a", name: "א" }], bare: true }))).not.toContain("<button");
  });
  it("says the person's own track in words beside its value", () => {
    const out = band(h(CaseRow, { when: [{ text: "ערך" }, { text: "מסלול", mine: true }], label: "לפתוח", onOpen: () => undefined, children: null }));
    expect(out).toContain(words.mine);
  });
  it("marks the open case by its word, not only its outline", () => {
    const out = band(h(OpenCase, { slots: null, children: null }));
    expect(out).toContain(words.chosen);
  });
  it("its things are words at rest, and slots that say their menu is open with `onThing`", () => {
    expect(band(null)).not.toContain("aria-haspopup");
    const out = html(h(ConditionBand, { things: [{ id: "a", name: "א" }, { id: "b", name: "ב" }], onThing: () => undefined, openThing: "b", children: null }));
    expect(out).toMatch(/aria-haspopup="dialog" aria-expanded="false"[^>]*>א/);
    expect(out).toMatch(/aria-haspopup="dialog" aria-expanded="true"[^>]*>ב/);
  });
  it("a row that opens is one button, named for the case", () => {
    const out = band(h(CaseRow, { when: [{ text: "ערך" }], label: "לפתוח את המקרה", onOpen: () => undefined, children: null }));
    expect(out).toMatch(/<button[^>]*aria-label="לפתוח את המקרה"/);
  });
});

describe("a fee's table and grid", () => {
  const add = { label: "מקרה", onAdd: () => undefined };
  it("a table's column head opens its case, named for it; its add slot is a button that says what it adds", () => {
    const out = html(h(CaseTable, { columns: [{ id: "a", head: "ערך", label: "לפתוח את המקרה: ערך", onOpen: () => undefined }], rows: [{ id: "price", head: "שיעור", cells: [{ from: 0, span: 1, content: "1%" }] }], add }));
    expect(out).toMatch(/<button[^>]*aria-label="לפתוח את המקרה: ערך"/);
    expect(out).toMatch(/data-add-slot="column"[^>]*>.*מקרה/);
    expect(out).toContain("שיעור");
  });
  it("a table's empty place draws no cell", () => {
    const out = html(h(CaseTable, { columns: [{ id: "a", head: "א", label: "א", onOpen: () => undefined }, { id: "b", head: "ב", label: "ב", onOpen: () => undefined }], rows: [{ id: "max", head: "מקסימום", cells: [{ from: 0, span: 1, content: "10" }, { from: 1, span: 1, content: null }] }] }));
    expect(out.match(/rounded-md border border-border bg-background/g)).toHaveLength(1);
  });
  it("a grid's cell opens its case; a place no case holds is a slot that adds one there, named for the place", () => {
    const out = html(h(CaseGrid, { columns: [{ id: "x", head: "x" }, { id: "y", head: "y" }], rows: [{ id: "r", head: "r", cells: [{ from: 0, span: 1, content: "1%", label: "לפתוח: r · x", onOpen: () => undefined }, { from: 1, span: 1, empty: { label: "מקרה", spoken: "להוסיף מקרה כאן: r · y", onAdd: () => undefined } }] }], addRow: add }));
    expect(out).toMatch(/<button[^>]*aria-label="לפתוח: r · x"/);
    expect(out).toMatch(/aria-label="להוסיף מקרה כאן: r · y"/);
  });
  it("an add slot says whether its question is open", () => {
    expect(bare(h(AddSlot, { add: { ...add, expanded: true }, shape: "row" }))).toContain('aria-expanded="true"');
  });
});

describe("the fee palette", () => {
  it("is a button per fee, with its line", () => {
    const out = bare(h(FeePalette, { title: "אפשר להוסיף", items: [{ id: "fx", dot: "bg-fee-fx", name: "עמלת המרה", line: "על כל המרה" }], onAdd: () => undefined }));
    expect(out).toMatch(/<button[^>]*data-palette="fx"/);
    expect(out).toContain("על כל המרה");
  });
  it("draws nothing with nothing to add", () => {
    expect(bare(h(FeePalette, { title: "אפשר להוסיף", items: [], onAdd: () => undefined }))).toBe("");
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
  it("on a phone, held folded by the page, shows its row of groups and hides its parts and the case it adds to", () => {
    const out = html(h(Toolbox, { target: "מקרה", groups, onAdd: () => undefined, sheet: true, folded: true, onFold: () => undefined }));
    expect(out).toContain(`aria-label="${words.toolbox.unfold}"`);
    expect(out).toContain('aria-expanded="false"');
    expect(out).not.toContain(words.toolbox.target);
    expect(out).toMatch(/<div[^>]*hidden=""/);
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
