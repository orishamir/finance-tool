# Knowledge layer: the lead's synthesis and build spec (2026-10-24, night)

Six specialists reported (see `README.md`): fresh eyes (`2026-10-24-fresh-eyes.md`), information architecture with a signals file (`2026-10-24-information-architecture.md`, `2026-10-24-rule-signals.csv`), verification UX (`2026-10-24-verification-ux.md`), search (`2026-10-24-search.md`), risks (`2026-10-24-risks.md`), the Israeli user lens (`2026-10-24-user-lens.md`), plus the lead's own notes (`2026-10-24-lead-notes.md`). This file is what gets built, who builds it, and what waits for the founder.

## 1. Where the reports agree, and what the lead decided

1. **The founder's second goal fails today on his own example.** 286 of 500 rule records carry no source link (only figure-bearing rules do); the card says "הקישור למקור עוד לא צורף". TXK-04 (track switch is not a tax event) is one of them. Every one of the 500 has its sources on the rule base's `- Source:` line, parseable by script (1,093 entries; 78 hosts). **Decision: the data pass comes first and the UI is built on it.**
2. **The source goes first on the card and in the sheet**, as one block: "{publisher} · {document}, {locator}" as the link, the quoted words when the record has them, then "נבדק {date}" with a strength word only when the source is weaker than the law. Mirrors (Wikisource, Nevo) are labelled "נוסח החוק (עותק)" and the Wikisource link opens the readable page at the section (anchors of the form `סעיף_3.ה4` exist), never the raw wikitext URL the research used. An official document, when the rule has one, comes before the mirror.
3. **"Importance" is a judgement, so it lives in a parameter** (P-09 `pinned-rules`, provisional, for the founder's sign-off): twelve pinned rows at the top of the rules page, phrased as the question people ask. The data-driven score (engine use, site use, collection references, figure, tier, strength) orders rules inside groups and picks the teasers, never the headline list. The 25% rule is row 1 because it is the most known, not because the formula says so (it ranks 13th).
4. **Grouping: five shelves by the reader's question, not 29 researcher files.** "מה המדינה לוקחת", "מה הבנק או בית ההשקעות לוקחים", "מה אפשר לעשות עם הכסף", "מי מפקח ומה מוגן", "איך המוצר בנוי". Derived from each rule's first dimension with per-file defaults and the IA report's explicit moves; no new field on any rule. Inside a shelf the topic (file) stays as a sub-group with a reader's name (no "מס:" prefix), ordered by score. Each shelf is its own page: the rules page today is 2.5 MB of HTML, the heaviest page on a weak signal.
5. **A documents page** is the honest way to show the research effort: the forty-odd official documents the rules read from, one card each with the rules that rest on it; the data records (tariffs, funds, deposit terms, series) as cards pointing at the pages that use them. No counts on the home page, no "500 rules" boasts.
6. **Search** covers rules (title, id, question aliases, figures as numbers), parameters and documents; rules rank after guide pages and terms except on an exact id, an exact figure with its unit, or a question-form query; rule texts go to a second file fetched after the index so "מס" does not bury the guide page. Empty states are by query type.
7. **Intrigue without marketing:** a "שווה לדעת" block on each guide page (two or three rules from the pinned parameter's per-wrapper lists, each the record's own title with its chip and its figure), and on the rules front a "מה עומד להשתנות" list from the 241 recheck dates the data already holds. No "rule of the day", no myth framing, no badges. The one-line test from the user lens: a fact changes a decision now and reaches the law or the regulator in one tap, or it is spam.
8. **Guards from the red team adopted:** `derived_from` chips on derivation rules; the tax year and update rule shown on every figure; English `title`, `notes`, `missing_reason` never rendered; the four forum "experience" entries kept out of the main flow and labelled; validator warnings on a passed recheck date and a figure behind the tax year; per-shelf pages instead of per-rule pages; no cross-provider tariff table and no automated link checks against TASE, ISA or Bank of Israel hosts.
9. **Parked (founder decisions, section 5):** conditions in Hebrew on every rule, official publications beside the 144 mirror rules, open-question records on the page, records for the 360 skill-only rules, claim marks inside guide prose, the "פירוש של האתר" tag, a home-page door, tariff and ISA-directive quoting under D22.

## 2. Product decision recorded

D25 (2026-10-24) in `docs/product.md` section 1: the rule base and the documents behind it are a user-facing capability (browsable, verifiable, searchable), with the pinned list as site parameter P-09. Capability 3.8 "Out, for the reader" is amended accordingly.

## 3. Build spec

### 3.1 Workstreams, owners and files

One owner per file. Cross-file needs go to `research/knowledge/requests.md` (append-only; the lead applies them). Nobody runs `npm run build` except the lead; `npm run typecheck`, `npx vitest run <own test files>` and `npm run validate` are free. Coding agents run on Sonnet; Hebrew on Fable.

| WS | Owner | Files owned | Depends on |
|---|---|---|---|
| W1 data | extraction agent | `packages/schema/src/collections/rules.ts`, `packages/pipeline/src/validate.ts`, `packages/pipeline/src/references.ts`, `packages/pipeline/scripts/extract-sources.ts`, `packages/pipeline/test/extract-sources.test.ts`, `data/rules/*.json` (writes `sources`, `derived_from`), `data/sources/publishers.json` and `data/sources/documents.json` (structure and English/host columns), `docs/data-schema.md` §3.1 and §4 | the Hebrew columns of the two tables from W-He |
| W2 provenance | provenance agent | `site/app/components/provenance.tsx`, `site/app/lib/source-label.ts`, new `site/app/lib/sources.ts` (+ test), `site/app/theme.css` only if a new class is needed | schema shape (fixed below) |
| W3 rules pages | rules agent | `site/app/routes/rules.tsx`, `site/app/routes/rules-shelf.tsx`, `site/app/lib/rule-shelves.ts` (lead wrote the skeleton), new `site/app/lib/rule-uses.server.ts` (+ test), `site/app/routes/home.tsx` (one link line), `site/app/components/shell.tsx` (menu and footer entries), `site/app/lib/data.server.ts` (a `loadPinnedRules` reader) | P-09 record (lead wrote it) |
| W4 documents | documents agent | `site/app/routes/documents.tsx`, new `site/app/lib/documents.server.ts` (+ test) | W1's `sources` in the records (develop against the schema; real data lands mid-way) |
| W5 search | search agent | `site/app/lib/search.ts`, `site/app/lib/search.test.ts`, `site/app/routes/search-index.ts`, `site/app/routes/search-texts.ts`, `site/app/components/search.tsx`, new `site/app/lib/search-aliases.ts` | `shelfOf` from `rule-shelves.ts` |
| W6 guide block | guide agent | `site/app/routes/guide.tsx`, new `site/app/components/guide/worth-knowing.tsx` | P-09 `guide_blocks` |
| W-He Hebrew | Hebrew editor (Fable) | Hebrew columns of `data/sources/publishers.json` and `documents.json`; `site/app/copy.ts` (values only; keys are fixed); `docs/copy.md` new section; the question phrasings in `data/parameters/pinned-rules.json` (`question_he` only) | W1's skeleton tables |
| W-Docs | docs agent | `docs/flows.md`, `docs/architecture.md` 3.5, `docs/design-system.md`, `docs/data-inventory.md`, `docs/roadmap.md` (after release 5), `docs/method.md` §2.3 (P-09 row), `docs/parameters-rationale.md` (P-09), `CLAUDE.md` status paragraph | this spec |
| lead | | `docs/product.md` D25, `data/parameters/pinned-rules.json`, `site/app/copy.ts` first write, route stubs, `site/app/routes.ts`, the final check, smoke, commit | |

### 3.2 W1: sources in every rule record

Schema (`ruleRecord`), all optional so the validator can warn before the extraction lands, then required by the validator once it has:

```ts
sources: z.array(z.object({
  url: z.string().url(),
  title: z.string().min(1),               // as the markdown wrote it (English working title allowed)
  title_he: z.string().min(1).optional(), // the document's Hebrew name (from documents.json or a Hebrew markdown title)
  publisher: z.string().min(1),           // English, from publishers.json by host (fallback: the host)
  publisher_he: z.string().min(1).optional(),
  kind: z.enum(["law","regulation","circular","regulator_page","official_pdf","exchange_rules","institution_doc","article","dataset","form","other"]),
  strength,                               // primary | primary-mirror | institution | secondary (the value.ts vocabulary)
  mirror_host: z.enum(["wikisource","nevo"]).optional(),
  locator: z.string().optional(),         // raw, as written: "s. 3(ה4)(3)", "reg. 2(א)(7)", "pp. 27–30"
  locator_he: z.string().optional(),      // "סעיף 3(ה4)(3)", "תקנה 2(א)(7)", "עמודים 27 עד 30"
  page: z.number().int().positive().optional(),   // first page, for "#page=" on a PDF link
  anchor: z.string().optional(),          // Wikisource section id without "#", e.g. "סעיף_3.ה4"
  quote: z.string().optional(),           // the document's own words, verbatim, Hebrew, ≤ 240 chars, only when the markdown holds them inside quotes
  checked: isoDate,
  qualifier: z.string().optional(),       // "(historical)", "(unofficial consolidation)" etc.
  note: z.string().optional(),            // English working note; never shown
})).optional(),
sources_missing_reason: z.string().optional(),
derived_from: z.array(z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/)).optional(),
```

Hand tables (`data/sources/`): `publishers.json` = `{ "<host>": { "publisher": "...", "publisher_he": "...", "kind": "...", "mirror": "wikisource"|"nevo"|null } }` for every host seen (78); `documents.json` = `[{ "id": "income-tax-ordinance", "match": ["Income Tax Ordinance", "פקודת מס הכנסה", "Ordinance (Wikisource mirror)"], "title_he": "פקודת מס הכנסה", "publisher_he": "רשות המסים", "kind": "law", "official_url": null }]` for the recurring documents (the script lists the title tokens by frequency; W-He names them).

Extraction (`extract-sources.ts`, re-runnable, writes the records in place, never touches the markdown): split at `### <ID>`; take the `- Source:` line plus continuation lines; resolve `[t][ref]` through the file's `[ref]: url` table; parse markdown links with balanced parentheses (titles may contain `]`-free brackets; URLs contain `(…)`); segment per link; strength from the segment's "· <word> (qualifier)" (mirror/copy/third-party host/unofficial → `primary-mirror`), falling back to the line's trailer, then the rule's strength; `checked` from the segment, then the line's last date, then the rule's; locator = text after the link up to the first "·", trimmed, with `locator_he` by table (`s.`/`ss.` → סעיף/סעיפים, `reg.`/`regs.` → תקנה/תקנות, `p.` → עמוד, `pp. a–b` → עמודים a עד b, `clause` → סעיף, Hebrew words kept); `page` from the first `p.`/`pp.` number when the URL ends in `.pdf` or contains `BlobFolder`; Wikisource: rewrite `index.php?title=T&action=raw` to `https://he.wikisource.org/wiki/T` and build `anchor` from a section locator (`s.3(ה4)(3)` → `סעיף_3.ה4`; `s.125C(b)` → `סעיף_125ג`; Latin letters a–e map to א–ה); quote = a `"…"`/`״…״` span inside the segment that is mostly Hebrew and 8–240 chars; `derived_from` from "pointers to X, Y", "as X, Y, Z", "see X" and bare ids on the Source line other than the rule's own; sort sources by preference (regulator or ministry document → Knesset gazette → Wikisource → Nevo → institution → article), then locator present, then newer checked. A rule whose line yields no URL gets `sources_missing_reason` with the raw text. A report at the end: per file counts, unresolved, with locator, with quote, with Hebrew title, with Hebrew publisher; the records whose first source lacks `publisher_he`.

Validator (fail unless marked warn): every rule has `sources` or `sources_missing_reason` (warn until the extraction is committed, then fail); hosts `he.wikisource.org`/`nevo.co.il` are never `primary` (fail); `mirror_host` set iff `primary-mirror` (fail); `page` only on PDF URLs, `anchor` only on HTML (fail); rule `strength` equals the strongest source strength, open rules excepted (warn: 117 titles already drift, strengths may too; report); every `sources[].url` appears verbatim in the markdown block or is a rewrite of a `action=raw` URL that does (fail); the markdown's latest checked date is not later than the record's (warn); `recheck_date` before today (warn); a figure's `tax_year` behind today's year with no successor (warn); `derived_from` ids exist (fail); P-09 ids exist and each row's first id has at least one `primary` or `primary-mirror` source (fail).

Tests: fixtures of six representative Source lines (inline, reference-style, several sources with per-segment strength, a raw Wikisource URL with a section, a pointers-only line, a quoted phrase).

### 3.3 W2: the source block, the card, the sheet

`SourceBlock({ source, strong })` renders: line 1 the link (`{publisher_he ?? publisher} · {title_he ?? title}` and `, {locator_he ?? locator}` when present; a mirror shows `{title_he} · נוסח החוק (עותק), {host_he}` with host words ויקיטקסט / אתר נבו; `href` = url + `#page=N` for a PDF with `page`, url + `#anchor` for an anchor; `target=_blank rel=noopener noreferrer`; a small `PDF` tag before the external icon when the target is a PDF); line 2 the quote in ״…״ (`text-sm text-muted-foreground`, clamped to three lines) when present; line 3 `נבדק {date}` and, only when strength is not `primary`, ` · {strength word}` (עותק / לפי החברה / מקור משני); when the rule is `likely_to_change`, or `recheck_date` has passed, or `checked` is older than six months (a constant for now, flagged for P-10), the meta line is `source.mayHaveChanged`. A second and further source sit behind a `Disclosure` "עוד מקור אחד" / "עוד {n} מקורות" in the sheet and are all shown on the rules pages (`inline` card).

`RuleCard` order: heading (as today); `StrengthLabel` only for open, institution, secondary (primary and mirror say nothing in the header); `text_he`; `derived_from` chips with the lead "נגזר מ־" when present; the source block(s), or `rule.sourceMissing` in their place; the figures table, each figure row now followed by `לשנת המס {year}` when the figure has `tax_year` and the update rule in Hebrew (`copy.updateRules`); the meta `dl` shortened to `נבדק`, `ייבדק שוב`, and for `likely_to_change: no` the line `rule.stable`; `נוגע ל` tags; the `uses` row (`rule.usesLead`, page links and "מנוע החישוב") when `data.ruleUses?.[id]` is present; `לכל הכללים` goes to `/rules/{shelf}#{id}` via `shelfOf`; the `העתקת ההפניה` quiet button copies `{title_he} — {publisher_he}, {title_he of doc}, {locator_he}. {url} (נבדק {date})`.

`ValueSheet` (sourced state): the three rows `מקור`, `פורסם על ידי`, `נבדק` become one `SourceBlock` built from the figure's own `source` (its `title`, `publisher`, `url`, strength, `checked`), placed right under the figure's name; the English title stays behind the existing disclosure only when the shown title is not Hebrew. Computed state: under each rule chip in "כללים שנכנסו לחישוב", the rule's first source as a one-line link (`text-xs`) when the rule record is in `data.rules`.

`ProvenanceData` gains `ruleUses?: Record<string, RuleUse[]>` where `RuleUse = { href: string; label: string }` (W3 fills it on the rules pages only). Export `useOpen` (the lead did) so other components can open a rule in the sheet.

### 3.4 W3: the rules front and the shelf pages

Routes: `/rules` (front) and `/rules/:shelf` with shelf ∈ `state | costs | access | protection | structure` (`site/app/lib/rule-shelves.ts`: names, slugs, dimension map, file defaults, explicit overrides, `shelfOf(rule)`, sub-group names per file). Loader of the front: the pinned rows (P-09 + the rule records they name), the five shelves with counts and three teaser titles each (top by score), the "מה עומד להשתנות" groups (rules with `recheck_date`, by month, next two months open), the by-number index (prefix → count → link to the shelf page filtered by prefix), and a light list of all rules `{id, title_he, shelf, strength}` for the front's filter field (client-side, rows link to `/rules/{shelf}#{id}`). Loader of a shelf page: the shelf's rules grouped by sub-group (file), ordered by score, each card full (`RuleCard inline`); product chips (from the wrapper records' `rule_ids` plus the file's wrapper) filter the groups; the four `SW-X` entries render only in `access`, last, under the heading `rulesShelf.experience` with the tag `ניסיון של אדם אחד`; the filter field as today (id, title, text, and the sources' publisher and title); `#ID` opens its group and scrolls as today. The front handles a hash that is a rule id by replacing the address with `/rules/{shelf}#{id}` (every existing `/rules#ID` link keeps working). The legend stays on both.

`rule-uses.server.ts`: for every rule id, `uses` = pages that cite it (scan `site/app/content/**`, `routes/**`, `components/**` for the quoted id; map a file to a page href and Hebrew label by a small table; a component directory maps to the page that renders it), `engine` = true when `packages/engine/src/**` mentions it, `collections` = which data collections reference it (wrappers → the guide page link, exposures, dimensions, terms, parameters, funds, fees, deposit terms); `score` = 3 × engine files + site files + collection references + (figures ? 2 : 0) + (tier-1 topic ? 1 : 0) + (strength primary 1, mirror 1, institution 0, secondary 0) + (likely_to_change ? 1 : 0). Cached per build.

Home page: one line under the doors, `home.knowledge.line` + link `home.knowledge.link` to `/rules`. Menu "מאחורי הקלעים": `כללים`, `מסמכים`, `פרמטרים`, … Footer: add `מסמכים` after `כללים`.

### 3.5 W4: the documents page

`/documents`: group every `sources[]` entry of every rule (and every figure `source` whose URL is not already covered) by document key: a `documents.json` id when the URL or title matches its `match` tokens, else the URL without fragment and query. Card: `title_he ?? title`, `publisher_he ?? publisher`, the kind word (`documents.kinds`), the link (official first), the rules that rest on it as chips with their `title_he` (first six, "עוד {n}"), `נבדק` (latest), the strength word when not primary. Sections in order: `חוקים ותקנות`, `רשויות ומפקחים`, `הבורסה`, `מסמכים של בנקים וחברות`, `כתבות ומקורות משניים`; inside a section, by number of rules. A second part `נתונים שהאתר קרא`: tariffs (one card per provider: name, snapshot date or "ללא תאריך מודפס", lines count, link to the page that uses it), fund records (12, the fund's name, manager, link to its variants page; lede says "קרנות שהאתר קרא אחת־אחת מהדוח של מנהל הקרן", never "the funds on TASE"), deposit terms (3), series (2, the newest observation only, with the CBS attribution line printed verbatim where the record carries one), the two regulator datasets (link to `/companies`). No counts in the lede.

### 3.6 W5: search

Per `2026-10-24-search.md` with this scope: kinds `rule`, `parameter`, `document` added now (tariff and fund extras parked). Two files: `search-index.json` (today's entries + light rule entries: `title_he`, id, `figs` as `{n, unit}` numbers from `figures` only, figure names, topic line, `href: /rules/{shelf}#{id}`; parameters by Hebrew name and id → `/parameters#{P-xx}`; documents by `title_he`/`title` → `/documents#{key}`) and `search-texts.json` (rule `text_he`, term meanings, parameter `rationale_he`), fetched after the index and used only to re-rank or to answer a question-form query. `normalize` extended (quotes deleted inside words, maqaf, prefixes on the query side, light suffix stemmer floor 3); question words stripped; the alias table (`search-aliases.ts`, the 52 rows of the report, the flagged colloquial rows marked for W-He's confirmation); number matching only over figure values with unit marks (`25%`, `83,641 ₪`, bare integers ≤ 100 as percent, > 100 exact), never over dates or `tax_year`; `kindRank` guide, term, rule, parameter, document, notcovered, company, product, bank, track; a rule outranks everything on an exact id (`TXG-02`, `txg 2`), an exact figure with unit, or a question form; inside the rules group: score from `rule-uses` when the index carries it, else strength → title length → id. Group labels and row lines from `copy.search` (`כללים`, `פרמטרים`, `מסמכים`; row line `{topic} · {strength word if weak} · {id}`). Empty states by query type as designed (name: today's; question: `search.empty.question*` with up to three "אולי התכוונתם" rows; number: `search.empty.number*` with "קרוב לזה" rows within ±2 %). Tests: the report's queries 1–19 plus the negatives (`2026` → no rule; `הלוואה` → nothing; `25` → tracks first, then the 25 % rules). The `highlight()` helper must survive deleted characters (map by normalised index or skip highlighting when lengths differ).

### 3.7 W6: "שווה לדעת" on guide pages

A block after "למה משתמשים בזה" on each wrapper guide page: heading `guideWorth.title`, two or three rows from P-09 `guide_blocks[wrapper]`, each the rule's `title_he`, its first figure as a `Num` when it has one, the chip; the weak-strength tag when the rule is institution or secondary; the row opens the rule card (chip). A wrapper with no entry shows nothing. The rules line of the page is unchanged.

### 3.8 Hebrew (W-He) and docs (W-Docs)

W-He: fill `publisher_he` for the 78 hosts and `title_he` for the recurring documents (official Hebrew names as the documents call themselves; a bank or manager by its Hebrew trading name; never a translation of a law name that has an official Hebrew name); review every new string in `copy.ts` (keys fixed, values editable) against `docs/copy.md` §10; write the new `docs/copy.md` section listing the strings; polish the twelve `question_he` phrasings in P-09 (spoken, no numbers in them, no "ידעתם?").

W-Docs: flows 6.9 (card order), 6.14 (front and shelves), new 6.16 documents page, 6.3 search groups; architecture 3.5 (two index files, the documents and shelves at build); design-system (SourceBlock, pinned row, shelf card, document card, worth-knowing block); data-inventory (sources field, `data/sources/`, P-09); roadmap "After release 5"; method §2.3 P-09 row; parameters-rationale P-09; CLAUDE.md status paragraph (two sentences).

## 4. Acceptance (the lead's smoke, Pages-like server, phone and PC)

1. From the kupat gemel guide, the "שווה לדעת" row for TXK-04: tap the chip → the card shows the source block first; tap the link → the Wikisource page opens at the section (`#סעיף_…`) or the gov.il PDF at its page. Two taps.
2. `/rules`: pinned twelve on one phone screen; five shelf cards; "מה עומד להשתנות"; the by-number index; the filter finds "TXG-02" and "מעבר מסלול"; `/rules#TXK-04` lands on the access shelf page with the card open.
3. `/rules/state`: sub-groups with reader names, cards ordered by score, the primary cards without a strength label, a mirror card with "נוסח החוק (עותק)".
4. `/documents`: the Income Tax Ordinance card lists its rules; a bank tariff card links to the provider page; the CBS card prints the attribution line.
5. Search: `TXG-02`, `מעבר מסלול`, `25%`, `83,641`, `סף תיקו`, `פקודת מס הכנסה`, `האם אפשר להחליף מסלול בלי מס` behave per the test table; `קרן השתלמות` still puts the guide first.
6. No English `title`, `notes` or `missing_reason` visible anywhere on the new pages; no `undefined`/`NaN`; no sideways scroll at 390 px.
7. `npm run check` exit 0; the validator's report lists zero rules without sources.

## 5. Decisions only the founder can take (one list, plain words)

1. ~~**The pinned twelve** (the questions at the top of the rules page) and the two or three facts per guide page: sign off the list as it stands, or change it.~~ *Answered 2026-10-24 (evening): the founder kept the list ("if I want to change which rules are pinned I would have told you") and asked for the "בחירה של האתר" tag beside the heading to go; P-09 is signed off and the tag and the provisional note were removed.*
2. **Home page:** a quiet line with a link under the doors (built), or a fifth door for the rules and documents?
3. **Conditions on every rule** ("מתי זה לא חל", from the research's conditions lines): a Hebrew-writing day for the 214 figure rules first. Go?
4. **Official publications beside the mirrors:** for the ~15 laws and regulations behind 144 mirror rules, record the Knesset or gazette PDF next to the Wikisource copy. Research hours. Go?
5. *Partly built 2026-10-26:* `data/open-questions.json` holds every question's status, and for some a Hebrew title and what it blocks; the chips read it, and the site no longer names a closed question as open. Whether the questions become records of their own on the page is still open. **Open questions on the page:** the ~31 that block a number, as records with "what is unknown" and "what waits", or none.
6. **The 360 rules in the research that have no record** (about 190 on tier-1 products): write Hebrew records so the browse is complete, or leave them to the research.
7. **Claim marks inside guide sentences** (one small mark at the end of a surprising sentence, opening its rule): wanted, beyond the "שווה לדעת" block?
8. **"פירוש של האתר" tag** on rules whose conclusion the law does not state in one sentence: yes or leave it inside the text.
9. **Tariffs and ISA directives under the quoting rule:** a cross-provider table of all tariff lines, and the six rules quoting ISA directives, wait for your reading of D22. Not built.
10. Still open from before: keep or remove the published past-record line under "למה"; "go" on the earlier self-decided list.

## 6. Built on 2026-10-24 (night), and the hand-offs the build found

Built and checked on screen (phone and PC, Pages-like server): the source extraction for all 500 rules (1,095 entries; 743 with a Hebrew document name, every entry with a Hebrew publisher, 193 Wikisource section anchors, 249 PDF pages, 94 quotes, 30 derivation rules), the schema and validator rules, the source block in the rule card and the number sheet with the copy-citation button, the rules front with the pinned twelve (P-09) and the five shelf pages, the documents page, the search over rules, parameters and documents with two index files, the "שווה לדעת" block on the wrapper guides, the home line, the menu and footer entries, and the docs amendments.

Two lead decisions during the build: the rule's `strength` now follows its best extracted source for the primary/mirror pair only (90 records moved: 37 that claimed "primary" with only copies of the law behind them became "primary-mirror", 53 that claimed a copy but cite an official document became "primary"; the founder's own example TXK-04 is among the first, because the ordinance was read on Wikisource); and the "may have changed" line shows only for a passed recheck date or a read older than six months, not for every rule that is likely to change (that rule's recheck date already says so).

Hand-offs found by the build (data work, none blocking):

- 109 rules whose first source has an English title and no match in `data/sources/documents.json` show the link's host as the document name (the validator warns). Extending the table's match tokens (the editor named 135 documents; the markdown has about 300 distinct link titles) closes them a few at a time.
- 15 rules whose strength differs from their best source outside the primary/mirror pair (an institution rule citing a law, and the like): the researcher's call, listed by the validator.
- 3 rules carry figures behind the current tax year with no successor (TX2-20, TXF-21, TXG-17).
- Figure-level `source.strength` of "primary" on a Wikisource URL exists in older records (TXS-09 and others); the validator checks only the new `sources[]` for the mirror rule. A figure-level check is a small validator addition.
- Knesset OData API calls and data.gov.il API calls are recorded as `dataset` sources (BANK-23 and others); the landing pages would serve a reader better (verification report 2.5).
- The documents page shows 368 distinct documents: cards for the 135 named ones and for any with three or more rules, rows for the rest. The tail is where the English titles live.
- The search index is 98 KB gzipped (was 44 KB) plus 109 KB for the texts file fetched after it; acceptable on wifi, worth trimming (drop `alt` duplicates, index only featured documents, which is done) if phones on a weak signal complain.
- The shelf pages are 1.2–1.4 MB of HTML (190 KB gzipped) each; the front is 330 KB (62 KB gzipped). The heaviest shelves (state, access) could split by sub-group later.

## 7. The founder's correction (2026-10-24, late evening)

"I want everything to sit under /rules/. … it matters to differentiate between what the government takes vs the bank or investment house, and other rules, but we need a better way because right now it's confusing. Everything under /rules/ with quality-of-life filters, and the common questions are presets for these filters or direct links to a rule."

Applied: the front and the five shelf pages became one page, `/rules`, with the shelves, the products, the id prefixes and "about to change" as filters carried in the address (`?shelf=&product=&prefix=&changing=1&ids=&q=`); each pinned question applies a preset showing its rules, and its chips still open the rule sheet; `/rules/<shelf>` redirects to `/rules?shelf=<shelf>`. To keep one page fast, the HTML carries no cards: the full records come from five pre-rendered data files (`/rules-data/<shelf>.json`) fetched when a group is opened, a filter is applied or a hash names a rule. Every rule link on the site is `/rules#<ID>` again. The "בחירה של האתר" tag beside the pinned questions was removed at his request and P-09 is signed off.

Built the same evening by W7 (Sonnet, medium effort; `site/app/routes/rules.tsx`, `rules-shelf.tsx`, `rules-data.ts`, `site/app/lib/rules-filter.ts` with eight tests, `rule-uses.server.ts` for the product chips and the shelf bundles) and smoke-tested by the lead on a Pages-like server at phone and PC widths: the chips, the toggle, the prefix disclosure, a question preset landing the filter bar under the header, `/rules#TXK-04` landing its card under the header with the transfer regulations and the ordinance as links, `/rules/access` replacing itself with `/rules?shelf=access`, no sideways scroll, no page errors. Weight: the page 318 KB (55 KB gzip) against 1.2 to 1.4 MB per shelf page before; the five data files 131 to 535 KB (26 to 94 KB gzip), a text search fetching all five (about 300 KB gzip).

### 7.1 The second correction (late evening): the questions leave the page, and the set gets its name

"The FAQ is first in the page and doesn't fit well. The rules page should be the entire ruleset with quality-of-life filters; then an FAQ should come in a different way, not sure how." The lead sketched three phone frames (the rules page starting at the rules, a questions page where each question has a one-line answer with its sourced figures and its rule chips, and a three-question block on the home page) and the founder approved the sketch. He then asked for a better word than "כלל"; after turning down עובדה ("not indicative of what it represents"), סעיף and הוראה, and asking for "something along the lines of guidelines but in a more strict sense", he chose the pair **"חוקים וכללים"** for the set ("definitely two words make sense here"), with no noun for a single record and a card reading "id · title".

Built by two agents in parallel from `research/knowledge/2026-10-24-questions-spec.md`: W-He (Fable, high: the rename across copy, guide prose, glossary and copy.md, and the twelve `answer_he` lines written only from the rows' records with `{ID:figure}` slots) and W8 (Sonnet, medium: `/questions`, the home block, the rules page without the pinned section and with the quiet line and the new count line, the card heading, the menu); the lead added the strings, the menu entries, the validator's slot check and the docs (flows 6.1, 6.2, 6.3, 6.9, 6.14, 6.17; architecture 3.5; design-system 3.8a; data-schema item 12; method and parameters-rationale P-09; product D25; roadmap; CLAUDE.md), reviewed the twelve answers against the records, and smoke-tested the build.

