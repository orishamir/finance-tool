# Salary, portfolio and profession plans, every bank and broker (2026-11-04)

Asked by the lead after the founder's amendment of D43: a salary plan is a group like any other, shown as a sub-row beside the house and never ranked; Discount's Digital Premium is the model. Rules: `brief.md` (binding against advertising, dates both ways, no legal judgement). Nothing in `data/` was touched. The proposed entries are in `salary-plans.json`.

**In one line.** No bank except Discount prints a salary plan's securities price in a binding document. Every other plan with a figure is printed on the plan's own page:
- Mercantile Top and Deluxe;
- Massad's teachers and their spouses;
- FIBI's SMART (lawyers and accountants) and Medic 10 (medical workers);
- Leumi's lawyers and tax advisers.

Some of these pages carry their own terms; the rest are advertising. Hapoalim, Mizrahi-Tefahot, Leumi's salary accounts and One Zero name a "benefit" with no figure, or a refund rather than a price. Jerusalem has none. No broker has a portfolio-size or portfolio-transfer price in a binding document.

**How the entries are classed** (field `document_kind` in the JSON, proposal only):
- `binding`: a tariff row, an annex or a separate promotion's terms.
- `page_terms`: the conditions and prices printed together on the plan's own page, with no separate document and no tariff row. The earlier Mercantile research called these promotion terms. Under the brief's definitions they are nearer to advertising, so the founder should decide whether such a page may feed a sub-row (see the end).
- `advertising`: a flyer or campaign page whose only conditions are its own notes.

**Kinds.** `salary` is used for a salary or portfolio condition open to anyone; `other` for a plan open to one profession or employer, even when it also asks for a salary. The short strings use the schema's field names: `who_short_he`, `cheaper_he` and `ends_short_he`. The last is the lead's `until_short_he`, under the name the builder's schema already uses (`packages/schema/src/collections/fees.ts`, working tree).

## Discount (done, the model)

- Digital Premium, annex A p.40 (22/06/2026), stays as recorded.
- Under the amended D43 its kind becomes **`salary`** (today `other`). The JSON gives only that patch and the three short strings.

## Leumi (with PEPPER)

- **Salary accounts Private, VIP and TOP** need a net salary of 7,000, 12,000 or 30,000 ₪ for one person. They offer loans, grants and current-account waivers. On securities the account-types page and the minisites (Last-Modified 30.10.2026) say only "הטבות בעמלות ני"ע ומט"ח המותאמות לאופי החשבון והפעילות הפיננסית". No figure: advertising only.
- **Hi-tech and the HOT club** (an employer arrangement): the same words, with no figure.
- **Lawyers** (`/he/Campiagn/1707`; Wayback Machine 2024-10-15 to 2026-02-19; library e819dc89e4088a5b) and **tax advisers** (`/he/private-account-benefits`; library e4ded1e3478dd110) print one table by portfolio size, 50,000-249,999, 250,000-499,999, then 500,000 ₪ and above:
  - Leumi Trade in Tel Aviv: 0.18%, 0.15%, 0.12%;
  - Leumi Trade abroad: 0.21%, 0.18%, 0.15%;
  - custody a quarter: 0.045%, 0.03%, 0.015% in Israel; 0.06%, 0.04%, 0.02% abroad.
- Notes on those two pages:
  - The Tel Aviv benefit "אינן תקפות לקרנות נאמנות", so no fund is named.
  - Tax advisers: eligibility "עד ליום 31.12.2026", a year from first report, and "הבנק רשאי להפסיק או לשנות ... ללא הודעה מוקדמת".
  - Lawyers: no end printed.
  - Both are advertising. Proposed as two `other` entries.
- **Teachers' organisation flyer** (LE1539, PDF of 16.7.2024, library b4bce8b7498f93f6): a similar table, with dates of 31.12.2024 and 31.1.2025. It is not linked from a current page and is treated as ended.
- **Doctors** (library 4e658539456f3ef7) and other employer flyers (Elbit, Israel Railways, found by search) were not collected one by one. Each is one employer's offer.
- **Leumi Total Digital** (tariff p.9, already an entry) remains with no printed eligibility. A search found no page naming it.
- **PEPPER.** The existing joining entry (salary of 1,200 ₪ net plus 100 ₪ on the card, one year, joining "עד לתאריך 31.10.2026") is a salary-conditioned offer. As a sub-row under Leumi its kind becomes `salary`. Its joining date has passed. The current PEPPER joining page (to 30.11.2026, library ebcd26280b067495) offers a grant and card FX only.

## Hapoalim

- **Poalim Plus.** New account 1.10-31.12.2026, net salary 10,000 ₪ (joint 15,000), three years. Its only securities words are "הטבות בעמלות ניירות ערך".
  - No figure on the page, the couples' page or the April-June terms (library 074b3666da413df1). Two other addresses answer 404.
  - TheMarker's comparison (checked against the bank's documents on 27/10/2026) names the salary only.
  - The tariff sheet (05/10/2026) and annex A (24/12/2023) have no Poalim Plus club.
  - Advertising, no price.
