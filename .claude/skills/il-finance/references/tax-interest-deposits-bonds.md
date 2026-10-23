# Tax on interest: deposits, savings plans, current accounts, makam and government bonds

Checked: 2026-10-22 · Owner: tax-specialist
Serves: product.md 3.1 (instrument guide: deposit, makam and government-bond pages), 3.2 (wrapper mode and the idle-cash preset: deposits vs money-market funds vs makam), 3.3 (dimension checklist), 3.8 (rule base). Roadmap R1 (rule base, guide) and R2 (idle-cash preset).
Scope: income tax on interest paid to an Israeli-resident individual (not a business, not a substantial shareholder) on shekel bank deposits, savings plans and current-account credit balances; makam; Israeli government bonds (unlinked fixed, CPI-linked, variable); withholding and reclaiming; reliefs for low income and old age; loss offset as it touches these instruments.
Out: FX deposits and structured deposits (`tax-tier2-other.md`; Q2 status in TXI-04 and open question 4); corporate bonds (`tax-tier2-other.md`); mutual and money-market funds and the general loss rules (`tax-securities-israeli.md`); brackets, surtax, filing thresholds, the inflationary amount, National Insurance and health on interest (`tax-general.md`); what each product is and how it is bought (`bank-current-account-deposits.md`, `government-bonds-and-makam.md`).

How sources were read: the Income Tax Ordinance was read from the Hebrew Wikisource consolidated text through a fetch tool that summarises; Hebrew phrases marked "quoted" were returned verbatim in short pieces, the rest is close translation. The Tax Authority guide, the 2026 deductions booklet and the two sets of regulations on btl.gov.il were read as page images (no text layer could be extracted); wording given from them is my reading of the image. Re-read the exact wording before encoding (open question 17).

## Summary

- Interest of an individual, including the discount on makam ("דמי ניכיון"), is taxed at a ceiling of 25%, treated as the top slice of income. If the asset is not CPI-linked, or only partly linked, the rate is 15% on the whole nominal interest.
- A deposit counts as linked only if it is fully linked. Partly linked deposits fall in the 15% bucket. For a fully CPI-linked deposit or bond, the linkage is exempt and only the real interest is taxed (up to 25%).
- The bank withholds 15% or 25% when it pays the interest. Deposit and savings-plan profits are taxed on withdrawal. Interest is reported on form 867.
- Makam held to redemption: the discount is interest, 15%. Selling an unlinked government bond or makam before maturity gives a capital gain taxed at up to 15%, with the whole gain counted as real. A CPI-linked government bond (Galil type): coupons pay up to 25% on real interest, and a sale pays up to 25% on real capital gain.
- A capital loss on securities can be offset in the same year against interest on securities (bonds, makam). The law's wording does not cover bank-deposit interest.
- Relief: the 25% ceiling is a maximum. A person aged 60 or over with low income may pay less on linked interest. The 15% rate is worded as a fixed rate. Low-income households get a deduction from deposit interest (69,840 / 10,920 NIS, 2024-2027). The extra age reliefs apply only to people who were 55 or older on 1.1.2003.
- On 100 NIS of gross yield: an unlinked deposit, makam or Shahar coupon nets 85 NIS of income tax; a linked instrument nets 100 minus 25% of the real part. National Insurance and health on interest are not settled yet (open in `tax-general.md`).

## Rules

