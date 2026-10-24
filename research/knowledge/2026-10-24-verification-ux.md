# The "wait, really?" path: verification UX from any claim to the third-party document

Written 2026-10-24 by the trust-and-provenance UX specialist, for the knowledge-layer brief
(`research/knowledge/README.md`). Read-only: nothing in code or data was changed, and no number
was verified. The brief in the founder's words: a person surprised by something the site says
should be able to argue with it, reach a government paper in a tap or two, and learn something,
"without needing to silently question the site's credibility ... but dont make it too cluttering".

Reference patterns drawn on: Wikipedia's footnote marks and "retrieved on" dates; Kol Zchut's
source line under each statement ("סעיף 3 לחוק..."); gov.il's document pages; MoneySavingExpert's
"how we check this" line; academic footnotes (locator before link); fact-checkers' "see the
source" with the quoted words beside the link.

Sections: 1 what exists; 2 the flows and tap counts; 3 strength and honesty; 4 clutter budget
and strings; 5 the data gap; 6 decisions for the founder; 7 build order.

---

## 1. What exists today (read-only survey)

### 1.1 The components (`site/app/components/provenance.tsx`)

- **`Num`**: every figure; a `button` with the state underline (sourced solid, computed dotted,
  entered blue ink), one caution icon before the digits for a weak source or a date ahead, a clock
  for stale. Tap opens the sheet (bottom sheet on a phone, anchored popover on PC).
- **`ValueSheet`** (sourced state): header with the figure and a state tag; then a `dl` of rows:
  `מקור` (the `SourceLink`), `פורסם על ידי` (publisher), `נבדק` (date), effective dates or
  `תקף לשנת`, `כלל` (rule chips), a Hebrew note if any; a strength callout for institution,
  secondary, mirror or open; a "לכל הכללים" link button. Computed state: formula name and ID,
  inputs as `Num`s, rules used with a `StrengthLabel` each. Entered: the line, the value it
  replaced, reset.
- **`SourceLink`**: the title when Hebrew, else the link's host in LTR with the English title in a
  collapsed `<details>` ("שם המקור באנגלית"); external icon; `target=_blank`.
- **`StrengthLabel`**: tags — primary plain, mirror plain "(עותק)", institution and secondary in
  caution with an alert icon, open in blocked with a lock, entered in blue.
- **`RuleRef`**: the ID chip (LTR, slashed zero, 44 px hit area). **`RulesLine`**: "כללים:" then
  chips, always the last line of a block, never inside a sentence (design review C1). The chips
  carry no title, on PC either (the design-system text promises a short title at PC width; the code
  does not do it).
- **`RuleCard`**: h2 "כלל {ID}: {title_he}", a `StrengthLabel` under it, `text_he`, the figures
  table ("סכומים לפי שנת מס"), then a `dl`: `מקור` = the **first figure's** source link only, or
  "הקישור למקור עוד לא צורף לכלל הזה." when the record has no figure; `נושא`, `נבדק`,
  `ייבדק שוב`, `נוגע ל` (dimension tags); "לכל הכללים" link to `/rules#ID`.
- **`Term`** and **`TermCard`**: glossary terms; a term card shows its own source with a checked
  date and strength.
- The sheet keeps a stack: a chip tapped inside a number's sheet pushes the rule card with a back
  arrow (`Sheet` `onBack`).

### 1.2 How a source is named (`site/app/lib/source-label.ts`)

Hebrew title wins; otherwise the host (`he.wikisource.org`, `www.gov.il`) with the English title
behind a disclosure. Nothing about the publisher, section, page or document kind reaches the label.

### 1.3 The rules page (`site/app/routes/rules.tsx`)

Title "כללים", lede "כל כלל שהאתר משתמש בו, עם המקור שלו. כלל שהמקור שלו חלש יותר מסומן,
ושאלה פתוחה מסומנת במנעול.", the number legend, a filter field (id, titles, Hebrew text), then
25 collapsible topic groups of inline `RuleCard`s, every card an anchor target. Opening a group
with a hash works.

### 1.4 The data

- `data/rules/*.json`: 500 records (`id, title, title_he, text_he, strength, dimensions,
  likely_to_change, recheck_date, figures?, figure_names_he?, il_finance_file, checked`). The
  schema (`packages/schema/src/collections/rules.ts`) has **no source field on the rule**; a source
  exists only inside each figure's value object (`source: {url, title, publisher, strength}` plus
  `checked`, `notes`). Counts: 214 records carry at least one figure with a source; 286 carry none.
  Strength: 278 primary, 144 primary-mirror, 70 institution, 7 secondary, 1 open.
- Of the 484 figure sources: 316 have a Hebrew title; 111 point at `he.wikisource.org` and **none
  carries a section anchor**; 108 are gov.il PDFs (`BlobFolder`), 22 gov.il HTML pages; the rest
  are btl.gov.il, boi.org.il, fs.knesset.gov.il, nevo.co.il, analyst.co.il, company documents.
  Publisher strings are English ("Minister of Finance (Nevo mirror)"); `notes` are English working
  notes and are hidden by `mostlyHebrew`.
