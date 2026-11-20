// Runs before each test file (vitest.config.ts `setupFiles`).
import { keepRuns } from "../packages/engine/src/run-memo.ts";

// The tests ask for the same ledger runs again and again; keeping them took about a fifth off the suite (run-memo.ts says why the site
// keeps none between plans). 4000 results per worker: an index page's runs and the next plan's, about 230 MB at most.
keepRuns(4000);
