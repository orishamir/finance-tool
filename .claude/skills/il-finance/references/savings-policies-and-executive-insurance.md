# Savings policies and executive insurance

Checked: 2026-10-22 · Owner: domain-specialist
Serves: product.md 3.1 (the tier-2 "not covered yet" page: what is known, what is open, why), 3.10 (decoding "פוליסת חיסכון" and "ביטוח מנהלים" names, Bituach-Net tracks), 3.6 (holdings review for people who already hold an executive policy), D2 graduation rule. Release: tier 2 (no release until graduation; see the last section).
Scope: in: savings policy (פוליסת חיסכון): legal status, who offers it, hosted tracks, fee caps and their source, deposits, withdrawals, minimums, payout time, track switching, transfer, death cover, annuity option, protection. Executive insurance (ביטוח מנהלים, legally a קופת ביטוח): legal status, which provident-fund rules apply, fee caps by issue date, issue-period cohorts, guaranteed annuity factors, insurance components and their price spread, mandatory-pension fit, withdrawal and transfer, differences from a pension fund. Out: all tax, including Amendment 190 (`tax-insurance-and-amendment-190.md`, TXA); shared provident-family fee, transfer and discount rules (`provident-family-common.md`, PF); pension-fund mechanics and mandatory-pension rates (`pension-and-gemel-lekitzba.md`, PEN); Bituach-Net field definitions (`tracks-catalogue-and-decoder.md`, CAT); cross-regulator protection (`regulators-and-protection.md`, REG); designated bonds (`government-bonds-and-makam.md`, GOV); the switching playbook (`switching-and-transfers.md`, SW).

## Summary

A savings policy is a profit-sharing life-insurance policy that is not approved as a provident fund. The saver carries the investment result, and an annual deposit ceiling does not apply. The State Comptroller describes it as a short- and medium-term investment tool rather than insurance. No regulation capping its management fee was found. The 2012 provident-fund fee caps cover only provident funds, and they reach profit-sharing policies only in the lost-contact rule. Insurers' own terms set maximums that differ: Clal 6% of deposits plus 1.5% a year of the balance, and Phoenix 4% plus 1.7%. The CMA average for 2024 was 0.78% of assets and 1.86% of deposits (life-insurance policies from 2004). Payout takes from up to 4 business days (Phoenix) to 30 days (Clal terms). Track switches take 3 business days. No route for moving a savings policy to another insurer without withdrawing was found.

Executive insurance is a life-insurance plan approved as a provident fund (קופת ביטוח), and most of the Provident Funds Law applies to it. Policies issued from 1 January 2013 fall under the 4% of deposits plus 1.05% of balance cap. Older policies keep their contractual fees: one 2009 Harel plan allows up to 1.7% of the balance. Some old policies carry a guaranteed annuity factor. A policy qualifies for mandatory pension if death and disability cover is held in it or elsewhere. Tax is in TXA and is open, so neither product can graduate yet.

## Rules

### Savings policy

### INS-01 A savings policy is a profit-sharing life policy that is not an insurance provident fund
- Rule: The savings policy the site calls "פוליסת חיסכון" is sold as a life-insurance policy whose terms say "הפוליסה אינה מוכרת כקופת ביטוח" (Clal "חיסכון פיננסי לעתיד", plan 1418, title page). The saver's balance ("חיסכון מצטבר") is the deposits revalued by the investment results of the chosen track, minus management fees and withdrawals (definitions, p. 2). So the saver, not the insurer, carries the investment result. The State Comptroller writes that savings policies, "למרות שמן, אינן משמשות מכשיר ביטוחי אלא מכשיר השקעה לטווח הקצר והבינוני".
- Conditions / exceptions: The legal category is "ביטוח חיים משתתף ברווחים". The fee regulations define it "כהגדרתו בתקנות חוזי ביטוח, למעט קופת ביטוח" (reg. 8). The Insurance Contract Regulations definition itself was not opened (open question 1). Insurers also sell policies that combine savings with life cover, for example Clal Safe (Clal product page) and Phoenix's "תכנית פרט-מסלול לחיים" (plan 5552). These are the same legal type with a risk component; the site should decode them as savings policies with insurance cover.
- Figures: none.
- Source: [Clal, תנאים כלליים לביטוח חיים – חיסכון פיננסי לעתיד (1418), edition 08/2024](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), title, s. 1 definitions · checked 2026-10-22 · institution; [State Comptroller, הפיקוח של רשות שוק ההון על הגופים המוסדיים המנהלים חיסכון ארוך טווח, January 2024](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2024/The-cost-of-living/2024-The-cost-of-living-104-Hon.pdf), summary p. 336 · checked 2026-10-22 · primary; [Management Fees Regulations 2012, reg. 8 (Wikisource)](https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)) · checked 2026-10-22 · primary (mirror)
- Dimensions: `regulator`, `protection`, `insurance-cover`
- Likely to change: no

### INS-02 No annual deposit ceiling applies to a savings policy
- Rule: The State Comptroller found that savings policies are used "ללא הגבלה על היקף הכספים המופקד בו מדי שנה". It contrasts this with kupat gemel lehashkaa, whose annual ceiling puts it at a disadvantage against a savings policy for amounts above the ceiling.
- Conditions / exceptions: An insurer may still refuse or condition a deposit. In the Clal terms, one-time deposits and increases need the company's prior written consent (s. 7.1). The Comptroller summary does not cite the legal basis for the absence of a ceiling; no ceiling was found in any source read. For the kupat gemel lehashkaa ceiling, see `kupat-gemel-lehashkaa.md`.
- Figures: none.
- Source: [State Comptroller, January 2024](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2024/The-cost-of-living/2024-The-cost-of-living-104-Hon.pdf), summary pp. 336 to 337 · checked 2026-10-22 · primary; [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), s. 7.1 · checked 2026-10-22 · institution
- Dimensions: `deposit-ceiling`
- Likely to change: yes. The Comptroller raised it as a competition problem; any regulatory response would change it.

### INS-03 No regulatory management-fee cap for savings policies was found; insurers' terms set their own maximums
- Rule: The 2012 fee regulations cap fees for a "קופת גמל" (reg. 2 to 5). A savings policy is not a provident fund (INS-01). The only provision that extends the regulations to profit-sharing life policies is the lost-contact rule (reg. 8; INS-04). Reading: the 1.05% and 4% caps do not reach savings policies. The maximums are contractual and differ by insurer and plan:
  - Clal "חיסכון פיננסי לעתיד" (1418, 08/2024): "דמי-ניהול ההפקדה השוטפת בשיעור שלא יעלה על 6%" and "דמי ניהול החיסכון המצטבר בשיעור שנתי שלא יעלה על 1.5%" (s. 4.1). One-time deposits carry no deposit fee (s. 4.4). In the payout phase the fee is "שיעור שנתי קבוע שלא יעלה על 0.30%" (s. 4.3). The balance fee is collected daily at 1/365 of the annual rate (s. 4.5).
  - Phoenix "תכנית פרט-מסלול לחיים" (5552, November 2024 edition), a savings policy with life cover: up to 4% of the periodic payment and up to 1.7% a year of the balance; no fee from one-time deposits; 1% a year during annuity payment (s. 9.1, 9.2, 9.5).
- Conditions / exceptions: The actual rate is in each policy's "דף פרטי ביטוח" and may vary by amount and track (Clal s. 4.2; Phoenix s. 9.3). On a track switch, Phoenix applies the new track's fee (Phoenix FAQ). Clal states that changes are notified by an updated policy page within 10 business days (s. 4.6). No CMA circular on savings-policy fees was found (open question 2). Whether the CMA fee-discount circular 2017-9-15 (PF-13 to PF-16) covers savings policies is open (open question 3).
- Figures: Clal 6% / 1.5% / 0.30%; Phoenix 4% / 1.7% / 1%. Contractual, per plan edition.
- Source: [Management Fees Regulations 2012, reg. 2(ב), 8 (Wikisource)](https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)) · checked 2026-10-22 · primary (mirror); [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), s. 4 · checked 2026-10-22 · institution; [Phoenix, נספח 5552 תנאים כלליים לביטוח חיים – תכנית פרט-מסלול לחיים, November 2024](https://digital-content.fnx.co.il/sites/docs/polarchive/LifeInsurance/nispach5552_1124.pdf), s. 9 · checked 2026-10-22 · institution; [Phoenix Invest FAQ](https://www.fnx.co.il/savings/savings-routes/faq/) · checked 2026-10-22 · institution
- Dimensions: `fee-management-balance`, `fee-deposit`, `fee-change-over-time`
- Likely to change: yes. Plan editions change, and a regulatory cap could be introduced.
- *2026-10-24 R5 pass:* a regulatory cap does exist, in the Insurance Contract Terms Regulations rather than the 2012 provident fee regulations: reg. 6א caps the balance fee of a profit-sharing policy that is not an insurance fund at 1/12% a month (1% a year) of the revalued portfolio, 2% a year with the Commissioner's approval, and above that only with approval and only as a percentage of value (INS-25). Clal's 1.5% and Phoenix's 1.7% therefore rest on an (א1) approval. Deposit fees are not addressed by reg. 6א(א) and (א1) (open question 16). Open question 2 is closed at primary (mirror) strength.

### INS-04 The lost-contact fee cap of 0.3% applies to profit-sharing life policies
- Rule: Regulation 8 caps the fee on the balance of a lost-contact or deceased member, where the institution did not complete the required search steps, at 0.3% a year or the rate last charged, whichever is lower (PF-08). For regulation 8 only, "קופת גמל" is defined "לרבות ביטוח חיים משתתף ברווחים", "עמית" "לרבות מבוטח", and "ביטוח חיים משתתף ברווחים" is "כהגדרתו בתקנות חוזי ביטוח, למעט קופת ביטוח" (reg. 8(ו)).
- Conditions / exceptions: Applies to savings policies (profit-sharing, not an insurance fund). Insurance funds (executive insurance) fall under it as provident funds in any case. Conditions and exceptions as in PF-08.
- Figures: 0.3% a year. Fixed.
- Source: [Management Fees Regulations 2012, reg. 8 (Wikisource)](https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)) · checked 2026-10-22 · primary (mirror)
- Dimensions: `fee-management-balance`, `fee-change-over-time`, `protection`
- Likely to change: no

