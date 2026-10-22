# User flows, release 1

Written 2026-10-23 from `docs/product.md` (the release 1 capabilities in `docs/roadmap.md`), `docs/design-system.md` and the approved mockups.
Status: **approved by the founder on 2026-10-23**, with both proposals in section 5. Section 6 holds a design brief for every screen.

What release 1 lets a person do: understand any product type in plain Hebrew with a graph they can play with, see every product and track a company offers and what each one is, check where every number comes from, and see what the site cannot answer yet and why. Nothing here ranks options or remembers a goal; that starts in release 2.

How to read a flow: who starts it and from where, the steps, what can go differently, and when it is done. The last line of each flow ("Traces to") is for whoever builds it.

---

## 1. Why people come

| Situation | Who | Flow |
|---|---|---|
| "My bank or fund app offers something and I don't know what it is." | The founder with the Meitav app; any friend with a bank or fund app | 5, 6 |
| "I want to understand a type of saving." | A friend who has never heard of a money-market fund | 2, 3 |
| "I have a word from a statement or an ad." | Anyone holding a pension statement or an ad | 6 |
| "Where does this number come from? Can I trust it?" | Anyone reading a page | 4 |
| "What about the thing my friend mentioned?" | Anyone asking about a product the site doesn't cover yet | 7 |
| "Which rules and judgement calls does the site use?" | The founder, a careful friend, a reviewer | 8 |
| Keeping the catalogue and the data current | The founder | 9, 10 |

---

## 2. Map of the site in release 1

```mermaid
flowchart TB
  start([Link from the founder, or the home-screen icon]) --> home[First page: search and two doors]
  home --> gidx[Guide: all product types]
  home --> didx[Companies: all managing companies]
  home --> search[Search: paste a name]
  gidx --> guide[Guide page: one product type]
  gidx --> tier2[Not covered yet]
  guide --> inputs[Timeline values: sheet on phone, panel on PC]
  guide --> prov[Where a number comes from]
  guide --> company
  didx --> company[Company page: every product and track]
  company --> track[Track page]
  company --> guide
  track --> guide
  search --> company
  search --> track
  search --> guide
  search --> nocat[Not catalogued yet]
  prov --> rules[Rules page]
  prov --> params[Site parameters page]
```

Every page also has the header: site name (back to the first page), search, and the menu (guide, companies, rules, parameters). A friend may land directly on any page from a shared link, so every page stands on its own and has a way back to its list.

---

## 3. The flows

### Flow 1. Arrive and find your way

**Starts:** a link the founder sends, or the icon on a phone's home screen.

1. The first page shows a search field ("הדביקו שם של מוצר, מסלול או מונח") and two doors: understand a type of saving (the guide) and see everything a company offers (the companies list). A small link leads to what the site does not cover yet. Nothing else (approved, question 1).
2. On every page the header holds the site name, search and the menu. On a phone the menu is a sheet; on PC the four destinations sit in the header.
3. A shared link opens its page directly. The back link at the top leads to that page's list (guide or companies).

**Done when:** the person is on a guide page, a company page, or searching.
**Traces to:** product.md 2 (users, phone first); architecture.md 3.5 (pages); design-system.md 3.1.

### Flow 2. Learn what a product is

**Starts:** the guide list (from the first page or the menu), or a link from a company page, a track page or search.

1. The guide list has two groups: where the money is held (a bank deposit, a kupat gemel lehashkaa, a brokerage account …) and what it is invested in (cash in shekels, an index such as the S&P 500 …). Each card has the name and one line. A link at the end leads to what is not covered yet.
2. A product page opens with its name, one-line summary and the key to the three number styles.
3. The page always runs in the same order, so two pages can be compared side by side: what it is, the timeline, who offers it and who supervises, how money goes in and out, what it costs, how it is taxed, risks and what is not protected, typical use, what to check, and the words used for it. On a phone a row of section chips jumps between them; on PC a list on the right does.
4. In "who offers it", each company links to its company page (flow 5).
5. "Typical use" links to the related product pages, for example from a money-market fund to a bank deposit, so the reader can see when each one suits. Ranking one against the other for a goal comes in release 2.
6. "What to check" lists every point that matters for this product, each marked considered, not relevant, or blocked by an open question. Tapping one shows where it comes from.
7. "Words used for it" shows each term as it appears on a statement, in an app or in the law, with what it means.
8. A page about what the money is invested in (an index, cash) explains the exposure and links to the products that can hold it. The timeline lives on the product pages.

