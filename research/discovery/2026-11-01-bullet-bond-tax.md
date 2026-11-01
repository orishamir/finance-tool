# How the final payment of a bond fund with a limited period is taxed

Checked 2026-11-01. For issue #159, following `2026-11-01-bullet-bond-funds.md` section 7. Tax only. Rules are in `.claude/skills/il-finance/references/`: TXS-33 to TXS-37 and TXF-38.

**No Tax Authority text names a payment at a fund's wind-up.** That was searched and stays true. What changed: the texts join without a step between them, for an Israeli exempt fund. The answers below for Israeli funds are derived from primary texts, and no real wind-up has been read to confirm them.

## Short answers

| # | Question | Answer | Standing |
|---|---|---|---|
| 1 | Sale or redemption, for an exempt fund? | **Yes, a redemption.** Taxed and withheld as in TXS-09: up to 25% of the real gain, 25% withheld (2026) | Derived from three primary texts (TXS-33) |
| 2 | Who withholds and reports? | **The payer, at payment; for a sale of a unit the circular names the distributor.** That the distributor does so at a wind-up is inferred. The holder gets form 0867 | Read, plus one inference (TXS-34) |
| 3 | A loss at wind-up? | **An ordinary capital loss,** offset as TXS-17, TXS-18, TXS-19, TXS-30. **The tax year is missing** when the fund ends in one year and pays in the next | Derived (TXS-35); the year is open question 21 |
| 4 | Foreign-currency fund? | **The wind-up changes no index rule.** Dollar units: the exchange rate. Shekel units: CPI, unless a foreign-investment fund. The date of the rate and the payment currency are **missing** | Derived (TXS-36); open question 21 |
| 5 | Foreign fund's final payment? | **A redemption is a sale** (s.88). **A "cash distribution" from a US trust: the rule is missing** | Derived (TXF-38); open question 24 |
| 6 | A foreign broker's reporting? | **The holder reports, not the broker** (TXF-22). **Half-yearly or 30-day report for a delisted fund, and what the broker's statement shows: missing** | Read in part; open question 25 |
| 7 | Default inside a fund against direct? | **Inside an exempt fund it is not the holder's tax event;** it reaches him through the unit's price. Direct: TX2-08. **When a directly held bond that stops paying gives a loss stays open** | Derived, no text in words (TXS-37); TX2 open question 6 |

## 1. Is a wind-up payment a sale or redemption?

