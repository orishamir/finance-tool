import { describe, expect, it } from "vitest";
import { heldPages, heldSignatures, isHeld, shown } from "./review";
import { signatureRegistry } from "../components/guide-signature";

describe("held for review (lib/review.ts)", () => {
  it("a held page is held with a query, a hash or a trailing slash, and nothing else is", () => {
    for (const p of heldPages) {
      expect(isHeld(p)).toBe(true);
      expect(isHeld(`${p}?balance=1`)).toBe(true);
      expect(isHeld(`${p}#x`)).toBe(true);
      expect(isHeld(`${p}/`)).toBe(true);
    }
    expect(shown("/holdings-bundle.json")).toBe(true);
    expect(shown("/guide")).toBe(true);
  });
  it("every held visual is a visual the guide has", () => {
    for (const id of heldSignatures) expect(signatureRegistry).toHaveProperty(id);
  });
});