**What can go differently:** a part that depends on an open question shows a lock and names the question instead of a number. A number older than usual shows a clock.
**Done when:** the reader can say what it is, how to get it, what it costs, how it is taxed, and when another product suits better.
**Traces to:** product.md 3.1, 3.3, success criterion 5 and the R1 "done when" in roadmap.md; design-system.md 3.5, 3.6.

### Flow 3. Try your own numbers on the timeline

**Starts:** the timeline on any product page. It opens on the site's example: an amount today, a monthly deposit, a number of years, a return and inflation.

1. The reader sees what is left after the years shown, net of fees and tax, in today's money, then the graph, then the values it uses as chips under it, each showing whether it is the site's example or entered by them.
2. On a phone, tapping a chip opens the values sheet at that field ("כל ההנחות" opens all of them). On PC the values sit in a panel beside the graph.
3. Changing a value (slider or typing) moves the graph and the numbers straight away. The field turns blue with "הוזן על ידך" and a button to go back to the example value.
4. Optional: age, which marks ages where the product's rules change (for example 60 for a kupat gemel lehashkaa); and employment type, which highlights the parts of the page that apply.
5. A switch shows the graph in today's money (the default) or in future shekels.
6. Dragging a finger across the graph (phone) or moving the mouse (PC) shows the numbers for that year. "הצגה כטבלה" shows them year by year.
7. Values the reader entered stay with them on every other product page, and on this device on their next visit.

**What can go differently:** a return the reader enters is drawn as a dashed line, with a note that the projection rests on their own number. A part the site cannot compute (an open question) is hatched and names the question. A rule figure past its end date stops the graph with "הנתון לא עודכן" instead of using an old figure.
**Done when:** the reader has seen how their own money would behave in this product.
**Traces to:** product.md 3.1 (timeline), 2 ("interactive by default", "real terms by default"), D7, D9; method.md F-67; design-system.md 3.3, 3.4.

### Flow 4. Check where a number comes from

**Starts:** any number on any page.

1. The style says what it is: a thin grey underline comes from a source, a dotted violet one is calculated by the site, blue is something the reader entered. The key at the top of each page explains the three.
2. Tapping (phone) or clicking (PC) opens a sheet from the bottom on a phone, or a small card beside the number on PC:
   - from a source: the document and section, with a link; who published it; the date it was checked; the rule it belongs to;
   - calculated: what the calculation is, each value it used (themselves tappable), and the rules it used;
   - entered: what the reader typed, the example value it replaced, and the button to go back;
   - a site judgement (a "site parameter"): the value, why it was chosen and when it was approved.
3. Tapping a rule opens the rule in plain words, with its conditions, source and date, and a link to it on the rules page.
4. Flags explain themselves when tapped: a clock means older than usual (with the date of the last value); "משני" or "מוסדי" means a weaker source (and which); a lock means the site cannot compute it (and which open question blocks it).

**Done when:** the reader knows where the number comes from and how far to trust it.
**Traces to:** CLAUDE.md "every number traces to a source"; product.md D3, D7, D10, 3.8; design-system.md 3.2.

### Flow 5. See everything a company offers

**Starts:** the companies list (from the first page or the menu), a company on a guide page, or search.

1. The companies list shows every managing company in the regulator's fund data. Typing filters it.
2. A company page lists every product and track the company offers, grouped by product type ("קופת גמל להשקעה", "קרן השתלמות" …), each under the name the company uses. Each group links to that product's guide page.
3. Each track row shows the name, the fund number, the regulator's classification, what the money is invested in, in plain Hebrew, and one line on why someone might pick it. The default track is marked. Tracks with the same name are grouped, with the answer from the data: two separate funds, one fund listed twice, or not resolved.
4. Tapping a track opens its page: the fund's official record and its date, what it invests in, what to check, and a link to the product's guide page.

