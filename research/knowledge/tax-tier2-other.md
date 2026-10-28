# Tax on tier-2 instruments: FX deposits and FX cash, structured deposits, corporate bonds, REITs, gold funds, managed portfolios

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/tax-tier2-other.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: tax-specialist
Serves: `docs/product.md` 3.1 (the tier-2 "not covered yet" page: what is known, what is open, why; D2), 3.3 (dimension checklist), 3.8 (rule base and open list), D10 (strength policy decides what may compute). Roadmap: R1 (tier-2 page), R5 (D2 graduation of each instrument).
Scope: income tax for an Israeli-resident individual (not a substantial shareholder, not in business) on: foreign-currency (FX) deposits and FX current-account balances, including the withholding side of tax report Q2 and the olim and returning-resident exemptions; foreign currency held as cash; structured deposits; corporate bonds and commercial paper (interest and gain by linkage, discount, default and write-off); REITs (distributions by source of income, sale of units); gold through Israeli and foreign funds and ETFs (Q9, funds only); managed and robo portfolios (fees against gains, withholding by the custodian).
Out, and where it is: shekel deposits, makam, government bonds, the "index" and linkage rules for interest, the withholding regulations in general (`tax-interest-deposits-bonds.md`, TXI); Israeli mutual funds, exempt vs taxable funds, general loss and withholding rules for securities (`tax-securities-israeli.md`, TXS); foreign securities, the s.88 exchange-rate index for securities, foreign tax credit, foreign-broker reporting (`tax-securities-foreign.md`, TXF); brackets, surtax, filing, National Insurance (`tax-general.md`, TXG); what each product is, who offers it and its fees (`fx-and-structured-deposits.md` FXD, `corporate-bonds.md` CORP, `reits-and-gold-funds.md` RG, `managed-and-robo-portfolios.md` MGD); physical gold, P2P, crypto (out of product scope, D2).

How sources were read: the Income Tax Ordinance was read on the Hebrew Wikisource consolidated text (`?action=raw`, about 920,000 characters) through a fetch tool that returns quotes of at most 125 characters and paraphrases the rest. Hebrew in quotation marks below was returned verbatim by that tool; everything else is a close translation. The Tax Authority 2025 guide and the bank PDFs were read as page images. Exact wording must be re-read before encoding (open question 17). Where a rule is my reading of two texts together rather than a sentence in one source, it says "derived".

## Summary

- **FX deposits.** For an asset linked to or denominated in foreign currency, the law's "index" is the exchange rate. An FX deposit is therefore a "linked" deposit: the exchange-rate gain on the principal is exempt linkage, and only the profit above it is taxed, at up to 25% (TXI-04 closed the bucket; TX2-01). Banks withhold 25% in practice (two banks' own documents), although the withholding regulations' definition of the index does not obviously cover deposits (TX2-02). Olim are exempt on FX-deposit interest for 20 years and returning residents for 5 years, under conditions (TX2-03).
- **FX cash.** The exchange-rate gain on a balance at a bank is exempt linkage, on my reading (TX2-04). FX held outside a bank (banknotes, cash at a foreign broker) has no sourced rule.
- **Structured deposits.** Taxed as deposits, not as securities: losses on a securities portfolio cannot be offset against them (one bank says so in its product page). The rate depends on how the payout is linked, and the classification was not found in any official source (TX2-05).
- **Corporate bonds and commercial paper.** Same rules as government bonds: unlinked, 15% on nominal interest and gain; CPI-linked, up to 25% on real interest and gain; FX-linked, the exchange rate is the index (TX2-06, TX2-07). A redemption or waiver in a default is a "sale", so a capital loss arises and is offset under the normal rules (TX2-08, derived).
- **REITs.** Pass-through: the distribution keeps the character of the fund's income. Residential rent 20%, "extraordinary income" 70%, depreciation-equivalent amounts as capital gain, other income (for example commercial rent) at the person's ordinary rates, starting at 31% under age 60, and withheld at the top s.121 rate (TX2-09, TX2-10). Selling units is a capital gain; a loss on sale can also absorb same-year REIT distributions (TX2-11).
- **Gold funds.** No gold-specific rule found. An Israeli gold fund is taxed as an Israeli fund under its prospectus tax track (TX2-13). A foreign gold ETF or ETC is a foreign security, but whether an ETC counts as a bond, and how a grantor-trust ETF is treated, are open (TX2-14).
- **Managed portfolios.** No separate tax regime found: the person is taxed on the securities in the portfolio, and the custodian bank or TASE member withholds (TX2-15). Management and custody fees for securities transactions in the same tax year reduce the gain. Whether a portfolio-management fee qualifies is not confirmed (TX2-16).

## Rules

