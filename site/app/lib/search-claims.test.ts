// The rules page's search against its yardstick (lib/search-claims.ts), over the real index and texts, built through the two
// route loaders. `known` names the claims the search still misses; the list only shrinks.
import { beforeAll, describe, expect, it } from "vitest";
import { searchEntries, type SearchEntry, type SearchTexts } from "./search";
import { claims, lastClaims, reviewerClaims, unseenClaims } from "./search-claims";
import { loader as indexLoader } from "../routes/search-index";
import { loader as textsLoader } from "../routes/search-texts";

const known = new Set<string>([
  "קרן כספית פטורה ממס",
  "החלפת קרן סל בקרן אחרת חייבת במס",
  "המעסיק חייב להפקיד לי לקרן השתלמות",
  "מה מותר לקופת גמל לגבות ממני",
  "מס על מניות בחשבון בחו״ל",
  "כמה זמן לוקח לקבל כסף ממשיכה מקופת גמל",
  "מי שומר על הכסף בקרן נאמנות",
  "הפקיד בבנק אמר שעל קרן כספית משלמים 15 אחוז מס, בדיוק כמו בפיקדון",
  "מגיל 60 מושכים את קופת הגמל להשקעה בלי לשלם מס",
  "אג״ח ממשלתית זה כמו פיקדון, אם מחזיקים עד הסוף אי אפשר להפסיד",
  "בחיסכון לכל ילד עדיף בבנק כי שם הכסף לא יכול לרדת",
  "כדי לעבור מהבנק לבית השקעות צריך למכור את כל המניות ולשלם מס",
  "חברת הפנסיה יכולה להעלות לי את דמי הניהול מתי שבא לה",
  "הפיקדונות בבנק מבוטחים על ידי המדינה",
]);

describe("claims find the rules that answer them", () => {
  let index: SearchEntry[];
  let texts: SearchTexts;
  beforeAll(async () => {
    index = (await (await indexLoader()).json()) as SearchEntry[];
    texts = (await (await textsLoader()).json()) as SearchTexts;
  }, 120000);
  const inTopThree = (claim: string, rules: string[]) =>
    searchEntries(index, claim, texts)
      .filter((h) => h.entry.href.startsWith("/rules#"))
      .slice(0, 3)
      .some((h) => rules.includes(h.entry.key ?? ""));
  it.each([...claims, ...unseenClaims, ...reviewerClaims, ...lastClaims].map((c) => [c.claim, c.rules] as const))("%s", (claim, rules) => {
    const found = inTopThree(claim, rules);
    if (known.has(claim)) expect(found, "this claim now passes: take it off the list").toBe(false);
    else expect(found).toBe(true);
  });
});
