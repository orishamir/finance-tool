// A fee's cases and parts in the kit: the gallery shows each piece, a case says the person's track and the open case in words as well
// as by colour, a used part is told by its ✓ and in words, and the reading's row is not drawn for a deal whose fees do not change.
import { createElement as h } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { dealCases as words } from "../../copy";
import { ProvenanceProvider } from "../provenance";
import { KitGallery } from "./gallery";
import { AddSlot, CaseGrid, CaseRow, CaseTable, ConditionBand, ConditionHead, EveryCaseParts, FeePalette, OpenCase, PartChip, PartEdit, ReadForBand, Toolbox } from "./index";

const today = "2026-11-13";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const html = (el: React.ReactElement) => renderToString(h(MemoryRouter, null, h(ProvenanceProvider, { data, children: el })));
/** A piece alone, without the provider's own sheet around it. */
const bare = (el: React.ReactElement) => renderToString(h(MemoryRouter, null, el));

describe("the gallery's cases and parts", () => {
  const out = html(h(KitGallery, { today }));
  it("names every piece", () => {
    for (const name of ["PartChip, PartEdit, KindDot", "ConditionHead, ConditionBand, CaseRow, CaseGroup, CaseSlot, OpenCase", "CaseTable, CaseGrid, EveryCaseParts, SharedLine, AddSlot", "ChangeDivider, WhenRule", "FeePalette", "SlimFee, FeeBlock", "Toolbox", "AskValues", "TickMenu, TrackMenu, RangeMenu, ThingMenu, Switch, ValueMenuSheet", "ReadForBand"]) {
      expect(out, name).toContain(`>${name}</code>`);
    }
  });
});

describe("a fee's band", () => {
  const band = (children: React.ReactNode) => html(h(ConditionBand, { things: [{ id: "a", name: "א" }], onThing: () => undefined, children }));
  it("heads with what the price changes by and its things alone: adding stands where the new case will", () => {
    const out = band(null);
    expect(out).toContain(words.changesBy);
    // a chip and nothing else: no bin beside it, its menu takes it away
    expect(bare(h(ConditionHead, { things: [{ id: "a", name: "א" }], onThing: () => undefined })).match(/<button/g)).toHaveLength(1);
  });
  it("says the person's own track in words beside its value", () => {
    const out = band(h(CaseRow, { when: [{ text: "ערך" }, { text: "מסלול", mine: true }], label: "לפתוח", onOpen: () => undefined, children: null }));
    expect(out).toContain(words.mine);
  });
  it("marks the open case by its word, not only its outline", () => {
    const out = band(h(OpenCase, { slots: null, children: null }));
    expect(out).toContain(words.chosen);
  });
  it("its things are always chips that open their menu, each saying whether it is open", () => {
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
  const add = { label: "הוספת מקרה", onAdd: () => undefined };
  it("a table's case is a tile whose head opens it, named for it; its add is a bare plus whose spoken name and title say what it adds", () => {
    const out = html(h(CaseTable, { columns: [{ id: "a", head: "ערך", label: "לפתוח את המקרה: ערך", onOpen: () => undefined }], rows: [{ id: "price", cells: [{ from: 0, span: 1, content: "1%" }] }], add }));
    expect(out.match(/data-case-tile=""/g)).toHaveLength(1);
    expect(out).toMatch(/<button[^>]*aria-label="לפתוח את המקרה: ערך"/);
    expect(out).toMatch(/<button[^>]*aria-label="הוספת מקרה"[^>]*title="הוספת מקרה"[^>]*data-head-add=""[^>]*class="[^"]*text-muted-foreground/);
    expect(out).not.toMatch(/data-head-add=""[^>]*class="[^"]*border/);
  });
  it("the open case's whole tile has the action colour's outline, and no head or cell of it another", () => {
    const out = html(h(CaseTable, { columns: [{ id: "a", head: "א", label: "א", onOpen: () => undefined, open: true }, { id: "b", head: "ב", label: "ב", onOpen: () => undefined }], rows: [{ id: "price", cells: [{ from: 0, span: 1, content: "1" }, { from: 1, span: 1, content: "2" }] }] }));
    expect(out.match(/outline-primary/g)).toHaveLength(1);
    expect(out).toMatch(/class="pointer-events-none relative rounded-md outline-2 -outline-offset-2 outline-primary" style="grid-column:1;grid-row:1 \/ span 2"/);
  });
  it("a table's empty place draws no cell", () => {
    const out = html(h(CaseTable, { columns: [{ id: "a", head: "א", label: "א", onOpen: () => undefined }, { id: "b", head: "ב", label: "ב", onOpen: () => undefined }], rows: [{ id: "price", cells: [{ from: 0, span: 1, content: "10" }, { from: 1, span: 1, content: null }] }] }));
    expect(out.match(/min-h-target min-w-0 flex-wrap content-start/g)).toHaveLength(1);
  });
  it("a grid's cell opens its case from anywhere on it, named by its row and column; a place no case holds is a slot that adds one there, named for the place", () => {
    const out = html(h(CaseGrid, { columns: [{ id: "x", head: "x" }, { id: "y", head: "y" }], rows: [{ id: "r", head: "r", cells: [{ from: 0, span: 1, content: "1%", onOpen: () => undefined }, { from: 1, span: 1, empty: { label: "מקרה", spoken: "להוסיף מקרה כאן: r · y", onAdd: () => undefined } }] }], addRow: add }));
    // no button lies over the cell: a press on its padding is the cell's own, and the figures and grips in it keep theirs
    expect(out).toMatch(/role="gridcell"[^>]*aria-labelledby="[^"]*-r0 [^"]*-c0 [^"]*"[^>]*class="[^"]*cursor-pointer/);
    expect(out).not.toContain("data-pick-card");
    expect(out).toMatch(/aria-label="להוסיף מקרה כאן: r · y"/);
  });
  it("a grid's case is a raised tile, its adds bare pluses, and a line between two rows stands in the row heads' column alone", () => {
    const cell = (from: number) => ({ from, span: 1, content: "1%", onOpen: () => undefined });
    const out = html(h(CaseGrid, { columns: [{ id: "x", head: "x" }, { id: "y", head: "y" }], rows: ["r", "s", "t"].map((id) => ({ id, head: id, cells: [cell(0), cell(1)] })), addRow: add, addColumn: { ...add, label: "הוספת ערוץ" } }));
    expect(out.match(/data-cell-face=""[^>]*class="[^"]*bg-popover/g)).toHaveLength(6);
    expect(out).not.toContain("bg-background");
    expect(out.match(/data-hairline="row" style="grid-column:1;/g)).toHaveLength(2);
    expect(out.match(/data-head-add=""[^>]*class="[^"]*text-muted-foreground/g)).toHaveLength(2);
    expect(out).not.toMatch(/data-head-add=""[^>]*class="[^"]*border/);
  });
  it("an add slot says whether its question is open", () => {
    expect(bare(h(AddSlot, { add: { ...add, expanded: true } }))).toContain('aria-expanded="true"');
  });
  it("between two columns a plus adds one there, named by the two; none where the place gives nothing", () => {
    const cols = ["א", "ב", "ג"].map((x) => ({ id: x, head: x, label: x, onOpen: () => undefined }));
    const out = html(h(CaseTable, { columns: cols, rows: [], insert: (k: number) => (k === 1 ? { label: "הוספת ערוץ", spoken: "הוספת ערוץ בין ״א״ ל״ב״", onAdd: () => undefined } : null) }));
    expect(out.match(/data-between-add="x"/g)).toHaveLength(1);
    expect(out).toMatch(/aria-label="הוספת ערוץ בין ״א״ ל״ב״"[^>]*tabindex="-1"|tabindex="-1"[^>]*aria-label="הוספת ערוץ בין ״א״ ל״ב״"/);
  });
});

