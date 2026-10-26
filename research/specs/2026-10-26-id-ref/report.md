# Report: IdRef (2026-10-26)

`IdRef` (provenance.tsx) is one chip for rule, formula, parameter and open-question ids; `RuleRef` is its alias. Formula and open-question sheets are new. All hand-built ids replaced; three guards added; gallery and docs updated. Shots in `shots/` (`-pc` 1280, `-ph` 390); scripts in `tools/`.

Checked on screen at both widths:
- /parameters: P-01 card, click F-80: formula sheet opens (name, P-01 chip, method.md link), shots 2. Click P-01 inside: the sheet closes, URL `#P-01`, the card sits 96 px from the top, below the 65 px sticky header (shot 3). Same from a lower card (F-67 to P-05, shot 9; `scroll-mt-24` on each card).
- Computed number on /guide/kupat-gemel-lehashkaa (the compare form needs input; /fees needs a query): its F-44 chip opens the formula sheet, back arrow returns (shots 7, 8).
- /guide/brokerage-account (TXF OQ1) and /not-covered (TX2 OQ6): open-question sheet (shots 4, 5).
- /kit: IdRef demo with the four kinds (shot 6).

## Structure review (lead, 2026-10-26)

`merge-review.mjs`: 70 files, 41 of them code or docs. That is over 30, so an independent reviewer (Sonnet, shown only the diff and the kit) went through it. It asked for four fixes and noted four smaller points; all eight were made (30129c1).

| Item | Verdict |
|---|---|
| `IdRef`, the `RuleRef` alias, `FormulaSheet`, `QuestionSheet`, `IdText` (in `provenance.tsx`) | Kept: the shared finance blocks layer, next to `RuleCard` and `TermCard` |
| The ten local `OQ` components and the static chips | Removed, with guards against their return |

Fixed by the lead on screen:
- the formula sheet's link label was English ("Full definition (method.md, in English)"); it is now "ההגדרה המלאה במסמך שיטת החישוב (באנגלית)";
- the closed-question date was missing its maqaf ("ב־{date}").
