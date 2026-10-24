# Fresh eyes on the knowledge layer: what I would actually build

Written 2026-10-24 (night) as an independent, unanchored read of the founder's brief ("make the `data/` directory accessible … intrigued, not overwhelmed … a user can argue with a surprising claim and get a government paper in a tap or two … expand the search"). Grounded in `docs/product.md` (D1–D24, 3.8), `research/discovery/ux-landscape.md`, `docs/copy.md` §10, `site/app/routes/rules.tsx`, `site/app/components/provenance.tsx`, `site/app/lib/search.ts`, `site/app/routes/search-index.ts`, the 500 records in `data/rules/`, the `il-finance` references, and the live site. Nothing here states or verifies a financial rule; rules are named by ID and title only. Read-only except this file.

## Recommendation in one paragraph

Do not build "a page of 500 rules sorted by importance" first. The person the site serves arrives with one dilemma and meets a rule only when the site says something that surprises them; that moment happens on a result page or in a guide sentence, not on a list. So the first thing to build is a better **claim card** behind every rule chip and every number: the claim in one sentence, the law's own words where the rule base already holds them, who published the document (in Hebrew, by a name a friend recognises), where in the document to look, how sure the site is (as a sentence, not a tag), and what on the site leans on it. Today that path breaks for 286 of 500 rules, which carry no source link in their record although the reference files have one, and the chip itself shows only "TXI-03", a code that means nothing to a friend. Second, give every result page a short **"למה"** block: the three to five rules that decided *this* answer, written as sentences, each opening the claim card. Third, reshape the rules page into three layers: a curated front of about twenty **questions people actually ask**, each answered by one rule title and a chip (a site judgement kept as a parameter with a rationale, not an "importance score"); then the topics in the order of the guide, each opening on a one-paragraph brief with its rules ordered by how many places on the site cite them and its plumbing rules folded away; then the full filterable list that exists today. Fourth, add a **documents view**: the forty-odd official documents the 500 rules read from, one card each, which is the honest way to show the research effort without a wall of 500 cards. Fifth, extend search to rule titles and curated question phrasings, ranked last and capped, plus **search by the number you saw** ("25%", "83,641") and by a law section, which is how people actually remember what surprised them. Leave out counts, badges, "rule of the day", myth framing, full-text search over rule bodies, and the forum anecdotes from anything browsable. Most of the work is data, not UI: migrating the sources into the records with Hebrew titles, locators and the quotes the references already hold.

---

## 1. What I found that changes the brief

Before the design, five facts from the repo and the live site that the brief does not account for.

**1.1 The verification path is broken for most rules.** Of the 500 records in `data/rules/`, 214 have `figures` and therefore a `source.url`; 286 have none, and the card shows "הקישור למקור עוד לא צורף לכלל הזה" (`rule.sourceMissing`, audit A26). The sources exist, in `.claude/skills/il-finance/references/*.md` on each rule's "- Source:" line, often with section and page. The founder's own example, "you can switch a kupat gemel track without tax", is TXK-04, a rule without a figure: today its card has no link. The brief's second goal fails on its own example until this is fixed, and no page design fixes it.

**1.2 The names a skeptic sees are hosts, not publishers.** Of 501 figure sources, 120 have a Hebrew-majority title; the rest fall back to the host (`sourceLabel`), so the link reads "he.wikisource.org" or "www.gov.il". The reference files name publisher, document, section and page in English ("deductions booklet, p.10 (2026 tables)"; "Transfer Regulations, reg. 3(א)(11א)"). 113 of the figure sources, and 360 of the reference source lines, point at the Wikisource mirror of legislation; 144 rules are `primary-mirror`. A friend who clicks through to Wikisource, a site anyone can edit, has a fair reason to be less convinced, not more, unless the card says plainly what the copy is and names the official text it mirrors.

**1.3 The chip is a code.** `RuleRef` renders only the ID. In the value sheet, "כללים שנכנסו לחישוב" is a row of codes. The rules the engine leans on (about 170 IDs cited in `packages/engine`) are invisible as sentences until the second tap. For the founder, "TXG-02" is a handle; for his friend it is noise.

**1.4 The rules page opens on the least relevant rule with a missing link.** Topics are sorted alphabetically by Hebrew name, so the first group is "אג״ח ממשלתיות ומק״מ" and the first card is GOV-01 "מק״ם: מי לווה, מי מוכר ומי מנהל", strength "מקור ראשי (עותק)", source "לא צורף". Twenty-three groups, 500 cards all in the HTML (the page text is ~345,000 characters), every group closed. This is a filing cabinet in the researcher's order (`il_finance_file`), and the first impression is the opposite of what the brief asks for.

