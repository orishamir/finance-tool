# Who can hold an exemption from withholding on securities, and can an ordinary private saver? (2026-11-12)

Why: BRK-65 says a private client cannot trade on the Tel Aviv exchange at Interactive Israel. One of the company's pages says that trading is for institutional clients only; another (https://www.inter-il.com/world-markets/) opens it also "לחברות או לפרטים עם פטור מתשלום מס בניירות ערך במקור". The rule base had no rule on that exemption (see `research/2026-11-12-tase-access.md`, "Still open" 2 and "Route 4"). The result is TXS-42 in `tax-securities-israeli.md` and `data/rules/txs-42.json`.

## The answer

- **By law**, withholding on securities falls away for a holder in three ways: the holder is on the list in the schedule of the 2005 interest-and-dividend withholding regulations (which the 2002 securities regulations take over); the assessing officer reduces the withholding in writing (reg. 11); or a foreign resident files form 2402 (reg. 5).
- The list names bodies only, except item 13: "כל אדם אחר שאושר לענין זה בידי פקיד השומה לאותה שנת מס". In the Ordinance "אדם" includes a company, so the words do not shut out an individual.
- **In practice**, the Tax Authority's execution instruction 02/2026 says companies and cooperative societies get the "capital-market section" of a withholding approval, and individuals, as a rule, do not: the assessing offices are blocked from giving it to an individual. Only exceptional cases, or an individual with a capital-market business and a financial-institution file at VAT, are examined, at head office.
- **For the site's reader:** a salaried saver with an ordinary account will, as a rule, not hold such an exemption. The instruction does not define an exceptional case (TXS open question 25).

## What each document says

All read on 2026-11-12.

1. **Income Tax Ordinance, Tax Authority text** (library 4d9d397e88b5931d).
   - p.238, s.164: whoever pays "או של תמורה כמשמעותה בסעיף 88, או של ריבית או דיבידנד" withholds "בשעת התשלום מן הסכום המשתלם מס באופן ובשיעורים שנקבעו". This is the duty's source.
   - p.12, s.1: "אדם" - "לרבות חברה וחבר בני-אדם".
2. **Securities withholding regulations 2002, as enacted** (קובץ התקנות 6218, 31.12.2002; library fff7dae4ada3e653; the text layer is OCR and was checked against the words cited).
   - p.5 (gazette p.377), reg. 11 "תיאום ניכוי המס": "פקיד השומה רשאי להתיר בכתב, כי ניכוי המס לפי תקנות אלה יוקטן, אם היה סבור, שעלול להתהוות עודף מניכוי המס".
   - p.4 (gazette p.376), reg. 5 "פטור לתושב חוץ": a financial institution does not withhold on an exempt capital gain if the foreign resident files "הצהרה בטופס 2402 על היותו תושב חוץ ועל זכאותו לפטור" within 14 days of opening the account and once every three years when in Israel.
3. **The 2005 amendment** (קובץ התקנות 6449, 29.12.2005; library c10a43b96d634c6d).
   - p.2 (gazette p.284), s.2(1)(ד): the new seller's definition, "אדם המוכר נייר ערך, מי שהוא צד לעסקה עתידית או בעל יחידה, למעט אדם מן המפורטים בתוספת לתקנות מס הכנסה (ניכוי מריבית, מדיבידנד ומרווחים מסוימים), התשס"ו-2005".
   - p.3 (gazette p.285), s.7: reg. 5 now reads "הגיש מוכר שהוא תושב חוץ".
