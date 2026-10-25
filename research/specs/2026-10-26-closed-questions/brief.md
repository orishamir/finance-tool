# Brief: the site stops naming closed questions as open, and the open-question chips carry their data (2026-10-26)

## Why
The open-questions audit (`research/knowledge/2026-10-26-open-questions.md`) closed 101 of the rule base's 493 open questions. The site still names some of them as open:
- in guide prose, as open-question chips;
- in copy and code;
- in blocked guide dimensions;
- in the instrument records' `open_questions` lists;
- in method gaps.

The founder (2026-10-26): "marking closed questions as closed/deleting them entirely". Where a question is closed, the site states the answer with its rule, and the open-question chip goes. The rule base keeps the struck line with its closing date, because the not-covered page reads those.

## What to build
1. **`data/open-questions.json`**, one entry per question in the rule base (`.claude/skills/il-finance/references/*.md`):
   - Fields: `id` ("TX2 OQ6", the code the site uses); `status` (`open`, `narrowed` or `closed`); `closed_on` (ISO date, for closed); `title_he` (one short Hebrew line saying what is unknown, in plain words); `blocks_he` (what on the site waits for it, in Hebrew, only where something does).
   - Generate `id`, `status` and `closed_on` by a script from the markdown (a struck line `~~…~~ Closed <date>` is closed; the audit's table `research/knowledge/2026-10-26-open-questions/table-after.json` and `merged.json` show the classes and the parse). Add the script to `packages/pipeline/scripts/` with an npm script `gen:open-questions` in that package.
   - The script keeps hand-written `title_he` and `blocks_he` when it re-runs.
   - Write `title_he` and `blocks_he` for every question the site names. The rest may have no Hebrew yet.
   - Add a Zod schema in `packages/schema` and a check in the validator, as the other collections do. The validator warns when the file is behind the markdown.
2. **The chip reads the data.** `IdRef` for an open question (in `site/app/components/provenance.tsx`) takes status and `closed_on` from the data, so a closed question always shows as closed without a `closedOn` prop. The provenance data's `openQuestions` (already typed there) is filled for every page by the root loader, as `parameters` is. Keep the sheet's existing fields.
3. **A guard** in `site/app/components/kit/guards.test.ts`: no `IdRef` in `site/app/content/` or `site/app/copy.ts` names a question whose status is `closed`. The not-covered page, which shows closures on purpose, is the only exception, by its file name.
4. **The places the audit lists** ("Where the site still names a question that is now closed", and the blocked guide dimensions and instrument `open_questions` it names). For each:
   - **Guide prose with a chip:** rewrite the sentence so it states the answer, with the rule's chip (`RuleRef`/`IdRef` of the new or updated rule). Read the rule's text in the references first: the answer comes from the rule base, never from memory. If the closing rule is new and has no `data/rules` record yet (BANK-35, GOV-24, ETF-67, TXF-28, TXK-27, TXA-30), create its record the way the others are built (look at a neighbour in `data/rules/`, then run `npm run extract:sources -w @finance-tool/pipeline` and `npm run validate`).
   - **Copy and code** (`copy.ts`, `lib/playbook.ts`): the same.
   - **Blocked guide dimensions** that the audit says can be unblocked (BANK OQ9, TXI OQ7, PEN OQ8, TXK OQ12, TXP OQ3, TXS OQ11) and the instrument records' `open_questions` lists (`data/instruments/`): remove the closed codes; where a dimension was blocked only by a closed question, unblock it and show what the rule says.
   - **Method gaps** (`docs/method.md`): G-05 and G-06 close; G-21's assumption is confirmed; G-23 is answered (credit points apply to special-rate income); G-11 is answered for the lump sum; F-44's 60+ note is out of date. Write each change as a dated line, as the file does.
   - **The not-covered page:** `site/app/lib/graduation.server.ts` has no `sources` entry for Amendment 190 deposits, so its closures never show. Add it.
5. **Sweep:** after the listed places, search `site/app` and `data/` for every closed code (from the new data file) and fix what is left.

## Rules
- **Never fill in a financial or tax fact from memory.** Every sentence you write about a rule comes from its text in the references, with its chip.
- **Hebrew copy:** in `site/app/copy.ts` or the content files, plural imperative, in the style of `docs/copy.md` section 10.
- **Use the kit** for any UI (`site/app/components/kit/`, gallery at /kit). The guards and ratchets must keep passing.
- **Order of work, because of other branches:**
  - Another branch (`own-figures`) changes `provenance.tsx`, `guide-signature*.server.ts`, `value.ts` and some lib files. Do items 1, 3, 4 (content, copy, instruments, method, graduation) and 5 first.
  - Leave the `provenance.tsx` change (item 2) and any edit to `guide-signature*.server.ts` until the lead tells you `own-figures` is on main. Then rebase onto main and do them.
- **Rule-base markdown:** a rule-base editor is editing `.claude/skills/il-finance/references/*.md` in the main checkout right now. Don't edit those files; read them only. If a reference needs a change, write it in `requests.md` beside this brief.

## Check on screen (required)
Build (`npm run build -w site`), serve on port 4236, and photograph at 1280 and 390 px:
- each page whose prose you changed, at the changed paragraph;
- a guide whose dimension you unblocked;
- `/not-covered`;
- an open-question chip's sheet for a closed and an open question.

Look at every shot. Write `report.md` beside this brief, with the shots in `shots/`.

## Commands
- Run `npx vitest run site packages/engine packages/pipeline packages/schema`, `npm run typecheck` and `npm run validate`.
- Don't run `npm run check`, and never `pkill`.
- Keep shell commands simple: scripts in files, then run them. Put screenshots and large files inside your worktree, never in /tmp.
- Commit on your branch, ending the message with your model's Co-Authored-By line. The lead reviews and merges.
