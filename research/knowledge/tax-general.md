# Tax: cross-cutting rules (brackets, surtax, definitions, filing, withholding, National Insurance)

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/tax-general.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: tax-specialist
Serves: `docs/product.md` 3.1 (instrument guide: "how it is taxed"), 3.2 (goal comparison: tax at exit, the "must not need an annual tax return" constraint, age input), 3.3 (dimension checklist), 3.8 (rule base, "likely to change" list with re-check dates) and 3.9 (re-check after a rule change). Roadmap: Release 1 (rule base, guide), Release 2 (comparison engine).
Scope: rules every instrument file relies on, for an individual Israeli resident who is not a substantial shareholder (בעל מניות מהותי): the tax year and residency, 2026 brackets and credit point, the 2025-2027 freeze, surtax (3% and the extra 2% on capital income), real gain and inflationary amount, the "maximum rate vs fixed rate" rule that decides whether lower brackets (age 60+) reach capital income, withholding vs self-reporting, Form 867, annual-return triggers, advances when income is at a foreign broker, foreign-asset reporting triggers, refunds and late-payment charges, National Insurance and health contributions on passive income, legislated and proposed changes for 2025-2027.
Out of scope, see: interest rates, s.125D/125E deductions and real vs nominal interest in detail: `tax-interest-deposits-bonds.md` (TXI). Capital gains, dividends, losses and withholding on securities: `tax-securities-israeli.md` (TXS), `tax-securities-foreign.md` (TXF). Pension and provident: `tax-pension-gemel-lekitzba.md` (TXP), `tax-hishtalmut.md` (TXH), `tax-gemel-lehashkaa-ira-child.md` (TXK). Physical real estate (rent tracks, betterment tax, purchase tax, the real-estate surtax threshold) is out of product scope (`docs/product.md` D2, section 4); it is mentioned below only where a cross-cutting rule names it. New-immigrant (olim) benefits are not covered.

## Summary

- The 2026 brackets were widened by a law of 31.3.2026, retroactive to 1.1.2026: 10%/14%/20%/31%/35%/47% on personal-effort income, with 20% up to 228,000 and 31% up to 301,200 a year. Income that is not from personal effort starts at 31%, except for an individual who reached 60 in the tax year, who gets the lower brackets on all taxable income. Credit point: 242 NIS a month in 2026.
- Most shekel amounts in the Ordinance (brackets, credit points, surtax threshold, filing ceilings) are frozen at their 1.1.2024 values for tax years 2025 to 2027 and are next indexed on 1.1.2028.
- Surtax: 3% on taxable income above 721,560 NIS, plus, from 2025, another 2% on the part of capital-source income above the same amount. The statute tests capital-source income on its own against the threshold (closes Q11).
- Capital-income rates in the Ordinance come in two kinds. A "maximum rate" (for example, up to 25% on real capital gains and on linked interest) lets lower brackets apply first. A "fixed rate" (for example, 15% on unlinked deposit interest) does not. So a 60+ person with low other income can pay less than 25% on capital gains and linked interest, but still pays 15% on unlinked interest. Someone under 60 gets no bracket benefit, because their non-personal-effort brackets start at 31% (answers Q16 for the general rule).
- Israeli banks and other payers withhold at source and issue an annual certificate (Form 867). A person whose income was fully withheld and is under the ceilings need not file a return. Foreign assets or foreign bank balances above 2,086,000 NIS, surtax liability, or a transfer of 500,000 NIS or more abroad within 12 months make a return compulsory. Securities trades not fully withheld (for example, at a foreign broker) need half-yearly reports and advances.
- National Insurance and health contributions are charged on "income not from work", but interest and dividends taxed at the special rates, and rent taxed under the 10% or foreign 15% tracks, are exempt by statute. Capital gains are outside the base, because the law counts only s.2 Ordinance sources and capital gains are not one of them (an inference from the statute; Q10 partly closed).

## Rules