describe("the parts said once for every case", () => {
  it("draw nothing with no part, no ask and no add", () => {
    expect(bare(h(EveryCaseParts, { label: "חלקים", cells: [] }))).toBe("");
  });
  it("draw each part as a cell that takes the focus, its bin named, and the quiet add after them, a 44 px button with its words", () => {
    const out = bare(h(EveryCaseParts, { label: "חלקים", cells: [{ id: "max", content: "מקסימום", onRemove: () => undefined, removeLabel: "למחוק" }], add: { label: "חלק לכל המקרים", spoken: "הוספת חלק", onAdd: () => undefined } }));
    expect(out).toContain('role="group" aria-label="חלקים"');
    expect(out).toMatch(/tabindex="0"[^>]*data-every-cell="max"/);
    expect(out).toContain('aria-label="למחוק"');
    expect(out).toMatch(/<button[^>]*aria-label="הוספת חלק"[^>]*class="[^"]*min-h-target[^"]*text-muted-foreground[^"]*hover:bg-accent/);
    expect(out).toContain("חלק לכל המקרים");
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
    expect(html(h(PartEdit, { kind: "rule", onRemove: () => undefined, children: "גם על הוראה שלא בוצעה" }))).toContain(`aria-label="${words.removePart}"`);
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
    const two = [...groups, { id: "h", kind: "rule" as const, name: "כללי הגבייה", parts: [{ id: "n", label: "הערה" }] }];
    const out = html(h(Toolbox, { target: "מקרה", groups: two, onAdd: () => undefined, sheet: true }));
    expect(out).toContain(`aria-label="${words.toolbox.groups}"`);
    expect(out).not.toContain("הערה");
  });
  it("on a phone, with `onClose`, has a ✕ that closes the open fee, named by what it does", () => {
    const out = html(h(Toolbox, { target: "מקרה", groups, onAdd: () => undefined, sheet: true, onClose: () => undefined }));
    expect(out).toMatch(new RegExp(`data-sheet-close=""[^>]*aria-label="${words.toolbox.close}"`));
    expect(html(h(Toolbox, { target: "מקרה", groups, onAdd: () => undefined, sheet: true }))).not.toContain("data-sheet-close");
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
