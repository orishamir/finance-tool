// copy.ts's counting words go through countPhrase (lib/count.ts): one and two in words, any other count as its number with the
// thousands separator, never "1 שנים".
import { describe, expect, it } from "vitest";
import { companyPage, invest } from "../copy";
import { countPhrase, plainNumber } from "./count";

describe("countPhrase", () => {
  it("writes the number as fmt.number does, the true minus sign included", () => {
    expect(plainNumber(1234.567)).toBe("1,234.57");
    expect(plainNumber(-3)).toBe("‎−3");
    expect(countPhrase(1000, { one: "שנה", two: "שנתיים", many: "שנים" })).toBe("1,000 שנים");
  });
});

describe("copy.ts's counting words", () => {
  it("say one and two in words, and the number and the plural for any other count", () => {
    const u = companyPage.units;
    expect([u.funds(1), u.funds(2), u.funds(3), u.funds(1250)]).toEqual(["קרן אחת", "שתי קרנות", "3 קרנות", "1,250 קרנות"]);
    expect([u.deposits(1), u.deposits(2), u.deposits(40)]).toEqual(["פיקדון אחד", "שני פיקדונות", "40 פיקדונות"]);
    expect([u.plans(1), u.plans(2), u.plans(7)]).toEqual(["תוכנית אחת", "שתי תוכניות", "7 תוכניות"]);
    expect([invest.kinds.groupCount(1), invest.kinds.groupCount(2), invest.kinds.groupCount(12)]).toEqual(["קרן אחת", "שתי קרנות", "12 קרנות"]);
  });

  it("say a span of years with its own forms in each sentence", () => {
    const p = invest.ownAccount.panel;
    expect([p.tileLeft(1), p.tileLeft(2), p.tileLeft(20)]).toEqual(["נשאר אחרי שנה אחת", "נשאר אחרי שנתיים", "נשאר אחרי 20 שנים"]);
    expect([invest.pair.colCharges(1), invest.pair.colCharges(2), invest.pair.colCharges(40)]).toEqual(["מה החשבון גובה בשנה אחת", "מה החשבון גובה בשנתיים", "מה החשבון גובה ב־40 שנים"]);
    expect(invest.dollar.stretchAbout(2)).toBe("השינוי הממוצע לשנה של הדולר מול השקל, על פני שנתיים רצופות");
    expect(invest.dollar.stretchAbout(5)).toBe("השינוי הממוצע לשנה של הדולר מול השקל, על פני 5 שנים רצופות");
    const end = (h: number) => invest.dollar.planPoint(h).replace(/^.* שווה בסוף /, "");
    expect([end(1), end(2), end(10)]).toEqual(["השנה", "השנתיים", "10 השנים"]);
  });

  it("say how long a group's price holds in years where the months make whole years, else in months", () => {
    const g = invest.ownAccount.panel.groupEnds;
    expect([g(12), g(24), g(36), g(1), g(2), g(18)]).toEqual(["שנה אחת", "שנתיים", "3 שנים", "חודש אחד", "חודשיים", "18 חודשים"]);
    expect(g(1001)).toBe("1,001 חודשים");
  });
});
