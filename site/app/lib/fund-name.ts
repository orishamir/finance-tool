// A fund's name in the index page's fund list: the index's own name taken out where the fund's name holds it verbatim ("ילין לפידות
// מחקה (4D) S&P 500" on the S&P 500 is "ילין לפידות מחקה (4D)"). Only a verbatim match is taken out, the longest of the index's names
// first, standing as words of their own; a name that spells the index another way ("MSCI WORLD" beside "MSCI World") is kept whole.
// A separator that set the index's name apart goes with it ("הראל מחקה (4A) S&P 500 - מנוטרלת מט״ח" is "הראל מחקה (4A) מנוטרלת מט״ח"), and
// none is left at either end or twice in a row. Nothing else in the name is cut.

/** Quotes as the records write them and as the page writes them (gershayim): one character for the match. */
const sameQuotes = (s: string) => s.replace(/["״]/g, '"');
const wordChar = /[\p{L}\p{N}]/u;
/** A dash, a middle dot or a comma between parts of a name, with the spaces around it. */
const SEP = "\\s*[-–—·,]\\s*";
const sepAtStart = new RegExp(`^${SEP}`);
const sepAtEnd = new RegExp(`${SEP}$`);
const sepEnds = new RegExp(`^(?:${SEP})+|(?:${SEP})+$`, "g");
const sepTwice = new RegExp(`(${SEP})(?:${SEP})+`, "g");

/** The name with the index's name taken out between `left` and `right`: the separator beside the cut goes too, the one after it first. */
function joinCut(left: string, right: string): string {
  const [l, r] = sepAtStart.test(right) ? [left, right.replace(sepAtStart, " ")] : [left.replace(sepAtEnd, " "), right];
  return (l + " " + r).replace(sepTwice, "$1").replace(sepEnds, "").replace(/\s{2,}/g, " ").trim();
}

export function shortFundName(name: string, indexNames: readonly string[]): string {
  const plain = sameQuotes(name);
  const names = [...new Set(indexNames.map((n) => sameQuotes(n.trim())).filter((n) => n.length > 1))].sort((a, b) => b.length - a.length);
  for (const n of names) {
    let from = 0;
    for (let at = plain.indexOf(n, from); at >= 0; at = plain.indexOf(n, from)) {
      const before = plain[at - 1];
      const after = plain[at + n.length];
      // the index's name as words of its own, not inside a longer word or number ("TA-125" in "TA-1250")
      if ((!before || !wordChar.test(before)) && (!after || !wordChar.test(after))) {
        const rest = joinCut(name.slice(0, at), name.slice(at + n.length));
        // a name that is the index's name and a code in brackets keeps it all
        return /\p{L}/u.test(rest.replace(/\([^)]*\)/g, "")) ? rest : name;
      }
      from = at + 1;
    }
  }
  return name;
}