**1.5 The record is thinner than the research.** The reference entry for a rule has "Rule", "Conditions / exceptions", "Figures", "Source" (with locator and sometimes a verbatim Hebrew quote), "Dimensions", "Likely to change". The JSON record has `text_he`, `strength`, `dimensions`, `figures`. `copy.rule.conditions` ("תנאים וחריגים") exists in `copy.ts` and flows 6.9 promises it as a disclosure, but no record carries conditions, so nothing renders. The quotes, which are the single strongest trust device available, are not in the data at all.

Two smaller observations: the site holds 500 of the 896 rules in the references and about 31 open-question codes ("PEN OQ7") appear in the UI, but only one record has strength `open`; flows 6.14 promises "each group lists its open questions at the end" and the page cannot. And the parameters page already has a "משמש ב:" row built from `loadParameterUses`; rules have no equivalent, though the data to compute it is in the repo.

---

## 2. "Intrigued, not overwhelmed": what it means for a person with one dilemma

The research is blunt: information alone did not change pension behaviour (UX 7, Rubinstein-Levi 2021), half of savers do not understand their report, and trust in the institutions is middling to low (UX 4.1, 4.3). The friend does not come to browse law. He comes with "where do I put 60,000 for three years" and leaves with an answer. The data layer earns its place at exactly two moments:

1. **The moment of surprise.** The site says the deposit's interest is taxed differently from the fund's gain, or that moving a study fund keeps its seniority, and he thinks "wait, really?". He needs the proof *there*, in one tap, in words he can repeat to his father.
2. **The moment of action.** He is on the phone with the bank or the agent (UX 4.5: the hard part is the process). He needs the claim, the document name and the section as a sentence he can read aloud or paste into WhatsApp. The fees page already ships a copy-ready negotiation script; this is the same instinct applied to rules.

Everything else, the curious browse, the pride in the research, is a byproduct that should cost the dilemma-carrier nothing. Concretely:

- **Home page:** the data layer should not become a feature there. The tagline already makes the promise ("להבין חיסכון והשקעה בישראל, עם מקור לכל מספר"); the question card is the job. I would add one quiet text link in the row with "מה האתר עוד לא מכסה": **"על מה האתר נשען: הכללים והמסמכים"**, pointing at the reshaped rules page. Not a fifth door (two of the four doors are still awaiting his review; the doors are for jobs, and "browse the rules" is not a job). If he wants more presence than a link, a single sentence under the doors, with no number in it: "כל מספר באתר נפתח למקור שלו. הקישו על מספר." The legend already says this on content pages; on the home page it is the one promise worth repeating.
- **Result pages** (`goal-compare.tsx`, `idle.tsx`, `fees.tsx`, holdings, the "why" sheet): this is the main stage. Replace or extend the "הכללים שהחישוב נשען עליהם" chip row with a **"למה"** block: three to five sentences, each a rule title (the claim) with its chip, chosen as the rules that *decided* the ranking (the tax at exit of the winner and runner-up, the fee cap that bit, the lock-up that demoted an option). The engine already returns `rulesUsed`; the selection of the deciding few is the method's job (F-80 names the deciding fee type; the same idea for rules). Collapsed under it: "כל הכללים שנכנסו לחישוב ({n})".
- **Guide pages:** already strong (chips, the checklist with "מאיפה זה"). Only the card behind the chip changes.
- **Menu:** keep "מאחורי הקלעים" with "כללים" and "פרמטרים"; add "מסמכים" (section 5) under it. Do not rename pages; the style guide names pages by their titles and churn costs more than it buys.

The test of "not overwhelmed": a person who never opens the menu and never taps a chip should see no more of the data layer than today, except that the chips they do see now carry words.

---

## 3. The claim card: what a skeptical friend needs, and the order he needs it in

This is an upgrade of `RuleCard` (flows 6.9) and of the rule rows inside the value sheet, not a new component family. The content, top to bottom, in the order a skeptic asks his questions:

