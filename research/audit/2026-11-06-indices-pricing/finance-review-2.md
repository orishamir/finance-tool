# Finance review 2 of indices-pricing (21dbde2e), 2026-11-06

Reviewer: finance-reviewer (read only; could not run git, so it read method.md F-13, F-14, F-63, F-101, F-102, F-103 against packages/engine/src/formulas/fees.ts, ledgers/securities.ts, providers/workbench.ts, fees/materiality.ts, test/pricing-d64-d67.test.ts, packages/schema/src/collections/fees.ts, value.ts, data/rules/bank-35.json and the latest data/fees records).

Verdict: pass. No mustFix. Saved by the lead from the reviewer's message.

## What matches
- F-102 (D64): monthly minimum a_p after manager, custody and fixed fees, never more than held, paid by selling oldest units, per-stretch price; out of exitYearFees (fits TXS-06); own `account` line in F-61/F-63; only banks with a minimum and not marked as the person's own. "Eight of ten above the cap" checks against the data (5.5, 5.9, 5.3, 6.8, 6.3, 6.3, 9.5, 6.4 above 5; 4 and 0 not).
- BANK-35: 5 NIS a month, start month computed right (month 8 from 2026-11-06), flagged not applied.
- F-103 (D67): 50 USD at the month's rate, after the dividend is reinvested, never more than held; custody in F-61; not deducted from the sale gain; record line one-zero-custodian-corporate-event has p.17 and its quote.
- F-13 (D65): limited spread priced at its ceiling (Altshuler 0.7%, Meitav 0.13% + 0.8%, IBI 0.7%, each sourced); null spread not priced; average rows take no spread; spread beside bounded fee or per-dollar price refused.
- Schema: current_account objects, usd_per_event, corporate_event match the method; the validator holds exemptions to their printed end and the word "פטור".

## shouldFix
1. F-103 in the exit year rests on an unsettled reading of TXS-06 (ledgers/securities.ts:379-384, :402 leave the charge out of the sale gain). Raise a flag/label when such a charge falls in the exit tax year (as G-07), and open a TXS question for the tax-specialist.
2. F-102 and F-103 ids never reach the run's `formulas` (ledgers/securities.ts:185; F-101 is added at :187). Add them when applied.
3. The BANK-35 flag can sit in a month that charges nothing (securities.ts:340-341), e.g. Discount first-degree students exempt 48 months. Flag the first month that charges above the cap; method.md:197 too.
4. Stale comment securities.ts:58 ("read from the run's first tariff"); :393 reads each month's stretch.
5. The current account's source can go missing from the row (providers/workbench.ts:550-555 records it only when the head stretch charges a_p; :559-562 discard later stretches' line sources). For exempt groups (Discount, Mercantile) a_p from the end of the exemption has no source, nor the exemption itself.
6. The spread is merged into the conversion rate (workbench.ts:494), so an entered conversion price or an F-101 layer drops it silently (also fees/materiality.ts:150-155, withFeeRate on fx); the recurring-plan line (workbench.ts:520-523, fxStanding) never gets the spread, and nothing refuses that combination. Keep the spread as its own field or refuse those combinations.
7. The per-dividend charge applies at average levels while the spread does not (workbench.ts:530-531); the 50 USD sits on an average that may include passed-on custodian costs. Decide one treatment and write it in the method (method.md:199).
8. F-61 partial changes: withFeeRate(plan, "account", r) changes only the first stretch (materiality.ts:171-173) while removal drops every stretch (:175-180); a non-zero custody rate leaves the per-dividend charge (:145), undocumented.
9. Method text: method.md:324 (F-63) omits `account` from the fee types; D66 appears nowhere in method.md (add to F-13/F-14/F-63, including that One Zero's 5,000 USD a month is not per client); method.md:185 cites BRK-23 (institution: Leumi) for the spread, the rule is BRK-48 and no general rule exists (FXD OQ2); data/fees/one-zero@2026-11-04.json's note also cites BRK-23; F-102 does not mention `part_of` (PEPPER, part_of leumi, no current account; validate.ts:457-458).
10. No golden figures for F-102 and F-103 (method.md:197, :199; the test checks bounds only). Add a worked example with expected values from a Python script, as F-101 has.

## Notes
- BANK-35 and BANK-17 cite olaw.org.il (a copy); re-source to the official Reshumot (domain-specialist).
- A spread printed as a percentage of the rate is charged as s x amount on a buy; exact is s/(1+s) (0.8% vs 0.794%).

## Rules missing from the rule base
- A bank's securities account needs a current account at the same bank (only BRK-28, Leumi).
- The current account's monthly minimum ("עמלת מינימום בסכום שאינו עולה על מחיר של פעולה אחת על ידי פקיד") has no general BANK record.
- How BANK-35 counts an "action" (not read; the cap stays a flag).
- TXS-06 and a custodian's per-event cost passed on.
- A general rule that a conversion spread is a cost beside the conversion fee, or what limits it (FXD OQ2 open).
