// Writes JSON Schema files for editor autocompletion on hand-edited data (docs/architecture.md 3.1).
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  catalogEntry,
  cmaPeriodFile,
  depositTerms,
  dimensionRecord,
  exposureRecord,
  fundListFile,
  fundRecord,
  openQuestionsFile,
  parameterRecord,
  ruleRecord,
  seriesRecord,
  termRecord,
  valueObject,
  wrapperRecord,
} from "../src/index.ts";

const out = fileURLToPath(new URL("../json/", import.meta.url));
mkdirSync(out, { recursive: true });
const schemas = {
  "value-object": valueObject,
  rule: ruleRecord,
  parameter: parameterRecord,
  "cma-period": cmaPeriodFile,
  "fund-list": fundListFile,
  wrapper: wrapperRecord,
  exposure: exposureRecord,
  fund: fundRecord,
  "deposit-terms": depositTerms,
  catalog: catalogEntry,
  term: termRecord,
  dimension: dimensionRecord,
  series: seriesRecord,
  "open-questions": openQuestionsFile,
};
for (const [name, schema] of Object.entries(schemas)) {
  writeFileSync(`${out}${name}.schema.json`, JSON.stringify(z.toJSONSchema(schema, { unrepresentable: "any" }), null, 2) + "\n");
}
