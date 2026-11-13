import { describe, expect, it } from "vitest";
import { isReligiousLaw } from "../src/index.ts";

describe("isReligiousLaw", () => {
  it("matches the regulator's Halacha and Sharia tracks, by name or classification", () => {
    for (const name of [
      "מיטב גמל להשקעה – הלכה",
      "הפניקס חיסכון לילד- שריעה",
      "הפניקס פנסיה משלימה- שריעה",
      "כלל פנסיה מסלול הלכה למקבלי קצבה",
      "אינפיניטי מקיפה הלכה",
      "מסלול הלכה מחקה מדד S&P 500",
      "מסלול כשר משולב ישראל",
      "קסם אקטיב כספית כשרה",
      "לפי כללי ההלכה היהודית או השריעה האסלאמית",
    ])
      expect(isReligiousLaw(name), name).toBe(true);
    expect(isReligiousLaw("מגדל השתלמות כללי", "הלכתי", "הלכה יהודית")).toBe(true);
    expect(isReligiousLaw("", "", "הלכה איסלאמית")).toBe(true);
  });

  it("matches the words in Latin letters", () => {
    for (const t of ["kosher ETF", "a halacha track", "Halakha", "halachic filters", "Sharia", "shariah", "Islamic law"]) expect(isReligiousLaw(t), t).toBe(true);
  });

  it("leaves ordinary words that contain the letters", () => {
    for (const t of [
      "הכשרה חברה לביטוח בע\"מ",
      "מוסד להכשרה מקצועית",
      "תקופת אכשרה",
      "אחרי פרסום הודעה במהלכה",
      "לפני השנה או במהלכה",
      "מיטב השתלמות כללי",
      "מגדל מקפת אישית עוקב מדד S&P 500",
      "prepared by Halachot for the Authority",
      "Sharpe ratio",
    ])
      expect(isReligiousLaw(t), t).toBe(false);
    expect(isReligiousLaw(undefined, null, "")).toBe(false);
  });
});
