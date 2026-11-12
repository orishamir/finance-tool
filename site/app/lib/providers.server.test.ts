// The newest fee snapshot of a provider is picked in one place (providers.server.ts), by the record's own date, and a file's
// name says the same date, so a reader of the file names (the validator's latest-record checks) picks the same record.
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { FeesSnapshot } from "@finance-tool/schema";
import { readDirFiles, root } from "./data.server";
import { feesSnapshot } from "@finance-tool/schema";
import { latestOf, latestSnapshots } from "./providers.server";

const snap = (id: string, snapshot: string) => ({ id, snapshot }) as FeesSnapshot;

describe("the newest fee snapshot", () => {
  it("is named <id>@<snapshot>.json on every record under data/fees/", () => {
    for (const { file, record } of readDirFiles("data/fees", feesSnapshot)) expect(file).toBe(`${record.id}@${record.snapshot}.json`);
  });

  it("is the latest date per provider, in the order the providers first appear", () => {
    const from = [snap("b", "2026-10-01"), snap("a", "2026-11-01"), snap("b", "2026-11-02"), snap("a", "2026-10-15")];
    expect(latestSnapshots(from)).toEqual([from[2], from[1]]);
    expect(latestOf("a", from)).toBe(from[1]);
    expect(latestOf("c", from)).toBeUndefined();
  });

  it("of one provider is the one latestSnapshots gives for it", () => {
    for (const s of latestSnapshots()) expect(latestOf(s.id)).toBe(s);
  });

  it("is picked by one function: no other file of site/app/lib defines latestSnapshots", () => {
    const dir = join(root, "site/app/lib");
    const files = readdirSync(dir, { recursive: true, encoding: "utf8" }).filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".test.ts"));
    const defining = files.filter((f) => /(?:function|const|let|var)\s+latestSnapshots\b/.test(readFileSync(join(dir, f), "utf8")));
    expect(defining).toEqual(["providers.server.ts"]);
  });
});
