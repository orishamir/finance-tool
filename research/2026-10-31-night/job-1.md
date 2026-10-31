# Job 1: is a foreign fund bought through an Israeli bank self-reported for tax?

Issue 43, asked in issue 30 about IE00B5BMR087. Checked 2026-10-31. Records: TXF-29 to TXF-33 in `.claude/skills/il-finance/references/tax-securities-foreign.md`.

## The answer

No. Through an Israeli bank or a member of the Tel Aviv Stock Exchange the bank withholds, also for a fund on a foreign exchange. Self-reporting belongs to a foreign broker, where the money does not pass through an Israeli withholder.

No Tax Authority sentence names a foreign fund bought on a foreign exchange. The answer comes from reading the law, the regulations, the Tax Authority's 2025 guide and form 1322 together. They all point the same way and nothing read points the other way. The closest single sentence is form 1322 note 2(ב), whose example of "not fully withheld" is securities "שנמכרו בחו"ל שלא דרך המנכים".

| Point | Answer | State |
|---|---|---|
| Gain on sale | The bank withholds 25% of the real gain. No half-yearly report, no advance. | Settled (TXF-29) |
| Dividend of a distributing fund organised as a company (Irish plc) | The bank withholds 25%, on the whole payment for an Irish fund. No 30 April advance. | Settled (TXF-30) |
| Same, fund organised as a trust or contractual fund | The regulation says "דיבידנד על מניות". | Open (question 19) |
| Same, bond fund | Interest or dividend is not stated. | Open (question 14, older) |
| Accumulating fund: who withholds | Unchanged. Nothing is paid, so nothing is withheld until the sale. | Settled (TXF-31) |
| Accumulating fund: no tax before the sale | Still a reading by implication, with the caution kept. This job does not touch it. | Open (question 1, founder's decision F4 in `coverage.md`) |
| Currency: does the bank measure the gain by the exchange rate | The regulations say "real gain" and nothing on currency. Meitav says it does (its own page). | Open (question 15, narrowed) |
| A firm that is neither a bank nor a TASE member | Not stated. Each firm's status must be checked. | Open (question 18) |

## What a person does each year

Nothing because of the fund. If the person is otherwise exempt from filing, they file nothing: sales up to 2,810,000 NIS turnover with the tax fully withheld, foreign income fully withheld up to 375,000 NIS, and no trigger such as surtax (TXF-32, TXG-17, TXG-18). They should ask the bank for form 867 (the regulations say by 20 March) and keep it, because withheld tax counts only against that form.

A person who files anyway copies the gain from form 867 to form 1322, and claims any foreign tax on a separate form. Filing is also how a loss is carried to later years. Whether a foreign fund at an Israeli bank counts as a "foreign asset" for the 2,086,000 NIS filing trigger is open (question 21); it matters only above that value. If the tax was not fully withheld, TXF-22 applies.

## What this means for international funds on the indices page (issue 30)

- The "דיווח עצמי למס" label is wrong on IE00B5BMR087 for a holding through an Israeli bank or investment house that is a TASE member. It is right at a foreign broker.
- The site puts the label on the whole "abroad" option (`site/app/lib/labels.ts:131-132`), while the neighbouring label "נקנית בחו״ל" says the fund is bought through a bank or investment house (`site/app/copy.ts:3670`). The two contradict each other. The label belongs to the route, not the fund: `brokerLabels` (`labels.ts:161`) already adds labels for a foreign broker. Its explanation text (`copy.ts:3687`) is correct once it sits there.
- `tax-on-sale-open` stays, because question 1 is open whichever route is used.
- A change of label changes a screen, so it needs a mockup first. I changed nothing on the site.
- Job 3 can fill the funds' tax facts this way: withheld through an Israeli bank or TASE member for a sale, and for a dividend of a fund organised as a company. Trust-form funds carry open question 19.

## For the owners of other files

- Lead: TXF-29 to TXF-33 are not in `data/rules/` yet. `labels.ts:65` cites TXF-22 for the label; TXF-29 is the other half.
- Lead, `coverage.md`: add the new open questions 18 to 21. Question 15 is narrowed.
- `etfs-and-index-funds.md`: no change needed for this answer. The fund's factsheet says it is also listed on TASE, but its TASE number is unknown (ETF-27, open question 5). A TASE route falls under the 2019 letter instead (TXF-05); the withholding answer is the same.
- Already consistent: BRK-27 draws the same line on sales, and BRK-36 records Interactive Israel's own statement.

## Sources (library id, page)

- Income Tax Ordinance, Tax Authority copy, `4d9d397e88b5931d`: s.88 p.148, s.91(ד)(2ג) pp.152-153, s.164 p.238. [link](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf)
- Withholding regulations on securities 2002, consolidated, `8b5fffa5abbe8104`: regs 1, 2(א) p.1, 9, 14-16 pp.2-3, 19א pp.3-4. [link](https://www.btl.gov.il/Laws1/02_0103_100228.pdf)
- Withholding regulations on interest and dividend 2005, `2d313d18dfed9653`: reg 1 p.1, reg 2(ד) p.2. [link](https://www.btl.gov.il/Laws1/02_0103_100269.pdf)
- Repeal of the 1992 order on foreign securities, ק"ת 6449, `c10a43b96d634c6d`, file p.14. [link](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmTO82n6LewtS3~kBf4O~zss=)
- The 2002 order, as enacted, ק"ת 6218, `fff7dae4ada3e653`, file p.2. [link](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/SJCa7BPhZiMZ9l0U5Xe3n9TN+DoBVFvYjWC1z45JPDc=)
- Tax Authority guide 2025, `5012033e55e0c415`: file pp.5-6, 14-15, 48, 85. [link](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf)
- Form 1322 for 2025, `ba1ea89ad3f01c4f`, p.2 notes 2, 3, 7. [link](https://www.gov.il/BlobFolder/service/reporting-and-payment-2025-annual-tax-report-for-individuals/he/Service_Pages_Income_tax_annual-report-2026_1322-2025.pdf)
- Circular 10/2025, s.4.3, p.6. [link](https://www.gov.il/BlobFolder/policy/professional-directives-271125-1/he/IncomeTax_professional-directives-271125-1.pdf)
- Each company for itself, none settling the rule (TXF-33): [Bank Leumi](https://www.leumi.co.il/he/tax-deduction) `60211219c16065d3`, [Mercantile](https://www.mercantile.co.il/private/investments-savings/taxation/securities-taxation/) `a1d12003c0853cee`, [Meitav](https://www.meitav.co.il/trade/financial_info/stock-exchange-tax-return/) `9b89d357af3c3b37`.

## Limits and what was not checked

- The consolidated 2002 regulations list amendments up to 27.12.2017. The 2025 form and guide are later and agree.
- The current text of the 2002 order was not located (open question 20). s.164 names s.88 consideration directly, so TXF-29 does not hang on it.
- Not checked, blocked by a bot check and with no archive copy, listed in `chrome-list.md`: the form 747 page (the form itself is in the library, `d601c1c6c8627b84`, with no public link to cite), Tax Reform Committee report chapters 2 and 3 (a proposal, background only), and the form 5329 page. No rule rests on them.
- The 2019 letter on TASE foreign funds (`338ece9229e85727`) has scrambled digits in its text layer. It is cited only for section wording and only for the TASE case.
- Downloaded text held no instructions addressed to me.
- Library: page notes for this job are in the working copy of `research/library/index.jsonl`, not committed, because that file also holds another process's changes.

Nothing needs the founder from this job beyond the existing decision on accumulating funds. The site's label change goes through the lead with a mockup.
