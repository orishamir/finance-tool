# Job 8: the exact place of what is already collected (issue 19)

## Contradictions

None. No page read contradicted a recorded value, and no value, rate, `checked` date or line changed. `fee-places.mjs apply` compares each file with its previous state and refuses any change other than `source.page` and `source.quote`.

## What changed

- The fee source now has optional `page` and `quote`, in `packages/schema/src/collections/fees.ts`, `docs/data-schema.md` section 3.6 and a new `packages/schema/json/fees.schema.json`. The export script had no fees entry; it has one now. The two checks on a value object still hold (tested), and a quote over 240 characters fails.
- Nothing in `site/`. Built before and after: the visible text of all 1,220 shared pages is identical. The three data bundles match once `page` and `quote` are removed. The workbench bundle grew by 30 KB (1.2%) and the compare bundle by 19 KB (0.8%), because they carry whole source objects.
- `research/2026-10-31-night/fee-places.mjs` (repeatable; a second `apply` places 0), `fee-places.txt` (every place, one line each) and `rule-places.txt`.
- 157 new citations in the library.

## Fee values, latest snapshot of each provider

291 values have a place, 84 have none, and 47 lines have no value to place.

| Provider | Placed | Left | Why left |
|---|---|---|---|
| Discount | 31 | 0 | |
| Mercantile | 31 | 0 | |
| FIBI | 31 | 0 | |
| Massad | 31 | 0 | |
| Mizrahi-Tefahot | 33 | 0 | |
| Jerusalem | 25 | 0 | |
| Leumi | 24 | 0 | |
| Interactive Brokers | 19 | 0 | |
| Psagot | 14 | 0 | |
| Altshuler Trade | 13 | 0 | |
| Excellence | 11 | 0 | |
| IBI | 11 | 0 | |
| Interactive Israel | 10 | 0 | |
| One Zero | 4 | 19 | the brief gives pages for two lines only; no filed copy, so no quotes |
| Meitav | 3 | 2 | the two 0 deposit lines record that no fee is named, so no words carry them |
| Hapoalim | 0 | 31 | no filed copy (brief) |
| Yahav | 0 | 32 | an Excel file; the library holds no text for it, so `cite` cannot run. Not read |

Meitav Trade and Phoenix are recorded as missing and have no lines. Not placed: the older snapshots (brief), 2 `account_opening` values and 3 `availability` sources.

Web pages (Psagot, Interactive Brokers, Meitav, two Interactive Israel lines) have a quote and no page.

## Things to know before the site links these

1. **Interactive Brokers, London in dollars.** The rows for the two London lines read "Minimum per order (shares) USD 1.70 USD 4.00 USD 6.00". I read them in the United Kingdom table, but the Netherlands table prints the same words first. A highlight link would land on the Netherlands, so only the value's title names the country. The same risk applies to any web page table with repeated rows; the "0.05% of Trade Value" rows repeat across many countries.
2. **Table cells joined.** On Interactive Brokers, Interactive Israel and the bank tables, a quote joins cells of one row in reading order. `cite` checks that each word is on the page, not that the words are consecutive. A browser highlight may not match such a quote; the PDF page link does not depend on it.
3. **Printed page against file page.** Recorded pages are the file's count, and a value's title sometimes prints another. Discount's distribution lines 4.9.x say "עמ' 15" in the title and stand on file page 16.
4. **Discount and Mercantile direct lines.** Their titles cite annex rows (Discount page 47, Mercantile page 37). I placed them on the main-page footnotes, which print all three values in one sentence.
5. **Poor text, still readable.** The library marks FIBI's annex (`7d1cf0d48500cb12`) and Massad's annex (`9023a51ca129dafa`) as `poor`. The rows used were readable, so they are placed.
6. **Excellence, foreign trades.** The minimum of 8 dollars is printed for the cents-per-share track. The line's notes already say so; it is not a contradiction.
7. **Interactive Brokers cap.** The table prints "1% of Trade Value" and footnotes print 0.5%. This is the doubt the line's notes already record; I placed the table's row and changed nothing.

## Possible gap for a data job

Leumi's tariff, file page 14, prints foreign trading ("מניות וקרנות נאמנות 0.9%, מינימום 25 דולר", and a 0.3% line with minimum 24 dollars and maximums of 7,500 and 6,750 dollars). The latest Leumi snapshot (2026-10-23) has no foreign trading line. Job 2's report does not name this as far as I searched it. I added nothing.

## Rule records: confirmed places listed, not written

`data/rules/*.json` `sources` are generated from the rule base by `packages/pipeline/scripts/extract-sources.ts`, which strips its own keys and writes them again. A hand edit would break the brief's rule against editing generated files and would be lost at the next run. The rule base is read-only for this job. So I wrote nothing to `data/rules`.

The places are confirmed and filed with `cite`, and listed in `research/2026-10-31-night/rule-places.txt` for the rule base's owner:

| Rule | Documents | Pages |
|---|---|---|
| BRK-48 | IBI, Excellence, Altshuler Trade | 4, 6, 7; 4, 6; 2, 3 |
| MF-56 | IBI, Leumi | 3; 30, 31, 33 |
| CS-05 | Yahav child-savings agreement | 4 |
| CS-30 | Yahav child-savings agreement | 5 |

For the owner:

- 145 company-document sources in the rule records have no page: 38 on filed PDFs, 94 on filed web pages and 13 with no filed copy.
- Bank and broker PDFs not done: IRA-21 (five Meitav annexes, a table rule) and BANK-37 (Yahav deposit rates, poor text, several products).
- Not reached: the provident managers' bylaws (Harel 9, Altshuler 7 plus 2, Infinity 2 and others). Most already name a section, so they are one lookup each.
- The 94 web page sources can take only a quote, and 12 of those pages have poor or no text (Leumi savings, Discount savings, Interactive Israel, the Interactive Brokers FAQ and others). Not done.
- Two parts of BRK-48 are not listed. Excellence "אינו כולל מרווח הנקבע בהסכם מול הלקוח" did not turn up in a one-line search; it may be split across lines (page 5 shows "מרווח" in note 5א), and I did not read further. The Psagot lines were not looked for, because Psagot's source is a web page.
- MF-56's rule base line already says "part 4, pp.30-34" and "p.3", yet the record carries no locator and no page. Either the records are behind the rule base or the extractor drops them. I tried the extractor in a scratch copy; it crashed partway because the copy was incomplete, so this is not settled.

## Left

- Yahav: needs the Excel file's text in the library, then 32 values.
- Hapoalim: needs a filed copy (31 values).
- One Zero: needs a filed copy for quotes and the other 9 lines (19 values).
- Rule sources: the owner moves `rule-places.txt` into the rule base, then re-extracts. The rest as listed above.
- Law links wait for issue 84, as issue 19 says.
- Issue 19 stays open: the site does not link these places yet, and that comes after a mockup.