### TXG-01 Tax year and who these rules apply to
- Rule: The tax year is the calendar year (1 January to 31 December). The rules in this file apply to an Israeli resident individual. An individual's residence is decided by the "centre of life" test, with rebuttable presumptions of residence after 183 days in Israel in the tax year, or 30 days in the year and 425 days over that year and the two before it.
- Conditions / exceptions: The presumptions can be rebutted by the individual or by the assessing officer. Non-residents, olim and veteran returning residents have separate rules that are not covered here.
- Figures: 183 days; 30 + 425 days. Fixed in law.
- Source: [Tax Authority, "דע זכויותיך וחובותיך 2025"](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.6 s.1 ("שנת המס 2025 מתחילה ב-1.1.2025 ומסתיימת ב-31.12.2025") · checked 2026-10-22 · primary. [Income Tax Ordinance, consolidated (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.1 definition "תושב ישראל" ("מרכז חייו") · checked 2026-10-22 · primary (legislation via mirror; the fetch tool paraphrased, so exact wording must be re-read before encoding)
- Dimensions: `eligibility`
- Likely to change: no

### TXG-02 Income-tax brackets for 2026, personal-effort income
- Rule: Annual taxable income from personal effort (הכנסה מיגיעה אישית) is taxed in 2026 at: 10% up to 84,120; 14% from 84,121 to 120,720; 20% from 120,721 to 228,000; 31% from 228,001 to 301,200; 35% from 301,201 to 560,280; 47% on each further shekel. Monthly: 7,010 / 10,060 / 19,000 / 25,100 / 46,690.
- Conditions / exceptions: The 20% and 31% bands were changed by the Economic Efficiency Law for budget year 2026 (Part C, "ריווח מדרגות מס הכנסה"), published 31.3.2026 and in force from 1.1.2026 for income produced or derived from that date. For tax year 2025 the bands were 20% only up to 193,800 and 31% up to 269,280.
- Figures: as above, NIS, tax year 2026. The law deems these amounts to be the amounts "adjusted as of 1.1.2024" for the freeze (SH 3511 s.7), so they stay fixed through 2027 and are indexed from 1.1.2028 (TXG-06).
- Source: [Tax Authority deductions booklet "לחודש ינואר 2026 ואילך, מעודכן לאפריל 2026"](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.4 (summary of the 31.3.2026 law) and p.10 (2026 tables) · checked 2026-10-22 · primary. [Sefer HaChukim 3511, 31.3.2026](https://fs.knesset.gov.il/25/law/25_lsr_12235101.pdf), p.416, ss.5-7 · checked 2026-10-22 · primary. 2025 bands: [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.96 table A · checked 2026-10-22 · primary
- Dimensions: `tax-at-exit`, `tax-during`
- Likely to change: yes. The Finance Ministry tax committee wants further widening (TXG-33). Re-check when a 2027 budget law is published, and on 2027-01-15 against the January 2027 deductions booklet.

### TXG-03 Income that is not from personal effort starts at 31%
- Rule: Taxable income that is not personal-effort income is taxed from the first shekel at 31% up to 301,200, 35% up to 560,280 and 47% above (2026). Ordinary passive income of a person under 60 therefore starts at 31%.
- Conditions / exceptions: An individual who reached 60 in the tax year gets the personal-effort brackets on all taxable income (TXG-04). Interest, dividends and capital gains have their own capped or fixed rates (TXG-07); this rule is the fall-back schedule they are measured against.
- Figures: 31% / 35% / 47%; thresholds 301,200 and 560,280 NIS a year (25,100 and 46,690 a month), tax year 2026; frozen to 2027.
- Source: [Deductions booklet 2026, April update](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.10 ("שיעורי המס החלים על הכנסה שאינה מיגיעה אישית") · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.8 s.9b ("הכנסות שאינן מיגיעה אישית חייבות בשיעור מס התחלתי של 31%") · checked 2026-10-22 · primary
- Dimensions: `tax-at-exit`, `tax-during`
- Likely to change: yes, with TXG-02.

### TXG-04 Age 60 and over: lower brackets on all taxable income
- Rule: The personal-effort brackets (10%, 14%, 20%, then 31%) apply to all taxable income in a tax year of an individual who reached 60, not only to personal-effort income.
- Conditions / exceptions: The test is reaching 60 during the tax year ("מי שמלאו לו שישים שנה בשנת המס"). Excluded: income that had to be recorded in books of account that were not properly kept (s.121(b)(2)). The benefit reaches capital income only where the capital-income rate is a "maximum rate" (TXG-07, TXG-08), and only to the extent the lower bands are not already used by other income, because capital gains and interest are counted as the top slice of income.
- Figures: 10% to 84,120; 14% to 120,720; 20% to 228,000; 31% to 301,200 (2026, frozen to 2027).
- Source: [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.121(b)(1) ("הכנסה חייבת בשנת המס של יחיד שמלאו לו 60 שנים") · checked 2026-10-22 · primary (mirror). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.8 s.9b, p.46 s.2 ("אם הינך בן 60 ומעלה, שיעורי המס ההתחלתיים שיחולו לגבי רווח ההון הריאלי ... יהיו בהתאם לשיעורי המס שנקבעו להכנסה מיגיעה אישית") and p.96 note under table A · checked 2026-10-22 · primary
- Dimensions: `age-or-use-exemption`, `tax-at-exit`, `eligibility`
- Likely to change: yes, the bands move with TXG-02. The age rule itself: no.

### TXG-05 Credit point value
- Rule: A credit point (נקודת זיכוי) is worth 242 NIS a month in 2026. Credit points reduce tax computed on taxable income.
- Conditions / exceptions: Who gets how many points is out of scope. Whether credit points can absorb tax on capital income taxed at special rates was not found (open question 6).
- Figures: 242 NIS/month, tax year 2026 (s.33A). 2,904 NIS/year in 2025 (guide). The 2026 annual figure, 12 × 242 = 2,904, is computed, not sourced. Frozen to 2027.
- Source: [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.12 ("נקודת זיכוי 33א ... 242 לחודש") · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.96 ("נקודת זיכוי שווה 2,904 ₪ לשנה") · checked 2026-10-22 · primary
- Dimensions: `tax-during`
- Likely to change: yes. Press reports the committee wants to cut child credit points (TXG-33). Re-check with the 2027 budget and on 2027-01-15.

### TXG-06 Freeze of indexation for tax years 2025 to 2027, and indexation after
- Rule: Normally, amounts in the Ordinance tied to s.120B ("income ceilings" for the s.121 brackets and the s.121B surtax threshold, plus many listed reliefs) are indexed every 1 January by the CPI rise in the previous tax year. For tax years 2025 to 2027 they are not indexed and stay at their 1 January 2024 values. On 1 January 2028 the 1 January 2024 amounts (before rounding) are indexed under the normal rule, with the index of tax year 2027 taken as the previous-year index.
- Conditions / exceptions: Amounts tied to the average wage, not to s.120B (for example, pension and study-fund ceilings, the National Insurance thresholds), still change every year (see TXP, TXH, and TXG-26). The 2026 bracket amounts (TXG-02) are deemed to be 1.1.2024 amounts for this purpose. Amounts in regulations that are indexed "under s.120B" (for example, the filing-exemption ceilings, TXG-17) follow the same freeze; that reading is ours (reg. 6A refers to s.120B), not a Tax Authority statement. Whether the 2028 indexation catches up the CPI rise of 2024 to 2027 or only one year's rise is not clear from the text read (open question 8).
- Figures: freeze for tax years 2025, 2026 and 2027; next indexation 1.1.2028.
- Source: [Sefer HaChukim 3342, 26.12.2024, Economic Efficiency Law (Freeze of Tax Updates and Surtax) 2024](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf), p.150, s.1(1) adding s.120B(e) ("ב־1 בינואר של שנות המס 2025 עד 2027 לא יתואמו הסכומים ... והסכומים באותן שנות מס יהיו כפי שהיו ביום ... 1 בינואר 2024") · checked 2026-10-22 · primary. [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.3 · checked 2026-10-22 · primary. [SH 3511](https://fs.knesset.gov.il/25/law/25_lsr_12235101.pdf), p.416, s.7 · checked 2026-10-22 · primary. s.120A and s.120B(a) wording: [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw) · checked 2026-10-22 · primary (mirror)
- Dimensions: `real-vs-nominal`; proposed `threshold-drift` (see "Proposed dimensions")
- Likely to change: yes. The freeze ends after tax year 2027 unless extended. Re-check with the 2027 budget law and on 2028-01-15.

### TXG-07 "Maximum rate" vs "fixed rate" on special-rate income; capital income as the top slice
- Rule: Where the Ordinance taxes an income type at a rate "not exceeding" X% (שיעור מס מרבי), the person's ordinary brackets apply first if they are lower, and X% is only a ceiling. Where it sets a rate of X% (שיעור מס קבוע), exactly X% applies even if the person's brackets would be lower. Real capital gains (s.91(b)(1)) and interest (s.125C(b)) are taxed at up to 25% and treated as the top slice of the person's taxable income. Interest on an asset that is not linked, or not fully linked, to the CPI is taxed at a fixed 15% (s.125C(c)(1)).
- Conditions / exceptions: The guide lists form-1301 fields 12, 14, 15, 22 and 23 as examples of maximum-rate fields. Field 23 is linked deposit and savings-plan interest, "up to 25%". Field 21, unlinked deposit interest at 15%, is not in that list. Unlinked bond gains under s.91(b)(3)(a) are worded "not exceeding 15%" (TXI, TXS). Marginal rates apply instead in the s.125C(d) cases: business income, an interest-expense deduction claimed, a substantial shareholder in the payer, an employee or supplier of the payer, early study-fund withdrawals, and cases set by the Minister (TXI).
- Figures: 25% ceiling; 15% fixed (2026, unchanged in the 2026 rate list, guide p.116).
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.38 ("שיעור מס מרבי ... משמעותו שאם הנישום יכול ליהנות ממדרגות מס נמוכות יותר, יחול על ההכנסה שיעור המס הנמוך תחילה ... על הכנסה חייבת בשיעור מס קבוע יחול המס בשיעור הנקוב בלבד, ולא בשיעור מס נמוך יותר"), p.40 (fields 21-23) · checked 2026-10-22 · primary. [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.91(b)(1) ("כאמור בסעיף 121, בשיעור שלא יעלה על 25%, ויראו את רווח ההון כשלב הגבוה ביותר בסולם הכנסתו החייבת"), s.125C(b) ("בשיעור שלא יעלה על 25%, ויראו את הכנסתו זו כשלב הגבוה ביותר בסולם הכנסתו החייבת"), s.125C(c)(1) ("תחויב הכנסתו של היחיד מריבית במס בשיעור של 15%") · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-at-exit`, `tax-during`, `age-or-use-exemption`
- Likely to change: no (structure). Rates: see TXG-32.

### TXG-08 Who can pay less than 25% on capital income (Q16, general rule)
- Rule: Taken together, TXG-03, TXG-04 and TXG-07 give three cases. (a) Under 60: passive income starts at 31%, so the 25% ceiling binds and there is no bracket benefit on capital gains or linked interest. (b) 60 or over: real capital gains and linked interest can fall in the 10%, 14% or 20% bands, to the extent other income has not used them. (c) Any age: unlinked deposit interest stays at a fixed 15%. A low-income person under 60 gets interest relief through the s.125D deduction instead (TXI), not through brackets.
- Conditions / exceptions: This is a derivation from the three rules cited, not a sentence found in one source. Withholding at the bank is at the standard rate (TXG-15). The person gets the difference back by filing a return or a refund request (TXG-25); how banks treat 60+ customers at source was not found (open question 7). Dividends (s.125B, "25%") and unlinked bond gains (s.91(b)(3), "not exceeding 15%") are left to TXS and TXI (open question 10).
- Figures: see TXG-02 to TXG-04.
- Source: as TXG-03, TXG-04, TXG-07 · checked 2026-10-22 · primary (derived) · links from the cited rules: [1](<https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf>), [2](<https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf>), [3](<https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw>)
- Dimensions: `age-or-use-exemption`, `tax-at-exit`, `reporting-obligation`
- Likely to change: yes, with the bands (TXG-02).

### TXG-09 Surtax (מס נוסף, "מס יסף"), base 3%
- Rule: An individual whose taxable income in the tax year exceeds 721,560 NIS pays an extra 3% on the part above it. "Taxable income" for this purpose excludes the inflationary amount and includes betterment. The surtax also applies to income taxed at capped rates, such as capital-market income, and at final rates, such as s.122 rent.
- Conditions / exceptions: Betterment from selling a residential apartment counts only if the sale value exceeds 5,385,285 NIS (2026). That is real estate, so out of scope. An employer withholds the 3% on salary above 60,130 NIS a month (the booklet cites reg. 6 of the salary-withholding regulations, תקנות מס הכנסה (ניכוי ממשכורת ומשכר עבודה), התשנ"ג-1993).
- Figures: 721,560 NIS/year = 60,130 NIS/month, for 2024 to 2027 (frozen, TXG-06). Rate 3%.
- Source: [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.11 ("מס נוסף על הכנסות גבוהות") · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.8 ("הכנסה חייבת לא כוללת סכום אינפלציוני ולרבות שבח"; "המס הנוסף חל גם על הכנסות החייבות בשיעור מס מוגבל, כגון הכנסות משוק ההון, וכן על הכנסות החייבות בשיעור מס סופי, כגון ... סעיף 122") · checked 2026-10-22 · primary. [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.121B(a) and editorial note "בשנים 2024–2027, 721,560 ש״ח" · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-at-exit`, `tax-during`, `reporting-obligation`
- Likely to change: yes. The threshold is frozen to 2027 and indexed from 2028. Re-check on 2028-01-15, and with the 2027 budget.

### TXG-10 Additional 2% surtax on capital-source income (closes Q11)
- Rule: On top of the 3%, an individual whose taxable income from capital sources in the tax year exceeds the same threshold (721,560) pays a further 2% on the part of capital-source income above it. "Taxable income from a capital source" means all taxable income except (1) business or employment income (s.2(1), (2)) and (2) other personal-effort income. The threshold is tested on capital-source income alone, not on total income.
- Conditions / exceptions: In force for income produced or received from 1.1.2025 (SH 3342 s.3(b)). Like the 3%, "taxable income" excludes the inflationary amount (s.121B(e)). Interest, dividends, real capital gains and rent all fall in the capital-source definition unless they are business income. Illustration, computed and ignoring deductions and inflationary amounts: salary 800,000 + capital income 100,000 gives 3% on 178,440 and no 2%, because capital income alone is below 721,560. Capital income of 900,000 with no salary gives 3% and 2% on 178,440 each.
- Figures: 2%; threshold 721,560 NIS (2025 to 2027, frozen).
- Source: [SH 3342](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf), p.150 s.1(2)(c) adding s.121B(a1) ("יחיד אשר הכנסתו החייבת ממקורות הוניים בשנת המס עלתה על הסכום הקבוע באותו סעיף קטן, יהיה חייב במס נוסף על חלק הכנסתו החייבת ממקורות הוניים העולה על הסכום האמור, בשיעור של 2%"), s.1(2)(e)(3) (definition "הכנסה חייבת ממקור הוני"), p.152 s.3(b) (commencement) · checked 2026-10-22 · primary. [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.11 · checked 2026-10-22 · primary
- Dimensions: `tax-at-exit`, `tax-during`; proposed `surtax`
- Likely to change: yes. New in 2025, and capital taxation is a stated direction of the Finance Ministry's chief economist (TXG-33). Re-check with the 2027 budget.

### TXG-11 Surtax is settled through the annual return, not through advances
- Rule: The s.91(d) advance-payment rules (30-day reporting on a sale) do not apply to surtax under s.121B(a) or (a1). Anyone liable for surtax, or whose spouse is, must file an annual return even if every other filing condition is met (TXG-18).
- Conditions / exceptions: Whether Israeli banks or brokers withhold surtax on capital income was not found (open question 12).
- Figures: none.
- Source: [SH 3342](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf), p.150 s.1(2)(d) (amending s.121B(b)) · checked 2026-10-22 · primary. [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.121B(b) ("לא יחולו הוראות סעיף 91(ד) לעניין מקדמות") · primary (mirror). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.3 s.1(g) and p.4 item 6 · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`; proposed `surtax`
- Likely to change: no

### TXG-12 Capital gain, real gain and inflationary amount (definitions)
- Rule: Capital gain (רווח הון) = consideration minus the remaining original cost (יתרת המחיר המקורי, cost after depreciation). Real capital gain (רווח הון ריאלי) = capital gain minus the inflationary amount (סכום אינפלציוני). The inflationary amount is the part of the gain equal to the excess of the adjusted remaining original cost (יתרת המחיר המקורי המתואם) over the remaining original cost. The adjusted cost is the cost multiplied by the index on the sale day and divided by the index on the purchase day. The index (מדד) is the CPI "last published before the day in question". For a security held by an individual that is denominated in or linked to a foreign currency, the exchange rate is the index.
- Conditions / exceptions: A capital loss (הפסד הון) is the excess of remaining original cost over consideration. How a nominal gain smaller than the inflationary amount (a real loss) is treated was not resolved in the text read (TXS, open question 13). For the 30-day report and advance on non-traded assets see TXG-21. Securities rules: TXS and TXF.
- Figures: none (method).
- Source: [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.88 definitions "מדד" ("מדד המחירים לצרכן כפי שפורסם לאחרונה לפני היום שבו מדובר"; "לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד"), "ריווח הון", "הפסד הון", "ריווח הון ריאלי", "סכום אינפלציוני", "יתרת המחיר המקורי המתואם" ("כפול במדד ביום המכירה ומחולק במדד ביום הרכישה") · checked 2026-10-22 · primary (mirror). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.46 s.2 · checked 2026-10-22 · primary
- Dimensions: `real-vs-nominal`, `tax-at-exit`, `currency`
- Likely to change: no

### TXG-13 Inflationary amount: taxed only for the part built up before 1994
- Rule: The inflationary amount built up to 31.12.1993 (סכום אינפלציוני חייב) is taxed at 10%. The rest of the inflationary amount is exempt.
- Conditions / exceptions: Matters only for assets bought before 1994. For anything a saver buys today, the whole inflationary amount is exempt and only the real gain is taxed.
- Figures: 10%; cut-off 31.12.1993. Fixed in law.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.46 s.2 ("יתרת הסכום האינפלציוני אינה חייבת במס") · checked 2026-10-22 · primary. s.88 "סכום אינפלציוני חייב": [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw) · primary (mirror)
- Dimensions: `real-vs-nominal`, `tax-at-exit`
- Likely to change: no

### TXG-14 Index and "interest" for the interest rules
- Rule: For s.125C (interest), "index" (מדד) means the CPI last published by the Central Bureau of Statistics before the day in question, and "interest" (ריבית) includes discount fees (דמי ניכיון), so a makam discount is interest. The 15% fixed rate applies to interest on an asset that is not linked to the CPI, is linked only in part, or is not linked until redemption.
- Conditions / exceptions: How linked interest is split into real and nominal parts, s.125D/125E, and foreign-currency deposits are in TXI.
- Figures: none.
- Source: [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.125C(a), (c)(1) · checked 2026-10-22 · primary (mirror)
- Dimensions: `real-vs-nominal`, `tax-during`
- Likely to change: no

### TXG-15 Withholding at source by Israeli payers, and Form 867
- Rule: A payer of interest or dividends, including a financial institution through which they are paid, must withhold tax at source. For an individual: bank interest 25%, or 15% on unlinked assets; dividends from an Israeli company 25% (30% for a substantial shareholder); distributions from an exempt trust fund 25%; dividends from a foreign payer received by a resident individual 25%. The payer issues an annual certificate on Form 867 (טופס 867, "אישור שנתי") showing amounts paid and tax withheld. The person uses it in a return or refund claim.
- Conditions / exceptions: Withholding on capital gains from securities is under separate regulations (TXS, TXF). Per the regulations as read, the certificate is given on request, no later than 20 March for the previous tax year (paraphrased by the fetch tool; re-read before encoding).
- Figures: rates as above. 20 March deadline.
- Source: [Income Tax (Withholding from Interest, Dividends and Certain Profits) Regulations 2005 (Nevo mirror)](https://www.nevo.co.il/law_html/law01/999_549.htm) · checked 2026-10-22 · primary (mirror; last amendment shown 27.12.2017). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.38 ("מתקבלות בידי המקבל בדרך כלל אישור שנתי מהמשלם (בנק, קופת גמל וכו') המפרט את סוג ההכנסה ... וניכוי המס ממנה"), p.40 (fields 21-23 filled "לפי הסכומים המופיעים בטופסי 867") · checked 2026-10-22 · primary
- Dimensions: `tax-during`, `tax-at-exit`, `reporting-obligation`
- Likely to change: no

### TXG-16 Who must file an annual return: general rule
- Rule: Every Israeli resident aged 18 or older at the start of the tax year must file an annual return (דוח שנתי, form 1301), unless exempted by the Exemption Regulations (TXG-17). Others who must file include a 16-18-year-old with taxable income of 91,450 or more, and anyone the assessing officer asks to file.
- Conditions / exceptions: Exemptions and overriding triggers: TXG-17 to TXG-19.
- Figures: 91,450 NIS (tax year 2025).
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.3 s.1 (a), (d), and s.3 on p.5 · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`
- Likely to change: no (rule); figure frozen.

### TXG-17 Exemption from filing: ceilings, and the salary-vs-surtax threshold (closes Q17)
- Rule: A resident whose income is only of the listed kinds, each under its ceiling and fully withheld (or exempt, or paid through an advance where the rule allows), need not file. The ceilings are: salary 723,000; rent under the 10% track 375,000; foreign income 375,000; foreign pension 375,000; interest 717,000; sale proceeds (turnover) from traded securities 2,810,000; other income 375,000. The salary ceiling does not bind in practice: anyone liable for surtax (taxable income above 721,560) must file anyway (TXG-18). The Tax Authority's own list gives the salary limit as the lower of the two.
- Conditions / exceptions: The securities ceiling is on sale proceeds, not on gain, and covers traded securities, including foreign securities and short-term loans, where full tax was withheld, an exemption applied or an advance was paid. The interest ceiling covers interest, discount fees and linkage from deposits, savings plans, provident funds and traded bonds, where full tax was withheld.
- Figures: as above, NIS, labelled "for tax year 2025" in both Tax Authority sources. The 2026 values are expected to be the same because of the freeze (TXG-06), but no Tax Authority source labelled "2026" was found (open question 5).
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.3 s.2 items 1, 3, 4; p.4 items 5-8 and "אלה הסכומים המרביים לשנת 2025, המקנים פטור מהגשת דוח" item 1 (salary "והכנסה חייבת לפי סעיף 121ב שאינה עולה על סך של 721,560 ₪, לפי הנמוך") · checked 2026-10-22 · primary (read from a rendered page image; small print). [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.15 ("פטור מהגשה דין וחשבון 134א") · checked 2026-10-22 · primary. [Income Tax (Exemption from Filing a Return) Regulations 1988 (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%28%D7%A4%D7%98%D7%95%D7%A8_%D7%9E%D7%94%D7%92%D7%A9%D7%AA_%D7%93%D7%99%D7%9F_%D7%95%D7%97%D7%A9%D7%91%D7%95%D7%9F%29&action=raw), regs. 2, 3(a), 6A and schedules · checked 2026-10-22 · primary (mirror)
- Dimensions: `reporting-obligation`
- Likely to change: yes. Re-check when the Tax Authority publishes 2026 figures (January 2027 booklet, 2026 annual guide); re-check date 2027-03-31.

### TXG-18 Must file regardless: surtax, foreign assets and accounts, transfers abroad
- Rule: Even if TXG-17 would exempt them, a person must file if any of the following applies. The person or spouse is liable for surtax. They (with spouse and children under 18) held foreign assets worth more than 2,086,000, or foreign bank accounts with a total balance above 2,086,000 on any day of the year. They control a foreign company, or hold rights in a foreign body of persons, as the regulations list. They had to file the previous year (unless exempted). They are a resident individual who transferred 500,000 NIS or more out of Israel within 12 months.
- Conditions / exceptions: The foreign-asset and foreign-account triggers do not apply if the person, spouse and minor children are entitled to the s.14(a) or 14(c) exemption (new and returning residents; out of scope). Values are tested "on any day" in the tax year.
- Figures: 2,086,000 NIS (foreign assets; foreign bank accounts); 500,000 NIS (transfers abroad, 12 months); labelled "for tax year 2025", frozen.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.3 s.1 (g) and (12) ("יחיד תושב ישראל שהעביר במהלך 12 חודשים כספים אל מחוץ לישראל בסכום כולל של 500,000 ש"ח או יותר"), p.4 items 1-7 under "על אף הפטור ... חייב להגיש דוח" · checked 2026-10-22 · primary. [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.15 (regs. 3(a)(6), (7), (8)) · checked 2026-10-22 · primary. [Exemption Regulations (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%28%D7%A4%D7%98%D7%95%D7%A8_%D7%9E%D7%94%D7%92%D7%A9%D7%AA_%D7%93%D7%99%D7%9F_%D7%95%D7%97%D7%A9%D7%91%D7%95%D7%9F%29&action=raw), reg. 3(a) · primary (mirror)
- Dimensions: `reporting-obligation`, `foreign-withholding-domicile`, `currency`
- Likely to change: yes. Figures frozen to 2027; re-check on 2028-01-15.

### TXG-19 Foreign income: the "shortened reporting" advance can replace the return
- Rule: Foreign income (income produced or derived abroad, including from selling a foreign security or an Israeli company's security listed only abroad) up to 375,000 does not by itself require a return if tax on it was fully withheld, it is exempt, or a tax advance (מקדמת מס) was paid through the "shortened reporting" route (מסלול "הדיווח המקוצר"). The guide describes that route as an advance on foreign interest, dividends, or capital gains from a security, among others, reported and paid by 30 April after the tax year.
- Conditions / exceptions: All other filing conditions must still hold (TXG-18). How this fits with the guide's statement that untaxed securities gains require a return (TXG-20) is open (open question 4). The form numbers on p.3 were not legible enough to record.
- Figures: 375,000 NIS (tax year 2025, frozen); 30 April.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.3 s.2 item 3 and the paragraph on "מקדמת מס" ("מקדמה ... המתייחסת להכנסה מהשכרה שחל עליה מס בשיעור של 15%, מריבית, מדיבידנד או מרווח הון שהוא הכנסה חוץ מנייר ערך ... עד ל-30.4 שלאחר תום שנת המס") · checked 2026-10-22 · primary (read from a rendered page image)
- Dimensions: `reporting-obligation`, `foreign-withholding-domicile`
- Likely to change: no

### TXG-20 Securities trades not fully withheld (for example, at a foreign broker): half-yearly reports and advances
- Rule: Anyone with capital gains on exchange-traded securities (in Israel or abroad) from which full tax was not withheld must report and pay an advance twice a year: by 31 July for trades in January to June, and by 31 January for trades in July to December of the previous year. The advance is at the rates that apply. The guide adds that such a person "must file an annual return".
- Conditions / exceptions: Applies only to securities where full tax was not withheld at source. An Israeli bank or broker that withholds removes the duty. Late payment: TXG-23. For the apparent conflict with the filing-exemption route for securities proceeds up to 2,810,000 where "an advance was paid" (TXG-17), see open question 4.
- Figures: 31 July; 31 January.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.46 ("אם לא נוכה המס כאמור, הינך חייב בהגשת דוח שנתי, וכן הינך חייב בדיווח על רווח הון ממכירת ני"ע סחירים, עד ה-31 ביולי של שנת המס וב-31 בינואר שלאחר שנת המס ... ובתשלום מקדמה"), p.117 s.f · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`, `foreign-withholding-domicile`, `tax-at-exit`
- Likely to change: no

### TXG-21 Sale of a non-traded asset: 30-day report and advance
- Rule: On selling an asset, the seller reports to the assessing officer within 30 days of the sale (form 1399) and pays an advance on the tax, whether the result is a gain or a loss. This does not apply to gains on securities listed for trading on an exchange (those follow TXG-20), and tax withheld by the buyer counts towards the advance.
- Conditions / exceptions: Relevant to savers mainly for non-listed holdings. Real estate (betterment) is out of scope.
- Figures: 30 days.
- Source: [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.91(d) and s.91(d)(2c) ("הוראות סעיף קטן זה לא יחולו על רווח הון במכירת נייר ערך הרשום למסחר בבורסה") · checked 2026-10-22 · primary (mirror). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.46 ("דיווח על מכירת נכס"), p.48 s.6, p.117 s.e · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`, `tax-at-exit`
- Likely to change: no

### TXG-22 Advances on special-rate income
- Rule: Residents (including employees) with income taxed at special capped rates, produced in Israel or abroad, must pay advances on it. The 2026 list: deposit interest 15%/25%; interest on securities and savings plans 15%/25%; dividends 25%/30%; foreign-company dividends 25%/30%; foreign rent 15%; capital gains on securities 15%/20%/25%/30%. Except for Israeli residential rent, payment is due by 30 April of the following year.
- Conditions / exceptions: Where an Israeli payer withheld in full, no advance arises (TXG-15). Read from a small-print rendered page; re-read before encoding.
- Figures: rates as listed for tax year 2026; 30 April.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.116 s.2 ("תשלום מקדמות מס בגין הכנסות בשיעורים מיוחדים ובחו"ל"; "שיעורי המס מההכנסות בשנת המס 2026"), p.117 s.d ("יתר ההכנסות המיוחדות שנמנו לעיל, עד 30 באפריל בשנת המס הבאה") · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`, `foreign-withholding-domicile`
- Likely to change: no

### TXG-23 Late payment: linkage, 4% interest and a weekly fine
- Rule: Tax not paid by the end of the tax year (or by the due date of an advance) carries linkage differentials and interest from the end of the tax year to payment. Interest is 4% a year on the CPI-linked debt. Tax not paid on time also carries a late-payment fine of 0.2% for each week of delay.
- Conditions / exceptions: The assessing officer may reduce or cancel fines and interest on request in some cases (guide p.119 s.z, not detailed here).
- Figures: 4% a year; 0.2% a week.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.117 s.d, p.118 s.7, p.119 s.g ("שיעור הריבית הוא 4% לשנה"; "קנס פיגור בשיעור של 0.2% לכל שבוע של פיגור") · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`
- Likely to change: no

### TXG-24 Annual return deadlines
- Rule: For tax year 2025: a return by someone who does not keep double-entry books, or an employee required to file, is due by 30.4.2026. A return filed online is due by 31.5.2026. The assessing officer may allow a later date, and tax representatives get extension schedules.
- Conditions / exceptions: The discovery report said "31.3.2026". The guide page as read says 30.4.2026 (open question 11).
- Figures: 30.4.2026; 31.5.2026 (for tax year 2025).
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.8 s.7 ("מועד הגשת הדוחות") · checked 2026-10-22 · primary (read from a rendered page image)
- Dimensions: `reporting-obligation`
- Likely to change: yes, every year. Re-check with the 2026 guide (expected early 2027); re-check date 2027-03-31.

### TXG-25 Refunds: six years back, and a short form for non-filers
- Rule: A refund request for a given tax year can be filed up to 6 years after the end of that year (for example, tax year 2020 until 31.12.2026). Someone not required to file who overpaid (for example, a 60+ saver taxed at the full rate at source, or someone with losses at one bank and gains at another) can claim through a full return or the shortened refund form 0135.
- Conditions / exceptions: Form 0135 is not for people with business income, foreign income, controlling shareholders, capital gains other than from traded securities, and others listed on p.7 of the guide. A refund carries linkage and interest as set in law (guide p.9).
- Figures: 6 years.
- Source: [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.5 ("החזר מס"), p.7 s.4 ("טופס מקוצר - בקשה להחזר מס"), p.9 s.11 ("לא יאוחר מתום 6 שנים מתום שנת המס הרלוונטית") · checked 2026-10-22 · primary
- Dimensions: `reporting-obligation`, `age-or-use-exemption`, `loss-offset`
- Likely to change: no

### TXG-26 National Insurance and health contributions on "income not from work": who pays, rates
- Rule: A resident with income whose source is not work (הכנסה שאינה מעבודה) must pay National Insurance and health insurance contributions on it for themselves. From 1.1.2026: income up to 3,442 NIS a month is not charged; 6.92% NI + 5.17% health (12.09%) from 3,442 to 7,703; 7% + 5.17% (12.17%) from 7,703 to 51,910. Income above the maximum (51,910) is not taken into account. A resident who neither works nor has income pays the minimum, 143 + 123 = 266 NIS a month. An employee or self-employed person who also has income not from work pays on that income at the non-employee rate, up to the maximum income.
- Conditions / exceptions: Exemption by income type: TXG-27, TXG-28. A woman married to an insured resident who does not work outside the household is excluded from paying for herself (btl wording). Retirement age: TXG-30.
- Figures: thresholds 3,442 / 7,703 / 51,910 NIS a month; rates above; minimum 266 NIS. All from 1.1.2026 and reset every 1 January.
- Source: [NII, "למי שאינם עובדים ולבעלי הכנסה שלא מעבודה - שיעורי וסכומי דמי ביטוח"](https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx) · checked 2026-10-22 · primary. [NII, "חובת תשלום ושיעורי דמי ביטוח" (income not from work)](https://www.btl.gov.il/Insurance/National%20Insurance/type_list/income_not_from_work/Pages/HovtTaslom.aspx) ("מי שיש לו הכנסה שאינה מעבודה חייב לשלם דמי ביטוח לאומי ודמי ביטוח בריאות עבור עצמו") · checked 2026-10-22 · primary. [NII, non-working minimum](https://www.btl.gov.il/Insurance/National%20Insurance/type_list/NotWorking/Pages/ScomNotWorking.aspx) · checked 2026-10-22 · primary. [National Insurance Law (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw), s.371(b) ("ישלם דמי ביטוח גם בעד הכנסתו האחרת, בשיעור החל על הכנסה אחרת של מי שאינו עובד ואינו עובד עצמאי"), s.348(a) (maximum) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`, `reporting-obligation`; proposed `social-contributions`
- Likely to change: yes, every 1 January. Re-check 2027-01-05.

### TXG-27 National Insurance: passive income exempt by statute
- Rule: Not charged to National Insurance contributions: (a) income taxed under s.125B of the Ordinance (dividends), except income under s.373A of the NI Law; (b) income taxed under s.125C(b) or (c) (interest at up to 25% or at 15%); (c) rent taxed under s.122 (the 10% residential track) and foreign rent taxed under s.122A; (d) income not from work that is exempt from tax under any law. The Finance Minister may add exempt types.
- Conditions / exceptions: Interest taxed at marginal rates under s.125C(d) (business income, substantial shareholder in the payer, and so on) is not in the exempt wording. That is our reading of the text; no NII statement was found. Whether the same exemptions apply to health-insurance contributions was not confirmed in the Health Insurance Law (open question 2). s.373A was not read.
- Figures: none.
- Source: [National Insurance Law (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw), s.350(a)(6) ("הכנסה החייבת במס לפי הוראות סעיף 125ב לפקודת מס הכנסה, שאינה הכנסה לפי סעיף 373א, וכן הכנסה החייבת במס לפי הוראות סעיף 125ג(ב) או (ג) לפקודת מס הכנסה"), s.350(a)(7) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`, `tax-at-exit`; proposed `social-contributions`
- Likely to change: no

### TXG-28 National Insurance: capital gains are outside the base
- Rule: For a person who is neither an employee nor self-employed, annual income for contributions is income from the sources listed in s.2 of the Ordinance, after directly related expenses. Section 2 lists business, employment, dividends, interest, linkage and discount fees, annuities, rent and the like, and "any other source". It has no paragraph for capital gains, which are taxed under Part E. Capital gains are therefore not in the contribution base.
- Conditions / exceptions: This is an inference from two statutory texts. No NII or Tax Authority sentence stating it was opened (open question 2). A capital gain that is business income (a trader) is a s.2(1) source and would be in the base.
- Figures: none.
- Source: [National Insurance Law (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw), s.345(a) ("ומי שאינו עובד ואינו עובד עצמאי יראו כהכנסתו השנתית את הכנסתו מהמקורות המפורטים בסעיף 2 האמור") · checked 2026-10-22 · primary (mirror). [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.2(1)-(10), s.2(4) ("דיבידנד, לרבות דיבידנד המשתלם מתוך רווחי הון של חברה, ריבית, הפרשי הצמדה או דמי נכיון") · checked 2026-10-22 · primary (mirror; derived)
- Dimensions: `tax-at-exit`; proposed `social-contributions`
- Likely to change: no

### TXG-29 National Insurance: small non-work income disregarded (25% of the average wage)
- Rule: For contributions paid under s.335 of the NI Law, an insured person's income from s.2 sources that is not from work as an employee or self-employed, is not exempt under s.350, and does not exceed 25% of the average wage, is not taken into account. The NII 2026 rate table's "exempt up to 3,442 NIS a month" equals 25% of the 2026 average wage of 13,769 (13,769 × 25% = 3,442.25, computed).
- Conditions / exceptions: Which insured persons s.335 covers, and so whether an employee with passive income also gets this disregard, was not read (open question 2).
- Figures: 25% of the average wage; 3,442 NIS a month (2026); average wage 13,769 (2026, from the Tax Authority booklet). Updated yearly with the average wage.
- Source: [National Insurance Law (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw), s.348(a1) · checked 2026-10-22 · primary (mirror). Average wage: [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.12 ("שכר ממוצע במשק 13,769") · checked 2026-10-22 · primary
- Dimensions: `tax-during`, `eligibility`; proposed `social-contributions`
- Likely to change: yes, every 1 January. Re-check 2027-01-05.

### TXG-30 National Insurance at retirement age (non-workers)
- Rule: An insured person who is neither an employee nor self-employed, pays contributions for themselves, and has reached retirement age but is not yet entitled to an old-age pension, is not liable for contributions under s.335(b), (e), (g), (h) and (i).
- Conditions / exceptions: Which branches those subsections cover, the health-insurance side, people already receiving an old-age pension, and the retirement age itself were not researched (open question 2). The deductions booklet, p.7, has a table of women's retirement ages by birth date.
- Figures: none.
- Source: [National Insurance Law (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw), s.351(c) ("שהגיע לגיל הפרישה וטרם מגיעה לו קצבת אזרח ותיק, לא יהיה חייב בתשלום דמי ביטוח לפי סעיף 335(ב), (ה), (ז), (ח) ו־(ט)") · checked 2026-10-22 · primary (mirror)
- Dimensions: `age-or-use-exemption`, `eligibility`; proposed `social-contributions`
- Likely to change: no

### TXG-31 The Tax Authority booklet and guide defer to the law
- Rule: Both Tax Authority publications used here say that where they conflict with the law, the law prevails, and that the guide's explanations do not replace the law. Rule-base entries sourced only to the guide or booklet should be re-checked against the statute before encoding where the wording matters.
- Conditions / exceptions: none.
- Figures: none.
- Source: [Deductions booklet 2026](https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf), p.3 ("במקרה של סתירה או אי התאמה בין המידע המופיע בלוח לבין הוראות הדין הרלוונטיות יגברו הוראות הדין") · checked 2026-10-22 · primary. [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.1 footer · checked 2026-10-22 · primary
- Dimensions: none (method)
- Likely to change: no

### TXG-32 The Minister's power to change the 15% rates (Q3)
- Rule: The Finance Minister may change by order the 15% rate on unlinked interest (s.125C(c)(2)) and the "not exceeding 15%" rate on gains from unlinked bonds, commercial paper and loans (s.91(b)(3)(b)), "in line with the change in the index". The 2026 rate list in the Tax Authority guide still shows 15% for unlinked deposit interest and for securities.
- Conditions / exceptions: The power is tied to CPI movement, not open-ended. No order changing either rate was found attached to either section in the consolidated text read (open question 1).
- Figures: 15% in force for 2026.
- Source: [Ordinance (Wikisource mirror)](https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw), s.125C(c)(2) ("שר האוצר רשאי לשנות בצו את שיעור המס הקבוע בפסקה (1), בהתאם לשינוי במדד"), s.91(b)(3)(b) · checked 2026-10-22 · primary (mirror). [Guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), p.116 (2026 rates) · checked 2026-10-22 · primary
- Dimensions: `tax-during`, `tax-at-exit`, `real-vs-nominal`
- Likely to change: yes, low probability (needs only an order, not a law). Re-check 2027-01-15 against the January 2027 booklet.

### TXG-33 Legislated and proposed changes 2025-2027, and 2027 budget status (Q18)
- Rule: Legislated and in force: the indexation freeze for 2025-2027 (TXG-06); the extra 2% surtax on capital income from 1.1.2025 (TXG-10); the 2026 bracket widening (TXG-02). Also in SH 3511 and outside this file: quarterly reporting duty for financial service providers (s.141A, from the third quarter of 2026), a "material holding" definition for provident funds (s.9(2)(b), TXP), and a temporary income exemption for olim arriving 5.11.2025 to 31.12.2026. Not legislated as of 12.10.2026: a 2027 budget. Press reports that the 2027 budget cannot be worked on until after elections and a new Finance Minister. The Finance Ministry tax committee is considering narrowing the keren hishtalmut gains exemption to the first six years (TXH), further widening of the 31% band, cutting child credit points, and a vacant-land tax; an estate tax was considered and dropped.
- Conditions / exceptions: Proposals are not rules and must not compute (D10). The press source is secondary. No official 2027 budget document was opened (open question 3).
- Figures: none.
- Source: [SH 3342](https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf) · checked 2026-10-22 · primary. [SH 3511](https://fs.knesset.gov.il/25/law/25_lsr_12235101.pdf), pp.414-418 · checked 2026-10-22 · primary. [Calcalist, "מס ירושה לא, מס נטפליקס כן: מה מתכננת ועדת המיסוי באוצר?", Shlomo Teitelbaum, 12.10.2026](https://www.calcalist.co.il/local_news/article/skys1wkozg) · checked 2026-10-22 · secondary
- Dimensions: proposed `threshold-drift`
- Likely to change: yes. Re-check monthly until a 2027 budget law is published; first re-check 2026-11-22.

## Rules most likely to change, with re-check dates

| Rule | Why | Re-check |
|---|---|---|
| TXG-02, TXG-03, TXG-04 brackets | 2027 budget may widen the 31% band; freeze ends after 2027 | when a 2027 budget law is published; 2027-01-15; 2028-01-15 |
| TXG-05 credit point | child credit points proposed for cuts; freeze ends after 2027 | 2027 budget; 2027-01-15 |
| TXG-06 freeze | ends after tax year 2027 unless extended | 2027 budget; 2028-01-15 |
| TXG-09, TXG-10 surtax | threshold frozen to 2027; capital taxation is a stated policy direction | 2027 budget; 2028-01-15 |
| TXG-17, TXG-18 filing ceilings | 2026 figures not yet published by the Tax Authority | 2027-03-31 |
| TXG-24 deadlines | set each year | 2027-03-31 |
| TXG-26, TXG-29 NII thresholds and rates | reset every 1 January (average wage) | 2027-01-05 |
| TXG-32 15% rates | Minister can change by order | 2027-01-15 |
| TXG-33 proposals | 2027 budget not yet drafted | monthly from 2026-11-22 |

## Proposed dimensions

- `surtax`: whether high capital income adds the 3% and 2% surtax (TXG-09 to TXG-11). Changes the ranking only for large balances, but no existing tag covers it.
- `social-contributions`: whether National Insurance and health contributions apply to the income from the wrapper or exposure (TXG-26 to TXG-30). Interest and dividends taxed at special rates, and capital gains, are outside; marginal-rate interest and some other passive income are inside.
- `threshold-drift`: tax figures frozen or indexed differently from CPI, so their real value moves over a long horizon (TXG-06, TXG-33).

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| שנת המס | tax year | Calendar year | law, guide, form 1301 | Guide 2025 p.6 |
| תושב ישראל / מרכז חייו | Israeli resident / centre of life | Residence test for individuals | law | Ordinance s.1 |
| הכנסה חייבת | taxable income | Income after deductions, offsets and exemptions | law, form 1301 | Ordinance s.1 |
| הכנסה מיגיעה אישית | personal-effort income | Work and business income, including a pension from a former employer; gets the 10%-start brackets | law, booklet | Ordinance s.1; booklet p.10 |
| הכנסה שאינה מיגיעה אישית | income not from personal effort | Passive income; starts at 31% under 60 | booklet, guide | Booklet p.10 |
| מדרגות מס | tax brackets | Band schedule in s.121 | press, booklet | Booklet p.4, p.10 |
| נקודת זיכוי | credit point | Fixed monthly tax credit unit | payslip, booklet | Booklet p.12 |
| מס נוסף / מס יסף | surtax | 3% above the threshold, plus 2% on capital-source income | law ("מס נוסף"), press and booklet ("מס יסף") | SH 3342; booklet p.11 |
| הכנסה חייבת ממקור הוני / ממקורות הוניים | taxable income from a capital source | Taxable income other than business, employment and personal-effort income | law | SH 3342 |
| שיעור מס מרבי | maximum tax rate | A ceiling; lower brackets apply first | guide | Guide p.38 |
| שיעור מס קבוע | fixed tax rate | Exactly this rate; no lower bracket | guide | Guide p.38 |
| כשלב הגבוה ביותר בסולם הכנסתו החייבת | as the top slice of taxable income | Capital gains and interest are stacked on top of other income | law | Ordinance s.91(b)(1), s.125C(b) |
| רווח הון | capital gain | Consideration minus remaining original cost | law, bank tax report | Ordinance s.88 |
| רווח הון ריאלי | real capital gain | Capital gain minus inflationary amount | law, bank tax report | Ordinance s.88 |
| סכום אינפלציוני | inflationary amount | The CPI-driven part of the gain; exempt (after 1993) | law, bank tax report | Ordinance s.88; guide p.46 |
| סכום אינפלציוני חייב | taxable inflationary amount | Inflationary amount up to 31.12.1993; 10% | law | Ordinance s.88; guide p.46 |
| יתרת המחיר המקורי המתואם | adjusted remaining original cost | Cost × index at sale ÷ index at purchase | law | Ordinance s.88 |
| הפסד הון | capital loss | Cost above consideration | law, bank tax report | Ordinance s.88 |
| מדד | index | CPI last published before the day; exchange rate for foreign-currency securities of individuals | law | Ordinance s.88, s.125C(a) |
| דמי ניכיון | discount fees | Counted as interest (for example, makam) | law | Ordinance s.125C(a) |
| הפרשי הצמדה | linkage differentials | Amounts added for CPI or currency linkage | law, statements | Ordinance s.2(4) |
| ניכוי במקור | withholding at source | Tax deducted by the payer | statements, guide | Guide p.38 |
| טופס 867 / אישור שנתי | Form 867 / annual certificate | Payer's annual statement of income and tax withheld | bank, provident fund | Withholding regs 2005; guide p.40 |
| דוח שנתי / טופס 1301 | annual return / form 1301 | Individual's annual income-tax return | Tax Authority | Guide pp.3-8 |
| טופס 0135 | form 0135 | Shortened refund request for non-filers | Tax Authority | Guide p.5, p.7 |
| טופס 1399 | form 1399 | 30-day report of a sale of an asset | Tax Authority | Guide p.46, p.117 |
| מקדמה / מקדמת מס | advance / tax advance | Payment on account during or after the year | Tax Authority | Guide pp.3, 46, 116-117 |
| דיווח מקוצר | shortened reporting | Advance route on foreign interest, dividends, capital gains that can replace a return | Tax Authority | Guide p.3 |
| נכסי חוץ / חשבונות בתאגידי חוץ בנקאיים | foreign assets / accounts at foreign banking corporations | Filing triggers above 2,086,000 | law, guide | Guide p.4; booklet p.15 |
| הפרשי הצמדה וריבית / קנס פיגור | linkage and interest / late-payment fine | Charges on late tax | Tax Authority | Guide p.119 |
| הכנסה שאינה מעבודה | income not from work | NII category for passive income | NII | btl pages |
| דמי ביטוח לאומי / דמי ביטוח בריאות | National Insurance / health insurance contributions | Social contributions | NII, payslip | btl rates page |
| הסכום המרבי / ההכנסה המרבית | maximum (insurable) income | 51,910 NIS a month in 2026 | NII | btl rates page; NII Law s.348 |
| שכר ממוצע במשק | average wage | 13,769 NIS (2026); base for NII thresholds and pension ceilings | Tax Authority, NII | Booklet p.12 |
| בעל מניות מהותי | substantial shareholder | 10% or more of any means of control; out of scope | law | Ordinance s.88 |

## Open questions

1. **Q3 (remaining part): has the Minister ever used s.125C(c)(2) or s.91(b)(3)(b)?** The power exists, tied to CPI changes, and the rate in force for 2026 is still 15% (TXG-32). No order was found among the consolidated text's amendment notes. Tried: Wikisource consolidated text (notes on s.91, s.125C) and two web searches. Answer is probably in the Nevo subsidiary-legislation list for the Ordinance or in Kovetz HaTakanot. Low impact: the current rate is sourced.
2. **Q10 (remaining parts): National Insurance and health on passive income.** Closed: dividends and special-rate interest are exempt from NI (s.350(a)(6)); s.122/122A rent is exempt (s.350(a)(7)); capital gains are outside the base (inference, s.345 with Ordinance s.2); the 3,442 figure is the 25%-of-average-wage disregard (s.348(a1)). Open: (a) whether the Health Insurance Law applies the same exemptions to health contributions; (b) whether an employee with passive income gets the 25% disregard (scope of s.335); (c) pensioners, old-age-pension recipients and the retirement age itself; (d) an explicit NII statement on capital gains. Tried: btl rates, "income not from work" and "non-working" pages (no detail), NII Law via Wikisource. Kol Zchut returned 403; capitax print/1722 was unreadable (encoding) and dated 2007. Probably in the Health Insurance Law ss.14-15 and NII circulars.
3. **Q18: 2027 budget.** As of the Calcalist report of 12.10.2026 (secondary), no 2027 budget has been drafted, pending elections and a new Finance Minister. No official Finance Ministry or Knesset document was opened. A web search for the current status could not run (the session's search budget was used up). Re-check monthly.
4. **Foreign broker: annual return or not?** Guide p.46 says that if tax on traded securities was not fully withheld, "you must file an annual return" and report twice a year. Guide p.4 item 5 and Exemption Regulations schedule F exempt securities proceeds up to 2,810,000 where "an advance was paid", and p.3 offers the "shortened reporting" advance for foreign income. Which applies to a saver whose only non-withheld income is gains at a foreign broker, with half-yearly advances paid? Probably in the Exemption Regulations' definitions (reg. 1, "מקדמת מס") read in full, or a Tax Authority FAQ. This decides the product's "must not need an annual tax return" constraint (3.2).
5. **2026 filing-exemption amounts.** Both Tax Authority sources label 723,000 / 717,000 / 2,810,000 / 375,000 / 2,086,000 "for tax year 2025". The freeze implies the same for 2026, but that is our inference. Look in the January 2027 booklet or the 2026 annual guide.
6. **Credit points against special-rate capital income.** Can credit points reduce tax on interest, dividends or capital gains taxed at 15% or 25%? This matters for low-income savers. Not found. Probably in the guide's computation chapter (p.8 s.9c) read with s.121 and the special-rate sections, or a Tax Authority circular.
7. **60+ at source.** Does an Israeli bank withhold at the full rate from a 60+ customer, so that the bracket benefit (TXG-08) is recovered only through a return or Form 0135, or can a reduced-withholding certificate be given to the bank? Kol Zchut's page "הטבת מס מגיל 60 על רווחי הון ועל ריבית מפקדונות ומתוכניות חיסכון" returned 403; a prisha.co.il article is paywalled.
8. **Indexation on 1.1.2028.** s.120B(e)(2) indexes the 1.1.2024 amounts using "the index of tax year 2027" as the previous-year index. Does that recover the CPI rise of 2024 to 2027, or only one year's rise? Needs the exact wording of s.120B(a) and (e)(2) together, or a Tax Authority explanation.
9. **Q11 (formally closed by the statute): Tax Authority circular on the 2% surtax.** The statute (SH 3342) states the test explicitly, so the rule computes as primary. A Tax Authority circular or guidance was not located; a web search could not run (search budget). Look in the Tax Authority's 2025-2026 professional circulars list.
10. **Q16 (remaining part, for TXS and TXI): dividends and unlinked-bond gains for 60+.** s.125B reads "25%" with no "not exceeding", and the guide's list of maximum-rate fields (12, 14, 15, 22, 23, "for example") does not include the dividend fields. s.91(b)(3)(a) reads "not exceeding 15%". Whether 60+ brackets reduce tax on dividends or on unlinked-bond gains needs the exact s.125B text and the guide's dividend fields.
11. **Return deadline for tax year 2025.** The guide page read here gives 30.4.2026 for non-double-entry filers and employees and 31.5.2026 for online filers. The discovery report said 31.3.2026. The page was read from a small-print image. Check against the Ordinance s.132 and the Tax Authority's 2026 extension announcement.
12. **Surtax at source on capital income.** Do Israeli banks or brokers withhold the 3% and 2% surtax on interest or capital gains, or is it settled only in the return? Not found. Probably in the withholding regulations for securities (TXS) or a Tax Authority FAQ.
13. **Real loss (for TXS).** How is a nominal gain smaller than the inflationary amount treated (no tax and no loss, or an allowable loss)? s.88 as read does not resolve it. Probably s.88 in full and s.92 or s.94B.

Closed in this file: **Q11** (TXG-10, statute text), **Q16** for the general rule (TXG-07, TXG-08), **Q17** (TXG-17: the surtax trigger, 721,560, governs; the guide states "the lower"), **Q22** (the gov.il URL of the deductions booklet now serves the "updated April 2026" edition; checked 2026-10-22).

## Left out and why

- **Real estate** (rent tracks, betterment, purchase tax, the real-estate surtax threshold of 5,385,285): out of product scope (D2, section 4). The figure appears only in TXG-09 as a condition. The guide (p.8) and booklet (p.11) give different values (5,382,285 vs 5,385,285); not pursued.
- **Olim and returning residents** (s.14, s.134B repeal, the 2026-2030 income exemption): not part of the founder's group as described; SH 3511 pp.416-418 holds the exemption if needed.
- **Interest specifics** (s.125D, s.125E, linked vs unlinked, foreign currency): TXI.
- **Capital-gains computation, loss offsets, dividends, fund taxation, foreign tax credit**: TXS, TXF.
- **Pension, provident, study-fund figures in the booklet** (pp.6, 12-13, 19): TXP, TXH, TXK. Those files can reuse the booklet URL in this file's sources.
- **Penalties for not filing** (booklet p.15, "עיצום כספי - אי הגשת דו"ח מקוון 195ב(א) 600 לחודש פיגור"): seen but not researched; not a saving decision.
- **Business and self-employment income, VAT, crypto**: out of scope.

## Sources

| Title | Publisher | URL | Strength | Checked |
|---|---|---|---|---|
| לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה לחודש ינואר 2026 ואילך, מעודכן לאפריל 2026 (deductions booklet), pp.1-20 read | Israel Tax Authority | https://www.gov.il/BlobFolder/generalpage/income-tax-monthly-deductions-booklet/he/generalInformation_income-tax-monthly-deductions-booklet_monthly-deductions-booklet-2026.pdf | primary | 2026-10-22 |
| Same booklet, mirror copy (identical edition) | capitax.co.il | https://www.capitax.co.il/Attachments/15042026.pdf | mirror of primary | 2026-10-22 |
| דע זכויותיך וחובותיך 2025 (guide to the 2025 return), pp.1-12, 37-50, 96-99, 116-121 read | Israel Tax Authority | https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf | primary | 2026-10-22 |
| Sefer HaChukim 3342, 26.12.2024: Economic Efficiency Law (Freeze of Tax Updates and Surtax) 2024, pp.150-152 | Reshumot / Knesset | https://fs.knesset.gov.il/25/law/25_lsr_5396578.pdf | primary | 2026-10-22 |
| Sefer HaChukim 3511, 31.3.2026: Economic Efficiency Law (budget year 2026) 2026, pp.414-418 | Reshumot / Knesset | https://fs.knesset.gov.il/25/law/25_lsr_12235101.pdf | primary | 2026-10-22 |
| Income Tax Ordinance, consolidated text (raw wikitext): ss.1, 2, 88, 91, 120A, 120B, 121, 121B, 125B, 125C | Hebrew Wikisource (mirror of legislation) | https://he.wikisource.org/w/index.php?title=%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94&action=raw | primary (mirror; read through a fetch tool that paraphrases and limits quotes, so exact wording must be re-read before encoding) | 2026-10-22 |
| Income Tax (Exemption from Filing a Return) Regulations 1988: regs. 1-3, 6A, schedules | Hebrew Wikisource (mirror) | https://he.wikisource.org/w/index.php?title=%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_%28%D7%A4%D7%98%D7%95%D7%A8_%D7%9E%D7%94%D7%92%D7%A9%D7%AA_%D7%93%D7%99%D7%9F_%D7%95%D7%97%D7%A9%D7%91%D7%95%D7%9F%29&action=raw | primary (mirror) | 2026-10-22 |
| Income Tax (Withholding from Interest, Dividends and Certain Profits) Regulations 2005 | Nevo (mirror) | https://www.nevo.co.il/law_html/law01/999_549.htm | primary (mirror; fetch-tool summary) | 2026-10-22 |
| National Insurance Law [consolidated], ss.345, 348, 350, 351, 371 | Hebrew Wikisource (mirror) | https://he.wikisource.org/w/index.php?title=%D7%97%D7%95%D7%A7_%D7%94%D7%91%D7%99%D7%98%D7%95%D7%97_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99&action=raw | primary (mirror) | 2026-10-22 |
| למי שאינם עובדים ולבעלי הכנסה שלא מעבודה - שיעורי וסכומי דמי ביטוח (from 1.1.2026) | National Insurance Institute | https://www.btl.gov.il/Insurance/Rates/Pages/%D7%9E%D7%99%20%D7%A9%D7%90%D7%99%D7%A0%D7%9D%20%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D%20%D7%95%D7%91%D7%A2%D7%9C%D7%99%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%D7%A9%D7%9C%D7%90%20%D7%9E%D7%A2%D7%91%D7%95%D7%93%D7%94.aspx | primary | 2026-10-22 |
| מי שיש לו הכנסה שאינה מעבודה: חובת תשלום ושיעורי דמי ביטוח | National Insurance Institute | https://www.btl.gov.il/Insurance/National%20Insurance/type_list/income_not_from_work/Pages/HovtTaslom.aspx | primary | 2026-10-22 |
| מי שיש לו הכנסה שאינה מעבודה: landing page and "הגדרה" | National Insurance Institute | https://www.btl.gov.il/Insurance/National%20Insurance/type_list/income_not_from_work/Pages/default.aspx | primary (navigation only) | 2026-10-22 |
| לא עובד: סכום דמי הביטוח ואופן התשלום | National Insurance Institute | https://www.btl.gov.il/Insurance/National%20Insurance/type_list/NotWorking/Pages/ScomNotWorking.aspx | primary | 2026-10-22 |
| מס ירושה לא, מס נטפליקס כן: מה מתכננת ועדת המיסוי באוצר? (12.10.2026) | Calcalist | https://www.calcalist.co.il/local_news/article/skys1wkozg | secondary | 2026-10-22 |
| Tried, not usable: gov.il deductions-booklet landing page (HTTP 403) | Israel Tax Authority | https://www.gov.il/he/pages/income-tax-monthly-deductions-booklet | blocked | 2026-10-22 |
| Tried, not usable: Kol Zchut, "הטבת מס מגיל 60 על רווחי הון ועל ריבית מפקדונות ומתוכניות חיסכון" (HTTP 403) | Kol Zchut | https://www.kolzchut.org.il/he/הטבת_מס_מגיל_60_על_רווחי_הון_ועל_ריבית_מפקדונות_ומתוכניות_חיסכון | blocked | 2026-10-22 |
| Tried, not usable: prisha.co.il article on 60+ rates (paywalled) | B4 Retirement Planning | https://www.prisha.co.il/Article/שיעור-מס-רווח-הון-ריבית-יחיד-גיל-60 | not readable | 2026-10-22 |
| Tried, not usable: capitax print/1722 on NII (garbled encoding; dated 2007) | capitax.co.il | https://www.capitax.co.il/content/2/print/1722 | not readable | 2026-10-22 |