1. **The claim**, one sentence: `title_he` as it is ("מעבר מסלול והעברה בין קופות גמל להשקעה אינם ממוסים"). The ID after the words, as the style guide already rules ("שאלה פתוחה TXG OQ4" pattern).
2. **The law's own words.** A short verbatim Hebrew quote from the official text, where the reference already holds one (SW-01 holds "ובלבד שהעמית היה זכאי למשוך את הכספים בפטור ממס"; TXG-01 holds the Tax Authority's sentence on the tax year). Marked as a quote with גרשיים, followed by the locator: "פקודת מס הכנסה, סעיף 3(ה4)(3)" or "חוברת הניכויים של רשות המסים, עמוד 10". Never paraphrased, never written from memory: if the reference has no verbatim Hebrew quote, this block is absent and only the locator shows. Several references say "read through a fetch tool; re-read the exact wording before encoding", so the data pass must re-read before quoting.
3. **The explanation**, `text_he`, as today.
4. **"תנאים וחריגים"**, as a disclosure, from the reference's "Conditions / exceptions" line (Hebrew needed). For TXK-04 this is where honesty lives: the reference says the legal text has no single sentence that says "no tax event" and the conclusion rests on the withdrawal wording plus the fund-level exemption, with a manager stating it explicitly. A skeptic who reads that trusts the site more, not less.
5. **The source line.** Publisher in Hebrew by a recognisable name (רשות המסים, בנק ישראל, הכנסת, רשות שוק ההון, הביטוח הלאומי, הבורסה), the document's Hebrew title, the locator, and what the link opens: "PDF, 120 עמודים" or "עמוד באתר". For a `primary-mirror` rule: "נוסח החוק בעותק של ויקיטקסט; הפרסום הרשמי: רשומות, ס״ח 3511" with both links when the second exists in the reference (TXG-02 cites the Knesset PDF as well). The English working title moves to the collapsed line it already has (`sourced.englishTitle`).
6. **How sure the site is**, as a sentence, not only a tag: the `strength.*.line` texts already exist and are good. Add the honest case: "המסקנה נובעת מ…, ואין בחוק משפט אחד שאומר אותה" when the reference says so.
7. **Dates:** "נבדק 22.10.2026", "ייבדק שוב 15.01.2027", and the figure's "בתוקף משנת המס 2026" where relevant (all exist).
8. **"איפה זה משפיע באתר"**: the pages and computations that lean on the rule, computed at build time from the chip references in `site/app`, the engine, `data/instruments`, `data/dimensions`, `data/terms` and `data/parameters` (the parameters page already does this for parameters with `loadParameterUses`). A friend who sees "נכנס לחישוב ההשוואה למטרה ולעמוד העמלות" understands why the rule matters; a rule with no uses is honest about being background.
9. **"להעתיק את זה לשיחה עם הבנק"**: one copy button (section 7).

**Taps.** From a number: tap 1 opens the value sheet, which today lists rule codes. Make the first rule's claim visible there as a sentence with its publisher, so publisher and claim are at tap 1 and the document is at tap 2. From a sentence in a guide: tap 1 the chip opens the card with claim, quote and publisher; tap 2 the document. The brief asked for "a tap or two": two is the ceiling, and the publisher's name must never be behind the second.

**What the card must never do:** show a code without words; show a host name as the source; call a mirror "the law" without saying it is a copy; show a lock without saying what is unknown and what waits for it (flows 6.9 already requires this); mix a parameter into the rule list (the tie threshold is a judgement, the page says so, keep it that way); claim a quote it has not re-read; open a PDF in place on a phone (external link, new tab, as today); or let the chip inside a dense table grow (titles in sheets and "למה" blocks, codes in tables, which is also what design review C1 was protecting).

---

## 4. The browsable page: three layers, not one sort

The founder's instinct, "the 25% rule first", is right about *what* people recognise and wrong about the *shape*. A single importance ordering of 500 rules is unreadable past item twenty, and importance is personal: the person saving for a child needs CS-06, nobody else does. There is also no usage data to sort by (no server, D1). So "importance" has to be a judgement, and judgements on this site live in `data/parameters/` with a rationale and a sign-off. That is not a workaround; it is the site's own rule, and it makes the curation visible and arguable like everything else.

