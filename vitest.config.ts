import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts", "site/app/**/*.test.ts"],
    // The test files of one worker share their modules (2026-10-26): each file importing the schemas, the data loaders and the engine
    // afresh was about a third of the run, and the data read once (lib/read-cache.server.ts) serves every file after the first. Safe
    // while no test patches a module or a global: the one store a test swaps (lib/state.ts) is reset before each of its tests, and
    // the records the cache hands out are frozen. The suite passes with one worker and in shuffled order.
    isolate: false,
  },
});
