# Job 6: what the guides are missing (issues 96 and 112), 2026-10-31

Nothing changed in `site/`, `data/`, `packages/` or the rule base. Both issues stay open: they end in a screen change, which needs the founder's mockup, and for issue 96 in new records under `data/`.

**How "shown" was judged.** I took the visible text of each built guide page (`site/build/client/guide/<id>/index.html`, built 2026-10-31 03:45), without the page's hidden data, and looked for the rule ids and the words. A rule whose id is on the page counts as shown. Words found only in the glossary at the foot of the page do not count. For "held" items I read the rule's title and, where the report quotes it, the record; these are pointers, not new rule statements.

**Coverage.** Study fund, securities account, provident fund for investing, both money-market funds, makam, bank deposit, savings plan and government bond were checked. IRA study fund, comprehensive pension and both child savings guides got a light pass (rule comparison only, no library search). Current account, IRA provident, general pension and provident fund for annuity were not reached.

## Issue 96: savings plans beyond Leumi's

The site holds one record, Leumi's 3-year fixed plan (`data/terms/deposits/leumi-tashlumim-shekeli-3y.json`). Each line below is that bank's own published term, read 2026-10-31 from the library.

| Bank | Plans read | Place | Rate read |
|---|---|---|---|
| Leumi | 4 plans: 503/3 fixed 3 years; 504/1 prime 3 years; 506/6 fixed 5 years; 508/2 CPI-linked 15 years | `1bf86700e4adabf1` pp.33-35 | 1.50%; P-3.2% = 1.55%; 2.00%; 1.00%, data correct to 01.11.2026 |
| Mercantile | 8 plans: target to 24 months and to 180 months, standing order 3 years, monthly, half-yearly and yearly liquid 5 years, 10 years, 18 years | `1d8ca6d4396851bd` p.1, valid from 3.9.26 | 0.30% to 0.75%; 0.80% to 2.40%; prime minus 2.75%; and others |
| Discount | 2 families: "חיסכון ליעד קצר" (1 to 24 months), "חיסכון ליעד ארוך" (2 to 18 years), 50 to 30,000 | `cbb6340e1e5ded8c` p.1 (the bank's rate file, JSON) | 0.50% to 1.25%; 1.25% to 2.50% |
| First International | "פיקדון אופק" 6 years, 100 to 2,000; "חיסכון גמיש" 4 years, from 50 | `d8611c5ceda97619` p.1 | prime minus 1.75%, 3.00% effective as of 06.09.26; second rate not on the page |
| Massad | "אופק להשתלמות" 6 years, at least | `799451be3ded1425` p.1 | prime minus 2%; amounts not read |
| Yahav | "חסכון גמיש חדש" 2 years, from 200; "חרמון חודשי" 10 years, from 100 | `124adbb22147699a` pp.2, 4 (board 13_26, 06/10/2026) | P-4.70% = 0.05%; stepped 1.25% to 1.85%. Columns are jumbled in the text; check against the rendered page before use |
| Hapoalim | "חיסכון גמיש" to 24 months, 50 to 7,500; two forms with blanks | `7d20ea72363882fc` pp.1-2; `530208756e1866f1`; `b97f140f8ce957b0` | not on the sheets; rate page blocked, **not checked** |
| Mizrahi-Tefahot | "פיקדונות ענבים", 6, 18 or 25 years, from 100 | `9013a7d9f3fdec72` p.1 | the rate list in the library is empty, **not checked** |
| Jerusalem, One Zero | | | **not checked**: blocked. Jerusalem's library file `fb822c7f76b85dad` is a captcha page, not a document |

Discount's file does not itself say the deposits are monthly; rule BANK-38 records the bank's filter "פיקדון בהוראת קבע". Treat it as that bank's plan family only after reading the page in Chrome. The rates differ by term and exit points, so a range needs a chosen term first. A 3-year plan is printed by Leumi, Mercantile and Discount.

**What is left:** add the plans as records under `data/terms/deposits/`, then a mockup in which the guide's example shows a range over collected plans of one term, not Leumi's plan. The rate pages listed above are on `chrome-list.md`.

## Issue 112: examples that still stand on one bank

| Guide | Today | What the site already holds | Where the wording sits |
|---|---|---|---|
| Bank deposit | Leumi's terms | One-year deposits of Leumi, Hapoalim, Discount, Mizrahi-Tefahot in `data/terms/deposits/` | `copy.ts` 2957, `onlyLeumi` at 2860, `bank-deposit.tsx:189` |
| Securities account | Leumi's tariff and fund 5139282 | `data/fees/` tariffs | `content/guide/brokerage-account.tsx:103-105`, `copy.ts` 3027-3036 |
| Makam | Leumi's commission; line "בנקים אחרים עוד לא נאספו" is out of date since 2026-10-26 | 12 tariffs with a makam line, below | `copy.ts` 2845, 2860, `makam.tsx:173` |
| Government bond | "התנאים והתעריף בדוגמה הם של לאומי" | `data/fees/` | page line from `copy.ts`; `guide-signature.server.ts:97` |
| Daily money-market fund | Roadmap says it runs on Leumi's tariff; the visible page names Leumi only for national insurance | `data/fees/`; ladder already a range over four banks (method F-86) | `guide-signature-bundle.server.ts:239` |

Makam commission over the collected tariffs (latest snapshot, percent of the trade, minimum in NIS, direct channel where there are two). All from `data/fees/<provider>@<date>.json`:

Psagot 0.05, 2 (2026-10-23) · Altshuler Trade 0.10, 3.5 (2026-10-23) · IBI 0.10, 3.5 (2026-10-23) · Yahav 0.09, 13 (2026-10-31) · First International 0.10, 15 (2026-10-31) · Hapoalim 0.10, 15 (2026-10-31) · Massad 0.10, 16 (2026-10-31) · Mizrahi-Tefahot 0.10, 17.1 (2026-10-31) · Leumi 0.095, 18 (2026-10-23) · Discount 0.09, 22.5 (2026-10-31) · Mercantile 0.09, 22.5 (2026-10-31) · Jerusalem 0.09, no minimum read by my script (2026-10-31). No makam line: Excellence, One Zero, Interactive Israel, Interactive Brokers, Meitav. Meitav Trade and Phoenix: tariff missing.

**Recommendation for the mockup:** a range or count over all collected tariffs, as the money-market ladder already does. Each guide is a screen change, so it waits for the mockup.

## Missing facts, guide by guide

Count at the end. "Held" means it only needs showing.

### Study fund
**Held and not shown (12)**
1. Is there a shekel limit on deposits, and what happens above the tax ceiling? KH-07.
2. Who gets the money if I die? KH-26.
3. What track am I in if I never chose? KH-19, PF-24.
4. Can the manager raise my fee, and with what notice? PF-14, PF-16.
5. What do people actually pay? KH-23 (0.34 to 0.74 over tracks, 202609), PF-39, `data/cma/gemelnet@2026-09.json`.
6. Do I need an agent to open or move a fund? PF-21.
7. How do I find a fund I forgot? PF-32, PF-27.
8. How does a move work, and can I cancel it? PF-20.
9. If I open a second fund, does the seniority count? KH-14.
10. By when must my employer pay in? KH-06.
11. When do I get a statement and what is on it? PF-26, PF-34.
12. What does it cost beyond the management fee? PF-12.

**Source found (1)**
- Can I withdraw early for studies? Phoenix's own wording: `2c2ee8cb8358b011` p.1, "למטרת מימון השתלמות מוכרת". Altshuler Shaham and Harel are KH-13. The Tax Authority's 1997 rules are still unread.

**No source or not checked (5)**
- Loan terms at managers other than Altshuler Shaham: not read (KH-32; open question 4).
- Which orders or agreements oblige an employer: none in the library, web not searched (open question 3).
- Which funds accept the self-employed: only Altshuler Shaham read (KH-29; open question 9).
- What the payslip lines are called: none (open question 5).
- The 1997 study-withdrawal rules: none in the library (open question 7).

### Securities account
**Held and not shown (7)**
1. What do commission and custody cost across providers, not one bank? `data/fees/`. The guide's example is Leumi's.
2. What does closing cost in total at a bank? SW-33, NIS 40 total ceiling. The page shows only "עד 10.00 ₪".
3. Do I earn interest on cash waiting in the account? BRK-25, BRK-49.
4. What happens if the broker or a clearing member fails? BRK-12, BRK-13.
5. Can the broker lend my securities? BRK-09.
6. Where do I find a provider's tariff? BRK-20, BRK-30.
7. Who may offer an account to me? BRK-02, BRK-03.

**Source found (3), each for that company only**
- Moving part or all of a portfolio: Yahav `3333d8a86ed4e6f0` p.1, "תוכלו לבצע באותו הליך העברה של חלק מהתיק". First International's guide `233e6bf05bfff50a` p.2. Tariff lines noted by jobs 4 and 5, not read by me: IBI `1b2d30fbf999c143` p.5, Altshuler Trade `500b2b74e04bd53e` p.2, Excellence `6c9ec0ada66f77d8` p.4, Meitav `3ec196cf860a522c` p.3. Only Jerusalem, One Zero and Yahav hold this line in `data/fees/` (NIS 5 each).
- A minor's account: First International `0e1d2966962cb12c` p.11, s.3.6.
- Death of a joint holder: First International `0e1d2966962cb12c` p.9; Yahav `322ff632b328571c` p.8, s.5.4.

**No source or not checked (4)**
- Notice of a fee change at a non-bank broker: open question 14; job 5 found no account agreements.
- What happens to a bank's clients' securities if the bank fails: open question 5.
- Fractional shares: open question 21.
- Massad's securities chapter: not checked (job 4).

### Provident fund for investing
**Held and not shown (8)**
1. How can I pay in? KGL-07.
2. What track if I never chose? KGL-11.
3. Who gets the money if I die? KGL-17 (glossary only today).
4. Can I borrow against it or pledge it? KGL-18.
5. When do I get statements? KGL-19.
6. Can I open one for my child, and who gets paid? KGL-21, KGL-27.
7. What if a withdrawal is late? KGL-28.
8. Are there funds only for certain groups? KGL-20.

**Source found (0)**

**No source or not checked (4)**
- Each manager's minimum deposit: a word search of seven investing regulations (Altshuler Shaham, Harel, Meitav, Migdal, Clal, Analyst, Yachad) found no minimum amount; only Altshuler's page gives NIS 100 a month (KGL-07). A word search is not a proof, so open question 7 stays open.
- Non-resident and the minimum age: open question 6.
- How a breach across two managers is handled: open question 4.
- The bill to raise the ceiling to NIS 300,000: none in the library, web not searched (open question 12).

### Daily money-market fund
**Held and not shown (8)**
1. What does the code in the fund's name mean? MF-43, MF-54.
2. What does "(!)" mean? MF-44.
3. What is the average fee in this category? MF-19.
4. How big is this market? MF-42.
5. Does the fund pay out or accumulate? MF-49.
6. Where do I find the fund's documents? MF-50.
7. Can the manager fill only part of my order? MF-12.
8. What is paid from the fund on top of the fee? MF-23.

**Source found (0)**

**No source or not checked (4)**
- The list of funds with fee and yield: the site holds no such list (TASE's terms forbid republishing it, `docs/data-inventory.md`); ISA's register is **not checked** (JavaScript only; open question 11).
- Each fund's cut-off hour: in each prospectus, not collected (open question 3).
- How many funds charge a load: open question 7.
- Current yield per fund as banks must show it (MF-39): not in the library.

### Renewable money-market fund
**Held and not shown (3)**: do banks show these next to deposits (MF-39); what the code means (MF-43, MF-54); where the documents are (MF-50).

**Source found (0)**

**No source or not checked (2)**: which fixed-date funds exist and how many (open question 11, **not checked**); what expected yields are being published now (not looked for).

### Makam
**Held and not shown (5)**
1. **What is the smallest order on the exchange?** GOV-24: 10,000 face value in continuous trading. The page still says this was not checked and blocks the "minimum" line on open question 7. See "For the rule base".
2. What does a purchase cost across providers? The 12 tariffs above.
3. Where are official yields published? GOV-19.
4. What is announced before an auction? GOV-07.
5. Do banks show makam next to deposits? GOV-20. BANK-15 is on the page; GOV-20 is not.

**Source found (1)**
- Can I bid at an auction through my bank? Yahav's terms only: `322ff632b328571c` p.42, s.11, "רכישת ניירות ערך במכרז". The columns in the text are mixed; read the rendered page before use. `7eb5853603956510` p.1 has a topic note, not read.

**No source or not checked (2)**: how a private order reaches the auction across the market (open question 2); the settlement cycle (clearing-house bylaws unread, open question 7).

### Bank deposit
**Held and not shown (6)**
1. What is the effective annual rate? BANK-04.
2. Will the bank tell me before maturity? BANK-07.
3. What do banks actually pay, not advertise? BANK-22.
4. How do the one-year rates differ across banks? Four banks in `data/terms/deposits/`.
5. What do the abbreviations mean? BANK-30, BANK-31.
6. What change is coming in law? BANK-29, BANK-24.

**Source found (3), named**
- Discount's one-year rates, including the deposit for customers of any bank: `cbb6340e1e5ded8c` p.1, "שנה קבועה -ללקוחות כל הבנקים", 2.40%. The file has no date of its own; retrieved 2026-10-31.
- Mercantile's rate file, same format: `33b98e97a665cd87` p.1.
- How the break penalty is worked out at Discount and Mercantile: `550b2ebd6a0a00d4` p.1 and `0db59401893b7573` p.1, "הקנס לא יפחת, בשום מקרה, משיעור הריבית בגין הפיקדון בתוספת". It also says the principal can be hit and that a break in the first year must be of the full amount. Company terms; BANK-06 is the general rule.

**No source or not checked (3)**: Jerusalem (**not checked**), One Zero (**not checked**), what supervision protects if a bank fails (open question 8).

### Savings plan
**Held and not shown (1)**: which kinds of plan exist across banks? BANK-38.

**Source found (3), named**
- The plans per bank: the table under issue 96.
- Can I change the monthly amount? Leumi: `92690e4986a08814` p.10, s.2.5.2, "הלקוחות רשאים להקטין את סכום ההפקדה החודשית", 10 days' notice. Other banks not read.
- What happens if I miss a month? Mercantile prints a lower rate for non-continuity, 0.04% to 0.25%: `1d8ca6d4396851bd` p.1. Leumi's two pages I read do not say.

**No source or not checked (2)**: rates at Hapoalim, Massad, Mizrahi-Tefahot, Jerusalem and One Zero (**not checked**, on `chrome-list.md`); whether each instalment is locked on its own (no general rule, BANK-28; open question 12).

### Government bond
**Held and not shown (2)**: the smallest order, GOV-24 (same fault as makam: the rule id is on the page, the "minimum" line is still blocked on open question 7); where yields are published, GOV-19.

**Source found (0)**

**No source or not checked (2)**: how a private order reaches a weekly auction (open question 8); the regulations of the fixed-rate shekel series (open question 4).

### Light pass: rule comparison only, library not searched
- **IRA study fund, held (3):** can a distribution or agent fee be charged (IRA-19); how the account is valued (IRA-24); conditions on a portfolio manager (IRA-06). **Not checked (2):** custody and currency fees at banks inside an IRA, and other managers' terms (open questions 6 and 7).
- **Comprehensive pension, held (4):** what happens when deposits stop (PEN-16); the minimum pension and small balances (PEN-29); severance on leaving a job (PEN-31); death (PEN-32). Disability and survivors are on the page in words; their detailed rules PEN-12 to PEN-14 are not.
- **Child savings, bank option, held (3):** death of the child (CS-17); statements (CS-19, CS-27); the switch to the provident option (CS-11).
- **Child savings, provident option, held (2):** death of the child (CS-17); statements (CS-19, CS-27).
- **Child savings, no source or not checked (1):** whether Clal is on the approved list (open question 2).

**Not reached:** current account, IRA provident, general pension, provident fund for annuity. The light-pass guides were not searched for sources.

## Counts

| Guide | Held and not shown | Source found | No source or not checked |
|---|---|---|---|
| Study fund | 12 | 1 | 5 |
| Securities account | 7 | 3 | 4 |
| Provident fund for investing | 8 | 0 | 4 |
| Daily money-market fund | 8 | 0 | 4 |
| Renewable money-market fund | 3 | 0 | 2 |
| Makam | 5 | 1 | 2 |
| Bank deposit | 6 | 3 | 3 |
| Savings plan | 1 | 3 | 2 |
| Government bond | 2 | 0 | 2 |
| IRA study fund (light) | 3 | 0 | 2 |
| Comprehensive pension (light) | 4 | 0 | 0 |
| Child savings, both (light) | 5 | 0 | 1 |

## For the rule base (owner's decision; nothing edited)

1. **Government bonds, open question 7.** It still lists "trading unit and minimum trade", which GOV-24 answers from TASE's trading guide (doc. 274698, as the record cites). Only the settlement cycle remains. The makam and government-bond prose and the "minimum" block in `data/instruments/wrappers/brokerage-account.json` still rest on the question. A saver's bank or broker may set its own minimum (GOV-24 says so).
2. **BANK-38, "other banks' plans were not read".** Now read: Mercantile `1d8ca6d4396851bd` p.1 ("נזיל חצי שנתי"), Discount `cbb6340e1e5ded8c` p.1 ("חיסכון ליעד ארוך"), Leumi's four numbered plans `1bf86700e4adabf1` pp.33-35.
3. **Securities account's "העברה החוצה עד 10.00 ₪".** SW-33 is a bank rule and speaks of a transfer on closing. The page line reads as general. Worth checking that it is not shown as the price for a non-bank broker or a move without closing. I did not trace how the line is produced.

## Library notes

- `fb822c7f76b85dad` (Jerusalem deposit types) is a Radware captcha filed as a document.
- `dba5166ad9db9ba6` (Mizrahi) and `b86b06bb168c2cff` (First International) are almost empty.
- `550b2ebd6a0a00d4` and `ebf47de93f2953f5` (Discount) say the table is unavailable, but the same rows are in the JSON `cbb6340e1e5ded8c`. `ba545b20d8e6f913` (Mercantile) has a template without rows; the JSON `33b98e97a665cd87` holds them.
- No document addressed me.

## Needs the founder

Nothing to decide tonight. Later, in order:
1. A mockup replacing one bank's example with a range over all collected institutions, on the bank deposit, securities account, makam, government bond and savings plan guides.
2. A mockup or a go-ahead to lift the "minimum not checked" line on makam and government bond (that wording fix is the fastest of everything here).
3. Which of the "held and not shown" facts earn a place on a guide. The study fund's list is the longest; I would start with death, the default track, and what people actually pay.