**The text says:**
- Fund law s.108(ה): "מפרק קרן יפדה את יחידות הקרן במועד הפירוק" ([ISA copy, file p.71](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-628ccfb552dac/Hashka01.pdf#page=71)). It covers the end of a stated period (ss.103, 107(ב)(1), file pp.69-71).
- Ordinance s.88: "קרן נאמנות", "יחידה" and "בעל יחידה" are "כמשמעותם בחוק השקעות משותפות בנאמנות" ([p.150](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=150)). This is the bridge the first research did not have: the Ordinance's "unit" is the fund law's unit.
- Ordinance s.88: "מכירה" is "לרבות ... פדיון, וכן כל פעולה או אירוע אחרים שבעקבותם יצא נכס בדרך כל שהיא מרשותו של אדם" ([p.148](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=148)).
- [Reg. 3א](https://www.btl.gov.il/Laws1/02_0103_100228.pdf#page=1): a payer to an individual holder of an exempt fund's unit, of a real gain "בשל מכירה או פדיון של יחידה, ינכה ממנו מס בשיעור של 25%".
- Circular 7/2003: the fund's track "מחייב את הקרן עד לפירוקה" ([p.4](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf#page=4)).

**I infer:** the "redeem" of the fund law is the "פדיון" of the Ordinance, so TXS-09 applies. I see no competing reading in the texts:
- A distribution (s.125ב1) is "רווחים שחילק מנהל קרן", which is not the law's word at wind-up. A distribution a manager declares beforehand would be TXS-10; no document read says one is made.
- s.93 is about a "חבר בני אדם" being wound up ([p.156](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=156)). Whether a fund is one is not stated. If it were, s.93(א)(3) says the holding "יראו כאילו נמכרו", still a sale.

**Companies, for their own products only:** Yalin's footnote, "במועד פדיון היחידות", agrees but does not speak of a wind-up. The index editor's statement that tax falls at "מכירה של הקרן או פירוקה" (Funder 185866) is not relied on.

## 2. Who withholds and reports

**The text says:**
- s.164: "בשעת התשלום" ([file p.238](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=238)).
- [Reg. 1](https://www.btl.gov.il/Laws1/02_0103_100228.pdf#page=1): the payer includes an "מוסד כספי ... שבאמצעותו משתלמים התמורה או התשלום" and a "חייב כהגדרתו בצו קרנות הנאמנות".
- The [2002 order, s.1](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/SJCa7BPhZiMZ9l0U5Xe3n9TN+DoBVFvYjWC1z45JPDc=#page=18) (file p.18): it adds "וכן קרן נאמנות המשלמת לבעל יחידה תשלומים". Read as enacted, in a scan's text layer.
- Circular 7/2003 s.4.6 ([pp.21-22](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf#page=21)): on the gain from selling a unit the duty "חלה על המפיץ (חבר הבורסה דרכו נמכרת היחידה)"; on a payment to the holder "כגון: רווחים מחולקים" it "תחול על הקרן".

**I infer:** a wind-up payment is the first kind, so the bank or TASE member holding the units withholds.

**Limits:** the circular cites regulations repealed from 1.1.2006 ([ק"ת 6449, file p.2](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/yC2TN9CtZzPO8Yj5JpRxmTO82n6LewtS3~kBf4O~zss=#page=2)) and speaks of a unit "sold". The holder's side is as for any withheld sale (TXF-32, TXS-19). No real form 867 was read (open question 22).

## 3. A loss

**The text says:**
- s.92(א)(1): a loss that "אילו היה ריווח הון היה מתחייב עליו במס" ([p.155](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=155)).
- Circular 7/2003: "הפסד שנוצר לבעל יחידה ממכירת יחידה בקרן נאמנות פטורה יותר בקיזוז" ([p.12](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf#page=12)). Its "מס כנגד מס" mechanism rests on a repealed section, so s.92 governs how.
- [Reg. 9(א)](https://www.btl.gov.il/Laws1/02_0103_100228.pdf#page=2): the bank nets only what it manages, in the same tax year.

**I infer:** a wind-up loss follows TXS-17, TXS-18 and TXS-30, and against gains elsewhere it takes a return. Not against profits a fund paid (TXS-10). A taxable fund gives no loss (TXS-11).

**Missing (open question 21):** the fund law redeems at the wind-up date, withholding falls at payment, and Yalin pays "לא יאוחר מתאריך ה-15/01/2027" ([annual report p.2](https://mayafiles.tase.co.il/rpdf/1629001-1630000/P1629790-00.pdf#page=2), its own term) for a fund whose year ends in 2026. No text says which tax year holds the result, which decides whether the loss can meet a gain of the year the fund ended.

## 4. Foreign currency

**The text says:**
- s.88: "לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד" ([p.146](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=146)), and the rest of TXS-14. There is no wind-up exception.
- Circular 7/2003 s.4.1: a foreign-investment fund must meet the test "מרגע הקמתה ועד סוף ימיה"; "בעל יחידה שפדה לאחר החריגה" is taxed as in a fund that is not one ([pp.17-18](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf#page=18)).

**I infer:**
- A fund that moves to shekel cash or makam ahead of its wind-up would fail the 90% test, and no text exempts its last stretch. That reaches only shekel units of a real foreign-investment fund, and whether the 2003 regulations still operate is TXS-14's open point.
- Dollar units keep the rate under s.88 whatever the fund's status.

**The named funds (their own documents):**
- Kesem prints "דולר ארה"ב" on 5140777's row and ₪ on 5137575's and 5139050's ([p.18](https://mayafiles.tase.co.il/rpdf/1761001-1762000/P1761574-00.pdf#page=18), text layer). Its tax section explains foreign-investment funds in general and for dollar units ([pp.101-103](https://mayafiles.tase.co.il/rpdf/1761001-1762000/P1761574-00.pdf#page=101)). I found no listing naming any bullet fund as a foreign-investment fund or giving it a principal currency, so I read the two shekel (0D) funds as CPI; that is inferred from silence.
- What a Kesem (0D) fund does in its last stretch was not read; the move to shekel cash above is Yalin's document, for a shekel fund.
- 5134705 (Harel) sits in the rolling group of the funds report (3.2), so it may never wind up in this sense. Its roll was not researched.

**Missing (open question 21):** which day's rate, and in which currency a dollar unit is paid.

## 5. Foreign funds

**The text says:** s.88 "מכירה" includes "פדיון", and "נייר ערך" includes "נייר ערך שהונפק מחוץ לישראל". For its own funds, iShares says holders "will have their Shares redeemed" and that the funds are delisted "on or around that date" ([p.155](https://mayafiles.tase.co.il/rpdf/1775001-1776000/P1775855-00.pdf#page=155)).

**I infer:** a fund that redeems is a sale, with TXF-29 or TXF-22 and TXF-23 following. The fund's kept income reaches the tax base through the price, on TXF-11's reading and with its caution. None of these funds is on TASE (ETF-79), so the 2019 letter does not reach them on its terms.

**Missing (open question 24):** a US fund that ends with "a cash distribution" (Invesco's own wording). s.88's catch-all and s.93(א)(3) both lean to a sale, but how such a trust is classified is already open (TXF open question 23) and a distribution on such a fund is open too (TXF open questions 14 and 19). I stop there. The US side was not read.

## 6. A foreign broker

**The text says:** s.91(ד)(2ג)(ב) ([file pp.152-153](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=152)) puts the half-yearly report on the seller, and the opening words in (א) speak of a security "הרשום למסחר בבורסה".

**Missing (open question 25):**
- Whether a redemption after delisting goes there or in the 30-day report of s.91(ד)(1).
- Whether a sub-fund's end is a liquidation under s.91(ד)(2ד), with its own 30-day notice.
- What the broker's statement shows. No Israeli text read puts a duty on the broker.

## 7. A default

**The text says:** "הכנסותיה ורווחיה של קרן נאמנות פטורה פטורים ממס" ([s.129ג(א)(1), p.208](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf#page=208)). The holder is taxed on the unit (TXS-09). s.129ד is a taxable fund's rule.

**I infer:** a default inside the fund makes no sale of the holder's and no loss of his until the unit is sold or redeemed; then it is one figure across all the fund held. No sentence says so. A direct holder has TX2-08, and TX2 open question 6 keeps its two points (when a bond that just stops paying gives a loss; withholding in a settlement). Nothing new on those.

**Missing (open question 23):** tax on money recovered after the units were redeemed. The fund law ends asset sales by the wind-up date (s.109(א), file p.71).

## Searched and not found

- Library-wide scan of every stored document for wind-up words within 160 characters of tax words: nothing on a fund.
- Word search for wind-up words ("פירוק" and its forms), none on a fund's payment: circular 7/2003, circular 22/2002, circular 10/2025, the 2019 foreign-fund letter, the 2002 withholding and computation regulations, form 1322, the 2025 guide. The only hit about a fund is the "עד לפירוקה" line quoted in section 1.
- Web searches restricted to gov.il, taxes.gov.il, capitax.co.il and isa.gov.il, and open searches: no Tax Authority text, no ruling. The rulings database itself was not searched in this pass.

## Pages for Chrome

- Maya: wind-up notices for a fund ending in 2026 (Kesem 5138565, Yalin 5137492), already listed in the funds report. They may say how the payment and its tax run; that would be those companies' evidence and would help open question 22.
- The Tax Authority's rulings database, titles with "פירוק" and "קרן נאמנות" (`secapp.taxes.gov.il`).

## Sources not re-read

Invesco's UCITS supplement and US list are quoted from the funds report (section 4), not re-read here.