- **HighTechZone club.** Hi-tech employees of companies in arrangement, salary 8,000 ₪ (16,000 joint).
  - The page (library 12ad20b4b6f12f40) prints no securities price.
  - The club's promotion terms (`takanon_hightech-zone-3112026.pdf`, created 29.12.2025, promotion 2.2.2025-31.01.2026; library f706d75451bdf929) say nothing on securities.
  - Advertising at most.
- The tariff's clubs are young, soldier, released soldier, student, academics (closed 30.06.2022), new immigrants, 60+, retirees and family. None is a salary plan.

## Mizrahi-Tefahot

- **Employees, favoured employees, managers and Priority** (Priority: net salary 30,000 ₪, or 20,000 ₪ with more than 200,000 ₪ in assets). The pages offer a choice of joining benefits, one of them:
  - "החזר כלל העמלות בגין פעילות עו"ש, ני"ע ומט"ח עד 500 ₪ בשנה למשך 3 שנים";
  - plus "הטבות בעמלות ני"ע ומט"ח מותאמות אישית".
- No rate is printed, no annex row exists, and the pages say "הבנק רשאי לשנות את התנאים בכל עת ללא הודעה מוקדמת". This is a capped refund, not a price; it is already in `left_out`.
- The exclusive-private-banking and married-benefits pages name no securities benefit.

## Mercantile

- **Top** (salary 12,000 ₪ for one person, 18,000 joint) and **Deluxe** (20,000 / 25,000), plus 3,000 ₪ a month on a Mercantile credit card, new joiners "במהלך תקופת המבצע", from age 19. Both print:
  - "עמלת קניה/מכירה בישראל 0.12% עמלת מינימום 10 ש"ח";
  - "עמלת קניה בחו"ל 0.15% עמלת מינימום כפוף למינימום";
  - "דמי ניהול חשבון ני"ע - פטור".
- Until when: "תוקף ההטבות - 3 שנים ממועד ההצטרפות לקבוצה" and "הבנק רשאי לשנות את תנאי המבצע בכל עת". The joining window is not defined.
- The source is the groups page, with terms inline. It has been on the Wayback Machine since 2025-02-09 and was re-fetched today with the same text (library e83a067b2644e092). There is no separate terms PDF, and the full tariff (01/10/2026; annex A 22/06/2026) has no row. `page_terms`.
- No row names a fund.
- That "דמי ניהול חשבון ני"ע" is the custody fee (the tariff's "דמי ניהול פיקדון") is inferred.
- **Pro** (7,000 ₪) has no securities benefit.
- Proposed as two `salary` entries with the same `cheaper_he`, so they share one sub-row.

## First International (FIBI)

- **SMART**, for lawyers and accountants (`accounttypes/smart`; Wayback Machine 2024-05-07 to 2026-04-13; library 4d2dc05fc66066bd).
  - Who: a licence plus one of three conditions: a salary (salaried 8,000 ₪, retirees 7,000, interns 5,000), a monthly turnover of 20,000 ₪, or "תיק השקעות" of 100,000 ₪ at the bank.
  - Prices, for a portfolio up to 350,000 ₪ and above it:
    - Tel Aviv "מניות ואג"ח": 0.3% / 0.25%;
    - abroad "מניות, קרנות נאמנות ואג"ח": 0.35% / 0.3% (**names funds**);
    - custody in Israel and abroad: 0.117% / 0.0975% a quarter.
  - Until when: "ההטבות בפעילות בני"ע בתוקף עד ה- 1/11/28", then updated every five years; withdrawable with notice.
  - Both column heads read "עד 350,000" in the copy fetched; that the second means above it is inferred.
  - `page_terms`, `other`.
- **Medic 10**, medical workers, self-trading track (library 5884f548bcbb608c; Wayback Machine from 2026-02-06).
  - Who: new club members who trade online, or members who transfer a new portfolio or add at least 30% of its value.
  - Prices:
    - "קניה של תעודות סל/קרן מחקה באמצעות הוראות קבע" 0.1%, minimum 5 ₪ (**names fund units**);
    - foreign "קרנות ואג"ח" 0.1%, minimum 8 $.
  - Until when: the track lasts two years; securities benefits "עד ל 31.12.2030"; withdrawable with notice.
  - The table's heading says "בסניף או בחדר עסקאות" although the track is online only.
  - `page_terms`, `other`.
- **HighTech 10** (two entries in the record already) stays `other`: an employer club, ends 31.12.2026.
- **Other clubs.** Behatsdaa, 50+ and the defence club each show a securities heading (with legal notes on the first two), but no rate is printed; Behatsdaa was also read in Chrome. Keva (career soldiers) defines a portfolio and prints no securities price. Teachers, start-up, hever and IDF-workers pages print no securities benefit. The investment-only account waives current-account fees only. The green account refunds 20% of online trades, excluding mutual funds, and is not a salary plan. TopTrade is already in `left_out`.

