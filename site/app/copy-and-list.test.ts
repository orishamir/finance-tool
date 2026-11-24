import { describe, expect, it } from "vitest";
import { andList } from "./copy";

describe("a list joined with ו", () => {
  it("joins the last item with ו, the others with commas", () => {
    expect([andList([]), andList(["פסגות"]), andList(["פסגות", "אי.בי.אי"]), andList(["א", "ב", "ג"])]).toEqual(["", "פסגות", "פסגות ואי.בי.אי", "א, ב וג"]);
  });

  it("puts a maqaf after the ו before a word that starts with ו", () => {
    expect(andList(["אי.בי.אי", "וואן זירו"])).toBe("אי.בי.אי ו־וואן זירו");
  });

  it("puts a maqaf after the ו before a Latin word or a figure, so the two never run together right to left", () => {
    expect(andList(["אינטראקטיב ישראל", "Interactive Brokers"])).toBe("אינטראקטיב ישראל ו־Interactive Brokers");
    expect(andList(["פסגות", "2025"])).toBe("פסגות ו־2025");
  });
});
