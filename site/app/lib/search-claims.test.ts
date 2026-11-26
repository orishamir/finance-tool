// The rules page's search against its yardstick (lib/search-claims.ts), over the real index and texts, built through the two
// route loaders. `known` names the claims the search still misses; the list only shrinks.
import { beforeAll, describe, expect, it } from "vitest";
import { normalize, searchEntries, type SearchEntry, type SearchTexts } from "./search";
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

// A claim's answer must not hang on how many other rules use its words: a new rule entry about interest, or a gazette booklet that
// three rules come to cite (a featured document), is added to the real index, and every claim that passed still passes.
describe("adding entries that share a claim's words drops no passing claim", () => {
  let index: SearchEntry[];
  let texts: SearchTexts;
  beforeAll(async () => {
    index = (await (await indexLoader()).json()) as SearchEntry[];
    texts = (await (await textsLoader()).json()) as SearchTexts;
  }, 120000);
  const all = [...claims, ...unseenClaims, ...reviewerClaims, ...lastClaims].filter((c) => !known.has(c.claim));
  const passes = (ix: SearchEntry[], tx: SearchTexts, c: { claim: string; rules: string[] }) =>
    searchEntries(ix, c.claim, tx)
      .filter((h) => h.entry.href.startsWith("/rules#"))
      .slice(0, 3)
      .some((h) => c.rules.includes(h.entry.key ?? ""));
  it("three rules about interest and a featured gazette booklet", () => {
    const tx: SearchTexts = { ...texts };
    const rule = (key: string, name: string, text: string): SearchEntry => {
      tx[key] = text;
      return { kind: "rule", name, line: "", href: `/rules#${key}`, norm: normalize(name), key };
    };
    const added = [
      rule("ZZ-1", "ריבית על יתרת זכות בחשבון", "הבנק משלם ריבית על יתרת זכות בחשבון עובר ושב לפי התעריפון שלו."),
      rule("ZZ-2", "ריבית על פיקדון", "ריבית על פיקדון נקבעת בהסכם עם הבנק, והבנק מפרסם אותה."),
      rule("ZZ-3", "ריבית הפריים", "ריבית הפריים היא ריבית בנק ישראל ועוד מרווח קבוע."),
    ];
    const booklet = "כללי הבנקאות (שירות ללקוח) (ריבית על פיקדונות), קובץ התקנות";
    const document: SearchEntry = { kind: "document", name: booklet, line: "", href: "/documents#doc-zz", norm: normalize(booklet) };
    const ix = [...index, ...added, document];
    expect(all.filter((c) => passes(index, texts, c) && !passes(ix, tx, c)).map((c) => c.claim)).toEqual([]);
  });
});