### INS-05 Reference levels for fees actually charged
- Rule: The CMA reports the average management fee in life insurance, meaning policies issued from 2004, as 0.86% (2020), 0.89% (2021), 0.83% (2022), 0.81% (2023) and 0.78% (2024) of assets. The average deposit fee was 2.37%, 2.30%, 2.05%, 1.95% and 1.86% in the same years. The State Comptroller reports average fees of 0.94% in savings policies against 0.64% in kupat gemel lehashkaa, "פער מהותי של 0.3% נקודות אחוז". Per track, Bituach-Net publishes `AVG_ANNUAL_MANAGEMENT_FEE` and `AVG_DEPOSIT_FEE` monthly (CAT-06).
- Conditions / exceptions: The CMA series covers all profit-sharing life policies issued from 2004 (executive insurance and savings policies together). Under D4 these are reference averages, not prices. The Comptroller summary does not give the period of its 0.94% figure (open question 4). The Bituach-Net fee fields do not separate savings policies from executive insurance (INS-23).
- Figures: 2024: 0.78% of assets, 1.86% of deposits. Published yearly.
- Source: [CMA, דוח הממונה על שוק ההון, הביטוח והחיסכון לשנת 2024](https://adif-web-bucket.s3-eu-west-1.amazonaws.com/%D7%93%D7%95%D7%97%20%D7%94%D7%9E%D7%9E%D7%95%D7%A0%D7%94%20%D7%A2%D7%9C%20%D7%A9%D7%95%D7%A7%20%D7%94%D7%94%D7%95%D7%9F%20%D7%9C%D7%A9%D7%A0%D7%AA%202024.pdf), charts ד-1 and ד-2, pp. 49 to 50 · checked 2026-10-22 · primary (third-party host); [State Comptroller, January 2024](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2024/The-cost-of-living/2024-The-cost-of-living-104-Hon.pdf), summary p. 336 · checked 2026-10-22 · primary
- Dimensions: `fee-management-balance`, `fee-deposit`
- Likely to change: yes, yearly

### INS-06 Minimum deposits are set by each insurer
- Rule: Phoenix's savings policy "הפניקס אינווסט" (offered from 04/2024) requires "סכום הפקדה שוטפת מינימום - 300 ש"ח" and "סכום הפקדה חד פעמית מינימום לפתיחת פוליסה - 10,000 ש"ח".
- Conditions / exceptions: No regulatory minimum was found. The Clal 1418 terms state no minimum. Other insurers' minimums were not collected (open question 5).
- Figures: NIS 300 a month; NIS 10,000 one-time to open (Phoenix, as published on 2026-10-22). Not indexed as stated.
- Source: [Phoenix Invest FAQ](https://www.fnx.co.il/savings/savings-routes/faq/) · checked 2026-10-22 · institution
- Dimensions: `minimum`
- Likely to change: yes, insurer decision

### INS-07 Withdrawal: any time, paid within days to 30 days, partial withdrawals with a floor
- Rule: The policyholder may withdraw all or part of the balance at any time during the policy (Clal 1418 s. 12.1.1, 12.2.1). Clal pays a full withdrawal "בתוך 30 ימים" from receipt of a written request and all documents (s. 12.1.3). Phoenix states processing "עד - 4 ימי עסקים", and up to 7 business days for a policy with the Apollo track. A partial withdrawal is taken pro rata from each track (Clal s. 12.2.2). If the requested amount is 90% or more of the balance, or the remainder would be below NIS 25,000 linked to the January 2008 CPI, Clal may treat it as a full withdrawal. It must first notify the holder, who may reduce the amount within 7 business days (s. 12.2.4). A partial withdrawal can reduce the death cover where cover depends on the balance (s. 12.2.3). Clal advertises withdrawal "ללא קנסות פדיון".
- Conditions / exceptions: Phoenix also offers fixed monthly withdrawals for a limited period or until the balance runs out (FAQ). Clal allows loans against the policy "לאחר ששולמו הפקדות שוטפות בעבור 3 שנים לפחות" (s. 14.1). No exit fee was found in either insurer's terms. The CMA plans a uniform withdrawal circular under both the Insurance and the Provident Funds laws (INS-24). Tax on withdrawal: TXA.
- Figures: Clal 30 days; Phoenix 4 business days (Apollo 7); floor NIS 25,000 at January 2008 CPI, or 90%; loans after 3 years.
- Source: [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), s. 12, 14 · checked 2026-10-22 · institution; [Phoenix Invest FAQ](https://www.fnx.co.il/savings/savings-routes/faq/) · checked 2026-10-22 · institution; [Clal, חיסכון פיננסי לעתיד product page](https://www.clalbit.co.il/savingandmanagementins/financialsaving/) · checked 2026-10-22 · institution
- Dimensions: `liquidity-lockup`, `fee-exit`, `minimum`
- Likely to change: yes (CMA withdrawal circular, 2026 plan)

### INS-08 Tracks: choice, default, switching within 3 business days, closure with 45 days' notice
- Rule: At joining, the holder splits deposits among the open investment tracks. Without an instruction, money goes to the default track, defined as the track "כללי" or a replacement approved by the Commissioner (Clal 1418 s. 1, 5.4). The holder may move the existing balance between tracks, and it moves "בתוך 3 ימי עסקים" of the request (s. 6.2). Phoenix states the same 3 business days, says a switch cannot be cancelled once made, and says the fee changes to the new track's rate. Tracks are invested under the Provident Funds investment-rules regulations (תקנות כללי השקעה החלים על גופים מוסדיים, 2012) (Clal s. 8.1). Direct expenses may be charged as permitted under Provident Funds Law s. 32 (s. 8.5). The insurer may close a track with CMA approval after at least 45 days' notice. Money of holders who do not choose a replacement goes to the default track (s. 8.6).
- Conditions / exceptions: No limit on the number of switches was found. The tax treatment of a switch (Clal says switching carries no capital-gains tax) belongs in TXA.
- Figures: 3 business days; 45 days.
- Source: [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), s. 1, 5, 6, 8 · checked 2026-10-22 · institution; [Phoenix Invest FAQ](https://www.fnx.co.il/savings/savings-routes/faq/) · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`, `switching-tax-event` (TXA), `fee-change-over-time`
- Likely to change: yes. The CMA 2026 investment-tracks circular also covers hosting tracks (INS-24).

### INS-09 Hosted tracks: insurer policies with tracks run by investment houses
- Rule: Some insurer tracks are managed by an outside manager and carry its name. In Bituach-Net, 202609:
  - **Hachshara:** tracks "מנוהל באמצעות" Meitav Portfolio Management, Yalin Lapidot, Mor, Altshuler Shaham and Analyst.
  - **Phoenix:** "אקסלנס אינווסט", "BlackRock" and "Apollo" tracks.
  - **Harel:** "fidelity" tracks.
  - **Clal:** "State Street" tracks.
  - **Migdal:** tracks "מנוהל מגדל שוקי הון".

  The ISA reports NIS 21.4 bn "מנוהלים בפוליסות חיסכון ב'הוסטינג' על ידי מנהלי תיקים" in 2025, based on data the CMA published.
- Conditions / exceptions: The policy, its fees and the protection (INS-21) stay with the insurer. Only the investment management is outsourced. Clal's hosted State Street tracks may hold illiquid assets such as real estate, private credit and private-equity funds (Clal product page). Phoenix pays BlackRock dollar deposits made from 01.08.2023 in shekels only (FAQ). Whether a hosting fee is charged on top of the policy fee was not found (open question 6).
- Figures: NIS 21.4 bn (2025).
- Source: [Bituach-Net 202609 query](https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647&filters=%7B%22REPORT_PERIOD%22%3A202609%7D&fields=FUND_ID,FUND_NAME,PARENT_COMPANY_NAME,FUND_CLASSIFICATION,TOTAL_ASSETS,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE&limit=500&sort=PARENT_COMPANY_NAME%20asc) · checked 2026-10-22 · primary; [ISA, פעילות חברות בעלות רישיון השקעות 2025 (Funder-hosted copy)](https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf), p. 19 · checked 2026-10-22 · primary (third-party host); [Clal product page](https://www.clalbit.co.il/savingandmanagementins/financialsaving/), [Phoenix FAQ](https://www.fnx.co.il/savings/savings-routes/faq/) · checked 2026-10-22 · institution
- Dimensions: `regulator`, `currency`, `liquidity-lockup`
- Likely to change: yes. Tracks are added and closed; the 2026 tracks circular addresses hosting policies.

### INS-10 Death benefit and optional insurance cover in a savings policy
- Rule: On the insured's death, payment depends on the insurance track the holder chose. If the track includes the balance, beneficiaries get the death sum insured or the balance, whichever is higher. If it does not, they get the sum insured plus the balance (Clal 1418 s. 11.1.4). The holder may add insurance covers subject to the insurer's approval and underwriting, and their premium is paid as set in each cover's chapter (s. 10). Beneficiaries may take the death benefit as monthly payments by transferring it to an annuity policy, which is treated as a new insurance contract. The annuity management fee is not above 1.00% a year (s. 11.1.8).
- Conditions / exceptions: Sums insured, premiums and the risk tables are in the policy page and cover annexes, which were not read.
- Figures: annuity-policy fee up to 1.00% a year (Clal).
- Source: [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), s. 10, 11.1 · checked 2026-10-22 · institution
- Dimensions: `insurance-cover`
- Likely to change: no

### INS-11 Annuity option from a savings policy uses the factors in force at payout, not guaranteed ones
- Rule: At the end of the insurance period the holder may take the balance as a lump sum or, under conditions, as a lifelong monthly annuity (Clal 1418 s. 11.2). The conditions:
  - Age: at the start of payment the insured has reached early retirement age and is not over 80.
  - Size: the first monthly annuity is not below 5% of the minimum wage.
  - Single deposits: only part of the balance not made up wholly of one-time deposits made in the ten years before the request may be converted.

  The annuity is computed from "טבלת מקדמי הקצבה העדכנית שתפורסם על ידי החברה במועד התחלת תשלום הקצבה החודשית הראשונה". The published factors "אינם מגלמים הבטחה כנגד שינויים בתוחלת החיים" (s. 11.2.2). The annuity is then updated monthly by the annuitants' track return against a 4% technical interest rate, net of a fee of up to 0.30% (s. 11.2.2.ה, ו). Once payment starts, the balance cannot be withdrawn (s. 11.2.2.ז).
- Conditions / exceptions: Default annuity track: a minimum of 240 guaranteed payments (s. 11.2.2.ד). Contrast executive policies with guaranteed factors (INS-17).
- Figures: age up to 80; 5% of minimum wage; 240 payments; 4% technical rate; 0.30% fee.
- Source: [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), s. 11.2 · checked 2026-10-22 · institution
- Dimensions: `liquidity-lockup`, `real-vs-nominal`
- Likely to change: yes, the factor table is republished by the insurer

### INS-12 Moving a savings policy to another insurer: no transfer route found
- Rule: Reading, not a quoted rule. The Transfer Regulations (PF-17 to PF-20) govern transfers between provident funds. A savings policy is not a provident fund (INS-01), so that route does not apply to it. No CMA rule giving savings policies a transfer route between insurers was found. The only route found is to withdraw (INS-07) and buy a new policy, with the tax consequence in TXA.
- Conditions / exceptions: Moving between tracks of the same policy is a switch (INS-08), not a transfer. Secondary sources say a move between insurers is taxed as a withdrawal; that belongs in TXA (open question 7).
- Figures: none.
- Source: [Transfer Regulations 2008 (Wikisource)](https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(העברת_כספים_בין_קופות_גמל)) via PF-17 · checked 2026-10-22 · primary (mirror); [Clal 1418](https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf), title · checked 2026-10-22 · institution
- Dimensions: `transfer-switch-process`, `switching-tax-event` (TXA)
- Likely to change: unknown

### Executive insurance

### INS-13 Executive insurance is an insurance plan approved as a provident fund (קופת ביטוח)
- Rule: "קופת ביטוח" is a "תכנית ביטוח שאושרה לפי הוראות סעיף 13(ב) כקופת גמל לתגמולים, לפיצויים או לקצבה" (Provident Funds Law s. 1). The Commissioner may approve an insurance plan submitted by an insurer as a provident fund (s. 13(ב)). "ביטוח מנהלים" is the market name. Harel's terms are titled "תנאים כלליים לביטוח חיים (מנהלים)" with the subtitle "קופת גמל משלמת לקצבה לעובדים שכירים" (plan 1286).
- Conditions / exceptions: The term "ביטוח מנהלים" is not defined in the law text read. Presenting an unapproved plan as a provident fund is an offence (s. 49(ב)(2)).
- Figures: none.
- Source: [Provident Funds Law s. 1, 13(ב), 49 (Wikisource)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)) · checked 2026-10-22 · primary (mirror); [Harel, הראל מגוון למנהלים קצבה משלמת, plan 1286, edition 7/2009](https://www.harel-group.co.il/Policies/2010.pdf), p. 3 · checked 2026-10-22 · institution
- Dimensions: `regulator`, `eligibility`
- Likely to change: no

### INS-14 Which Provident Funds Law provisions apply to an insurance fund
- Rule: Most of the law does not apply to a קופת ביטוח or the insurer managing it, except sections 2(ב), 3(ב) to (ה), 13 to 15, 19 to 25, 30 to 35, 36(א) and 58, and the penalty and offence chapters for those sections. For them the insurer is treated as a managing company (s. 56(א)). The terms of an approved insurance plan, and the policies issued under it, are subject to the provisions that apply to an insurance fund (s. 56(ב)).
- Conditions / exceptions: Reading of the list:
  - Applies: employee choice of fund (s. 20); withdrawal and transfer (s. 23, so the Transfer Regulations, PF-17 to PF-20); fees and expenses (s. 32, so the fee regulations, INS-15); non-attachment of fund assets (s. 30); member reports (s. 35).
  - Does not apply: s. 27 (holding fund assets separately from the manager's own property). Protection of an insurance fund's assets therefore rests on the Insurance Supervision Law (INS-21).
  - IRA-type insurance funds have their own narrower list (s. 57(א)(2)).
- Figures: none.
- Source: [Provident Funds Law s. 56, 57 (Wikisource, read from character 100,000)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)) · checked 2026-10-22 · primary (mirror)
- Dimensions: `regulator`, `protection`, `transfer-switch-process`
- Likely to change: no

### INS-15 Fee caps for executive insurance depend on the issue date: policies from 1 January 2013 are capped at 4% plus 1.05%
- Rule: The regulation-2 cap (up to 1.05% a year of the balance and up to 4% of deposits, PF-02) applies to provident funds, and its exclusion list removes only "קופת ביטוח מבטיחת תשואה" among insurance funds (reg. 2(ב)). So it applies to executive insurance. But "תקנות 2 ו־7 לא יחולו לעניין פוליסות ביטוח שהוצאו על פי קופת ביטוח לפני יום התחילה" (reg. 11), and the start date is 1 January 2013 (reg. 12). Policies issued before then keep their contractual fees.
- Conditions / exceptions: Examples:
  - **Pre-2013 plan:** Harel plan 1286 (7/2009) allows a fee from the balance "בשיעור שנתי שלא יעלה על 1.7%". It charges no fee from deposits, including one-time deposits and transfers in (s. 10.1, 10.2). During annuity payment the fee is 0.5% a year (s. 10.3).
  - **Post-2013 plan:** Harel's 2016 differential policy "הראל מור למנהלים" charges 3% of the premium and 0.5% a year of the balance. The balance fee rises to 1.05% if premiums stop (Harel letter, annex א).
  - **Annuitants:** the annuitant caps in reg. 2 were read only in summary (PF open question 14).
  - **Discounts and increases:** CMA circular 2017-9-15 applies to all institutional bodies except sector funds and guaranteed-return funds (PF-13 to PF-16).
  - **Guaranteed-return insurance funds** have their own regime, which was not read (open question 8).
- Figures: 1.05% of balance and 4% of deposits for policies from 1.1.2013; contractual before that (example 1.7%, no deposit fee).
- Source: [Management Fees Regulations 2012, reg. 2(ב), 11, 12 (Wikisource)](https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול)) · checked 2026-10-22 · primary (mirror); [Harel plan 1286](https://www.harel-group.co.il/Policies/2010.pdf), s. 10 · checked 2026-10-22 · institution; [Harel, הגדלת שיעורי הפקדה למוצר פנסיוני בהתאם לצו ההרחבה, June 2016](https://biz.harel-group.co.il/DocumentsAndForms/הגדלת%20שיעורי%20הפקדה%20למוצר%20פנסיוני%20בהתאם%20לצו%20ההרחבה.pdf), p. 3 · checked 2026-10-22 · institution
- Dimensions: `fee-management-balance`, `fee-deposit`, `fee-change-over-time`, `issue-cohort` (proposed)
- Likely to change: no for the cap; contractual fees on old policies can be lowered by the insurer (Harel 1286 s. 10.5)

### INS-16 Issue-period cohorts: what the 1990-91, 1992-2003 and 2004+ split means for a holder
- Rule: Bituach-Net classifies every insurer track by policy issue period ("תקופת הקמת המסלול"): "פוליסות שהונפקו בשנים 1990-1991", "פוליסות שהונפקו בשנים 1992-2003", "פוליסות שהונפקו החל משנת 2004" (CAT-10). What the cohort means for a holder, as far as sourced:
  - **Fee structure of older profit-sharing policies.** Phoenix's legacy "מניב" policy, described as "פוליסה משתתפת ברווחים או מבטיחת תשואה", charges a fixed "0.6% שנתי מהצבירה" plus 15% of the real return. The variable part is charged only once the cumulative real return is positive. It carries no fee discounts.
  - **Older contract types.** Harel lists classic policies ("קלאסיות (מעורב, גמלא וחיסכון)"), guaranteed-return "עדיף" policies, "עדיף" profit-sharing policies bought before June 2001, and policies bought after 2001. Deposit rates cannot be raised in guaranteed-return and classic policies. When the extension order raised contributions in 2016, the increase for those policies, and for pre-June-2001 profit-sharing policies with salary over NIS 15,000, went into a new separate policy.
  - **Fee level by cohort in the data.** In Bituach-Net 202609, `AVG_ANNUAL_MANAGEMENT_FEE` for 1990-91 and 1992-2003 tracks mostly ranges from about 1.5 to 3.8, against about 0.4 to 1.4 for most 2004+ tracks. Example: "כלל-קרן י'" 2.19, "מגדל-קרן י'" 2.21, "הפניקס -קרן י'" 2.72.
- Conditions / exceptions: Whether the old-cohort fee field includes the 15% variable fee is not stated by the CMA (open question 9). Phoenix's page is partly garbled and mixes products. The cohort boundaries are the CMA's; no official text explaining why 1991/1992 and 2003/2004 are the cut-offs was found (open question 9). The CMA return table also splits profit-sharing policies "שהונפקו לפני שנת 2004" and "החל משנת 2004". Returns are history, not a ranking key (product.md section 4).
- Figures: Phoenix legacy 0.6% + 15% of real return; Bituach-Net values as above, 202609.
- Source: [Bituach-Net 202609 query](https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647&filters=%7B%22REPORT_PERIOD%22%3A202609%7D&fields=FUND_ID,FUND_NAME,PARENT_COMPANY_NAME,FUND_CLASSIFICATION,TOTAL_ASSETS,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE&limit=500&sort=PARENT_COMPANY_NAME%20asc) · checked 2026-10-22 · primary; [Phoenix, פוליסת מניב](https://www.fnx.co.il/life-insurance/meniv/) · checked 2026-10-22 · institution; [Harel June 2016 letter](https://biz.harel-group.co.il/DocumentsAndForms/הגדלת%20שיעורי%20הפקדה%20למוצר%20פנסיוני%20בהתאם%20לצו%20ההרחבה.pdf), pp. 2, 4 · checked 2026-10-22 · institution; [CMA report 2024](https://adif-web-bucket.s3-eu-west-1.amazonaws.com/%D7%93%D7%95%D7%97%20%D7%94%D7%9E%D7%9E%D7%95%D7%A0%D7%94%20%D7%A2%D7%9C%20%D7%A9%D7%95%D7%A7%20%D7%94%D7%94%D7%95%D7%9F%20%D7%9C%D7%A9%D7%A0%D7%AA%202024.pdf), table ד-12, p. 56 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `fee-management-balance`, `real-vs-nominal`, `issue-cohort` (proposed)
- Likely to change: no (closed cohorts)

### INS-17 Guaranteed annuity factors in older executive policies (institution example)
- Rule: In Harel plan 1286 (7/2009), annuity track A ("מסלול קצבה שבו מקדמי ההמרה לקצבה מגלמים הבטחת תוחלת חיים") computes the monthly annuity from the conversion factor in the policy's annex table. The factor depends on sex, age at the start of payment and the insurance years since 2009. For each year after 2009 it rises by a stated annual rate: "M(X,Y) = M(X,2009) × (1 + Z × (Y − 2009))". Tracks B, C and D use factors the insurer sets at the start of payment from the life-expectancy assumptions and interest rate it uses at that time, so they are not guaranteed (s. 18.1.2). A holder who does not choose by the end of the insurance period is paid under track A (s. 18.2.8). Once payment starts, the track cannot be changed and the money cannot be withdrawn or transferred (s. 18.2.4, 18.2.6).
- Conditions / exceptions: This is one insurer's plan. When insurers stopped selling guaranteed-factor policies, and under which CMA rule, was found only on a pension blog (it says 2013) and is not used (open question 10). For savings policies the factors are not guaranteed (INS-11). Whether moving money out of a guaranteed-factor policy loses the guarantee for that money is not stated in what was read (open question 10).
- Figures: 240 guaranteed payments in track A (s. 18.1.1); factor table in annex א (not read).
- Source: [Harel plan 1286](https://www.harel-group.co.il/Policies/2010.pdf), s. 18 (pp. 20 to 22) · checked 2026-10-22 · institution
- Dimensions: `real-vs-nominal`, `liquidity-lockup`, `annuity-factor-guarantee` (proposed), `issue-cohort` (proposed)
- Likely to change: no for existing policies

### INS-18 Executive insurance can satisfy mandatory pension if death and disability cover is held
- Rule: Under the mandatory-pension extension order, the employee may choose comprehensive pension insurance "לרבות קופת גמל לקצבה, שאושרה ע"י הממונה", provided it includes "כיסויים למקרה מוות ונכות באותה קופה או בקופה אחרת" (s. 3). "קופת גמל לקצבה" includes "תוכנית ביטוח שאושרה כקופת גמל לקצבה ע"י הממונה" (s. 2), and "קופת ביטוח" is defined as in the Provident Funds Law. In an insurance fund, the employer's tagmulim payment may include loss-of-work-capacity insurance securing up to 75% of the wage. The employer total for tagmulim plus that insurance may not exceed 7.5%, and the tagmulim part may not fall below 5% (PEN-03; Harel 2016 letter p. 1).
- Conditions / exceptions: An employee who does not choose is placed in a pension fund, not an insurance fund (PEN-05, PEN-06). Contribution rates are in PEN-03.
- Figures: 75%, 7.5%, 5%.
- Source: [Extension order, text mirror (Hilan)](https://www.hilan.co.il/%D7%9E%D7%A8%D7%9B%D7%96-%D7%99%D7%93%D7%A2/%D7%97%D7%A7%D7%99%D7%A7%D7%94/%D7%A6%D7%95%D7%95%D7%99-%D7%94%D7%A8%D7%97%D7%91%D7%94/%D7%A6%D7%95-%D7%94%D7%A8%D7%97%D7%91%D7%94-%D7%91%D7%99%D7%98%D7%95%D7%97-%D7%A4%D7%A0%D7%A1%D7%99%D7%95%D7%A0%D7%99-%D7%9E%D7%A7%D7%99%D7%A3-%D7%91%D7%9E%D7%A9%D7%A7/%D7%A6%D7%95-%D7%94%D7%A8%D7%97%D7%91%D7%94-%D7%A0%D7%95%D7%A1%D7%97-%D7%9E%D7%A9%D7%95%D7%9C%D7%91-%D7%9C%D7%A4%D7%A0%D7%A1%D7%99%D7%94-%D7%97%D7%95%D7%91%D7%94-%D7%91%D7%AA%D7%95%D7%A7%D7%A3-%D7%9E-27-%D7%91%D7%A1%D7%A4%D7%98%D7%9E%D7%91%D7%A8-2011/), s. 2, 3, 4(2) · checked 2026-10-22 · secondary (mirror; the scan is cited in PEN-01); [Harel June 2016 letter](https://biz.harel-group.co.il/DocumentsAndForms/הגדלת%20שיעורי%20הפקדה%20למוצר%20פנסיוני%20בהתאם%20לצו%20ההרחבה.pdf), p. 1 · checked 2026-10-22 · institution; PEN-03, PEN-05
- Dimensions: `eligibility`, `insurance-cover`
- Likely to change: yes, if the extension order changes

### INS-19 Insurance components are paid out of the deposit, and pure life-insurance prices vary widely between insurers
- Rule: In an executive policy the savings deposit is the regular deposit "בניכוי עלות הכיסוי הביטוחי" plus one-time deposits and transfers in (Harel 1286 s. 1.7). The cost of insurance cover is the part of the deposit paid for the insurance covers (s. 1.37). The covers can be extended or cancelled (contents, s. 27 and the cover chapter, not read in detail). A policy can also hold savings only, with no cover: Harel's 2016 differential policy "כוללת רכיב חיסכון בלבד ללא כיסוי ביטוחי". For pure life insurance (death cover), the CMA compared the cost of NIS 1,000,000 cover over 30 years. The gap between the most and least expensive insurer in total premiums over the period was:

  | Insured, age 35 | Gap in total premiums |
  |---|---|
  | Non-smoking man | 46% |
  | Non-smoking woman | 72% |
  | Smoking man | 107% |
  | Smoking woman | 143% |

- Conditions / exceptions: The CMA tables are for individual life (death) insurance, not for the risk component inside a particular executive policy, and are given here as evidence that the insurance part of the price is worth comparing. Disability-cover prices were not found (open question 11). Comprehensive pension funds price insurance collectively; see PEN-11 to PEN-17.
- Figures: spreads 46% to 143% (2024).
- Source: [Harel plan 1286](https://www.harel-group.co.il/Policies/2010.pdf), s. 1.7, 1.37 · checked 2026-10-22 · institution; [Harel June 2016 letter](https://biz.harel-group.co.il/DocumentsAndForms/הגדלת%20שיעורי%20הפקדה%20למוצר%20פנסיוני%20בהתאם%20לצו%20ההרחבה.pdf), p. 3 · institution; [CMA report 2024](https://adif-web-bucket.s3-eu-west-1.amazonaws.com/%D7%93%D7%95%D7%97%20%D7%94%D7%9E%D7%9E%D7%95%D7%A0%D7%94%20%D7%A2%D7%9C%20%D7%A9%D7%95%D7%A7%20%D7%94%D7%94%D7%95%D7%9F%20%D7%9C%D7%A9%D7%A0%D7%AA%202024.pdf), tables ד-14 to ד-17, pp. 58 to 59 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `insurance-cover`, `fee-insurance-premium` (proposed)
- Likely to change: yes, premiums are repriced

### INS-20 Withdrawal, partial withdrawal and transfer out of an executive policy
- Rule: Withdrawals from an executive policy follow the Provident Funds Law and its regulations (s. 23 applies via s. 56; Harel 1286 s. 13.2). For example, severance can be withdrawn on leaving a job, and a lump sum from age 60 only if the remaining annuity is not below the minimum annuity amount (s. 13.2.1, 13.2.2; PEN-28 to PEN-30). The holder may transfer all or part of the redemption value to another provident fund under the Transfer Regulations (s. 14.1; PF-17, PF-19). An outstanding loan must be repaid first (s. 14.2). A partial withdrawal or transfer of 90% or more, or one leaving less than NIS 20,000 linked to the October 2008 CPI, may be treated as full (s. 13.3, 14.4). A non-end-of-period payment is made within the times in the regulations under s. 23 or within 30 days, whichever is earlier; at the end of the insurance period, within 7 days (s. 13.9). After a full withdrawal the policy and its covers lapse (s. 13.4).
- Conditions / exceptions: The law has a withdrawal rule specific to insurance funds for amounts deposited before "כ״ג בטבת התש״ס" (s. 23(ב)(5)(ב)), not read in full. Annuity in payment cannot be withdrawn or transferred (INS-17). Tax on withdrawal: TXA and TXP.
- Figures: NIS 20,000 at October 2008 CPI or 90%; 30 days; 7 days.
- Source: [Harel plan 1286](https://www.harel-group.co.il/Policies/2010.pdf), s. 13, 14 · checked 2026-10-22 · institution; [Provident Funds Law s. 23, 56 (Wikisource)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)) · checked 2026-10-22 · primary (mirror)
- Dimensions: `liquidity-lockup`, `transfer-switch-process`, `minimum`
- Likely to change: yes (CMA 2026 withdrawal circular)

### INS-21 Protection: life-insurance assets are ring-fenced; no state return guarantee
- Rule: Assets held against life-insurance liabilities serve first to cover them, including in enforcement and liquidation proceedings against the insurer (Insurance Supervision Law s. 54; REG-22). Life insurance includes both savings policies and executive policies (reading). For insurance funds, Provident Funds Law s. 30 (fund assets cannot be attached) also applies (INS-14). The state return top-up applies only to a "קרן זכאית", an old pension fund or a new comprehensive pension fund (REG-21), so not to insurance funds or savings policies. Designated "ח"ץ" bonds for life-insurance policies are issued now only for existing policies (GOV-18).
- Conditions / exceptions: In a profit-sharing policy the holder carries the investment result (INS-01), so ring-fencing protects against the insurer's failure, not against market loss. How much of each insurer's old-cohort portfolio still holds ח"ץ bonds was not found (open question 12).
- Figures: none.
- Source: [Insurance Supervision Law s. 54 (Wikisource)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ביטוח)) via REG-22 · checked 2026-10-22 · primary (mirror); [Provident Funds Law s. 56 (Wikisource)](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)) · checked 2026-10-22 · primary (mirror); REG-21; GOV-18
- Dimensions: `protection`
- Likely to change: no

### INS-22 How executive insurance differs from a comprehensive pension fund (sourced differences only)
- Rule: The differences found in sources:
  - **Legal type:** an insurer's plan approved as a provident fund (INS-13), not a pension fund.
  - **Fee cap:** 4% of deposits and 1.05% of balance from 2013, contractual before (INS-15). A comprehensive pension fund is capped at 6% and 0.5% (PF-04).
  - **Average fees charged (2024):** 0.78% of assets and 1.86% of deposits in life insurance from 2004, against 0.15% and 1.57% in comprehensive pension funds (CMA chart ד-1, ד-2).
  - **Insurance:** bought individually and paid out of the deposit (INS-19), against pooled cover in the fund (PEN-11 to PEN-17).
  - **Return guarantee:** no state return guarantee (INS-21).
  - **Annuity:** paid by the insurer under the policy's annuity tracks, guaranteed factors in some older policies (INS-17). A pension fund has conversion factors and actuarial balancing (PEN-19, PEN-27).
  - **Default:** a non-choosing employee is placed in a pension fund (PEN-06).
- Conditions / exceptions: This list is limited to what was sourced. Annuity factors in current executive policies, and how they compare with pension-fund factors, were not read (open question 10).
- Figures: as cited.
- Source: as cited in each item; [CMA report 2024](https://adif-web-bucket.s3-eu-west-1.amazonaws.com/%D7%93%D7%95%D7%97%20%D7%94%D7%9E%D7%9E%D7%95%D7%A0%D7%94%20%D7%A2%D7%9C%20%D7%A9%D7%95%D7%A7%20%D7%94%D7%94%D7%95%D7%9F%20%D7%9C%D7%A9%D7%A0%D7%AA%202024.pdf), pp. 49 to 50 · checked 2026-10-22 · primary (third-party host)
- Dimensions: `insurance-cover`, `fee-management-balance`, `fee-deposit`, `protection`, `eligibility`
- Likely to change: no

### Both products

### INS-23 Bituach-Net covers both products but cannot tell them apart
- Rule: Bituach-Net (`insurance` on data.gov.il) gives one row per insurer track per month with the issue-period cohort, assets, average fees, gross nominal yields, risk measures and exposures (CAT-01 to CAT-07). In report period 202609 it holds 200 track rows from 8 insurers (Institutions section below). It has no field that says whether a track serves savings policies, executive insurance or both, and no target-population or specialization field (CAT-10). The insurer's licence number is `PARENT_COMPANY_ID` (CAT-09). The dataset shows no licence (CAT-01).
- Conditions / exceptions: Yields are gross of management fees (CAT-04). Some new tracks show null fees (for example Phoenix 15530, Migdal 15463). Phoenix track 2081 "מסלול השקעה בניהול אישי" (NIS 14,488m) shows an average balance fee of 3.72; what that represents was not checked (open question 13).
- Figures: 200 rows, 8 insurers, 202609.
- Source: [Bituach-Net dictionary](https://data.gov.il/api/3/action/datastore_search?resource_id=388992c7-0280-48d8-b147-13e636bd804d&limit=100), [Bituach-Net 202609 query](https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647&filters=%7B%22REPORT_PERIOD%22%3A202609%7D&fields=FUND_ID,FUND_NAME,PARENT_COMPANY_NAME,FUND_CLASSIFICATION,TOTAL_ASSETS,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE&limit=500&sort=PARENT_COMPANY_NAME%20asc) · checked 2026-10-22 · primary
- Dimensions: `regulator`, `fee-management-balance`, `fee-deposit`
- Likely to change: yes, monthly

### INS-24 Planned CMA changes that touch insurer savings products (2026 plan)
- Rule: The CMA 2026 regulation plan lists these items:
  - **Life-insurance discounts and cancellations** ("הנחות וביטולים בתוכניות לביטוח חיים", p. 21, under the Insurance Supervision Law): rules on discounts in life insurance and a commission clawback mechanism. The stated aim is to reduce policy replacement ("טוויסטינג") and improve transparency of premiums.
  - **Withdrawal circular** ("חוזר משיכת כספים מחיסכון פנסיוני", p. 20, under both the Insurance and the Provident Funds laws): uniform rules for lump-sum withdrawals.
  - **Investment-tracks circular** (p. 20): includes updating policies "בקשר למסלולי האירוח".
  - **Returns and tracks publication rules** (p. 21): apply to institutional bodies and licensees.
- Conditions / exceptions: The plan says some items may not be completed within the year (PF-31). None of the items sets a fee cap for savings policies.
- Figures: none.
- Source: [CMA, תכנית אסדרה לשנת 2026](https://www.gov.il/BlobFolder/reports/report_0015/he/regulation_plan_26_1.pdf), pp. 20 to 21 · checked 2026-10-22 · primary
- Dimensions: `regulator`, `fee-change-over-time`, `liquidity-lockup`
- Likely to change: yes, by definition. Re-check at the next plan (around December 2026).

### INS-25 Regulatory cap on savings-policy management fees: 1% a year of the portfolio, 2% with the Commissioner's approval (reg. 6א)
- Rule: Regulation 6א(א) of the Insurance Contract Terms Regulations, its opening as replaced in 2012 (קובץ התקנות 7131, p.9) and the rest as set in 2004 (קובץ התקנות 6284, p.3): "מבטח המנפיק פוליסת ביטוח חיים משתתף ברווחים שאינה קופת ביטוח (בתקנה זו — פוליסה שאינה קופת ביטוח), רשאי לגבות דמי ניהול בעד ניהול תיק ההשקעות, באחת הדרכים האלה: (1) דמי ניהול קבועים בשיעור שלא יעלה על 1/12% לחודש מהשווי המשוערך של תיק ההשקעות; (2) דמי ניהול קבועים בשיעור שלא יעלה על 1/365% ליום מהשווי המשוערך של תיק ההשקעות". Reg. 6א(א1): "המפקח רשאי לאשר דמי ניהול בשיעור העולה על הקבוע בתקנת משנה (א), ובלבד שלא יעלה על שיעור של 2/12% לחודש או 2/365% ליום". Reg. 6א(א2): with the Commissioner's approval a higher rate may be charged, "ובלבד שלא יגבה דמי ניהול מכל סוג שהוא אלא כשיעור מהשווי המשוערך של תיק ההשקעות". Reg. 6א(ב): "שיעור דמי הניהול בפוליסת ביטוח חיים משתתף ברווחים ייקבע מראש בתנאי הפוליסה". Reg. 6א(ג): the net return that sets the holder's rights is the portfolio return less the management fee.
- Conditions / exceptions: Applies to a profit-sharing life policy that is not an insurance fund, which is the savings policy of INS-01; insurance funds (executive insurance) are under the 2012 provident fee regulations (INS-15). The cap is on the balance fee. Deposit fees (Clal 6% of regular deposits, INS-03) are not mentioned in (א) or (א1); under (א2) no fee of any other type may be charged. On which provision the insurers' deposit fees rest is open question 16. The 2012 wording (in force 1.1.2013) does not apply to insurance contracts made before then (7131 p.9, s.3). The regulation defines "ביטוח חיים משתתף ברווחים" only by reference, and the chain ends in repealed regulations: reg. 1 as added in 1995 (קובץ התקנות 5682, p.2) gives it the meaning in the insurer investment regulations of 1986; those were repealed and replaced in 2001 (קובץ התקנות 6094, p.22, reg. 66), and the 2001 regulations define the term by the 1998 report-details regulations (6094, p.8, reg. 1), whose definition read: "ביטוח חיים שבו זכויות המוטב והמבוטח תלויות בתשואה של השקעות מסוימות שהמבטח עושה באופן מיוחד לענין תכנית שאושרה כביטוח כזה בידי המפקח, או ברווחים אחרים הקשורים לאותה תכנית" (קובץ התקנות 5884, p.2). The 1998 report-details regulations were repealed by regulations signed on 20.6.2023 and published on 28.6.2023 (קובץ התקנות 10695, p.2). Where the definition lives now was not found (open question 1, narrowed). *2026-10-25 rule-text pass:* the quote of 6א(א) used the plural "פוליסות" of the 2004 text with the 2012 ending; it now has the singular "פוליסת" of the current opening (7131 p.9). The definition chain was re-traced on the gazette pages above; it ends in regulations repealed in June 2023 (the booklet is 10695, not "ק"ת תשפ"ג 1990", which was its page number).
- Figures: 1/12% a month (1% a year); 1/365% a day; 2/12% a month (2% a year) with approval. Fixed in regulation.
- Source: [תקנות הפיקוח על שירותים פיננסיים (ביטוח) (תנאים בחוזי ביטוח) (תיקון), התשע"ב-2012 (קובץ התקנות 7131)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/oKtbynDaWVkpXLh269S3D5emiZ9xy8ix+3WluIi8DJg=#page=9), p.9, s.2 (current opening of reg. 6א(א)) "מבטח המנפיק פוליסת ביטוח חיים משתתף ברווחים שאינה קופת ביטוח" · checked 2026-10-25 · primary. [תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשס"ד-2004 (קובץ התקנות 6284)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/SJCa7BPhZiMZ9l0U5Xe3nwsTVeYYmhGDid2kIqKI~Hk=#page=3), p.3, s.3 (reg. 6א(א), (א1), (ב)) "המפקח רשאי לאשר דמי ניהול בשיעור העולה על הקבוע בתקנת משנה (א)" · checked 2026-10-25 · primary. [תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשס"ז-2007 (קובץ התקנות 6609)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmTugNmENKcUIwHrUSZW9ZBg=#page=4), pp.3-4 (adds reg. 6א(א2)) "ובלבד שלא יגבה דמי ניהול מכל סוג שהוא אלא כשיעור מהשווי המשוערך של תיק ההשקעות" · checked 2026-10-25 · primary. [תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשנ"ה-1995 (קובץ התקנות 5682)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/BTwXToK9tgT1T4C743xB1YM5f+QhBADNjCgwTr9rv3c=#page=2), pp.2-3, s.1 (reg. 1, definitions) and s.2 (reg. 6א first added) · checked 2026-10-25 · primary. [תקנות הפיקוח על עסקי ביטוח (דרכי השקעת ההון והקרנות של מבטח וניהול התחייבויותיו), התשס"א-2001 (קובץ התקנות 6094)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/mh6R6bmXcoR6N~XeNh6QPrA2iEfIYDZsqtdZ2FAMxdQ=#page=8), pp.7-8, reg. 1 (definition by reference to the 1998 report regulations) · checked 2026-10-25 · primary. [תקנות הפיקוח על עסקי ביטוח (פרטי דין וחשבון), התשנ"ח-1998 (קובץ התקנות 5884)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/qp4kOfn567Y9SVzCZ9fztqtrgsHQki1Al7l1DteQKBc=#page=2), p.2, reg. 1 (the definition as it stood until the repeal) "ביטוח חיים שבו זכויות המוטב והמבוטח תלויות בתשואה של השקעות מסוימות" · checked 2026-10-25 · primary. [תקנות הפיקוח על עסקי ביטוח (פרטי דין וחשבון) (ביטול), התשפ"ג-2023 (קובץ התקנות 10695)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/7C66hQ7JW8mJlcziZA1hgK1PPp5NbPw07CG3J3T~8lA=#page=2), p.2, reg. 1 (repeal of the 1998 report regulations) · checked 2026-10-25 · primary.
- Dimensions: `fee-management-balance`, `fee-deposit`, `regulator`
- Likely to change: no, unless the regulations are amended

### INS-26 Annual report to savings-policy holders: within three months of the insurer's year end, with set fields (reg. 6ב)
- Rule: A life-insurance contract must provide that the insurer "ישלח למבוטחים, מדי שנה, בתוך שלושה חודשים מתום שנת המאזן שלו, דין וחשבון לגבי השנה שנסתיימה" (reg. 6ב(א)), for every plan in the policy in force at year end. It must include (reg. 6ב(ב)): (1) identifying details including "מספר הפוליסה, סכום ביטוח למקרה הביטוח, סוג ההצמדה, ערך פדיון וערך פדיון מיוחד, ערך מסולק וערך מסולק מיוחד, יתרת חסכון, היחס בין מרכיב החסכון בפרמיה לסך כל הפרמיה וסך תשלומי הפרמיה בשנת הדיווח"; (2) the return the insurer earned on the participating portfolio in the year, "תוך ציון נפרד של התשואה הריאלית, התשואה הריאלית בניכוי דמי ניהול" and the four-year average real return before and after fees; (3) the portfolio composition by asset class (government bonds, other bonds, shares and other securities, loans, bank deposits, real estate, other).
- Conditions / exceptions: The insurer may change the layout of the schedule's table as long as every item is reported (reg. 6ב(ג)). This is the statement a savings-policy holder can be told to look at for the balance ("יתרת חסכון"), the surrender value ("ערך פדיון") and the real return net of fees (3.6 holdings review, `data/terms/`). Whether the CMA's uniform statement circular 2020-9-22 (PF-33 to PF-38) also reaches savings policies was not checked (open question 3).
- Figures: three months after the insurer's balance-sheet year end; four-year average return.
- Source: [תקנות פיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) (תיקון), התשנ"ז-1996 (קובץ התקנות 5804)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/E5dM3Lqs3zVhAvU4rMf6c5wNTVAGlOIVXHsJEoAgsJ4=#page=2), pp.2-3, s.2 (adds reg. 6ב and its schedule) "בתוך שלושה חודשים מתום שנת המאזן שלו" · checked 2026-10-25 · primary.
- Dimensions: `reporting-obligation`, `fee-management-balance`, `real-vs-nominal`
- Likely to change: no

## Tax

All tax treatment of savings policies, executive insurance and Amendment 190 belongs to `tax-insurance-and-amendment-190.md` (TXA). Tax claims seen in institution sources for this file are listed under "Found for other files" and were not used as rules.

## Proposed dimensions

- `issue-cohort`: rights and fees that depend on when the policy was issued (INS-15, INS-16, INS-17). A holder of an old policy can lose something by leaving it.
- `annuity-factor-guarantee`: whether the annuity conversion factor is fixed in the contract or set at payout (INS-11, INS-17).
- `fee-insurance-premium`: the cost of risk cover deducted from deposits (INS-19). It fits `fee-<type>` but should be listed so 3.5 treats it separately.

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| פוליסת חיסכון | savings policy | Profit-sharing life policy used for savings, not a provident fund | ads, insurer sites, Comptroller | Comptroller 2024 p. 336; Clal 1418 |
| הפוליסה אינה מוכרת כקופת ביטוח | the policy is not recognised as an insurance fund | Marker that a policy is a savings policy, not executive insurance | policy terms | Clal 1418 title |
| ביטוח חיים משתתף ברווחים | profit-sharing life insurance | Legal category of savings and modern executive policies | law, regulations | Fees Regs reg. 8 |
| תיק משתתף ברווחים | profit-sharing portfolio | Insurer's portfolio backing these policies | CMA reports | CMA report 2024 table ד-2 |
| קופת ביטוח | insurance fund | Insurance plan approved as a provident fund | law, policy terms | Provident Funds Law s. 1 |
| ביטוח מנהלים | executive insurance | Market name for an employee insurance-fund policy | ads, payslip, statements | Harel 1286; Harel 2016 |
| קופת ביטוח מבטיחת תשואה | guaranteed-return insurance fund | Excluded from the reg. 2 cap | regulations | Fees Regs reg. 1, 2(ב) |
| עדיף / מבטיחות תשואה / משתתפות ברווחים | "Adif" policies, guaranteed-return / profit-sharing | Older executive policy types | insurer letters, statements | Harel 2016 p. 2 |
| פוליסות קלאסיות (מעורב, גמלא וחיסכון) | classic policies (mixed, gimla and savings) | Old traditional executive policies | insurer letters | Harel 2016 p. 2 |
| פוליסה הפרשית | differential policy | New policy opened for contribution increases | employer forms | Harel 2016 p. 3 |
| מניב | Meniv | Phoenix legacy profit-sharing policy | statements, Phoenix site | Phoenix Meniv page |
| קרן ט' / קרן י' / קרן י' חדשה | Fund Tet / Yud / new Yud | Insurer profit-sharing portfolios by cohort, Bituach-Net track names | Bituach-Net, statements | Bituach-Net 202609 |
| תקופת הקמת המסלול | track establishment period | Bituach-Net field for the issue cohort | CMA data | Bituach-Net dictionary |
| פוליסות שהונפקו בשנים 1990-1991 / 1992-2003 / החל משנת 2004 | policies issued 1990-91 / 1992-2003 / from 2004 | Cohort values | CMA data | Bituach-Net |
| מנוהל באמצעות ... | managed through ... | Hosted track run by an investment house | Bituach-Net, app | Bituach-Net 202609 |
| הוסטינג / מסלולי האירוח | hosting / hosting tracks | Tracks managed by an outside portfolio manager | ISA report, CMA plan | ISA 2025 p. 19; CMA plan p. 20 |
| חיסכון מצטבר | accumulated savings | Policy balance after returns, fees and withdrawals | statement, terms | Clal 1418 s. 1 |
| ערך פדיון | redemption value | Amount payable on withdrawal | statement, terms | Harel 1286 s. 1.38; Phoenix 5552 |
| פדיון / פדיון חלקי | surrender / partial surrender | Withdrawal from the policy | app, forms | Phoenix 5552 s. 11 |
| פדיון רעיוני | notional redemption | Year-end technical redemption for tax | Phoenix FAQ | Phoenix FAQ (tax in TXA) |
| דמי ניהול ההפקדה השוטפת / מהתשלום התקופתי | fee from regular deposits | Deposit fee | policy page, statement | Clal 1418 s. 4; Phoenix 5552 s. 9 |
| דמי ניהול החיסכון המצטבר | fee from accumulated savings | Balance fee | policy page, statement | Clal 1418 s. 4 |
| דמי ניהול למקבל קצבה | annuitant fee | Fee in the payout phase | terms | Clal 1418 s. 4.3 |
| דף פרטי ביטוח | policy details page | Personal page with actual fees, tracks and covers | statement | Clal 1418 s. 1 |
| הפקדה חד-פעמית / הפקדה שוטפת | one-time / regular deposit | Deposit types, with different fees | app, terms | Clal 1418 s. 1 |
| מסלול השקעה ברירת מחדל | default investment track | Track "כללי" if no choice | terms | Clal 1418 s. 1 |
| העברת חיסכון מצטבר בין מסלולי השקעה | moving the balance between tracks | Track switch | app, forms | Clal 1418 s. 6 |
| פוליסה מוקפאת / מסולקת | paid-up (frozen) policy | Policy with deposits stopped | statement | Clal 1418 s. 12.3; Phoenix 5552 s. 1 |
| ריסק / הריסק היסודי / כיסויים ביטוחיים | risk / basic risk / insurance covers | Life and other covers in the policy | statement | Phoenix 5552 s. 1 |
| עלות הכיסוי הביטוחי | cost of insurance cover | Part of the deposit paid for covers | statement | Harel 1286 s. 1.37 |
| אובדן כושר עבודה | loss of work capacity | Disability cover, can be inside employer tagmulim | payslip, statement | Harel 2016 p. 1 |
| מקדם המרה לקצבה / מקדם קצבה | annuity conversion factor | Balance ÷ factor = monthly annuity | statement, terms | Harel 1286 s. 1.30; Clal 1418 s. 11.2 |
| מקדמי ההמרה לקצבה מגלמים הבטחת תוחלת חיים | factors that guarantee life expectancy | Guaranteed annuity factor | terms, statement | Harel 1286 s. 18.1.1 |
| מסלול קצבה | annuity track | Payout option (guaranteed period, spouse) | forms | Harel 1286 s. 18 |
| ריבית תחשיבית | technical interest rate | Interest assumed in annuity factors | terms | Clal 1418 s. 11.2.2; Harel 1286 s. 1.42 |
| חוזי השקעה | investment contracts | CMA term for pure savings policies | CMA reports (not opened) | not opened; search extract only |

## Institutions

Register: CMA Bituach-Net, resource `c6c62cc7-fe02-4b18-8f3e-813abfbb4647`, REPORT_PERIOD 202609, all 200 rows read and counted by insurer on 2026-10-22 (primary). The dataset does not split savings policies from executive insurance.

| Insurer (legal name, as in the dataset) | Track rows 202609 | Cohorts reported | Hosted or branded tracks seen in names | Savings-policy terms read |
|---|---|---|---|---|
| איילון חברה לביטוח בע"מ | 20 | 1990-91, 1992-2003, 2004+ | none | no |
| הכשרה חברה לביטוח בע"מ | 32 | 1990-91, 1992-2003, 2004+ | Meitav Portfolio Mgmt, Yalin Lapidot, Mor, Altshuler Shaham, Analyst | no |
| הפניקס חברה לביטוח בע"מ | 34 | 1990-91, 1992-2003, 2004+ | Excellence Invest, BlackRock, Apollo | FAQ (Phoenix Invest), plan 5552 |
| הראל חברה לביטוח בע"מ | 33 | 1990-91, 1992-2003, 2004+ | Fidelity | executive plan 1286; 2016 letter |
| ישיר -איי. די. איי. חברה לביטוח בע"מ | 5 | 2004+ only | none | no |
| כלל חברה לביטוח בע"מ | 25 | 1990-91, 1992-2003, 2004+ | State Street | plan 1418 |
| מגדל חברה לביטוח בע"מ | 22 | 1990-91, 1992-2003, 2004+ | מגדל שוקי הון | no (product page needs JavaScript) |
| מנורה מבטחים חברה לביטוח בע"מ | 29 | 1990-91, 1992-2003, 2004+ | none | no |

Market size (CMA report 2024, table ד-2, ד-5): the profit-sharing life portfolio held NIS 497,401m at end-2024. Deposits in 2024 to profit-sharing policies issued from 2004, excluding pure savings policies, were NIS 13,161m. That was down 18.85% on 2023, led by Migdal (32.4% share), Harel (21.0%), Clal (18.9%) and Phoenix (15.7%). The CMA counts 10 insurance companies in long-term savings, including insurers whose life insurance is not combined with pension savings (table ד-1, note 3). The two not in Bituach-Net, AIG and Libra, appear in the CMA's life-insurance deposit table (ד-4) and the risk-insurance price tables (INS-19), not in Bituach-Net.

## Open questions

1. **Legal definition of "ביטוח חיים משתתף ברווחים" in the Insurance Contract Regulations, and the legal status of a pure savings policy ("חוזה השקעה").** Tried: fee regulations (refer to it), Clal terms. Likely in תקנות הפיקוח על עסקי ביטוח (תנאים בחוזי ביטוח) on Nevo or Wikisource. **[2026-10-24 R5 pass: narrowed. The contract-terms regulations define the term by reference to the insurer investment regulations, which refer to the 1998 report regulations: "ביטוח חיים שבו זכויות המוטב והמבוטח תלויות בתשואה של השקעות מסוימות שהמבטח עושה באופן מיוחד לענין תכנית שאושרה כביטוח כזה בידי המפקח" (INS-25). The 1998 regulations are marked repealed (תשפ"ג); where the definition lives now, and the "חוזה השקעה" status, still need a browser pass through the CMA codex on gov.il.]** **[2026-10-25 rule-text pass: chain re-traced on the gazette: 1995 contract-terms reg. 1 (5682 p.2) → 1986 investment regulations, replaced in 2001 (6094 p.22, reg. 66) → 2001 reg. 1 (6094 p.8) → 1998 report-details regulations (5884 p.2), repealed in June 2023 (10695 p.2). Still open: where the definition lives now.]**
2. **Is there any regulatory cap on savings-policy management fees?** Searched (3 queries) and found none. Clal's 6%/1.5% and Phoenix's 4%/1.7% suggest none. Likely answer: the CMA codex chapter on life insurance (שער 6) or a circular on profit-sharing policies; needs a manual gov.il pass. **[2026-10-24 R5 pass: closed at primary (mirror) strength. Reg. 6א of the Insurance Contract Terms Regulations caps the balance fee at 1% a year, 2% with the Commissioner's approval (INS-25). Deposit fees are not covered by that text: open question 16.]**
3. **Does CMA circular 2017-9-15 (fee discount duration and increase notices) apply to savings policies?** It applies to "institutional bodies" for "מכשירי החיסכון הפנסיוני". Whether a savings policy is one was not established.
4. **Period and definition of the Comptroller's 0.94% savings-policy average fee.** Only the summary (pp. 336 to 337) was read; the detailed chapter was not located in the 7.4 MB file.
5. **Minimum deposits at Clal, Harel, Migdal, Menora, Ayalon, Hachshara and IDI.** Only Phoenix's are sourced. Each insurer's product page or offer form ("הצעה לביטוח"); Migdal's page needs a browser.
6. **Hosted tracks: is there an extra fee, who bears the outside manager's fee, and what happens if the hosting agreement ends?** Look in Hachshara and Phoenix track annexes and the CMA hosting policy (2026 tracks circular).
7. **Transfer of a savings policy to another insurer without withdrawing.** No official source found (one search). Check CMA circulars and the Tax Authority position; the tax side is TXA's.
8. **Fee regime for guaranteed-return insurance funds ("קופת ביטוח מבטיחת תשואה") and old "עדיף" and classic policies.** Excluded from reg. 2; not researched.
9. **What the Bituach-Net cohorts mean officially, and whether the old-cohort fee field includes the 15% variable fee.** Only Phoenix's legacy page and the data were read. Likely in the Bituach-Net portal notes (ECONNRESET today) or CMA circulars on profit-sharing fee structures.
10. **Guaranteed annuity factors: which policies have them, when sale stopped, under which CMA rule, and whether they survive a transfer or a raise in deposits.** One institution example (Harel 1286) and one blog (not used). Likely a CMA circular on annuity factors in insurance funds (around 2012 to 2013).
11. **Disability (אובדן כושר עבודה) and risk cover prices inside executive policies, and the "ריסק זמני" product** (also PEN open question 12). The CMA comparison read covers only individual death cover.
12. **ח"ץ bond holdings in old-cohort portfolios** and whether they affect returns credited to holders. Accountant General debt reports (GOV).
13. **Phoenix track 2081 "מסלול השקעה בניהול אישי" in Bituach-Net** (NIS 14.5 bn, fee field 3.72): a self-directed policy product? Not checked.
14. **Partial-withdrawal floors and payout times at the other insurers**, and whether the regulations under s. 23 set a payout deadline for insurance funds (Harel 1286 s. 13.9 refers to them).
15. **CMA "חוזי השקעה" anti-money-laundering letter (about 2019)** seen only in a search extract; not opened.
16. **On which provision do savings-policy deposit fees rest?** Reg. 6א(א) and (א1) cap only a fee as a percentage of the portfolio value; (א2) forbids any other kind of fee when a higher rate is approved. Clal charges up to 6% of regular deposits (INS-03). Likely in the Commissioner's approval of each plan or a CMA circular on profit-sharing policies (gov.il, browser). Added 2026-10-24.

## Left out and why

- All tax (capital gains on withdrawal, real vs nominal gain, notional redemption, section 125D, interest exemption for older holders, employer-contribution tax, severance reconciliation, Amendment 190): TXA owns it. Institution tax claims seen here are passed on below, not used.
- Pure risk insurance (life, disability, health, long-term care) as products in their own right: product.md section 4 excludes insurance other than savings policies. Risk pricing appears only as a component of executive insurance (INS-19).
- Annuity-only policies ("פוליסת קצבה" for beneficiaries or retirees, for example Clal's annuity policy at up to 1.00%): a payout product, mentioned only where a savings policy can convert into it.
- Old guaranteed-return policies and pension funds under special management: closed; flagged in open question 8.
- Insurance-agent commissions and the advice process: the site carries no agent links and does not recommend advisers; only the 2026 plan item on life-insurance discounts and commission clawback is recorded (INS-24).
- Past returns by insurer (CMA table ד-12, Bituach-Net yields): history only, not a ranking key (product.md section 4).
- The Comptroller report's chapters on CMA staffing, budget and cyber risk: not about the products.
- Secondary sources seen in searches (pensuni.com, protocol.co.il, financa.co.il, Supermarker, Bizportal, Calcalist): not used for any rule. The pensuni blog's "guaranteed factors until 2013" claim is recorded only as a lead in open question 10.

## Graduation status

D2: a tier-2 instrument moves to tier 1 when it has a sourced record and its tax questions are closed.

**Savings policy**
- Sourced now:
  - what it is and that it is not a provident fund (INS-01);
  - no annual deposit ceiling (INS-02, primary via the Comptroller);
  - contractual fee maximums at two insurers and the absence of a regulation cap (INS-03);
  - the lost-contact cap (INS-04, primary);
  - CMA and Comptroller fee references (INS-05, primary);
  - Phoenix minimums (INS-06);
  - withdrawal, payout time and partial-withdrawal rules at two insurers (INS-07);
  - tracks and switching (INS-08), hosted tracks and their size (INS-09);
  - death cover and annuity option (INS-10, INS-11);
  - protection (INS-21), the data source (INS-23), planned changes (INS-24).
- Still blocking:
  1. Tax: the whole of TXA (capital gains basis, real gain, notional redemption, switch and inter-insurer transfer treatment). Under D10 nothing computes until these are at least secondary. **[2026-10-25 tax-bases research]** TXA open question 1 narrowed: the real-gain base is the law's (s.3(ה5), s.9(13)), and the track-switch and inter-insurer rules come from the Ministry of Finance team's report (TXA-28); TXA open question 3 is answered by the same report. Still open: whether 15% can reach a policy that is not profit-sharing, and the notional redemption (The Phoenix's own practice, TXA-29).
     - ~~TXA open question 3 (moving to another insurer)~~ closed 2026-10-25: a move to another insurer is a withdrawal and a tax event, per the Ministry of Finance team's February 2025 report (TXA-28).
  2. ~~Whether any regulatory fee cap exists (open question 2).~~ Closed 2026-10-24: the balance fee is capped at 1% a year, 2% with approval (INS-25). Still open: the basis of deposit fees (open question 16). Fee comparisons can show the cap beside each insurer's contractual maximum and the CMA average.
  3. Minimums, payout times and partial-withdrawal rules for the remaining six insurers (open questions 5, 14), needed for the workbench (3.4).
  4. No way to tell savings-policy tracks from executive tracks in Bituach-Net (INS-23). The catalogue (3.10) needs a hand-kept `data/catalog/` mapping from insurer product names to tracks.
  5. The inter-insurer transfer route (open question 7).

**Executive insurance**
- Sourced now:
  - legal type and the law provisions that apply (INS-13, INS-14, primary);
  - fee caps by issue date (INS-15, primary for the rule, institution for pre-2013 examples);
  - the cohort split and partial fee-structure evidence (INS-16);
  - one guaranteed-annuity-factor example (INS-17);
  - mandatory-pension fit (INS-18);
  - insurance-component pricing spread (INS-19);
  - withdrawal and transfer rules (INS-20);
  - protection and the differences from a pension fund (INS-21, INS-22).
- Still blocking:
  1. Tax: TXA and TXP for insurance funds (employer contributions into an insurance fund, disability-cover tax treatment, withdrawal and annuity).
  2. Official meaning of the cohorts and old-policy fee structures (open questions 8, 9).
  3. Guaranteed annuity factors: which policies have them and what leaving costs (open question 10). The holdings review (3.6) cannot advise moving an old policy without this, because a transfer can give up a guarantee.
  4. Insurance-cover prices inside executive policies (open question 11), needed to compare against a pension fund on equal terms.
  5. Current executive-policy terms from more than one insurer (only a 2009 Harel plan and a 2016 Harel letter were read).

For the founder (22, salaried, no executive policy) neither product is likely to change a first decision. The tier-2 page can state this file's sourced facts and these blockers.

*2026-10-24 R5 pass (graduation ranking in `scratchpad/reports/r5-tier2.md`):* the savings policy's product record is now mostly sourced (regulator, fee cap INS-25, no ceiling INS-02, exit INS-07, switch INS-08, protection INS-21, statement INS-26); what blocks it is tax: TXA open question 1 rests on insurer statements and one secondary source (TXA-05, TXA-28), so under D10 and coverage.md F1 it needs a founder decision before anything computes. Executive insurance stays blocked by TXA open questions 6 and 7 and by open questions 8 to 11 here.

## Found for other files

- `tax-insurance-and-amendment-190.md` (TXA), institution claims only, to verify:
  - Clal's product page says a track switch carries no capital-gains tax and tax is paid only on withdrawal, on the real gain. It also mentions an interest-income exemption for insured persons at retirement age who were at least 55 on 01.01.2003.
  - Clal 1418 s. 19: the insurer deducts tax at source.
  - Phoenix FAQ: a year-end "פדיון רעיוני" (notional redemption) for capital-gains purposes, and redemption "כפוף למס רווחי הון".
  - Phoenix Meniv page: severance reconciliation and form 161.
  - Secondary (financa.co.il): section 125D deferral, and a move between insurers is taxed.
- `provident-family-common.md` (PF):
  - Fees Regs reg. 11 (regs. 2 and 7 do not apply to insurance-fund policies issued before 1.1.2013) and reg. 12 (start date 1.1.2013).
  - Reg. 8(ו) extends the lost-contact cap to profit-sharing life policies.
  - Provident Funds Law s. 56(א) list of provisions applying to insurance funds.
  - The PF "left out" lead on reg. 2(ב) is confirmed: only guaranteed-return insurance funds are excluded.
- `pension-and-gemel-lekitzba.md` (PEN):
  - CMA report 2024 table ד-12: real average annual return 2019 to 2024 of profit-sharing policies issued before 2004 (5.59%) and from 2004 (4.36%), history only.
  - The extension order's s. 4(2) on insurance funds is quoted in the Hilan mirror.
  - s. 56 confirms ss. 20 and 23 apply to insurance funds.
- `regulators-and-protection.md` (REG): s. 56(א) applies Provident Funds Law s. 30 (non-attachment) to insurance funds but not s. 27 (separate holding). REG-22 can cite this file for the product side.
- `tracks-catalogue-and-decoder.md` (CAT):
  - Bituach-Net 202609 has 200 rows over 8 insurers (counts in the Institutions table).
  - Hosted-track naming patterns: "מנוהל באמצעות", "אקסלנס אינווסט", "BlackRock", "Apollo", "fidelity", "State Street", "מגדל שוקי הון".
  - Cohort portfolio names "קרן ח'/ט'/י'/י' חדשה".
  - Menora "(משת)" suffix tracks.
  - Null fees on new tracks (15530, 15463, 15464, 15779, 15825, 15826).
  - Phoenix 2081 personal-management track.
- `kupat-gemel-lehashkaa.md` (KGL): State Comptroller (Jan 2024, p. 336) average fee 0.64% in kupat gemel lehashkaa, and the finding that its deposit ceiling disadvantages it against savings policies.
- `switching-and-transfers.md` (SW):
  - Phoenix: a savings-policy track switch cannot be cancelled once submitted, and handling takes 3 business days.
  - Harel 1286: partial transfer of 90% or more, or leaving less than NIS 20,000 (October 2008 CPI), is treated as full; a loan must be repaid before transfer.

## Sources

| Title | Publisher | Strength | URL | Checked |
|---|---|---|---|---|
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (דמי ניהול), התשע"ב-2012, reg. 1, 2, 7, 8, 11, 12 | Minister of Finance; Wikisource mirror | primary (mirror) | https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(דמי_ניהול) | 2026-10-22 |
| חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס"ה-2005, s. 1, 13, 23, 32, 49, 56, 57 | Knesset; Wikisource mirror | primary (mirror) | https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל) | 2026-10-22 |
| תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס"ח-2008 (via PF-17) | Wikisource mirror | primary (mirror) | https://he.wikisource.org/wiki/תקנות_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)_(העברת_כספים_בין_קופות_גמל) | 2026-10-22 |
| חוק הפיקוח על שירותים פיננסיים (ביטוח), s. 54 (via REG-22) | Wikisource mirror | primary (mirror) | https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(ביטוח) | 2026-10-22 |
| צו הרחבה (נוסח משולב) לפנסיה חובה, s. 2, 3, 4(2) | Hilan text mirror | secondary (mirror) | see INS-18 link | 2026-10-22 |
| Bituach-Net field dictionary "פירוט שינויים פורמט חדש ביטוח" | CMA via data.gov.il | primary | https://data.gov.il/api/3/action/datastore_search?resource_id=388992c7-0280-48d8-b147-13e636bd804d&limit=100 | 2026-10-22 |
| Bituach-Net 2024+ data, REPORT_PERIOD 202609 (200 rows) | CMA via data.gov.il | primary | https://data.gov.il/api/3/action/datastore_search?resource_id=c6c62cc7-fe02-4b18-8f3e-813abfbb4647&filters=%7B%22REPORT_PERIOD%22%3A202609%7D&fields=FUND_ID,FUND_NAME,PARENT_COMPANY_NAME,FUND_CLASSIFICATION,TOTAL_ASSETS,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE&limit=500&sort=PARENT_COMPANY_NAME%20asc | 2026-10-22 |
| דוח הממונה על שוק ההון, הביטוח והחיסכון לשנת 2024, pp. 45 to 50, 56 to 59 | CMA; copy on adif-web-bucket S3 | primary (third-party host) | https://adif-web-bucket.s3-eu-west-1.amazonaws.com/%D7%93%D7%95%D7%97%20%D7%94%D7%9E%D7%9E%D7%95%D7%A0%D7%94%20%D7%A2%D7%9C%20%D7%A9%D7%95%D7%A7%20%D7%94%D7%94%D7%95%D7%9F%20%D7%9C%D7%A9%D7%A0%D7%AA%202024.pdf | 2026-10-22 |
| תכנית אסדרה לשנת 2026, pp. 20 to 21 | CMA (gov.il) | primary | https://www.gov.il/BlobFolder/reports/report_0015/he/regulation_plan_26_1.pdf | 2026-10-22 |
| הפיקוח של רשות שוק ההון על הגופים המוסדיים המנהלים חיסכון ארוך טווח (January 2024), summary pp. 333 to 343, pp. 352 to 357 | State Comptroller | primary | https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2024/The-cost-of-living/2024-The-cost-of-living-104-Hon.pdf | 2026-10-22 |
| פעילות חברות בעלות רישיון השקעות 2025, p. 19 | ISA; copy hosted by Funder | primary (third-party host) | https://cdn.funder.co.il/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA%20%D7%97%D7%91%D7%A8%D7%95%D7%AA%20%D7%91%D7%A2%D7%9C%D7%95%D7%AA%20%D7%A8%D7%99%D7%A9%D7%99%D7%95%D7%9F%20%D7%94%D7%A9%D7%A7%D7%A2%D7%95%D7%AA%202025_842jZyuHN.pdf | 2026-10-22 |
| תנאים כלליים לביטוח חיים – חיסכון פיננסי לעתיד (1418), 08/2024, pp. 1 to 12 | Clal Insurance | institution | https://www.clalbit.co.il/media/yy5djhg3/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A4%D7%99%D7%A0%D7%A0%D7%A1%D7%99-%D7%9C%D7%A2%D7%AA%D7%99%D7%93-1418.pdf | 2026-10-22 |
| חיסכון פיננסי לעתיד, product page | Clal Insurance | institution | https://www.clalbit.co.il/savingandmanagementins/financialsaving/ | 2026-10-22 |
| נספח 5552 תנאים כלליים לביטוח חיים – תכנית פרט-מסלול לחיים, November 2024, pp. 1 to 4, 7 to 8 | Phoenix Insurance | institution | https://digital-content.fnx.co.il/sites/docs/polarchive/LifeInsurance/nispach5552_1124.pdf | 2026-10-22 |
| הפניקס אינווסט, שאלות ותשובות | Phoenix Insurance | institution | https://www.fnx.co.il/savings/savings-routes/faq/ | 2026-10-22 |
| פוליסת מניב | Phoenix Insurance | institution | https://www.fnx.co.il/life-insurance/meniv/ | 2026-10-22 |
| הראל מגוון למנהלים קצבה משלמת, plan 1286, edition 7/2009, pp. 1 to 5, 13 to 15, 20 to 22 | Harel Insurance | institution | https://www.harel-group.co.il/Policies/2010.pdf | 2026-10-22 |
| הגדלת שיעורי הפקדה למוצר פנסיוני בהתאם לצו ההרחבה, June 2016, with annexes א and ב | Harel | institution | https://biz.harel-group.co.il/DocumentsAndForms/הגדלת%20שיעורי%20הפקדה%20למוצר%20פנסיוני%20בהתאם%20לצו%20ההרחבה.pdf | 2026-10-22 |
| Opened, not relevant: CMA pension circular 2017-3-1 "הוראות לניהול קרן חדשה" (Prisha copy) | CMA | primary | https://www.prisha.co.il/UserFiles/File/pdf/hoz/hoz03052017.pdf | 2026-10-22 |
| Opened, not read past p. 3: CMA annual report 2022, chapter 3 | CMA (gov.il) | primary | https://www.gov.il/BlobFolder/reports/report_0004/he/CMISA_AnnualReport2022_Ch3_new.pdf | 2026-10-22 |
| Attempted, page content not readable (JavaScript): Migdal Keshet savings policy | Migdal | institution | https://www.migdal.co.il/product/keshet-policy | 2026-10-22 |
