#!/usr/bin/env python3
"""Writes requests.md beside the brief (the harness refuses a direct .md write from a builder). Run from the repo root."""
import os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXT = r'''# Requests to the rule-base editor from the follow-ups branch (2026-10-26)

Written by the builder of branch `followups` in its review round. Each item is a question for the rule base (`.claude/skills/il-finance/references/`, `data/rules/`), which the builder may not answer from memory. The site keeps its current behaviour, labelled as said below, until an answer lands. Nothing in the rule base has been changed here.

## 1. A falling CPI in the real gain of a kupat gemel lehashkaa and of a study fund's excess (TXK-07, TXH-11)

**What the site does now.** When the CPI on the withdrawal day is below the CPI on a deposit's day, the engine counts that deposit at its amount, so the taxable gain never exceeds the gains withdrawn. The same applies in three places:
- the kupat gemel lehashkaa lump sum (method F-44, `ledgers/provident.ts`);
- the study fund's excess deposits (F-46);
- the child-savings provident route (F-50, a kupat gemel lehashkaa by TXK-22).

A run where this bites carries the label "reading": on TXK-07 for the first and third, on TXH-11 for the second. Golden case S53 (b) rests on it.

**Why it is only a reading.**
- s.3(ה4)(3) deems the gains withdrawn to be interest, and carves out only "רווחים ... בסכום הפרשי הצמדה" as linkage income (TXK-05, TXK-07). s.9(13) exempts linkage differentials. Neither text says what happens when the linkage is negative.
- The falling-index rule that TXS-02 and TXF-03 state (circular 10/2025, appendix, examples 3 and 4; the Moses ruling) is about the capital-gains inflationary amount of s.88. TXK-07 itself says that s.88 is not the route here, because these gains are interest income.
- Barel (TXI-25) points the other way for a bank deposit: interest and linkage are separate sources, so negative linkage does not reduce the tax on the interest. By that analogy the deemed interest would be the gains withdrawn less a negative linkage, which is more than the gains withdrawn.
- TXH-11's real base rests on the Chief Economist paper, which defines real gains as nominal gains less the cumulative rise in the CPI (its note 7, as the record quotes it). It does not say what a fall does.

**What to find.** A source that says how the real gain of TXK-07 (the kupat gemel lehashkaa lump sum) and of TXH-11 (the study fund's excess) is computed when the CPI fell over a deposit's life:
- (a) the linkage part is zero, so the taxable gain is the nominal gain (what the site does); or
- (b) the deemed interest is the gains less the negative linkage, so the taxable gain exceeds the nominal gain; or
- (c) something else.

Places that may say it:
- the Tax Authority's instructions to managing companies on withholding from these payments (reg. 1 of the 2005 withholding regulations excludes exempt linkage differentials from "ריבית", TXK-26);
- the Tax Authority's study-fund guidance behind TXH-15;
- the Chief Economist paper behind TXH-11;
- the CMA's or the Tax Authority's circulars on the yearly tax report that managing companies send (form 867);
- a managing company's tax-certificate method, which would be its own practice only.

**What changes when it is found.**
- If (a): the site drops the "reading" label on TXK-07 and TXH-11 in those runs.
- If (b): the floor goes from F-44, F-46 and F-50, and the falling-CPI figures change (golden S53 (b) and the falling-inflation guide runs).

## 2. The regulators' report on custody at non-bank members (BRK-52; scope requests §2)

`research/knowledge/2026-10-25-scope/requests.md` §2 says the report adds "that custody at non-bank members is customarily waived for all clients".
- BRK-52's own Conditions, and the report itself (p.11), say the blanket waiver covers custody fees proper ("דמי משמרת") only.
- A handling fee on the securities deposit ("עמלת דמי טיפול בפיקדון ני"ע") is usually a fixed shekel sum, often refunded or not charged.
- Excellence's and Altshuler Trade's collected lines are named "דמי ניהול/טיפול", so they are of the handling kind.

The site's note and method F-14 now follow BRK-52. Please align the scope requests file, and, when the BRK-52 record is created, keep the two kinds apart in its Hebrew text.

## 3. Rules the site names in words only, for want of a record

These rules are named on the site without a chip, because `data/rules/` has no record for them:
- **TXG-25** (refunds through a return or form 0135): the credit-points flag line (G-23) and the age-60 settlement.
- **TXK-28** (Harel's 25% withholding): method F-44 only.
- **BRK-52**: the money-market custody note. The rules-scope branch creates this record.

A record for TXG-25 would let the G-23 and TXK-26 lines point to it.
'''
with open(os.path.join(HERE, 'requests.md'), 'w', encoding='utf-8') as fh:
    fh.write(TEXT)
print('wrote', os.path.join(HERE, 'requests.md'))
