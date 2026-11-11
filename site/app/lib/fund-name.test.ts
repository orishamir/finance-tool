import { describe, expect, it } from "vitest";
import { shortFundName } from "./fund-name";

describe("a fund's name without the index's own name", () => {
  const sp = ["מדד S&P 500", "S&P 500", "עוקב מדד S&P 500"];
  it("takes out the index's name where the fund's name holds it verbatim", () => {
    expect(shortFundName("ילין לפידות מחקה (4D) S&P 500", sp)).toBe("ילין לפידות מחקה (4D)");
    expect(shortFundName("קסם S&P 500 (4D) KTF", sp)).toBe("קסם (4D) KTF");
    expect(shortFundName("iShares Core S&P 500 UCITS ETF USD (Accumulating)", sp)).toBe("iShares Core UCITS ETF USD (Accumulating)");
  });
  it("keeps the whole name where the index is spelled another way", () => {
    expect(shortFundName("תכלית MSCI WORLD (4D) TTF", ["MSCI World"])).toBe("תכלית MSCI WORLD (4D) TTF");
    expect(shortFundName("הראל מחקה (4D) NASDAQ 100", ["NASDAQ-100"])).toBe("הראל מחקה (4D) NASDAQ 100");
  });
  it("reads the records' quotes and the page's gershayim as one", () => {
    expect(shortFundName('אי.בי.אי. מחקה (4A) ת"א 125', ["ת״א 125"])).toBe("אי.בי.אי. מחקה (4A)");
  });
  it("takes the separator that set the index's name apart with it, and leaves none at either end or twice in a row", () => {
    expect(shortFundName('הראל מחקה (4A) S&P 500 - מנוטרלת מט"ח', sp)).toBe('הראל מחקה (4A) מנוטרלת מט"ח');
    expect(shortFundName("קרן אחת - S&P 500", sp)).toBe("קרן אחת");
    expect(shortFundName("S&P 500 · קרן אחת", sp)).toBe("קרן אחת");
    expect(shortFundName("קרן אחת, S&P 500, מנוטרלת", sp)).toBe("קרן אחת, מנוטרלת");
    expect(shortFundName("קרן אחת – S&P 500 – מנוטרלת", sp)).toBe("קרן אחת – מנוטרלת");
    // a dash inside a word or a number is not a separator
    expect(shortFundName("קרן TA-35 S&P 500", sp)).toBe("קרן TA-35");
  });
  it("never takes the name out of a longer word or number, and never leaves a name with no words", () => {
    expect(shortFundName("קרן TA-1250", ["TA-125"])).toBe("קרן TA-1250");
    expect(shortFundName("S&P 500 (4D)", sp)).toBe("S&P 500 (4D)");
  });
});
