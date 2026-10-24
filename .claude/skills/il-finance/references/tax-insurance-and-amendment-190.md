# Tax: savings policies, executive insurance, Amendment 190

Checked: 2026-10-22 · Owner: tax-specialist
Serves: `docs/product.md` 3.1 (the tier-2 "not covered yet" page: what is known, what is open, per instrument; roadmap R1), D2 graduation of savings policies, executive insurance and Amendment 190 deposits to tier 1 (roadmap R5, "Tier-2 graduation"), D10 (strength per rule), 3.8 (rule base).
Scope: in: income tax on insurance savings policies (`פוליסת חיסכון`, the savings component of a life policy) at deposit, during, on switches, at exit and on death, and who withholds; the tax points where executive insurance (an insurance fund, `קופת ביטוח`) differs from a pension fund; Amendment 190 (`תיקון 190`): "exempt payments", the recognized annuity, commutation at 15% of the relative profit component (tax report Q6), the deposit ceilings funds apply, who may withdraw, which products hold the money, death. Out: deposit-side pension benefits, qualifying-annuity exemption, offset formula, ordinary commutation, severance, non-compliant withdrawal (`tax-pension-gemel-lekitzba.md`, TXP-01 to TXP-27); kupat gemel lehashkaa route to a recognized annuity (`tax-gemel-lehashkaa-ira-child.md`, TXK-08 to TXK-12); interest rates, the s.125D/E deductions and pre-2012 interest periods in general (`tax-interest-deposits-bonds.md`); brackets, surtax, NII (`tax-general.md`); product rules of policies and executive insurance (fees, guaranteed annuity factors, tracks, insurer list: `savings-policies-and-executive-insurance.md`, not yet written).

Method note: the Income Tax Ordinance and the Provident Funds Law were read on Hebrew Wikisource (consolidated raw text, a mirror of the law) through a fetch tool that returns quotes of at most about 120 characters and paraphrases the rest. The Ordinance text (919,760 characters) was swept for "פוליסה", "ביטוח חיים", "מבטח", "קופת ביטוח", "תכנית חיסכון", "תכנית ביטוח", "חברת ביטוח" in characters 200,000 to 900,000; characters 0 to 200,000 were read only for ss.1-3, 9 and 9A, and the last 19,760 characters were not read. Tax Authority PDFs (guide 2025, deductions booklet updated April 2026, circular 2/2013) and the 2005 withholding regulations were read directly as page images. Fund documents (Analyst, Altshuler Shaham, Mor) were read directly. 7 web searches were used.

## Summary

- **Savings policy.** In tax law the savings component of a life policy is a "savings plan" (`תכנית חיסכון`). Deposits get no credit or deduction (the 25% life-insurance credit excludes the savings component). Gains the individual receives are **interest income**, and the part equal to linkage on the payments is linkage income (s.3(ה5)). The insurer withholds: 25%, and a profit-sharing policy is withheld at 25% even when not CPI-linked. That this means "25% of the real gain" is stated only by secondary sources; the statute does not say whether a policy is a linked asset (25%, real) or an unlinked one (15%, nominal). Track switches are "not a tax event" in secondary sources only. Moving to another insurer: not found. On death, the death-risk amount is exempt; the savings component is not.
- **Executive insurance** is an insurance plan approved as a provident fund (`קופת ביטוח`). Its annuity type is a provident fund for annuity, so the TXP rules apply. An insurance fund is never an "old fund", so the recognized annuity and commutation are open to it. Unlike other funds, the Ordinance's fund-level income exemption excludes insurance funds; how growth inside executive insurance is taxed was not found.
- **Amendment 190** (in force 1.1.2012). Money deposited without a tax benefit ("exempt payments") produces a "recognized annuity", fully exempt from age 60. If commuted, only the "relative profit component" is taxed, at **15%, nominal** (s.9A(e)(3)): this closes the rate part of tax report Q6. Commutation needs the remaining annuity, counting all annuities, to be at least the minimum annuity (5,306 NIS/month, 2026). Funds add: age 60, three annuity payslips, and age-based ceilings (11,951,492 NIS at 60 or under in 2026) for withdrawal without a Tax Authority approval. The legal source of those ceilings was not found.

## Rules

### Savings policies (`פוליסת חיסכון`)

