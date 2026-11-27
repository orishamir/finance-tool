// Give every stored series an adapter writes the source its adapter writes today (SeriesSpec.sourceOf), from the observations already
// stored. No download, no other change: run it after an adapter changes how it writes a source. A series no adapter writes
// (data/series/mof-gov-bond-auction-coupons.json) is left as it is. Run: npm run renormalise:series -w @finance-tool/pipeline
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cpiSpec } from "../src/adapters/cbs-cpi.ts";
import { ecbFxSpec, ecbMonthEndSpec } from "../src/adapters/ecb-fx.ts";
import { mofSpec } from "../src/adapters/mof-child-savings.ts";
import { readSeries, renormaliseSeries, seriesPath, serialiseSeries } from "../src/adapters/series-common.ts";

const dataDir = fileURLToPath(new URL("../../../data/", import.meta.url));
for (const spec of [cpiSpec, ecbFxSpec, ecbMonthEndSpec, mofSpec]) {
  const stored = readSeries(dataDir, spec.id);
  if (!stored) {
    console.log(`no data/series/${spec.id}.json: nothing to rebuild`);
    continue;
  }
  writeFileSync(seriesPath(dataDir, spec.id), serialiseSeries(renormaliseSeries(spec, stored)));
  console.log(`rebuilt ${spec.id} (${stored.observations.length} observations)`);
}
