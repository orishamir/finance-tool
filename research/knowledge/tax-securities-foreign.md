# Tax on foreign securities and foreign-domiciled funds

> **Snapshot of 2026-10-22, not maintained.** The rule base the site reads is `.claude/skills/il-finance/references/tax-securities-foreign.md`, updated since (closed questions struck, rules re-sourced, scope added). Cite and edit that copy, never this one.

Checked: 2026-10-22 · Owner: tax-specialist
Serves: `docs/product.md` 3.1 (instrument guide, ETF and index-fund pages), 3.3 (dimension checklist: `foreign-withholding-domicile`, `distribution-policy`, `real-vs-nominal`, `currency`, `reporting-obligation`), 3.4 fund variants (Israeli tracking fund, Israeli ETF, foreign fund registered on TASE, foreign-domiciled fund), 3.2 wrapper mode (brokerage wrapper). Roadmap: R1 (rule base 3.8, 3.1, 3.3); R2 (3.2 wrapper mode); R4 (3.4 fund variants).
Scope: an individual Israeli resident (not a substantial shareholder, not an oleh within his exemption period unless stated) holding foreign shares and foreign-domiciled funds, directly at a foreign broker, through an Israeli bank or TASE member, or as a foreign fund registered for trading on TASE ("קרן חוץ"). In: capital gain and how the real gain is measured, dividends and interest from abroad, US and fund-level withholding, the foreign tax credit, withholding by Israeli intermediaries, accumulating vs distributing funds, losses, reporting duties specific to foreign holdings, US estate tax exposure. Out: Israeli-listed securities and Israeli funds, including Israeli funds that hold foreign assets (`tax-securities-israeli.md`, prefix TXS); general definitions, the inflationary amount, brackets, the 3% + 2% surtax, the 60+ rates, filing thresholds and the foreign-assets filing trigger (`tax-general.md`, prefix TXG); foreign-currency deposits (`tax-interest-deposits-bonds.md` and tier-2 `tax-tier2-other.md`); what a "קרן חוץ" is and how it is approved (`etfs-and-index-funds.md`); W-8BEN as a broker onboarding step and broker protection (`brokerage-account.md`).

Note on the law text: the Income Tax Ordinance was read from the consolidated Hebrew Wikisource text (a mirror of the law, raw wikitext, about 920,000 characters) through a fetch tool that returns quotes of up to about 120 characters. Hebrew quotes below are as returned by that tool. Exact wording must be re-read from the Knesset or Nevo text before encoding into the rule base.

## Summary

- Gains on foreign securities and foreign funds are taxed like Israeli ones: up to 25% of the real capital gain, as the top slice of income (TXF-01, TXF-02).
- For a foreign-currency security held by an individual, the "real" gain is measured against the exchange rate, not the CPI, automatically (TXF-03). A foreign fund registered on TASE uses the exchange rate only if its prospectus commits to 90% main-currency assets; otherwise the CPI (TXF-04).
- Foreign dividends: 25% in Israel (TXF-08). Foreign tax on them is credited, capped at the Israeli tax on that income, per income-type basket, with a 5-year carry-forward (TXF-17 to TXF-20).
- US withholding on US dividends to an Israeli resident is capped at 25% by the treaty with a W-8BEN; 30% without (TXF-12, TXF-13). With 25% US and 25% Israeli, the credit leaves no further Israeli tax in principle (my computation from TXF-08, TXF-12, TXF-18).
- Tax suffered inside a foreign fund (for example US withholding on an Irish fund) is not creditable in Israel (TXF-16; explicit for TASE-registered foreign funds, TXF-06).
- No Israeli rule was found that taxes a non-controlling holder on a listed foreign fund's undistributed income; the CFC regime needs Israeli control (TXF-11). Q1 and Q19 are narrowed, not closed.
- At a foreign broker nothing is withheld in Israel: semi-annual report and advance on gains, advance on dividends by 30 April, annual return (TXF-20 to TXF-22).
- More than USD 60,000 of US-situs assets (including shares of US corporations, so US-domiciled ETFs) creates a US estate tax filing duty; no US-Israel estate treaty is listed. Irish-domiciled fund shares are not US-situs (TXF-27).

## Rules