### TXA-01 The savings component of a life policy is a "savings plan" in tax law
- Rule: s.1 defines "תכנית חיסכון" as a savings plan at a banking corporation, "וכן מרכיב החיסכון בפוליסה לביטוח חיים", "או תכנית חיסכון שצורפה לפוליסה כאמור ושאושרה על ידי הממונה" (the Commissioner under the Insurance Supervision Law). Every Ordinance rule that names a "savings plan" therefore reaches the savings component of a life-insurance policy unless it says otherwise.
- Conditions / exceptions: "מרכיב החיסכון" itself is not defined in s.1 or s.3 (as far as the fetch tool could see). Whether every product sold as "פוליסת חיסכון" is "the savings component of a life policy" is a product question (open question 1).
- Figures: none.
- Source: [Income Tax Ordinance, Wikisource raw text](https://he.wikisource.org/wiki/פקודת_מס_הכנסה?action=raw), s.1 definition "תכנית חיסכון" · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`, `regulator`
- Likely to change: no

### TXA-02 No credit or deduction on deposits to the savings component
- Rule: The 25% credit for life insurance (s.45A(a)(1)) is for premiums an Israeli resident pays "לביטוח חייו או חיי בן זוגו בחברת ביטוח", and s.45A(c) defines life insurance as death-risk cover "בלא מרכיב החיסכון". The 2025 guide: the 25% credit is given "בעד תשלומי פרמיות (ללא התשלום עבור מרכיב החיסכון)". The 35% credit and the s.47 deduction are for payments to a provident fund for annuity (TXP-01), which a savings policy is not. No provision giving a benefit on savings-policy deposits was found.
- Conditions / exceptions: The risk part of a policy, if any, can earn the 25% credit (TXA-10). The "not found" for the savings part rests on the Ordinance sweep in the method note.
- Figures: 25% (fixed in law).
- Source: Ordinance s.45A(a)(1), (c) (link above) · checked 2026-10-22 · primary (mirror). [Tax Authority, "דע זכויותיך וחובותיך 2025"](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.68, "סעיפים 73-76" · checked 2026-10-22 · primary
- Dimensions: `tax-at-deposit`
- Likely to change: no

### TXA-03 Gains received from a policy savings plan are interest income; linkage on the payments is linkage income
- Rule: s.3(ה5): "רווחים שקיבל יחיד מתכנית חיסכון בפוליסת ביטוח חיים, יראו אותם כהכנסה מריבית", but gains equal to "הפרשי הצמדה שחושבו על תשלומים ששולמו לתכנית החיסכון" are "הכנסה מהפרשי הצמדה". So the tax is on gains when the individual receives them, not while they build up (tax report 3.3 secondary claim "on withdrawal" is consistent with this; TXI-07 says the same for savings plans in general).
- Conditions / exceptions: s.3(ה5) names no index and has no pro-rata rule for partial withdrawals (unlike s.3(ה4)(3) for provident funds, TXK-13) and no death rule (open questions 4, 5). Linkage differentials are exempt under s.9(13) when its conditions hold (TXI-05); the 2025 guide's statement that s.9(13) does not apply "על חשבון בקופת גמל" does not touch a policy, which is not a provident fund. Amendment tags on s.3(ה5): תשס"ג, תשס"ה.
- Figures: none.
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.3(ה5), s.9(13) (link above) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-at-exit`, `real-vs-nominal`
- Likely to change: see TXK-21 (proposals for a uniform 25% real tax across products)
- *2026-10-24 R5 pass:* exact wording re-read in the Wikisource raw text (no paraphrase): "רווחים שקיבל יחיד מתכנית חיסכון בפוליסת ביטוח חיים, יראו אותם כהכנסה מריבית, ואולם רווחים שקיבל כאמור בסכום הפרשי הצמדה שחושבו על תשלומים ששולמו לתכנית החיסכון, יראו אותם כהכנסה מהפרשי הצמדה" (amendment tags תשס"ג־2, תשס"ה־9). The next paragraph, s.3(ה6), makes partial linkage differentials interest income and names the exchange rate as an index too (TX2-18). Still a mirror; the Reshumot text was not opened.

### TXA-04 The insurer withholds; a profit-sharing policy is withheld at 25% even if not linked
- Rule: A payer other than a bank that pays interest to an individual withholds 25%; on an asset not linked to the index it withholds 15%, "למעט על תכנית חיסכון בפוליסה משתתפת ברווחים" (reg. 5(a)). "פוליסה משתתפת ברווחים" is "תכנית חיסכון בפוליסת ביטוח חיים שאישר המפקח על הביטוח כפוליסה משתתפת ברווחים, או המצורפת לפוליסה כאמור" (reg. 1). The withholding base "ריבית" excludes linkage differentials exempt by law but includes partial linkage differentials (reg. 1).
- Conditions / exceptions: Insurance companies are on the list of recipients not withheld from (addendum item 9); this matters only for corporate holders. Whether today's savings policies are approved as profit-sharing policies was not confirmed (open question 1). The text read is consolidated to the amendment of 27.12.2017 (TXI open question 18). Annual certificate form 0867 and crediting of withheld tax: TXI-08.
- Figures: 25% / 15%; in force from 1.1.2006.
- Source: [Income Tax (Withholding from Interest, Dividends and Certain Profits) Regulations 2005, consolidated copy on btl.gov.il](https://www.btl.gov.il/Laws1/02_0103_100269.pdf), regs. 1, 5(a), addendum · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`, `tax-at-exit`
- Likely to change: no
- *2026-10-24 R5 pass:* reg. 1 re-read on the Wikisource raw text: "נכס שאינו צמוד למדד" – "לרבות נכס שצמוד בחלקו לשיעור עליית המדד, כולו או חלקו, או שאינו צמוד למדד עד לפדיון או עד להחזר; לענין זה, "מדד" – כהגדרתו בסעיף 88 לפקודה"; "פוליסה משתתפת ברווחים" – "תכנית חיסכון בפוליסת ביטוח חיים שאישר המפקח על הביטוח כפוליסה משתתפת ברווחים, או המצורפת לפוליסה כאמור". Phoenix's FAQ shows the insurer issuing form 867 for the tax it withholds (TXA-28).

### TXA-05 Rate and base on policy gains: "25% of the real gain" is a secondary-source statement
- Rule: Interest of an individual is taxed at up to 25%, and at 15% when paid on an asset "שאינו צמוד למדד או שהוא צמוד בחלקו" (s.125C(b), (c)(1)); s.125C has no exception for policies. The 2025 guide says a deposit or savings plan counts as "not linked" unless fully linked, and "ריבית ורווחים שמקורם בפיקדון או בתוכנית חיסכון 'צמודים למדד', הרווח עליהם מעל עליית המדד ממוסה במס בשיעור שלא יעלה על 25%". No official text says whether a savings policy invested in shares or bonds is a "linked" plan (25% on the gain above CPI linkage on payments) or an "unlinked" one (15% on the nominal gain). An investment house's article says "מס רווחי הון בשיעור של 25% על הרווח הריאלי".
- Conditions / exceptions: Under D10 the 25%-real figure computes only labelled "secondary source", and the 15%-nominal alternative stays open (open question 1). The withholding exception in TXA-04 points to 25% for profit-sharing policies but is a withholding rule, not the final rate. People aged 60 or more: TXI-19. Surtax: `tax-general.md` TXG-09, TXG-10.
- Figures: 25% / 15% (fixed in law; the Minister may change the 15% by order, s.125C(c)(2)).
- Source: Ordinance s.125C(b), (c) (link above) · checked 2026-10-22 · primary (mirror). Guide 2025 printed p.40, "אופן הצמדה" and the two paragraphs after it · checked 2026-10-22 · primary. [Altshuler Shaham, "פוליסת חיסכון: קווים לדמותה" (29.9.2020)](https://www.as-invest.co.il/magazine/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%90%D7%A8%D7%95%D7%9A-%D7%98%D7%95%D7%95%D7%97/%D7%A4%D7%95%D7%9C%D7%99%D7%A1%D7%AA-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A7%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%93%D7%9E%D7%95%D7%AA%D7%94/) · checked 2026-10-22 · secondary (an investment house that does not sell policies)
- Dimensions: `tax-at-exit`, `real-vs-nominal`
- Likely to change: see TXK-21
- *2026-10-24 R5 pass:* s.125C re-read verbatim: "יחיד חייב במס על הכנסה מריבית בשיעור שלא יעלה על 25%" (s.125C(b)); "שולמה הריבית על נכס שאינו צמוד למדד, או שהוא צמוד בחלקו לשיעור עליית המדד, כולו או חלקו, או שאינו צמוד למדד עד לפדיון או עד להחזר, תחויב הכנסתו של היחיד מריבית במס בשיעור של 15%" (s.125C(c)(1)). s.125C(e) excludes money paid from a provident fund other than a tagmulim or study fund, which does not touch a savings policy. Two insurers now state the base in their own words: Clal, "תשלום המס יבוצע רק בעת משיכת הכספים ורק על הרווח הריאלי"; Phoenix's s.125D example (profit cap 13,440, tax 3,360) implies 25% (TXA-28, institution). Reading, not a source: because s.3(ה5) itself carves the linkage on the payments out as linkage income, the plan is treated as linked and the remaining gain falls under s.125C(b), which fits "25% of the real gain". No official text says so; open question 1 stays open, narrowed to "confirm the reading". The Tax Authority circular on Amendment 147 (תשס"ה־9) is the likely home; gov.il needs a browser.

### TXA-06 Older policies: which deposits the regulations cover, and the pre-2012 rates
- Rule: Reg. 20(a)(4): for savings plans in a life policy, on interest and gains from deposits made "ביום כ"ו בכסלו התשס"ג (1 בדצמבר 2002) ואילך", the payer withholds 15% on the "interest part" ("חלק הריבית") and 20% on the "additional interest part" ("חלק הריבית הנוסף"), instead of reg. 5. The parts are a linear split of the interest by period (reg. 20(b), (c)): the part accrued before the regulations' start (1.1.2006) and the part from then until the day before the "change date". The guide gives the same eras for savings plans opened before 1.1.2012: from 1.1.2012, 25% or 15%; 2006-2011, 20% or 15%; before 2006, a further split.
- Conditions / exceptions: Gains on policy deposits made **before 1.12.2002** are not covered by reg. 20(a)(4); their tax was not found (open question 2). "מועד השינוי" is defined by reference to s.88 (reg. 1); its date was not re-read here (the guide's era boundary is 1.1.2012). For new money this rule does not apply.
- Figures: 1.12.2002; 1.1.2006; 15% / 20% (legacy, fixed).
- Source: [Withholding Regulations 2005](<https://www.btl.gov.il/Laws1/02_0103_100269.pdf>), regs. 1, 20 (link above) · checked 2026-10-22 · primary. [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.40, left column ("אם הפיקדון או תוכנית החיסכון נפתחו לפני יום ה-1/1/2012") · checked 2026-10-22 · primary. General pre-2012 interest periods: TXI-10.
- Dimensions: `tax-at-exit`, proposed `cohort-start-date`
- Likely to change: no

### TXA-07 The low-income and retirement-age interest reliefs reach policy gains (reading of the definitions)
- Rule: s.125D defines "ריבית" as "ריבית המשתלמת על פיקדון בתאגיד בנקאי או על תכנית חיסכון", and the guide presents the reliefs in fields 21-23 as given to "מקבל ריבית המשתלמת על פיקדון בתאגיד בנקאי או על תוכנית חיסכון". Since "תכנית חיסכון" includes the policy savings component (TXA-01) and policy gains are interest (TXA-03), the s.125D deduction (TXI-20, TXI-21) and the s.125E exemption (TXI-22) appear to apply to policy gains.
- Conditions / exceptions: This is a reading of two definitions together; no source says it about policies in words. The figures, cohorts and income tests are in TXI-20 to TXI-22. The reliefs are claimed through the annual return (guide p.41).
- Figures: see TXI-20 to TXI-22.
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.1, s.3(ה5), s.125D(a) (link above) · checked 2026-10-22 · primary (mirror). [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.41 · checked 2026-10-22 · primary
- Dimensions: `age-or-use-exemption`, `eligibility`
- Likely to change: yes (amounts frozen 2025-2027, TXG-06)

### TXA-08 Switching tracks inside a policy; moving to another insurer
- Rule: Track switches: an investment house's article says money can be moved or split between a policy's tracks at any time "מבלי שהדבר יחשב לאירוע מס". This agrees with s.3(ה5), which taxes gains the individual "קיבל" (received): a switch pays nothing out. Moving the policy to another insurer: no source found, primary or secondary.
- Conditions / exceptions: Track switch: secondary only (D10: computes, labelled secondary). Insurer switch: open (open question 3). Unlike provident funds (PF-17, TXK-04), no transfer regulation for savings policies was found.
- Figures: none.
- Source: [Altshuler Shaham article](<https://www.as-invest.co.il/magazine/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%90%D7%A8%D7%95%D7%9A-%D7%98%D7%95%D7%95%D7%97/%D7%A4%D7%95%D7%9C%D7%99%D7%A1%D7%AA-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A7%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%93%D7%9E%D7%95%D7%AA%D7%94/>) (link in TXA-05) · checked 2026-10-22 · secondary. [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.3(ה5) · primary (mirror)
- Dimensions: `switching-tax-event`, `transfer-switch-process`
- Likely to change: see TXK-21 (proposal for tax-free transfers up to a cap)

### TXA-09 Death: the death-risk amount is exempt; the savings component is not
- Rule: s.9(19) exempts "סכום המתקבל על פי פוליסה לביטוח חיים", defined as "סכום המתקבל במותו של המבוטח על חלק הסיכון למקרה מוות בלבד", "למעט סכום שהתקבל ממרכיב החיסכון או הנובע ממנו".
- Conditions / exceptions: Also excluded: an amount received for insuring another person's life, with an exception for a relative under conditions (guide p.88: "של קרוב ובהתאם לתנאים שנקבעו"), and an amount not exempt under s.9(7a) or s.9(17) or taxable under s.3(ד) or s.87 (relevant to executive insurance, TXA-16). How the savings component paid to beneficiaries is taxed (s.3(ה5) in the beneficiary's hands?) was not stated (open question 5).
- Figures: none.
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.9(19) (link above) · checked 2026-10-22 · primary (mirror). [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.88, row 9(19) · checked 2026-10-22 · primary
- Dimensions: `tax-at-exit`, `insurance-cover`, proposed `death-and-beneficiaries`
- Likely to change: no

### TXA-10 Life-insurance (risk) premiums: 25% credit
- Rule: A resident individual gets a 25% credit on premiums he or his spouse pays for life insurance on his or the spouse's life with an insurer, excluding the savings component (TXA-02). A beneficiary member may also claim it for a child aged 18 or over (s.45A(b1)).
- Conditions / exceptions: Ceilings: life insurance shares the 5% sub-limit with survivors' insurance and non-work payments inside the s.45A(d)/(e) ceilings (TXP-02, TXP-04). The guide asks for form 158 for credits claimed in the return. Employer-paid premiums are not named (the text says "הוא או בן זוגו").
- Figures: 25% (fixed); ceilings frozen 2025-2027 (TXP-27).
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.45A(a)(1), (b1), (c) (link above) · checked 2026-10-22 · primary (mirror). [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.68 · checked 2026-10-22 · primary
- Dimensions: `tax-at-deposit`, `insurance-cover`
- Likely to change: no

### TXA-11 s.89(ד) is not the general savings-policy rule
- Rule: s.89(ד) taxes "סכום המתקבל על־פי פוליסה לביטוח חיים" under Part E (capital gains) only, net of the premiums, but only for a policy "שהפרמיות בעדה לא הותרו כהוצאה על פי סעיף 32(10)". s.32(10) disallows a company's (or partnership's) premiums for a controlling shareholder's life insurance, except premiums paid to a provident fund.
- Conditions / exceptions: Listed so the rule base does not apply Part E to an ordinary saver's policy: for an individual's own savings policy the governing text found is s.3(ה5) (TXA-03).
- Figures: none.
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.89(ד), s.32(10) (link above) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-at-exit`
- Likely to change: no

### Executive insurance (`קופת ביטוח`)

### TXA-12 Executive insurance is an insurance fund approved as a provident fund; the pension tax rules apply to it
- Rule: "קופת ביטוח" is "תכנית ביטוח שאושרה לפי הוראות סעיף 13(ב) כקופת גמל לתגמולים, לפיצויים או לקצבה"; a "קופת גמל" is "קרן או תכנית ביטוח שניתן לגביהן אישור קופת גמל"; a "קופת גמל לקצבה" is "קופת גמל המיועדת לתשלום קצבה" (Provident Funds Law s.1, s.13(ב)). The Ordinance's annuity-fund rules are written for "קופת גמל לקצבה", so the deposit credit and deduction, employer ceilings, qualifying-annuity exemption, offset formula, commutation and non-compliant-withdrawal rules (TXP-01 to TXP-23) apply to an annuity insurance fund as to a pension fund. The 2025 guide names annuities paid "על-ידי קופת גמל לקצבה המנוהלת על ידי חברת ביטוח" in its recognized-annuity text.
- Conditions / exceptions: The market name "ביטוח מנהלים" does not appear in the law texts read. The differences found are in TXA-13 to TXA-16. Product rules (guaranteed annuity factors, risk cover, fees) are for `savings-policies-and-executive-insurance.md`.
- Figures: none.
- Source: [Provident Funds Law, Wikisource raw text](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)?action=raw), s.1, s.13(ב) · checked 2026-10-22 · primary (mirror). Guide 2025 printed p.31, "(3) קצבה מוכרת/תשלומים פטורים" · checked 2026-10-22 · primary
- Dimensions: `regulator`, `tax-at-deposit`, `tax-at-exit`
- Likely to change: no

### TXA-13 An insurance fund is never an "old fund": recognized annuity and commutation are available
- Rule: "קרן ותיקה" is "קופת גמל לקצבה שאינה קופת ביטוח" first approved before 1.1.1995 (Provident Funds Law s.1). The recognized annuity applies only in a fund that is not an old fund (s.9A(a), TXP-12) and commutation is not possible in an old fund (circular 2/2013 s.5.2.1). So an executive-insurance policy, of any issue date, is not excluded on that ground.
- Conditions / exceptions: Commutation still follows the fund's commutation method and the minimum-annuity condition (TXA-20).
- Figures: 1.1.1995.
- Source: Provident Funds Law s.1 (link above) · checked 2026-10-22 · primary (mirror). [Income Tax circular 2/2013 (27.5.2013)](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf), s.2.2.1, s.5.2.1 · checked 2026-10-22 · primary
- Dimensions: `tax-at-exit`, `age-or-use-exemption`
- Likely to change: no

### TXA-14 Growth inside executive insurance: the fund-level exemption excludes insurance funds
- Rule: s.9(2)(a) exempts "הכנסתה של קופת גמל אם לא הושגה מעסק שקופת הגמל עוסקת בו", and for that paragraph "קופת גמל" is defined "למעט קופת ביטוח" (s.9(2)(b)). The exemption that makes growth untaxed in a pension fund or provident fund (TXP-13, TXK-03) therefore does not, on its words, cover executive insurance. s.50 (life insurers' profits) was read for a rule on investment income attributable to policyholders and has none.
- Conditions / exceptions: How the investment income behind executive-insurance balances is taxed, and whether any tax reaches the member's return, was not found (open question 6). Do not compute "growth is tax-free" for executive insurance until it is.
- Figures: none.
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.9(2)(a), (b), s.50 (link above) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`
- Likely to change: no

### TXA-15 Cohort rules: pre-2008 capital money and older insurance-fund money
- Rule: Approval as a fund for tagmulim or severance (capital, `הוני`) "לא יינתן אלא לגבי כספים שהופקדו" for tax years before 2008 (Provident Funds Law s.13(ב)); circular 2/2013: since 2008 deposits to tagmulim funds are for an annuity only. In an insurance fund, a self-employed member may withdraw money deposited before 1.1.2000 "לפוליסה שהוצאה לפי קופת ביטוח לפני יום כ״ג בניסן התשנ״ז (30 באפריל 1997)" (s.23). For tax, s.9(18) exempts interest, linkage and other gains, not taxable under s.3(ד) or s.87, "שקיבל יחיד מקופת גמל לתגמולים" from his own or his employer's deposits.
- Conditions / exceptions: An insurance fund approved as a tagmulim fund is a "קופת גמל לתגמולים" by the s.1 definitions, so s.9(18) appears to reach lawful withdrawals of its pre-2008 capital money. That is a reading, not a published statement (open question 8). Employee money deposited before 2000 and other legacy withdrawal routes: PEN-30, PEN-34.
- Figures: 2008; 1.1.2000; 30.4.1997 (fixed).
- Source: [Provident Funds Law](<https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)>) s.13(ב), s.23(א)(1) (link above) · checked 2026-10-22 · primary (mirror). [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.9(18) · primary (mirror). [Circular 2/2013](<https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf>) s.1 · primary
- Dimensions: `tax-at-exit`, `liquidity-lockup`, proposed `cohort-start-date`
- Likely to change: no

### TXA-16 Death and risk cover inside executive insurance
- Rule: s.9(19)'s death-benefit exemption (TXA-09) excludes any amount not exempt under s.9(7a) (death grants) or s.9(17), or taxable under s.3(ד) or s.87. Death grants and survivors' annuities from a provident fund for annuity are taxed under TXP-22 and TXP-23; s.9(6f) covers survivors' annuities paid by a fund "או בהתאם לתכנית ביטוח".
- Conditions / exceptions: How a single executive-insurance death payment is split between the exempt risk part, the death-grant part and the savings part was not found (open question 7). Which credit (25% life, 35% survivors' annuity) applies to the employee's share of risk premiums inside the policy, and how employer payments for disability cover are taxed, were not found (open question 7).
- Figures: see TXP-22, TXP-23.
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.9(6f), s.9(19) (link above) · checked 2026-10-22 · primary (mirror). [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.86 row 9(6ו) · primary
- Dimensions: `tax-at-exit`, `insurance-cover`, proposed `death-and-beneficiaries`
- Likely to change: no

### Amendment 190 (`תיקון 190`)

### TXA-17 What money is "exempt payments" (the money Amendment 190 deposits are made of)
- Rule: s.9A(a) "תשלומים פטורים" are: (1) amounts paid to a provident fund for annuity by employers "העולים על השיעור להפקדה" (employer component), by the employee "העולים על השיעור המרבי להפקדה", and employer severance amounts "אשר ראו אותם כהכנסת עבודה"; (2) money moved to a new account (s.23(א)(2א), (2ב)); (3) "סכומים ששילם יחיד בעד עצמו לקופת גמל לקצבה, בלא תשלום מקביל מטעם מעביד, ושהיחיד אינו זכאי בשלהם לזיכוי לפי סעיף 45א או לניכוי לפי סעיף 47"; (4) self-paid amounts to a kupat gemel lehashkaa (TXK-08). Circular 2/2013 s.2.2.1 adds, for the employee limb, "סכום ששילם העובד, מעבר לשיעור ההפקדה המרבי שהוא מוכפל בשכר הממוצע במשק או בשכרו, כנמוך מבניהם", and lists exempt payments held at death after 75. The guide: the employer part is "החלק הנובע מתשלומים שחויבו במס משנת 2012 ואילך".
- Conditions / exceptions: The individual route (3) needs both: no matching employer payment, and no entitlement to the credit or deduction; deposits within the s.45A/s.47 ceilings are not exempt payments (TXA-23 for how funds draw the line). Amendment 190 took effect 1.1.2012 unless stated otherwise (circular s.1). Mor lists "תקרת שכר לתגמולי עובד שמעליה ההפקדות ייכנסו לקצבה מוכרת" as 13,769 NIS/month for 2026, the average wage (institution).
- Figures: average wage 13,769 NIS/month (2026), average-wage-linked yearly; employer ceilings TXP-10, TXP-11.
- Source: Ordinance s.9A(a) (link above) · checked 2026-10-22 · primary (mirror). Circular 2/2013 ss.1, 2.2.1 · checked 2026-10-22 · primary. Guide 2025 printed p.31 · primary. [Mor, "תקרות וסכומים לשנת 2026" (38.9.1.26)](https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf), p.1 · checked 2026-10-22 · institution
- Dimensions: `tax-at-deposit`, `eligibility`
- Likely to change: see TXK-21 (committee may re-examine Amendment 190)

### TXA-18 Recognized annuity: exempt from 60, no ceiling, on top of the qualifying-annuity exemption
- Rule: The recognized annuity is exempt for an individual aged 60 or more, or one who retired early for a disability of 75% or more (s.9A(b1); TXK-09). Circular 2/2013: "הפטור הניתן לקצבה מוכרת הינו נוסף לפטור הניתן לחלק מ'קצבה מזכה'. יחיד יכול ליהנות משני הפטורים". The guide's example: an annuity of 12,000 NIS from an insurer, 3,000 of it from non-deducted payments, gets 3,000 exempt plus the qualifying-annuity exemption on the rest.
- Conditions / exceptions: Only in a fund that is not an old fund (TXA-13). The tax on a recognized annuity received before 60 (outside disability) was not stated in the sources read (open question 13).
- Figures: age 60 (fixed in law).
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.9A(b1) (link above) · checked 2026-10-22 · primary (mirror). [Circular 2/2013](<https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf>) s.2.2.1 · primary. [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.31 · primary
- Dimensions: `age-or-use-exemption`, `tax-at-exit`, proposed `annuity-vs-lump-sum`
- Likely to change: yes, see TXK-21

### TXA-19 Commuting a recognized annuity: 15% on the relative profit component, nominal (closes the rate in Q6)
- Rule: "על סכום שהתקבל עקב היוון קצבה מוכרת, אשר אינו פטור ממס לפי פסקה (1), יוטל מס רק בשל מרכיב הרווח היחסי, בשיעור של 15%" (s.9A(e)(3)). Relative profit component = commuted amount × (accumulated balance − exempt payments) ÷ accumulated balance. "היתרה הצבורה" is the money credited in the person's account in a provident fund for annuity that is not an old fund, "עד למועד חישוב רווחי הקופה שקדם לגיל הזכאות של היחיד, והנובעים מתשלומים פטורים". Circular 2/2013 s.2.5: limits were placed on tax-free commutation and tax rates set, "שכן, לאחר ההיוון, חלק מהסכום המהוון שמקורו ברווחים שנצברו על סכומי הקצבה המוכרת אינו פטור ממס".
- Conditions / exceptions: Nominal: the formula has no inflation adjustment (TXK-11); funds call it "15% ממרכיב הרווח הנומינלי". Exception: commuting a recognized annuity that comes from new-account money (s.23(א)(2א), (2ב)) is taxed under s.3(ה4)(3) instead (deemed interest, TXK-05/TXK-06) (s.9A(ה1)). How the s.9A(e)(1) exempt commutation interacts with (e)(3) ("which is not exempt under para (1)") was not settled; the promised circular on the recognized annuity was not found (open questions 11, 12).
- Figures: 15% (fixed in law).
- Source: [Ordinance](<https://he.wikisource.org/wiki/פקודת_מס_הכנסה>) s.9A(e)(3), s.9A(ה1) (link above) · checked 2026-10-22 · primary (mirror). [Circular 2/2013](<https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf>) s.2.5 · checked 2026-10-22 · primary
- Dimensions: `tax-at-exit`, `real-vs-nominal`, proposed `annuity-vs-lump-sum`
- Likely to change: see TXK-21

### TXA-20 When a commutation is lawful (the product rule that gates the 15%)
- Rule: Commutation of part of an annuity in a fund that is not an old fund follows the fund's commutation method, "ובלבד שסכום הקצבה שלו יהיה זכאי העמית לאחר ההיוון לא יפחת מסכום הקצבה המזערי"; otherwise up to 25% of the annuity for up to five years (Provident Funds Law s.23(א)(1)). Circular 2/2013 s.5.2.1: for the minimum-annuity test "יובאו בחשבון כל קצבאותיו של היחיד", except survivors', NII old-age and similar annuities (s.9(6)-(6ז)). So a person whose other annuities already reach the minimum can commute all of the new money. A commutation outside s.23 is a non-compliant withdrawal: the higher of 35% and the marginal rate (circular s.5.1; TXP-18).
- Conditions / exceptions: Amendment 190 money is commuted, not withdrawn as a lump sum: s.23 allows lump sums not by commutation only from the severance component, a new account, a small balance at mandatory retirement age, and legacy money (PEN-30). The circular's minimum annuity was 4,356 NIS in 2012.
- Figures: minimum annuity 5,306 NIS/month (2026), 5,183 (2025, Altshuler form), 4,356 (2012), base 3,850 (2008). CPI-linked each 1 January (s.23(ו)); not frozen with the tax amounts (it is in the Provident Funds Law).
- Source: [Provident Funds Law](<https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)>) s.23(א)(1), (ה), (ו) (link above, editor's note gives 5,306 for 2026) · checked 2026-10-22 · primary (mirror). [Circular 2/2013](<https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf>) ss.5.1, 5.2.1 · checked 2026-10-22 · primary. [Deductions booklet 2026](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) p.12, row "מרכיב התגמולים - סכום קצבה מזערי" · primary. [Altshuler form](<https://as-invest.co.il/media/g3cdn5nu/היוון-קצבה-מוכרת-תיקון-190-לפקודת-מס-הכנסה-020225.pdf>) (TXA-22) · institution
- Dimensions: `liquidity-lockup`, `minimum`, `eligibility`
- Likely to change: yes (CPI yearly)

### TXA-21 Small balance at mandatory retirement age is treated as a commutation
- Rule: Circular 2/2013 s.5.2.2: a withdrawal of the minimum accumulation amount is a lawful withdrawal and "לעניין דיני המס יראו את סכום המשיכה כהיוון קצבה" if all hold: total money in all the person's annuity funds is not above the minimum accumulation amount (counting money accumulated from 2000 as an employee, or designated for an annuity for the self-employed, excluding old-fund money); the person reached mandatory retirement age ("67 שנים לגבר ולאישה" in the circular); and the person receives no other annuity from a provident fund (except an old fund or a budgetary pension).
- Conditions / exceptions: So such a withdrawal uses the s.9A(e) commutation rules: the exempt commutation (TXP-17) and, for recognized-annuity money, TXA-19. The circular's age wording differs from the women's retirement-age table (TXP-14); re-check before encoding.
- Figures: minimum accumulation 110,250 NIS (2026; booklet "למועד המשיכה"), 90,514 (March 2012), base 80,000 (2008); CPI-linked each 1 January (s.23(ו)).
- Source: [Circular 2/2013](<https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf>) s.5.2.2 · checked 2026-10-22 · primary. [Provident Funds Law](<https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)>) s.23(ה), (ו) · primary (mirror). [Deductions booklet 2026](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>) p.12 · primary
- Dimensions: `tax-at-exit`, `minimum`, `liquidity-lockup`
- Likely to change: yes (CPI yearly)

### TXA-22 How funds run the 15% withdrawal (fund conditions and withholding)
- Rule: Fund documents state the conditions for withdrawing Amendment 190 money "בדרך של היוון קצבה מוכרת" at 15% of the nominal profit component, all at the withdrawal date: age 60 or more; receiving an annuity above the minimum annuity; showing three payslips in the member's name proving it; the exempt-payment balance at the deposit date was within the ceiling (TXA-24); a declaration about exempt payments in other funds. Altshuler: the fund withholds "וללא צורך בהצגת אישור מרשות המיסים לקביעת שיעור ניכוי המס"; for amounts up to the benefited ceiling (TXA-23) and their gains, an approval from the Tax Authority addressed to the fund is needed. If a condition fails, the withdrawal is non-compliant and taxed accordingly (Analyst).
- Conditions / exceptions: Altshuler limits it to money deposited after 1.1.2012. The statutory basis of the age-60 and three-payslip conditions was not found (open question 10); they may come from Tax Authority instructions to funds.
- Figures: age 60; 3 payslips; minimum annuity as TXA-20.
- Source: [Analyst, "היוון קצבה מוכרת – תיקון 190", annex to joining form, form 1018, updated 25.2.2025, headed February 2026](https://www.analyst.co.il/wp-content/uploads/2026/02/טופס-190-2026.pdf) · checked 2026-10-22 · institution. [Altshuler Shaham, "היוון קצבה מוכרת – תיקון 190", G1005_020225 (2025 figures)](https://as-invest.co.il/media/g3cdn5nu/היוון-קצבה-מוכרת-תיקון-190-לפקודת-מס-הכנסה-020225.pdf) · checked 2026-10-22 · institution
- Dimensions: `eligibility`, `reporting-obligation`, `liquidity-lockup`
- Likely to change: yes (fund practice; Tax Authority instructions)

### TXA-23 The "benefited ceiling": the first slice of each year's deposits is treated as benefited
- Rule: Funds split a year's self-deposits into two layers: up to the "benefited ceiling" (Altshuler: "הסכום המרבי שהיה מקנה זיכוי או ניכוי על פי הוראות סעיפים 45 א ו-47 לפקודה"), treated as benefited money; above it, up to the age ceiling, exempt payments taxed at 15% of the nominal profit on withdrawal. Withdrawing the first layer needs an assessing-officer approval (TXA-22).
- Conditions / exceptions: This is fund practice built on s.9A(a)(3) (TXA-17), which on its words looks at whether the individual "אינו זכאי" to the credit or deduction. Mor's table shows the 38,412 figure as 11% of 232,800 (25,608, s.47 deduction for a beneficiary member) plus 5.5% of 232,800 (12,804, s.45A credit), the self-employed maximum; whether the Tax Authority requires funds to use that figure for every depositor, including salaried people, was not found (open question 9).
- Figures: 38,412 NIS a year for 2025 (Altshuler) and 2026 (Analyst; Mor note 2). Frozen 2025-2027, because it is built on 232,800 = 2 × 116,400 (TXP-27).
- Source: Altshuler and [Analyst forms](<https://www.analyst.co.il/wp-content/uploads/2026/02/טופס-190-2026.pdf>) (TXA-22) · checked 2026-10-22 · institution. [Mor 2026 table](<https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf>) p.1, rows "סכום הפקדה מירבי" and note 2 · checked 2026-10-22 · institution
- Dimensions: `deposit-ceiling`, `tax-at-deposit`
- Likely to change: yes (indexation resumes 2028)

### TXA-24 Deposit ceilings by age (for withdrawal at 15% without an approval)
- Rule: Funds publish a "התקרה להפקדת תשלומים פטורים" by age at the deposit date: per Analyst, four times the average wage times an age factor up to 67, and five times the average wage times the age factor from 67. Mor: "ניתן להפקיד כל סכום לתיקון 190, התקרה היא עבור משיכה ללא צורך באישור פקיד שומה". The balance tested includes ported money and, per Altshuler, recognized-annuity amounts already drawn or commuted; the declaration covers all the person's funds (TXA-22).
- Conditions / exceptions: Check (computed here from the fund figures): 2026 ceiling at 60 or under 11,951,492 = 4 × 13,769 × 217; at 67, 12,392,100 = 5 × 13,769 × 180. 2025 at 60 or under, 11,558,288 = 4 × 13,316 × 217, so funds used 13,316 as the 2025 average wage (bears on TXP open question 4). The age factors are not explained in any source read. No statutory deposit ceiling for an independent member of an annuity fund was found (s.22 caps only kupot gemel lehashkaa). The legal source of the table is open question 9.
- Figures (2026, Mor): to 60 inclusive 11,951,492; 61 11,676,112; 62 11,400,732; 63 11,125,352; 64 10,849,972; 65 10,519,516; 66 10,244,136; 67 12,392,100; 68 11,841,340; 70 11,152,890; 75 9,225,230; 80 7,297,570; 85 5,438,755; 91 3,511,095 NIS (full table ages 60-91 in the source). 2025 (Altshuler): 60 inclusive 11,558,288; 67 11,984,400; table to age 99. Average-wage-linked, recomputed yearly; not frozen.
- Source: [Mor 2026 table](<https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf>) p.3 · checked 2026-10-22 · institution. [Analyst form](<https://www.analyst.co.il/wp-content/uploads/2026/02/טופס-190-2026.pdf>) · institution. [Altshuler form](<https://as-invest.co.il/media/g3cdn5nu/היוון-קצבה-מוכרת-תיקון-190-לפקודת-מס-הכנסה-020225.pdf>) · institution. [Provident Funds Law](<https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)>) s.22 · primary (mirror)
- Dimensions: `deposit-ceiling`, `eligibility`
- Likely to change: yes, every year with the average wage

### TXA-25 Which products hold Amendment 190 money
- Rule: Fund documents show Amendment 190 deposits taken by provident funds ("אנליסט קופות גמל", "אלטשולר שחם גמל", Mor gemel), and the guide describes recognized annuities paid by insurer-managed annuity funds and by non-old annuity funds. Meitav allows Amendment 190 money in an IRA (IRA-08 records Meitav's conditions). A kupat gemel lehashkaa reaches the same exemption by a different route, transfer at 60 (TXK-10).
- Conditions / exceptions: The statute requires a provident fund for annuity that is not an old fund (s.9A(a), "היתרה הצבורה"); the fund-type name each manager uses for the account was not recorded here. Whether a pension fund accepts such deposits is a product question for `pension-and-gemel-lekitzba.md`.
- Figures: none.
- Source: [Analyst and [Altshuler form](<https://as-invest.co.il/media/g3cdn5nu/היוון-קצבה-מוכרת-תיקון-190-לפקודת-מס-הכנסה-020225.pdf>)s](<https://www.analyst.co.il/wp-content/uploads/2026/02/טופס-190-2026.pdf>) (TXA-22) · institution. [Mor 2026 table](<https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf>) · institution. [Guide 2025](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>) printed p.31 · primary. `ira-self-directed.md` IRA-08 · checked 2026-10-22
- Dimensions: `eligibility`, `regulator`
- Likely to change: no

### TXA-26 Death of an Amendment 190 saver
- Rule: s.9A(f)(1): "יחיד שנפטר לאחר שמלאו לו 75 שנים וטרם החל לקבל קצבה מוכרת" is treated as having commuted it just before death, so TXA-19 (15% of the relative profit) applies. s.9A(f)(2): exempt payments at death moved to a beneficiary's annuity account stay exempt if drawn as an annuity. Full statement: TXP-23 and TXK-14.
- Conditions / exceptions: Death before 75 with Amendment 190 money not yet drawn: the tax on a lump sum to beneficiaries was not found (open question 5 here; TXK open question 5).
- Figures: age 75 (fixed in law).
- Source: Ordinance s.9A(f) (link above) · checked 2026-10-22 · primary (mirror). Circular 2/2013 s.2.2.1 (last bullet) · primary
- Dimensions: `tax-at-exit`, proposed `death-and-beneficiaries`
- Likely to change: no
- *2026-10-24 R5 pass (institution, not used to compute):* Harel's Amendment 190 page states that on death before 75 the money and its returns pass to beneficiaries exempt if paid within three months of death, and after three months the returns are taxed at 25% of the real gain; on death after 75 the beneficiaries pay 15% nominal on the returns up to three months after death, or move the money exempt to an annuity account in their name ([Harel, תיקון 190 (קצבה מוכרת)](https://www.harel-group.co.il/long-term-savings/funding/information/190-amendment), checked 2026-10-24). s.9A(f) re-read verbatim confirms the after-75 deemed commutation and the beneficiary route; the three-month rule and the before-75 treatment are not in s.9A and their source is still open question 5.

### TXA-27 Proof of the minimum annuity: the Tax Authority asks for payslips from the annuity payers (circular 2/2013)
- Rule: In the implementation chapter of circular 2/2013, under the heading "סכום קצבה מזערי": "היוון קצבה מותנה בקיומו של 'סכום קצבה מזערי', על פי חוק הפיקוח על קופות גמל. לפיכך, מי שמבקש להוון קצבה, נדרש להציג בפני פקיד השומה תלושי שכר ממשלמי הקצבה (קופות גמל או מעביד, ללא קצבאות שארים) מהם עולה כי מדובר בקצבאות לתוחלת חיים, וכי בכל חודש הקצבה שקיבל היחיד תעלה על הקצבה המזערית". The circular adds that the 90-day window for the commutation request gives the person time to prove the minimum annuity to the assessing officer.
- Conditions / exceptions: This is the Tax Authority's own instruction behind the funds' payslip condition (TXA-22): the payslips must show a lifetime annuity above the minimum annuity (TXA-20) every month, survivors' annuities excluded. The number "three" in the fund forms is the funds' operationalisation; the circular names three payslips only in the exempt-annuity election context (s.5.6, "לאחר שקיבל שלושה תלושי שכר הכוללים את הפטור על הקצבה"). The circular speaks of commutation generally; it says it does not treat the recognized annuity (s.2.2.2) and that a separate circular is expected (open question 12). The age-60 condition is not in this passage; it follows from the exemption age in s.9A(b1) (TXA-18) and remains open question 13 for commutation before 60. Open question 10 is narrowed, not closed.
- Figures: none here (minimum annuity in TXA-20).
- Source: [Income Tax circular 2/2013, "תיקון 190 לפקודה" (27.5.2013)](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf), p.24, paragraph "סכום קצבה מזערי" in the implementation chapter (the paragraph numbers in the text extraction of this PDF are unreliable; verify in the page image) · checked 2026-10-24 · primary
- Dimensions: `eligibility`, `reporting-obligation`, `liquidity-lockup`
- Likely to change: yes, if the promised recognized-annuity circular is published

### TXA-28 What insurers state about tax on savings-policy gains: real gain, 25% implied, notional redemption and form 867 (institution)
- Rule: Clal's product page for "חיסכון פיננסי לעתיד": "תשלום המס יבוצע רק בעת משיכת הכספים ורק על הרווח הריאלי"; "שינוי מסלולי ההשקעה אינו כרוך בתשלום עמלות ובתשלום מס רווחי הון"; holders who reached retirement age and were at least 55 on 1.1.2003 are entitled to a benefit "שמשמעותה פטור ממס בגין הכנסות מריבית", claimed from the assessing officer (the s.125D(c) relief, TXI-21, TXA-07). Phoenix's FAQ for "הפניקס אינווסט": "פדיון כפוף למס רווחי הון בהתאם לחוק ולמצב הלקוח"; a year-end notional redemption, "פדיון רעיוני / מכירה רעיונית - הינו פדיון טכני שמבוצע בסוף שנת מס בפוליסות פרט לצורך הטבת מס רווחי הון", in which the policy is redeemed on paper, tax is deducted and the proceeds reinvested, so that the s.125D relief can be claimed year by year; it is not available on a policy with a lien, pledge or loan; a withholding certificate (form 867) is emailed in March; the s.125D figures quoted are a profit cap of 13,440 (tax 3,360) for an individual and 16,560 (tax 4,140) for a couple, which implies a 25% rate on the gain.
- Conditions / exceptions: Institution statements. They support the 25%-real reading of TXA-05 and the no-tax-event reading of a track switch (TXA-08), but D10 has no policy for institution-strength tax rules (coverage.md F1), so they do not compute without a founder decision. The notional redemption is a practice that lets a policy holder use the yearly s.125D deduction before the money is withdrawn; whether the Tax Authority has published a position on it was not found (open question 17). The 15%-nominal alternative in open question 1 has no support from any insurer read.
- Figures: s.125D profit caps 13,440 (individual) and 16,560 (couple), tax 3,360 and 4,140, as Phoenix publishes them (page read 2026-10-24; the statutory amounts are TXI-20). Age 55 on 1.1.2003.
- Source: [Clal, חיסכון פיננסי לעתיד product page](https://www.clalbit.co.il/savingandmanagementins/financialsaving/) · checked 2026-10-24 · institution; [Phoenix Invest FAQ](https://www.fnx.co.il/savings/savings-routes/faq/) · checked 2026-10-24 · institution
- Dimensions: `tax-at-exit`, `real-vs-nominal`, `switching-tax-event`, `age-or-use-exemption`, `reporting-obligation`
- Likely to change: yes (insurer pages; s.125D amounts yearly)

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| תכנית חיסכון | savings plan | In tax law includes the savings component of a life policy | law, guide | Ordinance s.1 |
| מרכיב החיסכון | savings component | The savings part of a life policy; excluded from the life credit and the death exemption | law, guide | s.1, s.45A(c), s.9(19) |
| פוליסת חיסכון | savings policy | Market name for an insurance savings product | ads, articles | Altshuler article (secondary) |
| פוליסה משתתפת ברווחים | profit-sharing policy | Savings plan in a life policy approved as profit-sharing; withheld at 25% | regulations | Withholding regs 2005 reg. 1 |
| ביטוח חיים | life insurance | Death-risk cover without the savings component | law, guide | s.45A(c) |
| חלק הסיכון למקרה מוות | death-risk part | Exempt part of a policy paid on death | law | s.9(19) |
| קופת ביטוח / תכנית ביטוח | insurance fund / insurance plan | Insurance plan approved as a provident fund (executive insurance) | law, statements | Provident Funds Law s.1 |
| ביטוח מנהלים | executive insurance | Market name; not found in the law texts read | statements, ads | not sourced here |
| קרן ותיקה | old fund | Non-insurance annuity fund approved before 1995 | law | Provident Funds Law s.1 |
| תיקון 190 | Amendment 190 | 2012 Ordinance amendment (s.9A); market name for exempt-payment deposits | ads, fund forms | circular 2/2013 |
| תשלומים פטורים | exempt payments | Non-benefited or already-taxed annuity-fund money | law, fund forms | s.9A(a) |
| קצבה מוכרת | recognized annuity | Annuity part from exempt payments; exempt from 60 | law, statements | s.9A(a), (b1) |
| היוון קצבה מוכרת | commutation of a recognized annuity | Lump sum from it; 15% on the relative profit | law, fund forms | s.9A(e)(3) |
| מרכיב הרווח היחסי | relative profit component | Profit share of the commuted amount | law | s.9A(e)(3) |
| מרכיב הרווח הנומינלי | nominal profit component | Fund wording for the same base | fund forms | Analyst, Altshuler |
| היתרה הצבורה | accumulated balance | Exempt-payment money and gains before entitlement age | law | s.9A(e)(3) |
| התקרה להפקדת תשלומים פטורים | ceiling for depositing exempt payments | Age-based ceiling funds apply | fund forms | Mor, Analyst, Altshuler |
| תקרת ההפקדה המוטבת / התקרה המוטבת | benefited deposit ceiling | First layer of yearly deposits treated as benefited (38,412) | fund forms | Altshuler, Analyst |
| סכום קצבה מזערי / סכום צבירה מזערי | minimum annuity / minimum accumulation | 5,306/month; 110,250 (2026) | law, booklet | s.23(ה) |
| חשבון חדש | new account | Annuity-fund account receiving severance or beneficiary money, no further deposits | law | s.23(א)(2א), (2ב) |

## Institutions

Not a list of providers: insurers offering savings policies and executive insurance, and managers taking Amendment 190 deposits, belong in `savings-policies-and-executive-insurance.md` from the CMA registers. Fund documents used here: Analyst Provident Funds, Altshuler Shaham Provident and Pension, Mor Provident and Pension (all 2025-2026, checked 2026-10-22).

## Open questions

1. **Policy gains: linked (25% real) or unlinked (15% nominal)? (Q5, main gap.)** **[2026-10-24 R5 pass: narrowed, not closed. Exact wording of s.3(ה5) and s.125C re-read (TXA-03, TXA-05 annotations); Clal states "רק על הרווח הריאלי" and Phoenix's s.125D example implies 25% (TXA-28, institution). No insurer or official text supports 15% nominal. Browser to-do: the Tax Authority circular on Amendment 147 (2005) or the "קובץ הפרשנות" on s.3(ה5), gov.il.]** s.125C has no policy rule; the guide's linked/unlinked test is written for deposits and plans; reg. 5(a) withholds 25% on profit-sharing policies even if unlinked; only secondary sources say "25% real". Also: are today's savings policies approved as profit-sharing policies? Tried: Ordinance sweep, guide pp.38-41, withholding regs, three targeted searches. Likely in: a Tax Authority circular on the 2002-2005 changes (s.3(ה5) carries the amendment tags תשס"ג and תשס"ה), or an insurer's policy terms (tax clause).
2. **Policy deposits made before 1.12.2002**: reg. 20(a)(4) covers only later deposits. What tax applies to gains on earlier deposits? Likely in the same circular or the transitional provisions of the law that added s.3(ה5).
3. **Moving a savings policy to another insurer**: tax event or not? No source found. Likely in CMA rules on policy transfers or a Tax Authority ruling.
4. **Partial withdrawal from a policy**: s.3(ה5) has no pro-rata rule. Insurer terms or a circular.
5. **Death**: tax on the savings component paid to beneficiaries of a savings policy, and on Amendment 190 money of someone who dies before 75.
6. **Growth inside executive insurance** (s.9(2)(b) excludes insurance funds): how investment income attributable to members is taxed, and whether it reduces the member's return. Likely in the Ordinance's life-insurer provisions not read in full, insurance-taxation regulations, or an insurer's financial statements (institution).
7. **Risk and disability components in executive insurance**: which credit (25% life vs 35% survivors' annuity) applies to the employee's share; tax on employer payments for disability cover; how a death payment splits between s.9(19), s.9(7a) and survivors' rules.
8. **Pre-2008 capital money in executive insurance**: does s.9(18) exempt the gains on a lawful lump-sum withdrawal (TXA-15 is a reading)? Also bears on TXP open question 9.
9. **Legal source of the Amendment 190 age ceilings and the 38,412 benefited layer**: Mor says the ceiling is for withdrawal without an approval; no Tax Authority document was found. Tried: two searches, gov.il not reachable as HTML. Likely: a Tax Authority instruction to institutional bodies, or regulations under s.9A.
10. **Age 60 and three payslips as conditions for the 15% commutation**: stated by funds; statutory basis not found. Same likely source as 9. **[2026-10-24 R5 pass: narrowed. The payslip requirement is the Tax Authority's own, in circular 2/2013 p.24 (TXA-27); "three" and the age-60 gate for the 15% route are still fund practice (Clal's Amendment 190 sheet repeats both, institution). Age 60 as the exemption age is s.9A(b1).]**
11. **s.9A(e)(1) and (e)(3) together**: can the exempt-commutation capacity be used on recognized-annuity money, and in what order?
12. **The separate circular on the recognized annuity** promised in circular 2/2013 s.2.2.2 ("צפויה רשות המסים לפרסם חוזר מקצועי בעתיד"): not found (one search).
13. **Recognized annuity before 60** (outside disability): taxable as a qualifying annuity, or otherwise?
14. **NII and health contributions** on a recognized annuity and on a commuted amount (also TXK open question 9).
15. **Surtax and brackets**: does the 15% commutation income count toward s.121B surtax, and is it "income from capital sources" for the extra 2% (TXG-10)?
16. **Proposed changes**: re-check the Arbitrage Committee proposals (TXK-21) and the 2027 budget for Amendment 190 and savings-policy changes.
17. **Notional redemption ("פדיון רעיוני") of a savings policy**: Phoenix describes a year-end paper redemption to use the s.125D deduction (TXA-28). Whether the Tax Authority has stated a position on it, and whether it resets the cost basis for the policy, was not found. Likely a Tax Authority ruling or the 867 instructions. Added 2026-10-24.

## Left out and why

- Ordinary commutation, qualifying-annuity exemption, offset formula, severance continuity: `tax-pension-gemel-lekitzba.md` (TXP-14 to TXP-21).
- s.135B (`ערך פדיון`, cash-surrender value): it defines terms for the reporting duties of financial institutions (ss.135C-135G); it is not a tax on the saver.
- s.129E (the Minister may set a tax rate that banks or insurers pay on savings-plan income attributed to the saver; the saver gets no refund): no order under it was found; noted here only so a future order is recognised.
- Product facts (guaranteed annuity factors, fees, track lists, insurer register, whether savings policies have a deposit ceiling): `savings-policies-and-executive-insurance.md`.
- Search snippets (supermarker, pensuni, protocol, igemel, hasolidit, Kol Zchut) were not opened and are not used.

## Proposed dimensions

- `cohort-start-date`: the outcome depends on when the policy was issued or the money deposited (TXA-06, TXA-15, TXA-17).
- `death-and-beneficiaries` and `annuity-vs-lump-sum`: as proposed in `tax-gemel-lehashkaa-ira-child.md`; used here in TXA-09, TXA-16, TXA-18, TXA-19, TXA-26.

## Graduation status (D2: tier 2 to tier 1 needs a sourced record and closed tax questions)

- **Savings policies: blocked.** Closed: classification of gains as interest (TXA-03), no deposit benefit (TXA-02), insurer withholding (TXA-04), death-risk exemption (TXA-09). Blocking: open question 1 (25% real vs 15% nominal; today only secondary), 3 (switching insurers), 4 (partial withdrawals), 5 (death, savings part); 2 matters only for pre-2003 policies. Track switching is secondary only (TXA-08); under D10 it can compute labelled secondary, but question 1 cannot. *2026-10-24:* question 1 is narrowed: two insurers state the real-gain base and 25% in their own words (TXA-28, institution) and the statute's linkage carve-out fits it (TXA-05 annotation). It can compute only if the founder extends D10 to institution-strength rules (coverage.md F1) or a Tax Authority text is found (browser to-do). Question 5 (death before 75) has an institution answer (TXA-26 annotation).
- **Executive insurance: blocked.** Deposit and annuity rules are the pension rules (TXA-12, TXA-13). Blocking: open question 6 (tax on growth inside an insurance fund), 7 (risk and disability components, death split); 8 matters for pre-2008 capital policies.
- **Amendment 190 deposits: partly unblocked.** Closed and primary: what money qualifies (TXA-17), exemption from 60 (TXA-18), 15% of the nominal relative profit on commutation (TXA-19, the rate in Q6), when commutation is lawful (TXA-20). Blocking: open questions 9 and 10 (the age ceilings, the benefited layer and the age-60 and payslip conditions rest on fund documents only; D10 names primary, secondary and open but not institution-strength rules, so a product decision is needed on whether those compute), 11 (interaction with the exempt commutation), 14 and 15 (NII and surtax on the result). *2026-10-24:* the payslip condition is now primary (TXA-27, circular 2/2013); the age ceilings (9) are still institution only: a secondary source (Adif, Cloudflare-blocked to scripts) attributes them to a Tax Authority ruling ("החלטת מיסוי"), which a browser pass should locate on gov.il.

## Sources

| Source | Publisher | Strength | Checked |
|---|---|---|---|
| [Income Tax Ordinance, Wikisource raw text](https://he.wikisource.org/wiki/פקודת_מס_הכנסה?action=raw): ss.1, 3(ה4), 3(ה5), 9(2), 9(6f), 9(13), 9(17), 9(18), 9(19), 9A(a), (b1), (e), (ה1), (f), 32(10), 45A, 50, 89(ד), 125C, 125D, 125E, 129E, 135B (swept for insurance terms in characters 200,000-900,000; see method note) | Knesset law, Wikisource mirror | primary (mirror) | 2026-10-22 |
| [Supervision of Financial Services (Provident Funds) Law 2005, Wikisource raw text](https://he.wikisource.org/wiki/חוק_הפיקוח_על_שירותים_פיננסיים_(קופות_גמל)?action=raw): ss.1, 13, 22, 23 | Knesset law, Wikisource mirror | primary (mirror) | 2026-10-22 |
| [Income Tax (Withholding from Interest, Dividends and Certain Profits) Regulations 2005](https://www.btl.gov.il/Laws1/02_0103_100269.pdf): regs. 1, 5, 20, addendum (consolidated to 27.12.2017) | Regulations, copy on National Insurance site | primary | 2026-10-22 |
| ["דע זכויותיך וחובותיך 2025"](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed pp.30-32, 38-41, 68-70, 86-89 | Israel Tax Authority | primary | 2026-10-22 |
| [Deductions booklet from January 2026, updated April 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), pp.12-13, 18-19 | Israel Tax Authority | primary | 2026-10-22 |
| [Income Tax circular 2/2013, "תיקון 190 לפקודה" (27.5.2013)](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-02-2013/he/Policy_IncomeTaxInst_hoz02-2013.pdf), pp.1-5, 13-14 | Israel Tax Authority | primary | 2026-10-22 |
| [Analyst, "היוון קצבה מוכרת – תיקון 190", form 1018 (updated 25.2.2025, headed February 2026)](https://www.analyst.co.il/wp-content/uploads/2026/02/טופס-190-2026.pdf) | Analyst Provident Funds | institution | 2026-10-22 |
| [Altshuler Shaham, "היוון קצבה מוכרת – תיקון 190", G1005_020225](https://as-invest.co.il/media/g3cdn5nu/היוון-קצבה-מוכרת-תיקון-190-לפקודת-מס-הכנסה-020225.pdf) | Altshuler Shaham Provident | institution | 2026-10-22 |
| [Mor, "תקרות וסכומים לשנת 2026" (38.9.1.26)](https://www.moreinvest.co.il/media/ob5nzn0o/תקרות-וסכומים-2026.pdf), pp.1-3 | Mor Provident and Pension | institution | 2026-10-22 |
| [Altshuler Shaham, "פוליסת חיסכון: קווים לדמותה" (29.9.2020)](https://www.as-invest.co.il/magazine/%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%90%D7%A8%D7%95%D7%9A-%D7%98%D7%95%D7%95%D7%97/%D7%A4%D7%95%D7%9C%D7%99%D7%A1%D7%AA-%D7%97%D7%99%D7%A1%D7%9B%D7%95%D7%9F-%D7%A7%D7%95%D7%95%D7%99%D7%9D-%D7%9C%D7%93%D7%9E%D7%95%D7%AA%D7%94/) | Investment house (not a policy provider) | secondary | 2026-10-22 |