**Layer 1: "שאלות שאנשים שואלים" (about twenty, curated).** Each item is a question in the words people use, answered by one rule title, with the chip: "האם מעבר מסלול בקופת גמל להשקעה הוא אירוע מס? → מעבר מסלול והעברה בין קופות גמל להשקעה אינם ממוסים · TXK-04". Grouped by the three jobs the research found (UX 3.1 inferred): "איפה הכסף צריך לגור", "האם אני משלם יותר מדי, ואיך עוברים", "האם אני מסודר". Selection criteria, written in the parameter's rationale: (a) the rule decides a comparison outcome on the site; (b) it is commonly surprising, with the surprise sourced where possible (the founder's own tax claim was wrong, product.md 3.8; BGU 2019: 23% thought pension funds are state-owned, 60% thought withdrawing severance does not affect the savings, 29% thought deposits carry no fee, UX 4.1–4.2); (c) it has a primary source with a working link. Rules that fail (c) do not get featured until the data pass fixes them, which is a healthy pressure. The file: `data/parameters/featured-rules.json`, rationale in `docs/parameters-rationale.md`, founder sign-off date, shown with the parameter tag so nobody mistakes the curation for law. The ux-landscape question catalogue (Q1–Q14) is the vocabulary to draw the question phrasings from, and those phrasings double as search aliases (section 6).

**Layer 2: topics in the guide's order, each opening on a brief.** Replace the alphabetical order with the order of the guide index: the wrappers a person meets first (עובר ושב ופיקדונות, קרנות כספיות, קופת גמל להשקעה, קרן השתלמות, פנסיה, חשבון השקעות, קרנות סל, חיסכון לכל ילד, ניהול אישי, אג״ח ממשלתיות), then the cross-cutting topics (מס: כללי, מעבר והעברות, מי מפקח ומה מוגן, כללים משותפים לקופות הגמל), then the plumbing (מסלולים והקטלוג, שמות מוצרים בכל בנק, the report-format rules). Each topic opens on a one-paragraph Hebrew brief (the references each have a "Summary" of at most ten lines, in English today) and then its rules ordered by **use count** (how many places on the site cite them, the same build-time count as the card's "איפה זה משפיע"), so the load-bearing rules come first without anyone hand-ranking them. Within a topic, fold away under a sub-heading "כללים טכניים" the rules whose use count is zero, the catalogue and name-decoding rules, and the report-format rules; and label the four forum anecdotes (SW-X01 to SW-X04, `secondary`) as "סיפור של אדם אחד" at the end of the switching topic, or drop them from the page (section 8). Each topic ends with its **blocking open questions**: the ~31 OQ codes the UI already shows next to locks, as records with "מה עוד לא ידוע" and "מה מחכה לתשובה" (flows 6.9 and 6.14 promised exactly this; the data does not have it, section 9). Not the 510 open questions of the knowledge base: only the ones that block a number on the site.

**Layer 3: the complete list and the filter**, as today, reached by scrolling or by the filter field, with the address `?q=` so search can hand off to it.

One structural change for the page: the 500 cards are all in the HTML today (user audit, "not done": lazy rendering). Layer 1 and the briefs must paint first; the cards can hydrate per topic.

Why not "myths vs the rule"? Three reasons. The site can source what people believe only in three or four cases (BGU 2019); everything else would be the founder's impression of what people think, which is exactly the "from memory" the standing rules forbid, just about readers instead of law. The framing invites the TV-adviser register the style guide bans (§10.1, §10.7: facts in clean standard Hebrew, no winks). And a myth list talks down to the reader; a question list meets him where he is. Where a misconception is sourced, the question item carries one line, "למה השאלה הזאת כאן: במחקר של רשות שוק ההון מ־2019, …", with the study as its source. Same evidence, honest frame.

Why not "questions first and nothing else"? Because the founder's point about the numbering stands: once a friend has met TXK-04 twice, the code is the fastest handle, and the complete list is where the site proves it hides nothing. Layer 3 stays.

---

## 5. The documents view: the shape that fits "intrigued, not overwhelmed"

The brief says the research effort "would be a shame to keep hidden". The honest unit of that effort is not 500 rules; it is the forty-odd official documents they were read from: the Income Tax Ordinance, the deductions booklet, the Transfer Regulations, the management-fee regulations, the CMA circular on transfers, the Banking Rules on fees, the National Insurance Law chapter on child savings, the bank tariffs, the fund bylaws. Once sources live in the records (section 9), this view is a group-by on URL at build time.

**Page "מסמכים" (under מאחורי הקלעים), one card per document:** Hebrew title, publisher, kind (חוק, תקנות, חוזר, חוברת, תעריפון, תקנון), what it governs in one line, the rules that read from it as chips with titles, the date last checked, the link. Sorted by publisher, official sources first, then institutions, then secondary. Forty cards a friend can scroll in a minute; the message "this site rests on these documents" lands without a single count or boast. It also gives the founder a maintenance view he does not have today: when the 2027 deductions booklet appears, the card lists every rule that must be re-read.

