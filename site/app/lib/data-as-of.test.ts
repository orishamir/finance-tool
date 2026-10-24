// The footer's "data as of" date (audit 2026-10-24, A29): the newest `checked` anywhere under data/.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { newestChecked } from "./data-as-of";
import { dataAsOf } from "./data.server";

describe("newestChecked", () => {
  it("takes the latest date across nested files, ignoring other dates", () => {
    const dir = mkdtempSync(join(tmpdir(), "asof-"));
    mkdirSync(join(dir, "a", "b"), { recursive: true });
    writeFileSync(join(dir, "x.json"), '{"checked": "2026-10-22", "effective": "2030-01-01"}');
    writeFileSync(join(dir, "a", "b", "y.json"), '{"v": {"checked":"2026-10-24"}}');
    writeFileSync(join(dir, "a", "z.json"), '{"checked": "2026-09-01"}');
    writeFileSync(join(dir, "a", "note.txt"), '"checked": "2027-01-01"');
    expect(newestChecked(dir)).toBe("2026-10-24");
  });
  it("is empty for a folder with no dates or no folder", () => {
    const dir = mkdtempSync(join(tmpdir(), "asof-"));
    writeFileSync(join(dir, "x.json"), "{}");
    expect(newestChecked(dir)).toBe("");
    expect(newestChecked(join(dir, "missing"))).toBe("");
  });
});

describe("dataAsOf", () => {
  it("is a date, not in the future, over the repository's data", () => {
    const d = dataAsOf();
    expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(d <= new Date(Date.now() + 864e5).toISOString().slice(0, 10)).toBe(true);
    expect(d >= "2026-10-22").toBe(true);
  });
});
