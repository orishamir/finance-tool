// A formula's name is the same on every page: copy.ts holds it, and no other module replaces one when it loads; the comparison's module
// (side-effect-modules.ts) adds only names copy.ts lacks. A name it replaced would show on the pre-rendered page (the server loads every
// module) and not in the browser on a page that never loads that module, so the first render there would not match the pre-rendered page.
import { describe, expect, it } from "vitest";
import { formulaNames } from "../copy";

describe("formula names", () => {
  it("the comparison's module never replaces a formula name copy.ts holds", async () => {
    const own = { ...formulaNames };
    // the module loaded for what it does at load; one export named, so the test marks no other export of it as used
    const { evaluate } = await import("./compare");
    expect(evaluate).toBeTypeOf("function");
    for (const [id, name] of Object.entries(own)) expect(formulaNames[id], id).toBe(name);
  });
  it("the providers' module never replaces a formula name copy.ts holds", async () => {
    const own = { ...formulaNames };
    const { isFxToFx } = await import("./providers");
    expect(isFxToFx).toBeTypeOf("function");
    for (const [id, name] of Object.entries(own)) expect(formulaNames[id], id).toBe(name);
  });
});
