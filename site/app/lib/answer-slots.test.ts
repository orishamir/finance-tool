import { describe, expect, it } from "vitest";
import { parseAnswer } from "./answer-slots";

describe("parseAnswer", () => {
  it("returns plain text as one part", () => {
    expect(parseAnswer("אין מספרים")).toEqual([{ kind: "text", text: "אין מספרים" }]);
    expect(parseAnswer("")).toEqual([]);
  });
  it("splits text and slots in order", () => {
    expect(parseAnswer("המס הוא {TXS-01:rate} לכל היותר, ו־{PF-23:switch_business_days}.")).toEqual([
      { kind: "text", text: "המס הוא " },
      { kind: "slot", id: "TXS-01", figure: "rate" },
      { kind: "text", text: " לכל היותר, ו־" },
      { kind: "slot", id: "PF-23", figure: "switch_business_days" },
      { kind: "text", text: "." },
    ]);
  });
  it("handles adjacent slots and a slot at either end", () => {
    expect(parseAnswer("{A-1:x}{B-2:y}")).toEqual([
      { kind: "slot", id: "A-1", figure: "x" },
      { kind: "slot", id: "B-2", figure: "y" },
    ]);
  });
  it("leaves braces that are not slots as text", () => {
    expect(parseAnswer("{n} ו־{a:}")).toEqual([{ kind: "text", text: "{n} ו־{a:}" }]);
  });
});
