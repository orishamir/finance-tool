# Second independent check of guides-research-followups (at 54fca93a)

2026-11-07. A checker who did none of the work and did not read the builder's report. Read: `git diff main...HEAD` (34 code or doc
files), the rule cards PEN-63, TXK-30, TXK-13, TXK-17, PF-19, PF-23, KH-17, KH-18 and SW-40, D73, and the first check
(`research/audit/2026-11-07-followups/check.md`) to see which of its items were closed. Ran `npm run check` once (fresh build of
54fca93a), served it with `serve-build.mjs` on port 4791, and took screenshots at 1440x900 and 390x844 (touch) of every changed place
(this folder; `run.txt` is the log, `text-*.txt` the page text used for the word scans).

**Verdict: fail, on two small items** (the ReadingTag has no gallery entry; one method line still names SW-40's old label). Every new
Hebrew line holds against its rule, the 15% line is gone without leftovers, and the check passes.

## What was run

- `npm run check`: exit 0. Typecheck clean, 113 test files, 1,724 tests passed, 1 todo; data check passed; the site built.
- `merge-review.mjs main`: one new component outside the kit (`ReadingTag`, provenance.tsx:377) and its caution `Tag`. The caution is
  right: it marks a real doubt, once per step. The component itself: promote it (must-fix 1).
- `git merge-tree main HEAD`: merges cleanly onto today's main, which is 17 commits ahead.
- Screens: no horizontal scroll at 390 on any of the eight guides (scrollWidth 390; only the section-chip strip is wider, as designed).
  No overlap. No English except index names (MSCI World) and rule ids. No process words, apart from the founder's `?review` banner on
  the held visual, which is intended. No gendered Hebrew in the new lines (all impersonal plural).

## 1. Each new line against its rule

| Page and line | Rule | Holds? |
|---|---|---|
| provident-for-annuity, the annuity callout: the money joins the balance in a pension fund and is converted at that fund's factors; no law or provision obliges a pension fund or an insurer to accept it; a pension fund may refuse a joining request; an insurer's factors not found (PEN OQ19) | PEN-63 (bylaw s.9(7), joining circular s.14, bylaw s.13(ג)) | Yes. "רשאית לדחות" is the card's own heading; s.13(ג) lets the manager decide. |
| kupat-gemel-lehashkaa, annuity callout: by the Commissioner's 2020 draft clarification, after the move the choice of an annuity cannot be undone, for example by a lump sum | PEN-63, KGL-09 | Yes. Named as a draft, the draft's own example; silent on commuting, as the card is. |
| kupat-gemel-lehashkaa and child-savings-provident: while the balance is not above what was deposited, no income tax and nothing withheld; "the site's reading of the Ordinance, not an express sentence" | TXK-30 (inferred), TXK-13 (pro rata), TXK-23 | Yes. Measured on the balance, so a partial withdrawal is covered by TXK-13; called a reading, as the card calls it inferred. |
| same pages, blocked callout: no source on whether a withdrawal below the deposits gives an offsettable loss (TXK OQ10) | TXK-30, OQ10 | Yes. |
| keren-hishtalmut, "מעבר בין מסלולים וקופות": no fee; tracks within 3 business days at most; another study fund, whole balance, within 10 business days of a full, signed request | PF-23, KH-18, KH-17, PF-19 | Yes, except "לכל היותר" (should-fix 3). Both figures are `N` values from `data/rules/pf-23.json` and `pf-19.json`. |
| ira-hishtalmut, ira-provident: "בתוך הקופה קונים ומוכרים בלי מס רווחי הון" (body and switch line) | TXK-17 (s.9(2)(a)) | Yes. |
| kupat-gemel-lehashkaa switch line "בלי מס הכנסה"; held visual "מס הכנסה" row and note | TXK-04, TXK-05/06 | Yes. |
| kupat-gemel-lehashkaa exit step: "עד 25% מהרווח הריאלי", no second figure | TXK-07, D73 | Yes. |

Every figure on these lines is a `Num` or `N` over a `data/rules` record. The one bare number is the year of the draft ("מ־2020",
isolated), a date of a document named in PEN-63, not a figure.

## 2. The 15% line (ground rule 10)

Searched the whole repository, outside `research/`, for `nominalRate`, `nominal_rate`, `altTax`, `altNominal`, `altReal`, `altNote`,
`altRate`, `altBefore`/`altAfter` of F-44, `kglAltReal`, `exitReadingTag`, `baseTag`, "החלופה", "sensitivity line", "15% of nominal"
and the flag `G-02`. Nothing is left. What remains is right:
- `data/rules/txk-06.json` keeps `nominal_rate`: it is the law's second limb and the rule card shows it with the note that it does not
  reach this fund.
- `docs/method.md` G-02 now says the alternative is neither computed nor shown and the flag is no longer raised; F-44 says so too.
- "15% of nominal" elsewhere is the taxable money-market fund (TXS-11/12) and the child-savings bank route (TXK-29), not this line.
- `review.ts`, the glossary, design-system tokens: nothing referred to the line.

## 3. The ReadingTag

- In the code: `provenance.tsx:377`, copy in `numbers.reading`, used by the fee row (`ReadingMark`, fees/parts.tsx:88) and the guide's
  exit step (routes/guide.tsx:337). Seen on /guide/child-savings-bank at both widths (`child-bank-reading-*.png`).
- Docs: copy.md's strength words and design-system 3.2 and 11 name it and say when. Guard: `kit/guards.test.ts` item 14.
- **Gallery: missing** (must-fix 1). The first check asked for it; it was not added.
- **Not shown where a reading reaches the comparison** (should-fix 2).
- Nowhere is a settled rule tagged as a reading.

## Must fix

1. **`ReadingTag` has no gallery entry.** `site/app/components/kit/gallery.tsx` shows `IdRef` and `RulesLine` from provenance.tsx but
   neither `ReadingTag` nor its sibling `StrengthLabel`. CLAUDE.md: a new pattern goes into the kit and its gallery; the structure review
   lists it as a component outside the kit. What a builder sees: nothing on /kit tells them the tag exists, so the next one reaches for
   `StrengthLabel strength="secondary"` again. Fix: a `Demo` "StrengthLabel, ReadingTag" in gallery.tsx with each strength and the
   reading tag, and a `uses` line.
2. **`docs/method.md:330` (F-66) still says "(`secondary-source` label on SW-40)".** The engine now labels it `reading`
   (switching.ts:140). The method is what the finance-reviewer and the golden script check against. Fix: "labelled a reading (`reading`
   label on SW-40)".

