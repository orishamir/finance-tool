import { defaultExclude, defineConfig } from "vitest/config";

/**
 * Israel's clock zone for every run, here and on GitHub alike (guidelines/code.md, "Tests"): a date formatted, or a date-only string read
 * back, comes out as it does for the people who use the site, whatever zone the machine is set to. Set before the workers start, so each
 * inherits it from the start; `test.env` below sets it again inside each worker. tests/environment.test.ts fails where it does not hold.
 */
const ZONE = "Asia/Jerusalem";
process.env.TZ = ZONE;

const FILES = ["packages/*/test/**/*.test.ts", "site/app/**/*.test.ts", "tests/*.test.ts"];

/**
 * The topics of the deep run: a test file named `<name>.<topic>.deep.test.ts` belongs to the topic's project, `deep:<topic>`, and to no
 * other. `npm test` runs the project `fast`, every other test file; `npm run test:deep -- <topic>` one topic (tools/test-deep.mjs), and
 * `npm run test:deep` all of them, as `npm run check` and GitHub do before the site updates. A deep file holds a sweep too slow for
 * every change (every fund of every index at many plans, every index rendered at the sliders' ends); its fast neighbour keeps a slice of
 * the same checks.
 */
export const DEEP_TOPICS = ["deals", "fees", "tax", "data", "pages"] as const;

/**
 * A file that holds a property test (fast-check) is named `<name>.property.test.ts`. It runs in the fast run at PROPERTY_RUNS.fast cases a
 * property and again in the project `deep:properties` at PROPERTY_RUNS.deep, so `npm run test:deep` runs every property many times. The
 * number is set once for each project, through tests/setup.ts, never in a test.
 */
const PROPERTY_FILES = FILES.map((f) => f.replace(/\*\.test\.ts$/, "*.property.test.ts"));
const PROPERTY_RUNS = { fast: 25, deep: 1000 };

export default defineConfig({
  test: {
    // The fast run and one per deep topic, each with the settings below (`extends: true`); `vitest run` with no `--project` runs them all.
    projects: [
      // a deep file of a topic not listed stays in the fast run, so no test is left out of every run
      {
        extends: true,
        test: { name: "fast", include: FILES, exclude: [...defaultExclude, ...DEEP_TOPICS.map((topic) => `**/*.${topic}.deep.test.ts`)] },
      },
      ...DEEP_TOPICS.map((topic) => ({ extends: true as const, test: { name: `deep:${topic}`, include: FILES.map((f) => f.replace(/\*\.test\.ts$/, `*.${topic}.deep.test.ts`)) } })),
      { extends: true, test: { name: "deep:properties", include: PROPERTY_FILES, provide: { propertyRuns: PROPERTY_RUNS.deep } } },
    ],
    env: { TZ: ZONE },
    provide: { propertyRuns: PROPERTY_RUNS.fast },
    // The test files of one worker share their modules: each file importing the schemas, the data loaders and the engine afresh was about
    // a third of the run, and the data read once (lib/read-cache.server.ts) serves every file after the first. Safe while no test patches
    // a module or a global for the files after it: the one store a test swaps (lib/state.ts) is reset before each of its tests, and the
    // records the cache hands out are frozen. Two test files patch and take it back: lib/device-store.test.ts stubs `window` and
    // `navigator` for each of its tests, loading the stores afresh, puts them back after each and takes fresh copies again after the file;
    // components/invest/batched-why.test.ts watches the engine's workbench in modules it loads afresh and lets them go after the file.
    // The suite passes with one worker and in shuffled order.
    isolate: false,
    // Several tests sweep every index, fund or guide: about 0.5 s alone, ten times that when builds run beside them, past vitest's 5 s
    // default. One limit for the whole suite instead of one per test.
    testTimeout: 30_000,
    // At most eight workers: with one per core (31 here) and every worker holding the data, a check beside a build used most of this
    // machine's 20 GB, and two at once ran it out of memory.
    maxWorkers: 8,
    // Turns on the engine's memory of ledger runs (packages/engine/src/run-memo.ts), off on the site, and sets the property tests' number
    // of cases for the project.
    setupFiles: ["tests/setup.ts"],
  },
});
