// Runs before each test file (vitest.config.ts `setupFiles`).
import fc from "fast-check";
import { inject } from "vitest";
import { keepRuns } from "../packages/engine/src/run-memo.ts";

declare module "vitest" {
  export interface ProvidedContext {
    /** The cases fast-check tries for each property: few in the fast run, many in `deep:properties` (vitest.config.ts). */
    propertyRuns: number;
  }
}

// The tests ask for the same ledger runs again and again; keeping them took about a fifth off the suite (run-memo.ts says why the site
// keeps none between plans). 4000 results per worker: an index page's runs and the next plan's, about 230 MB at most.
keepRuns(4000);

// One number of cases for every property of the project. A failure's report gives its seed and path (`{ seed, path, endOnFailure }`):
// passed back to `fc.assert` as its settings, they replay that case alone, and the case then becomes an example test.
fc.configureGlobal({ numRuns: inject("propertyRuns") });
