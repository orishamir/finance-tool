// Every rule record says what its block gives. A record's sources, the rules it rests on, its examples and its scope are written from
// the block's Source and Scope lines by the extraction (`scripts/extract-sources.ts`). On 2026-11-12, 167 of 845 records differed from
// their blocks: a fix typed into the record and never the block, a block edited and never extracted, a registry row changed since. The
// site shows the record, so a reader saw whichever side had been touched last, right or wrong, until each was read against its document.
// This fails the check the moment a record and its block part again; the fix is in the block, then
// `npm run extract:sources -w @finance-tool/pipeline -- --only=<ID>`.
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractAll } from "../scripts/extract-sources";

describe("the rule records and their blocks", () => {
  it("no record differs from what its block's Source and Scope lines give", () => {
    const run = extractAll(fileURLToPath(new URL("../../../", import.meta.url)));
    expect(run.records).toBeGreaterThan(800);
    expect(run.drifted).toEqual([]);
  });
});
