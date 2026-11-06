# Independent check of branch `rules-records` (6 November 2026)

Checker: a separate session that did none of the work, briefed to try to disprove each change. Base `main`, branch head 0fc16988. Read: the whole diff (59 records, three rule base files, the report and the Hebrew editor's files), and every cited document at its cited page, from `research/library/store/` (text layers). The two copies of circular 04/2026 were fetched again by curl. `npm run validate` passes in the worktree. Tests were not re-run.

**Verdict: fail.** Two things must change before merging. Both are wording in files this branch already touches.

## Must fix

1. **SW-44 says the 2022 prices apply until the takeover, but the circular does not say that.** The record text says "עד אותו יום חל החוזר הקודם, מ־2022". The figure notes say "Until then circular 2022-10-5 applies (not read)". The rule base SW-44 conditions and PF open question 6 ("The 2022 prices hold until the new operator's takeover day") say the same. The document says otherwise, or at least says nothing of the kind:
   - s.8(א), p.4: the circular starts on 1.1.2027.
   - s.9, p.4: "חוזר זה מבטל ומחליף את חוזר סוכנים ויועצים 2022-10-5". This is part of the circular, so it starts on 1.1.2027 too.
   - s.8(ב), p.4: only s.4 waits for the takeover day.
   - Explanatory notes, p.13: "הודעה בדבר המועד תינתן על ידי הרשות סמוך לכניסה לתוקף של החוזר".

   Read literally, the old circular is cancelled on 1.1.2027 and the new per-action prices start later, so the circular leaves open what applies in between. Saying the old prices continue fills in a rule from inference.

   Suggested wording: "החוזר לא אומר אילו מחירים חלים מ־1.1.2027 ועד אותו יום. הוא מבטל את החוזר הקודם, מ־2022, ורשות שוק ההון תודיע על המועד סמוך לכניסת החוזר לתוקף." Make the matching change in the figure notes, in the rule base conditions and in PF OQ6. The open question becomes "what applies between 1.1.2027 and the takeover day", and the 2022 circular is one place to look.

2. **SW-26 cites the wrong gazette pages.** Rule 2 is on file pages 22-23 of Kovetz HaTakanot 8302, and those pages are printed **184 and 185**. File page 21 is 183, and the rules begin there; 9480's footnote "ק"ת התש"ף, עמ' 183" confirms the start. The record's `locator` and `locator_he` ("עמודים 183 עד 184 ברשומות"), its figure note, and the rule base (the SW-26 conditions, the Source line and the Sources table row) all say 183-184. The `#page=22` link is right. Change the printed pages to 184-185.

## Should fix

1. **SW-44 should say the price list may change.** The circular's explanatory notes, p.13, say: "המחירון הסופי עשוי להשתנות בהתאם לתוצאות מכרז המסלקה הפנסיונית". They add that prices for mandatory services can be updated downward under the tender's volume mechanism. A card that says "עד 11 שקלים" should carry one clause on this, for example "המחירון הסופי עשוי להשתנות לפי תוצאות המכרז". The rule base entry should carry it too.
2. **SW-44 `effective_from` 2027-01-01 on the six annex ג figures.** `startsAfter` in `provenance.tsx` shows a "starts on 1.1.2027" mark until that day. After it, the mark disappears and the cap reads as in force, even though the takeover may not have happened. The notes explain the choice, but the page shows only the mark. Either leave `effective_from` empty and say "from the takeover day" in words, or keep the date and make sure the card's text, which already says this, appears beside the figure. This is the lead's call.
3. **Leftovers of the reversed SW-44 start date** (ground rule 10). `docs/glossary.md:565` ("caps per action from 1.1.2027") and `.claude/skills/il-finance/references/coverage.md:331` still say the old date. The report hands these to the lead. They should be fixed in the same merge, not later.
4. **BANK-25 Hebrew.** "ריבית עוגן, ועוד מרווח או פחות מרווח שידוע מראש" reads stiffly. "ריבית עוגן בתוספת מרווח או בניכוי מרווח שידוע מראש" is more natural and matches "בתוספת מרווח שבירה" in BANK-33. This is minor, and the Hebrew editor's next batch can decide.
5. **SW-26 cites 22.9.2021 to circular h-2670 s.4, which says "צפויים להיכנס לתוקף"** (expected to take effect). The date is right as far as anything read shows. A source that says the date actually took effect, such as directive 448 version 2's start line, would be stronger. This was already true before the branch, so it is not a blocker.

## What held up

- **SW-26 account types.** Rule 2 (8302, file pages 22-23) matches the new sentence:
  - current account to current account: 2(1);
  - same owners, with or without added owners: 2(2)(א)-(ד);
  - trust: 3(א); guardian: 3(ב); deceased owner: 3(ד).
  - The amendment (9480 p.3574 s.2) strikes "שאותו יזם הבנק, לפי כל דין" and rewrites 2(1)(ב) as reported, so "חשבון שתהליך הסגירה שלו כבר התחיל" and "חשבון שפעילות הועברה אליו לפני פחות מ־3 חודשים" are right.
  - h-2670 pp.2-3 has both quotes word for word. "למשל" correctly marks the list as partial.
- **SW-44 VAT and start date.**
  - Annexes א, ב and ג each end with "הסכומים בטבלה אינם כוללים מע"מ" (pp.5, 6, 10).
  - s.8(ב) and the definition in s.2 (p.2) match the record's sentence on the takeover day.
  - Every cap matches annex ג: 9100 is 11 (payer חוסך / בעל רישיון); 9100 continuous is 11 plus 1 a month (payer חוסך); 9101 is 1; 9109 is 0; 1400-1402 are 0; 1902-1903 are 1 (payer חוסך).
  - CPI linking is s.7(א), and a lower price with the Commissioner's approval is s.7(ב).
- **"Free through the banks" removed.** No copy is left in `data/`, `site/app` or `data/open-questions.json`. Dropping it follows D30.
- **BANK-18 and BRK-17.**
  - 159a p.17, note (2) to item 4(א)(5): "לא ניתן לגבות דמי ניהול פיקדון ניירות ערך בעבור מלווה קצר מועד או בעבור קרן כספית".
  - p.15, item 4(א)(1): buy, sell and redemption of TASE securities, with its own "מילווה קצר מועד" price line.
  - p.16, note (4): a reduced internet rate "לפעולה במלווה קצר מועד".
  - The new BANK-18 text says no more than this, and `derived_from: ["BRK-17"]` validates.
- **Spelling sweep.** A field-level diff shows that the 45 sweep-only records changed only `title_he`, `text_he` or `figure_names_he`, and only by אמריקני→אמריקאי and מק"ם/מק״ם/מק"מ→מק״מ. No `quote`, `title` or source field changed: the GOV-17 source quote keeps "המק״ם". The remaining old spellings are all tax records (TXF-*, TXI-*, TXG-17), as the report says.
- **The seven sentences of 31 October (#139).** Each edit matches the Hebrew editor's answer and changes no fact. The wording is impersonal or third person, with no second-person address.
- **Issue 134.** Fetched today by curl, the gov.il and capitax copies have the same sha256 (`990c91e3...7e93`) and match library `990c91e3270bb60c`. The TXF-25 points are on p.3 (residents before 1.1.2026) and p.6 (listed entity, the controlling holder, 10% of "אמצעי השליטה"). The edit proposed for the tax-specialist is correct.