**What can go differently:** fees show "עוד לא מוצג" until the meaning of the regulator's fee fields is confirmed. If the fund data is older than a month, a banner says since when.
**Done when:** the reader can see every option the company offers and what each one is. The same list is what the comparisons choose from in later releases (product.md "no blind spots").
**Traces to:** product.md 3.10, success criterion 5 and appendix E; roadmap.md R1; design-system.md 3.7.

### Flow 6. Look up a name you saw

**Starts:** the search field, from the header of any page.

1. The reader pastes or types a name. Results appear while typing, and match despite small differences in spelling (final letters, quote marks, hyphens).
2. Results are grouped: products, tracks and funds, words from statements and ads, and guide pages.
3. Choosing one opens it: a product on its company page, a track on its track page, a word at the guide section that explains it, a guide page at its top.

**What can go differently:** nothing matches. The page says "עוד לא קוטלג", saves the name on this device so it can be added later, offers a "העתקה" button so the reader can send the name to the founder, and offers to browse the companies or try a shorter part of the name (approved, question 2).
**Done when:** the reader is on the right page, or the name is saved for adding.
**Traces to:** product.md 3.10 ("a name the site cannot match"), 3.1 (a term from a statement finds its page); architecture.md 3.5 (search); design-system.md 3.7.

### Flow 7. Something the site doesn't cover yet

**Starts:** the link at the end of the guide list, the first page, or search.

1. One page lists the products the site knows about but does not cover yet (savings policies, structured deposits, corporate bonds and others).
2. Each one says what is known, which open question keeps it out, and why that question matters.

**Done when:** the reader knows the site cannot help with it yet, and why.
**Traces to:** product.md D2, 3.1 (the "not covered yet" page).

### Flow 8. Read the rules and the site's judgement calls

**Starts:** a rule from flow 4, or the menu.

1. The rules page lists every rule the site uses, grouped by product type, with a list to jump between groups. Each rule shows its plain text, conditions, figures by tax year, source and date checked, how strong the source is, and when it will be re-checked. Open questions are marked as such.
2. The parameters page lists the site's own judgement calls, such as when two options count as a tie. Each shows its value, why it was chosen, who approved it and when, and where it is used. One not set yet says so.

**Done when:** the reader has found the rule or judgement behind a number.
**Traces to:** product.md 3.8; design-system.md 3.8.

### Flow 9. When data is old or missing

**Starts:** the site itself; the reader only sees the result.

1. The regulator's fund data is fetched every month. When a new month appears, the pages update and the change is logged.
2. If a fetch fails, the site keeps the last data with its date. Once that is older than a month, numbers from it show the clock and company and track pages show "לא עודכן מאז …". The check runs in the reader's browser against today's date, so it still works if updates stop.
3. A rule figure past its end date is never used: the calculation stops and says "הנתון לא עודכן".

**Done when:** a reader can never mistake old data for current data.
**Traces to:** product.md D3, section 6; architecture.md 2 (time checks in the browser), 3.3.

### Flow 10. The founder adds a missing name

**Starts:** a name shows "עוד לא קוטלג" on the founder's device, or a friend tells him about one.

1. The founder notes the name, where it was seen (which app, ad or statement) and the date.
2. He runs the catalogue helper, or asks Claude, which creates the entry; he fills in what it is (product type, and fund numbers where it is a track).
3. A pull request runs the checks, including that every fund number exists in the latest regulator data.
4. Once merged, the site rebuilds and the name is found everywhere. The change is logged.

**What can go differently:** a friend's unmatched names stay on the friend's phone. Getting them off the phone as a file comes in release 3. Until then the friend copies the name with the "העתקה" button and sends it to the founder (approved, question 2).
**Done when:** search finds the name for everyone.
**Traces to:** product.md 3.10, 6a, section 6; architecture.md 3.3 (helpers).

---

## 4. Screens these flows need

