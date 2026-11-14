import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts", "site/app/**/*.test.ts"],
    // The test files of one worker share their modules (2026-10-26): each file importing the schemas, the data loaders and the engine
    // afresh was about a third of the run, and the data read once (lib/read-cache.server.ts) serves every file after the first. Safe
    // while no test patches a module or a global: the one store a test swaps (lib/state.ts) is reset before each of its tests, and
    // the records the cache hands out are frozen. The suite passes with one worker and in shuffled order.
    isolate: false,
    // Several tests sweep every index, fund or guide: about 0.5 s alone, ten times that when builds run beside them (2026-11-07,
    // pair.test.ts took 5.2 s with four builds and failed vitest's 5 s default). One limit for the whole suite instead of one per test.
    testTimeout: 30_000,
    // At most eight workers (2026-11-14): with one per core (31 here) and every worker holding the data, a check beside a
    // build used most of this machine's 20 GB, and two at once ran it out of memory.
    maxWorkers: 8,
  },
});
