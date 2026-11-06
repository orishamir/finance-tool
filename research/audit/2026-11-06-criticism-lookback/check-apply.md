# Independent check of the criticism look-back (2026-11-06)

A checker that did none of the work, on `git diff main...ac98e0cf`. Verdict: **pass, with one doc contradiction to fix before merge.**

## What was run

- Merged with current `main` (43624357) in a scratch copy: no conflicts (main's nine commits touch only the rule base and research).
- `npx vitest run site --testTimeout=180000` on the merged tree: 67 files, 988 tests, all pass.
- `node research/audit/tools/alone-check.mjs --self-test`: four of four cases pass.
- Planted faults: a too-alike colour in CostStack (fails the colour ratchet, as it should); "שלך" and "D45" in `copy.ts` (fail the guard and the process ratchet); "הולך", "שלכם", "הזנה", "מס הכנסה" pass. "דשבורד" written after "ב־" was **not** caught (below).
- `palette-check.ts` against the dataviz `validate_palette.js`, every pair of `CHART_ROLES` (oklch converted to 8-bit hex for the validator): largest gap 0.20 ΔE normal, 0.15 colour-blind, no pass/fail flips. Same method.
- Every leftover was read: the seven rule records hold "(D22)" or "קריאת החוקר"/"קריאה שלנו" in `text_he`; `copy.ts` holds "מוצגת בלי דירוג" twice and "סוג העסקה" once; the pension guide "למקרה מוות ונכות". All real faults.
- No quote names a private person, money or a holding; the amounts quoted (66,280 ₪, 15,712 ₪) are the site's own figures.

## Must fix

1. **design-system 9.3 contradicts the new 6.5 and section 12.** "Up to seven series" still says "Why the teal ramp does not extend to seven" and "Why not seven hues: the ranking is ordinal and the site keeps one accent (V5)", and "a swapped-in line takes the freed step". The branch now says each option has its own hue (6.5, section 12, issue 217). Ground rule 10: the reversal carries its cleanup. Rewrite the two "why" sentences, or drop them, and say "role" instead of "step".

## Should fix

1. **The colour ratchet's colour-blind floor is 6 for every chart**, while section 12 says 8, and 6 only where a word sits on the mark. Two pairs pass only on the lower floor: CostStack `chart-cost-fixed`/`chart-cost-other` (6.9) and StairsChart `chart-stairs-fund`/`gain` (6.9). Set the floor per chart.
2. **Charts missing from `CHART_ROLES`**, though the doc says each chart is checked: the makam guide chart draws `chart-net` against `chart-baseline` (ΔE 9.3 normal, 7.5 colour-blind, which would fail); the timeline's `chart-net`/`chart-entered` line and the period strip (`chart-value`, `chart-net`, `chart-alt`, which pass) are not listed. Add them, or say the list is hand-kept.
3. **`LabelChip` is in the colour ratchet** with four pairs on the leftover list. Chips carry their words and are not a chart's identities (ground rule 6 is about charts), so these leftovers are not clearly faults. Drop the chips or give the reason.
4. **The word checks miss Hebrew prefixes and the maqaf.** `(?<![֐-׿])` treats the maqaf (U+05BE) as a letter and refuses any prefix, so "ב־דשבורד", "בדשבורד", "לסוג העסקה" and "ושלך" pass. For the replaced words, allow an optional prefix (ו, ה, ב, כ, ל, מ, ש) and the maqaf. For the guard, allow ו only ("הלך" would be noise). The guard could add "בשבילך", "אצלך" and "לפניך".
5. **merge-review's bare "מס" item is noisy**: 109 of the 541 lines of `copy.ts` with "מס" would be flagged, among them "הטבת מס" and the rule-file titles "מס: כללי". Exclude "הטבת מס" and a "מס:" title.
6. **copy.md 1, "Words that add something"** bars sentences about "how the site checks or sources its numbers". Say that this does not cover the source and its terms, which the site must show (CLAUDE.md, "Every number traces to a source"; for example the TASE terms line on rule records).
7. **6.5 and 9.3 label the leader directly and also show a legend above.** Section 12 rule 3 now says "never by both". The direct label is a shekel amount, so this may stand, but say so in 6.5.

No rule names one page's element as the rule. Examples are given only as examples.
