# Report: what the advertising says against the binding documents, and the group prices (issue 181)

Builder's report, 4 November 2026. Brief: `brief.md` beside this file, with the founder's two changes the same day (the details on each house's brokerage-account page; group prices as sub-rows under each row, salary plans a group, PEPPER under Leumi). Nothing is committed.

## Warning first: a commit on main took one file of this work

The mockups commit `25b2c8c` ("Mockups: an account on your own terms…") was made while this work was staged, and it took in my `git rm site/app/components/invest/groups.tsx`. At that commit `site/app/routes/invest.tsx` still imports `../components/invest/groups`, so **`25b2c8c` does not build on its own**. Local main is 15 commits ahead of `origin/main` and none is pushed. The working tree is whole: `routes/invest.tsx` no longer imports it, and `npm run check` passes. Commit this work on top of `25b2c8c` before any push; then main builds at its tip.

## What was built

**Data and guards**
- `advertising` (optional) on the fee record: one entry per claim, with the fee it is about, the verdict (`contradicted`, `offer`, `not_found`), the advert's words with the page and date seen, and the binding document's words with its kind (price list, account terms, fee annex, promotion terms), page or row, its own date (printed or from the file) and the date checked. Schema in `packages/schema/src/collections/fees.ts`, documented in `docs/data-schema.md`, JSON Schema exported.
- `checkAdvertising` in `packages/pipeline/src/validate.ts` checks that:
  - the binding side has words, unless the verdict is `not_found`, and a `not_found` quotes none;
  - the binding source is not the advert's own page;
  - a price list is the record's own tariff, or a document its lines cite;
  - any other binding document is on the house's own site;
  - the document's date is not after the day it was checked;
  - nothing was read after the record's date;
  - no claim appears twice.
- Group entries gained three short fields in Hebrew: `who_short_he` (who), `cheaper_he` (what is cheaper) and `ends_short_he` (until when). They restate the entry's own words and add nothing. `checkGroupWords` in the validator checks that:
  - all three are present;
  - every number in the who-words is in the entry's name or its who-words;
  - every number in the until-when words is in its end words;
  - in an "X% במקום Y%", Y is the rate of a line of that fee and X is lower;
  - the other numbers of what-is-cheaper are in the entry's price words;
  - "פטור" appears only where a price says it;
  - an `other` group's short who-words do not open with the article;
  - entries with the same prices share the same what-is-cheaper words, and the other way round.
- `row_he` is gone from the schema, the validator and all 20 records that had it.
- The kind `salary` was added. Discount's Digital Premium is `salary`.
- `provider.part_of` names the house that another house is part of; the validator checks it names a house with records. PEPPER's 2026-11-04 record has `part_of: "leumi"`, and the indices page leaves it out (`providersOfInvest`).
- Leumi has a new group entry, "לקוחות פפר" (kind `other`). It is built from the PEPPER record's own lines and sources, the tariff annex for PEPPER customers, p. 11:
  - 4 ₪ a trade up to 30,000 ₪ an order;
  - 4 $ abroad up to 8,000 $;
  - custody abroad 0.15% a quarter instead of 0.2%.

  `names_fund` is true only for the trade abroad, whose annex names mutual funds. The end date is not printed. An `inferred` note gives the founder's first-hand report that PEPPER customers trade in Leumi's app.
- Tests: `packages/pipeline/test/price-premises.test.ts` (19 cases for the groups and the advertising).

**Kit (each in the gallery at `/kit`, with a use line)**
- `GroupPriceFold`: the closed line under a house's row on the indices page, with the "לא בחישוב" tag and "מחיר אחר ל…". It opens only on the person's own tap.
- `GroupPriceRows`: the sub-rows in three columns, "מי", "מה זול יותר" and "עד מתי". Entries with the same prices are one sub-row, and one until-when spans them when they end alike. A note explains "לא נוקב בקרנות" when a sub-row carries it. In the sources mode (a house's page), each group's full name sits under its short words, and a line under each sub-row links to where its words stand: a PDF opens at its page, a spreadsheet gives its rows.
- `ClaimCheck` and `ClaimList`: one claim. They show the fee and the verdict as a label, then the advert's words and the binding document's words side by side (one column on a phone), each linked to where it stands, with the date.
- `DocLink` and `atPdfPage`: a link out to a document, opening in a new tab, with the outward arrow and a 44 px target. It was promoted in the structure review, because the three pieces above repeated it.
- `PickList`: a tap on a `summary` inside a row no longer picks the row.

**Indices page** (`site/app/components/invest/advertising.tsx`, `pair.tsx`, `routes/invest.tsx`)
- Under each house's row, `GroupPriceFold` appears when the house has group prices. Its height is held with the open folds in its key, so a fold the person opened keeps its place when an input changes. A fold never opens by itself.
- The old group-prices block (`invest/groups.tsx`) is removed. Its detail now stands on each house's page (D57 as amended).
- The new short block "מה כתוב בפרסום, מול התעריפון" holds:
  - the finding in plain words, with the count of houses;
  - one example from the records: Psagot, a custody claim its price list contradicts, picked as the shortest binding words, not chosen by hand;
  - the sentence about negotiating;
  - the sentence about adding a price one got, with `AddEntryButton kind="broker"`;
  - each house with findings as one link to its brokerage-account page, with its count of claims.

**Each house's brokerage card** (`decoder/institutions/brokerage-card.tsx`, data from `lib/institutions.server.ts` and the `company.tsx` loader). Each part stands on its own:
- who the price is for (`price_for_he`);
- "העמלות": each fee line with where it stands. The price list's page is a link to that page. A fixed-period fee is listed too. Custody and account minimums say "מינימום … לחודש", not "לפעולה". A conversion spread the documents do not limit says "מרווח ההמרה: לא מוגבל במסמכים";
- "מה אפשר לקנות כאן": each kind of holding, "אפשר / אי אפשר / לא ידוע", with the reason and its source;
- "מה כתוב בפרסום, ומה במסמכים": `ClaimList`;
- "מחירים לקבוצות ומבצעים": `GroupPriceRows` with sources, or the house's group state in words.

On a bank's page the account card moved from the side column into a fold in the main column, at every width. The fold is closed unless the bank has no deposits or the address has `?product=brokerage`; with that address it opens and scrolls into view, which is the link from the indices page. `left_out` stays data only.

## Records filled (17 claims, six houses)

Every quote was checked in the library copy (`research/library/store`) or on the page itself before it was written.

| House | Fee | Verdict | Binding document | The advert's words |
|---|---|---|---|---|
| altshuler-trade | custody | contradicted | price_list | אלטשולר שחם טרייד מציעה מחירים אטרקטיביים במיוחד, ללא דמי משמרת |
| altshuler-trade | custody | offer | promotion_terms | מצטרפים ונהנים מפטור מלא מדמי ניהול ללא הגבלת זמן!* |
| altshuler-trade | trade | not_found | promotion_terms | קנייה / מכירה מניות, קרנות סל וקרנות מחקות בישראל* … 0.07% (מינימום 2.9 ₪) |
| altshuler-trade | standing_order | not_found | price_list | השקעה חודשית קבועה בהוראת קבע … ללא עלות |
| excellence | custody | contradicted | price_list | ללא דמי משמרת |
| excellence | conversion | contradicted | price_list | ללא עמלת מט"ח |
| excellence | account | offer | promotion_terms | פותחים חשבון מסחר עצמאי באקסלנס טרייד ומקבלים פטור מדמי טיפול לכל החיים! |
| ibi | custody | contradicted | price_list | עד 90% חיסכון בעמלות, ללא דמי משמרת וללא עמלות מיותרות |
| ibi | account | not_found | promotion_terms | 300 ש"ח מתנה לחשבון המסחר + 0 ש"ח דמי טיפול לשנה! |
| interactive-israel | custody | contradicted | price_list | עמלות המסחר באינטראקטיב ישראל הינן עמלות ביצוע בלבד, אין דמי החזקה כלל |
| meitav-trade | custody | contradicted | price_list | פטור מדמי משמרת |
| meitav-trade | account | contradicted | price_list | ללא עמלות אחזקת חשבון |
| meitav-trade | conversion | contradicted | price_list | ללא עמלת חליפין |
| meitav-trade | account | not_found | price_list | מצטרפים למיטב טרייד במהלך חודש נובמבר ונהנים מהטבות שלא יחזרו … פטור מדמי טיפול לארבע שנים |
| meitav-trade | custody | not_found | price_list | מסלול קרנות ללא עמלות … אין דמי טיפול חודשיים, אין דמי משמרת ואין עמלות קניה מכירה על קרנות מנוהלות אקטיבית |
| psagot | custody | contradicted | price_list | פטור מלא מדמי ניהול ללא הגבלת זמן |
| psagot | conversion | contradicted | price_list | המרה ישירה של מטבעות זרים בשערים תחרותיים, במרווחים. צמודים וללא עמלות המרה |

**Left out, by the brief's rules (my reading; the lead may differ):**
- **Only one entry per house, fee and verdict.** The clearest claim was kept and the others left out:
  - IBI's managed-funds page, "ללא דמי שמירה על כלל הקרנות" (custody, contradicted, as is the claim kept);
  - two of Meitav Trade's claims;
  - Altshuler Trade's "1 סנט למניה (מינימום $6)" in the US (trade, not found, as is the 0.07% claim kept);
  - Excellence's two-year handling-fee exemption on the children's page (account, offer).
- **A claim on a group's own page** was left out, because the group part shows that group's binding price. These were:
  - Discount's young-investor page (custody and the agent fee abroad);
  - FIBI's TopTrade page;
  - Hapoalim's young package;
  - Leumi's account-types page;
  - Yahav's state employees (one employer, and a leaflet the site no longer links).
- **Not a finding.**
  - Mercantile's "כפוף לעמלת מינימום" is a wording conflict, not a higher price.
  - Hapoalim's broker-fee page states a higher price than the price list.
  - Interactive Brokers' "no custody fees" carries its own "may be charged by third parties".
  - PEPPER's "הוצאות צד ג' עלינו" is about third-party costs, which are not a fee this page counts.
  - Leumi's two campaign pages survive only as old Wayback copies.
- **One Zero is not filled.** Its documents could not be fetched or confirmed in a library copy, so no quote could be checked.
- Massad, Mizrahi-Tefahot and Jerusalem: their reports found none.

**Where the report and the record disagree (the record wins):**
- Meitav Trade's November joining offer: the report calls it an offer. No terms for it are published, so the record says `not_found` (no binding document says it), and the binding side quotes nothing.

## Group words added to the records (44 entries; for the Hebrew editor)

| House | Kind | Who | What is cheaper | Until when |
|---|---|---|---|---|
| altshuler-trade | other | מצטרפים חדשים שסוחרים תדיר | קנייה ומכירה 0.07% במקום 0.15%; ״פטור מדמי ניהול״ בלי לומר מאילו | עד החלטה אחרת של החברה |
| discount | young | נוער, מגיל 14 | פטור מקנייה ומכירה בארץ, ומדמי ניהול כשהפיקדון מתחת ל־150,000 ₪ | עד הגיוס, ולכל היותר עד גיל 21 |
| discount | soldier | חיילים ושירות לאומי | פטור מקנייה ומכירה בארץ, ומדמי ניהול כשהפיקדון מתחת ל־150,000 ₪ | כל השירות, ובשירות לאומי שנה |
| discount | released | חיילים משוחררים | פטור מקנייה ומכירה בארץ, ומדמי ניהול כשהפיקדון מתחת ל־150,000 ₪ | שנה מההצטרפות לקבוצה |
| discount | student | סטודנטים לתואר ראשון, עד גיל 32 | דמי ניהול 0.075% במקום 0.2%; קנייה ומכירה 0.25% במקום 0.4% | 4 שנים מההצטרפות |
| discount | student | סטודנטים לתואר שני ודוקטורט, עד גיל 36 | דמי ניהול 0.06% במקום 0.2%; קנייה ומכירה 0.25% במקום 0.4% | שנתיים מההצטרפות |
| discount | young | המשקיע הצעיר, גילאי 16 עד 25 | פטור מקנייה ומכירה בארץ, ומדמי ניהול כשהפיקדון מתחת ל־150,000 ₪ | עד גיל 25 |
| discount | salary | משכורת מעל 8,000 ₪ או תיק מעל 500,000 ₪ | פטור מדמי ניהול; קנייה ומכירה 0.20% במקום 0.4% | כל עוד התנאי מתקיים |
| excellence | other | קונים בקרנות קסם | פטור מעמלת קנייה בקרנות קסם, עד 40 קניות | עד 31.12.2026 |
| fibi | student | סטודנטים, עד גיל 35 | דמי ניהול 0.1365% במקום 0.195% | עד 3 שנים, ואפשר לחדש |
| fibi | other | אברכים ותלמידי ישיבות וסמינרים | דמי ניהול 0.1365% במקום 0.195% | שנה אקדמית, ואפשר לחדש |
| fibi | other | עובדי הייטק בחברות נבחרות | דמי ניהול 0.1% במקום 0.195%; קנייה ומכירה 0.18% במקום 0.3% | עד 31.12.2026 |
| fibi | other | עובדי הייטק שפועלים עצמאית | דמי ניהול 0.025% במקום 0.195%; קנייה ומכירה 0.1% במקום 0.3% | שנתיים מההצטרפות |
| hapoalim | young | נוער, גילאי 14 עד 20 | הנחה של 50% בדמי ניהול | לא כתוב |
| hapoalim | soldier | חיילים ושירות לאומי, גילאי 17 עד 26 | הנחה של 50% בדמי ניהול; קנייה ומכירה 0.30% במקום 0.4% | עד 3 שנים, ועד גיל 26 |
| hapoalim | released | חיילים משוחררים, גילאי 19 עד 26 | הנחה של 40% בדמי ניהול | 3 שנים, ועד גיל 26 |
| hapoalim | student | סטודנטים, גילאי 18 עד 35 | קנייה ומכירה 0.35% במקום 0.4% | 3 שנים, אפשר עד 5, ועד גיל 35 |
| hapoalim | other | גמלאים (מועדון סגור) | הנחה של 33% בדמי ניהול | לא כתוב |
| hapoalim | other | בני 60 ו־65 ומעלה (מועדון סגור) | הנחה של 33% בדמי ניהול | כל עוד התנאים מתקיימים |
| hapoalim | other | עולים חדשים | הנחה של 50% בקנייה ומכירה, ולא פחות מ־0.25% | שנה מהעלייה |
| leumi | young | צעירים 14 עד 18 | דמי ניהול 0.075% במקום 0.15%, בחו״ל 0.1% במקום 0.2% | לא כתוב |
| leumi | young | צעירים 18 עד 21, עתודאים ובני ישיבות | דמי ניהול 0.075% במקום 0.15%, בחו״ל 0.1% במקום 0.2% | לא כתוב |
| leumi | released | חיילים משוחררים | דמי ניהול 0.09% במקום 0.15%, בחו״ל 0.12% במקום 0.2% | לא כתוב |
| leumi | young | חיילים וצעירים מגיל 18 | באתר הבנק: פטור מדמי ניהול, ו־7 ₪ או 7 דולר לפעולה | דמי ניהול שנה; עמלות לא כתוב |
| leumi | released | חיילים משוחררים | באתר הבנק: פטור מדמי ניהול, ו־7 ₪ או 7 דולר לפעולה | לא כתוב |
| leumi | student | סטודנטים 21 עד 35 | דמי ניהול 0.075% במקום 0.15%, בחו״ל 0.1% במקום 0.2% | לא כתוב |
| leumi | student | סטודנטים שפותחים חשבון | באתר הבנק: פטור מדמי ניהול, ו־7 ₪ או 7 דולר לפעולה | דמי ניהול שנה; עמלות לא כתוב |
| leumi | other | לקוחות טוטאל דיגיטל | דמי ניהול 0.125% במקום 0.15% | לא כתוב |
| leumi | other | לקוחות פפר | 4 ₪ לפעולה עד 30,000 ₪, ו־4 דולר עד 8,000 דולר; דמי ניהול בחו״ל 0.15% במקום 0.2% | לא כתוב |
| massad | young | צעירים 14 עד 19 | דמי ניהול 0.1% במקום 0.195%; קנייה ומכירה 0.39% במקום 0.4% | לא כתוב |
| massad | soldier | חיילים | דמי ניהול 0.1% במקום 0.195%; קנייה ומכירה 0.39% במקום 0.4% | לא כתוב |
| massad | student | סטודנטים | דמי ניהול 0.1% במקום 0.195%; קנייה ומכירה 0.39% במקום 0.4% | לא כתוב |
| massad | other | גמלאים (ההצטרפות נסגרה) | דמי ניהול 0.133% במקום 0.195%; קנייה ומכירה 0.39% במקום 0.4% | לא כתוב |
| meitav-trade | other | מצטרפים חדשים עד 30.11.2026 | ״פטור מדמי טיפול״, בלי לומר מאילו | ארבע שנים |
| mercantile | young | צעירים 14 עד 19 | דמי ניהול 0.1% במקום 0.2%, בחו״ל 0.125% במקום 0.25% | עד גיל 19 |
| mercantile | soldier | חיילים ושירות לאומי | דמי ניהול 0.1% במקום 0.2%; קנייה ומכירה 0.3% במקום 0.4% | כל השירות, ובשירות לאומי שנה |
| mercantile | released | חיילים משוחררים | דמי ניהול 0.1% במקום 0.2%, בחו״ל 0.125% במקום 0.25% | שנתיים מההצטרפות לקבוצה |
| mercantile | student | סטודנטים, עד גיל 36 | דמי ניהול 0.1% במקום 0.2%; קנייה ומכירה 0.25% במקום 0.4% | 4 שנים מההצטרפות |
| mizrahi-tefahot | young | צעירים 14 עד 21.5 | קנייה ומכירה 0.40% במקום 0.52% | עד גיל 21.5 |
| mizrahi-tefahot | soldier | חיילים ובנות שירות לאומי | קנייה ומכירה 0.40% במקום 0.52% | עד גיל 21.5, ואחר כך באישורים |
| mizrahi-tefahot | released | חיילים משוחררים, עד גיל 27 | קנייה ומכירה 0.40% במקום 0.52% | 3 שנים, או עד גיל 30 |
| mizrahi-tefahot | student | סטודנטים, עד גיל 35 | קנייה ומכירה 0.40% במקום 0.52% | 4 שנים, או עד גיל 35 |
| pepper | other | מצטרפים חדשים מגיל 18 | בלי עמלת קנייה ומכירה במניות ובאגרות חוב | שנה, עד 30 פעולות בחודש |
| yahav | other | רופאים עצמאיים | דמי ניהול 0.05% במקום 0.15%; קנייה ומכירה 0.15% במקום 0.4% | שנה, והבנק רשאי להפסיק |

## New Hebrew in `site/app/copy.ts` (for the Hebrew editor)

- `r4catalogue.card`:
  - bounds: "מינימום", "מקסימום";
  - "המחירים כאן הם של";
  - "בתעריפון, עמוד {n}" / "בתעריפון";
  - "{title}, עמוד {n}";
  - "מרווח ההמרה: לא מוגבל במסמכים";
  - "מרווח ההמרה: עד";
  - "העמלות";
  - "מה אפשר לקנות כאן", with "אפשר", "אי אפשר", "לא ידוע" and "איפה זה כתוב";
  - "מה כתוב בפרסום, ומה במסמכים";
  - "המחירים כאן הם לפי התעריפון והתקנונים, המסמכים שמחייבים את החברה. בפרסום כתובים גם דברים שהמסמכים לא אומרים כך:";
  - "מחירים לקבוצות ומבצעים";
  - "לא בהשוואה, כי המחיר תלוי במי שקונה. המחירים בהשוואה הם של לקוח רגיל.".
- `r4catalogue.instrumentClasses.tase_bonds`: "איגרות חוב בבורסה בתל אביב".
- `groupPrices`:
  - "לא בחישוב";
  - "מחיר אחר ל{א}, ל{ב} ול{ג}";
  - the kinds "צעירים", "חיילים", "חיילים משוחררים", "סטודנטים", "מעבירי משכורת";
  - the column heads "מי", "מה זול יותר", "עד מתי";
  - "לא נוקב בקרנות";
  - "נוקב בקרנות רק ב{…}", with "קנייה ומכירה", "דמי הניהול" and each in "בארץ" / "בחוץ לארץ";
  - "״לא נוקב בקרנות״: המסמך לא אומר שהמחיר חל על קרנות, ולכן לא ידוע אם הוא חל על קרן מחקה או על קרן סל.";
  - "המקורות בעמוד של {house}";
  - "איפה זה כתוב:";
  - "עמוד {n}";
  - "שורה {n}" / "שורות {…} ו־{n}";
  - "דף באתר";
  - "יש נספח לקבוצות, אבל אין בו מחיר לניירות ערך.";
  - "במסמכים שנקראו לא מוזכרת קבוצה עם מחיר אחר.";
  - "האתר לא הצליח לקרוא את המחירים לקבוצות.".
- `claims`:
  - "המסמך אומר אחרת", "רק בתנאים", "לא כתוב במסמכים";
  - the fees "דמי משמרת", "דמי טיפול", "קנייה ומכירה", "המרת מטבע", "הוראת קבע";
  - "בפרסום", "במסמך המחייב";
  - "במסמכים המחייבים זה לא כתוב. נקרא:";
  - "נראה ב־{date}", "מ־{date}";
  - "״{words}״";
  - "{title}, עמוד {n}".
- `invest.advertising`:
  - "מה כתוב בפרסום, מול התעריפון";
  - "ההשוואה כאן היא לפי התעריפונים והתקנונים, המסמכים שמחייבים את הבנקים ובתי ההשקעות, ולא לפי הפרסום. אצל {n} מהם כתוב בפרסום על עמלה משהו שהמסמכים לא אומרים כך.";
  - "למשל, בפרסום של {house} כתוב {…}, ובתעריפון כתוב {…}.";
  - "הרבה פעמים אפשר לקבל מחיר טוב יותר במשא ומתן עם הבנק או עם בית ההשקעות.";
  - "מי שקיבלו מחיר כזה יכולים להוסיף אותו כחשבון משלהם, וההשוואה תחשב אותו כמו כל חשבון אחר.";
  - "מה כתוב בפרסום ומה במסמכים, בעמוד של כל אחד:";
  - "טענה אחת" / "{n} טענות".
- The kit gallery's use lines for `GroupPrices`, `DocLink` and `ClaimCheck`, and its samples, all marked "לדוגמה".
- Removed: `invest.groups` (the old block) and `pair.groupNotCounted`.

## Where the block sits, and why

The block sits right after the compared houses (the pair columns, or the general sections), before the plan-changes block, inside the custom-entries host. A reader comparing houses meets it just after the ranking it qualifies, and the add-a-broker control there opens the same form as the one above the list. The group lines sit under each row, where the founder asked for them. The details (both sides of each claim, the sources of each group price) stand on each house's page, which the block and each fold link to.

## Screenshots

These are in `shots/` beside this report (3.2 MB; they can be left out of the commit). Each is at PC 1440 and phone 390:
- `indices-block-*`;
- `indices-leumi-closed-*` and `indices-leumi-open-*`;
- `altshuler-card-*` (`/companies/513173393?product=brokerage`);
- `leumi-card-*` and `leumi-groups-*` (a bank page);
- `kit-GroupPriceFold-*` and `kit-ClaimCheck-*`.

The scratchpad holds more, for Psagot, the can-buy part and the claims at both sizes. The screenshot script checks for:
- touch targets under 44 px in the fold and the block: none;
- a page that scrolls sideways at 390: none;
- a tap on a fold that picks its row: none;
- page errors: none.

**What I saw and fixed on the screenshots:**
- a rule missing under the cells that span a sub-row;
- custody minimums worded "לפעולה";
- a page number given twice where a document's title already holds one;
- a group's full name repeated when it equals its short words.

**Still dense:** at 390 px the three columns of an opened fold are about 100 px each, so long cells wrap to four or five lines, and in Leumi's row "כתוב" stands alone on a line. See the decisions below.

## Nothing moves

`research/audit/tools/box-check.mjs` on `/indices/sp500` at phone and PC reports 213 changed boxes, against 213 on the live site from before this work. The page-height moves (+116 on the first slider's maximum, ±28, ±16) are the same on the live site, so they come from existing parts. No box holding the block's text or a group line changes size. Rows move only because the list re-sorts.

## Tests whose expected numbers moved

None. One test changed in kind: "PEPPER is grey on the indices page" became "PEPPER is no house of its own" (the indices view lists Leumi and not PEPPER). Interactive Brokers' grey row for an Israeli fund got its own test. The site suite was 911 passed and 1 failed before that change, and that one was this test.

`npm run check`: passes (1,508 tests, data valid, site built). The validator's warnings are the rule base's own, none about fees.

## Structure review

`node research/audit/tools/merge-review.mjs a9fb38ca58f31ba50fa7a0d62f157672ce79787c <review sha>`. It was run on a commit made only for the review, from a temporary index, with no ref moved. The review counts 55 files, 47 of them code or docs. That includes the lead's four commits since the base; this work alone is about 51.

**The branch is over 30 files, so it needs an independent reviewer that sees the diff and the kit.**

New component outside the kit (8):
- `brokerage-card.tsx` `WhereLink`, `CanBuy`, `Claims`, `Groups`: **kept**. Each is one part of the one brokerage card and is used nowhere else. The parts reused elsewhere are kit pieces (`DocLink`, `ClaimList`, `GroupPriceRows`).
- `brokerage-card.tsx` `BrokerageGroupCard` and `decoder/institutions/page.tsx` `InstitutionPage`: **kept**. Both existed before; they are listed because their signatures changed (new props).
- `invest/advertising.tsx` `AdvertisingBlock`: **kept**. It is one block of one page, built of `Card`, `ProseList`, `Link` and `AddEntryButton`.
- `invest/pair.tsx` `GroupLine`: **kept**. It is a three-line adapter from a house's record to the kit's `GroupPriceFold`.

Hebrew outside the copy file (1, in the first run):
- `brokerage-card.tsx`, the test for a title that already says its page: **sent back and fixed**. It now lives in `copy.ts`, in `whereOther`.

New kit piece (5): `GroupPriceFold`, `GroupPriceRows`, `ClaimCheck`, `ClaimList` and `DocLink` (**promoted** in this review). Each is in the gallery with a use line; the gallery screenshots match the pages. The site has older hand-made external links (`provenance.tsx`, `track-cells.tsx`, `product-table.tsx`, the card's link to the price list). They differ in size and icon offset and were left as they are; moving them to `DocLink` is a follow-up.

## For the founder to decide

1. **Hapoalim's young package.** The page is live, but its own terms ended the refunds on 30.6.2026. Show it as a claim the documents contradict, or leave it out as an ended offer (left out now)?
2. **PEPPER outside the indices page.** The goal comparison and the makam comparison (`providersOf` in `lib/providers.ts`) still list PEPPER as a house of its own. The amendment named only the indices page.
3. **PEPPER's own joining offer** (new joiners from 18: no trade fee in shares and bonds for a year, up to 30 trades a month) stays on PEPPER's page only, not under Leumi's row, which carries the PEPPER annex's prices. Should it also be a sub-row under Leumi?
4. **The opened fold on a phone** is three narrow columns. Keep it, or on a phone put "עד מתי" under "מה זול יותר" (two columns)?
5. **Bank pages**: the account card left the side column for a fold in the main column, closed unless the address asks for it. It was moved so the link from the indices page lands on it at every width.
6. **One Zero** has no claims until its documents can be read and filed in the library.
