# Brief: one reference chip for every id the site shows (2026-10-26)

## Why
The founder, on /parameters: "you cant click F-80 for some reason. shouldn't there be a shared component for rules as well?"

Rule ids already have a shared chip, `RuleRef` (`site/app/components/provenance.tsx`), which opens the rule card in the provenance sheet. Every other kind of id is hand-built and leads nowhere:
- **Formula ids** (F-80, A-06): a static `rule-chip rule-chip-static` on the parameters page ("משמש ב:") and in the computed-value sheet (`provenance.tsx`, the formula row).
- **Parameter ids** (P-01, A-02): the chip on each parameters card header, and wherever else a parameter id is printed.
- **Open-question ids** (BRK OQ9): ten files in `site/app/content/` each define their own `const OQ = ({ id }) => <bdi>…</bdi>`, plain text. The not-covered page prints its own.

## What to build
1. **`IdRef`**, next to `RuleRef` in `provenance.tsx` (the shared finance blocks), is one chip for any id. It reads the kind from the id's shape:
   - **rule** (`ABC-12`, an id the provenance data knows): exactly `RuleRef`'s behaviour; `RuleRef` stays as a thin alias so nothing else changes;
   - **formula** (`F-\d+`, and the `A-0x` computation ids that `formulaNames` in `copy.ts` names): opens a new sheet kind `{ kind: "formula", id }`;
   - **parameter** (`P-\d+`, and `A-\d+` parameter ids from `data/parameters/`): a link to `/parameters#<id>`, which must scroll to that card (give each card `id={p.id}`, and check that the anchor lands below the sticky header);
   - **open question** (`<PREFIX> OQ<n>`): renders as a chip with the same look. Until the open-questions audit lands it opens a sheet that says, in Hebrew, that this is an open question in the rule base and what that means on the site (copy key under `provenance`). The lead will add the per-question data (a Hebrew title, the status, what it blocks) after the audit, at `data/open-questions.json`; design the sheet so it shows those fields when the file has the id.
2. **The formula sheet** shows:
   - the formula's Hebrew name (`formulaNames`) and its id;
   - the parameters it uses, each an `IdRef` (the inverse of `loadParameterUses()` in `site/app/lib/data.server.ts`; the parameters page already loads it);
   - a link to the method document on GitHub (`https://github.com/orishamir/finance-tool/blob/main/docs/method.md`), labelled as the full definition, in English.

   This data reaches the client through the provenance data, the way rules do (`ProvenanceData`): add `formulas: Record<string, { name: string; parameters: string[] }>` and fill it in the loaders that build provenance data. Where a page doesn't pass it, the sheet still shows the name from `formulaNames`.
3. **Replace every hand-built id:**
   - the two `rule-chip-static` uses;
   - the ten local `OQ` components and their uses (one `IdRef` each);
   - the not-covered page's open-question codes ("שאלה פתוחה TX2 OQ6" keeps its words, and the code becomes an `IdRef`);
   - any other place that prints a formula, parameter or open-question id as bare text (search for `bdi dir="ltr"` around such ids).
4. **Guards** in `site/app/components/kit/guards.test.ts`:
   - no `rule-chip-static` anywhere;
   - no local `const OQ =` in `site/app/content/`;
   - a source scan: no bare `F-\d\d`, `P-\d\d` or `OQ\d` string literal inside a `<bdi>` outside `provenance.tsx`.
5. **The gallery** (`/kit`) shows `IdRef` for each kind. It lives in `provenance.tsx`, not the kit, but the gallery may import it.
6. **Docs:**
   - in `docs/design-system.md` section 11, one entry for `IdRef` under the blocks layer;
   - in `CLAUDE.md`'s rule "Shared components first", nothing changes;
   - in `research/specs/2026-10-25-ui-kit/round-2.md`, add `IdRef` to the blocks table as built.

## Check on screen (required)
Build your worktree (`npm run build -w site`), serve it on your own port (4233), and photograph at 1280 and 390 px:
- /parameters, then click F-80 in the P-01 card: the formula sheet opens; click P-01 inside it: you land on the P-01 card;
- a computed number's sheet on /goal/compare or /fees: its formula chip opens the formula sheet;
- /guide/brokerage-account and /not-covered: open-question chips open the open-question sheet;
- /kit.

Look at every screenshot yourself. Write `report.md` beside this brief, with the shots in `shots/`.

## Files you own
- `site/app/components/provenance.tsx`
- `site/app/components/Sheet.tsx` (only if the sheet needs a new kind)
- `site/app/routes/parameters.tsx`, `site/app/routes/not-covered.tsx`
- the ten `site/app/content/**` files that define `OQ`
- `site/app/lib/data.server.ts` (only for the formula map)
- the loaders that build provenance data
- `site/app/copy.ts` (new keys only, under `provenance`)
- `site/app/components/kit/{guards.test.ts,gallery.tsx}`
- `docs/design-system.md`, `research/specs/2026-10-25-ui-kit/round-2.md`

Anything else goes in `requests.md` beside this brief.

## Rules
- Use the kit for every piece of UI (`site/app/components/kit/`, gallery at /kit). The ratchets in `kit/ratchets.test.ts` must keep passing.
- Run `npx vitest run site packages/engine` and `npm run typecheck`. Don't run `npm run check`, and never `pkill`.
- Keep shell commands simple: scripts in files, then run them.
- Commit on your branch, ending the message with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; the lead reviews and merges.
