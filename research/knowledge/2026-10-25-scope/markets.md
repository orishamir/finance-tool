# Batch `markets`: the general source behind each company-backed rule (2026-10-25)

Researcher: Opus, batch `markets` of the 2026-10-25 scope brief (`brief.md` in this folder). Areas: banks and deposits, brokerage accounts and brokers, mutual funds and ETFs, regulators, securities tax. Nothing in the rule base, `data/` or the site was changed. Every source below was opened on 2026-10-25 unless a line says otherwise. Downloads are in the session scratchpad (`scope-markets/dl/`), not in the repo.

How to read a section: **Verdict** (general, institution, mixed, unsettled), then **Evidence**, then **For the editor**: the source lines in the rule base's format (`references/README.md`), a proposed `- Scope:` line in the sweep's vocabulary (general / institution with the names / unsettled with what settles it), which company sources become unnecessary, and any text that must change.

## Summary

| Verdict | Count | Records |
|---|---|---|
| general | 4 | BRK-06, ETF-12, ETF-29, REG-16 |
| mixed | 17 | BANK-25, BRK-10, BRK-24, BRK-25, BRK-45, ETF-06, ETF-09, ETF-10, ETF-13, ETF-20, ETF-28, ETF-53, ETF-54, MF-27, SW-36, TXA-28, TXS-15 |
| institution | 15 | BPN-10, BRK-23, BRK-28, BRK-35, BRK-36, BRK-38, BRK-40, BRK-41, BRK-42, BRK-43, BRK-44, ETF-19, ETF-27, ETF-30, REG-26 |
| unsettled | 1 | CAT-23 |
| Section 2.3 (sentence about one company inside a primary record) | 9 | example of a general rule: BRK-08, BRK-27, ETF-24, MF-15; the company's own fact or practice: BANK-06, ETF-04, ETF-11, ETF-52, SW-33 |

Records that change class against the sweep (section 2.1 or 2.3):

- **BRK-10** (C → mixed). The general part exists: the Supervisor of Banks adopted the inter-ministerial custody committee's recommendations for every bank that gives custody (16.1.2013), with a binding Q&A; the new Directive 461 points to that custody guidance; TASE rule 25ו makes every member, banks included, keep a separate account for each client. Leumi's pooling, equivalent-securities, lien and liability terms stay Leumi's.
- **MF-27** (B with an A part → mixed, mostly general). Leumi's sentence is the Bank of Israel fee rules themselves: the TASE trading line excludes mutual funds "but includes" tracking funds and listed funds (first schedule, part 4(א)(1) and footnote 4). For banks the record is general; only IBI's and Meitav's lines and Leumi's figures are company terms.
- **BRK-45** (B → mixed). The US-tax sentences (W-8BEN validity, 30% default) are the IRS's rule (TXF-13, TXF-12); only how IBKR runs its account is IBKR's.
- **ETF-20** (A → mixed, with a correction). "Israeli fund units are denominated in shekels" is wrong as a general rule: the regulations provide for units in US dollars, and the ISA's 2025 report names currency of denomination as one reason funds are split. The TASE number is general; the "סל"/"מחקה" name marks stay unsettled.
- **BANK-25, BRK-24, BRK-25, ETF-06, ETF-10, ETF-53, ETF-54, SW-36, TXA-28, TXS-15** (A → mixed): a general source now carries the main rule, but a company figure, wording or observation is left that only a company proves.
- **BRK-27** (2.3, C → example of a general rule). Leumi's withholding sentence is the general duty of every bank and TASE member (TXS-05 already cites the regulation: "מוסד כספי – תאגיד בנקאי או חבר בורסה"). This also answers BRK open question 16 for non-bank TASE members: they withhold.
- **CAT-23** stays open, but the instrument is now identified: the CMA's "רשימת מסלולי השקעה – תיקון", ref. 2024-1471, 17.4.2024. Its gov.il file was not found.

New general sources this batch found (each is cited where it is used):