### TX2-01 FX deposits: the exchange rate is the index; exchange-rate gain on the principal is exempt, the profit above it is taxed at up to 25%
- Rule: For interest, "index" means the CPI, "ובנכס שערכו צמוד למטבע חוץ או שהוא נקוב במטבע חוץ – שער המטבע". The Tax Authority guide applies this to bank deposits: for a deposit linked to or denominated in foreign currency the index is the exchange rate, and a deposit counts as "not linked" only if it is not fully linked. On a linked deposit, the profit above the rise in the index is taxed at up to 25%. The exchange-rate gain itself is a linkage differential: the Ordinance defines "הפרשי שער" as "סכום שנוסף עקב שינוי בשער החליפין לקרן מילווה, שהיא פקדון במטבע חוץ", and "for exemption purposes" linkage differentials are "כל סכום שנוסף לחוב או לסכום תביעה" "עקב הצמדה לשער המטבע או למדד המחירים לצרכן, לרבות הפרשי שער". s.9(13) exempts linkage differentials an individual receives on an asset if they are not partial, no interest or linkage expense was claimed on the asset, and they are not business income.
- Conditions / exceptions: This rule adds the exemption of the exchange-rate gain to TXI-04 and TXI-05, which already closed Q2 for the interest bucket; it does not repeat them. The TXI-06 exclusions (business income, an employee of the bank where the rate was not set in good faith, and so on) send the interest to marginal rates. A fall in the foreign currency against the shekel: whether the negative exchange difference reduces the taxable interest, or is simply lost, was not found (open question 1). Age 60 and over: 25% is a maximum rate (TXI-19, TXG-07, TXG-08).
- Figures: up to 25% of interest above the exchange-rate change (tax year 2026; fixed in law, s.125C(b)).
- Source: [Income Tax Ordinance, consolidated text, Hebrew Wikisource](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.125C(a) definition of "מדד", s.1 definitions of "הפרשי הצמדה", "הפרשי שער" and "פיקדון", s.9(13) · checked 2026-10-22 · primary (mirror). [Tax Authority, "דע זכויותיך וחובותיך 2025"](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.40, paragraph "אופן הצמדה" and fields 21-23; printed p.52, section ג.1 ("בפקדונות ובתוכניות חסכון הצמודים למדד, הפרשי ההצמדה פטורים ממס") · checked 2026-10-22 · primary (page image)
- Dimensions: `currency`, `real-vs-nominal`, `tax-during`, `tax-at-exit`
- Likely to change: no

### TX2-02 FX deposits: banks withhold 25% in practice; the regulations' wording does not clearly support it
- Rule: Two banks' own documents say they withhold 25% from an Israeli-resident individual on FX-deposit profits. Bank Hapoalim's fixed-term FX deposit terms: profits of "יחיד תושב ישראל שאין לגביו פטור ספציפי" "חייבים בניכוי מס במקור בשיעור 25%", non-resident individuals are exempt, and "בכל מקרה המס יהיה על פי הדין, שיחול באותה עת". Bank Leumi's FX-deposit page lists "פמ"ח תושב ישראל יחיד" at 25% and says the rates are for withholding only; the final liability is set by the Tax Authority.
- Conditions / exceptions: The withholding regulations of 2005 say that a bank paying interest to an individual withholds 25%, or 15% "על נכס שאינו צמוד למדד", and they define "מדד" "כהגדרתו בסעיף 88 לפקודה". The s.88 definition uses the exchange rate only for "נייר ערך בידי יחיד, הנקוב במטבע חוץ" and for a foreign resident's purchase; a bank deposit is not a security. Read literally, an FX deposit would be "not linked" for withholding and attract 15%. The banks' practice (25%) matches the liability in TX2-01, not this literal reading. Which base the banks apply (FX interest converted at payment, or something else) is not stated in either document (open question 2). Withholding does not change the final tax, which is settled under the law in an annual return if needed (TXG-15 to TXG-17). This answers TXI open question 4 at institution strength.
- Figures: 25% withholding, resident individual; 0% non-resident individual (bank documents; Hapoalim PDF created 24.4.2023; Leumi page undated).
- Source: [Bank Hapoalim, "תנאים להפקדת פיקדון לזמן קצוב בימים"](https://bankhapoalim.co.il/sites/default/files/media/PDFS/pyqdwn_qzwb_bymym-hskm_mspty_bryt.pdf), section 2 "ניכוי במקור" (deposit in "מטבע הפיקדון", repaid to the customer's FX current account, section 3) · checked 2026-10-22 · institution. [Bank Leumi, "פיקדונות במטבע חוץ"](https://www.leumi.co.il/he/Articles/9929), table "שיעורי המס על רווחים בפיקדונות מט"ח" · checked 2026-10-22 · institution. [Income Tax (Withholding from Interest, Dividend and Certain Profits) Regulations 2005, Wikisource](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מריבית,_מדיבידנד_ומרווחים_מסוימים)), reg. 1 ("מדד", "נכס שאינו צמוד למדד"), reg. 4 · checked 2026-10-22 · primary (mirror; last amendment shown תשע"ח). s.88 "מדד": [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`, `currency`, `reporting-obligation`
- Likely to change: no

### TX2-03 FX-deposit interest exempt for olim (20 years) and returning residents (5 years)
- Rule: Interest, including exchange differences, on an FX deposit at a banking institution is exempt for a person who became an Israeli resident for the first time (oleh) if 20 years have not passed since then, and for a returning resident ("תושב חוזר") for 5 years from becoming one. Conditions, per the Tax Authority guide: (1) only money the person had abroad before becoming a resident was deposited (for a returning resident, also not from selling assets in Israel); (2) it was deposited within 90 days of transferring it to Israel; (3) the person declared their status to the bank within 14 days of first opening the deposit, on form 2402 (oleh) or 2409 (returning resident); (4) the interest is not business income and not recorded in books; (5) the deposit was not used to give, or secure, a loan to a resident relative or to a resident company the person controls.
- Conditions / exceptions: The bank does not withhold on interest covered by an exemption order (reg. 4). The withholding regulations name the orders: "צו מס הכנסה (פטור ממס על הכנסה מריבית על פיקדון במטבע חוץ), התשס״ג–2002" and "צו מס הכנסה (פטור ממס לתושב חוזר על הכנסה מריבית על פיקדון במטבע חוץ), התשס״ד–2003". The orders themselves were not read (open question 3). Leumi's page adds a minimum deposit term of three months and says a deposit used as loan collateral is taxable; neither point is in the guide. Separate exemptions exist for FX deposits funded by Nazi-persecution compensation and certain WWII disability pensions (guide p.52 section 2(א)); they are narrow and not detailed here. Whether the 2026 changes for olim (TXF-26, TXG-33) touch these orders was not checked (open question 3).
- Figures: 20 years (oleh); 5 years (returning resident); 90 days; 14 days. Fixed in the orders as described by the 2025 guide.
- Source: [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.52, section ג.2(ב) "פטור מריבית והצמדה למי שהיה לתושב ישראל לראשונה (עולה חדש)" and (ג) "ריבית והצמדה לתושב חוזר", footnotes 83-84 (ק"ת 6214, 19.12.04) · checked 2026-10-22 · primary (page image). [Withholding Regulations 2005](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מריבית,_מדיבידנד_ומרווחים_מסוימים)), reg. 1 (list of exemption orders), reg. 4 · checked 2026-10-22 · primary (mirror). [Bank Leumi, "פיקדונות במטבע חוץ"](https://www.leumi.co.il/he/Articles/9929) ("פטור ל-20 שנה מתאריך העלייה ארצה"; "פטור ל-5 שנים מתאריך החזרה לישראל") · checked 2026-10-22 · institution
- Dimensions: `age-or-use-exemption`, `eligibility`, `currency`, `reporting-obligation`
- Likely to change: yes. Olim benefits were changed for arrivals from 2026; re-check the orders.

### TX2-04 FX current account and FX held as cash
- Rule: Derived. A "פיקדון" in the Ordinance is "סכום שהופקד בתאגיד בנקאי, או במוסד בנקאי מחוץ לישראל המתנהל על פי הדין". An FX balance in a current account at an Israeli bank is such a sum, so its exchange-rate gain is "הפרשי שער" and exempt under s.9(13) on the same conditions as TX2-01. Any interest a bank pays on it is withheld like deposit interest (TXI-08, reg. 4: any interest a bank pays an individual).
- Conditions / exceptions: (a) That a current-account balance is a "פיקדון" for s.1 is my reading of the definition; no source says it for current accounts. (b) FX held outside a bank has no sourced rule. The s.88 "נכס" covers "כל רכוש, בין מקרקעין ובין מטלטלין" and excludes an individual's movables for personal or family use; the definition neither names nor excludes currency, and no s.97 exemption for currency was found. The s.88 exchange-rate index applies only to securities held by an individual. So for banknotes, and for FX cash held at a foreign broker that is not a bank, it is open whether a conversion gain is a capital gain, how it is measured, and whether a loss is allowable (open question 4; also TXF open question 4). (c) Exchange-rate losses on a bank balance: no source found on whether they can be used.
- Figures: none.
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.1 "פיקדון", "הפרשי שער", "הפרשי הצמדה"; s.9(13); s.88 "נכס", "מדד" · checked 2026-10-22 · primary (mirror; derived)
- Dimensions: `currency`, `tax-during`, `tax-at-exit`
- Likely to change: no

### TX2-05 Structured deposits: taxed as a deposit; the rate depends on how the payout is linked
- Rule: A structured deposit is a bank deposit. Its return is interest, or linkage differentials, under the deposit rules (TXI, TX2-01), not a capital gain on a security. Mizrahi Tefahot's product page for its two-year S&P 500 structured deposit says: "מס: ייגבה על פי דין" and that a structured deposit is classed as a deposit for tax, "ולפיכך לא יותר קיזוז מס בין הפיקדון המובנה לבין תיק ני"ע של הלקוח". A securities loss therefore cannot be offset against it, consistent with TXI-17. Leumi's page for a one-year shekel deposit paying the higher of USD linkage or 1% says the bank withholds "על פי דין" and "חבות המס ושיעורי המס, ככל שיחלו, עשויים להיות שונים בין המסלולים".
- Conditions / exceptions: No official source classifies the payout of a structured deposit. On the statute alone (derived): a conditional bonus paid on a nominal shekel principal looks like interest on an unlinked asset (15% of nominal, TXI-03); a payout from FX linkage on a fully FX-linked deposit is exempt linkage plus taxable profit above it (TX2-01); a payout that follows the exchange rate only above a floor may be "partial linkage", which is taxable and falls in the 15% bucket (TXI-04, TXI open question 1). Old bank terms reproduced by a deposit-news site show the withholding rate switching with the outcome: on a 2016 Leumi shekel deposit whose bonus was USD-linked, 25% of real gain if no trigger event occurred and 15% of nominal gain if it did; on a 2015 Leumi USD deposit, 25% of real gain. These are secondary and old; they show that the rate is product-specific, not what it is today (open question 5). A shekel structured deposit guarantees only the nominal principal (Mizrahi page), so the 15% bucket taxes inflation as well.
- Figures: none sourced for a current product.
- Source: [Mizrahi Tefahot, "פיקדון מובנה S&P500 לשנתיים" product page (deposit date 21.7.2025)](https://www.mizrahi-tefahot.co.il/media/sfgdrxtd/דף-מוצר-פיקדון-מובנה-sp500-072025-pikadon_sp500_biz_acc.pdf), p.2 "מס" · checked 2026-10-22 · institution. [Bank Leumi, "לאומי פיקדון שקלי לשנה" campaign page](https://www.leumi.co.il/he/Campiagn/2611) (undated) · checked 2026-10-22 · institution. Old terms: [hon.co.il, Leumi structured deposit on a consumer-stocks basket, 28.3.2016-28.9.2018](https://www.hon.co.il/?p=32162); [hon.co.il, Leumi 4-year USD structured deposit, from 29.7.2015](https://www.hon.co.il/?p=26164) · checked 2026-10-22 · secondary
- Dimensions: `tax-at-exit`, `real-vs-nominal`, `loss-offset`, `currency`
- Likely to change: no (law); per product, yes

### TX2-06 Corporate bonds and commercial paper: interest by linkage
- Rule: Interest on corporate bonds and commercial paper follows s.125C like any interest: 15% of the nominal interest on an asset that is not linked, or only partly linked, to the index (TXI-03), and up to 25% of the real interest on a fully linked asset (TXI-02, TXI-05). The guide states this for traded securities: interest on a security taxed at up to 25% is reported in field 15, "אולם אם הריבית משולמת על נכס שאינו צמוד למדד או שהוא צמוד בחלקו ... תחויב במס בשיעור של 15%" (field 13). Because s.125C makes the exchange rate the index for an asset linked to or denominated in foreign currency (TX2-01), a USD-linked or USD-denominated corporate bond falls in the linked, up-to-25% bucket (derived).
- Conditions / exceptions: Withholding: a non-bank payer withholds 25%, or 15% on an unlinked asset (TXI-09); a TASE member that receives interest for its clients withholds (TXI-08). Discount on issue is interest (TXI-01). Accrued interest bought with a bond: TXI-16. Bonds issued before 8.5.2000 and interest accrued before 2012 have legacy rates (TXI-10). A same-year securities loss can absorb corporate-bond interest taxed at no more than 25% (TXI-17, TXS-17). The TXI-06 exclusions apply, including a substantial shareholder in the issuer.
- Figures: 15% / up to 25% (tax year 2026; 15% can be changed by ministerial order, TXG-32).
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.125C(a)-(c) · checked 2026-10-22 · primary (mirror). [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.39, section "1. ריבית על ניירות ערך (למעט אג"ח/ני"ע זרים)" and section "2. ריבית על אגרות חוב", items 2 and 4 · checked 2026-10-22 · primary (page image)
- Dimensions: `tax-during`, `real-vs-nominal`, `currency`
- Likely to change: yes, the 15% by order (TXG-32)

### TX2-07 Corporate bonds and commercial paper: gain on sale or redemption by linkage
- Rule: The gain on selling "איגרת חוב, נייר ערך מסחרי, מילווה או הלוואה, שאינם צמודים למדד" is taxed at up to 15% and the whole gain counts as real (s.91(b)(3)); "not linked" means the face value or amount "אינו צמוד למדד, או שהוא צמוד בחלקו לשיעור עליית המדד". A fully CPI-linked bond's gain is real capital gain at up to 25% (s.91(b)(1), TXS-01). For a bond held by an individual that is denominated in or linked to foreign currency, s.88 makes the exchange rate the index (TXS-04, TXF-03), so the bond is "linked" for s.91(b)(3) and its gain above the exchange-rate change is taxed at up to 25% (derived from the two definitions). "Commercial paper" takes its meaning from the Securities Law (s.88).
- Conditions / exceptions: Withholding at sale by the bank or TASE member: 25% of real gain, or 15% of the gain on an unlinked security (TXS-05, TXI-12). Redemption is a sale ("מכירה" includes "פדיון"). How the price of a bond bought below par is split between discount (interest) and capital gain is open (TXI open question 3). Substantial shareholder: up to 20% on unlinked debt.
- Figures: up to 15% / up to 25% (tax year 2026; 15% can be changed by order, s.91(b)(3)(b)).
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.91(b)(3)(a), (c); s.88 definitions "מדד", "נייר ערך", "נייר ערך מסחרי", "מכירה" · checked 2026-10-22 · primary (mirror; FX part derived)
- Dimensions: `tax-at-exit`, `real-vs-nominal`, `currency`
- Likely to change: yes, the 15% by order (TXG-32)

### TX2-08 Corporate bonds in default: redemption, waiver and debt-for-equity are sales; the loss is a capital loss
- Rule: Derived. "מכירה" includes "חליפין, ויתור, הסבה, העברה, הענקה, מתנה, פדיון" (excluding inheritance). A redemption below cost, a waiver of part of the debt in a debt settlement ("הסדר חוב"), and an exchange of bonds for shares are each a sale. Where the consideration is below cost, the result is a capital loss, offset under s.92: first against capital gains, in the same year also against securities interest and dividends taxed at up to 25%, and carried forward against capital gains only if a return was filed (TXS-17, TXS-18). When a redemption on which discount fees are also paid creates a capital loss, the discount fees are added to the redemption proceeds up to the loss, for a holder who is not a controlling holder and did not hold the bond since issue (TXI-13).
- Conditions / exceptions: No provision on unpaid or written-off bonds was found in ss.88-101A: no "חוב אבוד" or debt-settlement rule for a private bondholder. Open: when the loss arises if the bond is not redeemed and simply stops paying (no sale event), how unpaid accrued interest is treated, and how the bank withholds and nets in a settlement (open question 6). A loss on an unlinked bond offsets gains taxed at 25% shekel for shekel, which is worth more than the 15% the gain would have borne; no rule limiting this was found.
- Figures: none.
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.88 "מכירה"; s.92(a)(1), (a)(4), (b) · checked 2026-10-22 · primary (mirror; derived). [Income Tax (Computation of Capital Gain on Sale of a Traded Security, State Loan or Mutual-Fund Unit) Regulations 2002, Wikisource](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(חישוב_רווח_הון_במכירת_נייר_ערך_הנסחר_בבורסה,_מילווה_המדינה_או_יחידה_בקרן_נאמנות)), reg. 4 ("בפדיון של איגרת חוב, מילווה מדינה או מילווה קצר מועד ... שבו משולמים גם דמי ניכיון") · checked 2026-10-22 · primary (mirror; last amendment shown ק"ת תשס"ד 128)
- Dimensions: `loss-offset`, `tax-at-exit`
- Likely to change: no

### TX2-09 REIT distributions to an individual: taxed by the source of the fund's income
- Rule: A REIT ("קרן להשקעות במקרקעין") is pass-through. "לצורך חישוב המס, שיעורי המס וקיזוז ההפסדים, תיחשב ההכנסה החייבת של קרן להשקעות במקרקעין" passed to shareholders as their taxable income, taxed when passed to them. The character of the income follows its source in the fund. Rates in the shareholder's hands:
  - "הכנסות חריגות יחויבו במס בשיעור של 70%, בלא זכאות לפטור, לניכוי לזיכוי או לקיזוז".
  - Taxable income from income-producing residential rental property ("מקרקעין מניבים לצורכי דיור להשכרה") that is not short-term-held, and real gain on selling it: "יחויבו במס בשיעור של 20%".
  - Gain on selling short-term-held property: s.121 or s.126 rates.
  - "הכנסה בסכום הוצאות הפחת, יראו אותה כהכנסה מרווח הון או משבח, לפי הענין", and so are amounts passed beyond the fund's taxable income and depreciation.
  - Everything else, for example rent from offices, retail or logistics, is taxed at the person's ordinary s.121 rates, and "ההכנסה לא תיחשב כהכנסה מיגיעה אישית". For a person under 60 that schedule starts at 31%; at 60 or over the lower brackets apply (TXG-03, TXG-04).
- Conditions / exceptions: Income the REIT kept and was taxed on itself, when later distributed, is treated as a dividend (TX2-10). Foreign taxes paid by the REIT are deducted from the related income and give shareholders no credit, and the REIT's losses cannot be offset against shareholders' income (s.64A4, per the fetch tool's summary). The residential definition covers property bought from 7 June 2016 to 31 December 2033. Derived: because REIT income is not personal-effort income, it counts as capital-source income for the 2% surtax (TXG-10). Whether National Insurance and health contributions apply to REIT rent passed through is open: TXG-27 exempts s.125B dividends and s.122 rent, not REIT income (open question 8). The share of each source in a given REIT's distribution is a fund fact (`reits-and-gold-funds.md`).
- Figures: 70%; 20%; ordinary rates from 31% (under 60, 2026; frozen to 2027, TXG-06). Residential window 7.6.2016-31.12.2033. Fixed in law.
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.64A2 (definitions "מקרקעין לצורכי דיור להשכרה", "הכנסות חריגות", "מקרקעין המוחזקים לתקופה קצרה"), s.64A4(a)-(h) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`, `distribution-policy`, `age-or-use-exemption`
- Likely to change: no

### TX2-10 REIT distributions: withholding by the fund
- Rule: "בעת תשלום ההכנסה החייבת של בעלי המניות תנכה קרן להשקעות במקרקעין מס": from capital gain or betterment (except on short-term-held property), at the s.91 rates or the Land Taxation Law s.48A rates; from residential rental income and real gain on such property, 20%; "מהכנסות חריגות – בשיעור של 70%"; "מהכנסה חייבת אחרת – בשיעור המס המרבי הקבוע בסעיף 121 או בשיעור מס אחר שקבע שר האוצר באישור ועדת הכספים של הכנסת". The assessing officer may allow in writing that no tax, or less, be withheld (s.64A5(d)). Income taxed at fund level and later distributed: "יראוה כהכנסה מדיבידנד", withheld as a dividend (25% for an individual, TXS-16).
- Conditions / exceptions: The top s.121 rate in 2026 is 47% (TXG-02). A person under 60 whose ordinary rate on this income is 31% or 35% is therefore over-withheld on the "other income" part and gets the difference back only through an annual return or a lower-withholding approval (derived from TXG-25). Whether the Minister has set a different rate for this category was not found (open question 7). A bank or TASE member may withhold instead of the fund with the Director's approval.
- Figures: 20%; 70%; top s.121 rate (47% in 2026); s.91 rates (2026).
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.64A5(a)(1)-(3), (c)(1), (d) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-during`, `reporting-obligation`, `distribution-policy`
- Likely to change: no

### TX2-11 Selling REIT units: capital gain; a loss on sale can absorb same-year REIT distributions
- Rule: REIT shares are listed shares, so a sale is taxed under the securities capital-gains rules: up to 25% of real gain, withheld by the bank or TASE member (TXS-01, TXS-05). In addition: "הפסד שהיה בשנת המס לבעל מניה במכירת מניה בקרן להשקעות במקרקעין, ניתן לקיזוז כאמור בסעיף 92", or against "ההכנסה החייבת של בעלי המניות שהקרן העבירה אליו באותה שנה", except extraordinary income.
- Conditions / exceptions: REIT status requires TASE listing within 24 months of incorporation (extendable to 48), ownership-concentration limits, and distribution of at least 90% of taxable income, generally by 30 April of the following year (ss.64A3, 64A9, per the fetch tool's summary). Those are fund facts for `reits-and-gold-funds.md`.
- Figures: up to 25% (2026).
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.64A8; s.64A3; s.64A9(a)(1) · checked 2026-10-22 · primary (mirror)
- Dimensions: `tax-at-exit`, `loss-offset`
- Likely to change: no

### TX2-12 REIT units inside an Israeli exempt mutual fund
- Rule: Tax withheld from REIT income passed to an exempt mutual fund is final: "יראו מס ששולם לפי פסקה זו כמס סופי שקרן הנאמנות הפטורה חייבת בו" (s.64A5(a)(4)). Per the fetch tool's reading of that paragraph: no withholding on capital gains from property that is not short-term-held, 60% on extraordinary income, and the s.126(a) corporate rate on other taxable income. The saver then pays the exempt-fund rules on the fund unit (TXS-08 to TXS-10).
- Conditions / exceptions: Provident funds and some other holders are exempt on REIT pass-through income (s.64A4(f)); that belongs to the wrapper tax files.
- Figures: 60%; s.126(a) rate (2026).
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.64A5(a)(4), s.64A4(f) · checked 2026-10-22 · primary (mirror; sub-rates per tool summary, re-read)
- Dimensions: `tax-during`
- Likely to change: no

### TX2-13 Gold through an Israeli mutual fund or ETF
- Rule: No gold-specific rule was found in the sections read (ss.1, 9, 64A, 88, 91, 92, 97, 125C). A gold fund registered in Israel is a mutual fund, so the general fund rules apply: its tax track (exempt or taxable) is fixed in its prospectus (TXS-07); in an exempt fund the saver pays up to 25% of real gain on redemption and 25% on distributions (TXS-09, TXS-10); switching out is a sale (TXS-21).
- Conditions / exceptions: The index for real gain depends on the unit: CPI for shekel units, the exchange rate for units denominated in or linked to foreign currency, and the principal currency only for a "foreign-investment fund" that meets the 90% test (TXS-14). Whether a fund holding physical gold, gold ETCs or gold-miner shares can meet that test is not known (open question 9). If it cannot, a shekel gold fund is measured against CPI and the shekel value of the dollar gold price is taxed as real gain. Each fund's prospectus must be read; no gold fund prospectus was reached in this session.
- Figures: as TXS-09, TXS-10.
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.88 "נייר ערך" ("לרבות ... יחידה") and "מדד" · checked 2026-10-22 · primary (mirror). Rules as cited in TXS-07 to TXS-14.
- Dimensions: `tax-at-exit`, `real-vs-nominal`, `currency`
- Likely to change: no

### TX2-14 Gold through a foreign ETF or ETC
- Rule: A security issued abroad is a "security" for capital gains, so a foreign gold ETF or exchange-traded commodity note (ETC) bought on a foreign exchange falls under the foreign-securities rules: up to 25% of real gain, with the exchange rate as the index for an FX-denominated security held by an individual (TXF-01 to TXF-03), and semi-annual reporting when nothing is withheld in Israel (TXF-22).
- Conditions / exceptions: Two classification points are open and could change the result (open question 10): (a) an ETC is legally a debt note; whether s.91(b)(3) (15% on unlinked debt) or s.91(b)(1) (25% of real gain) applies, given that an FX-denominated note is "linked" through the s.88 index, was not found; (b) some US gold ETFs are grantor trusts; whether Israel treats the holder as owning a security or as owning gold through a trust (Ordinance Part on trusts, s.75C onward) was not checked. US estate-tax exposure of US-domiciled funds: TXF-27.
- Figures: as TXF-02.
- Source: [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.88 "נייר ערך" (includes "נייר ערך שהונפק מחוץ לישראל", per TXF-01), "מדד"; s.91(b)(3) · checked 2026-10-22 · primary (mirror). Rules as cited in TXF-01 to TXF-03, TXF-22.
- Dimensions: `tax-at-exit`, `currency`, `foreign-withholding-domicile`, `reporting-obligation`
- Likely to change: no

### TX2-15 Managed and robo portfolios: taxed as the securities held; the custodian withholds
- Rule: No provision was found that taxes a managed portfolio as a separate wrapper. The person owns the securities, so each sale or redemption inside the portfolio is a sale (TXS-21) taxed under TXS, TXF and TX2-06 to TX2-14, and the bank or TASE member holding the account withholds and nets losses within the tax year (TXS-05, TXS-19). A manager's rebalancing is therefore a tax event at every sale, unlike a track switch in a provident wrapper. For first-in-first-out, "identical securities" are units or securities "מנוהלים בידי מנהל תיק ניירות ערך אחד": lots are matched per portfolio manager.
- Conditions / exceptions: Losses at a previous manager can be offset at the new one only with the assessing officer's permission (TXS-19). A portfolio held at a foreign custodian is not withheld in Israel: semi-annual reports, advances and an annual return (TXF-22). Distributions and dividends inside the portfolio: TXS-10, TXS-16, TXF-08.
- Figures: none.
- Source: [Computation Regulations 2002, Wikisource](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(חישוב_רווח_הון_במכירת_נייר_ערך_הנסחר_בבורסה,_מילווה_המדינה_או_יחידה_בקרן_נאמנות)), reg. 1 "ניירות ערך זהים" · checked 2026-10-22 · primary (mirror). [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.88 "מכירה" · checked 2026-10-22 · primary (mirror). Rules as cited in TXS-05, TXS-19, TXS-21.
- Dimensions: `switching-tax-event`, `tax-at-exit`, `loss-offset`
- Likely to change: no

### TX2-16 Managed portfolios: same-year management and custody fees reduce the gain
- Rule: "בחישוב רווח ההון במכירת ניירות ערך יותרו בניכוי מהתמורה ההוצאות שהוצאו באותה שנת מס", where expenses are "דמי ניהול ודמי משמורת ... בעד פעולות בניירות ערך". Separately, s.92(a)(5): "הוצאות בשל ניירות ערך, כפי שקבע שר האוצר באישור ועדת הכספים של הכנסת, שלא נוכו בשנת המס" "ייחשבו לענין סעיף זה כהפסד הון מניירות ערך".
- Conditions / exceptions: Whether a portfolio manager's fee is "דמי ניהול ... בעד פעולות בניירות ערך" under this definition is my reading, not a published statement. Whether the custodian applies the deduction at withholding or only in an annual return is open (TXS open question 12). Read together, the regulation (deduct this year) and s.92(a)(5) (undeducted expenses count as a securities loss) suggest that fees in a year with no gains become a loss that can be carried forward, but that link is not stated (open question 11). VAT on portfolio-management fees was not researched (open question 12).
- Figures: none.
- Source: [Computation Regulations 2002](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(חישוב_רווח_הון_במכירת_נייר_ערך_הנסחר_בבורסה,_מילווה_המדינה_או_יחידה_בקרן_נאמנות)), reg. 1 "הוצאות", reg. 6(a) · checked 2026-10-22 · primary (mirror). [Ordinance](https://he.wikisource.org/wiki/פקודת_מס_הכנסה), s.92(a)(5) · checked 2026-10-22 · primary (mirror)
- Dimensions: `fee-management-balance`, `fee-custody`, `tax-at-exit`, `loss-offset`
- Likely to change: no

## Terms

| Hebrew | English | Meaning | Where it appears | Source |
|---|---|---|---|---|
| פיקדון במטבע חוץ / פיקדון במט"ח / פמ"ח | foreign-currency deposit | Bank deposit in foreign currency; linked bucket for tax | bank app, tariff, guide | guide p.52; Leumi |
| הפרשי שער | exchange-rate differences | Amount added to a deposit or loan principal because the exchange rate changed; exempt linkage for an individual | law, statement | s.1 |
| הפרשי הצמדה | linkage differentials | Includes exchange differences; for exemption, only CPI or exchange-rate linkage | law | s.1, s.9(13) |
| פיקדון | deposit | A sum deposited at a banking corporation, or a foreign bank operating lawfully | law | s.1 |
| מדד (שער המטבע) | index (the exchange rate) | For an FX-linked or FX-denominated asset, the exchange rate replaces the CPI | law | s.125C(a); s.88 |
| עולה חדש / תושב ישראל לראשונה | new immigrant / first-time resident | 20-year FX-deposit interest exemption | bank form, guide | guide p.52 |
| תושב חוזר | returning resident | 5-year FX-deposit interest exemption | bank form, guide | guide p.52 |
| טופס 2402 / טופס 2409 | forms 2402 / 2409 | Declaration to the bank of oleh / returning-resident status, within 14 days of opening the deposit | bank branch | guide p.52 |
| פיקדון מובנה | structured deposit | Deposit whose return depends on an index, share basket or rate; taxed as a deposit | bank app, ads, product page | Mizrahi; Leumi |
| מענק מותנה | conditional bonus | The structured part of the return | product page | Mizrahi |
| קרן מובטחת (נומינלית) | guaranteed (nominal) principal | Principal returned in shekels without linkage | product page | Mizrahi |
| מוצר בסיכון מיוחד | special-risk product | Classification of a structured product under the Investment Advice Law, per the bank | product page | Mizrahi |
| איגרת חוב / נייר ערך מסחרי (נע"מ) | bond / commercial paper | Debt securities; unlinked: 15%; linked: up to 25% real | law, broker app | s.88, s.91(b)(3) |
| צמוד בחלקו | partly linked | Counts as not linked: 15% bucket | law | s.91(b)(3)(c); s.125C(c) |
| הסדר חוב | debt settlement | Restructuring of a defaulted issuer's bonds; a waiver or swap is a sale | press, TASE reports | s.88 "מכירה" (derived) |
| ויתור / חליפין / פדיון | waiver / exchange / redemption | Each is a "sale" for capital gains | law | s.88 |
| קרן להשקעות במקרקעין (קרן ריט) | REIT | Pass-through real-estate company listed on TASE | law, broker app | s.64A2 onward |
| הכנסות חריגות | extraordinary income | REIT income outside the permitted kinds; 70% | law | s.64A2, s.64A4 |
| מקרקעין מניבים לצורכי דיור להשכרה | income-producing residential rental property | REIT residential property bought 7.6.2016-31.12.2033; 20% | law | s.64A2, s.64A4(c)(3) |
| מקרקעין המוחזקים לתקופה קצרה | short-term-held property | REIT property sold early; ordinary rates | law | s.64A2 |
| הוצאות הפחת | depreciation expenses | REIT income equal to depreciation is taxed as capital gain or betterment | law | s.64A4(d) |
| מנהל תיק ניירות ערך | portfolio manager | FIFO matching is per manager | regulations | Computation Regs reg. 1 |
| דמי ניהול ודמי משמורת | management and custody fees | Same-year securities fees deductible from proceeds | regulations, statement | Computation Regs reg. 1, 6 |

## Institutions

Not applicable to a tax file. Which banks offer FX and structured deposits, which REITs and gold funds exist, and which portfolio managers are licensed belong in FXD, RG, CORP and MGD.

## Open questions

1. **FX weakening against the shekel.** If the deposit currency falls, does the negative exchange difference reduce taxable interest, create a loss, or vanish? Same question as TXI open question 6 (deflation) and TXF open question 5. Tried: s.1, s.9(13), s.125C, guide pp.40, 52. Likely in a Tax Authority FAQ or the 867 instructions for FX deposits.
2. **FX-deposit withholding base and legal basis.** Banks withhold 25% (TX2-02), but the 2005 regulations define the index by s.88, which uses the exchange rate only for securities. Which base banks use, and whether a later amendment or a Tax Authority instruction covers this, was not found. Tried: Wikisource regulations (last amendment shown תשע"ח), two bank documents. Likely in a Tax Authority instruction to banks or a later amendment in Reshumot (TXI open question 18).
3. **The olim and returning-resident FX-deposit orders.** The 2002 and 2003 orders were known only through the guide and the regulations' list. Their full conditions were not read, and it was not checked whether the 2026 olim changes amend them. Likely on Nevo or Wikisource by title.
4. **FX outside a bank: banknotes, and cash at a foreign broker.** Is a conversion gain a capital gain, measured against CPI, and is a loss allowable? Only the definitions were read; no rule was found. Shared with TXF open question 4. Likely in a Tax Authority FAQ on foreign-broker reporting or a pre-ruling.
5. **Structured-deposit classification.** No official source says whether a conditional bonus is interest on an unlinked asset (15% nominal), linkage, or partial linkage, or how a "higher of FX linkage or a fixed rate" payout is split. Old bank terms show the withholding rate switching with the outcome. Tried: two web searches; Mizrahi and Leumi pages; two hon.co.il reproductions. Likely in the current terms ("תנאי הפיקדון") of each product, which the domain file must collect, and in the Minister's definition of "partial linkage differentials" (TXI open question 1).
6. **Corporate-bond default.** Timing of the loss when a bond stops paying without a sale event; treatment of unpaid accrued interest; how banks withhold and net in a debt settlement. Tried: ss.88-101A (no bad-debt rule found) and one web search. Likely in a Tax Authority capital-market circular or a bank's tax page on "הסדרי חוב".
7. **REIT "other income" withholding rate.** s.64A5(a)(3) allows a rate set by the Minister instead of the top s.121 rate. Whether one exists, and what REITs actually withhold today, was not found. One search found no circular. Likely in a REIT's distribution report on Maya, which states the withholding per source.
8. **National Insurance and health on REIT distributions.** TXG-27's statutory exemptions name s.125B dividends and s.122/122A rent, not REIT pass-through income. Hand to `tax-general.md` (its open question 2).
9. **Gold funds and the foreign-investment-fund status.** Can an Israeli fund holding gold (physical, ETCs, miners) meet the 90% principal-currency test (TXS-14), and what tax track do current Israeli gold funds state? Tried: two searches; no prospectus reached. Likely in each fund's Part A on Maya or magna.
10. **Foreign gold ETCs and grantor-trust ETFs.** Is an ETC "איגרת חוב" under s.91(b)(3)? Is a US grantor-trust gold ETF a security or a look-through holding of gold? Not found (one search). Likely only in a pre-ruling, if anywhere.
11. **Fees in a year with no gains.** Does s.92(a)(5) turn unused same-year management and custody fees into a carried-forward securities loss? That needs a Minister's determination of "expenses", and the regulations under s.92(a)(5) were not identified.
12. **VAT on portfolio-management fees.** Whether VAT applies to the fee and at what rate was not researched; it changes the fee a saver pays. Hand to `managed-and-robo-portfolios.md`, which should record fees with or without VAT from the manager's own tariff.
13. **Robo and managed portfolios that hold funds rather than securities.** Nothing specific was found; the TXS fund rules apply. A manager's own disclosure on tax handling was not read.
14. **Corporate bonds bought below par.** The split between discount (interest) and capital gain on redemption, when there is a gain, is the same as TXI open question 3.
15. **REIT foreign holdings and partial-year property sales.** Fund-level detail; not researched.
16. **Israeli structured notes ("תעודות מובנות") and bank-issued linked bonds** were not covered: they are securities, not deposits, and fall under TX2-07 or TXS by their terms. Whether any are offered to retail today belongs in FXD or CORP.
17. **Exact wording.** All Ordinance and regulation quotes came through a fetch tool limited to 125-character quotes; the guide and bank PDFs were read as page images. Re-read before encoding into `il-finance`.

## Graduation status (D2)

What still blocks each tier-2 instrument's tax side, under D10. "Computes" means the rules are primary or institution and closed for the common case.

| Instrument | Common case | Blocking open questions |
|---|---|---|
| Foreign-currency deposit | Computes: up to 25% of profit above the exchange rate, exchange gain exempt (TX2-01), 25% withheld (TX2-02). Olim and returning residents exempt (TX2-03). | 1 (currency falls), 2 (withholding base) for an exact net figure; 3 for the olim case only. Graduation possible for the rising-currency case once 1 and 2 close. |
| FX held as cash | Bank balance computes on a derived reading (TX2-04). | 4 (banknotes, foreign-broker cash); the bank-balance reading needs one confirming source. |
| Structured deposit | Does not compute. Known: taxed as a deposit, no offset against securities (TX2-05). | 5 (classification and rate per payout type). Likely stays per-product. |
| Corporate bonds and commercial paper | Computes for a bond held and sold or redeemed normally: same rules as government bonds (TX2-06, TX2-07). | 6 (default) for the loss case; 14 and TXI open questions 3 and 5 (discount split, accrued interest) are shared with tier-1 government bonds. |
| REIT | Computes for the rates; the net depends on each REIT's split of income sources (TX2-09 to TX2-11). | 7 (withholding rate on other income), 8 (National Insurance); plus per-REIT source split data. |
| Gold via Israeli fund | Computes under the TXS fund rules once the fund's tax track and index are read from its prospectus (TX2-13). | 9 (foreign-investment-fund status, per-fund prospectus). |
| Gold via foreign ETF or ETC | Does not compute until classification is settled (TX2-14). | 10; and TXF open question 1 for accumulating structures. |
| Managed and robo portfolios | Computes as the underlying securities (TX2-15). | 11, 12 (fees and VAT), TXS open question 12 (fee deduction at withholding). Mostly a fee question, not a tax block. |

Tax questions from the discovery report: Q2 is closed for the interest bucket (TXI-04) and, at institution strength, for withholding (TX2-02); Q9 is closed for Israeli gold funds in principle (TX2-13) and stays open for foreign ETCs and grantor trusts (open question 10). Physical gold is out of scope.

## Left out and why

- Physical gold, bullion coins, VAT on gold: out of product scope (D2, Q9 restricted to funds).
- Non-residents' exemptions on FX deposits and Israeli bonds (s.9(15), 9(15D), guide p.52 section 3): the audience is Israeli residents.
- FX deposits from Nazi-persecution compensation and WWII disability pensions: narrow, noted in TX2-03 only.
- REIT fund-level taxation of retained income, short-term-held property and REIT qualification tests: fund facts, summarised only where they reach the saver.
- Convertible bonds, bonds of a company in which the saver is a substantial shareholder, and bonds held as business inventory: not a saver's path.
- Companies as holders.

## Proposed dimensions

- `payout-classification`: whether a product's return is taxed as interest, linkage, dividend or capital gain depends on its legal terms, not its marketing (structured deposits TX2-05, REIT distributions by source TX2-09, gold ETCs TX2-14). It decides the rate, the base (real or nominal) and whether losses can be offset.

## Sources

| Title | Publisher | Strength | Checked |
|---|---|---|---|
| [Income Tax Ordinance, consolidated, Hebrew Wikisource (raw)](https://he.wikisource.org/wiki/פקודת_מס_הכנסה): s.1 ("הפרשי הצמדה", "הפרשי שער", "פיקדון"), s.2(4), s.9(13)-(15D), ss.64A2-64A9, s.88 ("נכס", "נייר ערך", "נייר ערך מסחרי", "מכירה", "מדד"), s.91(b)(3), s.92(a)(5), s.125C(a)-(c) | Knesset legislation via Wikisource mirror | primary (mirror) | 2026-10-22 |
| [Tax Authority, "דע זכויותיך וחובותיך 2025"](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed pp.39, 40, 52, 116 (PDF pp.41, 42, 54, 118), read as page images | Israel Tax Authority | primary | 2026-10-22 |
| [Income Tax (Withholding from Interest, Dividend and Certain Profits) Regulations 2005](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(ניכוי_מריבית,_מדיבידנד_ומרווחים_מסוימים)), regs. 1, 4, 15 (page edited 15.9.2025; last amendment shown תשע"ח) | Wikisource mirror | primary (mirror) | 2026-10-22 |
| [Income Tax (Computation of Capital Gain on Sale of a Traded Security, State Loan or Mutual-Fund Unit) Regulations 2002](https://he.wikisource.org/wiki/תקנות_מס_הכנסה_(חישוב_רווח_הון_במכירת_נייר_ערך_הנסחר_בבורסה,_מילווה_המדינה_או_יחידה_בקרן_נאמנות)), regs. 1, 4, 6 (page edited 13.5.2025; last amendment shown ק"ת תשס"ד 128) | Wikisource mirror | primary (mirror) | 2026-10-22 |
| [Bank Hapoalim, "תנאים להפקדת פיקדון לזמן קצוב בימים"](https://bankhapoalim.co.il/sites/default/files/media/PDFS/pyqdwn_qzwb_bymym-hskm_mspty_bryt.pdf) (FX fixed-term deposit terms; PDF created 24.4.2023) | Bank Hapoalim | institution | 2026-10-22 |
| [Bank Leumi, "פיקדונות במטבע חוץ"](https://www.leumi.co.il/he/Articles/9929) (undated) | Bank Leumi | institution | 2026-10-22 |
| [Bank Leumi, "לאומי פיקדון שקלי לשנה" campaign page](https://www.leumi.co.il/he/Campiagn/2611) (undated) | Bank Leumi | institution | 2026-10-22 |
| [Mizrahi Tefahot, "פיקדון מובנה S&P500 לשנתיים" product page](https://www.mizrahi-tefahot.co.il/media/sfgdrxtd/דף-מוצר-פיקדון-מובנה-sp500-072025-pikadon_sp500_biz_acc.pdf) (deposit date 21.7.2025) | Mizrahi Tefahot Bank | institution | 2026-10-22 |
| [hon.co.il, Leumi structured deposit on a consumer-stocks basket (2016-2018)](https://www.hon.co.il/?p=32162) | Deposit-news site reproducing bank terms | secondary | 2026-10-22 |
| [hon.co.il, Leumi 4-year USD structured deposit (2015)](https://www.hon.co.il/?p=26164) | Deposit-news site reproducing bank terms | secondary | 2026-10-22 |
| Opened, not used: [Bank Hapoalim "ספרינט" terms](https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/standard-contract/sprynt.pdf) (a fixed-rate shekel deposit with exit points, 15% withholding; not structured); [Mizrahi "דובדבן" 10-year CPI-linked deposit (370)](https://www.Mizrahi-Tefahot.co.il/mizmedia/5469/370.pdf) (CPI-linked, not structured; "קרן הפיקדון אינה מובטחת" is for FXD/BANK); [leumi.co.il/Articles/9236](https://leumi.co.il/Articles/9236) (home page) | various | not used | 2026-10-22 |

Discovery report `research/discovery/tax-landscape.md` sections 0, 1, 2, 4.5, 5 and 12 were used as leads only. Its REIT summary (section 4.5) is confirmed by TX2-09 and TX2-10. Web searches used: 10.
