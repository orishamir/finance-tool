// Rebuild the derived value objects (fees, holdings, yields) of every stored CMA file from its own raw_fields. No download, no other
// change: run it after a derived field is added or reworded (2026-11-03: the yields). Run: npm run renormalise:cma -w @finance-tool/pipeline
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DATASETS, listPeriods, readCmaFile, renormaliseFees, serialise } from "../src/adapters/cma.ts";

const cmaDir = fileURLToPath(new URL("../../../data/cma/", import.meta.url));
for (const config of DATASETS) {
  for (const period of listPeriods(cmaDir, config.dataset)) {
    const file = readCmaFile(cmaDir, config.dataset, period);
    writeFileSync(`${cmaDir}${config.dataset}@${period}.json`, serialise(renormaliseFees(file)));
    console.log(`rebuilt ${config.dataset}@${period}`);
  }
}
