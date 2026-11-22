import { defaultExclude, defineConfig } from "vitest/config";

const FILES = ["packages/*/test/**/*.test.ts", "site/app/**/*.test.ts"];

/**
 * The topics of the deep run: a test file named `<name>.<topic>.deep.test.ts` belongs to the topic's project, `deep:<topic>`, and to no
 * other. `npm test` runs the project `fast`, every other test file; `npm run test:deep -- <topic>` one topic (tools/test-deep.mjs), and
 * `npm run test:deep` all of them, as `npm run check` and GitHub do before the site updates. A deep file holds a sweep too slow for
 * every change (every fund of every index at many plans, every index rendered at the sliders' ends); its fast neighbour keeps a slice of
 * the same checks.
 */
export const DEEP_TOPICS = ["deals", "fees", "tax", "data", "pages"] as const;

export default defineConfig({
  test: {
    // The fast run and one per deep topic, each with the settings below (`extends: true`); `vitest run` with no `--project` runs them all.
    projects: [
      // a deep file of a topic not listed stays in the fast run, so no test is left out of every run
      { extends: true, test: { name: "fast", include: FILES, exclude: [...defaultExclude, ...DEEP_TOPICS.map((topic) => `**/*.${topic}.deep.test.ts`)] } },
      ...DEEP_TOPICS.map((topic) => ({ extends: true as const, test: { name: `deep:${topic}`, include: FILES.map((f) => f.replace(/\*\.test\.ts$/, `*.${topic}.deep.test.ts`)) } })),
    ],
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
    // Turns on the engine's memory of ledger runs (packages/engine/src/run-memo.ts), off on the site.
    setupFiles: ["tests/setup.ts"],
  },
});