## Massad

- **Teachers** (salary from 5,000 ₪) and **spouses joining a teacher's account** (10,000 ₪ for the couple), new customers only. Both pages print the same benefit:
  - "50% הנחה בדמי ניהול פיקדון ני"ע (דנ"פ) לשלוש שנים";
  - footnote "בפיקדון ניירות ערך החל מ- 150,000 ₪";
  - "הבנק רשאי להפסיק את מתן ההטבות בכל עת".
- Sources: library e482d4ca74c58147 and af05f414e55a7416; Wayback Machine 2024-03-03 to 2026-06-16. Annex A (2024-09-15) has no row. `page_terms`, `other`.
- No fund is named, and Israel and abroad are not split; both are recorded.
- **Extra CLASS** (salary from 4,000 ₪, 36 months) promises "הנחות והטבות ב... ניירות ערך" with no figure. Advertising only (library 06f1e0b7231c02b9).

## Bank of Jerusalem

None. The current-account page (read in Chrome; curl meets a bot check) says "ללא צורך בהעברת משכורת". Annex A (30/09/2025) lists prepaid-card holders only.

## Yahav

- No salary plan with a securities price.
- The self-employed doctors' entry already in the record stays `other`. Its flyer conditions the benefit on a portfolio transfer above 200,000 ₪ and on monthly business activity of 15,000 ₪.
- The state employees' leaflet (11.2024, no longer linked) stays in `left_out`.
- The salaried and other group pages were read in the Yahav round and print no figure.

## One Zero

- The plans **ONE** (49 ₪ a month) and **ONE+** (89 ₪) have binding securities prices in the tariff (26.7.26, annex ו'):
  - ONE: 0.1%, minimum 10 ₪ in Tel Aviv, and 0.1%, minimum 8 $ abroad; conversion fee exempt;
  - ONE+: 10 free trades a month, then the same.
- The record already prices them as plan lines.
- The salary link is advertising only: "One ... ללא עלות בהעברת 5,000₪ בחודש ... +One ללא עלות בהעברת 10,000₪". Its "תקנון ההטבה" was not found; the host refuses curl, and a web search found only restatements.
- Not proposed as a group entry. Whether the waiver belongs on the row is the founder's call (see below).

## Brokers: Psagot, IBI, Altshuler Trade, Meitav Trade, Excellence, Interactive Israel

None has a current account, so the question was a price that depends on portfolio size or on transferring a portfolio.
- No tariff or terms read in this round's records has one, and a web search found no portfolio-transfer offer.
- Meitav's portfolio-transfer page offers no benefit.
- Meitav's "מסלול קרנות ללא עמלות" needs a portfolio of at least 100,000 ₪. It is mutual funds only, "לא כולל קרנות שמוגדרות כמניות", and its buy and sell exemption names actively managed funds. It is advertising and already in `left_out`. The same page offers "עמלות בהתאמה אישית" to professional traders, with no figure.
- Altshuler's joining offer (a deposit of at least 5,000 ₪ and frequent trading, at the company's discretion) stays `other`.
- Interactive Israel's tariff says "תעריף זה חל על כל לקוח של החברה".

## Plans seen only in advertising, with no binding document

- Leumi: lawyers and tax advisers (figures); Private, VIP and TOP; hi-tech and HOT (no figure); the 2024 teachers' flyer (ended).
- Hapoalim: Poalim Plus, HighTechZone (no figure).
- Mizrahi-Tefahot: employees, favoured, managers and Priority (a capped refund; "מותאמות אישית").
- Mercantile: Top and Deluxe (figures, terms on the page only).
- FIBI: SMART and Medic 10 (figures, terms on the page only); Behatsdaa, 50+ and the defence club (heading, no figure).
- Massad: teachers and spouses (figure, terms on the page only); Extra CLASS (no figure).
- Yahav: state employees (2024 leaflet).
- One Zero: the plan-fee waiver for a salary transfer.
- Meitav Trade: the funds-only track from 100,000 ₪.

## For the founder

1. **May a plan's own page with printed terms feed a sub-row?** This is the case of Mercantile, Massad, FIBI SMART and Medic 10, which have no tariff row. If not, they go to `left_out` like Mizrahi's refund, and Discount stays the only salary sub-row. Recommended: yes, marked as the page's terms, since the D43 sub-rows already carry other conditional offers (Altshuler, Meitav, Yahav doctors).
2. **Profession plans: one sub-row each, or a single line.** Leumi lawyers and tax advisers, FIBI SMART and Medic 10, and Massad teachers each serve one profession. Showing every one would add about seven sub-rows; Leumi alone has more employer flyers not collected.
3. **One Zero.** Whether the advertised plan-fee waiver for a 5,000 ₪ inflow belongs on the row, given that no terms were found.
