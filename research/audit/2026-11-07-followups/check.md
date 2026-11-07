# Independent check of guides-research-followups (after 0c9bffca)

2026-11-07. Checker who did none of the work. I read the diff `main...guides-research-followups`, the rule cards PEN-63, KGL-09, TXK-13,
TXK-17, TXK-30 and TXK open question 10, PF-23, KH-17 and KH-18, and D73. I also read the built site. It is the build of c143c821: its files
are stamped 2026-11-07 13:23 to 13:25, the last code commit c143c821 is from 02:53, and 0c9bffca (13:32) adds only files under
`research/audit/2026-11-07-followups/`. I served the build locally and drove it with Playwright at 1440x900 and 390x844 (touch). My
screenshots are in `research/audit/2026-11-07-followups/check/`.

**Verdict: fail.** There are two must-fix items. Both are a sentence on a live guide that says more than its rule: one comes from the new
loss-offset wording, the other from the renamed label. The engine removal, the golden numbers, the reading-tag swap and the two annuity
callouts hold.

## What was run

- No `npm run check` and no build, as briefed.
- `npx vitest run` on the golden tests (`golden.test.ts`, `r2-compare.test.ts`), `reading-mark.test.ts` and `guide-signature-g2.test.ts`:
  4 files, 82 passed, 1 todo.
- `npx tsc -p packages/engine --noEmit`: clean.
- `golden-diff.txt`: only the five alternative lines leave (S20 ×3, S22, S39). No other golden value moved.
- `merge-review.mjs <merge-base>` lists two components outside the kit and one caution mark:
  - `OpenLossOffset` (open-tax.tsx). I keep it: one-off guide prose shared by four guides, built from `Callout`.
  - `ReadingTag` (provenance.tsx). I keep it, beside `StrengthLabel`, its sibling. But it is not in the `/kit` gallery (should-fix 6).
  - The caution `Tag` inside `ReadingTag`. I keep it: it marks a real doubt, once per step.
- `box-check.mjs` on `/guide/kupat-gemel-lehashkaa/`, phone and pc:
  - Without `?review`: 2 sliders at 1280 px. Both are hidden at 390 px, which is older than this branch.
  - With `?review --plans`: 1 marker at each width.
  - Boxes that changed on the screen: 0. Figures cut, spilled or overlapping: 0.

## Claim by claim

### 1. The annuity callout on /guide/provident-for-annuity: holds

The page now says: "הקופה לא משלמת אותה בעצמה. בקרן פנסיה הכסף שעובר מצטרף ליתרה ומומר לקצבה לפי מקדמי ההמרה של אותה קרן. לא נמצא
טקסט שמחייב קרן פנסיה לקבל את הכסף, והיא רשאית לדחות בקשת הצטרפות. אפשר להעביר את הכסף גם לחברת ביטוח, ובאילו מקדמים חברת ביטוח
ממירה אותו, עוד לא נמצא. שאלה פתוחה (PEN OQ19)."

PEN-63 says:
- "money moved in from a provident fund for annuity or a kupat gemel lehashkaa is converted like the rest of the balance"
- "No text was found that obliges a pension fund or an insurer to take a member in: the CMA's joining circular provides for a managing
  company's rejecting a request to join"
- The heading: "the fund may refuse a joining request"

The page says no more than the card, and it is narrower: it says only "pension fund", where the card adds "or an insurer". That an
insurer is a route is PEN-34. The page claims no lock on this money, which is right: PEN-61 says money from a provident fund for annuity
carries no such words. The term "מקדם המרה" is in the glossary (`data/terms/mkdm-hmrh.json`). The PEN-63 chip appears in both rules
lines. The data label in `provident-for-annuity.json` matches.

### 2. The annuity route on /guide/kupat-gemel-lehashkaa: holds on substance, Hebrew to fix

The page now says: "לפי טיוטת הבהרה מ־2020 של הממונה על שוק ההון, ביטוח וחיסכון, אחרי ההעברה אי אפשר לחזור מהבחירה בקצבה, למשל
במשיכה בסכום חד־פעמי."

