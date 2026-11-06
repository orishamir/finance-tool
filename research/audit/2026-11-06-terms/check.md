# Independent check: branch terms-glossary (ebe6786e..d23aaf6f)

2026-11-06. The checker did none of the work. It read the diff, ran the generators, opened every new row's and rule's source in
`research/library/store/`, planted terms for the ratchet, ran a trial merge with main (`git merge-tree`, clean) and ran
`npm run validate` and the test suite (no site build).

**Verdict: fail.** One must-fix: the open-question count test fails on the branch and on the trial merge. The other findings are
should-fix.

## Must fix

1. **`packages/pipeline/test/validate.test.ts` fails.** The branch adds `ETF OQ37` to `data/open-questions.json` and the rule base
   but leaves the count at 535 ("expected 536 to be 535"). On the trial merge with today's main it is 542 against 541. Raise the
   number and add a "plus ETF OQ37" line to the comment above it, following that comment's pattern. It is the only failure
   in the whole suite (1 failed, 1595 passed). `npm run validate` passes.
2. **"עמלת יצירה ופדיון" (`data/terms/amlt-ytzyrh-vpdyvn.json`) says "כשקרן מחקה".** Regulation 6 of the 2018 tracking-fund
   regulations (library 3381464207847d9b, p.4) and ETF-05 cover units of a **קרן סל**. An open tracking fund (קרן מחקה פתוחה)
   does not trade on the exchange, and the regulation does not give it this fee. The row's own ending ("לא חלה בקנייה ובמכירה
   בבורסה") already assumes an exchange-traded fund. Change it to "קרן סל" in the research file and regenerate.

## Should fix

3. **gen-terms.ts still rewrites `data/dimensions/`.** A documented run (merge_terms.py, gen_glossary.py docs/glossary.md,
   gen-terms.ts) reproduces `data/terms/` and `docs/glossary.md` byte for byte, and the hand-kept intro and sections 4 to 6 are
   kept. The same run also changes 23 of the 26 `data/dimensions/*.json` files, adding about 100 rule ids (for example ETF-68,
   ETF-69, ETF-75, ETF-79 to ETF-82, TX2-06, TXS-36, TXS-37) that `data/rules/*.json` list under those dimensions. This is
   staleness from before the branch, not a reverted hand edit. Still, anyone who runs the documented generator gets a 23-file diff
   that has nothing to do with their change, which is the problem ebe6786e set out to remove. Either commit the regenerated
   dimensions as a separate change (they feed the checklist cards), or say in the script header and in glossary.md "Where the
   rows come from" that the run also refreshes the dimensions' rule ids.
4. **The row "דמי חשבון קבועים" cites BRK-55, and BRK-55 is about to change meaning.** On main, `brokerage-account.md` has two
   `### BRK-55` headings (banks, directive 415; and First International's promotion). The rules-open-questions worktree renames
   the bank one to **BRK-61** (and the bank BRK-54 to BRK-60). This row means the directive-415 rule. After that merge, change
   its `rule_ids` BRK-55 → BRK-61 in `research/glossary/terms/b-securities.json`, then regenerate. It is the only file on this
   branch outside `data/rules/` that cites BRK-54 or BRK-55.
5. **"דמי חשבון קבועים": the explanation goes further than its source.** Directive 415 s.2(ז) (library f2301515371e486a, p.2)
   is about a fee charged in advance for a set period ("דמי ניהול רבעוניים" as an example) and refunded pro rata. It does not
   say "on the account itself, not on a given action". The term is the site's own fee category (copy.ts `fixed_period`). Either
   cut the explanation down to what s.2(ז) says, or mark the category as the site's and cite the count across the collected
   tariffs (BRK-48 alone covers four houses and is institution-scoped).
6. **"טיפול בריבית ובדיבידנד" (`typvl-brybyt-vbdybydnd.json`) opens with a general sentence sourced to one company.** "עמלה על כל
   תשלום ריבית או דיבידנד שנכנס לחשבון ניירות הערך" comes from Altshuler Shaham Trade's tariff alone (library 500b2b74e04bd53e,
   p.2, line 5: 0.3% of the interest or dividend). The company is named in the second clause, but the general first clause still
   reads as a fact about the market (CLAUDE.md "General sources first"). The variant "דמי טיפול ריבית ופדיון" is Psagot's line
   for foreign bonds' interest and redemption (BRK-48). It is a different fee and an unnamed company's word, so drop it.
7. **"מדד אג"ח" cites only the CMA track list (pp.10 to 11).** That list supports "of the state or of companies" and "a track can
   follow it". "מספר שמודד את השינוי במחירים" is the ISA guide's general definition applied to bonds, and ETF-83 itself calls
   that an inference. Cite the ISA guide (pp.11, 30) as the row's source, as the "מדד מניות" row does.
