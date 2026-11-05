// A fund's name as its report prints it: brackets that close in order, and no Hebrew letter glued to a bracket (2026-11-05).
import { describe, expect, it } from "vitest";
import { checkFundNames } from "../src/index.ts";

const of = (...he: string[]) => checkFundNames({ names: { he, en: [], tase: [] } } as never);

describe("checkFundNames", () => {
  it("passes a name as the report prints it", () => {
    expect(of("MTF סל (4D) S&P 500", 'קסם (4A) ETF ת"א 90', "מחקה (שקלית)")).toEqual([]);
  });
  it("fails a bracket that does not close, or closes before it opens", () => {
    expect(of("MTF סל (S&P 500 (4D")).toHaveLength(1);
    expect(of('קסם 4A) ETF) ת"א 90')).toHaveLength(1);
  });
  it("fails a Hebrew letter glued to the outside of a bracket", () => {
    expect(of("מור סל (4D)י S&P 500")).toHaveLength(1);
    expect(of("קסם KTF י(4D) MSCI World")).toHaveLength(1);
  });
});
