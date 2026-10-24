# Cross-file requests (append-only), knowledge layer build 2026-10-24

Each agent owns the files in `2026-10-24-synthesis.md` §3.1. When you need a change in a file you do not own, append a block here and continue; the lead applies it and marks it done. Never edit another owner's file.

Format:

```
## <your workstream> → <file>  (status: open | done)
What: ...
Why: ...
Exact change (copy-pasteable): ...
```

## W6 → site/app/copy.ts  (status: done by the lead; guide.tsx should hide the index entry for wrappers with no block)
What: add the "worth" entry to `guide.sections`, after `use`, so the section index lists the new block.
Why: the block renders with id="worth" but the index is built from copy.guide.sections; until added it has no index entry (and useCurrentSection does not track it).
Exact change: after `{ id: "use", title: "למה משתמשים בזה" },` add `{ id: "worth", title: "שווה לדעת" },`. Note: the index shows the entry even for wrappers with no block; if that matters, filter it in guide.tsx (W6 can do it: `x.id !== "worth" || data.worthIds.length > 0`).

## W6 → site/app/routes/guide.tsx loader  (status: done by the lead)
What: the loader reads data/parameters/pinned-rules.json directly (TODO marked); switch to `loadPinnedRules()` when W3's helper exists.

## W2 → site/app/copy.ts  (status: done by the lead)
What: `updateRules` lacks the key `"fixed in regulation"` (a legal `update_rule` in packages/schema/src/value.ts). W2's card prints nothing for a key with no Hebrew word (never the English).
Exact change: add to `updateRules`: `"fixed in regulation": "קבוע בתקנות",`

## W2 → W1/lead reconcile  (status: open)
What: `site/app/lib/sources.ts` defines `RuleSource` and `SourcedRule` locally (shape of synthesis 3.2) and reads `sources` / `derived_from` through a cast. Once `RuleRecord` carries them, `RuleSource` can be replaced by the schema type; `strength` there must stay within primary | primary-mirror | institution | secondary.

## W3 → site/app/copy.ts, rulesFront.subgroups  (status: done by the lead: המס על …)
What: three sub-group names collide with the product-file names inside the same shelf: on `state` the shelf shows both "קרן השתלמות" (keren-hishtalmut.md, rules whose first dimension is tax) and "קרן השתלמות" (tax-hishtalmut.md); likewise "פנסיה וקופת גמל לקצבה" (pension-and-gemel-lekitzba.md and tax-pension-gemel-lekitzba.md) and "קופת גמל להשקעה…" family.
Why: two groups with one name on one page.
Exact change: rename in `rulesFront.subgroups` the tax ones, e.g. "tax-hishtalmut.md": "מס על קרן השתלמות", "tax-pension-gemel-lekitzba.md": "מס על פנסיה וקופת גמל לקצבה", "tax-gemel-lehashkaa-ira-child.md": "מס על קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד" (Hebrew editor to polish).

## W3 → site/app/copy.ts  (status: done by the lead: rulesFront.changing.more)
What: the front borrows `documents.rulesMore` ("עוד {n}") for the "more rows" disclosure under a busy month in "מה עומד להשתנות". If W-He renames that key's meaning, give the front its own `rulesFront.changing.more`.

## From W1 (data), 2026-10-24

- W2/W4 (site): `sources[].mirror_host` has a third value, `other`: an official text copied on a host that is neither Wikisource nor Nevo (for example a CMA circular on analyst.co.il or prisha.co.il, "third-party host" in the markdown). Label it as a copy of the official document, not as "נוסח החוק (עותק)". The schema, validator and docs say so; the spec's enum was `wikisource | nevo`.
- Lead: `packages/pipeline/src/cli.ts` is not mine and is unchanged; the validator prints its warnings itself (one line per category, to stderr) and returns failures only, so the exit code is unaffected.
- Lead: after W-He fills `data/sources/publishers.json` and `documents.json`, re-run `npm run extract:sources -w @finance-tool/pipeline`; it rewrites only `sources`, `sources_missing_reason` and `derived_from`.

## W5 → site/app/copy.ts  (status: open)
What: no string is missing for the search UI as built (it uses `searchMore` and the existing `search`). One optional item: the link "לשאלות הפתוחות" of the question empty state (design §5) is not built because `searchMore.empty` has no key for it. If wanted: add `searchMore.empty.openQuestions` and the lead picks the target page.
Why: design §5 lists the link; the synthesis did not carry it.

## W5 → site/app/lib/rule-uses.server.ts / index `rank`  (status: open, no action needed now)
What: `SearchEntry.rank` is the hook for the rule-uses score (higher first inside the rules group, before strength). It is not filled: with `ruleScores()` as rank, `25%` opens with TXH-11 and `מעבר מסלול` with PF-23 instead of TXF-02 and TXH-17 (the score outweighs the strength-and-title order the report's queries expect). To switch it on, set `rank` in routes/search-index.ts from `ruleScores()` once the lead decides the score should win.

## W5 → documents page (W4)  (status: open)
What: document rows link to `/documents#{d.key}` and `key` today is the source URL, so the fragment is a raw URL (`/documents#https://...`). It works as an anchor only if the documents page uses the same string as each card's `id`; a short slug key would be cleaner.

## W-He → packages/pipeline/scripts/extract-sources.ts (W1)  (status: open)
What: when matching a source title against `documents.json`, try the longest `match` token first across all documents, and take the document whose token is longest; on a tie, the first in the array.
Why: tokens nest. "Law (Wikisource mirror)" (the Joint Investment Trust Law's bare title, 20 uses) is a substring of "National Insurance Law (Wikisource mirror)"; "Directive 447" sits inside "Directive 447A …"; "Ordinance" is the generic last resort for פקודת מס הכנסה. documents.json is ordered specific-first (national-insurance-law and boi-directive-447a before their generic neighbours) as a fallback for a first-match matcher, but longest-token matching is the robust rule. 47 titles cite two documents in one link title ("Income Tax Ordinance s.47(a) …; guide 2025 pp.60-62"); those are the W1 segmenter's business, not the table's.
Exact change: in the title→document lookup, `candidates = docs.flatMap(d => d.match.map(tok => ({ d, tok }))).filter(c => title.includes(c.tok)).sort((a, b) => b.tok.length - a.tok.length)`; take `candidates[0]?.d`.

## W-He → data/sources/publishers.json consumers (W1, W2)  (status: open)
What: `gov.il` entries resolve to publisher_he "אתר הממשלה (gov.il)"; the source block should prefer `documents.json`'s `publisher_he` (רשות המסים, רשות שוק ההון, ביטוח וחיסכון, החשב הכללי …) over the host's when the title matched a document.
Why: gov.il hosts the Tax Authority, the CMA, the Accountant General and the Chief Economist under one host; the host name alone tells the reader nothing about the authority.

## W-He → site/app/copy.ts (lead)  (status: open, informational)
What: the knowledge-layer values were edited in place (16 values, keys untouched); the list with old and new text is in docs/copy.md "Added 2026-10-24 (knowledge layer)". No cross-file need, except: `ruleCardMore.usesEngine` now reads "החישובים באתר" and `rulesFront.toShelf` "לכל הכללים בנושא הזה"; if W3 hard-coded the old words anywhere outside copy.ts, they should read from copy.ts.
