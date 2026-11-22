// A formula's name is the same on every page: copy.ts holds it, and no module changes the table when it loads. A name a module put
// there would show on the pre-rendered page (the server loads every module) and not in the browser on a page that never loads that
// module, so the first render there would not match the pre-rendered page. Test files share modules in a worker (vitest.config.ts,
// isolate off), so the table is read from fresh copies, before and after the modules that once changed it load.
import { describe, expect, it, vi } from "vitest";

describe("formula names", () => {
  it("loading the providers' module leaves copy.ts's table as it is", async () => {
    vi.resetModules();
    const { formulaNames } = await import("../copy");
    const own = { ...formulaNames };
    // the module loaded for what it does at load; one export named, so the test marks no other export of it as used
    const { isFxToFx } = await import("./providers");
    expect(isFxToFx).toBeTypeOf("function");
    expect(formulaNames).toEqual(own);
    vi.resetModules();
  });
});
