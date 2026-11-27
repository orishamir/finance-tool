// A computed value's working (computed_from.working, data-schema §1) is how its sheet draws the sum, and the site builds it from the
// formula it draws: none is written in a file under data/, where nothing would check it against the numbers it explains.
import { relative } from "node:path";
import { objectsIn, readData, type CheckData, type CheckProblem } from "./lib/kit.ts";

export const name = "working";

export function check(data: CheckData): CheckProblem[] {
  return data.files
    .filter((f) => f.endsWith(".json"))
    .flatMap((file) =>
      objectsIn(readData(file)).flatMap(({ pointer, node }) => {
        const from = node.computed_from;
        return from && typeof from === "object" && "working" in from
          ? [{ file, message: `${relative(data.dataDir, file)}#${pointer}/computed_from/working: a working is never written in data/; the site builds it from the formula it draws` }]
          : [];
      }),
    );
}