| Screen | Flows | In the mockups |
|---|---|---|
| First page | 1 | no |
| Header and menu | 1 | yes (header); menu sheet no |
| Search, with results and "not catalogued yet" | 6 | no |
| Guide list | 2 | no |
| Product guide page | 2, 3 | yes |
| Exposure guide page (what the money is invested in) | 2 | no |
| Timeline values (sheet on phone, panel on PC) | 3 | yes |
| Where a number comes from (sheet on phone, card on PC) | 4 | yes (phone) |
| A rule (card) | 4 | no |
| Companies list | 5 | no |
| Company page | 5 | yes (redrawn 2026-10-23 as one list, without the app view) |
| Track page | 5 | no |
| Not covered yet | 7 | no |
| Rules page | 8 | no |
| Parameters page | 8 | no |

Flows 9 and 10 need no screen of their own: flow 9 shows up as flags and banners on the screens above, and flow 10 happens in the repository.

---

## 5. Questions for the founder (answered 2026-10-23)

1. **What the first page shows.** The product documents don't define it. Proposal: only the search field, the two doors (guide and companies) and the link to what isn't covered yet. Nothing that needs data of its own. **Approved.**
2. **Getting a friend's unmatched names to you before release 3.** A friend's "not catalogued yet" names stay on their phone until export arrives. Proposal: a "העתקה" button on the "not catalogued yet" screen, so they can paste the name to you on WhatsApp. **Approved**, and recorded in `docs/product.md` (3.10 and appendix D).

---

## 6. Screen briefs

