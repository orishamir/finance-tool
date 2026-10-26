#!/usr/bin/env python3
"""Appends the fourth review round to report.md (the harness refused a direct .md write, 2026-10-26)."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = os.path.dirname(HERE)
SECTION = r"""
## Review round 4 (2026-10-26)

The round-3 check confirmed its items 1 and 4 to 7 and found five more; each is fixed on this branch (tools: `tools/r4-*`; shots `shots/r4-*`).

1. **Rebase regression in the child-savings guide.** `child-savings-provident.tsx` had the deposit cap back ("ו־4% מכל הפקדה", `depositCap`), which main removed on purpose (no deposits after 18, so the deposit cap does not bite; `research/specs/2026-10-26-followups/report.md`). The sentence is main's again, "כל חברה קובעת שיעור משלה, עד התקרה שבתקנות: עד 1.05% בשנה מהיתרה", without main's named example (a company's rate in a product context, D30); the companies are the `VariesByCompany` line under it, now Harel and Altshuler Shaham only.
2. **Bare `company_terms` entries named companies a record says nothing about.** Every entry whose record names more than one company is now `{ rule, companies }`, each checked against its block in `.claude/skills/il-finance/references/*.md` (`tools/r4-fix-company-terms.py`, `tools/r4-blocks.sh`):
   - child-savings-provident, both fee rows: CS-30 for Harel and Altshuler Shaham (Bank Yahav's only CS-30 term is the shadow current account's fee exemption); the guide's prose line the same;
   - bank-deposit: BANK-36 (linked deposits) Leumi, Yahav, Discount; BANK-37 exit points Leumi, Massad, Yahav (Yahav's maturity on a business day), minimum Leumi, Yahav, Mercantile;
   - savings-plan: BANK-38 for Yahav and Leumi on both the lock-up (their terms and exit points) and the minimum (NIS 200, NIS 10); Discount, First International and Massad are named only for deposit structures;
   - keren-hishtalmut: KH-09 Harel and Altshuler Shaham; KH-33 fee on the balance Altshuler Shaham and Harel (how each deducts and caps it), change over time Meitav only;
   - child-savings-bank: CS-29 Leumi and Yahav; brokerage and both money-market records: BRK-48 for its four non-bank members (its record attributes the monthly account fee and the conversion spread to the four tariffs, and each of the four fee snapshots has a fixed-period and an fx line);
   - the guides' prose: BANK-34 (the anchor) names Leumi, Hapoalim and Yahav explicitly on bank-deposit and savings-plan.
   The rule, in the validator and the site's prose test: a `company_terms` or `VariesByCompany` entry whose record names several companies is written `{ rule, companies }` (a bare id would name them all). The bare entries left name one company each (BRK-23, BRK-40, BRK-42, CS-09, IRA-21, IRA-22, SW-56, PEN-45, PEN-47, BPN-10).
3. **Chips on a card's figures opened empty cards.** `pointedIds` (`site/app/lib/scope.ts`) now follows the rules each figure cites (`figureRuleIds`: a value, a bracket, a tax year), beside `derived_from` and `examples`, so `pointedRecords` gives each page those records too (TXG-04 to TXG-02 and TXG-03, TXS-12 to TXS-09 and TXS-11, TXK-10 to KGL-09, TXK-23 to TXI-02 and TXI-03, PEN-21 to PF-04 and PF-05, SW-32 to BANK-21, and the rest of the 24). `pointed.test.ts` now reads each card's chips from the record itself (its `derived_from`, `examples` and every `rule_ids` inside its figures), not through `pointedIds`, and checks every page's data.
4. **The brokerage minimum row** names BRK-40 beside BRK-42: Interactive Israel's commission page states no minimum deposit.
5. **`requests.md` item 6** keeps only the round-3 sentence about the not-rules' files.

Counts: `scope: 482 general, 101 institution, 13 unsettled`; `data/ is valid`, the same warnings. Tests: 78 files, 1,100 passed, 1 todo; typecheck clean.

| Shot | What I saw |
|---|---|
| r4-1 | the child-savings guide, "למה משתמשים בזה": "אחרי גיל עשרים ואחת דמי הניהול יורדים מהחיסכון. כל חברה קובעת שיעור משלה, עד התקרה שבתקנות: עד 1.05% בשנה מהיתרה." with no deposit cap; under it "דמי הניהול אחרי גיל עשרים ואחת תלויים בחברה: הראל, אלטשולר שחם" |
| r4-2a, r4-2b | the savings-plan guide: SW-32's card, its start date's sheet (01.12.2025, the Knesset's amendment 38) with chips SW-32 and BANK-21; BANK-21 opens its full card ("חל על כולם", its text, the Bank of Israel's directive 417). Behind the phone sheet, the lock-up row reads "תלוי בחברה: בנק הפועלים, בנק יהב, בנק לאומי" |

No console errors on either page.
"""
with open(os.path.join(SPEC, "report.md"), "a", encoding="utf-8") as f:
    f.write(SECTION)
print("appended")