- `.claude/skills/il-finance/references/*.md`: 836 `### <ID>` entries, every one with a
  `- Source:` line. 670 lines carry a locator (`s. 3(ה4)(3)`, `reg. 2(א)(7)`, `p. 8`, `pp. 27–30`,
  `clauses 7.1, 7.2`); about 300 carry a quoted phrase in the source line or the rule line
  ("ניתן לשלב בין המסלולים או לשנות אותם מעת לעת ללא אירוע מס"); 500 cite more than one document;
  285 say "mirror". Strength words in the line: `primary` (1,097), `institution` (404),
  `secondary` (58), with qualifiers in parentheses: `(mirror)`, `(historical)`,
  `(unofficial consolidation)`, `(TASE rule guidelines)`. Some entries cite by reference only
  ("Altshuler bylaws 1.12.2024, s.23" with the link earlier in the file; "as cited in CORP-03";
  "link above"); a handful are empty (`managed-and-robo-portfolios.md:62`).
- `packages/pipeline/src/references.ts` reads only the `###` IDs and open-question numbers from the
  markdown; nothing parses the source lines.
- Search (`site/app/routes/search-index.ts`) indexes products, tracks, terms, guide pages, banks,
  companies and not-covered items. **Rules are not searchable** outside the filter field on `/rules`.

### 1.5 The live pages (fetched as text, not in a browser)

- `/guide/kupat-gemel-lehashkaa`: claims with numbers ("עד 1.05% בשנה") are `Num`s; claims without
  numbers ("בלי מס, גם מעבר לקופת גמל להשקעה אחרת") end in a "כללים:" line with two to four chips
  (KGL-01, KGL-06, TXK-03, TXK-05...). The page has **no external link in its text**; every path to
  a document goes through a sheet. "נבדק" appears nowhere on the page; the footer says
  "נתונים נכון ל־24.10.2026".
- `/rules`: the GOV-03 card shows the source as the Bank of Israel document's Hebrew title with a
  link; GOV-01 (a law read on Nevo, strength "מקור ראשי (עותק)") shows "הקישור למקור עוד לא צורף
  לכלל הזה." although the markdown has the Nevo link; PF-02 shows an English title
  ("Provident Funds (Management Fees) Regulations 2012, תקנה 2(א)(1)") because the title field
  mixes languages. Each card is roughly 12 to 16 lines tall on a phone before the source row.
- `/goal/compare` renders nothing without a saved goal; its number sheets are the `ValueSheet`
  above.

### 1.6 What this means for the founder's goal

The machinery is right (every figure is a button; chips open cards; strength is a vocabulary) and
the gap is in three places:

1. **The source is last and thin.** On the rule card the link comes after the figures table and
   five metadata rows; it names the document but not the publisher in Hebrew, the section, or the
   words. A person who wants to argue has to open a 400-page ordinance PDF and search.
2. **A sentence without a number has no handle.** "מעבר מסלול לא ממוסה" ends in four chips with no
   titles; the person must guess which chip (TXK-04) holds the answer. That is the founder's own
   example, and it is the worst path today.
3. **286 rules show "הקישור למקור עוד לא צורף"** while the link, locator, date and strength exist in
   the markdown, line for line.

---

## 2. The ideal flow from each starting point

The target for every start: **the third-party document in at most two taps, and the words that
back the claim in one.** The second tap is always the same element, the source line, so it becomes
a habit.

### 2.1 Tap counts, today and proposed

| Start | Today | Proposed |
|---|---|---|
| A number in a sentence ("עד 1.05% בשנה") | 1 tap sheet → 2nd tap the link (title or host). No section, no words. | 1 tap sheet; the source line is the first block under the header; 2nd tap opens the document at the page or section (2.4). Quote shown when the record has it. |
| A rule chip on a "כללים:" line | 1 tap card → scroll past figures and 4 rows → 2nd tap link | 1 tap card; the source line is right under the rule text; 2nd tap the document. |
| A sentence with no number ("בלי מס, גם מעבר לקופה אחרת") | Guess among 2 to 4 chips (1 tap, possibly wrong, back, 1 tap) → scroll → link: 3 to 5 taps | The sentence carries one **claim mark** (2.3); 1 tap opens the one rule that backs it, source line visible; 2nd tap the document. |
| A rule card on `/rules` | 1 tap the link (after scrolling the card) | 1 tap; the source block sits under the text, and the page's filter also matches publisher and document names. |
| A search result | Rules are not indexed. Term results lead to a guide page. | Rules are indexed (2.6): "מעבר מסלול" → result "כלל TXK-04 · מס: קופת גמל להשקעה…" → 1 tap opens the card in the sheet → 2nd tap the document. |
| A computed figure ("נשאר לכם 112,400 ₪") | 1 tap sheet lists inputs; each input 1 more tap; link 1 more: 3 taps | Unchanged in count (a computed figure has no single document); the rules-used list gets the first source line per rule (3.3), so the document is still 2 taps for the rule the person doubts. |

### 2.2 The sheet for a sourced number (`ValueSheet`, sourced state)

Order, top to bottom. Everything above the line "— fold —" must fit a phone sheet at 70 vh without
scrolling (about 11 lines of 16 px text).