8. **"מדד מניות" says "השינוי במחירים".** The ISA definition is "שינויים בחיי הכלכלה", not prices. Four of the seven exposure pages
   the row is tied to are gross-total-return indices: TA-35, TA-90, TA-125 (ETF-42, ETF-44, ETF-45) and the MSCI factsheet
   tables. The TA-125 row on the same page says "הדיבידנדים נכללים בו". "השינוי בשווי" would fit every index.
9. **Page anchors on the CMA circular 2020-9-22.** "ממוצע דמי ניהול בקופה" links `#page=37`, but the balloon note "לידיעתך, ממוצע
   דמי ניהול בקופה" (ג.5) is on p.39 (library 9f11b17b8c8dd40e). "שכבות המס בקרן השתלמות" links `#page=92` (the start of the
   template), but table ב.8 is on p.97. "דוח שנתי מפורט" at p.92 is right.
10. **The variant "מחקה מדד S&P500" on the S&P 500 tracker-track row.** It is Meitav's own name before 30.6.2024
    (`data/catalog/meitav-*-okev-madad-sp500.json`). As a variant of a general term it can also match Israeli mutual funds
    named "... מחקה ... S&P 500", which are tracking funds, not tracks. Keep it only if search or matching needs it, and say why.
11. **The ratchet is coupled to the rule base.** Its vocabulary is every two-word phrase or abbreviation in the rule base's Terms
    tables. Any rule-base commit (the domain-specialist's or the tax-specialist's) that adds such a phrase, when a guide page
    already uses it, turns a site test red without touching the site. Dropping a NOT_A_TERM phrase does the same. This is by design
    and the error says what to do, but the rule-base owners should know. Today the rules-open-questions worktree adds no
    Terms-table rows, only sources rows, so it does not trip it.

## Notes (no action needed)

- **Index rows:** each cites only its own index owner's document and is scoped "לפי החברה" (institution) for S&P DJI, Nasdaq and
  MSCI. The TA rows cite the TASE guidelines, and the "4.8.2026" in their titles is on pages of library copy 98949e3cff3d5112.
  Each explanation matches ETF-37 to ETF-49.
- **The new rule records:** the quotes in ETF-83, CAT-45 and CAT-46 match the library text:
  - ISA guide f4aa19056ef4fd8f: pp.11, 19, 20 and 30;
  - CMA list 3c4c0c0ea5b784c3: p.1 legend, p.9 cluster heading, p.14 S&P 500 track;
  - TASE guidelines 98949e3cff3d5112: p.5 = ב6, "מדד מניות רציף";
  - ISA 2024 fund report 14b296eb56570779: p.10, "סחורות".

  Nit on CAT-45: "the other trackers of the cluster" names four, but the cluster also has "עוקב מדדים – אג"ח עם מניות (עד 25%
  מניות)" (p.12), which has no 10% to 50% rule. The government-bond tracker does not say "שאינם דומים".
- **The other new rows:** they say what their sources say, are plural or impersonal, and are short, with no digits other than
  in index names. merge_terms.py flags none of them:
  - "ניכוי בפדיון": the law, s.46(ב), library d386a692cce2ad86, pp.36 to 37;
  - "דוח שנתי מפורט": circular s.3(ה);
  - "סטית תקן" and "שארפ": ISA guide pp.19 to 20, with the 60-month window from CAT-07;
  - "עוקב מדד S&P 500": CMA list p.14.
- **Validate warnings:** "glossary term cites a rule that is not general" rises from 24 to 37. The new index rows and the BRK-48
  citations are institution-scoped, so their cards leave those rule links out. Expected.
- **Ratchet:**
  - It passes on the branch and on the trial merge with today's main (7 tests).
  - A planted `<Term id="מונח שאין לו שורה">` and a planted "תשואה כוללת ברוטו … קרן סגורה" on guide/bank-deposit both fail it,
    with the page and phrase named.
  - It is deterministic: file lists are sorted and a fresh RegExp is used for each test, so it is not flaky.
  - It misses one-word terms and copy.ts strings rendered on guide pages, as its header says.
- **Ids this branch takes in `etfs-and-index-funds.md`:** ETF-83 and open question 37 (`ETF OQ37`, also in
  data/open-questions.json). In `tracks-catalogue-and-decoder.md` it takes CAT-45 and CAT-46. The rules-open-questions worktree
  has not yet added an ETF rule or open question (its diff to that file is one header line). It renumbers BRK-54 and BRK-55 to
  BRK-60 and BRK-61 (item 4). If it takes ETF-83 or OQ37 tonight, renumber on merge, including `rule_ids` in
  `research/glossary/terms/*.json` (the rows "מדד מניות" and "מדד אג"ח" cite ETF-83), data/terms and docs/glossary.md.
