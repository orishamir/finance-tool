# Interactive Israel (`interactive-israel`) and Interactive Brokers (`interactive-brokers`): binding prices, 2026-11-04

Read on 2026-11-04 under D56. Records: `data/fees/interactive-israel@2026-11-04.json` and `data/fees/interactive-brokers@2026-11-04.json`, new snapshots copied from the 2026-10-25 ones. Neither house is a bank, so the second round's current-account question does not apply. Neither is a TASE member: the exchange's fee calculator lists neither (read in Chrome today; the page text has no "אינטראקטיב", "Interactive", "MEXEM" or "IBKR").

**In one line.** Both price lists hold up for the reader's foreign fund. The catches are in the conversion, not in custody:
- **Interactive Israel**: the waived conversion in the recurring plan is printed in the binding tariff, but no document says at what rate the plan converts.
- **Interactive Brokers**: the 0.03% on automatic conversion is printed as "typically ... (at its discretion)". The only conversion price with no discretion is the spot order: 0.2 basis point, at least USD 2.

Neither house sells the reader a Tel Aviv fund:
- Interactive Israel: "ללקוחות מוסדיים בלבד".
- Interactive Brokers: still unsettled for an Israeli resident.

**No ranked price moved.**

---

## Interactive Israel (MEXEM LTD, CySEC; account carried at Interactive Brokers LLC or Interactive Brokers Ireland)

### 1. Claims and verdicts

| Claim (words, where, seen 2026-11-04) | What the binding documents say | Verdict |
|---|---|---|
| "0.01$ למניה מינימום 2.5$" for "חשבון אמריקאי / אירי / עסקי" (commission page /commission/, dateModified 2026-10-14; Wayback: "0.01$ למניה \| מינימום 2.5$" already on 2025-05-12) | Tariff p.1: "USD (Shares) 0.01, 2.5 USD"; cap "עמלת מקסימום במניות ארה"ב הינה 2% משווי העסקה" | **Guaranteed**, subject to the 30-day clause on every page (see "The documents") |
| "ללא דמי ניהול וללא דמי משמרת" (landing page /open-trading-account-27/, published 2026-10-21); "אין דמי החזקה כלל" (regulation page); "אין דמי שמירת ניירות ערך" (commission FAQ) | The tariff prints no custody, holding or management fee abroad. Its one custody fee is "עבור מניות ותעודות סל הנסחרות בבורסת תל אביב ... עמלת אחזקה (Custody Fee) בשיעור של 0.08%" (p.1) | **Guaranteed** for foreign securities. **Contradicted in part** for Tel Aviv securities, which only institutional clients can buy |
| "דמי מערכת: 0 ש"ח", "דמי ניהול: 0 ₪" (commission page); "אין דמי אי פעילות כלל" (regulation and open-account pages) | No account, system or inactivity line in the 8 pages. P.7: "תעריף זה חל על כל לקוח של החברה". Interactive Brokers' required-minimums page, for "Broker Client Accounts": "a USD 1.00 inactivity fee will be applied on a prorated basis to accounts having a Net Liquidation Value of less than USD 1,000.00 and generated commission of less that USD 1.00", when the broker's clients together fall short | **Guaranteed** in the house's own tariff. Interactive Brokers' rule may reach a small inactive account (still open) |
| "המרה משקל לדולר אמריקאי בעלות של ₪10 בלבד, ולפי שער רציף! בהמרה של עד חצי מליון שקלים" (commission page; Wayback: on 2026-01-15) | P.6, row "ILS (%)": "0.002 * Trade Value", minimum "10 ILS". The rate the conversion uses is not printed | Fee: **guaranteed if the row's "(%)" governs** (0.002%; 10 ₪ up to 500,000 ₪). Read literally, "0.002 × value" is 0.2%, which would be 1,000 ₪ on 500,000 ₪ (decision 1). "שער רציף": **not found** in a binding document |
| "המרה ללא עמלה – בהשקעה קבועה, הכסף יומר למט״ח ללא עמלת המרה"; "אין עמלת המרת שקלים או מט"ח כלל" (recurring page /recurring-transfer/, dateModified 2026-08-24) | P.6: "בזמן ביצוע המרת מטבע במסגרת תכנית השקעה אוטומטית קבועה אין חיוב בגין עמלת המרת מט"ח". No plan terms are published, and no rate is printed. P.7: "החברה שומרת לעצמה להסיר הטבה אשר ניתנה ללקוח ללא התראה מראש" | Fee waiver: **guaranteed as printed**, for any customer who sets up a plan. The p.7 removal clause hangs over it if the waiver counts as a "הטבה" (decision 2). Spread: **not limited by the documents** |
| "ללא מינימום הפקדה" (commission page) | Not in the tariff. It is a condition of opening, not a price | **Not found** (no binding document) |
| "העברת כספים או ניירות ערך בחינם" (open-account and landing pages) vs "משיכה אחת לכל חודש קלנדרי ללא עלות, כל משיכה נוספת ... 10$" (regulation page, open-account FAQ) | The tariff prints no withdrawal or transfer fee. "לא ניתן להעביר שברי מניות" (securities-transfer page) | Advertising contradicts advertising. **Not found** in a binding document |
| lp432: "0 ש"ח דמי ניהול", "*בתוקף עד 3 חודשים מיום פתיחת החשבון", "ההטבה מותנת בהפקדה ראשונית של מינימום ₪10,000" (a referrer's page, modified 2026-03-12) | Nothing in the tariff | **Offer** (a time limit and a deposit). Its words contradict the main site's unconditional "ללא דמי ניהול" |
| lp592: "מגיעה לכם הטבה שווה במיוחד בעמלות!" for members of one investment community; the company may drop it "ללא צורך במתן הודעה מוקדמת" | No price printed | **Offer** (a group, with discretion). Recorded in `left_out` |