The tariff snapshots in `data/fees/`, the deposit terms in `data/terms/deposits/`, the fund records in `data/funds/` and the series in `data/series/` already have their own pages (providers, idle cash, fund variants, the past-record line); they should appear in this view as documents too ("תעריפון בנק לאומי, 23.10.2026, 14 ערכים באתר"), linking to the page that uses them, not as a second copy of the data.

---

## 6. Search

Today's index holds products, tracks, companies, terms, guide pages, banks and the not-covered list; nothing from `data/rules/`, `data/parameters/` or `data/dimensions/`. Extending it is right, with four guards against noise:

- **Match rules on titles and curated aliases, not bodies.** `title_he` plus the question phrasings of layer 1 and, where a topic adds them, `aliases_he`. Full-text over `text_he` would make "מס" match 300 rules and bury the guide page, which is what a person typing "קרן השתלמות" actually wants.
- **Rank last, cap at three.** A new `kind: "rule"` after `track` in `kindRank`; group title "כללים"; three rows; "הצגת כל הכללים שמתאימים" hands off to `/rules?q=`. The row line names the topic and the publisher: "מס: קופת גמל להשקעה · רשות המסים".
- **Search by the number you saw.** People remember "25%" from the statement and "83,641" from the ad, not the rule's name. Index each figure's value with its unit as an `ids`-style key, so "25%" lists the rules whose figure is 25 percent and "83,641" finds the ceiling rule. This is the cheapest feature in this report and the one most likely to make a friend say "oh". It needs no new data.
- **Search by law section.** "סעיף 125ג" or "3(ה4)" finds the rules whose locator cites it, once locators are in the records. Rare, but it is the professional friend's way in, and it costs nothing after the data pass.