One brief per screen in section 4. They apply `docs/design-system.md`. Mockups for the guide page, the timeline values, the number sheet and the company page are on the mockup canvas (https://claude.ai/artifact/T2WWNHiNhqXxSkmssTFbCS); those briefs add only what the mockups don't show.

**For every screen:**

- Hebrew, right to left, dark only. The page starts at the right; lists, chips and steps run from right to left; time on a graph runs left to right.
- Phone means 360 to 430 px wide and is the base design. PC means 1024 px and up (`lg`). Between them (`md`, 768 px) cards go two across and tables become real tables.
- The header (6.2) is on every screen. Any figure goes through the provenance number, so it shows its source style and opens the number sheet (6.8).
- Hebrew copy here is draft wording, in the plural imperative ("הדביקו", "בחרו"). Names of products and tracks appear exactly as the source writes them.

### 6.1 First page

**Flows:** 1. **Mockup:** none.

- The site name (h1) and one line: "להבין חיסכון והשקעה בישראל, עם מקור לכל מספר."
- The search field, labelled "מה ראיתם?", placeholder "הדביקו שם של מוצר, מסלול או מונח". It opens search (6.3) on focus.
- Two door cards:
  - "להבין סוג של חיסכון", with "מה זה, כמה זה עולה ואיך זה ממוסה". Opens the guide list (6.4).
  - "מה חברה מציעה לי", with "כל המוצרים והמסלולים שלה, עם הסבר לכל אחד". Opens the companies list (6.10).
- A small link: "מה האתר עוד לא מכסה" (6.13).

**Phone:** one column, the search field full width at 48 px, the two cards stacked, the link last. Everything fits the first screen without scrolling.
**PC:** a centred column of 38rem; the two cards side by side under the search field.
**States:** none. The page holds no figures and needs no data.
**Components:** search field, card (the whole card is the link, with a mirrored chevron at the inline end).

### 6.2 Header, menu and footer

**Flows:** 1, all. **Mockup:** header on every board; no menu sheet.

- **Phone:** a 56 px sticky bar: site name at the start (right); search and menu as 44 px icon buttons at the end (left). The menu opens a bottom sheet with 48 px rows: "מדריך", "חברות ומסלולים", "כללים", "פרמטרים", then a divider and "מה האתר עוד לא מכסה". The current page is in weight 500 with a teal marker at the start of its row.
- **PC:** a 64 px sticky bar: site name, then the four destinations as text links (the current one underlined in teal), then the search field (340 px) at the end.
- **Footer** on every page: "כללים", "פרמטרים", "מה האתר עוד לא מכסה".

**States:** the menu sheet closes on X (top left), on a tap outside it, or on choosing a row.
**Components:** header, sheet, icon button.

### 6.3 Search

**Flows:** 6, and 1 from the first page. **Mockup:** none.

- The field, focused, with its text in `dir="auto"`, a search icon at the start and a clear button at the end.
- Before typing: one hint line, "אפשר להדביק את השם בדיוק כמו שהוא מופיע באפליקציה, בפרסומת או בדוח."
- Results appear while typing, in four groups, each with a small heading:
  - "מוצרים" (catalogued names);
  - "מסלולים וקופות" (tracks and funds);
  - "מונחים מדוחות ופרסומות" (terms);
  - "עמודי מדריך" (guide pages).
- Each result: the name with the matched part in weight 600, and one quiet line saying where it is (company and product type, or the guide page a term belongs to). At most five per group, then "הצגת כל התוצאות בקבוצה".
- **Not catalogued yet** (no match):
  - the title "עוד לא קוטלג";
  - "את השם "{השם}" עוד אין אצלנו. שמרנו אותו במכשיר שלכם כדי שיהיה אפשר להוסיף אותו.";
  - a primary "העתקה" button with the line "העתיקו ושלחו את השם, כדי שיתווסף";
  - two quiet links: "לרשימת החברות" and "לחפש חלק מהשם".

**Phone:** a full-screen sheet; the field at the top with the keyboard open; X at the top left; results scroll under the field.
**PC:** the header field; results in a popover under it, 480 px wide, up to 70% of the window high. Arrow keys move through results and Enter opens the selected one.
**States:** after copying, the button shows a check and "הועתק" for two seconds. Search works without a network connection once the page has loaded (the index ships with the site).
**Components:** search field, sheet, popover, empty state, button.

### 6.4 Guide list

**Flows:** 2. **Mockup:** none.

- h1 "מדריך" and the lede "כל סוג של חיסכון והשקעה שהאתר מכסה. לכל אחד אותו מבנה, כדי שאפשר יהיה להשוות."
- h2 "איפה הכסף מוחזק", then a card for each product (wrapper).
- h2 "במה הכסף מושקע", then a card for each exposure.
- Each card: the name (h3) and one line on what it is. No figures.
- A last card in a quieter style: "מה האתר עוד לא מכסה".

**Phone:** one column of cards. **PC:** three columns; two at `md`.
**States:** none.
**Components:** instrument card.

### 6.5 Product guide page

**Flows:** 2, 3, 4. **Mockup:** "מדריך · טלפון" and "מדריך · מחשב".

The mockups show the layout. Also designed for:

- **A product with a lock-up** (for example a keren hishtalmut): the "how money goes in and out" section leads with when the money becomes free; the graph draws a marker line with "אפשר למשוך מכאן" at that year.
- **Parts that apply to the reader:** once age or employment type is entered, rows that apply get a small blue tag, "לפי מה שהזנתם". Rows that don't apply stay visible, in quiet text, with the reason ("לשכירים בלבד").
- **A section blocked by an open question:** the blocked callout stands in place of the missing figure, naming the question; the rest of the section still shows.
- **Old data:** a clock on each affected figure; nothing hidden.
- **A rule figure past its end date:** the graph area is replaced by a callout, "הנתון לא עודכן: {שם הכלל}", with a link to the rule.
- **"Typical use":** ends with links to related product pages as chips ("גם כדאי להכיר: פיקדון בבנק").

**Components:** section index, guide sections, key-value list, fee table, money-flow strip, dimension checklist, term table, timeline (6.7), provenance number.

### 6.6 Exposure guide page

**Flows:** 2. **Mockup:** none.

- h1 the exposure as people call it (for example "מדד S&P 500"), and one line on what the money is invested in.
- The same section index and fixed order as a product page, without the timeline:
  - "מה זה": what the exposure is;
  - "איך מחזיקים את זה": a card for each product that can hold it, linking to its guide page;
  - "סיכונים": risks;
  - "מה לבדוק": the dimension checklist for this exposure;
  - "מונחים": the words used for it.
- The cards under "איך מחזיקים את זה" carry no ranking and no figures; ranking for a goal comes in release 2.

**Phone:** one column; the holding products as stacked cards. **PC:** the holding products three across; section index at the start (right).
**States:** a product that cannot hold this exposure is not listed. One whose tax treatment for it is an open question is listed with the lock and the question.
**Components:** as 6.5, without the timeline.

### 6.7 Timeline values

**Flows:** 3. **Mockup:** "טלפון · שינוי ההנחות", and the panel in "מדריך · מחשב".

The mockups show amount today, monthly deposit, years, return and inflation. Also designed for:

- **Age** ("גיל (לא חובה)"): a number field with minus and plus buttons, empty by default.
- **Employment type** ("סוג העסקה (לא חובה)"): a segmented control, "שכיר | עצמאי", with nothing selected by default.
- **One link at the bottom:** "חזרה לכל הערכים של הדוגמה", shown only when at least one value was entered.
- **Errors:** under the field, in red text with the field edge red: "הזינו מספר", or "הסכום לא יכול להיות שלילי". The graph keeps the last valid value until the error is fixed.
- **A return the reader enters:** a line under the field, "הגרף יסומן בקו מקווקו, כי התשואה היא שלכם".

**Phone:** a bottom sheet over the graph, up to 85% of the screen; the headline number stays visible above it and changes while the reader types.
**PC:** a 300 px panel at the start (right) of the graph, always open.
**Components:** field, number field, slider field, stepper, segmented control, state tag, sheet.

### 6.8 Where a number comes from

**Flows:** 4. **Mockup:** "טלפון · נגיעה במספר" (a calculated number).

The mockup shows a calculated number. The other kinds:

- **From a source:** the value; the document and section as a link ("פתיחת המקור" with the mirrored external-link icon); the publisher; "נבדק ב־{תאריך}"; the dates it applies from and to; the rule chips.
- **Entered by you:** "הזנתם את הערך הזה", the example value it replaced (as a number from a source), and the reset button.
- **Site parameter:** the value, the tag "פרמטר של האתר", the reason in one or two sentences, and "אושר ב־{תאריך}". A provisional default shows "ערך זמני שהאתר קבע" instead.
- **Unknown** ("לא ידוע"): why it is unknown, from the data's note.
- **Flags**, as a line at the bottom when present:
  - stale: "לא עודכן מאז {תאריך}. בדרך כלל מתעדכן {כל חודש}.";
  - weaker source: which kind, and what it means.

**Phone:** a bottom sheet, up to 70% of the screen. **PC:** a card up to 22rem wide beside the number, closed by Esc or a click outside.
**Components:** provenance popover, state tag, strength label, rule reference.

### 6.9 A rule

**Flows:** 4, 8. **Mockup:** none.

- The rule chip (its ID) and its short title.
- The strength label: "מקור ראשי", "מקור ראשי (עותק)", "מקור מוסדי", "מקור משני", or "שאלה פתוחה".
- The rule in plain words, two to four sentences.
- "תנאים וחריגים" as a disclosure.
- Figures by tax year, each a number from a source.
- The source as a link, with "נבדק ב־{תאריך}".
- A link "לכל הכללים", which opens the rules page at this rule.
- **An open question** uses the blocked style instead: "שאלה פתוחה", what is unknown, and which numbers on the site wait for it.

**Phone:** a bottom sheet; tapping a rule inside the number sheet replaces its content, with a back arrow (pointing right) at the top. **PC:** a card like 6.8.
**Components:** rule reference, strength label, disclosure, callout (blocked).

### 6.10 Companies list

**Flows:** 5. **Mockup:** none.

- h1 "מה חברה מציעה לי" (the menu calls this page "חברות ומסלולים") and the lede "בחרו חברה כדי לראות את כל המוצרים והמסלולים שלה, ומה כל אחד מהם."
- A filter field, "חיפוש חברה", which narrows the list as you type.
- One row per managing company in the regulator's data:
  - the name as the regulator writes it;
  - one quiet line with the product types it runs ("גמל, השתלמות, פנסיה");
  - a mirrored chevron.
- Rows are in Hebrew alphabetical order.

**Phone:** one column of 56 px rows. **PC:** two columns of rows, filter at the top, 72rem page width.
**States:** a filter with no match shows "לא מצאנו חברה בשם הזה" and a link to the full search.
**Components:** search field, list row.

### 6.11 Company page

**Flows:** 5. **Mockup:** "חברה · טלפון" and "חברה · מחשב", redrawn on 2026-10-23 as the single list below (product.md appendix E).

- h1 the company name; under it "כל מה שהחברה מציעה, עם הסבר לכל מסלול", with the regulator's data month.
- The fee-pending callout, then the list heading "כל המסלולים של {חברה}".
- Every track the company runs, grouped by product type under disclosures ("קופת גמל להשקעה", "קרן השתלמות" …), the first open, each with its count of tracks.
- Each group heading links to that product's guide page.
- Track rows as in design-system 3.7; same-name tracks in a near-duplicate group.
- After the list, the paste card "לא מצאתם שם?" (on PC in the side column), which opens search (6.3).

**States:**

- **Old data:** a caution banner under the h1, "נתוני הרשות לא עודכנו מאז {חודש}".
- **Same-name tracks still unresolved:** the group banner says "לא הוכרע: הנתונים לא מראים אם זו אותה קופה", in caution colours.

**Components:** track row, near-duplicate group, fee-pending note, disclosure.

### 6.12 Track page

**Flows:** 5, 6. **Mockup:** none.

- Breadcrumb "חברות ומסלולים › {חברה} › {מסלול}"; on a phone only the back link to the company.
- h1 the track name exactly as the source writes it; under it "קופה {מספר}" in the identifier style, and the tag "ברירת המחדל" when it is the company's default track.
- One line: why someone might pick this track.
- A key-value card, every value a number or text from the regulator's data with its source style:
  - "חברה מנהלת" (link to the company page);
  - "סוג מוצר" (link to the guide page);
  - "סיווג";
  - "במה הכסף מושקע";
  - "דמי ניהול מחיסכון" and "דמי ניהול מהפקדה", which show the fee-pending note for now;
  - "נכון לחודש".
- When another track has the same name: a caution callout, "יש מסלול נוסף באותו שם", with the answer and a link to the other track.
- The dimension checklist for this track.
- A space reserved under the h1 for the release 2 mark ("מתאים למטרה שלכם?"); nothing is drawn in release 1.

**Phone:** one column. **PC:** the key-value card and the checklist side by side (card at the start, 360 px), the page at 72rem.
**Components:** key-value list, tag, callout, dimension checklist, provenance number.

### 6.13 Not covered yet

**Flows:** 7. **Mockup:** none.

- h1 "מה האתר עוד לא מכסה" and the lede "מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה."
- One card per product:
  - the name (h3);
  - "מה ידוע" in two or three sentences;
  - one blocked callout per open question that keeps it out ("שאלה פתוחה {מזהה}: {מה לא ידוע}");
  - "למה זה חשוב" in one sentence.

**Phone:** one column. **PC:** two columns of cards.
**States:** a product that moves into full coverage disappears from this page and appears in the guide list.
**Components:** card, callout (blocked), rule reference.

### 6.14 Rules page

**Flows:** 8. **Mockup:** none.

- h1 "כללים" and the lede "כל כלל שהאתר משתמש בו, עם המקור שלו. כלל שהמקור שלו חלש יותר מסומן, ושאלה פתוחה מסומנת במנעול."
- Rules grouped by product type, using the rule card of 6.9 at full width, each an anchor target.
- Each group lists its open questions at the end, in the blocked style.
- A re-check date shows as "ייבדק שוב ב־{תאריך}" on rules likely to change.

**Phone:** the section-index chips for the groups at the top; each group a disclosure, closed unless the reader arrived on a rule inside it. **PC:** the group index at the start (right); all groups open.
**Components:** section index, disclosure, rule card, strength label.

### 6.15 Parameters page

**Flows:** 8. **Mockup:** none.

- h1 "פרמטרים של האתר" and the lede "החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא כללים מהחוק, ואי אפשר לשנות אותן מהעמוד."
- One card per parameter:
  - its name in plain Hebrew;
  - its value as a number with the site-parameter tag;
  - "למה" in one to three sentences;
  - "אושר ב־{תאריך}", or "ערך זמני שהאתר קבע" for a provisional default;
  - "משמש ב:" with links to where it is used.
- A parameter with no value yet shows "עוד לא נקבע".

**Phone:** one column. **PC:** two columns of cards.
**Components:** card, provenance number, state tag.