### TXF-01 Israeli residents are taxed on gains from foreign securities
- Rule: An Israeli resident is liable to tax on capital gains from selling an asset both in Israel and outside Israel. The Ordinance's "asset" covers property "בין שהם בישראל ובין שהם מחוץ לישראל", and "security" includes "נייר ערך שהונפק מחוץ לישראל".
- Conditions / exceptions: Olim and veteran returning residents have a 10-year exemption on foreign assets (TXF-26). A loss on an asset whose gain would have been exempt is not an allowable loss (TXF-23).
- Figures: none.
- Source: [Income Tax Ordinance, consolidated text, Hebrew Wikisource](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.88 definitions of "נכס" and "נייר ערך" · checked 2026-10-22 · primary. [Tax Authority, "דע זכויותיך וחובותיך 2025"](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.47, section "3. רווח הון של תושב ישראל בחו"ל": "תושב ישראל חייב במס בגין רווחי הון ממכירת נכס הן בישראל והן מחוץ לישראל" · checked 2026-10-22 · primary.
- Dimensions: `tax-at-exit`
- Likely to change: no.

### TXF-02 Rate on the real capital gain
- Rule: An individual pays tax on real capital gain at a rate "שלא יעלה על 25%", and the capital gain is treated as the highest slice of taxable income (s.91(b)(1)). The Ordinance sets no separate rate for foreign assets.
- Conditions / exceptions: Substantial shareholder 30%; age 60+ starting rates; assets bought before 2012; unlinked debt at 15%; the 3% + 2% surtax: all in `tax-securities-israeli.md` and `tax-general.md`. The Tax Authority's 2026 table of special-rate income lists "רווח הון ממכירת ניירות ערך" at 15%, 20%, 25%, 30% (guide printed p.116).
- Figures: 25%, fixed in law (s.91(b)(1)); in force for 2026.
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.91(b)(1): "יחיד יהיה חייב במס על רווח הון ריאלי כאמור בסעיף 121, בשיעור שלא יעלה על 25%, ויראו את רווח ההון כשלב הגבוה ביותר בסולם הכנסתו החייבת." · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed pp.47, 116 · checked 2026-10-22 · primary.
- Dimensions: `tax-at-exit`
- Likely to change: yes. The rate is set in the Ordinance and has been a target of budget proposals; re-check with each budget law.

### TXF-03 Real gain on a foreign-currency security is measured against the exchange rate (automatic)
- Rule: For a security held by an individual that is denominated in a foreign currency or whose value is linked to one, the exchange rate is treated as the "index" for computing the inflationary amount, so the taxable real gain is the gain in that currency. Text of the s.88 definition of "מדד": "על אף האמור, לענין נייר ערך בידי יחיד, הנקוב במטבע חוץ או שערכו צמוד למטבע חוץ, יראו את שער המטבע כמדד".
- Conditions / exceptions: This is mandatory ("יראו"), not an election. The only election in the definition is for a person who bought an asset in foreign currency while a foreign resident: "מי שבהיותו תושב חוץ רכש נכס במטבע חוץ כדין, רשאי לבקש שיראו את שער המטבע שבו נרכש הנכס כמדד". A foreign fund registered on TASE follows a different test (TXF-04). What happens when the foreign currency weakened against the shekel over the holding period (whether tax can exceed the shekel nominal gain) was not found: Q5.
- Figures: none.
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.88 definitions of "מדד", "סכום אינפלציוני" ("חלק ריווח ההון השווה לסכום שבו עולה יתרת המחיר המקורי המתואם על יתרת המחיר המקורי") and "ריווח הון ריאלי" ("ריווח ההון פחות הסכום האינפלציוני") · checked 2026-10-22 · primary.
- Dimensions: `real-vs-nominal`, `currency`, `tax-at-exit`
- Likely to change: no.

### TXF-04 Foreign fund registered on TASE ("קרן חוץ"): exchange rate or CPI as the index
- Rule: On a sale of a "קרן חוץ" unit, the index for the inflationary amount is the change in the exchange rate, provided the fund's prospectus states and commits that at least 90% of its investments in each tax year are in assets whose interest is paid by, or whose inflationary amount is computed by, the fund's main currency rate, and the fund notified TASE and committed to comply and report any change. "Main currency rate" is the foreign currency the fund chose in its prospectus. Otherwise the CPI is the index. The currency in which the fund is denominated is irrelevant.
- Conditions / exceptions: The source is a letter of the Tax Authority's capital-market taxation department to TASE, the Banks Association and the non-bank members' association, dated 4 July 2019, issued before foreign funds were first offered on TASE. Whether it is still in force was not confirmed (Q10). This differs from TXF-03, which applies automatically to a foreign-currency security held directly.
- Figures: 90% of investments, each tax year (2019 letter).
- Source: [Tax Authority, capital-market taxation department, "ניכוי מס במקור – קרנות חוץ (Foreign Funds)", 4.7.2019](http://www.capitax.co.il/Attachments/04072019.pdf) (read from the capitax.co.il mirror; no gov.il copy was reachable), section 4.1.5 · checked 2026-10-22 · primary.
- Dimensions: `real-vs-nominal`, `currency`, `tax-at-exit`, `foreign-withholding-domicile`
- Likely to change: yes. An administrative letter, not law; it can be replaced without notice.

### TXF-05 "קרן חוץ" on TASE: Israeli withholding as for a traded security
- Rule: Because a "קרן חוץ" is a "unit" under the Joint Investment Trust Law after its Amendment 23, the withholding provisions that apply to traded securities apply to it. On purchase or sale, capital-gain withholding follows the Income Tax Regulations (withholding from consideration, payment or capital gain on sale of a security, a fund unit or a future transaction), 2002. On a distribution to an individual, tax is withheld at the s.125B(1) rate (25%); to a company, at the s.126(a) rate; a foreign-resident unit holder is exempt from withholding.
- Conditions / exceptions: Under those regulations a payer ("חייב", "אדם המשלם למוכר תמורה או תשלום, בעד מכירת נייר ערך") paying an individual seller withholds "בשיעור של 25% מרווח ההון הריאלי" (reg. 2(a)) and offsets losses on securities it manages in the same tax year (reg. 9(a)). Bank Leumi's ETF page repeats the same rules, citing the same regulations.
- Figures: 25% of real gain (reg. 2(a)); 25% on distributions to individuals (s.125B(1)).
- Source: [Tax Authority letter 4.7.2019](http://www.capitax.co.il/Attachments/04072019.pdf), sections 4, 4.1.1, 4.1.2 · checked 2026-10-22 · primary. [Income Tax Regulations (withholding ... sale of a security ...), 2002, Hebrew Wikisource](https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%AA%D7%9E%D7%95%D7%A8%D7%94,_%D7%9E%D7%AA%D7%A9%D7%9C%D7%95%D7%9D_%D7%90%D7%95_%D7%9E%D7%A8%D7%95%D7%95%D7%97_%D7%94%D7%95%D7%9F_%D7%91%D7%9E%D7%9B%D7%99%D7%A8%D7%AA_%D7%A0%D7%99%D7%99%D7%A8_%D7%A2%D7%A8%D7%9A,_%D7%91%D7%9E%D7%9B%D7%99%D7%A8%D7%AA_%D7%99%D7%97%D7%99%D7%93%D7%94_%D7%91%D7%A7%D7%A8%D7%9F_%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA_%D7%90%D7%95_%D7%91%D7%A2%D7%A1%D7%A7%D7%94_%D7%A2%D7%AA%D7%99%D7%93%D7%99%D7%AA)), reg. 1(a), 2(a), 9(a) · checked 2026-10-22 · primary. [Bank Leumi, "קרן חוץ (ETF)" on its ETF page](https://www.leumi.co.il/he/ETF) · checked 2026-10-22 · institution (corroborating).
- Dimensions: `tax-at-exit`, `tax-during`, `distribution-policy`, `foreign-withholding-domicile`
- Likely to change: yes (administrative letter; regulations amendable).

### TXF-06 "קרן חוץ" on TASE: foreign tax credit only for tax on the fund's own distributions
- Rule: An Israeli-resident unit holder in a "קרן חוץ" is entitled to a credit for foreign tax "ששולם בגין חלוקת רווחים בלבד מקרן החוץ", subject to ss.199-210, provided the foreign tax on the distribution was lawfully withheld in the foreign state, actually paid to that state's tax authority and cannot be refunded to the payer in any way. The creditable foreign tax is capped at the lower of the domestic-law rate and the treaty rate (for dividends). The "foreign state" is the fund's state of origin as stated in the annex to the fund's prospectus.
- Conditions / exceptions: Tax suffered inside the fund on its underlying holdings is outside this credit (it is not tax on a distribution from the fund).
- Figures: none.
- Source: [Tax Authority letter 4.7.2019](http://www.capitax.co.il/Attachments/04072019.pdf), section 4.1.4 · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `distribution-policy`, `tax-during`
- Likely to change: yes (administrative letter).

### TXF-07 "קרן חוץ" distributions: reported on form 867ג; stated as not offsettable against securities losses
- Rule: Payments a "קרן חוץ" distributes and the tax withheld on them are listed on form 867ג. The letter adds: "הכנסה זו אינה ניתנת לקיזוז מהפסדי הון מניירות ערך".
- Conditions / exceptions: This appears to conflict with s.92(a)(4), which lets a securities loss of the year offset dividends on securities taxed at no more than 25% (TXF-23). Whether the letter means only the withholder's automatic offset or also the annual return is open (Q9).
- Figures: none.
- Source: [Tax Authority letter 4.7.2019](http://www.capitax.co.il/Attachments/04072019.pdf), section 4.1.6 · checked 2026-10-22 · primary.
- Dimensions: `loss-offset`, `distribution-policy`, `reporting-obligation`
- Likely to change: yes (administrative letter).

### TXF-08 Dividends from foreign companies and foreign funds: 25%
- Rule: Dividend income of an individual is taxed at 25% (30% for a substantial shareholder in the paying company), notwithstanding ss.121 and 126. The Tax Authority's 2026 list of special-rate income shows "דיבידנד מחברות זרות- 25%, 30%".
- Conditions / exceptions: Foreign tax on the dividend is credited (TXF-17 to TXF-19). Dividends on a foreign security can absorb a securities loss of the same year (TXF-23).
- Figures: 25% / 30%, fixed in law (s.125B); listed for tax year 2026.
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.125B(1): "דיבידנד בידי יחיד – 25%;" and (2) · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.116, "שיעורי המס מההכנסות בשנת המס 2026" · checked 2026-10-22 · primary.
- Dimensions: `tax-during`, `distribution-policy`
- Likely to change: yes (budget-sensitive rate).

### TXF-09 Interest on foreign securities: up to 25%
- Rule: "ריבית המשתלמת על ניירות ערך זרים חייבת במס בשיעור שלא יעלה על 25%" (reported in section 15 of form 1301, fields 357/257/157). Older accrual periods (before 2012) have their own rates.
- Conditions / exceptions: The text concerns interest paid on foreign securities (for example foreign bonds). Whether interest-like distributions of a foreign bond fund are treated as interest or as dividend was not checked (Q14).
- Figures: 25% (interest accrued from 1.1.2012), per the 2025 guide.
- Source: [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.39, "3. ריבית על ניירות ערך שנחשבו לני"ע זרים" · checked 2026-10-22 · primary.
- Dimensions: `tax-during`
- Likely to change: no.

### TXF-10 Israeli intermediary that receives a foreign dividend for an Israeli resident withholds 25%
- Rule: "המקבל מתושב חוץ דיבידנד על מניות בשל תושב ישראל או לזכותו, ינכה ממנו מס בשיעורים אלה: (1) שולם הדיבידנד ליחיד – 25%; (2) שולם הדיבידנד לחבר־בני־האדם – בשיעור המס המרבי."
- Conditions / exceptions: The regulation does not mention foreign tax already withheld abroad; whether the Israeli intermediary withholds the full 25% or only the difference after foreign withholding was not found (Q3, the remainder of tax-landscape Q14). At a foreign broker there is no Israeli intermediary and nothing is withheld in Israel (TXF-22).
- Figures: 25% for individuals (reg. 2(d), last amended 2012 per the text).
- Source: [Income Tax Regulations (deduction from interest, dividend and certain profits), 2005, Hebrew Wikisource](https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%A8%D7%99%D7%91%D7%99%D7%AA,_%D7%9E%D7%93%D7%99%D7%91%D7%99%D7%93%D7%A0%D7%93_%D7%95%D7%9E%D7%A8%D7%95%D7%95%D7%97%D7%99%D7%9D_%D7%9E%D7%A1%D7%95%D7%99%D7%9E%D7%99%D7%9D)), reg. 2(d) · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-during`
- Likely to change: no.

### TXF-11 No Israeli deemed-distribution rule found for a non-controlling holder of a listed foreign fund
- Rule: In the Ordinance text read, the tax events for an individual holding a foreign fund are a distribution (dividend, TXF-08) and a sale (capital gain, TXF-01 to TXF-03). The deemed-dividend rule for foreign entities (s.75B, "חברה נשלטת זרה") applies only to a "בעל שליטה" (an Israeli resident holding, directly or indirectly, alone or with another, at least 10% of a means of control) in a foreign company that meets all of these conditions ("שמתקיימים בו כל אלה"): its shares are not listed for trading on an exchange, or under 30% were offered to the public or listed ("פחות מ־30% מהמניות או מהזכויות"); most of its income or profits are passive; the foreign tax on its passive income does not exceed 15%; and more than 50% of a means of control is held by Israeli residents (or the other control tests in the same paragraph). A listed foreign ETF held by a retail investor does not fit these conditions on their face.
- Conditions / exceptions: This is my reading of the law text; no Tax Authority statement that an accumulating foreign fund is taxed only on sale was found. All 10 chunks of the consolidated Ordinance were checked by the fetch tool for any provision taxing an individual on undistributed income of a foreign fund or foreign entity he does not control; none was reported. The other attribution rules seen apply to Israeli holding companies (s.67G), closely held companies (s.62A, which excludes a "חברה נשלטת זרה"), bodies resident in the Area (s.3A), foreign professional companies (s.75B1) and trusts (s.75C onward). Under D10, the site should treat accumulating-fund taxation as open until Q1 is closed by an official statement or the founder accepts this reading.
- Figures: 10% control; 30% public float; 15% foreign tax; 50% Israeli control (s.75B, fixed in law).
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.75B(a)(1), (a)(3), (b)(1); ss.3A, 62A, 67C, 67G · checked 2026-10-22 · primary (law text; application is inference).
- Dimensions: `distribution-policy`, `tax-during`, `tax-at-exit`
- Likely to change: no.

### TXF-12 US withholding on US dividends paid to an Israeli resident: treaty cap 25%
- Rule: Under the US-Israel income tax treaty, US tax on dividends from US sources paid to an Israeli resident may not exceed "(a) 25 percent of the gross amount of the dividend paid"; 12.5% applies only when the recipient is a corporation owning at least 10% of the voting stock and the payer meets a passive-income test (Art. 12(2)). The IRS treaty table shows Israel: dividends paid by US corporations, general, 25 (footnote w: the column-6 rate applies to dividends paid by a regulated investment company, RIC, or a REIT, the latter only for an individual holding under 10%); direct dividend rate 12½; no-treaty rate ("Other Countries") 30.
- Conditions / exceptions: The treaty rate requires the payee's foreign status and treaty residence to be documented to the withholding agent (TXF-13). A US-domiciled ETF is a RIC for this purpose per footnote w; whether a given ETF is a RIC is a fund fact. The treaty gives capital gains to the state of residence (TXF-14).
- Figures: 25% (Art. 12(2)(a)); 12.5% (Art. 12(2)(b)); 30% no-treaty. General effective date 1 January 1995 (Art. 31, per the IRS text); IRS table rev. May 2023.
- Source: [US-Israel Income Tax Convention, IRS consolidated text](https://www.irs.gov/pub/irs-trty/israel.pdf), Art. 12(1)-(2) · checked 2026-10-22 · primary. [IRS Tax Treaty Table 1 (rev. May 2023)](https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf), Israel row, footnote w · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-during`, `distribution-policy`
- Likely to change: no (treaty rates); the IRS table is re-issued from time to time.

### TXF-13 W-8BEN: given to the withholding agent; otherwise 30% may apply
- Rule: A foreign person who is the beneficial owner of an amount subject to US withholding gives Form W-8BEN to the withholding agent or payer, not to the IRS. It is used to "Establish that you are not a U.S. person" and to "claim a reduced rate of, or exemption from, withholding as a resident of a foreign country" (Part II, line 9 names the treaty country). "Failure to provide a Form W-8BEN when requested may lead to withholding at the foreign-person withholding rate of 30%."
- Conditions / exceptions: Validity: from the date signed until the last day of the third succeeding calendar year, unless circumstances change; some forms remain valid indefinitely.
- Figures: 30% (no form); validity period as stated (instructions rev. 10/2021).
- Source: [IRS, About Form W-8BEN](https://www.irs.gov/forms-pubs/about-form-w-8-ben) (last reviewed 02-Oct-2026) · checked 2026-10-22 · primary. [IRS, Instructions for Form W-8BEN (rev. 10/2021)](https://www.irs.gov/instructions/iw8ben) · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `reporting-obligation`
- Likely to change: no.

### TXF-14 The US does not tax an Israeli resident's capital gains on US securities (fewer than 183 days in the US)
- Rule: For a nonresident alien present in the US fewer than 183 days in the tax year, US-source capital gains not effectively connected with a US trade or business are generally not taxed; at 183 days or more the net gain is taxed at 30% or a lower treaty rate. The US-Israel treaty exempts a resident of one state from tax by the other on gains from capital assets, unless (among other exceptions) the individual is present in the other state 183 days or more in the taxable year.
- Conditions / exceptions: Real property and US real property interests are excluded. US citizens and green-card holders are US persons and outside this file.
- Figures: 183 days.
- Source: [IRS Publication 519 (2025)](https://www.irs.gov/publications/p519), chapter 4, "The 30% Tax", "Sales or Exchanges of Capital Assets", "183-day rule" · checked 2026-10-22 · primary. [US-Israel treaty](https://www.irs.gov/pub/irs-trty/israel.pdf), Art. 15(1)(d) · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-at-exit`
- Likely to change: no.

### TXF-15 US interest paid to an Israeli resident: treaty cap 17.5%
- Rule: Interest from US sources paid to an Israeli resident may not be taxed by the US above 17.5% of the gross amount (10% for interest on loans granted by a bank, savings institution or insurance company); interest on debt guaranteed or insured by the state is exempt. The IRS table shows Israel, interest paid by US obligors, general: 17½ (footnote z).
- Conditions / exceptions: The US statutory portfolio-interest exemption and its interaction with this cap (for example for US Treasury or bond ETFs) were not read (Q13).
- Figures: 17.5% / 10%.
- Source: [US-Israel treaty](https://www.irs.gov/pub/irs-trty/israel.pdf), Art. 13(2)-(3) · checked 2026-10-22 · primary. [IRS Table 1](https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf), Israel row · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-during`
- Likely to change: no.

### TXF-16 Tax suffered inside a foreign fund is a fund-level cost, not creditable in Israel
- Rule: The Ordinance defines creditable "מסי־חוץ" as "מסים המשתלמים על ידי תושב ישראל לרשויות המס של מדינה מחוץ לישראל, על הכנסה שהופקה או שנצמחה באותה המדינה", computed as a percentage of income, excluding municipal taxes. Tax withheld from a foreign fund on its underlying holdings is paid by the fund, not by the Israeli resident. For a fund domiciled in Ireland, the US treaty rate on dividends from US corporations paid to an Irish resident is 15% (IRS table, Ireland, general column, footnote mm), against 25% for an Israeli resident holding the US shares directly (TXF-12).
- Conditions / exceptions: For TASE-registered foreign funds, the Tax Authority says this explicitly: credit only for tax on the fund's own distributions, in its state of origin (TXF-06). For a foreign-domiciled fund bought abroad, the non-creditability is my reading of the s.199 definition. Whether a given Irish fund in fact obtains the 15% rate, and whether Ireland withholds on the fund's distributions to an Israeli resident, were not sourced (Q6, Q7).
- Figures: US-Ireland dividends, general: 15% (IRS table rev. May 2023).
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.199 definition of "מסי־חוץ" · checked 2026-10-22 · primary. [IRS Table 1](https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf), Ireland row, footnote mm · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `distribution-policy`
- Likely to change: no.

### TXF-17 Foreign tax credit: what qualifies
- Rule: Foreign taxes, translated into shekels, paid on foreign income that is taxable in Israel, are allowed as a credit against Israeli taxes (s.200(a)). No credit for foreign taxes on foreign income that is exempt in Israel (s.201(a)). Foreign taxes are not deductible in computing foreign income (s.206). A person may ask not to be given the credit for a year (s.208). The Tax Authority adds: the credit is for a final compulsory tax paid abroad no later than 24 months after the end of the tax year for which it is claimed, by someone who was an Israeli resident that year; fines and interest are not tax; payments that are not direct taxes on income are excluded even if computed as a percentage of income, as are taxes paid by virtue of citizenship, digital turnover taxes, municipal tax, purchase tax, local tax, health tax and trade tax.
- Conditions / exceptions: The US-Israel treaty also obliges Israel to credit US income taxes, capped at the share of Israeli tax that US-source net income bears to total net income (Art. 26(3)). The shekel conversion follows rules the Director sets (s.240A; the "כללי מס הכנסה (המרה לשקלים חדשים של סכומים שמקורם מחוץ לישראל), התשס״ד–2003", not read: Q12).
- Figures: 24 months (guide; s.207B per the fetch tool's summary).
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), ss.199, 200(a), 201(a), 206, 207B, 208, 240A · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.83, "נספח ד' לטופס הדוח (טופס 1301)" · checked 2026-10-22 · primary. [US-Israel treaty](https://www.irs.gov/pub/irs-trty/israel.pdf), Art. 26(3) · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-during`, `tax-at-exit`
- Likely to change: no.

### TXF-18 Foreign tax credit cap: by income source ("basket"), not by country
- Rule: The credit for foreign income "ממקור פלוני" (foreign income classified by the sources in s.2, Part E or Part E3, net of allowed expenses and offset losses) is capped separately per source. For income taxed at a special rate (a rate other than s.121, which includes 25% dividends and 25% capital gains), the credit may not exceed "סכום המס החל בישראל על אותן הכנסות" (s.204(b)). For ordinary-rate income, the cap is the income ratio times the income tax on all ordinary income before the credit (s.204(a), (c)). The Tax Authority describes this as the "basket method" ("בשיטת סלים") and says excess credit cannot be moved between two baskets.
- Conditions / exceptions: The limit is per source of income, not per country; since tax year 2021 the return must name the country the income came from (TXF-24).
- Figures: none.
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.199 ("הכנסות חוץ ממקור פלוני"), s.204(a)-(c) · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.83 · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-during`
- Likely to change: no.

### TXF-19 Excess foreign tax credit: 5-year carry-forward, same source, CPI-linked
- Rule: If foreign taxes paid on foreign income from a given source exceed the credit allowed, the excess ("עודף הזיכוי") can be set against tax on foreign income "מאותו המקור בחמש השנים הבאות בזו אחר זו", CPI-linked from the end of the year it arose to the end of the year it is used (s.205A(a)).
- Conditions / exceptions: Same source only; no transfer between baskets (TXF-18). The carry-forward for companies in s.207A does not apply to individuals.
- Figures: 5 years, CPI-linked (fixed in law).
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.205A(a) · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.83 · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, `tax-during`
- Likely to change: no.

### TXF-20 Foreign tax is credited in the annual return, not against current advances; form 1324
- Rule: Taxes paid outside Israel on income produced abroad are not deducted from current advance payments; foreign tax is given as a credit under the source rules in the annual return. To claim it, the person fills appendix D of the annual return (form 1324) and attaches a document showing the tax paid abroad. Foreign taxes are not entered in the withholding part of the return ("מסים אלו יש לרשום בנספח ד בלבד").
- Conditions / exceptions: The guide's sentence on advances sits under business advance payments ("הפחתת מסי חוץ ממקדמה שוטפת"); applying it to the semi-annual securities advance (TXF-22) is my reading.
- Figures: none.
- Source: [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.117 ("ב. הפחתת מסי חוץ ממקדמה שוטפת"), p.47, p.73 · checked 2026-10-22 · primary.
- Dimensions: `reporting-obligation`, `foreign-withholding-domicile`
- Likely to change: no.

### TXF-21 Foreign dividends and interest not withheld in Israel: advance payment by 30 April; shortened route
- Rule: Individuals resident in Israel must pay advances on special-rate income produced in Israel or abroad, including "דיבידנד מחברות זרות"; for these incomes (other than residential rent in Israel) the advance is due by 30 April of the following tax year. The 2025 guide also describes a "shortened reporting" route: foreign income (income produced abroad, and gains from selling an Israeli company's security listed on a foreign exchange) from interest, dividend or capital gain on a security, on which a "מקדמת מס" was paid on payment vouchers 351 and 352 by 30 April after the tax year, can exempt the person from filing a return, up to a ceiling (375,000 NIS in the 2025 guide) and if no other reason to file exists.
- Conditions / exceptions: The ceiling and the other filing triggers are in `tax-general.md`. The p.3 text was read from a low-resolution page image; re-read before encoding (Q16).
- Figures: 30 April of the following year; 375,000 NIS (tax year 2025, guide p.3).
- Source: [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed pp.116-117 ("2. תשלום מקדמות מס בגין הכנסות בשיעורים מיוחדים בישראל ובחו"ל", "ד. מועדי התשלום"), p.3 item 3 · checked 2026-10-22 · primary.
- Dimensions: `reporting-obligation`, `tax-during`
- Likely to change: yes (ceilings frozen 2025-2027, then indexed; see `tax-general.md`).

### TXF-22 Securities sold at a foreign broker (no Israeli withholding): semi-annual report and advance
- Rule: Where tax was not withheld under s.164 on a sale of a security listed for trading on an exchange, and the seller must file a return under s.131, the capital gain is reported "ביום 31 ביולי וביום 31 בינואר של כל שנת מס" for sales in the six months before the reporting month, with an advance equal to the tax on the gain (s.91(d)(2C)(b)). The Tax Authority applies this to securities listed "בישראל או מחוץ לישראל", only to securities from which the full tax was not withheld. Sales are summarised on form 1325 (for a person whose securities were not fully withheld) and carried to form 1322.
- Conditions / exceptions: Fully withheld sales need no report (s.91(d)(2C)(a)). An annual return is required (the s.91(d)(2C)(b) duty is framed for a seller who must file; the guide says "אם לא נוכה המס כאמור, הינך חייב בהגשת דוח שנתי"). "בורסה" as defined in s.1 of the Ordinance includes foreign exchanges, per circular 04/2026 (TXF-25).
- Figures: 31 July (January-June sales); 31 January (July-December sales).
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.91(d)(2C) · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.46 ("דיווח על מכירת נכס"), p.83 (forms 1325, 1322), p.117 ("ו. דיווח ותשלום מקדמות בגין עסקאות בניירות ערך") · checked 2026-10-22 · primary.
- Dimensions: `reporting-obligation`, `tax-at-exit`
- Likely to change: no.

### TXF-23 Losses on foreign securities
- Rule: A capital loss on an asset outside Israel, which would have been taxable if a gain, is offset first against capital gains outside Israel, then as other capital losses (s.92(a)(3)); a carried-forward foreign loss is likewise offset first against foreign capital gains (s.92(b)). A loss on a security in the tax year can also offset interest or dividends paid on that security, and interest or dividends on other securities if their tax rate does not exceed the s.125B(1) or s.125C(b) rate (s.92(a)(4)). An unused loss carries forward without time limit only against capital gains, and only if a return was filed for the loss year (s.92(b)).
- Conditions / exceptions: A loss on an asset whose gain would have been exempt is not an allowable loss (guide p.47). Offset across institutions needs an annual return (`tax-securities-israeli.md`). For TASE-registered foreign fund distributions, see the contrary statement in TXF-07.
- Figures: none here; the 1 : 3.5 inflationary-amount ratio is in `tax-securities-israeli.md`.
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.92(a)(3), (a)(4), (b): "(3) היה לאדם הפסד הון במכירת נכס מחוץ לישראל, ושאילו היה רווח היה מתחייב עליו במס בישראל, יחולו עליו הוראות פסקה (1), אולם הפסד הון מנכס כאמור יקוזז תחילה כנגד רווח הון מחוץ לישראל;" · checked 2026-10-22 · primary. [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.47, "4. הפסדי הון וקיזוז רווחי הון" · checked 2026-10-22 · primary.
- Dimensions: `loss-offset`
- Likely to change: no.

### TXF-24 Return must name the country of foreign income; for securities, the country where traded
- Rule: From tax year 2021 the return must state the country from which foreign income was produced. For capital-market income reported on form 867, the country entered is the one where the security is traded; for example, interest or dividends from securities traded on NASDAQ are entered as USA. Where the source covers many countries and cannot be identified, the field "מדינה לא ידוע" is used.
- Conditions / exceptions: none stated.
- Figures: from tax year 2021.
- Source: [Tax Authority guide 2025](https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf), printed p.83, "רשימת מדינות" · checked 2026-10-22 · primary.
- Dimensions: `reporting-obligation`
- Likely to change: no.

### TXF-25 Form 150 (holding in a foreign entity): for a listed foreign entity, only a controlling holder reports
- Rule: Form 150 is an appendix to the annual return declaring rights in a foreign body ("חבר חוץ"). Foreign funds are foreign bodies for this purpose (the circular lists UCI, SICAV, SICAF, SICAR and cell companies). For a foreign body whose rights are listed for trading on an exchange, the duty applies only if the holder is a controlling holder: alone or with a relative, at least 10% of any means of control. "בורסה" here, as defined in s.1 of the Ordinance, includes exchanges outside Israel.
- Conditions / exceptions: The form is filed with the return only by someone who must file or chose to file. Olim and veteran returning residents who became residents before 1.1.2026 and fall under s.134B are exempt; those becoming residents from 1.1.2026 must file. An unlisted foreign entity is reportable at any holding.
- Figures: 10% control threshold (circular 04/2026, 18.2.2026).
- Source: [Tax Authority, income tax circular 04/2026, "אופן ההצהרה על החזקה בחבר בני אדם תושב חוץ – הנחיות למילוי טופס 150", 18.2.2026](https://www.capitax.co.il/Attachments/18022026.pdf) (read from the capitax.co.il mirror; gov.il returned 403), sections 2, 2.1, 2.1.2, 2.3, 2.3.3, 2.4.1, 2.4.1.1-2.4.1.2 · checked 2026-10-22 · primary.
- Dimensions: `reporting-obligation`
- Likely to change: yes (the form was revised in 2024 and the circular is from 2026).

### TXF-26 Olim and veteran returning residents: foreign assets exempt for 10 years; a TASE "קרן חוץ" counts as foreign
- Rule: A person who became an Israeli resident for the first time, or a veteran returning resident, is exempt from tax on a capital gain from selling an asset he had abroad, if sold within ten years of becoming a resident (s.97(b)(1)). For this purpose a TASE-registered "קרן חוץ" is treated as a security issued by a company that is not resident in Israel.
- Conditions / exceptions: Conditions of s.14(a) and the 2026 changes for new arrivals are in `tax-general.md`.
- Figures: 10 years.
- Source: [Income Tax Ordinance](https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94), s.97(b)(1) (fetch-tool summary; re-read) · checked 2026-10-22 · primary. [Tax Authority letter 4.7.2019](http://www.capitax.co.il/Attachments/04072019.pdf), section 4.1.3 · checked 2026-10-22 · primary.
- Dimensions: `eligibility`, `tax-at-exit`
- Likely to change: no.

### TXF-27 US estate tax exposure of a non-US person holding US-situs assets
- Rule: The executor of a nonresident non-citizen must file Form 706-NA when "the fair market value at death of the decedent's U.S.-situated assets exceeds $60,000". "Stock of corporations organized in or under U.S. law is property located in the United States", no matter where the certificates are; "all other corporate stock is property located outside the United States". The maximum unified credit for such an estate is in general $13,000. The look-through that treated part of RIC (US fund) stock as non-US applied only to decedents who died after 2004 and before 2012. Bank accounts not connected with a US business, securities generating portfolio interest and certain life insurance proceeds are not US-situs.
- Conditions / exceptions: Estate tax treaties can change this; the IRS list of US estate and gift tax treaties (15 countries, including Ireland for estate tax) does not include Israel. So an Israeli resident holding US-domiciled ETFs has this exposure; shares of an Irish-domiciled fund are stock of a non-US corporation. Whether a US ETF organised as a trust counts as "stock of corporations organized in or under U.S. law", and the rate schedule, were not read (Q11).
- Figures: USD 60,000 filing threshold; USD 13,000 unified credit (Form 706-NA instructions rev. 09/2025; not stated to be indexed).
- Source: [IRS, Some nonresidents with U.S. assets must file estate tax returns](https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns) (last reviewed 27-Jun-2026) · checked 2026-10-22 · primary. [IRS, Instructions for Form 706-NA (09/2025)](https://www.irs.gov/instructions/i706na), Part V "Stock" and "Stock in a regulated investment company (RIC)", unified credit · checked 2026-10-22 · primary. [IRS, FAQ on estate taxes for nonresidents not citizens](https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-estate-taxes-for-nonresidents-not-citizens-of-the-united-states) (last reviewed 20-Sep-2026) · checked 2026-10-22 · primary. [IRS, Estate & gift tax treaties (international)](https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international) (last reviewed 08-Sep-2026) · checked 2026-10-22 · primary.
- Dimensions: `foreign-withholding-domicile`, proposed `estate-situs`
- Likely to change: yes (US estate tax law; the IRS treaty list).

## Terms

| Hebrew | English | Meaning | Where it appears (app, statement, ad, law) | Source |
|---|---|---|---|---|
| רווח הון ריאלי (law: ריווח הון ריאלי) | real capital gain | Capital gain minus the inflationary amount | Law; form 867 and 1322; bank tax statements | Ordinance s.88 |
| סכום אינפלציוני | inflationary amount | The part of the gain equal to the indexation of the cost | Law; statements | Ordinance s.88 |
| מדד / שער המטבע כמדד | index / exchange rate as the index | For a foreign-currency security held by an individual, the exchange rate replaces the CPI | Law | Ordinance s.88 |
| נייר ערך שהונפק מחוץ לישראל | security issued outside Israel | Included in "security" for capital gains | Law | Ordinance s.88 |
| ני"ע זרים | foreign securities | Guide's term for foreign securities (interest at up to 25%) | Tax Authority guide, form 1301 | Guide p.39 |
| קרן חוץ | foreign fund (registered on TASE) | A foreign-law fund whose units are offered on TASE under JIT Law ch. 9.1 (s.113A) | TASE, bank apps, Tax Authority | Tax Authority letter 4.7.2019; Leumi |
| שער המטבע העיקרי | main currency rate | The currency a "קרן חוץ" chose in its prospectus for the 90% test | Prospectus; Tax Authority | Letter 4.7.2019 s.4.1.5 |
| מדינת המוצא של קרן החוץ | fund's state of origin | The state whose tax on distributions is creditable | Prospectus annex | Letter 4.7.2019 s.4.1.4 |
| דיבידנד מחברות זרות | dividend from foreign companies | Special-rate income, 25% / 30% | Tax Authority rate table | Guide p.116 |
| מסי חוץ | foreign taxes | Taxes paid by an Israeli resident to a foreign state on income produced there | Law | Ordinance s.199 |
| הכנסות חוץ ממקור פלוני | foreign income from a given source | The "basket" for the credit cap | Law | Ordinance s.199, s.204 |
| זיכוי ממסי חוץ / זיכוי מס זר / זיכוי חו"ל | foreign tax credit | Credit of foreign tax against Israeli tax | Law; form 1324; guide | Ordinance s.200; guide p.83 |
| תקרת הזיכוי | credit ceiling | Cap on the credit for ordinary-rate income | Law | Ordinance s.204(c) |
| שיעור מס מיוחד | special tax rate | Any rate other than s.121; credit capped at Israeli tax on that income | Law | Ordinance s.204(c) |
| עודף הזיכוי | excess credit | Foreign tax above the cap, carried 5 years | Law | Ordinance s.205A |
| שיטת סלים | basket method | Credit computed per income type | Guide | Guide p.83 |
| נספח ד' (טופס 1324) | appendix D (form 1324) | Foreign income and foreign tax credit appendix | Annual return | Guide pp.47, 83 |
| טופס 1325 / נספח ג(1) | form 1325 | Capital gains on traded securities not fully withheld | Annual return | Guide p.83 |
| טופס 1322 / נספח ג' | form 1322 | Summary of capital gains and losses on traded securities | Annual return | Guide pp.45, 83 |
| טופס 867ג | form 867C | Annual statement of "קרן חוץ" distributions and tax withheld | Bank annual tax certificate | Letter 4.7.2019 s.4.1.6 |
| מקדמה / מקדמת מס | advance payment | Semi-annual (securities) or by 30 April (special-rate income) | Tax Authority | Ordinance s.91(d)(2C); guide pp.3, 116-117 |
| דיווח מקוצר; שוברים 351, 352 | shortened reporting; vouchers 351, 352 | Paying advances on foreign interest, dividends or gains to avoid a full return within a ceiling | Tax Authority | Guide p.3 |
| טופס 150; חבר חוץ; בעל שליטה | form 150; foreign body; controlling holder | Declaration of holdings in a foreign entity; 10% control for listed entities | Annual return | Circular 04/2026 |
| חברה נשלטת זרה | controlled foreign company (CFC) | Israel's anti-deferral regime; needs Israeli control | Law | Ordinance s.75B |
| דיבידנד רעיוני | deemed dividend | Undistributed CFC profits attributed to a controlling holder | Law; guide p.116 | Ordinance s.75B(b) |
| Form W-8BEN | Certificate of Foreign Status of Beneficial Owner | Given to the US withholding agent (broker) to claim the treaty rate | Foreign broker onboarding | IRS |
| U.S.-situs / U.S.-situated assets | US-situs assets | Assets in the US estate-tax base of a non-US person | IRS | IRS 706-NA instructions |

## Open questions

1. **Q1 (narrowed, not closed): accumulating foreign funds.** No Tax Authority statement found that an accumulating foreign fund (for example an Irish UCITS) is taxed only on sale. The full Ordinance was scanned chunk by chunk and no attribution rule for non-controlling holders was reported (TXF-11), but the scan was done through a fetch tool that summarises. Tried: Ordinance text; Tax Authority guide 2025; circular 04/2026; the 2019 "קרן חוץ" letter. Likely answer: a Tax Authority capital-market department letter or a pre-ruling; the circulars index on gov.il (blocked, 403). Under D10, keep the accumulating variant's tax dimension blocked until closed or until the founder accepts TXF-11 as sufficient.
2. **Q19 (narrowed): PFIC-like rule.** The only anti-deferral regimes found (s.75B CFC, s.75B1 foreign professional company) require control. No passive-foreign-fund regime for minority holders was found. Same sources and caveat as Q1.
3. **Q14 residual: Israeli withholding on top of foreign withholding.** Reg. 2(d) of the 2005 withholding regulations says an Israeli recipient of a foreign dividend for an Israeli resident individual withholds 25% and says nothing about foreign tax already withheld. Whether banks withhold 25% in full, or 25% minus the foreign tax (for example after US 25%), is not sourced. Likely in a Tax Authority directive to banks or a bank's tax-certificate explanation; gov.il blocked; web search budget exhausted in this session.
4. **FX gain on the cash leg.** No provision in Part E (ss.88-103) on gains from holding or converting foreign currency itself was found; s.1 "הפרשי שער" covers deposits and loans in foreign currency. How an individual's FX gain on cash held at a foreign broker between trades is taxed is not sourced. Check s.2(4), the s.9 exemptions, and Tax Authority guidance; also relevant to `tax-tier2-other.md`.
5. **Currency weakening against the shekel.** How the real gain under TXF-03 is computed when the foreign currency fell against the shekel (whether a "negative inflationary amount" exists, whether tax can exceed the shekel nominal gain, whether a shekel loss with a currency gain is taxable). Only the s.88 headline definitions were read. Check the full s.88 definitions of "יתרת המחיר המקורי המתואם" and "סכום אינפלציוני", and any Tax Authority example.
6. **Ireland-side tax on an Irish fund's distributions to an Israeli resident, and the Israel-Ireland treaty.** Revenue.ie page tried (404); the Tax Authority's treaty page on gov.il returned 403 (https://www.gov.il/he/departments/dynamiccollectors/tax-treaties). Needed for distributing Irish funds.
7. **What US withholding an Irish fund actually suffers.** The IRS table gives 15% for US dividends paid to Irish residents; whether a given Irish UCITS qualifies, and what its prospectus says, was not reached (iShares plc prospectus URL redirected to an error page). Needs each fund's prospectus in `data/funds/`.
8. **Israeli-domiciled funds holding foreign assets vs foreign-domiciled funds.** No official source compared them (fund-level foreign withholding of an Israeli mutual fund or ETF, distribution policy). Belongs partly to `tax-securities-israeli.md`; likely in ISA or Tax Authority guidance on mutual funds, or fund prospectuses.
9. **TXF-07 vs s.92(a)(4).** Does the 2019 letter's "not offsettable against securities capital losses" for "קרן חוץ" distributions apply only to the withholder's automatic offset, or also in the annual return?
10. **Is the 4.7.2019 "קרן חוץ" letter still in force, and is there an official gov.il copy?** Only the capitax.co.il mirror was reachable.
11. **US estate tax details.** Rate schedule (Form 706 Table A, not read); how the USD 13,000 credit maps to an exemption amount; whether a US ETF organised as a trust is "stock of corporations organized in or under U.S. law" for situs.
12. **Shekel conversion rules (s.240A).** "כללי מס הכנסה (המרה לשקלים חדשים של סכומים שמקורם מחוץ לישראל), התשס״ד–2003" not read: which exchange rate and date convert foreign dividends, foreign tax and foreign-broker gains.
13. **US portfolio-interest exemption** for an Israeli resident on US Treasuries or US bond funds, vs the treaty 17.5% cap (TXF-15). IRS Pub 519/515 sections on portfolio interest not read.
14. **Foreign bond fund distributions:** taxed as interest (TXF-09) or as dividend (TXF-08)? Not sourced.
15. **How Israeli banks compute and withhold on foreign securities traded abroad** (whether they apply the exchange-rate index of TXF-03 automatically). The 2002 withholding regulations were read only for definitions, reg. 2(a) and 9(a); their text does not mention foreign currency. Bank tax pages or a Tax Authority directive.
16. **Guide p.3 item 3 wording** (shortened reporting route for foreign income) was read from a low-resolution page image; re-read before encoding TXF-21.
17. **Official gov.il URL of circular 04/2026** (the circular cites https://www.gov.il/he/pages/pa111224-2 for the December 2024 form notice; the circular itself was read only from capitax.co.il).

Note: the web-search budget for this session ran out partway through; questions 3, 6, 7, 8 and 10 may yield to a follow-up search.

## Left out and why

- US citizens, green-card holders and dual citizens (FATCA, PFIC, US filing): US-person rules, out of scope as in the discovery report.
- Substantial-shareholder, CFC and foreign professional company taxation beyond what decides TXF-11: not saver topics.
- Pre-2012 holdings and the linear split: in `tax-securities-israeli.md`.
- Foreign real estate and foreign rent: not securities; tax-landscape section 4.2.
- Section 163 relief for dividends of foreign companies with Israeli-source income: noted by the fetch tool, not read; marginal for index funds.
- Tax Authority guide 2025 disclaimer: the guide says its contents are explanations and do not replace the law ("הדברים המובאים בחוברת זו הם דברי הסבר ואינם באים במקום הוראות חוק"). Rules that rest only on the guide are tagged primary as a Tax Authority publication but should be checked against the law where possible.

## Proposed dimensions

- `estate-situs`: whether holding the variant exposes the person's estate to a foreign estate tax (US-situs assets of a non-US person), TXF-27. It decides between a US-domiciled and an Irish-domiciled fund on the same index and is not covered by `foreign-withholding-domicile`, which is about income tax.

## Sources

| Title | Publisher | URL | Strength | Checked |
|---|---|---|---|---|
| Income Tax Ordinance [New Version], consolidated text (ss.1, 2, 3A, 62A, 67C, 67G, 75B, 88, 91, 92, 97, 125B, 164, 199-210, 240A) | Knesset legislation, Hebrew Wikisource mirror (raw text) | https://he.wikisource.org/wiki/%D7%A4%D7%A7%D7%95%D7%93%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94 | primary (mirror; re-read exact wording) | 2026-10-22 |
| Income Tax Regulations (deduction from interest, dividend and certain profits), 2005 | Legislation, Hebrew Wikisource mirror | https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%A8%D7%99%D7%91%D7%99%D7%AA,_%D7%9E%D7%93%D7%99%D7%91%D7%99%D7%93%D7%A0%D7%93_%D7%95%D7%9E%D7%A8%D7%95%D7%95%D7%97%D7%99%D7%9D_%D7%9E%D7%A1%D7%95%D7%99%D7%9E%D7%99%D7%9D) | primary (mirror) | 2026-10-22 |
| Income Tax Regulations (withholding from consideration, payment or capital gain on sale of a security, a fund unit or a future transaction), 2002 | Legislation, Hebrew Wikisource mirror | https://he.wikisource.org/wiki/%D7%AA%D7%A7%D7%A0%D7%95%D7%AA_%D7%9E%D7%A1_%D7%94%D7%9B%D7%A0%D7%A1%D7%94_(%D7%A0%D7%99%D7%9B%D7%95%D7%99_%D7%9E%D7%AA%D7%9E%D7%95%D7%A8%D7%94,_%D7%9E%D7%AA%D7%A9%D7%9C%D7%95%D7%9D_%D7%90%D7%95_%D7%9E%D7%A8%D7%95%D7%95%D7%97_%D7%94%D7%95%D7%9F_%D7%91%D7%9E%D7%9B%D7%99%D7%A8%D7%AA_%D7%A0%D7%99%D7%99%D7%A8_%D7%A2%D7%A8%D7%9A,_%D7%91%D7%9E%D7%9B%D7%99%D7%A8%D7%AA_%D7%99%D7%97%D7%99%D7%93%D7%94_%D7%91%D7%A7%D7%A8%D7%9F_%D7%A0%D7%90%D7%9E%D7%A0%D7%95%D7%AA_%D7%90%D7%95_%D7%91%D7%A2%D7%A1%D7%A7%D7%94_%D7%A2%D7%AA%D7%99%D7%93%D7%99%D7%AA) | primary (mirror) | 2026-10-22 |
| "דע זכויותיך וחובותיך 2025" (guide to form 1301, tax year 2025), printed pp.1, 3-4, 37-40, 43-48, 70-83, 116-117 | Israel Tax Authority | https://www.gov.il/BlobFolder/generalpage/income-tax-guide-knowyourright/he/Guides_IncomeTax_da-2025.pdf | primary | 2026-10-22 |
| Letter "ניכוי מס במקור – קרנות חוץ (Foreign Funds)", 4.7.2019, to TASE, Banks Association, non-bank TASE members | Israel Tax Authority, capital-market taxation department (mirror on capitax.co.il) | http://www.capitax.co.il/Attachments/04072019.pdf | primary | 2026-10-22 |
| Income tax circular 04/2026, Form 150 instructions, 18.2.2026 (pp.1-6, 11-14 read) | Israel Tax Authority (mirror on capitax.co.il) | https://www.capitax.co.il/Attachments/18022026.pdf | primary | 2026-10-22 |
| ETF page, section "קרן חוץ (ETF)" | Bank Leumi | https://www.leumi.co.il/he/ETF | institution | 2026-10-22 |
| Convention between the US and Israel with respect to taxes on income (with protocols), Arts. 12, 13, 15, 26 | IRS | https://www.irs.gov/pub/irs-trty/israel.pdf | primary | 2026-10-22 |
| Tax Treaty Table 1 (rev. May 2023) | IRS | https://www.irs.gov/pub/irs-lbi/tax-treaty-table-1.pdf | primary | 2026-10-22 |
| Publication 519 (2025), U.S. Tax Guide for Aliens, chapter 4 | IRS | https://www.irs.gov/publications/p519 | primary | 2026-10-22 |
| About Form W-8BEN | IRS | https://www.irs.gov/forms-pubs/about-form-w-8-ben | primary | 2026-10-22 |
| Instructions for Form W-8BEN (rev. 10/2021) | IRS | https://www.irs.gov/instructions/iw8ben | primary | 2026-10-22 |
| Some nonresidents with U.S. assets must file estate tax returns | IRS | https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns | primary | 2026-10-22 |
| Instructions for Form 706-NA (09/2025) | IRS | https://www.irs.gov/instructions/i706na | primary | 2026-10-22 |
| Frequently asked questions on estate taxes for nonresidents not citizens of the United States | IRS | https://www.irs.gov/businesses/small-businesses-self-employed/frequently-asked-questions-on-estate-taxes-for-nonresidents-not-citizens-of-the-united-states | primary | 2026-10-22 |
| Estate & gift tax treaties (international) | IRS | https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international | primary | 2026-10-22 |
| Tried, not usable: Form 150 service page (403) | gov.il | https://www.gov.il/he/service/itc-150 | none | 2026-10-22 |
| Tried, not usable: tax treaties collector (403) | gov.il | https://www.gov.il/he/departments/dynamiccollectors/tax-treaties | none | 2026-10-22 |
| Tried, not usable: capitax article on "קרנות חוץ" withholding (Hebrew encoding garbled; led to the 2019 letter) | capitax.co.il | https://www.capitax.co.il/content/2/1986 | none | 2026-10-22 |
| Tried, not usable: iShares plc prospectus (redirect to error page) | BlackRock iShares | https://www.ishares.com/uk/individual/en/literature/prospectus/ishares-plc-prospectus.pdf | none | 2026-10-22 |
| Tried, not usable: Irish Revenue manual page (404) | Revenue (Ireland) | https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-27/27-01a-01.pdf | none | 2026-10-22 |