PEN-63 says: "the Commissioner's clarification, published as a draft on 13.10.2020, reads that as barring a member from going back on
the choice once the money has moved, 'כגון: ... משיכת הכספים בסכום הוני' ... 'החברה המנהלת של הקופה המקבלת לא תאפשר לעמית לחזור בו
מבחירתו לקבלת קצבה'". KGL-09 repeats this.

The page names it as a draft and gives only the example the draft gives. It is silent on commuting, as the card is ("whether commuting
part of the pension counts was not found"). Should-fix 3 is about the Hebrew.

### 3. The loss-offset callout: says more than TXK-30 (must-fix 1)

The page, on the provident fund for investing and on child savings in a fund, now says: "מי שמושך לא יותר ממה שהפקיד לא משלם על
המשיכה מס הכנסה, והחברה המנהלת לא מנכה ממנה דבר במקור. זו קריאה של האתר בפקודת מס הכנסה, לא משפט מפורש בה (TXK-30). אם מי שמושך
פחות ממה שהפקיד יכול לקזז את החסר מרווח אחר, לא נמצא מקור שאומר. שאלה פתוחה (TXK OQ10)."

TXK-30 says: "Inferred, no text says it in one sentence: a lump sum that returns no more than the deposits carries no interest or other
profit, so no tax falls on it and the managing company withholds nothing". The rule is about the balance being at or below the deposits,
and its own Rule line points to TXK-13: "a partial withdrawal is split 'באופן יחסי' between principal, interest and linkage".

TXK open question 10 (2026-11-07) says: "A lump sum at or below the deposits carries no interest or other profit, so nothing is taxed or
withheld ... Still open ... whether the shortfall is a loss that offsets anything."

Two parts of the page hold: "the site's reading" matches "Inferred", and the offset is kept open. One part does not: see must-fix 1.

### 4. The reading tag: done for the "reading" label, one engine label left

- **What holds.** `ReadingMark` (the fee row) and the guide's exit step both render `ReadingTag`, "קריאה של האתר". Nothing in the site
  code maps the "reading" label to `StrengthLabel` any more. The new test pins the fee row. The old `exitReadingTag` key is gone. On
  /guide/child-savings-bank the tag looks as it did before, at both widths. The other places that show "מקור משני" (`sections.tsx`,
  `worth-knowing.tsx`, `provenance.tsx` rule cards, `documents`) are driven by a rule's or a source's real strength `secondary`, which is
  right.
- **SW-40 left over.** `packages/engine/src/variants/switching.ts:139` labels a fund transfer `secondary-source` on SW-40, and its own
  comment says "the neutrality is a reading". All six of SW-40's sources are primary. The switching pages are off the site (D38), so
  nothing shows it today. When switching is built again, a reading would read "מקור משני" (should-fix 4).
- **TXF-11, to decide.** `securities.ts:326` labels an accumulating foreign fund `secondary-source` on TXF-11. The compare page shows
  this as "המס ביציאה לפי מקור משני". TXF-11 is "by implication", and part of it is a letter read only in a copy. It is part reading and
  part secondary source; whether it keeps that label is for the tax-specialist.
- **The compare page ignores readings.** `lib/compare.ts` reads only `secondary-source` and never "reading". So a kupat gemel lehashkaa
  run whose CPI fell is unmarked there. This is older than the branch; noted, not counted.

### 5. The 15%-of-nominal alternative: removed

I grepped the whole repository for `nominal_rate`, `altTax`, `altReal`, `altNominal`, `kglAlt`, `nominalRate`, `altNote`, `altBefore`,
`tax15nom`, `V15`, "15% nominal", "15%-nominal", "15%-of-nominal" and "15% of the nominal".

What is left:
- **TXK-06's rule data** (`data/rules/txk-06.json`, figure `nominal_rate`). This is the law's other limb, and its note says it "does not
  reach kupat gemel lehashkaa gains". It shows on the rules page and in the TXK-06 card, worded "הפקודה קובעת שיעור נמוך יותר על הרווח
  הנומינלי, אבל הוא לא חל כאן". Right to keep.
- **The 15% on unlinked deposits, bonds and the child-savings bank route** (TXI-03, TXK-29). Not this line.
- **Statements that the line is gone** in method F-44 and G-02, D73 and scenarios S20.
- **The `altBefore` in `guide-signature/index.tsx:74`.** It is a different key ("הכי קרוב לזה").

Nothing in `site/build` carries `altTaxAtExit`, `altNominal` or `altReal`. The held visual (`?review`) shows only "המס הוא עד 25% מהרווח
הריאלי, ומנוכה במקור…", with no gap where the line was. The exit step shows "עד 25% מהרווח הריאלי" with no alternative line and no tag.

Two leftovers come from the same change:
- **The golden docs.** `tests/golden/scenarios.md:166` is a line the branch edited, and it still says 'the label "base: secondary
  source"'. Lines 167 and 685 and `workings.md` S20 step 6 and S39 say it too. Method F-44 says "the base carries no label", and TXK-07 is
  primary on all twelve sources (should-fix 5).
- **The F-44 `baseTag`.** "בסיס המס: לפי החברה" in `copy.ts` no longer renders, since no rule on that step is institution strength.
  Dead copy (should-fix 5).

### 6. The renamed label: false on one guide (must-fix 2)

I read the eight lines under "מעבר בין מסלולים וקופות" at 1440 and 390:
- **kupat gemel lehashkaa:** fits.
- **child savings in a fund:** fits.
- **pension (comprehensive and general):** fits. Both cover moving to another fund, though readers call a pension fund "קרן", not
  "קופה".
- **provident fund for annuity:** fits.
- **the two self-managed funds:** fit. Their first clause, "קנייה ומכירה בתוך הקופה", is neither a track nor a fund, as before.
- **keren hishtalmut:** does not fit (must-fix 2).

## Must fix

1. **The loss-offset callout tells readers that a partial withdrawal up to their deposits is tax-free.**
   - "מי שמושך לא יותר ממה שהפקיד לא משלם על המשיכה מס הכנסה" sets the condition on the amount withdrawn. TXK-30's condition is on the
     balance: "a lump sum that returns no more than the deposits".
   - TXK-13 says the opposite of what a reader takes from the page: "Taking only part of the balance does not let the saver take
     principal first."
   - Example: a fund worth 150,000 ₪ on 100,000 ₪ of deposits. A withdrawal of 50,000 ₪ is "no more than was deposited", yet a third of
     it is gains and is taxed (TXK-13).
   - On child savings, "ממה שהפקיד" is also wrong in person: National Insurance makes the deposits, not the reader.
   - A wording that fixes both, for the Hebrew editor: "כשהיתרה בקופה לא עולה על מה שהופקד בה, אין על המשיכה מס הכנסה, והחברה המנהלת
     לא מנכה ממנה דבר במקור".
   - Rule 7 asks for a reviewer test case and a line in `docs/copy.md` 2 ("Claim only what is known": a condition says what it is
     measured on, the balance or the amount withdrawn).
   - Both pages: `check/kgl-loss-*.png`, `check/child-loss-*.png`.

2. **On /guide/keren-hishtalmut the new label promises a fund transfer within 3 business days.**
   - The line is "בלי עמלה, בתוך 3 ימי עסקים לכל היותר", from PF-23 and KH-18. Those are track switches: PF-23 is "Track switching:
     within three business days".
   - KH-17 sets a fund transfer at "within 10 business days".
   - Under "מעבר בין מסלולים וקופות" the line now says a fund-to-fund move takes at most 3 business days.
   - Fix one of two ways: give this guide the old label (a per-guide label), or extend its line with KH-17's 10 days.
   - Screenshot: `check/sw-hish-1440.png`.

## Should fix

3. **Hebrew of the new lines, for the Hebrew editor.**
   - "אי אפשר לחזור מהבחירה בקצבה" is not idiomatic. "לחזור בו מ…" is the idiom, and it is gendered. "אי אפשר לבטל את הבחירה בקצבה"
     is plain.
   - "אם מי שמושך פחות ממה שהפקיד יכול לקזז את החסר מרווח אחר, לא נמצא מקור שאומר" puts the conditional first and leaves "שאומר"
     hanging. The old order, "לא נמצא מקור שאומר אם…", read better.
   - "לא נמצא טקסט שמחייב" uses "טקסט", which is close to the site's own process words. "לא נמצא חוק או הוראה שמחייבים" is plainer.
   - The year in "מ־2020" is not isolated, against the rule to isolate every number inside Hebrew text.
   - The TXK-30 chip sits mid-callout, followed by another sentence. Design review C1 sends rule chips to the end of the paragraph.
   - A settled reading (no income tax) now opens a callout drawn as blocked, with the red lock. Only its last sentence is open.

4. **The SW-40 label.** Change `secondary-source` to `reading` in `switching.ts`, with the finance-reviewer. Ask the tax-specialist
   whether TXF-11 is a reading or a secondary source.

5. **Leftovers of the removal (rule 10).**
   - The 'label "base: secondary source"' lines in `tests/golden/scenarios.md` (166, 167, 685) and `workings.md` (S20 step 6, S39).
   - The unused `taxSteps["F-44"].baseTag`.
   - The engine still raises flag G-02 for a gap the method marks answered. Its line is now only a statement of the law ("מס הכנסה
     במשיכה חל לפי החוק על הרווח הריאלי…"). Either the method keeps G-02 as a standing note on purpose, or the flag goes.

6. **ReadingTag reached the design system but not the word list or the gallery.**
   - `docs/copy.md` 47, "One word per source strength", does not list "קריאה של האתר" or say when it is used instead of "מקור משני". The
     builders build from that list (rule 7).
   - `ReadingTag` is not in the `/kit` gallery. Neither is `StrengthLabel`.
   - A guard in `kit/guards.test.ts` could forbid `StrengthLabel strength="secondary"` wherever the "reading" label is read.

7. **Bare "מס" in lines this branch put back on screen or kept.**
   - The kupat gemel lehashkaa switch line opens "בלי מס.".
   - Both self-managed lines say "בתוך הקופה בלי מס".
   - The held visual's tax row is `taxLine: "מס"`, with "המס הוא עד…" under it.
   - All are older than the branch. The structure review fixed the same fault in the loss callout, so the sweep should take these too.

8. **Sizes.** e81c3d4c is marked small, but it changes a shared provenance piece used on two kinds of page (fee rows, guide exit step),
   which the size rule calls medium. a5283b48 changes the engine and needs the finance-reviewer.

## The two self-managed guides and TXK OQ10

No, it is not right as it stands.
- **What OQ10 is about.** OQ10 asks whether a kupat gemel lehashkaa withdrawn below its deposits gives a loss that offsets anything.
  TXK-30, beside it, reaches the self-managed kupat gemel lehashkaa (TXK-17). Neither guide is one.
- **ira-provident.** It defines its fund as "קופה שאושרה כקופת גמל לתגמולים או לקצבה". By TXK-17 its tax follows the annuity-fund rules
  (TXP). Its way out is an annuity, or "משיכה שלא כדין", taxed on the whole amount paid (TXP-18). A question about a gains-only base does
  not fit it.
- **ira-hishtalmut.** It follows the study fund's tax (TXH-09, TXH-11). No open question in `tax-hishtalmut.md` or
  `tax-pension-gemel-lekitzba.md` asks about a loss.
- **What a reader meets.** The id leads from both pages to a question about another product.
- **Fix, two options.** Take the callout off both guides, or have the tax-specialist open a TXH and a TXP question first and cite those.
  Either way the guides should not cite TXK OQ10 until a rule card covers them. This is older than the branch, so it is a should-fix
  here.

## Layout

- No horizontal scroll on any of the ten pages at 390.
- No overlap in any changed block at either width.
- At 390 the annuity callouts grow to about 206 px and the loss callout to about 159 px. All read cleanly.
- The rule and question chips are 24 px high with the shared 12 px hit extension above and below (`.rule-chip::after`), so 48 px. On
  adjacent lines they do not overlap horizontally.
- The fee row's `ReadingMark` was not seen on a page: no default run has a falling CPI. The unit test covers it.