### TXI-01 "Interest" includes the makam discount
- Rule: For the interest rates in s.125C, "interest" ("ריבית") includes discount fees ("דמי ניכיון"). The discount on a makam or any discount bond is therefore interest income, not a capital gain, when it is paid at redemption.
- Conditions / exceptions: An individual. On a sale before redemption see TXI-12; on a redemption that creates a capital loss see TXI-13.
- Figures: none.
- Source: [Income Tax Ordinance, s.125C(a)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "ריבית" – לרבות דמי ניכיון · checked 2026-10-22 · primary (legislation, Wikisource mirror). The withholding regulations use the same idea: "ריבית" there means interest, linkage differentials that are not exempt (including partial linkage differentials under s.9(13)), and discount fees: [Income Tax (Withholding from Interest, Dividend and Certain Profits) Regulations 2005, reg. 1](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary
- Dimensions: tax-during, tax-at-exit
- Likely to change: no

### TXI-02 Ceiling of 25% on interest, as the top slice
- Rule: An individual is taxed on interest income at a rate "not exceeding 25%". The interest is treated as the highest slice of their taxable income.
- Conditions / exceptions: Overridden by the 15% rate for unlinked assets (TXI-03) and by the exclusions in TXI-06. Because it is a maximum, a lower bracket can apply where the person is entitled to one (TXI-19). The top-slice rule matters for the surtax (see `tax-general.md`).
- Figures: 25%, in force 2026; fixed in law.
- Source: [Income Tax Ordinance, s.125C(b)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "יחיד חייב במס על הכנסה מריבית בשיעור שלא יעלה על 25%," "ויראו את הכנסתו זו כשלב הגבוה ביותר בסולם הכנסתו החייבת." · checked 2026-10-22 · primary. Same rates in [Tax Authority, דע זכויותיך וחובותיך 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.40 (fields 21-23) and p.116 ("ריבית על פיקדון - 15%, 25%") · checked 2026-10-22 · primary
- Dimensions: tax-during, tax-at-exit
- Likely to change: no (last amended 2012 per the amendment list on the section)

### TXI-03 15% on interest from an asset that is not fully CPI-linked
- Rule: If the interest was paid on an asset that is not linked to the index, or is only partly linked to the rise in the index, or is not linked until redemption or repayment, the individual pays 15% on the interest. The rate applies to the whole nominal interest; there is no inflation deduction.
- Conditions / exceptions: The exclusions in TXI-06 send the interest to marginal rates instead. The statute words this as a rate "of 15%", not "not exceeding 15%" (compare TXI-02). The Finance Minister may change the 15% rate by order in line with changes in the index. No such order was found, and the consolidated text, the 2025 Tax Authority guide and the 2005 regulations all show 15%. Whether the power was ever used in the past is open question 10, which is tax open question Q3.
- Figures: 15%, in force 2026; may be changed by ministerial order (s.125C(c)(2)).
- Source: [Income Tax Ordinance, s.125C(c)(1)-(2)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "שולמה הריבית על נכס שאינו צמוד למדד," "או שהוא צמוד בחלקו לשיעור עליית המדד, כולו או חלקו," "או שאינו צמוד למדד עד לפדיון או עד להחזר, תחויב הכנסתו של היחיד מריבית במס בשיעור של 15%." and "שר האוצר רשאי לשנות בצו את שיעור המס הקבוע בפסקה (1), בהתאם לשינוי במדד." · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.40: unlinked deposit or plan, 15%, field 21 (317/217/078) · checked 2026-10-22 · primary
- Dimensions: tax-during, tax-at-exit, real-vs-nominal
- Likely to change: yes. The Minister can change the rate by order without legislation.

### TXI-04 What counts as "linked": the index, partly linked, prime-linked, FX
- Rule: The "index" is the CPI last published before the relevant day. For an asset linked to or denominated in foreign currency, it is the exchange rate. The Tax Authority guide says a deposit or savings plan counts as "not linked" unless it is fully linked to the index. All other deposits and plans count as "linked". A partly linked deposit is therefore taxed at 15% on all its interest, and its partial linkage differentials are taxable interest, not exempt (TXI-05).
- Conditions / exceptions:
  - Prime-linked deposit ("צמוד פריים"): no source names it. On the statutory definition, the index is the CPI or an exchange rate, and the prime rate is neither. Read that way, such a deposit is "not linked" and taxed at 15%. This is my reading, not a published statement (open question 2).
  - FX deposits (tax open question Q2): the 2025 guide says that for a deposit or savings plan linked to or denominated in foreign currency, the exchange rate is the index. Such a deposit is therefore in the linked bucket: up to 25% on the gain above the rise in the exchange rate. This is the explicit Tax Authority statement Q2 asked for, as far as the interest bucket is concerned. Everything else about FX deposits belongs in `tax-tier2-other.md`, including the olim exemption orders and a possible mismatch in withholding (open question 4).
- Figures: none.
- Source: [Income Tax Ordinance, s.125C(a) definition of "מדד"](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.40, paragraph "אופן הצמדה" (index is the CPI; the exchange rate for FX-linked or FX-denominated deposits and plans; "not fully linked" means "not linked") · checked 2026-10-22 · primary (read from page image). Regulation definition "נכס שאינו צמוד למדד" (includes a partly linked asset) in [Withholding Regulations 2005, reg. 1](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary
- Dimensions: real-vs-nominal, currency, tax-during
- Likely to change: no

### TXI-05 Linkage on a fully linked asset is exempt, so only real interest is taxed
- Rule: Linkage differentials ("הפרשי הצמדה") that an individual receives on an asset are exempt, provided that: they are not "partial linkage differentials" as the Finance Minister defines them; the individual did not claim interest or linkage expenses on the asset; and they are not business income or recorded in books. For a fully CPI-linked deposit, savings plan or bond, the CPI linkage is therefore exempt. The interest above the linkage is taxed at up to 25%. The guide puts it as: on a linked deposit or plan, "the profit above the rise in the index" is taxed at up to 25% (field 23, 342/242/142).
- Conditions / exceptions: Linkage differentials include exchange-rate differences (s.1 definition). The Minister's definition of "partial linkage differentials" was not found (open question 1). Partial differentials are taxable and are included in "interest" for withholding (TXI-01).
- Figures: none.
- Source: [Income Tax Ordinance, s.9(13)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "(13) הפרשי הצמדה שקיבל יחיד בשל נכס, ובלבד שהתקיימו כל אלה:" "(1) הפרשי ההצמדה אינם הפרשי הצמדה חלקיים"; and the s.1 definition of "הפרשי הצמדה" · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.37 (definition of linkage differentials) and p.40 · checked 2026-10-22 · primary
- Dimensions: real-vs-nominal, tax-during
- Likely to change: no

### TXI-06 When the reduced interest rates do not apply (marginal rates instead)
- Rule: The 25% ceiling and the 15% rate do not apply, and the interest is taxed at the ordinary s.121 rates, if any of these is true: (1) the interest is business income or is recorded, or must be recorded, in the individual's books; (2) the individual claimed a deduction for interest and linkage expenses on the asset; (3) the individual is a substantial shareholder in the payer; (4) the individual is an employee or supplier of the payer, or has another special relationship with it, unless the assessing officer is satisfied that the rate was set in good faith; (5) the interest is paid from a study fund before its holding periods end, or from a provident fund for savings where s.3(d) applies; (6) other conditions set by the Minister with Finance Committee approval.
- Conditions / exceptions: Point (4) can affect a bank employee holding a deposit at their own bank. Withholding then follows reg. 6: the payer withholds at the maximum rate from a substantial shareholder or from an employee or supplier.
- Figures: none.
- Source: [Income Tax Ordinance, s.125C(d)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "יחיד חייב במס בשיעור הקבוע בסעיף 121" · checked 2026-10-22 · primary. [Withholding Regulations 2005, reg. 6](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary. Guide 2025 printed pp.38-39 lists the same exclusions · primary
- Dimensions: eligibility, tax-during
- Likely to change: no

### TXI-07 Timing: deposits and savings plans are taxed on withdrawal; tax is withheld when interest is paid
- Rule: Profits accumulated in deposits and savings plans are taxed at withdrawal. The bank withholds when it pays the interest to the individual (TXI-08).
- Conditions / exceptions: No rule specific to breaking a deposit early was found. Withholding attaches to interest actually paid, so a break that reduces the interest reduces the base, but no source says this in words (open question 14). The 2005 regulations define "first exit station" ("תחנת יציאה ראשונה") and a "worsening of the savings terms" ("הרעת תנאי החיסכון") for savings plans, but only for the transitional rates on plans opened before 2006 (reg. 20).
- Figures: none.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.40, heading "סעיפים 21–23 – ריבית ורווחים מפיקדונות ותוכניות חיסכון", sentence: profits accumulated in deposits and savings plans are taxed at withdrawal ("מחויבים במס בעת המשיכה") · checked 2026-10-22 · primary (page image). [Withholding Regulations 2005, regs. 4, 20(c)](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary
- Dimensions: tax-at-exit, liquidity-lockup
- Likely to change: no

### TXI-08 Bank withholding on deposit, savings-plan and current-account interest
- Rule: A banking corporation that pays interest to an individual withholds 25%. If the interest is on an asset not linked to the index, it withholds 15%. The rule covers any interest a bank pays to an individual, so it reaches current-account credit interest as well as deposits and plans.
- Conditions / exceptions:
  - The exemption orders for FX deposits of certain residents (form 2402 or 2409) are out of scope; see `tax-tier2-other.md`.
  - A TASE member that receives interest from a bank for its clients withholds itself, and the bank does not withhold (reg. 8).
  - In a joint account, interest is treated as paid to the partners in equal shares unless the assessing officer is shown otherwise (reg. 9).
  - On request, the payer gives each recipient an annual certificate on form 0867 by 20 March for the previous year (reg. 16). The guide says to copy the form 867 figures into fields 21-23 and 043 of the return.
  - Withheld tax is credited only against such a certificate (reg. 17).
  - When withholding is full, whether a return is needed is in `tax-general.md`. The 2025 guide gives an interest ceiling of 717,000 NIS for the filing exemption.
- Figures: 25% / 15%. Regulations in force from 1.1.2006, consolidated through the amendment of 27.12.2017 (the btl copy).
- Source: [Withholding Regulations 2005, regs. 4, 8, 9, 16, 17](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary (text on a government site, consolidated to 2017; later amendments not checked, open question 18). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed pp.3-4, 40 · primary
- Dimensions: tax-during, reporting-obligation
- Likely to change: no

### TXI-09 Withholding by other payers (bond coupons, makam discount)
- Rule: A payer other than a bank that pays interest to an individual withholds 25%. On an asset not linked to the index it withholds 15%, except on a savings plan in a profit-sharing insurance policy. Interest on a bond or state loan issued before 8 May 2000 ("היום הקובע") and paid to an individual who is not a substantial shareholder is withheld at 35% where the interest is taxable.
- Conditions / exceptions: Interest exempt under the 2004 regulations on state loans, the 1991 order on FX state loans, or s.9(15D) is not withheld under this rule (reg. 5(c)). A "state loan" ("מילווה מדינה") in these regulations includes a loan issued under the Short-Term Loan Law 1984, which is the makam, so the makam discount is withheld at 15%.
- Figures: 25% / 15% / 35% (legacy bonds).
- Source: [Withholding Regulations 2005, reg. 1 (definitions "מילווה מדינה", "ריבית"), reg. 5](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary
- Dimensions: tax-during, tax-at-exit
- Likely to change: no

### TXI-10 Interest that accrued before 2012 (old deposits and bonds)
- Rule: Interest received now but accrued before 1.1.2012 keeps the older rates: 20% or 15% by linkage for 2006-2011, and 15% or 10% for interest accrued before 1.1.2006. The split is linear: the interest is multiplied by the share of the accrual period that falls in each era. Traded bonds issued before 8.5.2000 have their own legacy rates (35% on real interest for linked bonds; interest accrued before 1.1.2003 on later linked bonds at 35%; unlinked bonds issued before 8.5.2000 continue to be exempt).
- Conditions / exceptions: This is relevant only to a saver holding a deposit, plan or bond that started before 2012. The site can treat it as not applicable for new money.
- Figures: as above; fixed.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed pp.39-40 · checked 2026-10-22 · primary (page image). [Withholding Regulations 2005, reg. 20](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · primary
- Dimensions: tax-at-exit
- Likely to change: no

### TXI-11 Makam held to redemption: the discount is interest at 15%
- Rule: A makam is a short-term state loan that is not CPI-linked. Its discount is "interest" (TXI-01) on an unlinked asset (TXI-03), so the discount is taxed at 15% and withheld at 15% on payment (TXI-09).
- Conditions / exceptions: This applies to the discount received at redemption. A sale before redemption is TXI-12, and a redemption that creates a capital loss is TXI-13. One line in the 2025 guide, inside an item on unlinked traded bonds issued before 8.5.2000, reads that "דמי ניכיון על מק"מ" are taxed at 20% at realization. It conflicts with s.125C(c) and looks like legacy text (open question 3). That the makam is unlinked is a product fact to confirm in `government-bonds-and-makam.md`.
- Figures: 15% (2026).
- Source: [Income Tax Ordinance, s.125C(a),(c)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה); [Withholding Regulations 2005, regs. 1, 5](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary. Conflicting line: Guide 2025 printed p.39, "ריבית על אגרות חוב" item 3 · primary (page image)
- Dimensions: tax-at-exit
- Likely to change: no

### TXI-12 Selling an unlinked government bond or makam before maturity: capital gain up to 15%, all treated as real
- Rule: Israeli government bonds and loans are "securities" for capital-gains purposes. A capital gain on selling a bond, commercial paper, loan ("מילווה") or credit that is not index-linked is taxed at a rate not exceeding 15%, and the whole gain is treated as real: there is no inflation deduction. A bank or TASE member that pays the proceeds withholds 15% of the capital gain on a security that is not linked to the index.
- Conditions / exceptions:
  - "Not index-linked" includes partly linked, until redemption or repayment.
  - The 15% is a maximum ("שלא יעלה על"), unlike the fixed 15% on interest (TXI-03). For people aged 60 or over with low income see TXI-19 and `tax-securities-israeli.md`.
  - The Minister may change the rate by order.
  - How the sale price is split between accrued discount or interest and capital gain is open (open questions 3 and 5). Both are at 15%, so the split changes the net only through loss offset and the max-versus-fixed distinction.
  - A substantial shareholder pays up to 20%.
- Figures: 15% (2026).
- Source: [Income Tax Ordinance, s.88 definition of "נייר ערך"](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "לרבות איגרת חוב או מילווה של מדינת ישראל או בערבותה"; [s.91(b)(3)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "רווח הון במכירת איגרת חוב, נייר ערך מסחרי, מילווה או הלוואה, שאינם צמודים למדד," "יחויב במס בשיעור שלא יעלה על 15%, ... ויראו את כל רווח ההון כרווח הון ריאלי." · checked 2026-10-22 · primary. Withholding: [Income Tax (Withholding from Consideration, Payment or Capital Gain on Sale of a Security...) Regulations 2002, reg. 2(b)](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מתמורה,_מתשלום_או_מרווח_הון_במכירת_נייר_ערך,_במכירת_יחידה_בקרן_נאמנות_או_בעסקה_עתידית)), quoted: "בנייר ערך שאינו צמוד למדד, ינכה מס בשיעור של 15% מרווח ההון." · checked 2026-10-22 · primary (Wikisource mirror, page edited 19.2.2026)
- Dimensions: tax-at-exit, real-vs-nominal, switching-tax-event
- Likely to change: yes. The rate can be changed by order (s.91(b)(3)(b)).

### TXI-13 Discount added to the redemption proceeds when redemption creates a capital loss
- Rule: On redemption of a bond, state loan or short-term loan on which discount fees are also paid, the discount fees are added to the redemption consideration, up to the amount of the capital loss, when all three conditions hold: (1) the capital gain on selling the bond is not exempt; (2) a capital loss arises at redemption; (3) the redeemer is not a controlling holder and has not held the bond since it was issued. Discount fees treated as consideration in this way are not interest income under s.2(4).
- Conditions / exceptions: This matters for someone who bought a makam or discount bond on the exchange, not at issue. The regulations are dated 22.12.2002 and amended to 1.1.2004 in the btl copy.
- Figures: none.
- Source: [Income Tax (Computation of Capital Gain on Sale of a Traded Security, State Loan or Mutual-Fund Unit) Regulations 2002, reg. 4](https://www.btl.gov.il/Laws1/02_0103_100223.pdf) · checked 2026-10-22 · primary (government copy; later amendments not checked)
- Dimensions: tax-at-exit, loss-offset
- Likely to change: no

### TXI-14 CPI-linked government bond (Galil type): real interest and real gain, up to 25%
- Rule: In the "linked government bond" series, principal and interest are linked to the CPI, upward or downward; the text has no floor at face value. Coupons are interest on a fully linked asset: the linkage is exempt (TXI-05) and the real interest is taxed at up to 25% (TXI-02), withheld at 25% (TXI-09). A sale gives a real capital gain taxed at up to 25%, as the top slice. The inflationary amount is handled under the general capital-gains rules (`tax-securities-israeli.md`, `tax-general.md`).
- Conditions / exceptions: Which traded series are of this type is a product fact for `government-bonds-and-makam.md`. Deflation and negative real yield are open question 6.
- Figures: 25% (2026).
- Source: [State Loan Regulations (Bonds of the "Linked Government Bond" Type) 2006, ss.1, 5, 8](https://www.nevo.co.il/law_html/law01/999_564.htm), quoted (s.8): "כשהן מוגדלות או מוקטנות" · checked 2026-10-22 · primary (Nevo mirror). [Income Tax Ordinance, s.91(b)(1)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "יחיד יהיה חייב במס על רווח הון ריאלי כאמור בסעיף 121" "בשיעור שלא יעלה על 25%" · checked 2026-10-22 · primary. Guide 2025 printed p.39, "ריבית על אגרות חוב" item 2 (linked traded bonds issued after 8.5.2000: real interest at 25%) · primary
- Dimensions: real-vs-nominal, tax-during, tax-at-exit
- Likely to change: no

### TXI-15 Unlinked government bonds (Shahar type, fixed; Gilon type, variable): the rate follows linkage, not the product name
- Rule: Coupons on a bond that is not CPI-linked are taxed at 15% of the nominal coupon (TXI-03), withheld at 15% (TXI-09). A sale or redemption gain is taxed at up to 15%, with the whole gain treated as real (TXI-12). The guide states it for unlinked traded bonds issued after 8.5.2000: interest accrued from 1.1.2003 is taxed at 15% (field 13). A variable coupon does not change this: the test in s.125C(c) and s.91(b)(3) is whether the principal is linked to the index.
- Conditions / exceptions: Whether every Gilon series is unlinked was not confirmed from its issue regulations (open question 8). A partly linked series would also fall at 15%.
- Figures: 15% (2026).
- Source: [Income Tax Ordinance, ss.125C(c), 91(b)(3)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.39, "ריבית על אגרות חוב" item 4 · primary
- Dimensions: real-vs-nominal, tax-during, tax-at-exit
- Likely to change: yes, by order, as in TXI-03

### TXI-16 Accrued interest bought with a bond (s.3(h))
- Rule: Accrued interest ("ריבית צבורה") is defined as amounts a person receives as interest on a bond (including linkage differentials, except for "preferred loans") for a period when the bond was owned by someone else. Where it is not business income of the recipient, it is treated as income with no right to an exemption, credit, deduction or offset, except an exemption granted for the interest itself. Where it is business income, linked and unlinked bonds have holding-period tests. When those are met, the part of the purchase price equal to the accrued interest, net of tax, is left out of the gain or loss on sale or redemption.
- Conditions / exceptions: The Minister may exclude kinds of investments or taxpayers from the rule (s.3(h1)). Whether any such order exists for traded government bonds, and how banks apply this to a private buyer between coupon dates, is open question 5. Do not compute the effect until it is closed.
- Figures: holding tests (business case): linked, accrual over one year and bought within 18 months of redemption or payment; unlinked, accrual over three months and bought within three years.
- Source: [Income Tax Ordinance, s.3(h)-(h1)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "בשל תקופה שהאיגרת היתה בבעלותו של אחר", "יראו את הריבית הצבורה כהכנסה שאין לגביה זכות לפטור" · checked 2026-10-22 · primary (two mirrors, Wikisource and [Nevo](https://www.nevo.co.il/law_html/law01/255_001b.htm), read through a summarising tool; the Nevo copy is garbled in paragraph (2))
- Dimensions: tax-during, tax-at-exit
- Likely to change: no

### TXI-17 Securities losses can offset interest on securities in the same year
- Rule: A capital loss from selling securities in a tax year can also be offset against: (a) interest or dividends paid on the same security; and (b) interest or dividends on other securities, provided the rate on that interest does not exceed the rate in s.125C(b) (25%) for an individual. Government bonds and makam are securities (TXI-12), so their coupons and discount qualify.
- Conditions / exceptions:
  - Only in the same tax year. A loss carried forward offsets only capital gains (general loss rules in `tax-securities-israeli.md`).
  - Bank-deposit and savings-plan interest is not interest on a security, and the statutory text does not cover it. The guide places deposit interest outside the securities-interest fields where this offset is described (open question 7).
  - Offsetting across institutions needs an annual return (form 1322, appendix C).
  - In practice a bank offsets within the account in the same tax year and resets unused losses at year end. This is per two banks' own pages (Discount, Mercantile).
- Figures: none.
- Source: [Income Tax Ordinance, s.92(a)(4)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "ובלבד ששיעור המס החל על הריבית או הדיבידנד שקיבל אותו אדם לא עולה על השיעור הקבוע" · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.39 (bold paragraph: offset against interest on the same and other securities if the rate does not exceed 25%; the payer may already have offset at withholding; report on form 1322) · primary. Bank practice: [Discount Bank, securities taxation](https://www.discountbank.co.il/private/savings-investments/securities-taxation/updates/), [Mercantile, securities taxation](https://www.mercantile.co.il/private/investments-savings/taxation/securities-taxation/) · checked 2026-10-22 · institution (for their own practice), secondary for the law
- Dimensions: loss-offset
- Likely to change: no

### TXI-18 Income of children under 18 and joint holders
- Rule: Interest of the individual's children under 18 is included in the parent's interest fields (21-23) and in the income tested against the s.125D ceiling. Joint-account interest is split equally for withholding (TXI-08).
- Conditions / exceptions: none found.
- Figures: none.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed pp.40-41 · checked 2026-10-22 · primary (page image)
- Dimensions: eligibility, reporting-obligation
- Likely to change: no

### TXI-19 Maximum rate vs fixed rate: people aged 60 or over can pay less than 25% on linked interest (tax open question Q16)
- Rule: The guide explains that a special rate is either a maximum rate or a fixed rate. A maximum rate means that if the taxpayer is entitled to lower brackets, the lower rate applies, and the stated rate is only a ceiling. The guide gives as examples fields 12, 14, 15, 22 and 23; field 23 is linked deposit interest (up to 25%) and field 15 is securities interest up to 25%. Under s.121(b)(1), the reduced brackets (10%, 14%, 20%, then 31%) apply to the taxable income of an individual aged 60 or over, not only to personal-effort income. A person under 60 has no bracket below 31% for interest, so the 25% ceiling binds. Result: a person aged 60 or over with low total income can pay less than 25% on real interest from linked deposits and bonds. This closes Q16 for the 25% bucket.
- Conditions / exceptions: The 15% on unlinked interest (TXI-03) is worded in the statute as a rate "of 15%" and fields 13 and 21 are not among the guide's examples. Read together, it looks like a fixed rate with no bracket relief. But the guide's list says "for example" and no sentence says so outright (open question 9). Interest is the top slice (TXI-02), so the lower brackets are reached only after other income. How the site computes this needs `tax-general.md` brackets and a `docs/method.md` definition.
- Figures: 2026 reduced brackets per s.121(b)(1): 10% to 84,120; 14% to 120,720; 20% to 228,000; 31% to 301,200 NIS/year (figures in `tax-general.md`).
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.38, opening paragraph ("שיעור מס מיוחד יכול להיות שיעור מס מרבי או שיעור מס קבוע", then fields 12, 14, 15, 22, 23 as maximum-rate examples) · checked 2026-10-22 · primary (page image; re-read wording). [Income Tax Ordinance, s.121(b)(1)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "לגבי הכנסה חייבת בשנת המס מיגיעה אישית ולגבי הכנסה חייבת בשנת המס של יחיד שמלאו לו 60 שנים" · checked 2026-10-22 · primary
- Dimensions: age-or-use-exemption, tax-during
- Likely to change: yes. The brackets were widened from 2026 and indexation is frozen to 2027 (`tax-general.md`).

### TXI-20 Low-income deduction from deposit and savings-plan interest (s.125D(b)), any age
- Rule: If the income of the individual and spouse in the tax year does not exceed the "favoured ceiling" ("התקרה המוטבת"), the individual may deduct a fixed amount from interest income, but not more than the interest. Above the ceiling, the deduction is reduced by the amount by which their income exceeds the ceiling.
- Conditions / exceptions:
  - "Interest" here means only interest on a deposit at a banking corporation or on a savings plan, not bonds or makam. Whether current-account credit interest counts is open question 11.
  - Per the guide, income for the ceiling test includes exempt income and the interest itself and the children's interest. It excludes child allowance and old-age allowance.
  - The guide says the computer applies it automatically in the annual return. During the year it is given by tax coordination with the assessing officer, after which the bank refunds the excess (TXI-23).
- Figures: ceiling 69,840 NIS/year; deduction 10,920 NIS/year; both for 2024-2027 (statutory footnote) and repeated for 2026 in the booklet. Indexed to the CPI under s.120B, but frozen for 2025-2027; indexation resumes 1.1.2028.
- Source: [Income Tax Ordinance, s.125D(a)-(b)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted definition of interest: "ריבית המשתלמת על פיקדון בתאגיד בנקאי או על תכנית חיסכון" · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.41 item 1 (worked example) · primary. [Tax Authority deductions booklet, January 2026 onward, updated April 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf) p.14 ("ניכוי מריבית - תקרה מוטבת 125ד(א)" 69,840; "פטור למעוט הכנסה 125ד(ב)" 10,920) · checked 2026-10-22 · primary
- Dimensions: age-or-use-exemption, eligibility
- Likely to change: yes. Amounts move when the freeze ends after 2027.

### TXI-21 Retirement-age deduction from deposit interest (s.125D(c)), only for people born by 1.1.1948
- Rule: An individual whose spouse, or who themselves, reached mandatory retirement age in the tax year, where one of them was 55 or older on the reference date of 1.1.2003, may deduct a fixed amount from interest income, capped at the interest. If both spouses meet the conditions, a higher amount applies instead.
- Conditions / exceptions:
  - The age-55-on-1.1.2003 test limits this to people born on or before 1.1.1948, so it does not help a typical saver now in their 60s.
  - "Interest" is deposit and savings-plan interest (s.125D(a)).
  - The guide says withholding on interest after retirement age is refunded automatically during the year, unless the person asked that bank data not be passed to the assessing officer.
  - Retirement age: the guide text says 67, while the booklet's line heading says 65 (open question 12).
- Figures: 15,000 NIS (one spouse) / 18,360 NIS (both), 2024-2027 and 2026. Frozen to 2027.
- Source: [Income Tax Ordinance, s.125D(c)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "ובמועד הקובע מלאו לאחד מהם 55 שנים, זכאי לניכוי בסך של 13,000 שקלים חדשים" with footnote "(... בשנים 2024–2027, 15,000 ש״ח)" · checked 2026-10-22 · primary. [Booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf) p.14 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.41 item 2 · primary
- Dimensions: age-or-use-exemption, eligibility
- Likely to change: no (it phases out with the cohort)

### TXI-22 Extra 35% exemption on "qualifying interest" (s.125E), same 1948 cohort
- Rule: 35% of "qualifying interest" ("ריבית מזכה") is exempt for an individual who has reached retirement age, or whose spouse has, provided they were 55 or older on the reference date. Qualifying interest is the lower of: (1) the couple's interest income as defined in s.125D (deposits and savings plans); and (2) the gap between 12 times the monthly "qualifying annuity" amount in s.9A and the higher of the two spouses' taxable income. For that test, taxable income includes income exempt under ss.9A and 9B and excludes interest, exempt residential rent, capital gains and betterment.
- Conditions / exceptions: The 1948 cohort limit is the same as in TXI-21. The guide's text omits the 55-on-1.1.2003 condition, but the statute has it: "והכל, אם מלאו להם במועד הקובע 55 שנים". The guide says that during the year it is refunded only through tax coordination; otherwise it is computed in the return.
- Figures: the guide uses an annual qualifying-annuity amount of 113,160 NIS (2025). Maximum exemption: 39,605 NIS (statutory footnote, 2024-2027) vs 39,606 NIS (2026 booklet) (open question 13).
- Source: [Income Tax Ordinance, s.125E](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), quoted: "35% מריבית מזכה פטורים ממס בידי אלה:" ... "והכל, אם מלאו להם במועד הקובע 55 שנים." · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.41 item 3 · primary. [Booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf) p.14 · primary
- Dimensions: age-or-use-exemption, eligibility
- Likely to change: no (cohort-limited)

### TXI-23 Getting back over-withheld tax on interest
- Rule: There are three routes. (1) Before or during the year, the assessing officer may allow a lower withholding rate in writing if the standard rate would cause excess withholding (reg. 11). (2) Where the Tax Authority director finds excess withholding by a bank or TASE member on deposit or savings-plan interest because of ss.9(5)(b), 34-37, 40(b), 40A, 45, 66(g)(2), 125D or 125E, he may refund the tax to the entitled person, wholly or in part (reg. 12). The guide calls this the "automatic refund route" ("מסלול ההחזר האוטומטי"). A person can opt out of the data transfer on form 2405, and then gets no automatic refund. (3) In the annual return, interest is entered in full, before reliefs, and the system computes the 125D and 125E reliefs and credits the withholding shown on form 867.
- Conditions / exceptions: The automatic refund is not an assessment; the final figure can differ in the annual computation (reg. 12(c); guide p.41). Under reg. 12, the reliefs that trigger a refund are deposit and plan reliefs; nothing equivalent was found for bonds or makam.
- Figures: none.
- Source: [Withholding Regulations 2005, regs. 11-12](https://www.btl.gov.il/Laws1/02_0103_100269.pdf) · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed pp.40-41 · primary
- Dimensions: age-or-use-exemption, reporting-obligation
- Likely to change: no

### TXI-24 Interest exemption for 100% disabled or blind people on injury-compensation money (s.9(5))
- Rule: Interest on deposits, savings plans or provident funds funded from personal-injury compensation is exempt for a 100% disabled or blind person, up to a ceiling. The guide adds an income condition.
- Conditions / exceptions: This is a narrow case. The guide's wording of the income condition was read from a page image and should be re-read before encoding.
- Figures: 337,200 NIS, 2024-2027 (statutory footnote and guide).
- Source: [Income Tax Ordinance, s.9(5)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (summarised by the fetch tool). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf) printed p.41 item 4 · primary
- Dimensions: age-or-use-exemption, eligibility
- Likely to change: yes, after the freeze

### TXI-25 Negative linkage does not reduce the tax on interest, and the linkage loss cannot be offset
- Rule: Interest and linkage differentials are separate sources of income. When a linked deposit's linkage turns negative and the saver loses money overall, the interest is still taxed in full. The loss from the negative linkage cannot be offset against that interest: a positive linkage differential would have been exempt (s.9(13)), and a loss that would have been exempt as a gain cannot be offset (ss.28, 92). The Supreme Court dismissed the appeal and upheld the district court on these points.
- Conditions / exceptions: The case was a foreign-currency-linked bank deposit; the exchange rate is the index for such a deposit (TXI-04). Applying it to a CPI-linked deposit, and to the coupons of a CPI-linked government bond (TXI-14), is an inference from the same reasoning (s.9(13) exempts both). How a traded linked bond's price fall at sale is treated under the capital-gains rules is a separate question: whether the inflationary amount stops at zero is TXS OQ15 / TXG OQ13. The district court also remarked, as a "perhaps", that linkage added on top of the interest might not be taxable when the index rises; that was not decided.
- Figures: none.
- Source: [Supreme Court, עע"מ 7486/14 בראל נ' רשות המיסים, judgment of 27.7.2016](https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/14/860/074/l09&fileName=14074860_l09.txt&type=2), paras 1, 4, 11-14 (appeal from ת"מ 137/07, Tel Aviv district court, 4.9.2014) · checked 2026-10-22 · primary (court ruling; read in the founder's Chrome, browser pass 3)
- Dimensions: real-vs-nominal, tax-during, loss-offset
- Likely to change: no

## Worked statement: what a saver nets per 100 NIS of gross yield

What this covers: income tax only, for an individual under 60, not in the TXI-06 exclusions, with no s.125D deduction, on money invested from 2012 on. It is not a full net figure: National Insurance and health on interest are open (`tax-general.md`, tax Q10), and the surtax applies above its threshold (`tax-general.md`). "Real part" R means the gross yield minus the CPI linkage, in NIS per 100.

| Instrument | Tax base | Rate | Net income-tax result per 100 NIS gross | Rules | Status |
|---|---|---|---|---|---|
| Unlinked shekel deposit, savings plan, current-account interest | whole nominal interest | 15% fixed | 85 | TXI-03, TXI-08 | sourced |
| Partly CPI-linked deposit | whole interest incl. partial linkage | 15% | 85 | TXI-03, TXI-04, TXI-05 | sourced |
| Prime-linked deposit | whole interest | 15% | 85 | TXI-04 | my reading of the definition, not a published statement (open question 2); compute as "secondary" at best |
| Fully CPI-linked deposit or plan | real interest R; linkage exempt | up to 25% | 100 − 0.25 × R | TXI-02, TXI-05 | sourced; with deflation (negative linkage) the interest is still taxed in full and the linkage loss is not offset (TXI-25, by analogy from an FX deposit) |
| Makam held from issue to redemption | discount | 15% | 85 | TXI-01, TXI-11 | sourced, but note the conflicting "20%" line (open question 3) |
| Makam or unlinked bond sold before maturity | gain on sale, all treated as real | up to 15% | 85 (if the gain is positive) | TXI-12 | sourced for the rate; the interest-vs-gain split and accrued interest are open (open questions 3, 5) but do not change the 85 when both parts are at 15% and there is no loss |
| Shahar-type coupon | nominal coupon | 15% | 85 | TXI-15 | sourced; a buyer between coupon dates is blocked by open question 5 |
| Gilon-type coupon | nominal coupon | 15% if unlinked | 85 | TXI-15 | blocked until series linkage is confirmed (open question 8) |
| Galil-type coupon or gain | real interest or real gain R | up to 25% | 100 − 0.25 × R | TXI-14 | sourced; under deflation coupons are taxed in full and the linkage loss is not offset (TXI-25, by analogy); a price loss at sale is TXS OQ15 |
| Any of the 25% rows, person aged 60+ with low income | as above | lower bracket if entitled | at least the figure above | TXI-19 | rule sourced; the computation needs the method in `docs/method.md` |

Note for the idle-cash preset (3.2): deposits and makam are taxed at 15% of nominal interest. The comparable money-market-fund rule is in `tax-securities-israeli.md` (tax Q15). The site must not show a comparison until that rule is sourced.

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| ריבית | interest | Includes discount fees for s.125C; in the withholding regulations it also includes non-exempt and partial linkage differentials | law, statement, form 867 | s.125C(a); Withholding Regs reg. 1 |
| דמי ניכיון | discount fees | The difference between issue price and redemption value of a discount instrument such as a makam; counts as interest | law, statement | s.125C(a); s.2(4) |
| הפרשי הצמדה | linkage differentials | Amount added to a debt because of linkage to the CPI, an exchange rate or another index, including exchange differences | law, statement | s.1; s.9(13) |
| הפרשי הצמדה חלקיים | partial linkage differentials | Linkage that does not fully follow the index; not exempt; definition set by the Minister (not found) | law | s.9(13)(1) |
| צמוד למדד / אינו צמוד למדד / צמוד בחלקו | linked / not linked / partly linked | Partly linked counts as not linked for the 15% rate | law, bank product pages, guide | s.125C(c); guide p.40 |
| מדד | index | The CPI; for an FX-linked or FX-denominated asset, the exchange rate | law | s.125C(a) |
| פיקדון בתאגיד בנקאי / תכנית חיסכון | bank deposit / savings plan | Scope of the s.125D relief | law, bank app | s.125D(a) |
| מילווה מדינה / מילווה קצר מועד (מק"מ) | state loan / short-term loan (makam) | A state loan includes a loan under the Short-Term Loan Law 1984 | law, broker app | Withholding Regs reg. 1; guide p.39 |
| אג"ח ממשלתית צמודה | linked government bond | Series type with principal and interest linked to the CPI, up or down | law (issue regulations) | State Loan Regs 2006 |
| ניכוי מס במקור | withholding at source | Tax deducted by the bank or payer | statement, form 867 | Withholding Regs |
| טופס 867 (0867) | form 867 | Annual certificate of interest and tax withheld, available by 20 March | bank site, return | reg. 16; guide p.40 |
| תיאום מס | tax coordination | Request to the assessing officer to reduce withholding or get a refund during the year | guide | reg. 11; guide p.41 |
| מסלול ההחזר האוטומטי | automatic refund route | Refund of excess withholding on deposit interest without a request | guide | reg. 12; guide p.41 |
| התקרה המוטבת | favoured ceiling | Income ceiling for the s.125D deduction | law, booklet | s.125D(a) |
| ריבית מזכה | qualifying interest | Base for the 35% exemption in s.125E | law, guide | s.125E(a) |
| גיל פרישת חובה | mandatory retirement age | Age test in s.125D(c), per the Retirement Age Law 2004 | law | s.125D(c) |
| המועד הקובע | the reference date | 1.1.2003 for s.125D and s.125E | law | s.125D(a) |
| ריבית צבורה | accrued interest | Interest for a period when another person owned the bond | law | s.3(h) |
| רווח הון ריאלי | real capital gain | Gain minus the inflationary amount; for unlinked debt the whole gain counts as real | law, statement | s.88; s.91(b)(3) |
| שיעור מס מרבי / שיעור מס קבוע | maximum rate / fixed rate | A maximum rate yields to lower brackets; a fixed rate does not | guide | guide p.38 |
| היום הקובע (8.5.2000) | the fixed day | Cut-off date for the legacy bond rates | regulations, guide | Withholding Regs reg. 1 |
| תחנת יציאה | exit station | Date on which savings-plan money can be withdrawn without worse terms | regulations, bank app | Withholding Regs reg. 20(c) |

## Institutions

Not applicable for a tax file. Banks and TASE members withhold (TXI-08, TXI-09, TXI-12). Who offers each product is in `bank-current-account-deposits.md` and `government-bonds-and-makam.md`.

## Open questions

1. **Partial linkage differentials.** s.9(13)(1) leaves "הפרשי הצמדה חלקיים" to a ministerial definition, which I did not find. It matters for any product sold as "partly linked". Tried: the Ordinance text. The answer is probably in a regulation or order under s.9(13), findable on Nevo or Wikisource by title.
2. **Prime-linked and other floating-rate deposits.** No source names them. TXI-04 applies the statutory definition of the index (CPI or exchange rate), under which prime is not an index. Needs a Tax Authority or bank-tariff confirmation. Likely place: a bank's own tax page for its prime deposit, or a Tax Authority FAQ.
3. **Makam discount: the 2025 guide's "20% at realization" line, and the split on sale.** Guide printed p.39, item 3 under "ריבית על אגרות חוב", reads that discount fees on makam are taxed at 20% at realization. This conflicts with s.125C(c) (15%). Also open: how a sale before maturity divides the price between accrued discount (interest) and capital gain. s.101A(a)(5) lets the Minister set the method, and those rules were not found. Search budget ran out before I could look for the rules under s.101A(a)(5) or a Tax Authority capital-market circular. **[2026-10-22 browser pass: Update: BoI's consumer page (GOV-22) states 15% on makam gains; still needs a Tax Authority statement.]**
4. **FX deposits (Q2), withholding side.** The guide (TXI-04) settles the bucket: FX-linked or FX-denominated deposits are "linked", taxed at up to 25% above the exchange-rate change. But the withholding regulations define the "index" by s.88, which my fetch summarised as the CPI, with the exchange rate only for a non-resident. Whether banks withhold 15% or 25% on resident FX-deposit interest therefore needs checking. Hand to `tax-tier2-other.md`.
5. **Accrued interest (s.3(h)) for a private buyer of traded government bonds.** Two points are open: whether an order under s.3(h1) excludes traded bonds, and how the bank's withholding treats the coupon and the price paid for accrued interest. Tried: Wikisource and Nevo text (both read through a summarising tool; Nevo garbled). Likely place: orders under s.3(h1), the Tax Authority's capital-market withholding guidance, or a bank's tax page.
6. **Deflation and negative real yield.** If the CPI falls, the Galil regulations reduce principal and interest. It is not known whether negative linkage reduces taxable real interest, creates a capital loss, or is lost. The same question applies to a CPI-linked deposit. Likely place: s.9(13) case law or a Tax Authority circular. **[2026-10-22 browser pass 3: interest side answered by TXI-25 (Supreme Court עע"מ 7486/14): interest taxed in full, negative linkage not offset. The capital-gains side at sale stays open with TXS OQ15.]**
7. **Securities losses against bank-deposit interest.** s.92(a)(4) covers interest on securities only. I found no rule allowing offset against deposit interest, and no rule forbidding it in words. Likely place: a Tax Authority FAQ on loss offset.
8. **Gilon and series linkage.** I did not open the issue regulations for variable-rate ("gilon") or unlinked fixed ("shahar") government bonds, because the search budget ran out. TXI-15 is conditional on each series being unlinked. Hand to `government-bonds-and-makam.md`.
9. **Is 15% on unlinked interest a fixed rate for people aged 60 or over?** The statute wording points to a fixed rate. The guide's maximum-rate list says "for example" and omits fields 13 and 21. I want a sentence from the Tax Authority, or a form 1301 calculation note.
10. **Q3, history of the 15% power.** No order under s.125C(c)(2) or s.91(b)(3)(b) was found. The rate in force is 15% according to the consolidated text, the 2025 guide and the regulations. Whether an order was ever issued and later lapsed is not known, but it does not affect current computations. A Reshumot search for "צו מס הכנסה (שינוי שיעור המס" would settle it.
11. **Current-account credit interest and s.125D.** Withholding covers it (reg. 4: any interest a bank pays). It is not known whether it is "a deposit at a banking corporation" for the s.125D deduction.
12. **Retirement age in s.125D(c).** The guide says 67 and the 2026 booklet's line heading says 65; the law refers to the Retirement Age Law. This is moot for anyone born after 1.1.1948.
13. **s.125E maximum: 39,605 or 39,606 NIS.** The statutory footnote and the 2026 booklet differ by 1 NIS.
14. **Early break of a deposit or savings plan.** No explicit rule was found. Taxing the interest actually paid follows from reg. 4, but no source says so in words. It is also not known how interest credited to the account during a multi-year plan, as opposed to paid out, is treated. The guide says tax is due at withdrawal. Likely place: bank tariffs and product terms, `bank-current-account-deposits.md`.
15. **National Insurance and health on interest** (tax Q10). Owned by `tax-general.md`. Until it is closed, the net figures above are income tax only.
16. **2026 edition of the annual guide.** I used the 2025 guide (tax year 2025). The 2026 edition was not checked because the search budget ran out.
17. **Exact wording.** The guide, booklet and btl regulation PDFs had no extractable text and were read as page images. Ordinance quotes came through a tool that limits and may paraphrase quotes. Re-read every quoted phrase against the source before encoding into `il-finance`.
18. **Later amendments to the 2005 withholding regulations** (after 27.12.2017) and to the 2002 capital-gain computation regulations (after 1.1.2004) were not checked against an official consolidated version.

## Left out and why

- FX deposits, structured deposits, corporate bonds, P2P: other files, as listed in Scope.
- Money-market and other mutual funds: `tax-securities-israeli.md`.
- Legacy rates in detail (pre-2006 and pre-2003 periods, bonds issued before 8.5.2000): summarised in TXI-10 only. They matter only for holdings that are 14 or more years old.
- Interest paid from provident and study funds (s.125C(d)(5), (e)): wrapper tax files.
- Companies, non-residents (s.9(15D), s.97(b2)), substantial shareholders: not the site's audience.
- Advance payment of tax on interest not withheld (guide p.117: special income due by 30 April of the following year): filing mechanics belong to `tax-general.md`.

## Sources

| Title | Publisher | Strength | Checked |
|---|---|---|---|
| [Income Tax Ordinance (consolidated), Hebrew Wikisource, raw text](https://he.wikisource.org/wiki/פקודת_מס_הכנסה): ss.1, 3(h)-(h1), 9(5), 9(13), 88, 91(b), 92(a)(4), 101A, 121(b), 125C, 125D, 125E | Knesset legislation via Wikisource mirror | primary | 2026-10-22 |
| [Income Tax Ordinance, Nevo](https://www.nevo.co.il/law_html/law01/255_001b.htm): s.3(h) cross-check only | Nevo (mirror) | primary (mirror) | 2026-10-22 |
| [דע זכויותיך וחובותיך 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed pp.3-4, 37-41, 116-117 (PDF pages 5-6, 39-43, 118-119) | Israel Tax Authority | primary | 2026-10-22 |
| [לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026 ואילך, מעודכן לאפריל 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), pp.1, 14, 19 | Israel Tax Authority | primary | 2026-10-22 |
| [Income Tax (Withholding from Interest, Dividend and Certain Profits) Regulations 2005](https://www.btl.gov.il/Laws1/02_0103_100269.pdf), consolidated to the amendment of 27.12.2017 | Finance Ministry; copy on National Insurance site | primary | 2026-10-22 |
| [Income Tax (Computation of Capital Gain on Sale of a Traded Security, State Loan or Mutual-Fund Unit) Regulations 2002](https://www.btl.gov.il/Laws1/02_0103_100223.pdf), amendments to 1.1.2004 | Finance Ministry; copy on National Insurance site | primary | 2026-10-22 |
| [Income Tax (Withholding from Consideration, Payment or Capital Gain on Sale of a Security, Mutual-Fund Unit or Futures) Regulations 2002](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מתמורה,_מתשלום_או_מרווח_הון_במכירת_נייר_ערך,_במכירת_יחידה_בקרן_נאמנות_או_בעסקה_עתידית)), page edited 19.2.2026 | Wikisource mirror | primary (mirror) | 2026-10-22 |
| [State Loan Regulations (Bonds of the "Linked Government Bond" Type) 2006](https://www.nevo.co.il/law_html/law01/999_564.htm) | Nevo (mirror) | primary (mirror) | 2026-10-22 |
| [Discount Bank, securities taxation](https://www.discountbank.co.il/private/savings-investments/securities-taxation/updates/) (undated) | Israel Discount Bank | institution (own practice) / secondary (law) | 2026-10-22 |
| [Mercantile Bank, securities taxation](https://www.mercantile.co.il/private/investments-savings/taxation/securities-taxation/) (undated) | Mercantile Discount Bank | institution (own practice) / secondary (law) | 2026-10-22 |
| [prisha.co.il article on the 60+ interest rate](https://www.prisha.co.il/Article/%D7%A9%D7%99%D7%A2%D7%95%D7%A8-%D7%9E%D7%A1-%D7%A8%D7%95%D7%95%D7%97-%D7%94%D7%95%D7%9F-%D7%A8%D7%99%D7%91%D7%99%D7%AA-%D7%99%D7%97%D7%99%D7%93-%D7%92%D7%99%D7%9C-60) | opened; paywalled; not used | none | 2026-10-22 |
