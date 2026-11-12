// Guide and exposure prose read every rule figure through `figure(id, name)`, so a rate or a date follows its record. A call that
// names a figure no record has, or a rule its page does not ship, renders nothing where the figure should be: each call here names a
// figure its record has, and the page that shows the file holds that record.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { loadRules } from "../lib/data.server";
import { ruleFigure } from "../lib/value";
import { loader as guideLoader } from "../routes/guide";
import { loader as exposureLoader } from "../routes/exposure";

const dir = (kind: string) => join(__dirname, kind);
const calls = (file: string) => [...readFileSync(file, "utf8").matchAll(/\bfigure\(\s*"([A-Z0-9-]+)",\s*"([A-Za-z0-9_@]+)"\s*\)/g)].map((m) => ({ id: m[1]!, name: m[2]! }));
const pages = (kind: string) => readdirSync(dir(kind)).filter((f) => f.endsWith(".tsx") && !["open-tax.tsx"].includes(f)).map((f) => ({ id: f.replace(/\.tsx$/, ""), file: join(dir(kind), f) }));

describe("content figures", () => {
  it("every figure the prose reads is one its rule record has", () => {
    const rules = loadRules();
    const bad = [...pages("guide"), ...pages("exposure"), { id: "open-tax", file: join(dir("guide"), "open-tax.tsx") }].flatMap(({ id, file }) =>
      calls(file).filter((c) => !rules[c.id] || !ruleFigure(rules[c.id]!, c.name, "2026-11-12")).map((c) => `${id}: ${c.id}:${c.name}`),
    );
    expect(bad).toEqual([]);
  });

  it("each page ships the records its prose reads", async () => {
    const missing: string[] = [];
    // a file whose id is no page of its own (an exposure folded into a guide answers with a redirect) is read on no page by that id
    const load = async (loader: (a: never) => unknown, id: string) => {
      try {
        return (await loader({ params: { id } } as never)) as { rules: Record<string, RuleRecord> };
      } catch (e) {
        if (e instanceof Response) return null;
        throw e;
      }
    };
    for (const [kind, loader] of [["guide", guideLoader], ["exposure", exposureLoader]] as const)
      for (const { id, file } of pages(kind)) {
        const d = await load(loader as (a: never) => unknown, id);
        if (d) missing.push(...calls(file).filter((c) => !d.rules[c.id]).map((c) => `${kind}/${id}: ${c.id}`));
      }
    expect([...new Set(missing)]).toEqual([]);
  }, 300000);
});