1. Header as today: the figure, unit word, state tag; "ערך זמני" or the clock where they apply.
2. `about` (the figure's Hebrew name) as today.
3. **Source block** (new; replaces the three rows `מקור`, `פורסם על ידי`, `נבדק`):
   - Line 1, the link: `{publisher_he} · {document_he}` and, when the record has one, `, {locator_he}`
     (for example "רשות המסים · פקודת מס הכנסה, סעיף 3(ה4)(3)"). Teal, external icon at the end,
     a small `PDF` tag before the icon when the target is a PDF. The whole line is the anchor.
   - Line 2, the quote, when the record has one: `״…״` in `text-sm text-muted-foreground`, max
     three lines, then "…". Never translated or paraphrased: the document's own words.
   - Line 3, the meta, `text-xs text-muted-foreground`: `נבדק 22.10.2026` and, only when the
     strength is not primary, ` · {strength word}` ("עותק", "לפי החברה", "מקור משני"). When the
     rule is `likely_to_change: yes`, or `recheck_date` has passed, or `checked` is older than the
     parameter `source_age_warning_months` (proposed 6; a site judgement, lives in
     `data/parameters/`): append the sentence of 3.4.
   - A second source, when there is one, is a second block of the same shape, collapsed behind
     "עוד מקור אחד" / "עוד {n} מקורות" (a `Disclosure`). The first block is the strongest one (3.2).
4. `בתוקף מתאריך` / `תקף לשנת` rows as today, as a one-line `dl`.
5. `כלל` row with chips as today, each chip followed on PC by its `title_he` in `text-xs` (the
   design-system already promises this).
   — fold —
6. The strength callout only for `open`, `institution`, `secondary` (3.1). The mirror no longer
   gets a callout: the word "עותק" in the meta line and the mirror label on the link (2.5) say it.
7. "לכל הכללים של {product}" / "לכל הכללים" as today.
8. **"העתקת ההפניה"** quiet button (4.2 string 7): copies one plain-text line to the clipboard,
   `{claim or figure} — {publisher_he}, {document_he}, {locator_he}. {url} (נבדק {date})`, so the
   person can paste it into a WhatsApp argument. The founder asked for "able to easily argue";
   this is the cheapest way to let the argument leave the site with its evidence.

The strength tag leaves the header of the sourced sheet: a primary source needs no badge, and
the weak ones are said in the meta line and the callout. Fewer tags, same information.

### 2.3 The claim mark: a sentence with no number

A new content component, `Claim`, for the sentences that make the person say "really?":

```tsx
<Claim rule="TXK-04">בלי מס, גם מעבר לקופת גמל להשקעה אחרת</Claim>
```

- Renders the sentence unchanged, followed by one 12 px document glyph (`IconFile`, `muted-foreground`,
  `align-[-1px]`, `select-none`), separated from the last word by a thin space; glyph and sentence
  are one `button` with the same hit-area pseudo-element as `.num`. No underline, no colour: the
  glyph is Wikipedia's `[1]` reduced to one mark. Accessible name "{sentence}, מקור".
- Tap opens the **rule card of that one rule** in the sheet; its source block is the second thing
  on the card (2.4), so the document is one tap further.
- Takes exactly one rule ID. A sentence that rests on two rules names the one that answers the
  surprise and leaves the rest to the paragraph's "כללים:" line.
- Budget: **at most one claim mark per paragraph, and only where the content author judges the
  claim surprising** (the founder's test: would a friend say "wait, really?"). The eight-dilemma
  scenario audit of 2026-10-24 is the list to start from; the kupat-gemel guide gets three
  (track switch not taxed, transfer to another fund not taxed, 25% real vs 15% nominal). Everything
  else keeps the "כללים:" line as today.
- The "כללים:" line stays and gets, on PC only, the rule's `title_he` after each chip in
  `text-xs`, truncated to one line (`KGL-06 מי רשאי לפתוח`). On a phone the IDs stay alone; the
  claim mark carries the surprise there.
- The number legend's phone hint becomes "הקישו על מספר, או על משפט עם הסימן, כדי לראות מאיפה
  הוא." only on pages that have a claim mark (the legend already takes flags per page).

Why not underline the whole sentence like a term: the dashed-teal `.term` means "a word to
explain"; a second underline style for "a claim to verify" would turn the guide into a
hyperlink carpet, the clutter the founder refused. One quiet mark at the end of the sentence is
the pattern readers already know from footnotes.

### 2.4 The rule card (`RuleCard`), in the sheet and on `/rules`

Order:

1. h2 "כלל TXK-04: מעבר מסלול והעברה בין קופות גמל להשקעה אינם ממוסים" as today. The
   `StrengthLabel` under the heading is shown **only for `open`, `institution`, `secondary`**; a
   primary rule shows nothing there (the source block says "חוק"/"תקנות"/gov.il itself). A mirror
   shows nothing in the header either: the link label says "עותק" (2.5).
2. `text_he` as today.
3. **Source block(s)** exactly as in 2.2 item 3: the strongest source first, the rest behind
   "עוד {n} מקורות" in the sheet and **all shown** on `/rules` (the page is where everything lives,
   4.1). When the rule has a `reading: "inferred"` (3.3) the tag "פירוש של האתר" and its line sit
   between the text and the sources.
4. The figures table ("סכומים לפי שנת מס") as today, now after the sources. Each figure's `Num`
   keeps its own sheet (a figure can come from a different document than the rule's text).
5. Meta, one quiet `dl` as today but shorter: `נבדק`, `ייבדק שוב` (when set), `נוגע ל` (tags). The
   `נושא` row leaves the sheet and stays on `/rules` only (the person reached the card from the
   topic; on `/rules` it is the group heading, so the row is redundant there too and can go).
6. "לכל הכללים" (sheet) as today; "העתקת ההפניה" quiet button beside it.

The card with no source (until 5 is done): the row "הקישור למקור עוד לא צורף לכלל הזה." stays, in
the source block's place, so the gap is seen where the link would be.

### 2.5 What the link must do, by document kind

| Target | Label on the link line | Behaviour | On a phone |
|---|---|---|---|
| gov.il / btl.gov.il / boi.org.il PDF (circulars, guides, directives) | `{publisher_he} · {document_he}, עמוד {n}` + `PDF` tag | `href = url + "#page=" + page` when the record has a page; `target=_blank rel=noopener noreferrer`. Desktop viewers (Chrome, Firefox, Edge PDF viewers) honour `#page=`. | iOS Safari shows the PDF inline and ignores `#page=`; Android Chrome downloads unless the server sends `inline` (gov.il `BlobFolder` behaviour: **to be checked once with one URL on an Android phone**). The `PDF` tag and the page number in the label warn the person before the tap; the quote (2.2) gives them the words even if the file only downloads. |
| gov.il / btl.gov.il HTML page | `{publisher_he} · {page title}` | plain new tab | fine |
| Wikisource law page | `{law name} · עותק בוויקיטקסט` (the mirror label, below) | `href = url + "#" + anchor` when the record has the section anchor; Hebrew Wikisource law pages carry per-section anchors (`#סעיף_3` style) — **verify the exact anchor form with one fetch** before the extraction writes them | a long page; the anchor is what makes it usable; without it the person lands at the title and the quote is their only guide |
| Nevo law page | `{law name} · עותק באתר נבו` | plain new tab | Nevo's HTML is dense and not phone-friendly; prefer Wikisource when both are known (policy below) |
| Knesset `fs.knesset.gov.il` PDF (Sefer HaChukim) | `הכנסת · ספר החוקים {n}, עמוד {p}` + `PDF` | as PDF | as PDF |
| A company document (bylaws, tariff) | `{company} · {document}, סעיף {n}` + `PDF` when a PDF, strength word "לפי החברה" in the meta | as above | as above |
| An article (secondary) | `{outlet} · {headline}` with "מקור משני" in the meta | new tab | fine |
| A dataset API URL (data.gov.il datastore) | `data.gov.il · {dataset name}` | **not linked to the API call**; link the dataset's landing page (`/dataset/{slug}`) and keep the API URL in the record's `note` | an API JSON blob on a phone teaches nothing |
| A local file of the site (no http) | "קובץ נתונים של האתר" as today, no link | — | — |

**Mirror policy (the founder wants government papers):**

1. Strength `primary-mirror` means "the law's text, read on a site that copies it". The label says
   so where the person looks, on the link itself: **"נוסח החוק (עותק)"** as the document kind, and
   the host as the mirror name: "פקודת מס הכנסה · נוסח החוק (עותק), ויקיטקסט, סעיף 3(ה4)(3)". The
   strength callout for mirrors goes (2.2 item 6); the existing line "נוסח החוק נקרא באתר שמעתיק
   אותו, ועוד לא באתר הרשמי." moves to a `title` tooltip on PC and to the rules page card only.
2. **Prefer an official link when the record has one.** Order of preference for the first (visible)
   source: a regulator's or ministry's own document (gov.il, btl.gov.il, boi.org.il, isa.gov.il,
   tase.co.il for exchange rules) → the Knesset's Sefer HaChukim PDF (fs.knesset.gov.il) → a
   Wikisource mirror → a Nevo mirror → an institution's document → an article. Among equals, the
   one with a locator wins, then the newer `checked`.
3. When a rule has **both** an official document and a mirror of the law (common: a CMA circular
   plus the regulations on Wikisource), the official one is the first block and the mirror is the
   second, with its link label "לקריאה נוחה: הנוסח המאוחד (עותק)" — honest about what each is for:
   the official paper proves, the mirror is readable.
4. When only a mirror exists, nothing is hidden: the block shows the mirror with "עותק" and the
   meta line ends in "עותק". The researcher's follow-up task (not UX): for the ~15 laws and
   regulations behind the 144 mirror rules, record the official publication (Sefer HaChukim /
   Kovetz HaTakanot PDF via the Knesset legislation database or gov.il) as a second source; the
   consolidated official text is not generally published free in Israel, so the mirror will often
   stay the readable copy. The spec does not assume that search will succeed.
5. Never call a mirror "a government paper" in the copy: "נוסח החוק (עותק)" and the publisher
   stays the issuing authority ("משרד האוצר", "הכנסת"), with the mirror host after the comma.

### 2.6 Search results for rules

- Index every rule: name = `title_he` (fallback `title`), also `id`, also the first six words of
  `text_he`; line = "כלל · {topic name}"; `href = /rules#{id}`; a new search group "כללים" placed
  after "מונחים".
- A result tap on a phone **opens the rule card in the sheet** over the current page (the search
  component already lives inside the `ProvenanceProvider`); "לכל הכללים" in the card goes to the
  anchor. On PC the same. Two taps from the search box to the document, no page change.
- The `/rules` filter also matches `sources[].publisher_he`, `sources[].title_he` and the locator,
  so "פקודת מס הכנסה" lists every rule that rests on the ordinance. This is the "browse by law"
  view the knowledge brief asks for, with no new page.

---

## 3. Strength and honesty without clutter

### 3.1 Where each strength appears

| Strength | Inline (in a sentence) | In the sheet / card | On `/rules` |
|---|---|---|---|
| primary | nothing (the underline alone) | nothing extra: the source block names a law, a regulator or the Knesset | same, plus the English title behind a disclosure |
| primary-mirror | nothing | the link label "נוסח החוק (עותק)" and "עותק" in the meta line; no callout | same, plus the one-line explanation |
| institution ("לפי החברה") | the 14 px caution icon before the digits, as today | caution tag in the header + the existing callout ("הנתון נלקח ממסמך של בנק או של חברה מנהלת, לא מהחוק או מהרשות.") | same |
| secondary | the caution icon, as today | caution tag + callout | same |
| open | the lock, as today | blocked header and callout, as today | same |

Rule: **primary says nothing about itself.** Strength words appear only when the strength is
weaker than the law. That alone removes a tag from most sheets and keeps the amber for the cases
that deserve it; the design-system's "colour never works alone" rule is kept because the weak
states keep icon and word.

### 3.2 Several sources of different strength

The rule's own `strength` is the strongest of its sources (so a rule with a Wikisource law plus a
Harel flyer is `primary-mirror`, not `institution`). The block order follows 2.5 policy 2. The
weak source's own meta line carries its word ("לפי החברה"), so a reader who expands "עוד מקור
אחד" sees that the flyer is the manager's statement and the regulation is the law.

### 3.3 "Derived from three rules" and "inferred, not explicit"

Two different honesty cases, two treatments:

- **A computed figure** rests on inputs and rules. The sheet already lists "ערכים שנכנסו לחישוב"
  and "כללים שנכנסו לחישוב". Add under each rule chip in that list its first source line in
  `text-xs` (publisher · document, locator) as a link, so the document is two taps from the
  computed figure for the rule the person doubts, without opening the card. No new words.
- **A rule whose conclusion the law does not state in one sentence** (TXK-04: "בחוק אין משפט
  מפורש שאומר 'אין אירוע מס'; המסקנה נשענת על…"). Today the honesty lives inside `text_he`, where
  it is easy to skim past. Proposed optional record field `reading: "explicit" | "inferred"`
  (default explicit); when `inferred`, the card shows a neutral tag **"פירוש של האתר"** with the
  line "בחוק אין משפט מפורש על זה; זו המסקנה של האתר מנוסח החוק, ומקורות נוספים אומרים אותה
  במפורש." between the text and the sources. Neutral tone (`muted`), not caution: the law is still
  the source; the reading is the site's. This is a product decision (6.1).

### 3.4 "The site read this on {date}; it may have changed"

Every source block carries `נבדק {date}` (Wikipedia's "retrieved"). The warning sentence is added
only when one of three conditions holds, otherwise the date stands alone:

- `likely_to_change: "yes"` on the rule, or
- `recheck_date` is before the page's `today`, or
- `checked` is older than `source_age_warning_months` (parameter, proposed 6).

Wording (4.2 string 5): "נבדק 22.10.2026; מאז ייתכן שהנוסח השתנה." One sentence, no icon, no amber:
age is information, not a flaw. When `recheck_date` has passed, the existing "ייבדק שוב" row turns
caution-coloured on the rules page only.

### 3.5 Honesty lines that stay out of the sheet

The English `notes` of a value object ("Sold below the redemption amount, with no interest…") are
research notes and stay hidden (audit A21). The markdown's "Conditions / exceptions" is already
folded into `text_he`. Nothing else is promised to the person that the record cannot show.

---

## 4. The clutter budget

### 4.1 One rule, three layers

> **Inline says *that* it is sourced. The sheet says *where*. The rules page says *everything*.**

| Layer | Allowed | Not allowed |
|---|---|---|
| Inline (running text, tables, charts) | the number state (underline or blue ink); one caution icon for a weak source or a date ahead; one clock for stale; one claim mark per paragraph; the "כללים:" line as the last line of a block | strength words, publisher names, dates, links, more than one icon per figure, chips inside a sentence, a mark on a sentence that is not surprising |
| On tap (sheet / popover) | the figure and its name; **one** source block above the fold (link with publisher · document, locator; quote; checked date and a strength word only if weak); effective dates; rule chips with titles on PC; the strength callout for institution, secondary, open; "עוד {n} מקורות" collapsed; "העתקת ההפניה"; "לכל הכללים" | the topic row; dimensions; English titles; the mirror callout; every source expanded; notes |
| Rules page only | all sources expanded; dimensions; recheck date; the English title behind a disclosure; the one-line explanation of each strength; the figures of every tax year; the topic grouping | — |

Measured on the TXK-04 card in the sheet on a 390 px phone: today ~14 lines before the "מקור" row
(which reads "הקישור למקור עוד לא צורף"); proposed ~9 lines to the end of the source block,
including the quoted sentence. The card gets shorter and the document gets closer.

### 4.2 New Hebrew strings

Following `docs/copy.md` section 10: plural imperative or impersonal, no "ניתן", noun-form button
labels, maqaf before a number, ״…״ for quotes, a period only at the end of a sentence, the code
after the words.

| # | Key (proposed) | Hebrew | Where | Note |
|---|---|---|---|---|
| 1 | `source.line` pattern | `{publisher_he} · {title_he}, {locator_he}` — e.g. "רשות המסים · פקודת מס הכנסה, סעיף 3(ה4)(3)" | the link line of every source block | Publisher first (what kind of authority), then the document, then the place in it: the order a person needs to judge, then find. No label word "מקור:" before it; the external icon and the position make it the source. Locator words: "סעיף {n}", "תקנה {n}", "עמוד {n}", "עמודים {a} עד {b}", "פרק {n}", "שאלה ״{q}״" (for FAQ pages); the number keeps the document's own form ("3(ה4)(3)", "74ב(א)(1)") inside a `<bdi>`. |
| 2 | `source.mirrorKind` | "נוסח החוק (עותק)" | the document kind on a mirror link, before the host: "פקודת מס הכנסה · נוסח החוק (עותק), ויקיטקסט, סעיף 3" | Says in four words what `primary-mirror` means; "עותק" is the word the strength label already uses. Hosts: "ויקיטקסט", "אתר נבו". |
| 3 | `source.readable` | "לקריאה נוחה: הנוסח המאוחד (עותק)" | the second block when an official document is first and a mirror second | Tells the person what each link is for; "מאוחד" is the legal term for a consolidated text (נוסח מאוחד). |
| 4 | `source.checked` | "נבדק {date}" | the meta line | Already the row label; now inline with the date, no colon (label with the value on the same line would take a colon per 10.5, but this is a sentence fragment, as in Wikipedia's "retrieved"). |
| 5 | `source.mayHaveChanged` | "נבדק {date}; מאז ייתכן שהנוסח השתנה." | the meta line under the conditions of 3.4 | Semicolon joins two short facts (10.4). No "שימו לב". |
| 6 | `source.more` | "עוד מקור אחד" / "עוד {n} מקורות" | the disclosure below the first block | Dual and plural by `Intl.PluralRules` as the copy rules require ("עוד שני מקורות" for 2). |
| 7 | `buttons.copyCitation` | "העתקת ההפניה" | quiet button at the foot of the sheet and the card | Noun form for a one-action button (10.5). "הפניה" is the word for a citation in Hebrew academic use; "ציטוט" would promise the quoted words only. Toast after: `toasts.citationCopied` "ההפניה הועתקה." |
| 8 | `claim.aria` | "{sentence}, מקור" and the legend hint "הקישו על מספר, או על משפט עם הסימן, כדי לראות מאיפה הוא." | accessible name of the claim mark; the legend on pages with marks | The visible mark carries no word; the legend explains it once per page, as it does for the caution icon. |
| 9 | `rule.inferred` | tag "פירוש של האתר"; line "בחוק אין משפט מפורש על זה; זו המסקנה של האתר מנוסח החוק, ומקורות נוספים אומרים אותה במפורש." | the inferred-reading tag and its line (3.3) | "פירוש" rather than "פרשנות" (which reads as legal interpretation by a court). Neutral tone. Needs the founder's decision (6.1). |
| 10 | `search.groups.rule` and `search.ruleLine` | "כללים"; "כלל · {topic}" | the new search group and its row line | Matches the existing group names (nouns, plural). |
| 11 | `source.pdfTag` | "PDF" | the small tag on a PDF link | Latin as the source writes it (10.5). |
| 12 | `source.officialMissing` (rules page only, mirror rules) | "הפרסום הרשמי ברשומות עוד לא צורף; הנוסח נקרא בעותק." | under the mirror's one-line explanation on `/rules` | Only on the rules page; the sheet already says "עותק". Keeps the standing honesty of audit A26 without repeating it on every tap. |

Strings that change: `strength["primary-mirror"].line` stays for the rules page; the sheet stops
showing it. `rule.sourceMissing` stays as the empty state of the source block.

---

## 5. The data gap: 286 rules with no source in the record

### 5.1 The record field

Add to `ruleRecord` (schema `packages/schema/src/collections/rules.ts`, documented in
`docs/data-schema.md` §4):

```ts
sources: z.array(z.object({
  url: z.string().url(),                 // the document; for a PDF without "#page=", the page comes from `page`
  title: z.string().min(1),              // as the markdown wrote it (often English working title)
  title_he: z.string().min(1).optional(),// the document's Hebrew name, shown when present
  publisher: z.string().min(1),          // as the markdown wrote it
  publisher_he: z.string().min(1).optional(), // "רשות המסים", "הביטוח הלאומי", "משרד האוצר", "הראל"
  kind: z.enum(["law","regulation","circular","regulator_page","official_pdf","exchange_rules",
                "institution_doc","article","dataset","form","other"]),
  strength,                               // the value.ts vocabulary: primary | primary-mirror | institution | secondary
  mirror_host: z.enum(["wikisource","nevo"]).optional(), // set when strength is primary-mirror
  locator: z.string().optional(),         // raw, as written: "s. 3(ה4)(3)", "reg. 2(א)(7)", "pp. 27–30", "clauses 7.1, 7.2"
  locator_he: z.string().optional(),      // "סעיף 3(ה4)(3)", "תקנה 2(א)(7)", "עמודים 27 עד 30"
  page: z.number().int().positive().optional(),   // first page, for "#page=" on a PDF
  anchor: z.string().optional(),          // the fragment for an HTML mirror ("סעיף_3"), without "#"
  quote: z.string().optional(),           // the document's own words, verbatim, Hebrew, max ~240 chars
  checked: isoDate,
  qualifier: z.string().optional(),       // "(historical)", "(unofficial consolidation)", "(summary, not verbatim)"
  note: z.string().optional(),            // English working note; never shown
})).min(1).optional(),
sources_missing_reason: z.string().optional(), // required when `sources` is absent
reading: z.enum(["explicit","inferred"]).optional(),
```

Validator rules (in `packages/pipeline/src/validate.ts`):

- Every rule record has `sources` with at least one entry, or `sources_missing_reason`.
- `strength` of the rule equals the strongest `sources[].strength` (primary > primary-mirror >
  institution > secondary); `open` rules have no `sources` (they may keep `sources_missing_reason`
  "open question").
- `primary-mirror` entries have `mirror_host`; entries on `he.wikisource.org` or `nevo.co.il` are
  `primary-mirror`, never `primary`.
- `page` only when the URL is a PDF (path ends `.pdf` or contains `BlobFolder`); `anchor` only on
  HTML.
- `publisher_he` and `title_he` present for every entry that the site shows first (the strongest);
  a warning, not an error, for the rest.
- `checked` not after the rule's `checked`.
- The figure-level `source` objects stay as they are; the validator warns when a figure's `url` is
  not among the rule's `sources[].url` (a figure read from a document the rule does not list).

### 5.2 Extraction from the markdown

A one-off script, `packages/pipeline/scripts/extract-sources.ts`, run by hand and re-runnable;
its output is reviewed, then committed into the records. It does not touch the markdown.

1. **Split** each reference file at `^### <ID> ` and take the `- Source:` line (up to the next
   `- <Capital>` bullet). Also read the file's `## Sources` section into a per-file title → URL
   table, and every `[title](url)` seen earlier in the file into a running table.
2. **Tokenise** the line into entries. Separators observed: `. ` or `; ` followed by `[`, a
   capital letter, or a Hebrew letter; the marker `· checked YYYY-MM-DD · <strength>` closes an
   entry; a trailing `(qualifier)` after the strength belongs to that entry. Reference-style links
   `[text][tr]` resolve through the file's `[tr]: url` definitions. Angle-bracketed URLs
   `(<https://…>)` are unwrapped.
3. **Resolve an unlinked entry** ("Altshuler bylaws 1.12.2024, s.23", "Law 74ב(ב) (Wikisource
   mirror, above)", "NII FAQ (above)"): match by the longest common token run against the file's
   link tables; "above"/"link above" means the nearest earlier link in the same entry group;
   "as cited in CORP-03, CORP-05" copies those rules' entries (resolved after the first pass). An
   entry that still has no URL is written to `extract-sources.unresolved.md` with file, rule and
   text, and the rule gets `sources_missing_reason: "source line not resolved: <text>"` so the gap
   stays visible on the site.
4. **Locator**: regex over the entry text for `s\.|ss\.|section(s)?|reg(s)?\.|regulation(s)?|p\.|pp\.|clause(s)?|פרק|סעיף|תקנה|עמוד` and the token after; keep the raw string in `locator`, build
   `locator_he` by table (`s.`→"סעיף", `ss.`→"סעיפים", `reg.`→"תקנה", `p.`→"עמוד", `pp. a–b`→
   "עמודים a עד b", `clause`→"סעיף" for bylaws, `פרק`→"פרק"); `page` from the first `p.`/`pp.`
   number when the URL is a PDF.
5. **Quote**: a `"…"` or `״…״` span inside the entry whose content is mostly Hebrew and 8 to 240
   characters long → `quote`. Quotes that sit in the `- Rule:` line (the KGL-06 and TXK-04 pattern)
   are picked up too, when the entry is the only source of the rule or the quote names the source
   in parentheses ("…, Altshuler"). Anything cut with "..." in the markdown keeps the ellipsis.
6. **Strength and qualifier**: `primary` + `(mirror)` or a wikisource/nevo host → `primary-mirror`
   with `mirror_host`; `(historical)`, `(unofficial consolidation)`, `(summary, not verbatim)`,
   `(TASE rule guidelines)` → `qualifier`; any other parenthetical after the strength → `note`.
7. **Publisher and kind** from a host-and-title table checked into `data/sources/publishers.json`
   (`{host or title token → publisher_he, kind}`): `www.gov.il` + "CMA"/"רשות שוק ההון" →
   "רשות שוק ההון, ביטוח וחיסכון" / circular; `www.gov.il` + "Tax Authority"/"רשות המסים" →
   "רשות המסים"; `btl.gov.il` → "הביטוח הלאומי"; `boi.org.il` → "בנק ישראל"; `isa.gov.il` →
   "רשות ניירות ערך"; `tase.co.il` → "הבורסה לניירות ערך"; `fs.knesset.gov.il` → "הכנסת" /
   law; `he.wikisource.org` → publisher by the law's issuing body when the title table knows it
   (ordinance → "רשות המסים", regulations → the minister named in the title), kind law or
   regulation, `mirror_host: wikisource`; `nevo.co.il` likewise; company hosts → the company's
   Hebrew name from `data/providers/` or `data/cma/` when the host matches, kind
   `institution_doc`; otherwise the host, kind `other`, and a warning. `title_he` from the
   markdown title when it is mostly Hebrew (the `isHebrewTitle` test already in
   `site/app/lib/source-label.ts`), else from a short hand-kept table of the ~40 recurring
   documents (Income Tax Ordinance → "פקודת מס הכנסה", Transfer Regulations 2008 → "תקנות
   הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס״ח-2008", Guide 2025
   → "מדריך רשות המסים לשנת 2025" — each entry in the table is a researcher's job, not the
   script's guess; untranslated titles show as today, host first).
8. **Write** `sources` into each `data/rules/<id>.json`, sorted by the preference order of 2.5
   policy 2, and set `reading` to `inferred` only by hand (the script flags entries whose
   "Conditions / exceptions" contain "no explicit", "not explicit", "אין משפט מפורש", "inferred",
   "conclusion rests on" for the researcher to decide).
9. **Report**: counts per file (entries, resolved, unresolved, with locator, with quote, with
   Hebrew title, with Hebrew publisher), and the list of records whose strongest source lacks
   `title_he` or `publisher_he`. The target before the UI ships: 100% of the 500 rules resolved or
   explained, ≥ 90% of first sources with `publisher_he`, ≥ 80% with `title_he`.

Validation of the extraction itself (not of the numbers): a second pass re-reads every written
`url` from the markdown and asserts it appears verbatim in the source file; every `quote` must
appear verbatim in the markdown; 25 records sampled at random are compared by eye against the
markdown by the researcher, with the result noted in the commit. No URL is fetched in this step
(the checked dates are the markdown's, not today's).

### 5.3 What the card shows

| Record state | Sheet / card | `/rules` |
|---|---|---|
| Several sources | the strongest as the block; "עוד {n} מקורות" collapsed | all blocks, strongest first, each with its meta line |
| One source | one block | same |
| Figure sources that differ from the rule's sources (a fee cap from a circular, the rule text from the regulation) | the rule's block under the text; each figure's own sheet keeps its own source | same |
| `sources_missing_reason` set | "הקישור למקור עוד לא צורף לכלל הזה." in the block's place, as today | same plus the reason when it is Hebrew |
| `open` | the blocked callout as today; no source block | same |
| mirror only | the block with "נוסח החוק (עותק)" and "עותק" in the meta | plus string 12 of 4.2 |

---

## 6. Decisions for the founder

1. **"פירוש של האתר" tag** (3.3): a new honesty state for rules whose conclusion the law does not
   state in one sentence. Recommended: yes, as a neutral tag; it is exactly the TXK-04 case he
   named. Alternative: leave it inside `text_he` as today.
2. **The claim mark** (2.3): one glyph at the end of a surprising sentence, opening one rule. The
   alternative that costs nothing in content work is titles on the "כללים:" chips at PC width and
   nothing new on the phone. Recommended: the mark, limited to the dilemmas of the scenario audit.
3. **"העתקת ההפניה"** (2.2 item 8): copies a one-line citation with the URL. Small, and the only
   way the argument leaves the site with its evidence. Recommended: yes.
4. **Dataset links** (2.5): link the data.gov.il landing page, not the API call. Recommended: yes.
5. **Official publications for mirror rules** (2.5 policy 4): a researcher task of some hours for
   ~15 laws and regulations; the UI does not wait for it.
6. **Linking the research notes** when a rule has no resolvable source: the repo is public, so
   `.claude/skills/il-finance/references/<file>.md#<id>` on GitHub could serve as "הערות המחקר
   של האתר". Not recommended as a default (it is the site's own notes, not a third party), but
   acceptable as the empty state's second line until the extraction closes the gap.
7. **`source_age_warning_months`** (3.4): proposed 6, a site judgement in `data/parameters/`.

---

## 7. Build order (a developer's reading)

1. Schema and validator: `sources`, `sources_missing_reason`, `reading` (5.1). No UI change yet;
   the validator warns, does not fail, until the extraction lands.
2. The extraction script and the two hand tables (`publishers.json`, recurring document titles);
   review; commit the 500 records (5.2). Re-run `npm run validate`.
3. `SourceBlock` component (2.2 item 3, 2.5 labels and `#page=`/`#anchor` behaviour), replacing
   the three rows in `ValueSheet`, `RuleCard` and `TermCard`; `copyCitation` button; strings of 4.2.
4. `RuleCard` reorder (2.4) and the strength-label rule of 3.1; `/rules` filter over source fields.
5. Rule entries in the search index and the "כללים" group; result opens the card in the sheet (2.6).
6. `Claim` component and the legend hint; place the first marks in the kupat-gemel guide and the
   other scenario-audit pages (2.3). Content work, one PR per guide.
7. Follow-ups outside UI: Wikisource anchor form (one fetch), gov.il PDF behaviour on Android (one
   phone), official publications for mirror rules (researcher).

Verification for the QA pass (no browser was run for this report): on a 390 px phone, from the
kupat-gemel guide's "בלי מס, גם מעבר לקופת גמל להשקעה אחרת", count the taps to a document that
contains the words "קופת גמל להשקעה אחרת" — the target is two; and on `/rules`, filter
"פקודת מס הכנסה" and count the rules listed — the target is every rule whose sources include the
ordinance.
