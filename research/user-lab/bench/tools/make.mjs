// node make.mjs screens   -> writes screens.json (the rebuild recipe for shoot.mjs)
// node make.mjs cases     -> writes ../cases.jsonl from cases.src.mjs, the flags' times and the shots on disk
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cases } from "./cases.src.mjs";
import { holdout } from "./split.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const bench = join(here, "..");
const mode = process.argv[2];

if (mode === "screens") {
  const out = cases.filter((c) => c.screens).map((c) => ({ case: c.id, sha: c.sha, screens: c.screens }));
  writeFileSync(join(here, "screens.json"), JSON.stringify(out, null, 1));
  console.log(out.length, "cases with rebuilt screens");
}

if (mode === "cases") {
  const flags = Object.fromEntries(readFileSync(join(bench, "raw", "flags.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)).map((o) => [o.id, o]));
  const lines = [];
  const missing = [];
  for (const c of cases) {
    const dir = join(bench, "shots", c.id);
    if (c.his_shot && existsSync(dir)) copyFileSync(join(bench, "raw", "images", c.his_shot), join(dir, "00-his-screen.png"));
    const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".png")).sort() : [];
    const shots = [];
    if (c.his_shot) shots.push({ path: `shots/${c.id}/00-his-screen.png`, state: "the screen as he saw it (his own screenshot)", width: null });
    if (c.screens) {
      for (const sc of c.screens) for (const w of sc.widths || [1440, 390]) {
        const tiles = files.filter((f) => f.startsWith(`${sc.name}-${w}-`));
        tiles.forEach((f, i) => shots.push({ path: `shots/${c.id}/${f}`, width: w, state: sc.state || "as the page opens", part: `${i + 1} of ${tiles.length}` }));
      }
    } else if (c.drawing) {
      files.filter((f) => !f.startsWith("00-his")).forEach((f) => shots.push({ path: `shots/${c.id}/${f}`, width: 1440, state: "a drawing" }));
    }
    if (!shots.length || shots.some((s) => !existsSync(join(bench, s.path)))) missing.push(c.id);
    const ts = c.ts || c.flags.map((f) => flags[f]?.ts).filter(Boolean).sort()[0];
    const crop = c.crop ? `key/${c.id}/his-crop.png` : null;
    if (c.crop) { mkdirSync(join(bench, "key", c.id), { recursive: true }); copyFileSync(join(bench, "raw", "images", c.crop), join(bench, crop)); }
    lines.push({
      id: c.id, ts, page: c.page,
      url: c.path ? `https://orishamir.github.io/finance-tool${c.path}` : null,
      surface: c.drawing ? "drawing" : "live",
      built_from: c.drawing ? null : c.sha,
      shots, device: c.device,
      reader_note: c.drawing ? "Drawings made by the site's designers, shown as options to choose from; any mark that one option is recommended is theirs." : null,
      split: holdout(c, ts) ? "holdout" : "train",
      group: c.group || null,
      flags: c.flags,
      key: { flag: c.key.flag, his_words: c.key.words || null, where: c.key.where, category: c.key.category,
        general_or_taste: c.key.gt, why: c.key.why, needs_outside_knowledge: c.key.outside, his_crop: crop },
    });
  }
  writeFileSync(join(bench, "cases.jsonl"), lines.map((l) => JSON.stringify(l)).join("\n") + "\n");
  console.log(lines.length, "cases;", missing.length ? "missing shots: " + missing.join(", ") : "all shots present");
}
