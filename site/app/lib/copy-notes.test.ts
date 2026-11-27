// The notes the site's own code passes to a figure's sheet, held to what the data's notes are held to (noteFlaws, @finance-tool/schema),
// and every interface string held to the research-talk phrases of the rule cards' texts (packages/pipeline/src/leftovers/phrases.json).
// A note or string still allowed a flaw is listed here, and each list only shrinks.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NOTE_FLAWS, noteFlaws, phrasesIn, type NoteFlaw } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import * as copy from "../copy";

const phrases = JSON.parse(readFileSync(join(import.meta.dirname, "../../../packages/pipeline/src/leftovers/phrases.json"), "utf8")) as {
  research_talk: { phrases: string[]; allowed: string[] };
};
const talk = phrases.research_talk;

/** Each note a builder passes to a figure (`notes:` in lib/ and components/), by where it is in copy.ts; a function's note at a sample argument. */
const COPY_NOTES: Record<string, string> = {
  "invest.bankMoneyMarketZero.trade": copy.invest.bankMoneyMarketZero.trade,
  "invest.bankMoneyMarketZero.custody": copy.invest.bankMoneyMarketZero.custody,
  "invest.depositFeeNoneByRule": copy.invest.depositFeeNoneByRule(1234),
  "r3workbench.missingNote": copy.r3workbench.missingNote,
  "depositBrowser.interest.variableNote": copy.depositBrowser.interest.variableNote,
  "trackBrowser.yield.emptyNote": `${copy.trackBrowser.yield.emptyNote.before}5${copy.trackBrowser.yield.emptyNote.after}`,
  "trackBrowser.assets.emptyNote": copy.trackBrowser.assets.emptyNote,
  ...Object.fromEntries(Object.entries(copy.flags).map(([code, text]) => [`flags.${code}`, text])),
};

/** By flaw, the notes above still allowed it. */
const NOTE_LEFTOVERS: Partial<Record<NoteFlaw, string[]>> = {
  "research-talk": [
    "flags.BANK-35",
    "flags.G-36",
    "flags.G-38",
    "flags.G-42",
    "flags.PEN-OQ7",
    "flags.TXP-11",
    "flags.TXS-OQ26",
  ],
  "too-long": [
    "flags.BANK-35",
    "flags.G-03",
    "flags.G-16",
    "flags.G-20",
    "flags.G-23",
    "flags.G-32",
    "flags.G-36",
    "flags.KGL-OQ15",
    "flags.PF-OQ18",
    "flags.TXF-22",
    "flags.TXF-27",
    "flags.TXF-OQ7",
    "flags.TXG-OQ17",
    "flags.TXK-26",
    "flags.TXP-OQ20",
  ],
};

/**
 * The phrase an interface string may hold: what guidelines/wording.md tells a page to say where the site lacks a fact or will not guess
 * ("האתר לא מצא בכללים שקרא", "האתר לא מנחש תשואה", "האתר לא ממליץ"), never how it read a rule. A figure's note is held to it too (above).
 */
const SITE_DOES = ["האתר לא"];
const COPY_TALK = talk.phrases.filter((p) => !SITE_DOES.includes(p));

/** The interface strings still allowed a research-talk phrase, by where they are in copy.ts. */
const TALK_LEFTOVERS: string[] = [
  "documents.data.funds",
  "documents.data.fundsLine",
  "documents.data.title",
  "feeDeal.builder.unread",
  "feeDeal.cases.noCurrency",
  "feeDeal.cases.notPrinted",
  "feeDeal.cases.stated.capRead",
  "feeDeal.cases.unmatched",
  "feeDeal.leftOut.unread",
  "feeDeal.read.held.perSecurity",
  "feeDeal.read.law.notJudged",
  "feeDeal.standing.bindsUnjudged",
  "feeDeal.standing.caveat.closing_account",
  "feeDeal.standing.caveatTag.closing_account",
  "feeDeal.standing.caveatTag.distribution_agreement",
  "feeDeal.standing.notSourced",
  "feeDeal.standing.otherForm",
  "flags.G-42",
  "flags.TXS-OQ26",
  "groupPrices.states.no_mention",
  "guideBlocks.exit.onlyAt.after",
  "guideBlocks.terms.pick.accountCount",
  "guideSignature.hishtalmut.story.early.linkage.after",
  "invest.kinds.gapTyped",
  "invest.labels.tax-currency-unknown.explain",
  "invest.labels.tax-on-sale-ruling.explain",
  "kit.gallery.sample.leftOut.why",
  "kit.gallery.uses.StepTag",
  "kit.gallery.uses.TypedPlain",
  "notCovered.institution.after",
  "numbers.readingDoubt.TXS-14.status",
  "provenance.sourced.notYetInForce",
  "rulesFront.claim.companiesNone",
  "signatureFacts.brokerCount",
  "sourceBlock.legendLine",
];

/** Every string copy.ts exports, by its path ("invest.title"); a function's words are its own business and are left out. */
function strings(node: unknown, path: string): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((n, i) => strings(n, `${path}.${i}`));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

const hasTalk = (text: string) => phrasesIn(text, COPY_TALK, talk.allowed).length > 0;

describe("the notes the site's code passes", () => {
  const found = Object.entries(COPY_NOTES).flatMap(([where, text]) => (Object.keys(noteFlaws(text, { talk })) as NoteFlaw[]).map((flaw) => [where, flaw] as const));
  it("carry no flaw a list does not allow", () => {
    expect(found.filter(([where, flaw]) => !NOTE_LEFTOVERS[flaw]?.includes(where)).map(([where, flaw]) => `${where} (${flaw}): ${noteFlaws(COPY_NOTES[where] ?? "", { talk })[flaw]}`)).toEqual([]);
  });
  it("leave no listed note that is fixed or gone (each list only shrinks)", () => {
    const listed = NOTE_FLAWS.flatMap((flaw) => (NOTE_LEFTOVERS[flaw] ?? []).map((where) => [where, flaw] as const));
    expect(listed.filter(([where, flaw]) => !found.some(([w, f]) => w === where && f === flaw))).toEqual([]);
  });
  it("catch a planted flaw", () => {
    expect(noteFlaws("חיפשנו ב־2026-10 לפי CAT-44.", { talk })).toMatchObject({ "research-talk": expect.any(String), "machine-date": "2026-10", "bare-id": "CAT-44" });
  });
});

describe("the interface strings", () => {
  const all = strings(copy, "");
  const offend = all.filter(([, text]) => hasTalk(text)).map(([where]) => where);
  it("say no research talk a list does not allow", () => {
    expect(offend.filter((where) => !TALK_LEFTOVERS.includes(where))).toEqual([]);
  });
  it("leave no listed string that is fixed or gone (the list only shrinks)", () => {
    expect(TALK_LEFTOVERS.filter((where) => !offend.includes(where))).toEqual([]);
  });
  it("let what the site will not do through, and catch a planted phrase about how it read a rule", () => {
    expect(hasTalk("האתר לא מצא בכללים שקרא.")).toBe(false);
    expect(hasTalk("האתר לא הצליח לחשב את הגרף.")).toBe(false);
    expect(hasTalk("האתר קרא את התקנון.")).toBe(true);
    expect(hasTalk("השיעור לא נקרא בתעריפון.")).toBe(true);
    for (const phrase of ["האתר מחשב", "האתר לוקח", "האתר מציג"]) expect(hasTalk(`${phrase} את השיעור מהתעריפון.`)).toBe(true);
  });
});
