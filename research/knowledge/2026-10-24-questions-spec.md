# The questions page and the rename to "חוקים וכללים" (2026-10-24, late evening)

The founder's decisions, in order, after the single rules page went live:

1. The common questions do not belong at the top of the rules page. The rules page is the whole set with its filters; the questions get their own page, with a one-line answer each, and the home page gets a short block that leads there (he approved the sketch `scratchpad/w7/mock-questions.png`, three phone frames: rules page starting at the rules, questions page with answers, home block).
2. The set of records is called **חוקים וכללים** (laws and rules). A single record has **no noun**: a card is "id · title". He turned down כלל, עובדה, סעיף, הוראה, תקנה and תנאים on the way; "חוקים וכללים" is his pick because it says what the records are, the state's laws and everyone else's rules.

Two agents build it in parallel; the lead owns the docs and the final smoke. Requests between files go through `research/knowledge/requests.md` under the heading "Round: questions page and rename".

## Ownership

| Agent | Model | Owns | Does not touch |
|---|---|---|---|
| W-He (Hebrew editor) | Fable, high | `site/app/copy.ts` (values; keys stay, except where this spec says), `site/app/content/guide/*`, `docs/glossary.md`, `docs/copy.md`, `data/parameters/pinned-rules.json` (the `answer_he` field only), and whichever search component renders `searchMore.ruleWord` / `searchMore.figureLine` (find it with grep) | routes, provenance.tsx, shell.tsx, data.server.ts, validator, git, build |
| W8 (page builder) | Sonnet, medium | `site/app/routes/questions.tsx` (new), `site/app/routes/rules.tsx`, `site/app/routes/home.tsx`, `site/app/components/shell.tsx`, `site/app/components/provenance.tsx` (card heading and chip label only), `site/app/lib/data.server.ts` (the `PinnedRules` type only), `site/app/lib/paths.server.ts`, `site/app/routes.ts`, `site/app/lib/answer-slots.ts` (new) with its test | copy.ts (strings already exist, see below; ask for more in requests.md), data files, docs, git, build |
| Lead | Fable | docs (product, flows, architecture, design-system, data-schema, method, parameters-rationale, roadmap, CLAUDE.md, synthesis), `packages/pipeline/src/validate.ts` (done: the answer-slot check), review of the twelve answers against the records, `npm run check`, the smoke on a Pages-like server, commit | |

Already in place before the round: `copy.ts` has the `questions` block, `rulesFront.questionsLine`, `rulesFront.filters.showing` / `showingOne` with `{n}` and `{total}`, the menu and footer entries for `/questions`; `shell.tsx`'s `Current` type has `"questions"`; the validator checks `answer_he` (no typed digit; every `{ID:figure}` slot names a rule of the row and a figure that rule has).

## W-He: the rename

Policy, in the reader's words:

