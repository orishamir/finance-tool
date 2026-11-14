// The prerender time check (site/scripts/prerender-time.mjs): a request is reported from half of React Router's timeout.
import { describe, expect, it } from "vitest";
import { PRERENDER_TIMEOUT_MS, prerenderTime, slowPrerender } from "../../scripts/prerender-time.mjs";

describe("site/scripts/prerender-time.mjs", () => {
  it("warns from half of the 10 s a prerender request may take, and not below", () => {
    expect(PRERENDER_TIMEOUT_MS).toBe(10_000);
    expect(slowPrerender("/finance-tool/compare-bundle.json", 4_999)).toBeNull();
    expect(slowPrerender("/finance-tool/compare-bundle.json", 8_233)).toMatch(/compare-bundle\.json took 8\.2 s, 82% of the 10 s/);
  });
  it("is a Vite plugin that times the preview server's requests", () => {
    expect(prerenderTime().name).toBe("prerender-time");
  });
});
