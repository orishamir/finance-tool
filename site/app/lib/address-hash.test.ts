// The address fragment read as an element id (lib/address-hash.ts): a stray "%" names nothing and never throws.
import { describe, expect, it } from "vitest";
import { decodedPart, hashId } from "./address-hash";

describe("hashId", () => {
  it("names the element a fragment names, decoded", () => {
    expect(hashId("#KH-09")).toBe("KH-09");
    expect(hashId("#%D7%A9%D7%9D")).toBe("שם");
    expect(hashId("terms-msci")).toBe("terms-msci");
    expect(hashId("")).toBe("");
    expect(hashId("#")).toBe("");
  });
  it("names nothing, and never throws, where an escape is broken", () => {
    for (const h of ["#%", "#d=abc%D", "#%E0", "#%zz", "#a%"]) expect(hashId(h)).toBe("");
  });
});

describe("decodedPart", () => {
  it("is null where an escape is broken", () => {
    expect(decodedPart("a%20b")).toBe("a b");
    expect(decodedPart("%")).toBeNull();
    expect(decodedPart("%E0%A4")).toBeNull();
  });
});