## Should fix

1. **The two self-managed records still cite TXK OQ10.** `data/instruments/wrappers/ira-hishtalmut.json:315` and
   `ira-provident.json:322` say `"loss-offset": "blocked:TXK-OQ10"`. The branch took the callout off both guides because OQ10 is a question
   about the provident fund for investing (TXK-17 sends these funds to TXH and TXP). But exposure mode's checklist reads the record
   (`exposure-mode/result.tsx:281`), so a reader comparing an S&P 500 holding there is still told that the self-managed funds' loss offset
   waits on TXK OQ10. Fix: with the tax-specialist, either `"n/a"` or a TXH and a TXP question of their own (ground rule 10: the
   reversal carries its cleanup).
2. **The goal comparison drops readings silently.** `site/app/lib/compare.ts:961` collects only `secondary-source` labels into
   `secondaryRules`, and `compare/rows.tsx:71` shows the caution tag only for them. A ranked option whose run carries `reading` (child
   savings at the bank, TXK-29, on every run; a falling CPI, TXK-07, TXH-11; KH-12) shows no mark at all, while the fees page shows
   "קריאה של האתר" on the same run. Today's main also moved TXF-11 to `reading` (92ce4d75), so after the merge the gap covers that too
   (those funds are listed, not ranked, so not in the ranked row). The guard did not see it because compare.ts never reads the label.
   Fix: collect `reading` labels beside the secondary ones and render `<ReadingTag />` in the row; widen guard 14 to any file that
   filters `secondary-source` labels for display.
3. **"לכל היותר" on the study fund's track switch** (`site/app/content/guide/keren-hishtalmut.tsx:52`). KH-18 cites rule 41יא(א): if the
   date falls in a month's first three business days the fund may defer to the fourth business day. So 3 is not the maximum. The phrase is
   older than the branch but sits in the line it rewrote. Fix: "תוך 3 ימי עסקים" without "לכל היותר", or name the start-of-month
   exception.
4. **Guard 14 sees only the literal `strength="secondary"`.** routes/guide.tsx:330 renders `<StrengthLabel strength={exitWeak} />` ahead of
   the reading branch; a dynamic strength would pass the guard. Low risk today (no reading rate has a secondary source); worth a test
   case on the guide's exit step rather than a regex.

## Not this branch (seen in passing)

- 19 open-question chips read "שאלה פתוחה (פרטים)" in brackets at the end of a sentence (the new loss callout among them), against
  copy.md 1 and design-system 3 ("never in brackets at the end of a sentence"). A site-wide sweep, not this change.
- The "כסף נכנס ויוצא" switch lines end without a full stop while the cells beside them end with one.
- Bare "מס" remains in older lines of the same pages (the tax-step headlines "אין מס על הרווחים", "אין הטבת מס"; the ira-hishtalmut
  sentence the branch edited still has "כללי המס" and "בפטור ממס על הרווחים").
