// Every flag an engine run can raise has its words on the site (copy.ts `flags`): a figure's sheet shows the line beside the code, and a
// code with no line would show "הערה על החישוב:" and the bare code.
import { describe, expect, it } from "vitest";
import { RUN_FLAG_CODES } from "@finance-tool/engine";
import { flags } from "../copy";

describe("the flag lines", () => {
  it("has a line in copy.ts for every flag code an engine run can raise (RUN_FLAG_CODES)", () => {
    const missing = RUN_FLAG_CODES.filter((code) => !(code in flags) || !flags[code]!.trim());
    expect(missing).toEqual([]);
  });
});
