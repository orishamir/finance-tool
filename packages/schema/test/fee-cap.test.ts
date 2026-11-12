// A fee cap's `binds` (data-schema §3.3, method F-113): kept where the records set it, and only the values the schema names.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { feeCap, securityRecord, wrapperRecord } from "../src/index.ts";

const read = (path: string): unknown => JSON.parse(readFileSync(new URL(`../../../data/instruments/${path}`, import.meta.url), "utf8"));

describe("a fee cap's binds", () => {
  it("is kept on the caps that bind banks only", () => {
    expect(wrapperRecord.parse(read("wrappers/brokerage-account.json")).fee_caps.transfer_out?.binds).toBe("banks");
    expect(securityRecord.parse(read("securities/makam.json")).fee_caps.custody?.binds).toBe("banks");
  });

  it("is absent on a cap that binds every provider, and refuses a value it does not name", () => {
    const cap = (read("wrappers/brokerage-account.json") as { fee_caps: Record<string, object> }).fee_caps.transfer_out!;
    const { binds: _, ...every } = cap as { binds?: string };
    expect(feeCap.parse(every).binds).toBeUndefined();
    expect(feeCap.safeParse({ ...every, binds: "brokers" }).success).toBe(false);
  });

  it("keeps the value object's own checks", () => {
    const cap = (read("wrappers/brokerage-account.json") as { fee_caps: Record<string, object> }).fee_caps.transfer_out!;
    expect(feeCap.safeParse({ ...cap, value: null, notes: "" }).success).toBe(false);
  });
});
