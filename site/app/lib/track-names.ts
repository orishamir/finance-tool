// A track's short name in the track browser (D54). Every track of a company in
// one product begins with the same words, the company and the product ("הראל גמל להשקעה - אשראי ואג"ח"): the group's heading says them,
// so the row keeps only what tells it from its neighbours. The full name as the company writes it stays on the track page and in the
// search. Pure: no React, no storage.

/** The words of a name. A dash glued to one side only ("לילד- שריעה", "-הלכה") is a word of its own, so two spellings of one name share a prefix. */
const words = (s: string): string[] =>
  s
    .replace(/(\S)-(\s)/g, "$1 -$2")
    .replace(/(\s)-(\S)/g, "$1- $2")
    .split(/\s+/)
    .filter(Boolean);

/** The regulator writes "S&P" as "S1;P" in the pension file (14054 "עוקב מדד S1;P 500") and as "s&p" in many kinds and names; the site writes "S&P". */
const SP_WRITTEN = /(?<![A-Za-z])[sS](?:1;|&)[pP](?![A-Za-z])/g;
const mendSP = (s: string): string => s.replace(SP_WRITTEN, "S&P");

/** Hebrew's one-letter prefixes: "לחוסכים" is "חוסכים" with a "to". */
const PREFIXES = "לבהוכמש";

/** A name for comparing: lower case, without spaces, quotes, dashes and brackets ("אג"ח" and "אג״ח" and "אגח" are one word). */
export const normName = (s: string): string => s.toLowerCase().replace(/[\s"״'׳\-–()]/g, "");

/** The regulator's kind of a child-savings track repeats the product's name ("חיסכון לילד - חוסכים המעדיפים סיכון גבוה"); the product is already chosen. */
export const kindLabel = (kind: string): string => mendSP(kind.trim().replace(/^חיסכון לילד\s*-\s*/, ""));

/** The words of every kind's name, normalised: a cut never takes one of them away from a track's name. */
export function kindWordSet(kinds: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const k of kinds) for (const w of words(kindLabel(k))) if (normName(w)) out.add(normName(w));
  return out;
}

/**
 * The short names of one company's tracks in one product. The cut is the words every track begins with, always leaving each track at
 * least one word, and it stops before a word of a kind's name ("חוסכים המעדיפים סיכון מוגבר" keeps its words). When one track's name
 * does not begin like the others ("מסלול בסיסי למקבלי קצבה" beside "אינפיניטי מקיפה מסלול לבני 50 עד 60"), the cut is taken over the
 * tracks that begin with the company's name, and the others keep theirs. A company with one track loses only its own name (the words
 * of `company`), when the name begins with them. A leading dash or "מסלול" goes too. A name that would be left empty stays whole.
 */
export function shortTrackNames<T extends { key: string | number; name: string }>(company: string, tracks: readonly T[], kindWords: ReadonlySet<string>): Map<string | number, string> {
  const split = tracks.map((t) => words(t.name));
  const own = words(company);
  const isKindWord = (w: string) => {
    const n = normName(w);
    return kindWords.has(n) || (n.length > 3 && PREFIXES.includes(n[0]!) && kindWords.has(n.slice(1)));
  };
  const commonCut = (list: string[][]): number => {
    if (list.length === 1) return own.every((w, i) => list[0]![i] === w) ? own.length : 0;
    const min = Math.min(...list.map((w) => w.length));
    let cut = 0;
    while (cut < min - 1 && list.every((w) => w[cut] === list[0]![cut])) cut++;
    while (cut > 0 && isKindWord(list[0]![cut - 1]!)) cut--;
    return cut;
  };
  const cuts = split.map(() => 0);
  if (tracks.length > 0) {
    const all = commonCut(split);
    if (all > 0 || tracks.length === 1) cuts.fill(all);
    else {
      const named = split.flatMap((w, i) => (own.length > 0 && w[0] === own[0] ? [i] : []));
      if (named.length > 0 && named.length < split.length) {
        const cut = commonCut(named.map((i) => split[i]!));
        for (const i of named) cuts[i] = cut;
      }
    }
  }
  const out = new Map<string | number, string>();
  tracks.forEach((t, i) => out.set(t.key, mendSP(split[i]!.slice(cuts[i]).join(" ").replace(/^[-–:]\s*/, "").replace(/^מסלול\s+/, "") || t.name)));
  return out;
}

/** Whether the row's short name already says the kind (spaces, dashes, quotes and case ignored): then the kind is not repeated beside it. */
export const nameSaysKind = (short: string, kind: string): boolean => !!normName(kind) && normName(short).includes(normName(kind));

/** Whether the short name says more than the group's kind: under a kind's heading the name is shown only then. */
export const nameAddsToKind = (short: string, kind: string): boolean => normName(short) !== normName(kind);
