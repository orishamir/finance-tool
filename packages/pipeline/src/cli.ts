import { fileURLToPath } from "node:url";
import { readFormulaIds, readRuleBaseIds } from "./references.ts";
import { validateData } from "./validate.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const [command] = process.argv.slice(2);

if (command === "validate") {
  const problems = validateData({
    dataDir: `${root}data`,
    ruleBase: readRuleBaseIds(`${root}.claude/skills/il-finance/references`),
    formulas: readFormulaIds(`${root}docs/method.md`),
  });
  for (const p of problems) console.error(`${p.file}: ${p.message}`);
  console.log(problems.length === 0 ? "data/ is valid" : `${problems.length} problem(s) in data/`);
  process.exit(problems.length === 0 ? 0 : 1);
} else {
  console.error("usage: cli.ts validate");
  process.exit(2);
}