- The set: **חוקים וכללים**. The rules page title, its menu and footer labels (`site.menuItems`, `site.footer` entries for `/rules`), the search group `searchMore.groups.rule`, "לכל הכללים" → "לכל החוקים והכללים", "הכללים ש…" → "החוקים והכללים ש…", "מאגר הכללים" → "מאגר החוקים והכללים", "כללים שנכנסו לחישוב" → "חוקים וכללים שנכנסו לחישוב".
- A single record has no noun. "הכלל {code}" → "{code}"; "כלל {id}" → "{id}". Where a sentence needs a noun for one record ("אין כלל שעונה על זה", "חסר כלל במאגר"), prefer a rephrase that needs none ("אין תשובה על זה במאגר", "חסר במאגר החוקים והכללים"); use "חוק או כלל" only when nothing else reads well.
- `ruleCard.title` ("כלל") stays as a key: W8 drops it from the card heading (the heading becomes "id · title") and keeps it only in the chip's screen-reader label; set its value to "חוק או כלל".
- Leave alone: "בדרך כלל", "כלל הציבור", "נכלל / נכללו / נכללה", "כללי / הכלליים" (general), and the site's own rules that are not records: "כלל התאמה" (P-04 fit rule, `fitNoRule`, `marks."no-rule"`, `outcomeWords`, `targetMark.noRule`, "אין כלל לסיווג הזה"), "כלל התיישנות" (glossary). When unsure whether a string means a record, it does if a rule id or the rule base is in play.
- `parametersPage.names["P-09"]` → "השאלות שכולם שואלים: תשובה של שורה לכל שאלה בעמוד השאלות, והבלוק ״שווה לדעת״ בכל מדריך". `knowledgeEntry.homeLink` → "על מה האתר נשען: החוקים, הכללים והמסמכים". `rulesFront.lede` → one line without the questions (they left the page), for example "כל חוק וכל כלל שהאתר נשען עליו, עם המקור שלו. מסננים לפי השאלה, המוצר או המספר." `rulesFront.filters.preset` → "החוקים והכללים שעונים על השאלה", `presetAll` → "לכל החוקים והכללים". `rulesFront.ruleCount` is no longer used (W8 shows the bare number): strike it in docs/copy.md.
- Guide prose (`site/app/content/guide/*`, eleven files mention the word) and `docs/glossary.md`: same policy, same care about the words to leave alone.
- `docs/copy.md`: one dated note at the top of the "Added 2026-10-24 (knowledge layer)" section stating the global rename and its policy, then rows only for strings whose meaning changed (the new `questions` block, `rulesFront.questionsLine`, the count line, the P-09 name), and strike-throughs for keys that are gone (`rulesFront.ruleCount`, the pinned rows' strings if any are now unused).
- Keep keys; keep `{n}`, `{total}`, `{code}`, `{id}`, `{month}` placeholders; plural imperative; maqaf before a number; no digits typed in prose.

## W-He: the twelve answers

`data/parameters/pinned-rules.json`, each row gets `"answer_he"`: one sentence, two at most, in plain words, that answers the question **only with what the row's rules say** (`data/rules/<id in lower case>.json`, fields `text_he`, `title_he`, `figures`). Never a number from memory: every figure is a slot `{ID:figure}` where `figure` is a key of that rule's `figures`, and the page renders the slot as the number with its unit ("25%", "83,641 ₪", "6 שנים", "3 ימי עסקים"), so write no unit word after a slot. No digit anywhere else in the sentence (the validator rejects it). A row whose answer rests on a rule of institution or secondary strength (KGL-03, KH-15) may say so in words ("לפי פרסומי החברות"); the page also shows the strength label. If the rules of a row do not support a one-line answer, write what they do say and nothing more. Run `npm run validate` at the end: it checks the slots.

The rows and their figures (from the records on 2026-10-24):

| Question | Rules and figures |
|---|---|
| כמה מס משלמים על רווח בבורסה? | TXS-01 `rate` 25 pct (real gain, the ceiling of the ladder); TXS-02 no figure (real vs nominal) |
| כמה מס משלמים על ריבית מפיקדון? | TXI-03 `rate` 15 pct (unlinked); TXI-02 `rate` 25 pct (the ceiling on interest) |
| עוברים מסלול בתוך הקופה: משלמים מס או עמלה? | TXH-17 none; TXK-04 none; PF-23 `switch_business_days` 3 |
| כמה אפשר להפקיד בקופת גמל להשקעה בשנה? | KGL-02 `base_ceiling` 70000 nis (the base in the law, updated each January); KGL-03 `ceiling` 83641 nis (institution) |
| מתי אפשר למשוך קרן השתלמות בלי מס? | TXH-09 `lock_years` 6, `lock_years_retirement_or_study` 3; KH-15 none (institution) |
| הכסף בפיקדון בבנק מבוטח? | BANK-23 none; REG-04 `examination_deadline_months` 12, `progress_report_months` 6; REG-06 `guarantee_cancel_notice_days` 90 |
| כמה דמי ניהול מותר לחברה לגבות? | PF-06 `balance_cap` 2 pct_per_year (hishtalmut, IRA); PF-02 `balance_cap` 1.05 pct_per_year, `deposit_cap` 4 pct_of_deposit (provident) |
| מעבירים את הכסף לקופה אחרת: כמה זמן זה לוקח ומה זה עולה? | PF-19 `transfer_business_days` 10; SW-06 `transfer_business_days` 10, `commissioner_extension_business_days` 20, `late_transfer_data_business_days` 5 |
| קיבלתם הנחה בדמי ניהול: לכמה זמן היא מובטחת? | PF-13 `min_discount_years` 5; PF-14 none; SW-15 none |
| כל הקרנות הכספיות אותו דבר? | TXS-24 `money_market_funds_count` 73, `money_market_funds_taxable` 2 (count); MF-37 none |
| כסף שיושב בעו״ש: הבנק חייב להודיע על זה? | BANK-20 `credit_balance_threshold` 15000 nis |
| מה קורה לפנסיה אם החברה שמנהלת אותה קורסת? | REG-18 none; REG-19 none |

## W8: the pages

1. **`/questions`** (`site/app/routes/questions.tsx`, prerendered; add `"/questions"` to `paths.server.ts` and the route to `routes.ts`). Loader: `loadPinnedRules().rows` (add `answer_he?: string` to `PinnedRules` in `data.server.ts`), the records of every rule in the rows (`loadRules()` picked by id) and their uses (`loadRuleUses(ids)` from `rule-uses.server.ts`), `today`, the dimensions as the rules page does. Page: `PageShell current="questions"` with `data` carrying those records (so a chip opens the rule sheet); h1 `questions.title`, lede `questions.lede`, then one entry per row, separated by `border-b border-border` like the old pinned rows: an `h2` with the question (anchor id `q-{index+1}`, `scroll-mt` of the header height), the answer paragraph, the strength label when any rule of the row is `institution` or `secondary` (once, the weakest), then the rules as lines "{short title} {RuleRef chip}" in `text-sm` (title as the old pinned rows did: `ruleTitle`, falling back to the topic name for an English working title), then a `Link` `questions.toRules` to `/rules?ids=<the row's ids joined by comma>`. A row without `answer_he` shows `questions.noAnswer` in `text-muted-foreground` instead of the answer. Meta title `${questions.title} · ${site.name}`.
2. **The answer paragraph** from `site/app/lib/answer-slots.ts` (pure, tested): `parseAnswer(text)` returns parts `{ kind: "text", text } | { kind: "slot", id, figure }` for `{ID:figure}` slots. The page renders a slot as `<Num value={ruleFigure(rule, figure, today)} />` plus, for units `months | years | days | business_days | usd | eur`, the unit word from `provenance.unit` after a space (exactly as the old pinned rows did in `rules.tsx`); a slot whose rule or figure is missing renders "—". Text parts are plain text.
3. **Home** (`routes/home.tsx`): under `QuestionBlock`, in the left column, a `Card` with `questions.home.title` as an `h2` (`text-lg font-semibold`), the first three rows' questions as `Link`s to `/questions#q-1`, `#q-2`, `#q-3` (each a row of `min-h-target`, `border-t border-border` between rows, `IconDrillIn` at the inline end like the door cards), and `questions.home.all` as a `text-link` under them. The loader adds `questions: rows.slice(0, 3).map((r) => r.question_he)`.
4. **Rules page** (`routes/rules.tsx`): remove the pinned section and everything in the loader that only served it (`firstFigure`, the pinned records, their uses); keep `pinned.rows` as `{ question, ids }` for the preset line and `?ids=` presets, so a link from the questions page lands with the question named. Under the filter field, one quiet line: `rulesFront.questionsLine.before` then a `Link` to `/questions` with `rulesFront.questionsLine.link` (`text-sm text-muted-foreground`, the link in `text-link`). The count line: `filters.showing` now has `{n}` and `{total}`, `showingOne` has `{total}`; render both numbers isolated (`WithNumber` takes one slot today; extend it or split twice). Section and group counts: drop `Count` and `rulesFront.ruleCount`; show the bare number with `Num2` after the "·". The hash landing, the hidden-target rule and everything else stay.
5. **Card heading** (`components/provenance.tsx`): the normal card reads "{id} · {title}" (`<bdi dir="ltr" className="slashed-zero">{id}</bdi>`, " · ", `<ShownRuleTitle/>`), an open question keeps "שאלה פתוחה {id}", the no-record card shows the id alone; the chip's `aria-label` keeps `${ruleCopy.title} ${id}`. Nothing else in that file changes.
6. **Menu**: `shell.tsx` builds the main group from `site.menuItems`, which now has the `/questions` entry; make sure `current="questions"` highlights it and the footer entry renders; nothing else.
7. Run `npm run typecheck` and `npm test` at the end; do not build. Report deviations and what was not tested.
