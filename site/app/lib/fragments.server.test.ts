// The words a cited web page opens at reach the records the site reads, and every kept row still names a
// quote the data cites, so data/sources/fragments.json never carries words for a link the site no longer shows.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { feesSnapshot, fragmentsTable } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import { root } from "./data.server";
import { readParsedCached } from "./read-cache.server";
import { sourceHref } from "./sources";

const rows = fragmentsTable.parse(JSON.parse(readFileSync(join(root, "data/sources/fragments.json"), "utf8")));

describe("quote fragments", () => {
  it("attaches the fragment to the advertising entry's binding side (Psagot's custody fee)", () => {
    const file = readdirSync(join(root, "data/fees")).filter((f) => f.startsWith("psagot@")).sort().at(-1)!;
    const snap = readParsedCached(join(root, "data/fees", file), feesSnapshot);
    const custody = snap.advertising!.find((a) => a.fee === "custody")!;
    expect(sourceHref(custody.binding_source)).toContain("#:~:text=");
  });
  it("keeps only rows whose url and words a record under data/ still cites", () => {
    const cited = new Set<string>();
    const walk = (n: unknown): void => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n || typeof n !== "object") return;
      const o = n as Record<string, unknown> & { binding_source?: { url: string }; claim_source?: { url: string } };
      if (typeof o.url === "string" && typeof o.quote === "string") cited.add(`${o.url}\u0000${o.quote}`);
      if (o.binding_source && typeof o.binding_he === "string") cited.add(`${o.binding_source.url}\u0000${o.binding_he}`);
      if (o.claim_source && typeof o.claim_he === "string") cited.add(`${o.claim_source.url}\u0000${o.claim_he}`);
      Object.values(o).forEach(walk);
    };
    const files = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(d, e.name)) : e.name.endsWith(".json") ? [join(d, e.name)] : []));
    for (const f of files(join(root, "data"))) if (!f.endsWith("fragments.json")) walk(JSON.parse(readFileSync(f, "utf8")));
    expect(rows.filter((r) => !cited.has(`${r.url}\u0000${r.words}`)).map((r) => `${r.url} ${r.words}`)).toEqual([]);
  });
});
