# Independent check: rules-open-questions (2e04056e, 2d8a2444)

2026-11-06. The checker did none of this work. It read the diff against main, opened each cited source and ran the data check and the pipeline tests. No site build.

## Verdict: fail (three small fixes, then pass)

## What holds

Every source was read in the library copy unless noted.

- **BRK-05 / BRK OQ2, narrowed.** Bill 1884, p.2 (gazette 896): the explanatory notes contain "אינם נתונים כיום תחת פיקוח ואסדרה מקיפים", and they say TASE regulates and supervises members and the Supervisor of Banks supervises banks. The Knesset OData was queried live: KNS_Bill(2234109) StatusID 141 = "הונחה על שולחן הכנסת לקריאה ראשונה", LastUpdatedDate 2025-07-13; plenum session 2233145 is number 306 of 9.7.2025; KNS_CmtSessionItem is empty. Narrowed, not closed: right.
- **BRK OQ12, closed.** The Bank of Israel fees page was read live in a browser (Radware blocks curl). Under "העברת ניירות ערך לחשבון אחר של אותו לקוח בגוף פיננסי אחר" it says "סכום העמלה המרבי שניתן לגבות בעד השירות יהיה 5 שקלים חדשים, בתוספת החזר ההוצאה ששילם התאגיד הבנקאי לצד שלישי". This matches SW-33. Closing is right.
- **BRK-24 / BRK OQ14, narrowed.** TASE rules p.35: s.29ב "טרם כניסתו לתוקף של השינוי" and s.29ג(2), (3) say what the rule says. Narrowed, not closed: right, because no number of days was found.
- **BRK-62.** Guidelines p.105, s.29א(ד)(1)-(3): wording, the exception for a closed source account and the pledge limit all match. The joint report, p.30, contains "יוחזרו לאותו חשבון מקור ממנו הם הגיעו" and "אינו חל בין בנק לבנק", and describes the exemption from face-to-face identification. The rule says it applies to non-bank members only.
- **ETF OQ7, narrowed.** fundsReport24 p.12: footnote ** on the 0.51% ETF average, the 55/49/3/3 counts and the 1 January sentence are all there. Narrowed is right.
- **ETF OQ14, closed.** The question was whether tracking funds and ETFs carry a distribution fee. MF-25 (reg. 5) and MF-26 (reg. 2(ב)) answer it. The one reading left unconfirmed, the fund-type number in the report footnotes, is labelled as unconfirmed. Closing is acceptable.
- **MF-67 / MF OQ3, narrowed.** Clearing-house bylaws part B, ch. י"ב, pp.88-92: s.2ד(1) Friday prices by Sunday 15:00; s.2ד(2)(ז) the designated hour reported per fund; s.3 orders no later than the hour, and changes allowed until then; s.4ב(2)-(3) last known prices, including Friday orders in a fund limited in foreign securities; s.4ג(1)-(3) first clearing round on the next business day, and the cap at units held; s.4ח; s.5ב quoted exactly. TASE rules s.27א, 27ג on p.35 also match.
- **MF OQ5, narrowed.** Harel and Migdal p.8 both contain "חזרתו מהתחייבותו לאימוץ המתווה ... רק ביום 1 בינואר". Meitav p.67 counts the variable fee within the outline. Each is cited as that manager's own text. The ISA 2024 sentence is quoted exactly.
- **MF OQ17, closed.** ספר החוקים 3510, file pp.11-12, s.15, amendment no. 32: the "נותן ערבות אחר" definition and the addition to ss.9(א)(3) and 13(א)(3) are as stated.
- **Renumbering.** On current main (6f8bf97c, fetched), BRK-60, BRK-61, BRK-62 and MF-67 are unused. Every remaining BRK-54/55 reference in data/, packages/, docs/ and the engine means PEPPER or First International (data/fees, F-12, fees.ts, workbench.ts, standing-order.test.ts, data/rules/brk-54.json, brk-55.json). Nothing outside research/ (records of their day) means the directive 460/415 rules by those ids.
- **Data files.** The extractor was re-run in place and then reverted. brk-24.json and sw-52.json are exactly its output; neither lost a field. The MF-OQ17 and BRK-OQ12 references are gone from the instrument records, and no other record cites BRK OQ12, ETF OQ14 or MF OQ17.
- `npm run validate`: data/ is valid. `npx vitest run packages/pipeline`: 171 of 171 pass.

## Must fix

1. **BRK-18's record still says the price was not found.** In data/rules/brk-18.json, text_he ends "המחיר המפוקח עצמו נקבע מחוץ לכללים ולא נמצא", and the figure note says "set outside the rules and was not found (BRK OQ12; SW-33 cites Discount's NIS 5 ...)". Both contradict the closure and the edited brokerage-account.json note. The site shows this text.
2. **SW-52's record keeps the old claim.** data/rules/sw-52.json text_he still says "הצו שקובע את המחיר לא נמצא, ולכן אין כאן עדיין כלל שחל על כל הבנקים". The rule base now says the amount is the Bank of Israel's and only the unit is unsettled. The same cleanup applies.
3. **BRK-24's first source is now an English working title.** The new Source link is "[the same rules](...274690.pdf#page=35)". The extractor sorts it first, with title "the same rules" and no title_he. Effects:
   - The data check warns ("first source lacks publisher_he or title_he": 34 on main, 35 here, BRK-24 added).
   - The search index (site/app/routes/search-index.ts) loses BRK-24's Hebrew source title.
   - The rule's first source shows as a bare host.
   Fold s.29ג(3) into the existing 274690 link's locator ("p.35, s.29ב, 29ג(2), 29ג(3)", checked 2026-11-06) and re-extract.

## Should fix

- **BRK-24, locator:** "guidelines s.29א(א)" for changing an online agreement by a new one is s.29א(ב) (p.105).
- **BRK-24, unlabelled inference:** "A change of fees is a change of the agreement" is a reading, not the text. s.29ג(2) puts the rates "ודרך חישובם" in the agreement, so an agreement that prices by reference to a published tariff might not change when the tariff does. Label it as read from ss.29ב and 29ג(2).
- **Merge conflict:** merging into current main conflicts in research/library/tried.jsonl, an append-only file. Keep both sides' lines.
- **Stale pointers:**
  - mutual-funds-and-money-market-funds.md, the "Likely to change" line near MF-60, still points to "open question 17", now closed.
  - docs/method.md G-26 says "Still open: current cut-off hours"; it could add that the clearing house sets no hour and each fund's hour is its own (MF-67).
  - The daily money-market guide (site/app/content/guide/money-market-fund-daily.tsx) still says Friday orders are unverified. MF-67 and the prospectuses now partly answer this for funds limited in foreign securities. This is a site wording change for its own small change.
- **Older drift, not this branch:** re-running the extractor would strip hand-added quotes and titles from brk-54.json, brk-55.json and about 20 other records. Do not run the extractor over all records when fixing must-fix 3; re-extract BRK-24 alone, or restore the others afterwards.