Also index parameters by their Hebrew name ("סף תיקו" → `/parameters#tie-threshold`), dimensions by name and `one_line` ("מס במעבר" → the dimension's rules via the checklist), and documents by title ("חוברת הניכויים" → the document card). Not the open questions as free text; the lock they block is the way in.

---

## 7. Two ideas nobody asked for

**7.1 "להעתיק לשיחה עם הבנק".** On every claim card, one copy button that writes a paragraph in the first person (the style guide's only place for "אני"): the claim, the document's Hebrew title and locator, the link, and "נבדק ב־{date}". The playbook and the fees page already have copy-ready text for the institution; this extends the pattern to any rule. It converts verification into ammunition at the moment the research says people get hurt (agents, retention calls, offers withdrawn: UX 4.5). Nothing is sent anywhere (D1); the person pastes it where he likes. If the founder wants one feature from this report to make a friend feel the site is on his side, it is this one.

**7.2 Build-time "uses of rules" and the load-bearing tag.** Compute, for every rule, where the site cites it (pages, engine formulas via `docs/method.md`, dimensions, terms, parameters), as `loadParameterUses` already does for parameters. Use it three times: the "איפה זה משפיע באתר" row on the card; the default order inside a topic; and a small tag "נכנס לחישובים" on the roughly 170 rules the engine reads versus the rest. For a skeptic this is the difference between "the site quotes a lot of law" and "these are the rules that moved my number". It also shows the founder, for free, which of his 500 rules do no work on the site yet.

A third, smaller one: when the person has a saved goal or holdings on the device, the layer-1 questions can be ordered with their wrapper's questions first (a child saver sees the child-savings questions first). Local state only, no new data, the same mechanism the guide uses to highlight by age and employment.

---

## 8. What I would not build

- **Counts and boasts.** No "500 כללים, 40 מסמכים" on the home page or the rules page header; the style guide bans the TV-adviser register and a count is one. The documents view shows the effort without saying a number.
- **"Rule of the day", rotating facts, badges, a trust score, streaks.** Gimmicks on a site whose whole stance is "a number and where it comes from".
- **A myth section** (section 4): the site cannot source most beliefs, and the frame talks down.
- **Full-text search over rule bodies**: noise that buries the pages people want.
- **A single flat "sorted by importance" list of 500**: unreadable past twenty, and the sort would be an unsourced judgement pretending to be data. The featured list is the honest version of this idea.
- **The forum anecdotes as rules.** SW-X01 to SW-X04 are one person's stories, marked `secondary`, dimensions empty. Keep them where they already serve (the playbook's "experience" cards, labelled), out of the featured layer and out of search; on the rules page either label them "סיפור של אדם אחד" at the end of the switching topic or drop them.
- **Rules without a link in the featured layer.** Featuring a claim whose card ends in "הקישור עוד לא צורף" would teach the friend that the promise is hollow.
- **A change log or a news feed** (D24 says no; N7 is parked).
- **A per-rule share to social**, comments, ratings, "was this helpful". No server, no audience beyond friends, nothing to learn from it.
- **Showing all 510 open questions.** Only the ones that block a number on the site.
- **Anything that requires reading the law to use the site.** The quote and the link are for the person who asks; the explanation in `text_he` stays the default.

---

## 9. The data work this needs (flagged as data tasks, not design)

The design above is mostly blocked on the record, not the UI. In order of leverage:

1. **Migrate the "- Source:" lines of the 286 link-less rules into their records.** A script can parse title, URL, locator, checked date and strength from the reference files; the schema needs a top-level `sources[]` on the rule record (today a source exists only inside each figure). Titles in those lines are English working titles.
2. **Hebrew `title_he` and `publisher_he` on every source**, and a `locator_he` ("סעיף 125ג(ב)", "עמוד 10, טבלה א"). The user audit's "not done" list already names `title_he` and `publisher_he`. About 380 of 501 figure sources need a Hebrew title; most are a few dozen distinct documents, so the work is per document, not per rule.
3. **`quote_he`** only where the reference already holds a verbatim Hebrew quote and the document has been re-read (several references say the fetch tool paraphrased). Never composed.
4. **`conditions_he`** from the reference's "Conditions / exceptions" line, so the "תנאים וחריגים" disclosure the copy and flows already name can render.
5. **For `primary-mirror` rules, a second source where the reference has one** (the Knesset or Reshumot PDF beside the Wikisource page), so the card can say "עותק" and point at the official text in the same breath.
6. **Open-question records** for the ~31 OQ codes the UI shows, with "מה עוד לא ידוע", "מה מחכה לתשובה", what was tried.
7. **Hebrew briefs** per topic from the references' summaries (23 paragraphs).
8. **`data/parameters/featured-rules.json`** with rationale and sign-off.

Items 1, 2 and 5 are the ones that make the founder's own example (TXK-04) work. Everything in sections 3 to 6 degrades gracefully without the rest: a card without a quote shows the locator; a rule without Hebrew publisher shows the host, as today.

One side observation from the live fetch, outside this brief: the text of the kupat gemel lehashkaa guide page came back with several sections (fees, tax, the checklist, both glossaries) duplicated. It may be the phone and PC variants both being in the HTML, which is harmless to a reader, but it is worth one look since it doubles the page weight.

---

## 10. Decisions only the founder can take

1. **The featured layer is a judgement with his signature.** Does he accept the three criteria in section 4 (decides a result on the site; commonly surprising, sourced where possible; has a working primary link), and does he want to pick the twenty himself or sign a list Claude proposes? Memory says he prefers to answer only his own choices; this one is his, because it is the site's voice about what matters.
2. **Open questions on the site: the ~31 that block numbers, or none.** Showing them is the strongest honesty device available and the flows promised it; it is also work (item 6) and makes the site's gaps visible to friends.
3. **The Wikisource question.** Accept `primary-mirror` with the plain sentence it has, or spend a data pass pairing each mirror with the official publication (item 5). Both are defensible; the second is what a professional friend would expect for tax rules.
4. **The forum anecdotes** (SW-X01 to SW-X04): keep them on the rules page labelled as stories, or confine them to the playbook.
5. **Home page presence:** a text link beside "מה האתר עוד לא מכסה" (my recommendation), one sentence under the doors, or nothing. Not a fifth door while two doors await his review.
6. **The "copy to the bank" button** on claim cards: in or out. Nothing leaves the device (D1); the question is whether he wants the site handing people words to argue with.
7. **The documents view as a page** under מאחורי הקלעים, or only as the grouping inside the rules page.
8. **Search by number and by section**: in scope for the search, or a curiosity to skip. Both are cheap; the number search needs no new data.
9. **The data pass itself** (section 9, items 1–5): a few hours by script plus per-document hand work for Hebrew titles and locators, and re-reading before any quote. Without it, the brief's second goal cannot be met for most rules, whatever the UI does.