### 2. The documents

| Document | URL | Printed date | File dates | Library |
|---|---|---|---|---|
| **Tariff (binding, newest)** | inter-il.com/wp-content/uploads/2026/09/תעריפון-עמלות-23.09.2026-1.pdf, linked "לתעריפון המלא" from /commission/ | "תעריפון זה מעודכן החל מיום 23.09.2026" | Created and modified 2026-09-23 17:06 IDT; Last-Modified 24 Sep 2026; same sha256 as on 2026-10-31 | 58a938374a90ac29 |
| Tariff 17.09.2026 (replaced) | …/2026/09/תעריפון-עמלות-17.09.2026.pdf | 17.09.2026 | 2026-09-17 | 716e0344c4fd7233 |
| Tariff 24.12.2025 (replaced) | …/2025/12/תעריפון-עמלות-24.12.2025.pdf | 24.12.2025 | 2025-12-24 | 125ba770013105ff |
| Site terms (Hebrew) | /terms-and-conditions-hebrew/ | – | – | 23e694465701bd30 |
| Interactive Brokers LLC client agreement (the account's agreement) | form 3203 | "10 January 2025" | 2025-01-10, same bytes today | b866cea6e6d76d50 |
| Advertising | /commission/, /recurring-transfer/, /regulation-and-security/, /open-account/, /open-trading-account-27/, /lp432/, /lp592/, /securities-transfer/ | – | WordPress dateModified: 2026-10-14, 2026-08-24, 2026-10-14, 2026-08-24, 2026-10-21, 2026-03-12, 2026-03-10 | efe5d0ead4cac314, 121e0bc56cfc7437, 7985bb305bf507e5, 90dcd9fae4840561, a4d4a11c25b42a15, 4d7a4a409e845d1e, 5ad86d08d233c06c, ae1286aa5939471a |

**Which is newest.** The 23.09.2026 tariff. The site's WordPress media list (95 PDFs, newest first) has nothing later. The 17.09 version differs from it only in the interest table. The 24.12.2025 version already printed the same conversion rows and the same plan waiver.

**Every page of the tariff** carries a 30-day clause: "העמלות המצויינות בהודעה זו תקפות כל עוד הושלם תהליך פתיחת החשבון (כולל שלב ההפקדה ושיקוף הכסף בחשבון המסחר) תוך 30 ימים ... הצעה זו הינה אישית ... שומרת לעצמה את הזכות לחזור בה מהצעה זו". A new customer who opens and funds within 30 days meets it.

**No fee annex of the house is published.** The site terms have no fee clause. They do say the company "עשויה לקבל תשלומים, עמלות או תגמולים מידי IB". The account itself is governed by Interactive Brokers' agreement. Its s.33A applies "a separate commission, fee or interest schedule ... based on Client's relationship to ... an introducing broker".

### 3. The ordinary customer's price

**Case 1: a Tel Aviv tracking fund or ETF in shekels.** Not possible. "באינטראקטיב ישראל נכון להיום, קנייה ומכירה של ניירות ערך ישראלים הנסחרים בבורסת תל אביב ניתנת ללקוחות מוסדיים בלבד" (israeli-stock-market page, re-read today). The record keeps `available: false`.

**Case 2: a US ETF (or an Irish UCITS ETF in London), from shekels.**
- Trade, US: **USD 0.01 a share, at least USD 2.5, at most 2% of the trade** (p.1). A fraction is counted as a whole share.
- Trade, Europe: **0.15%, at least 2.5 in the trade's currency** (USD for CSPX on the LSE).
- Conversion of a lump sum: **0.002% of the value, at least 10 ₪** (p.6), under the "(%)" reading (decision 1). The spread is **not limited by the documents**.
- Conversion inside the recurring plan: **0** fee (p.6). The rate is **not limited by the documents**.
- Recurring plan: no fee of its own ("שירות ללא עלות נוספת מעבר לעמלות הרגילות"). Each purchase pays the regular commission, so the USD 2.5 minimum applies to every monthly buy.
- Custody, account, system and inactivity fees: **0** in the tariff. Interactive Brokers' USD 1 a month for small inactive introduced accounts may apply (`left_out`).
- Sales in the US: SEC and FINRA fees, about 0.002% of the sale ("אגרות רגולטוריות קטנות (SEC/TAF) בעת מכירה", commission FAQ). The tariff names only OTC fees.
- Withdrawals: one free a month, then 10$ (advertising only). Transfers out: no fee printed, but fractional shares cannot be transferred.
- Market data: optional. A cash balance may be charged "בהתאם לריביות הבנקים המרכזיים" (p.7, no rate).

**Groups (D43).** The tariff names none. lp592 offers one community an unstated benefit. State stays `no_mention`, and the lp592 offer is in the note and in `left_out`.

### 4. What changed in the record

- `snapshot` 2026-11-04. Every `checked` is 2026-11-04. `tariff.notes` now holds the dates, the hash, the evidence that no newer tariff exists, the 30-day and removal clauses, and the agreement's introducing-broker clause.
- `interactive-israel-custody-foreign`: the source moved from the commission page (advertising) to the tariff, p.1. **Value unchanged: 0.**
- `interactive-israel-account-fee`: the source moved from the commission page to the tariff, p.7 ("תעריף זה חל על כל לקוח"). **Value unchanged: 0.**
- `interactive-israel-fx-ils`: new `spread`, value null, not limited by the documents.
- `interactive-israel-fx-recurring-plan`: new `spread`, value null, with the reason (no rate printed, no plan terms). The rate's notes now carry the p.7 removal clause. **Value unchanged: 0.**
- `left_out`: was empty, now 9 entries: the TASE lines, withdrawals, US regulatory fees, market data, Interactive Brokers' inactivity rule, interest on cash, the 30-day clause, fractional shares, and lp432/lp592.
- `groups.note`: re-read, and lp592 named.

### 5. Still open

- **The rate inside the recurring plan.** Is it Interactive Brokers' automatic conversion, with its discretionary markup? Settled by a written answer from the company (support address in the site terms) or a plan customer's statement showing the conversion rate against the market rate.
- **The "(%)" reading of the conversion row** (decision 1). Settled by the company in writing, or by a statement of a lump-sum conversion.
- **Interactive Brokers' USD 1 inactivity rule:** does it reach Interactive Israel's clients or the company? Settled by a statement of a small, idle account.
- **Whether an Irish-regulated account can buy US-listed ETFs** (BRK-44). It is still open, and the record keeps its note.

---

## Interactive Brokers, direct (IBKR Pro)

### 1. Claims and verdicts

| Claim (where, seen 2026-11-04) | What the binding documents say | Verdict |
|---|---|---|
| "IBKR charges no custody fees." (footer of the stock and spot pages) | The same sentence continues: "Custody fees may be charged by third parties." The other-fees page, "Pass-Through Custody & Maintenance Fees", lists "Tel Aviv Exchange, Custody Fee, ILS denominated stocks, 0.08 %", note 1: "Annual rate applied to value of portfolio ... charged on a daily basis". There is no US, UK or Irish row | **Guaranteed** for US and London listings. Tel Aviv: a 0.08% a year pass-through. The old record priced it at 0 on `etf_units` (corrected; not ranked) |
| "Account Minimums USD 0.00", "Inactivity Fees USD 0.00" (required-minimums page) | Binding through the agreement's s.33A ("rates and terms specified on the IBKR website") | **Guaranteed** for a direct client |
| Spot FX: "no mark-ups on quotes", "IBKR passes through the prices that it receives and charges a separate low commission" (spot page) | Same page, binding: "0.20 basis point * Trade Value", "Tier I - USD 2.00" | **Guaranteed** |
| Auto conversion: "IB will typically add or subtract (at its discretion) 0.03% to the exchange rate" | Agreement s.32C: the automatic conversion rate "may be adjusted from the rate that otherwise would apply" | **Not limited by the documents.** 0.03% is the printed typical figure, not a ceiling |
| "IBKR allows two free withdrawal requests per calendar month" (other-fees) | After the second: "ILS 30.00" bank transfer, "USD 10.00" wire | **Guaranteed**, as printed |
| "IBKR does not charge for incoming or outgoing ACATS transfers" (other-fees) | – | **Guaranteed** (ACATS is a US-to-US transfer) |

### 2. The documents

- **The price pages** on interactivebrokers.com: commissions-stocks, commissions-spot-currencies, other-fees, required-minimums and market-data-pricing. They are undated. Re-read today with every line value unchanged. The same tables are on interactivebrokers.ie. Library ids: 0bf0534869b59d82, 51e812af38fbaa9d, b17986382a1c06f6, 7711515829b48b49, a66f538c1edda99a. The pages say "IBKR may change these rates at any time in its sole discretion". The agreement makes changes effective "upon posting on the IBKR website" (s.33B).
- **Client agreement, Interactive Brokers LLC**, form 3203, "10 January 2025". Same bytes today (b866cea6e6d76d50).
- **Customer agreement, Interactive Brokers Ireland**, form 4750: "Costs and Charges are as specified on the Pricing section" (8344401953b5e137, version 2024-04-24, not re-fetched).
- **The newest binding text** is the price pages as read today. They carry no date, so there is no newer list to look for. The FINRA fee holiday ("Oct 1, 2026 through Dec 31, 2026") is printed on the stock page.

### 3. Which entity, and who may open

- **Not settled by any page read.** The rule base already holds the pieces (BRK-43):
  - The entity "is generally based upon the account holder's country of legal residency".
  - The regulator's section 49A list names Interactive Brokers LLC and Interactive Brokers (U.K.) Limited. Interactive Brokers Ireland is not on it.
  - IBKR Lite is closed to a resident of Israel.
- Today's added evidence is weak:
  - Third-party sites say an Israeli opening directly is placed with Interactive Brokers LLC.
  - A search engine lists an IBKR knowledge-base article (node 3382) saying TASE trading is for non-Israeli residents and tax-exempt Israeli corporate clients.
  - That article itself could not be opened: it redirects to search or returns 403, and the Wayback Machine has no copy. It is logged in `tried`.
  - The FAQ page now answers through an AI assistant, which cannot be cited.
- So the Tel Aviv lines stay ungraded (`unknown`), as before. For a foreign ETF, the reader can open a direct account at whichever entity Interactive Brokers assigns. No page names it.

### 4. The ordinary customer's price (Case 2; Case 1 is ungraded)

- Trade, US ETF, Fixed: **USD 0.005 a share, at least USD 1.00, at most 1% of the trade** (when 1% is below the minimum, 1% is charged). Sales add the SEC fee (0.0000206 × the sale) and FINRA CAT (0.000003 × the shares).
- Trade, London USD (CSPX), Fixed: **0.05%, at least USD 4.00**.
- Conversion by spot order: **0.002% (0.2 basis point), at least USD 2.00**, no markup on the quote.
- Conversion by automatic conversion: **no commission**, and the markup is **not limited by the documents** (typically 0.03%). This is the line the indices page uses today.
- Custody, account and inactivity fees: **0**. Market data: optional.
- Withdrawals: two free a month.

### 5. What changed in the record

- `snapshot` 2026-11-04. Every `checked` is 2026-11-04. `tariff.notes` now carries the agreement clauses that make the website binding.
- `interactive-brokers-custody`: `applies_to` was foreign securities and ETF units, now **foreign securities only**. The notes give the pass-through table. **Value unchanged: 0.**
- New line `interactive-brokers-custody-tase`: **0.08% a year on `etf_units`**, sourced to other-fees. It is not ranked, because the class is `unknown`.
- `interactive-brokers-fx-spot`: rate **null → 0.002 (pct_of_trade)**. The old note said there was no basis-point unit, but 0.2 bp is exactly 0.002%, the unit Interactive Israel's record already uses. **This moves no price**: the page asks for the automatic-conversion band at this house (`FX_BAND` in `site/app/lib/invest.ts`).
- `interactive-brokers-fx-auto-conversion`: notes only. "Not limited by the documents", with the agreement's s.32C. **Value unchanged: 0.03.**
- `left_out`: 4 entries added (withdrawals after two, US regulatory fees, market data, LSE Tiered exchange fees). The two old entries are kept.
- The doubt words on the Tel Aviv and LSE-Tiered lines are unchanged. The leftover list in `price-premises.test.ts` still matches.

`npm run validate`: data/ is valid, with the usual warnings only. `npx vitest run`: 101 files, 1499 passed, 1 todo, 0 failed.

### 6. Still open

- **Which entity serves an Israeli resident, and whether that client may trade Tel Aviv.** Settled by Interactive Brokers in writing, or by an Israeli direct customer's Activity Statement header and a TASE order ticket.

---

## Decisions for the founder

1. **Interactive Israel's conversion row.** The row "ILS (%)" prints "0.002 * Trade Value". The record reads it as 0.002%, as the "(%)" header and the advertised "₪10 ... עד חצי מליון" both say. Read literally it is 0.2%, which D56's "the most the documents allow" could demand. The difference:
   - A one-off 67,000 ₪ conversion: 10 ₪ against 134 ₪.
   - A 500 ₪ monthly conversion: none, because the 10 ₪ minimum applies under both readings.
2. **Interactive Israel's plan waiver under "להסיר הטבה ... ללא התראה מראש" (p.7).** Is the plan's zero conversion a guaranteed price or an offer? It is printed as a rule for every plan conversion, and the tariff never calls it a benefit. My reading: guaranteed.
3. **Interactive Brokers' conversion line.** The page prices conversion at the automatic-conversion markup, which is typical and discretionary. The binding alternative is the spot order: 0.002%, at least USD 2. It is dearer on a 500 ₪ monthly sum (USD 2 against about 0.15 ₪) and cheaper on 67,000 ₪ (USD 2 against about 20 ₪). Switching is a ranking change in code (`FX_BAND`), so it is the lead's and the founder's call.

## Advertising the binding documents contradict

- Interactive Israel: "אין דמי החזקה כלל" (regulation page) vs the tariff's "עבור מניות ותעודות סל הנסחרות בבורסת תל אביב ... עמלת אחזקה (Custody Fee) בשיעור של 0.08%". This applies to Tel Aviv securities only, which a private client cannot buy.
- Interactive Brokers: "IBKR charges no custody fees" vs other-fees "Tel Aviv Exchange, Custody Fee, ILS denominated stocks, 0.08 %". The claim itself adds "Custody fees may be charged by third parties". This applies to Tel Aviv only.

No other advertised claim about the reader's foreign fund is contradicted by a binding document.