1. Bank of Israel: the Supervisor's binding Q&A on the custody committee recommendations (16.1.2013), the joint press release of the Ministry of Finance, the ISA and the BoI (2.1.2012), the adoption release (16.1.2013), Directive 461 "פעילות תאגיד בנקאי כברוקר דילר" (07/23) and its circular 2751.
2. TASE rules, part one, s.18 and s.25ו and s.29, and guidelines s.17 (fee reporting in the format of the BoI fee schedule) and s.26ג to 26ה.
3. ISA: the conditions of the general permit under s.49A (new version December 2023, English translation, which carries the fixed disclosure wording), and the ISA's s.49A Q&A (updated 13.1.2025).
4. Joint Investment Trust (Annual Report of a Fund) Regulations 2016 (ק"ת 7646): the reporting duties behind ETF-06, ETF-09, ETF-13, ETF-20 and TXS-15.
5. Joint Investment Trust (Classification of Funds for Publication) Regulations 2007, gazette text (ק"ת 6625) and the 2016 amendment (ק"ת 7653): the full exposure-profile scale and the US-dollar mark.
6. ESMA Guidelines on ETFs and other UCITS issues (ESMA/2014/937), paras 21 to 24, and the ESMA opinion on UCITS share classes (ESMA34-43-296).
7. Tax Authority, professional division activity summary for 2019, p.68: the green track for gifting traded securities to a relative, and what happens without it (withholding, zero cost at the receiver).
8. Income Tax Ordinance s.88 ("מחיר מקורי", "יום רכישה", "מכירה") and s.97(א)(5), read in the Tax Authority's consolidated text; withholding regulations 2002 reg. 9(ב).

For the founder (three items; none blocks the editor):

- **Direct Interactive Brokers accounts.** The ISA's Q&A (13.1.2025, question 5) says the law lets a person approach a foreign broker on his own sole initiative, provided that broker does not operate in Israel or approach anyone in Israel, and only for the service asked for. A foreign broker that markets in Israel needs a s.49A permit. This bears on how the site presents "open an account at IBKR directly" (BRK-42, BRK-43); the PM should decide whether the site says it.
- **ETF-20 correction.** Wherever the site says Israeli fund units are in shekels as a rule, it should say "the funds shown are in shekels" instead.
- **Institution-strength tax statements** (TXA-28) still compute only with a founder decision (coverage.md F1). This batch found no Tax Authority text that settles the savings-policy base (25% real or 15% nominal) or the year-end notional redemption.

## Class A records (general in the sweep)

### BANK-25 Fixed vs variable rate; prime as the usual anchor
**Verdict: mixed.**

Evidence.
- General: Directive 447 makes every bank show, in its concentrated publication, each standard deposit's rate type (Annex A column "סוג ריבית: משתנה/קבועה") and, for a variable rate, "הן את ריבית העוגן והמרווח והן את תוצאת סכימת ריבית העוגן והמרווח נכון למועד ההצגה" (s.5(ב), p.2). The disclosure rules require the deposit agreement to state "שיעור הריבית, תקופות חישובה ומועד פרעונה; אם רשאי התאגיד הבנקאי לשנותם, יפורטו התנאים לשינוי" (s.7(א)(3), p.5).
- Company: that the anchor is prime at every bank checked is an observation of three banks' pages (Yahav, Leumi, Hapoalim). Each bank's definition of prime (Leumi's "customary base rate on debit balances", Hapoalim's "BoI rate plus 1.5%") is that bank's own. Yahav's footnote that it may change rates or close a product to new deposits is Yahav's.
- Unsettled: an official definition of prime. Searched: the web for a Bank of Israel definition or FAQ (only secondary sites say "BoI rate + 1.5%"); Directive 447 (it says "ריבית העוגן", no name); EDGE has no prime series (data-landscape). The BoI's consumer pages are behind Radware and were not opened. What would settle it: a BoI document that defines prime or reports it.

For the editor.
- General part, source lines:
  - `[הוראת ניהול בנקאי תקין 447: פרסום שיעורי ריבית על פיקדונות ועל יתרות זכות בחשבון (5/24)](https://www.boi.org.il/media/orgfwntb/447.pdf), p.2, s.5(ב); p.3, Annex A, column "סוג ריבית" · checked 2026-10-25 · primary`
  - `[כללי הבנקאות (שירות ללקוח) (גילוי נאות ומסירת מסמכים), התשנ"ב-1992, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/rvzi1ngd/151.pdf), p.5, s.7(א)(3) · checked 2026-10-25 · primary`
  - `- Scope: general`
- Company part: keep the three bank pages, but only for a sentence that names them ("בלאומי, בפועלים וביהב העוגן הוא הפריים; כל בנק מגדיר את הפריים בעצמו"). `- Scope: institution (Bank Leumi, Bank Hapoalim, Bank Yahav)`. The prime definition stays under open question 14.
- Text: the Hebrew record should not say "העוגן שנראה בכל הבנקים" without naming the three banks read.

### BRK-06 Foreign brokers and foreign trading through an ISA 49A permit: not ISA-supervised
**Verdict: general.**

Evidence.
- s.49א of the Securities Law bars offering trading services through a system not run by an exchange, unless the ISA chair permits it for a system run by an exchange outside Israel, "בתנאים שיקבע" (Amendment 63, p.10).
- The ISA's general permit conditions (new version December 2023) list who may hold a permit: a banking corporation; a non-bank TASE member; an entity supervised as a US broker-dealer, an EU MiFID investment firm or credit institution, a UK-authorised firm or a Swiss bank; or a licensed investment adviser or marketer that routes through one of these (alternative B, (1)(a) to (d), p.8). A permit holder that tells anyone it holds the permit must give a disclosure in a fixed form. For alternative B: "The Israel Securities Authorities permit under Section 49A to the Securities Law was issued on the basis of the permit holder's declaration that it is subject to the supervision of ____________. Said entity's activity is not subject to the supervision of the Israel Securities Authority. This permit does not constitute an opinion regarding the quality of the services rendered by the permit holder or the risks that such services entail." Failure to disclose "may lead to the revocation" of the permit (p.11).
- The ISA's Q&A confirms that the permit text fixes the disclosure wording and that it must appear wherever the holder mentions the permit (question 12, p.6).
- So both company pages print the ISA's mandatory sentence: Interactive Israel's "בהסתמך על הצהרת החברה כי שירותי המסחר באמצעותה יינתנו תחת הפיקוח של CySec" is the alternative-B form; Yahav, a banking corporation, words its own.
- Caution: the ISA publishes the conditions in English with a note that the translation "has no legal status" and the Hebrew text binds. The Hebrew original was not found (searched the ISA site through web search with the disclosure wording). Re-read the Hebrew before quoting it on the site.

For the editor.
- Source lines:
  - `[חוק ניירות ערך (תיקון מס' 63), התשע"ז-2017](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf), p.10, s.49א · checked 2026-10-25 · primary`
  - `[ISA, Conditions of the General Permit under Section 49A of the Securities Law, new version (December 2023), English translation](https://www.new.isa.gov.il/en/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-64d0945455c5c/Conditions_of_a_general.pdf), p.8, s.(1)(a)-(d); p.11, "Disclosure regarding the nature of the permit" · checked 2026-10-25 · primary (official translation; the Hebrew text binds)`
  - `[רשות ניירות ערך: שאלות ותשובות בעקבות פרסום תנאי ההיתר הכללי לפי סעיף 49א (עדכון 13.1.2025)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/QAA49a.pdf), p.6, question 12 · checked 2026-10-25 · primary`
  - `- Scope: general`
- Company sources become unnecessary for the rule: Interactive Israel's about page and Yahav's permit page. Keep them only as named examples of permit holders (Interactive Israel: alternative B, CySEC; Yahav: banking corporation).
- Text: replace "אלה הצהרות של הגופים עצמם" with the general rule: every s.49A permit holder must say, in the ISA's wording, that its activity is not supervised by the ISA and that the permit is no opinion on quality or risk.

### BRK-24 Non-bank tariffs: same part structure, extra fee lines
**Verdict: mixed.**

Evidence.
- General: TASE rules s.18: "חבר, למעט חבר רחוק, ידווח לבורסה על העמלות שהוא גובה מלקוחותיו, כקבוע בהנחיות" (rules p.19 printed, file p.23). The guidelines say how: "חבר ידווח לבורסה על כל העמלות שהוא גובה מלקוחותיו. הדיווח יהיה במתכונת הדיווח הקבועה בתוספת ראשונה לכללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008", with changes reported within seven trading days, actual-fee and list-fee data for individuals and small businesses in a format the TASE CEO sets, and "על המידע הכלול בדיווחים לבורסה ... להיות זהה למידע המפורסם על ידי החבר, ככל שמפורסם" (s.17(א)-(ב), guidelines p.35 printed, file p.40). Every member's agreement with a client must state "שעור העמלות, דמי הניהול, החזר הוצאות וכל חיוב כספי אחר" (rules s.29ג(2), file p.35). So the shared part layout comes from a TASE rule that ties every member's fee reporting to the bank schedule.
- Not found: a rule that obliges a non-bank member to publish a tariff in that layout, or that makes the tariff a ceiling.
- Company: the extra lines (monthly account fee, data fees, income-collection fee, conversion spread, US regulatory pass-throughs) and Excellence's "רשאי לגבות סכומים או שיעורים נמוכים יותר" are the four firms' own tariffs.

For the editor.
- General part, source lines:
  - `[מדריך לחברי הבורסה: החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/q2mhob4u/274690.pdf), p.23, s.18; p.35, s.29ג(2) · checked 2026-10-25 · primary (exchange rules, ISA-approved)`
  - `[מדריך לחברי הבורסה: הנחיות על פי החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/g2ekpw4d/274691.pdf), pp.40 to 41, s.17(א)-(ד) · checked 2026-10-25 · primary (exchange rules, ISA-approved)`
  - `- Scope: general`
- Company part: the four tariffs stay as sources for named lines only. `- Scope: institution (IBI, Excellence, Altshuler Shaham Trade, Psagot)`.
- Text: "תעריפוני בתי ההשקעות בנויים לפי החלקים של תעריפון הבנקים" can now rest on the TASE rule (every member reports its fees in the bank schedule's format); "the tariff is a ceiling" must name Excellence.

### BRK-25 Interest on idle cash is a tariff line
**Verdict: mixed.**

Evidence.
- General: a non-bank member "ידווח ללקוחו על הריבית בה זוכו הכספים של הלקוח בחשבון הלקוח אצל החש"ב" (guidelines s.26ה(1)(ו), file p.98). This is already BRK-08 (primary). For banks, Directive 447 makes each bank publish its current-account credit rate or, if it pays none, the words "לא מוצעת ריבית על יתרת זכות בחשבון" (s.4(א), p.1).
- Company: that the three tariffs carry an interest line with conditions (client type, minimum, none on foreign-currency balances) is IBI's, Excellence's and Fair's own.

For the editor.
- General part: `[מדריך לחברי הבורסה: הנחיות על פי החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/g2ekpw4d/274691.pdf), p.98, s.26ה(1)(ו) · checked 2026-10-25 · primary`; `[הוראת ניהול בנקאי תקין 447 (5/24)](https://www.boi.org.il/media/orgfwntb/447.pdf), p.1, s.4(א) · checked 2026-10-25 · primary`. `- Scope: general`
- Company part: `- Scope: institution (IBI, Excellence, Fair)`.

### ETF-06 ETF price on the exchange is not the NAV
**Verdict: mixed.**

Evidence.
- General: the annual-report regulations require, for a closed fund (every ETF is a closed fund, ETF-01): "אם הקרן קרן סגורה יצוין טווח ההפרשים שבין שווי היחידה למחירה בבורסה, בכל ימי המסחר בתקופה בת שנים עשר חודשים שסיומה ביום עריכת הפרטים וההפרש הממוצע" (reg. 7(14), gazette p.1006), and "הסדרים עם עושה שוק" (reg. 22). The law defines the market maker (s.82(א)(6), ETF-03); the tracking-fund regulations make every ETF manager contract one, to make a market on every pricing day (reg. 3), and let the manager create or redeem units through a distributor on every pricing day (reg. 5(ב)), with late market-maker orders executed as that day's (reg. 8(א)). The ISA describes the two routes in and out (2024 report p.20, ETF-04).
- Company: the IBI fund's figures (range 1,814.15 to −1,079.70 agorot, average −0.04) and its description of daily settlement with the market maker at the last known NAV are IBI's report.

For the editor.
- General part, source lines:
  - `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע"ו-2016 (קובץ התקנות 7646, צילום הרשומות)](https://olaw.org.il/takanot/takanot-7646.pdf), p.6 (gazette p.1006), reg. 7(14) · checked 2026-10-25 · primary (mirror of Reshumot)`
  - `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן) (Wikisource mirror)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן)), reg. 22 · checked 2026-10-25 · primary (mirror)`
  - `[תקנות השקעות משותפות בנאמנות (קרנות מחקות), התשע"ח-2018 (קובץ התקנות 8038)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=#page=4), p.4 (gazette p.2396), regs. 3, 5; p.5 (gazette p.2397), reg. 8(א) · checked 2026-10-25 · primary`
  - `- Scope: general`
- Company part: IBI's report for the example figures only. `- Scope: institution (IBI)`.
- Text: "המקור הוא דוח שנתי של קרן אחת" can go; the rule rests on the regulations, the IBI numbers become a named example.

### ETF-10 The tracking asset of an unhedged foreign-index fund includes the currency
**Verdict: mixed.**

Evidence.
- General: the ISA directive defines "נכס מעקב" as "המדד או הסחורה שעל פי מדיניות ההשקעות של קרן מחקה, ייעודה הוא להשיג תוצאות הנגזרות משיעור השינוי בהם" and requires the manager to neutralise foreign-currency exposure that is not part of the tracking asset (s.4, p.3). The annual-report regulations add, where the reference asset "נקוב במטבע חוץ או צמוד לו", the change in that exchange rate for each period (reg. 18(ב)(10)). The ISA's 2025 report distinguishes FX-exposed from FX-hedged funds (p.20).
- Company: the exact tracking-asset wording ("S&P 500 100%, דולר ארה"ב 100%", net total return, SPTR500N) is each fund's prospectus (IBI, Yalin Lapidot). That every unhedged Israeli fund on a foreign index defines it the same way is likely but proven only for the two read.

For the editor.
- General part: keep the ISA directive and the 2025 report (already primary) and add `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן) (Wikisource mirror)](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן)), reg. 18(ב)(10) · checked 2026-10-25 · primary (mirror)`. `- Scope: general`
- Company part: the two annual reports, for the quoted wording only. `- Scope: institution (IBI, Yalin Lapidot)`.

### ETF-12 The exposure code in an Israeli fund name
**Verdict: general.**

Evidence.
- The classification regulations define the two grades in full: "דרגת חשיפה מרבית למניות ... 0 בלא חשיפה, 1 עד 10 אחוזים, 2 עד 30 אחוזים, 3 עד 50 אחוזים, 4 עד 120 אחוזים, 5 עד 200 אחוזים, 6 מעל 200 אחוזים", and for foreign currency "0 ... A עד 10 אחוזים, B עד 30 אחוזים, C עד 50 אחוזים, D עד 120 אחוזים, E עד 200 אחוזים, F מעל 200 אחוזים" (reg. 1, gazette p.152). "פרופיל חשיפה" is "צמד תווים הכולל את דרגת החשיפה המרבית של הקרן למניות ולימינו את דרגת החשיפה המרבית של הקרן למטבע חוץ" (reg. 1, gazette p.153). The 2016 amendment inserted "שיהיו חלק משם הקרן" after "צמד תווים" (ק"ת 7653, gazette p.1099). A publication must show the profile with a legend (reg. 3(א)(4), gazette p.154).
- MF-43 already states this from the Wikisource mirror; this is the gazette text. ETF-12's "only 4 and D were read clearly; the rest is open" is closed (it pointed to the same open question, ETF OQ9, closed by MF-54).

For the editor.
- Source lines:
  - `[תקנות השקעות משותפות בנאמנות (סיווג קרנות לצורך פרסום), התשס"ח-2007 (קובץ התקנות 6625)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fphh3DPmvYX3FiarYq7bbZFo=#page=24), pp.24 to 26 (gazette pp.152-154), reg. 1 ("דרגת חשיפה מרבית למניות", "דרגת חשיפה מרבית למטבע חוץ", "פרופיל חשיפה"), reg. 3(א)(4) · checked 2026-10-25 · primary`
  - `[תקנות השקעות משותפות בנאמנות (סיווג קרנות לצורך פרסום) (תיקון), התשע"ו-2016 (קובץ התקנות 7653)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=#page=11), p.11 (gazette p.1099), reg. 1(2) · checked 2026-10-25 · primary`
  - `- Scope: general`
- Company sources become unnecessary: the Yalin Lapidot and IBI annual reports and the IBI Maya filing. The IBI hedged fund can stay as a named example of "(4A)".
- Text: drop the open-question sentence; state the full scale.

### ETF-20 Israeli fund units are in shekels and identified by a TASE number
**Verdict: mixed, with a correction.**

Evidence.
- General, the number: every annual report heads the fund "בסוגריים המילים 'מספר בורסה' ומספר הקרן בבורסה" (annual-report regulations reg. 6(ג), gazette p.1006); the ISA guide says each fund has an identification number given by TASE (MF-50, primary).
- Correction, the currency: the regulations provide for units in another currency. A publication must state whether the fund is "קרן שיחידותיה נקובות בדולר של ארה"ב" (classification regulations reg. 3(ב)(6), gazette p.154). The annual report states "המטבע שבו נקובות יחידות הקרן והערך הנקוב שלהן" (reg. 7(11), gazette p.1006), and reg. 18 deals with "קרן שמחיר יחידותיה נקובות במטבע חוץ". The ISA's 2025 report says the regulation does not allow splitting one policy into sub-funds "הנבדלות זו מזו במטבע בו הן נקובות" (p.3). So "Israeli fund units are denominated in shekels" holds for the two funds read, not as a rule. Whether a US-dollar Israeli fund trades today was not checked.
- Unsettled, the name marks: no regulator text read says an ETF's name must contain "סל" or an open tracking fund's "מחקה". The annual report must state the fund type and whether it is a tracking fund (reg. 7(1), 7(3)), and a publication must show whether a fund is an ETF (MF-46). The ISA's naming directive (MF-47, open question 9 of the MF file) was not read. Searched: the classification and annual-report regulations, the tracking-fund regulations and the ISA tracking directive (none fixes the words). What would settle it: the ISA directive on fund names.
- Company: the IBI fund's earlier name (פסגות) is IBI's.

For the editor.
- General part: `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע"ו-2016 (קובץ התקנות 7646, צילום הרשומות)](https://olaw.org.il/takanot/takanot-7646.pdf), p.6 (gazette p.1006), regs. 6(ג), 7(11) · checked 2026-10-25 · primary (mirror of Reshumot)`; `[תקנות השקעות משותפות בנאמנות (סיווג קרנות לצורך פרסום), התשס"ח-2007 (קובץ התקנות 6625)](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fphh3DPmvYX3FiarYq7bbZFo=#page=26), p.26 (gazette p.154), reg. 3(ב)(6) · checked 2026-10-25 · primary`; `[פעילות קרנות נאמנות בישראל 2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf), p.3 · checked 2026-10-25 · primary`. `- Scope: general`
- Name marks: `- Scope: unsettled (seen in IBI's and Yalin Lapidot's fund names; settle: the ISA directive on fund names)`.
- Text: rewrite the first sentence: "יחידות של קרן ישראלית נקובות במטבע שנקבע בהסכם הקרן, בדרך כלל שקל; התקנות מכירות גם ביחידות נקובות בדולר. לכל קרן מספר בבורסה." The two reports stay as examples.

### ETF-29 UCITS ETF units are bought on the exchange, not from the fund
**Verdict: general.**

Evidence.
- ESMA's guidelines: where units bought on a secondary market are generally not redeemable from the fund, the prospectus and marketing communications "should include the following warning: 'UCITS ETF's units / shares purchased on the secondary market cannot usually be sold directly back to UCITS ETF. Investors must buy and sell units / shares on a secondary market with the assistance of an intermediary (e.g. a stockbroker) and may incur fees for doing so. In addition, investors may pay more than the current net asset value when buying units / shares and may receive less than the current net asset value when selling them.'" (paras 21-22, p.7). If the exchange price varies significantly from NAV, secondary-market investors may sell back to the fund, under a process the prospectus discloses (paras 23-24).
- BlackRock's factsheet prints the ESMA warning word for word.

For the editor.
- Source line: `[ESMA, Guidelines on ETFs and other UCITS issues, ESMA/2014/937 (1.8.2014)](https://www.esma.europa.eu/sites/default/files/library/2015/11/esma-2014-0011-01-00_en_0.pdf), p.7, paras 21-24 · checked 2026-10-25 · primary (foreign regulator)`. `- Scope: general`
- Company source becomes unnecessary: the iShares CSPX factsheet (it can stay as an example that the warning is printed).
- Text: "בלאקרוק מצהירה" becomes "לפי הנחיות הרגולטור האירופי, כל קרן UCITS כזו חייבת להזהיר"; add paras 23-24.

### ETF-53 What a swap fund receives and pays
**Verdict: mixed.**

Evidence.
- General: an unfunded swap is defined in the assets regulations as an exchange of price differences on an underlying "כנגד תשלום ריבית" without transfer of the exposure amount (ETF-51, primary). The variable management fee is "חלק משכר מנהל הקרן, הנגזר מתשואת הקרן ומהפרש העקיבה שלה" (tracking-fund regulations reg. 1, ETF-14, primary). The net index versions are the index providers' own methodology (MSCI, Nasdaq, already cited, primary for what an index is).
- Company or observation: that the funds read take the net version (each prospectus sets its tracking asset), that their reports show almost no tax expense, and that no report gives the swap cost as a number are observations of six named funds' reports.

For the editor.
- General part: cite ETF-51 and ETF-14 by id plus the existing MSCI and Nasdaq lines. `- Scope: general`
- Observation part: keep the six reports. `- Scope: institution (IBI, Kesem, MTF, Mor; observation across their 2025 reports)`.

### ETF-54 Published one-year tracking figures by replication method
**Verdict: mixed.**

Evidence.
- General: every annual report (except a flexible fund's) shows "תשואת הקרן בהשוואה לשיעור השינוי בנכס הייחוס כפי שנקבע בתשקיף הקודם של הקרן או בדוח" and explains the gap if it exceeds 10% of the reference asset's change for a tracking fund (annual-report regulations reg. 18(ה), gazette p.1015). The ISA reports describe the methods and give no comparison (already cited).
- Observation: the 2025 outcomes are ten named funds' own figures.

For the editor.
- General part: `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע"ו-2016 (קובץ התקנות 7646, צילום הרשומות)](https://olaw.org.il/takanot/takanot-7646.pdf), p.15 (gazette p.1015), reg. 18(ה) · checked 2026-10-25 · primary (mirror of Reshumot)` plus the ISA 2025 report. `- Scope: general`
- Observation part: `- Scope: institution (IBI, MTF, Mor, Tachlit, Harel; observation across their reports)`.

### REG-16 Brokerage client assets at a non-bank TASE member
**Verdict: general.**

Evidence.
- What Meitav Trade states is the TASE rule for every non-bank member: assets held apart from the member's own (guidelines s.26ג(1), file p.96: "חש"ב יחזיק את הנכסים הפיננסים של לקוחותיו בנפרד מהנכסים הפיננסים שלו"); TASE securities held "בחשבון במסלקת הבורסה, על שם החש"ב, בנאמנות עבור לקוחותיו" (s.26ד(1), file p.97); a separate account for each client (rules s.25ו); client cash "בחשבונות על שם החש"ב בנאמנות עבור לקוחותיו, ככל שמופקדים בתאגיד בנקאי", apart from the member's money and free of any third-party lien (s.26ה(1)(ב)-(ה), file p.98). BRK-07 and BRK-08 already carry these lines (primary, checked 2026-10-25).
- The record's own conditions are out of date: "no statute ... the governing text is probably in the TASE rules ... which were not read". The TASE rules were read (BRK-07). REG open question 9 is answered for segregation (not for what happens in a member's failure).
- Still open from the record: whether client cash in a bank trust account is exposed to that bank's failure (REG open question 21).

For the editor.
- Source lines: the BRK-07 and BRK-08 lines (TASE rules pp.34-35, ss.25-26; guidelines pp.95-102, s.26). `- Scope: general`
- Company source becomes unnecessary: Meitav Trade's about page.
- Text: rewrite as the TASE rule; keep the bank-failure question open.

### SW-36 Tax on moving securities between accounts
**Verdict: mixed.**

Evidence.
- General, a different owner: "מכירה" includes "חליפין, ויתור, הסבה, העברה, הענקה, מתנה, פדיון, וכן כל פעולה או אירוע אחרים שבעקבותם יצא נכס בדרך כל שהיא מרשותו של אדם" (Ordinance s.88, p.148). A gift to a relative is exempt ("מתנה לקרוב וכן מתנה ליחיד אחר אם שוכנע פקיד השומה כי המתנה ניתנה בתום לב ובלבד שמקבל המתנה אינו תושב חוץ", s.97(א)(5), p.161), and the receiver takes the giver's remaining original price and purchase day (s.88 "מחיר מקורי" (3)(ג)(II) and "יום רכישה" (1), pp.147-148). The Tax Authority's 2019 professional-division summary: "העברת ניירות ערך כמתואר לעיל, ללא פניה לרשות המסים וקבלת אישור פרטני לכל העברה, הייתה גוררת ניכוי מס במקור בגינה וכן רישום עלות אפס אצל הקרוב מקבל ניירות הערך"; from 1.1.2019 a declaration form "אשר ימולא בסניף הבנק" lets a gift of traded securities between an individual and a relative (both Israeli residents; relatives as listed) go without withholding, and the relative receives the giver's cost; "המסלול נגיש באופן ישיר למבקשים באמצעות חברי הבורסה" (p.68). Leumi's and Altshuler Shaham Trade's statements are this rule.
- General, losses: when computing withholding, the payer offsets losses only on securities it managed in the same year (reg. 9(א)); "פקיד השומה רשאי להתיר קיזוז בשל הפסדים מניירות ערך שנוצרו אצל מנהל תיק ניירות ערך אחר ... אם הועבר תיק ניירות ערך מאותו מנהל למנהל אחר, בתנאים שיקבע" (reg. 9(ב), withholding regulations 2002). Meitav Trade's "losses are not erased" is broader than this; carrying losses forward through the annual return is TXS-18.
- Reading, a move between one's own accounts: the asset does not leave the owner's possession, so under the s.88 definition it is not a sale. No Tax Authority sentence saying so was found (searched: the web for Tax Authority guidance on moving securities between accounts of the same owner; the withholding regulations; the 2019 summary). The Tax Authority's form 747 lets an individual declare cost to a TASE member when the member's recorded cost does not match what was paid (up to NIS 500,000 a year), which shows that recorded cost can be wrong after a move; it does not say a move is neutral.

For the editor.
- General part, source lines:
  - `[פקודת מס הכנסה [נוסח חדש], נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf), pp.147-148, s.88 ("מחיר מקורי" (3)(ג), "יום רכישה" (1), "מכירה"); p.161, s.97(א)(5) · checked 2026-10-25 · primary`
  - `[רשות המסים, דוח סיכום פעילות החטיבה המקצועית לשנת המס 2019 (תמוז התש"ף)](https://www.gov.il/BlobFolder/reports/tax-professionaldivision/he/IncomeTax_IncomeTaxRepresentInfo_Professionaldivision2019.pdf), p.68 (file p.69), "מסלול ירוק - העברת ני"ע בין קרובים" · checked 2026-10-25 · primary`
  - `[תקנות מס הכנסה (ניכוי מתמורה, מתשלום או מרווח הון במכירת נייר ערך, במכירת יחידה בקרן נאמנות או בעסקה עתידית), התשס"ג-2002](https://www.btl.gov.il/Laws1/02_0103_100228.pdf), pp.2-3, reg. 9(א)-(ב) · checked 2026-10-25 · primary`
  - `- Scope: general`
- Same-owner part: `- Scope: unsettled (stated by Altshuler Shaham Trade and Meitav Trade; follows from the s.88 definition but no Tax Authority sentence was found; settle: a Tax Authority instruction to TASE members on transfers between accounts)`.
- Company sources become unnecessary for the relative and different-owner parts: Leumi's guidelines page and Altshuler Shaham Trade's FAQ. Meitav Trade's article should not be cited for "losses are not erased".
- Text: the title "(institution sources only)" and "לא נקרא מקור של רשות המסים" no longer hold. SW open question 11 is mostly answered.

### TXA-28 What insurers state about tax on savings-policy gains
**Verdict: mixed.**

Evidence.
- General counterparts already in the file: tax falls when the individual receives gains ("רווחים שקיבל יחיד מתכנית חיסכון בפוליסת ביטוח חיים, יראו אותם כהכנסה מריבית", s.3(ה5), TXA-03); the insurer withholds, and a profit-sharing policy at 25% even if not linked (withholding regulations 2005 reg. 5(א), TXA-04); the s.125D relief reaches policy gains (a reading of two definitions, TXA-07); the payer issues the withholding certificate (form 0867, TXI-08).
- Still only insurers: "only on the real gain" (the 25%-real versus 15%-nominal question is TXA open question 1); that a track switch is not taxed (a reading of s.3(ה5) plus a secondary article, TXA-08); the year-end notional redemption (Phoenix's practice; whether the Tax Authority has a position is open question 17). Searched: the web for a Tax Authority statement on savings-policy base and notional redemption; only forums and investment sites came up.

For the editor.
- No new source line. Point each sentence to its general counterpart (TXA-03, TXA-04, TXA-07, TXI-08) and keep Clal and Phoenix only for the sentences no general source covers.
- `- Scope: institution (Clal, The Phoenix)` for the base and notional-redemption sentences; general for the rest by reference.

### TXS-15 Foreign tax inside an Israeli exempt fund
**Verdict: mixed.**

Evidence.
- General: an exempt fund's income and gains are exempt (s.129ג(א)(1), TXS-08); the saver's real gain on redemption is taxed and withheld at 25% (s.91(ב1), withholding regulations reg. 3א, TXS-09). The annual-report regulations make every exempt fund print under the expense table "כי קרן פטורה אינה חייבת בתשלום מסים, למעט חריגים המפורטים בתשקיף, בפסקה על מיסוי הקרן ומיסוי בעל יחידה בקרן, וכן כי בעת פדיון, יהיה חייב המשקיע בתשלום מס שינוכה מהרווח הריאלי שנצבר על היחידות שפדה, ויצוין שיעורו" (reg. 20(2)(ד), gazette p.1016). A credit is given for "מסים המשתלמים על ידי תושב ישראל לרשויות המס של מדינה מחוץ לישראל" (s.199, TXF-16), and tax suffered by the fund is paid by the fund, so the saver gets no credit (the same reading as TXF-16; no source says it in words).
- Company: the list of situations in which an exempt fund may pay foreign tax (securities traded abroad, dual-listed, foreign issuers traded only in Israel) is the Migdal and Yalin Lapidot prospectus wording. Every exempt-fund prospectus has a tax paragraph by regulation, so the wording is likely common, but only two were read.

For the editor.
- General part: `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע"ו-2016 (קובץ התקנות 7646, צילום הרשומות)](https://olaw.org.il/takanot/takanot-7646.pdf), p.16 (gazette p.1016), reg. 20(2)(ד) · checked 2026-10-25 · primary (mirror of Reshumot)`, plus TXS-08, TXS-09 and TXF-16 by id. `- Scope: general`
- Company part: `- Scope: institution (Migdal Mutual Funds, Yalin Lapidot)` for the list of foreign-tax situations.
- Text: "זה כתוב בתשקיפים של מנהלי קרנות, לא בחוק" is no longer accurate; the regulations make every exempt fund say it pays no tax "except exceptions in the prospectus". Narrow TXS open question 8 to "no source states the credit question in words".

## Class C records (open in the sweep)

### BRK-10 Bank: client securities registered through the nominee company, pooled, separated in the books
**Verdict: mixed.** (The assignment asked for the Bank of Israel's or the ISA's own rule.)

Evidence.
- General, the Bank of Israel: the inter-ministerial committee on custody services (ISA, Ministry of Finance, BoI, Tax Authority) published its final recommendations in January 2012. The joint press release lists them: basic duties of a custodian "הבטחת זכויות הבעלות בנכסים ובמזומנים של הלקוח והבטחת הזכויות הנלוות לבעלות"; "הפרדת נכסים, רישום ותיעוד, דרישות לביצוע התאמות ודרישות דיווח – ... חובות שתכליתן לאפשר זיהוי בנפרד של נכסי הלקוחות"; criteria and a contract for any third-party custodian; liability set by contract; an independent external audit at least once a year. The release explains that "ניירות הערך מוחזקים בחשבונות נפרדים ... על מנת להבטיח שמירת רישומי הבעלות והפרדת נכסי הלקוח עצמו מנכסי הקסטודיאן". On 16.1.2013 the Supervisor of Banks adopted the recommendations: "תאגידים בנקאיים המעניקים שירותי קסטודי ללקוחות יידרשו לעמוד בסטנדרטים גבוהים". The Supervisor's Q&A of the same day, "עמדתו ופרשנותו המחייבת של המפקח על הבנקים", applies them to banks: client cash at a foreign third-party custodian, selection and monitoring of third-party custodians (high custody rating or investment-grade credit rating expected), a presumption of "הסדרה ראויה" in the US, EU MiFID countries and similar OECD countries, disclosure of the bank's custodian-selection policy (recommendation 31), and the external audit (recommendation 35) (pp.2-4).
- The current Directive 461, "פעילות תאגיד בנקאי כברוקר דילר" (07/23, circular 2751 of 19.7.2023, in force 18 months after publication per its s.57; a Leumi page and the BoI list of cancelled directives, seen only in search results and not opened, give 1.8.2025), replaces the old 461 and says the broker-dealer framework complements "גילוי נאות, דרישות דיווח והנחיות הפיקוח על הבנקים בעניין שירותי קסטודי" (s.6, p.2). The old 461's s.10 ("ניירות ערך המוחזקים אצל אחרים", amended by circular 2080) is cancelled with it.
- General, TASE: "חבר ינהל חשבון נפרד לכל לקוח" applies to every member, banks included (rules s.25ו, file p.34); every member's client agreement must include "הוראות לענין החזקה על ידי חבר עבור לקוח של נכסים פיננסים" (s.29ג(6), file p.35). The nominee company registers listed securities and holds them for clearing members (BRK-13, primary).
- Company (Leumi): that the bank need not keep a client's securities apart from other clients' (pooling), may return equivalent securities, that custodians may hold liens for their fees and the transaction, and that the bank is not liable for a broker chosen with reasonable care. These are contract terms; nothing read makes them general. (For non-bank members the TASE guidelines allow liens only for custody fees and the transaction's own consideration, s.26ג(4); no equivalent bank rule was read.)
- Still open: what happens to a bank's client securities if the bank fails (REG open question 10). The committee's full report was not reached: the BoI press-release pages are behind Radware (not worked around) and no PDF of the report was found by web search.

For the editor.
- General part, source lines:
  - `[בנק ישראל, הפיקוח על הבנקים: המלצות הועדה הבין-משרדית להסדרת שירותי קסטודי בשוק ההון בישראל – שאלות ותשובות (16.1.2013)](https://www.boi.org.il/media/cn1loswt/201305.pdf), pp.1-4 · checked 2026-10-25 · primary`
  - `[הודעה משותפת לעיתונות של משרד האוצר, רשות ניירות ערך ובנק ישראל: פורסמו המלצותיה הסופיות של ועדה בין משרדית להסדרת שירותי קסטודי (2.1.2012)](https://www.boi.org.il/media/c1whyt5l/קסטודי-6.doc), "המלצות הוועדה" · checked 2026-10-25 · primary`
  - `[בנק ישראל, הודעה לעיתונות: המפקח על הבנקים מאמץ את המלצות הוועדה הבין-משרדית להסדרת שירותי קסטודי (16.1.2013)](https://www.boi.org.il/media/1mgcq3p4/הודעה-לעיתונות-אימוץ-המלצות-ועדת-קסטודי.doc) · checked 2026-10-25 · primary`
  - `[הוראת ניהול בנקאי תקין 461: פעילות תאגיד בנקאי כברוקר דילר (07/23)](https://boi.org.il/media/5tmn1zxi/461.pdf), p.2, s.6; p.17, ss.57-58 · checked 2026-10-25 · primary`
  - `[מדריך לחברי הבורסה: החלק הראשון לתקנון (מעודכן עד 1.1.2026)](https://content.tase.co.il/media/q2mhob4u/274690.pdf), p.34, s.25ו; p.35, s.29ג(6) · checked 2026-10-25 · primary (exchange rules, ISA-approved)`
  - `- Scope: general`
- Company part: Leumi's general terms stay, for a sentence that names Leumi. `- Scope: institution (Bank Leumi)`.
- Text: split into (1) the general custody duties of banks and members, and (2) "לפי התנאים הכלליים של לאומי ...". Replace "מה קורה לניירות הלקוחות אם בנק קורס לא נמצא" with the narrower open question. On the site, the three guide pages that state the custody sentence for every bank (sweep section 3) can state part (1) and must name Leumi for part (2). BRK open questions 4 and 6 are partly answered (no second bank's terms were read; the committee report was identified but not opened).

### CAT-23 What specific standard tracks hold
**Verdict: unsettled.**

Evidence.
- Each standard track name's regulatory investment policy is set by the CMA's list of investment tracks (circular 2022-9-30, s.10, CAT-15, primary). The list now in force is "רשימת מסלולי השקעה – תיקון", ref. 2024-1471, dated 17.4.2024: Altshuler Shaham's bylaw-change summaries cite it by name, number and date ("שה. 2024-1471 'רשימת מסלולי השקעה - תיקון' (מיום 17.4.2024)") as the basis of the 1.7.2024 renaming ([אלטשולר שחם פנסיה מקיפה, תקנון, ריכוז שינויים יולי 2024](https://www.as-invest.co.il/media/oljpywz4/אלטשולר-שחם-פנסיה-מקיפה-תקנון-ריכוז-שינויים-יולי-2024.pdf), ss.19-20, read 2026-10-25, institution, used only to identify the instrument) (a search summary of the CMA's 2024 annual report also mentions a list issued in June 2024; that report was not opened). Meitav's quoted policies are one manager's text; since s.9(ב) bars a manager from using a list name for a different policy, the content is probably the list's, but that is unproven until the list is read.
- Searched: web search for the list by title, by number and with policy wording (only institution documents came up); gov.il search results (the 2015 list `regulation_2015-9-7a.pdf`, superseded, and the 2022 drafts); the CMA consolidated circular's investment-assets chapter (`information-entities-codex/.../of_Chapter_4_Management_of_investment_assets.pdf`, no list in it); Altshuler Shaham's pages and PDFs for a gov.il link (none).
- What would settle it: the gov.il PDF of 2024-1471 (likely under the CMA's dynamic collector of circulars and notices; the govil-page tool could open the CMA circulars index). Then each name's policy can cite the CMA, and Meitav's notices become unnecessary.

For the editor.
- `- Scope: unsettled (quoted from Meitav's bylaw notices; settle: the CMA list of investment tracks, amendment 2024-1471 of 17.4.2024)`.
- Add to CAT open question 9 the identified instrument (title, number, date) and the searches above.

## Mixed records

### ETF-09 Tracking difference is reported per year in the annual report
**Verdict: mixed.**

Evidence.
- General: every annual report except a flexible fund's shows "תשואת הקרן בהשוואה לשיעור השינוי בנכס הייחוס כפי שנקבע בתשקיף הקודם של הקרן או בדוח" over the last twelve months, and "בקרן מחקה יינתן הסבר כאמור אם עלה הפער האמור על עשרה אחוזים משיעור השינוי במחירי נכס הייחוס" (20% for other funds) (reg. 18(ה)(1)-(2), gazette p.1015). The ISA directive also makes the manager publish the 12-month tracking difference every pricing day (s.7(ה), ETF-07).
- Company: the two 2025 results and the managers' explanations are IBI's and Yalin Lapidot's.

For the editor.
- General part: `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע"ו-2016 (קובץ התקנות 7646, צילום הרשומות)](https://olaw.org.il/takanot/takanot-7646.pdf), p.15 (gazette p.1015), reg. 18(ה) · checked 2026-10-25 · primary (mirror of Reshumot)`. `- Scope: general`
- Company part: `- Scope: institution (IBI, Yalin Lapidot)`.
- Text correction: the report must explain the gap only when it exceeds 10% of the tracking asset's change (for a tracking fund), not always.

### ETF-13 Fee layers in an Israeli tracking fund or ETF
**Verdict: mixed.**

Evidence.
- General: the annual report's table "הוצאות שנפרעו מנכסי הקרן כשיעור מהשווי הנקי הממוצע של נכסי הקרן" lists the manager's fee, the trustee's fee, commissions and other transaction expenses, tax expenses and the total, and states under the table "כי לפי החוק רשאי מנהל הקרן לפרוע מנכסי הקרן עמלות והוצאות אחרות הכרוכות בביצוע עסקאות בעד הקרן" (reg. 20, gazette p.1016). The tracking-fund regulations define the fixed and variable management fees (reg. 1, ETF-14). Creation and redemption fees are ETF-05.
- Company: the IBI and Yalin Lapidot rates for 2025.

For the editor.
- General part: `[תקנות השקעות משותפות בנאמנות (דוח שנתי של קרן), התשע"ו-2016 (קובץ התקנות 7646, צילום הרשומות)](https://olaw.org.il/takanot/takanot-7646.pdf), p.16 (gazette p.1016), reg. 20 · checked 2026-10-25 · primary (mirror of Reshumot)` plus ETF-14 by id. `- Scope: general`
- Company part: `- Scope: institution (IBI, Yalin Lapidot)`.

### ETF-28 Foreign-domiciled ETFs: share classes and listings
**Verdict: mixed.**

Evidence.
- General: ESMA's opinion: share classes "are not compartments but different types of units or shares belonging to the same UCITS"; investors in all classes share one pool of assets, while classes may differ in "the distribution of revenues, a particular tax treatment under national law, or a different minimum investment amount", with each class's costs borne by that class (para 5, pp.1-2); "technical share classes" differ "in regard to management fees, minimum investment amounts, voting rights or currency" (para 13, p.3). Read on the AMF's site, which hosts ESMA's document.
- Company: that each class has its own ISIN, the CSPX and IUSA examples, the 0.07% TER and the listings are iShares' own pages. No general source for "one ISIN per class" was read.

For the editor.
- General part: `[ESMA, Opinion: Share classes of UCITS, ESMA34-43-296 (30.1.2017), hosted by the AMF](https://www.amf-france.org/sites/institutionnel/files/resource/ESMA%20Opinion%2034-43-296%20.pdf), pp.1-2, para 5; p.3, para 13 · checked 2026-10-25 · primary (foreign regulator; mirror on another regulator's site)`. `- Scope: general`
- Company part: `- Scope: institution (iShares)`.

### MF-27 Bank and broker commissions and custody on fund units
**Verdict: mixed; for banks the record is general.**

Evidence.
- General, banks: the full tariff's line "קניה, מכירה ופדיון של ניירות ערך הנסחרים בבורסה בתל אביב" excludes "קרנות נאמנות" (part 4(א)(1), p.15), and footnote 4 reads "אך לרבות 'קרן מחקה', כהגדרתה בחוק השקעות משותפות בנאמנות, התשנ"ד-1994, וכן של קרן להשקעות משותפות בנאמנות, שיחידותיה רשומות בבורסה לניירות ערך בתל אביב" (p.24). The custody fee line includes "(לרבות יחידות השתתפות בקרנות נאמנות)" (part 4(א)(5), p.16), and "לא ניתן לגבות דמי ניהול פיקדון ניירות ערך בעבור מלווה קצר מועד או בעבור קרן כספית" (note 2, p.17). The distribution-fee line applies "in cases permitted" (part 4(ב)(2), BRK-16). Leumi's sentence is these rules.
- General, every distributor: the distribution-fee regulations limit what a distributor charges the holder (no fee on money-market funds under an agreement; on listed and tracking funds only a transaction fee) (MF-26, primary). The ISA guide's statements (banks may charge custody on units; investment houses usually do not) are already primary (dated 2017).
- Company: IBI's 0.08% with a NIS 5 minimum, Meitav's "no buy and sell fees on fund units", and Leumi's 0.225% standing-order rate.

For the editor.
- General part: `[כללי הבנקאות (שירות ללקוח) (עמלות), התשס"ח-2008, נוסח משולב (בנק ישראל)](https://www.boi.org.il/media/mi2driua/159a.pdf), p.15, first schedule part 4(א)(1); p.16, part 4(א)(5); p.17, note 2; p.24, footnote 4 · checked 2026-10-25 · primary` plus MF-26 and the ISA guide. `- Scope: general`
- Company part: `- Scope: institution (IBI, Meitav; Bank Leumi for its figures)`.
- Text: the first bullet becomes the BoI rule for every bank, with Leumi's figures as a named example. "בנקים וברוקרים אחרים לא נבדקו" applies only to non-bank members.

### BRK-45 Interactive Brokers and US tax (moved here from class B)
**Verdict: mixed.**

Evidence.
- General: the W-8BEN's role, its validity "until the last day of the third succeeding calendar year" and the 30% rate when no form is given are the IRS's (TXF-13, primary); the 25% treaty rate for an Israeli resident is TXF-12 (primary). The duty to report semi-annually when no Israeli tax was withheld is TXF-22 (primary). Under the withholding regulations only a "מוסד כספי – תאגיד בנקאי או חבר בורסה" withholds on securities sales (TXS-05), and IBKR is neither.
- Company: how IBKR collects the form, that a lapsed form brings 30% on gross proceeds at IBKR, and that no IBKR page mentions Israeli tax.

For the editor.
- General part: cite TXF-12, TXF-13, TXF-22 and TXS-05 by id. `- Scope: general`
- Company part: `- Scope: institution (Interactive Brokers; Interactive Israel for the form-update FAQ)`.

## Class B records (one institution's terms): general counterparts

### BPN-10 Savings-plan names: what the contracts say about instalments
**Verdict: institution (Bank Hapoalim).**
General counterpart a product page can cite: for deposits made from time to time over more than a year the agreement must state "סדרי ההפקדות וקיום מגבלות לגבי גובה הסכום שניתן להפקדה ומועדי ההפקדה" and, if early repayment is allowed, its terms (disclosure rules s.7(ב)(4)-(5), p.5, `https://www.boi.org.il/media/rvzi1ngd/151.pdf`); a bank lists such plans in its 447 publication as "additional deposit types" with at least the Annex A characteristics (Directive 447 s.4(ב), p.1). No rule fixes how instalments are locked. `- Scope: institution (Bank Hapoalim)`. The site's savings-plan page must name Hapoalim (sweep section 3).

### BRK-23 Banks: foreign-currency conversion for foreign securities
**Verdict: institution (Bank Leumi).**
General counterpart: the bank's conversion fee is "עמלת חליפין ... לפי פירוט שיקבע התאגיד הבנקאי, ובלבד שלא יעלה על 2 עמלות" (BoI fee rules, first schedule part 5(1), p.18, `https://www.boi.org.il/media/mi2driua/159a.pdf`, BRK-16). That the bank converts at its own rate when the account lacks the currency is Leumi's contract. `- Scope: institution (Bank Leumi)`.

### BRK-28 Opening an account
**Verdict: institution (Bank Leumi, Meitav Trade, Fair, Psagot).**
General counterpart: every TASE member must make a written agreement with the client and give a copy "קודם לתחילת מתן השירות", including the fees, the client's right to cancel at any time, and provisions on holding the client's assets and handling cash (TASE rules s.29ב-ג, file p.35); a non-bank member may make it online (guidelines s.29א, file p.105); a bank must make the securities custody agreement in writing (disclosure rules s.3(א)(5), BRK-22). No legal minimum deposit was found. Minors' accounts: still open (BRK open question 17). `- Scope: institution (Bank Leumi, Meitav Trade, Fair, Psagot)`.

### BRK-35 Interactive Brokers Ireland: segregation and compensation
**Verdict: institution (Interactive Brokers Ireland).**
General counterpart: SIPC's own page for the US scheme (REG-27, primary). The Irish Investor Compensation Company's page was not reached (BRK open question 7); a product page should cite IB Ireland as IB Ireland. `- Scope: institution (Interactive Brokers Ireland)`.

### BRK-36 Interactive Israel: tax withholding service and fee claims
**Verdict: institution (Interactive Israel, with HYBRID).**
General counterpart: Israeli withholding on securities sales binds only banks and TASE members (TXS-05); without withholding the person reports semi-annually and files a return (TXF-22). Whether HYBRID holds a Tax Authority approval stays unsettled (searched: the web for a Tax Authority publication on withholding by a foreign broker or an Israeli agent; only accountants' and forum pages). `- Scope: institution (Interactive Israel)`.

### BRK-38 One Zero's full tariff
**Verdict: institution (One Zero).**
General counterpart: the BoI fee rules fix the bank tariff's lines (BRK-16, BRK-17, BRK-19) and TASE's calculator publishes each member's fees (BRK-33). `- Scope: institution (One Zero)`.

### BRK-40 Interactive Israel's tariff
**Verdict: institution (Interactive Israel).**
General counterpart: none for prices; the permit status is BRK-06 (ISA general permit). `- Scope: institution (Interactive Israel)`.

### BRK-41 Interactive Israel: which IBKR entity, what is offered
**Verdict: institution (Interactive Israel).**
General counterpart: the ISA general permit's alternative B admits only entities supervised as US broker-dealers, EU or UK investment firms or Swiss banks, with a fixed disclosure naming the foreign supervisor (BRK-06 above); a foreign broker that executes for a permit holder's clients needs no permit of its own if the contract is between the permit holder and its clients (ISA Q&A question 7, p.4). `- Scope: institution (Interactive Israel)`.

### BRK-42 Interactive Brokers direct: price list
**Verdict: institution (Interactive Brokers).**
General counterpart: none (TASE's calculator covers TASE members only). `- Scope: institution (Interactive Brokers)`.

### BRK-43 Interactive Brokers: the carrying entity
**Verdict: institution (Interactive Brokers).**
General counterpart: the ISA's Q&A question 5 (updated 13.1.2025, p.3): "החוק אינו אוסר על פנייה של אדם ביוזמתו העצמית הבלעדית לגוף זר בבקשה לקבל ממנו שירותי מסחר בניירות ערך, אולם הדבר מותנה בכך שאותו הגוף כלל אינו פועל בישראל, לא ביצע כל פנייה לגורמים בישראל, והשירות יהיה מוגבל לזה שנעשתה פנייה לגביו". This answers part of BRK open question 9 (whether a non-soliciting foreign broker needs a permit) and should be added there:
`[רשות ניירות ערך: שאלות ותשובות בעקבות פרסום תנאי ההיתר הכללי לפי סעיף 49א (עדכון 13.1.2025)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/QAA49a.pdf), p.3, question 5 · checked 2026-10-25 · primary`. Which entity serves an Israeli stays IBKR's. `- Scope: institution (Interactive Brokers)`.

### BRK-44 PRIIPs at Interactive Brokers
**Verdict: institution (Interactive Brokers, Interactive Israel).**
General counterpart: EU Regulation 1286/2014 (the KID duty for retail investors in the EEA). EUR-Lex returned an empty page to the fetch (not worked around), so the text stays unread (ETF open question 11). `- Scope: institution (Interactive Brokers, Interactive Israel)`.

### ETF-19 IBI's S&P 500 ETF accumulates
**Verdict: institution (IBI).**
General counterpart: the ISA guide: most Israeli funds do not distribute, at the manager's discretion (MF-49, primary); the annual report must state any payments to holders (annual-report regulations reg. 23). `- Scope: institution (IBI)`.

### ETF-27 TASE-listed iShares, as BlackRock states
**Verdict: institution (BlackRock).**
General counterpart: TASE's foreign-funds list quotes these funds in agorot (ETF-32, ETF-43, primary); the foreign-fund regulations make the Israeli annex disclose fees and listings (ETF-24, primary). `- Scope: institution (BlackRock)`.

### ETF-30 US-domiciled ETF example (IVV)
**Verdict: institution (iShares).**
General counterpart: a foreign fund offered in Israel must be a UCITS or a US Investment Company Act fund (ETF-23, reg. 2(א)(6)); US withholding and estate tax are TXF-12 and TXF-27. `- Scope: institution (iShares)`.

### REG-26 Foreign broker via an Israeli introducer
**Verdict: institution (Interactive Israel).**
General counterpart: s.49A and the ISA's alternative-B disclosure ("Said entity's activity is not subject to the supervision of the Israel Securities Authority", BRK-06 above); SIPC's own terms (REG-27). The CySEC licence was not checked on CySEC's register. `- Scope: institution (Interactive Israel)`.

## Section 2.3 records of these areas (a sentence about one company inside a primary record)

| Record | The sentence | Classification | For the editor |
|---|---|---|---|
| BANK-06 | Discount's break mechanism; Yahav's "אין אפשרות לשבירה" | The banks' own product terms, as examples of the general rule that breaking is a product term (disclosure rules s.10, 447 Annex A) | Name Discount and Yahav in the sentence; the two company sources are not needed for the general rule. `- Scope: general` for the rule, `institution (Israel Discount Bank, Bank Yahav)` for the example |
| BRK-08 | Fair: cash may sit in a pooled trust account at a bank or a foreign financial institution | Example of the general rule (guidelines s.26ה(1)(א)-(ב), file p.98) | Fair's tariff page is unnecessary |
| BRK-27 | Leumi withholds where the law requires | Example of the general rule: banks and TASE members withhold (withholding regulations 2002, reg. 1 "מוסד כספי", reg. 2, TXS-05). This also answers BRK open question 16 for non-bank TASE members | Cite TXS-05's regulation in place of Leumi's terms; close the non-bank half of open question 16 |
| ETF-04 | IBI: no minimum order and no maximum creation | IBI's own (the regulation lets a manager announce a maximum, reg. 5(ג)) | Name IBI; `institution (IBI)` |
| ETF-11 | IBI uses OTC derivatives; iShares physical replication | The funds' own facts illustrating the ISA-reported pattern | Keep as named examples |
| ETF-24 | BlackRock states it is not subject to Israeli fund law and supervision | Example of the general rule (foreign-fund regulations reg. 4 require that statement) | BlackRock's page is unnecessary |
| ETF-52 | Harel, Kesem, IBI, MTF, Mor and Tachlit reports confirm the replication pattern | The funds' own facts confirming the ISA report | Keep as named examples |
| MF-15 | Meitav: most funds have no minimum | Example of the ISA guide's statement (p.21) | Meitav's page is unnecessary |
| SW-33 | Discount prices the supervised transfer at NIS 5 | Discount's tariff figure; the general rule is the BoI schedule's "(בפיקוח)" line and the NIS 10 cap on closing (part 4(א)(6)) | Name Discount; the supervised-price order is still not found (SW open question 10). This record sits in the switching file and may also be in another batch |

Not covered here: CAT-09, CAT-17 and CAT-24 (2.3 records of the tracks catalogue), which belong to the provident area; and the 63 primary records that list a company document beside the general rule (sweep 2.3, last paragraph). Under the founder's rule 1 those company sources should be dropped where the general source already carries the sentence; that is a mechanical pass for the editor, not research.

## Sources opened in this batch (2026-10-25)

| Title | Publisher | Strength |
|---|---|---|
| [המלצות הועדה הבין-משרדית להסדרת שירותי קסטודי – שאלות ותשובות (16.1.2013)](https://www.boi.org.il/media/cn1loswt/201305.pdf) | Bank of Israel, Supervisor of Banks | primary |
| [הודעה משותפת לעיתונות: המלצות ועדת הקסטודי (2.1.2012)](https://www.boi.org.il/media/c1whyt5l/קסטודי-6.doc) | Ministry of Finance, ISA, Bank of Israel | primary |
| [הודעה לעיתונות: המפקח על הבנקים מאמץ את המלצות ועדת הקסטודי (16.1.2013)](https://www.boi.org.il/media/1mgcq3p4/הודעה-לעיתונות-אימוץ-המלצות-ועדת-קסטודי.doc) | Bank of Israel | primary |
| [הוראת ניהול בנקאי תקין 461: פעילות תאגיד בנקאי כברוקר דילר (07/23)](https://boi.org.il/media/5tmn1zxi/461.pdf) and [חוזר ח-2751 (19.7.2023)](https://boi.org.il/media/35pd0sln/h2751.pdf) | Bank of Israel | primary |
| [קובץ שאלות ותשובות ליישום הוראה 461 (19.7.2023)](https://boi.org.il/media/jopowbbb/202325.pdf); old 461 amendments [ח-1931](https://www.boi.org.il/media/03efnhnw/h1931.pdf), [ח-2080](https://www.boi.org.il/media/lj5hje0b/h2080.pdf), [ח-2202](https://boi.org.il/media/1magx2ba/h2202.pdf); [תוכן עניינים כללי 100A](https://boi.org.il/media/yskjmlh5/100a.pdf) | Bank of Israel | primary (context) |
| [הוראת ניהול בנקאי תקין 447 (5/24)](https://www.boi.org.il/media/orgfwntb/447.pdf); [כללי גילוי נאות 1992](https://www.boi.org.il/media/rvzi1ngd/151.pdf); [כללי העמלות 2008](https://www.boi.org.il/media/mi2driua/159a.pdf) | Bank of Israel | primary |
| [מדריך לחברי הבורסה: החלק הראשון לתקנון](https://content.tase.co.il/media/q2mhob4u/274690.pdf) and [הנחיות](https://content.tase.co.il/media/g2ekpw4d/274691.pdf) | TASE | primary |
| [ISA, Conditions of the General Permit under Section 49A (December 2023), English](https://www.new.isa.gov.il/en/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-64d0945455c5c/Conditions_of_a_general.pdf) | ISA | primary (translation) |
| [שאלות ותשובות, היתר כללי לפי סעיף 49א (13.1.2025)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/QAA49a.pdf) | ISA | primary |
| [חוק ניירות ערך (תיקון מס' 63)](https://fs.knesset.gov.il/20/law/20_lsr_382526.pdf) | Knesset | primary |
| [תקנות דוח שנתי של קרן 2016, ק"ת 7646 (צילום)](https://olaw.org.il/takanot/takanot-7646.pdf) and [Wikisource](https://he.wikisource.org/wiki/תקנות_השקעות_משותפות_בנאמנות_(דוח_שנתי_של_קרן)) | Reshumot (mirrors) | primary (mirror) |
| [תקנות סיווג קרנות 2007, ק"ת 6625](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/dDKkjTfMz0H3iRxP7u8fphh3DPmvYX3FiarYq7bbZFo=); [ק"ת 7653](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/YeLGailVs4sAQNAXci5Zo3BCViCj7pr1tFrgiQP0KVw=); [ק"ת 8038](https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/MOnw27H4IBa9ZTkifP5j5xzxBdxgaU9CgjQ1742zkV4=); [ק"ת 7441](https://olaw.org.il/takanot/takanot-7441.pdf) | Reshumot | primary |
| [הוראה למנהלי קרנות בדבר ניהול ההשקעות בקרן מחקה (עדכון 3)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/mutualfund091024.pdf); ISA fund reports [2025](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/Funds_Report2025.pdf) and [2024](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-62bd445f910eb/fundsReport24.pdf); [ISA investor guide 2017](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-64186b589b352/080217.pdf) | ISA | primary |
| [ESMA/2014/937](https://www.esma.europa.eu/sites/default/files/library/2015/11/esma-2014-0011-01-00_en_0.pdf); [ESMA34-43-296 (AMF copy)](https://www.amf-france.org/sites/institutionnel/files/resource/ESMA%20Opinion%2034-43-296%20.pdf) | ESMA | primary (foreign) |
| [פקודת מס הכנסה, נוסח רשות המסים](https://www.gov.il/BlobFolder/legalinfo/law_pkudat_mas_hachnasa/he/LegalInformation_kesher_%D7%A4%D7%A7%D7%95%D7%93%D7%AA%20%D7%9E%D7%A1%20%D7%94%D7%9B%D7%A0%D7%A1%D7%94%20%5B%D7%A0%D7%95%D7%A1%D7%97%20%D7%97%D7%93%D7%A9%5D%20-%20%D7%9C%D7%90%20%D7%9E%D7%A8%D7%95%D7%91%D7%93.pdf); [סיכום פעילות החטיבה המקצועית 2019](https://www.gov.il/BlobFolder/reports/tax-professionaldivision/he/IncomeTax_IncomeTaxRepresentInfo_Professionaldivision2019.pdf); [טופס 747](https://www.gov.il/BlobFolder/service/notice-cost-declaration-for-traded-securities/he/Service_Pages_Income_tax_annual-report-2025_itc747-acc.pdf); [חוזר מס הכנסה 7/2003](https://www.gov.il/BlobFolder/policy/income-tax-professional-inst-7-2003/he/Policy_IncomeTaxInst_hoz7-2003.pdf) | Tax Authority | primary |
| [תקנות מס הכנסה (ניכוי מתמורה ... במכירת נייר ערך) 2002](https://www.btl.gov.il/Laws1/02_0103_100228.pdf) | National Insurance consolidated text | primary |

Tried and not used: BoI press-release and consumer pages (Radware; not worked around); EUR-Lex for the PRIIPs Regulation (empty response); the Hebrew original of the ISA general permit conditions and the CMA track list 2024-1471 (not found by search); a gov.il page found through a law firm's link (`pa230720-1`), which turned out to be an unrelated Tax Authority notice.