4. **Interest-and-dividend withholding regulations 2005, the schedule** (same gazette, p.12, gazette p.294). Its 13 items: the State and public bodies taxed like it; a local authority; the Jewish Agency and the World Zionist Organization; Keren Kayemeth; Keren Hayesod; "מוסד ציבורי - כהגדרתו בסעיף 9(2) לפקודה, שאישר המנהל לענין זה"; a provident fund; a banking corporation; an insurance company; a city association; a religious council; a mutual fund; and "כל אדם אחר שאושר לענין זה בידי פקיד השומה לאותה שנת מס".
5. **Later amendments.** Read: the gazettes 7029 (2011, reg. 9), 7071 (2012, rates), 7076 (2012, the interest regulations' regs. 1, 2, 4, 5, 7, 8, 10, 14, 20), 7335 (2014, regs. 3ב, 4(ד)) and 7907 (2017, payment dates). None touches the seller's definition, reg. 5's substance, reg. 11 or the schedule. Nothing after 27.12.2017 was checked (TXS open question 3).
6. **Execution instruction 02/2026, "אישורי ניכוי מס במקור ואישורים לפי חוק עסקאות גופים ציבוריים לשנת המס 2026"**, 19.1.2026, https://www.gov.il/BlobFolder/policy/inst-02-2026/he/IncomeTax_inst-02-2026.pdf (library 1ee7604c74eb21aa).
   - p.2, s.1: the assessing officer may reduce the rate "ואף לאפסו אם שוכנע כי יוותר עודף מס". Approvals are electronic only, not printed or mailed. Each payer checks the payee's approval online before paying. The new approvals run "מיום 1.1.2026 עד לתאריך 31.3.2027".
   - p.12, s.6.3: a payer checks the rate on the Tax Authority's site with its own ID and the payee's file number; "פלט האישור יופנה אל המשלם".
   - p.15, s.8.6: "בקשה לאישור פטור מניכוי מס במקור ליחידים יש להגיש באמצעות טופס 2542".
   - p.21, s.12.1: a one-off approval (for example for a capital-gain transaction) lasts three months; "יובהר כי, אישור זה אינו תקף לחבר בורסה לניכוי משוק ההון".
   - p.29, s.18: the "סעיף שוק ההון" covers interest and all capital-market income, "לרבות הכנסות מעסקאות עתידיות ונגזרים".
     - s.18.1: companies and cooperative societies are entitled after the report under s.91(ד)(2ג)(ב) and the usual check.
     - s.18.2: so is a partnership made only of companies.
     - s.18.3: "ככלל, יחידים לא יהיו זכאים לאישורי ניכוי מס במקור הכוללים סעיף שוק ההון. לפיכך חסומה האפשרות בפני משרדי השומה לשדר זכאות לאישורים עבור יחידים בסעיף האמור לעיל." Then: "במקרים חריגים בלבד בהן עולה צורך באישור הכולל את סעיף שוק ההון או כאשר ליחיד הכנסות מעסק בשוק ההון והוא פתח תיק מוסד כספי במע"מ, יש לפנות לאגף השומה בחטיבת שומה וביקורת".
   - p.32, s.20: who may issue each kind: "אישורים ליחידים בסעיף "שוק ההון" – אגף שומה בחטיבת שומה וביקורת".
   - The 2025 instruction 01/2025 (library 78c31b1b11d93324) has the same text as its s.17.
7. **Tax Authority guide "דע זכויותיך וחובותיך 2025"** (library 5012033e55e0c415), file p.120 (printed p.118), s.9(ג): whoever expects his tax to be lower than what will be withheld from non-salary income may ask the assessing officer, who "יקבע לו שיעורים מוקטנים או יפטור אותו לגמרי מהניכוי". "האישור יכול להיות כללי או מפורט למנכה או למספר מנכים". s.9(ד): "אישורים על פטור מניכוי במקור לא ינתנו או ישללו" from anyone with collection defects. General, with no word on securities.
8. **Form 2542, "בקשה לפטור/הקטנה של ניכוי במקור"** (5.2002), https://www.gov.il/BlobFolder/service/itc2542/he/Service_Pages_Income_tax_itc2542.pdf (library a27c9eea6e77e30c). Its text layer is ISO-8859-8 shown as MacRoman glyphs in visual order; it was read after re-encoding and reversing each line. The payment types it offers: construction and transport, clothing, metal, electricity, electronics, diamonds, agriculture, services and assets, writers, insurance commissions, artists, examiners, lecturers, office services, athletes, other. No securities income.
9. **Notice of 19.5.2025 on forms 746 to 748** (library cbb3d775be9e3a8f). Form 748 lets an individual with an active file ask the assessing officer for an exemption from withholding when donating traded securities, and show it to the TASE member for that transfer (p.1, s.א.2; p.2, s.א.3 "מיועד לנישומים יחידים בלבד שהם בעלי תיק פעיל"). It opens no trading.

## What BRK-65 should gain (for the domain-specialist)

Pointing to TXS-42.
- English, after the world-markets sentence: "Under the Tax Authority's execution instruction 02/2026, s.18.3, an individual, as a rule, cannot get such an exemption for securities; only exceptional cases, or an individual with a capital-market business, are examined, at the Authority's head office (TXS-42). So an ordinary private client is not in that second group either."
- Hebrew card, after "פטור מתשלום מס במקור בניירות ערך.": "לפי הוראת רשות המסים לשנת 2026, אדם פרטי ככלל לא מקבל פטור כזה, ורק מקרים חריגים, כמו מי שעוסק בשוק ההון כעסק, נבחנים בהנהלת הרשות; לכן גם לפי העמוד הזה לקוח פרטי רגיל לא יכול לסחור שם."

## Leads (not cited)

- A search summary pointed to the gov.il service page for form 2542 and to a 2008 Tax Authority letter on reg. 11 for dividends to a controlling holder (via an accountants' site). Not read; the 2026 instruction is the current text.
- Accountants' and law firms' notes (prisha.co.il, meitar.com, capitax.co.il) on form 748. They led back to the Tax Authority's notice, which was already in the library.
- Search summaries on the Tax Authority's 2025 instruction on withholding approvals (efraty.com, bookkeepers.org.il). They led to instruction 01/2025, then to 02/2026.
- Bank pages (Mercantile and Discount securities-taxation pages, library 6f64a56d0f6c74cb, c55b9fbe99e51650): a foreign resident's declaration once every three years; Discount: "ככל ולחברה קיים פטור בתוקף מניכוי מס במקור מהכנסות ריבית ושוק ההון, לא ינוכה מס במקור ע"י הבנק". These are the banks' own pages and only echo the texts above.

## Tried and failed

- gov.il service pages (`/he/service/itc2542`) answer 403 to WebFetch and to curl. FlareSolverr requests were refused by this session's permissions, so the service page was not read. The form's PDF came by plain curl.
- An official consolidated text of either regulation after 2017: not found. National Insurance's Laws1 copies (02_0103_100228, 02_0103_100269) end in January 2018, are copies, and served only to find the gazettes.
- Web searches for an amendment of either regulation in 2019 to 2025: none found.
- `Guides_IncomeTax_da-2026.pdf`, `inst-01-2026` and similar paths: 404.
- capitax.co.il through WebFetch: Hebrew garbled.

## Still open

1. What the instruction means by an exceptional case (TXS open question 25). Would settle it: a Tax Authority answer or a published procedure.
2. Amendments after 27.12.2017 (TXS open question 3).
3. What Interactive Israel means by "פרטים עם פטור": a company's own words, BRK-65's to settle. Reg. 5's foreign residents are one group of individuals who are not withheld, but they are not this site's readers. No text read says which group the company means.
