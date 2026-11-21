// npm run test:deep [-- <topic> ...]: the deep test suites, every topic or the ones named (vitest.config.ts, DEEP_TOPICS). Each topic is
// the vitest project `deep:<topic>`; a name no project has fails with the list of projects, and a topic with no deep file passes, saying
// that no test file was found. Other vitest options pass through in their `--name=value` form.
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const topics = args.filter((a) => !a.startsWith("-"));
const options = args.filter((a) => a.startsWith("-"));
const projects = topics.length ? topics.map((t) => `--project=deep:${t}`) : ["--project=deep:*"];
const r = spawnSync("npx", ["vitest", "run", ...projects, "--passWithNoTests", ...options], { stdio: "inherit" });
process.exit(r.status ?? 1);
