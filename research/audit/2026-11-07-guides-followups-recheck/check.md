# Third independent check of guides-research-followups (at fbe38377)

2026-11-07. A checker who did none of the work and did not trust the fix pass's report. Read `git diff 408172bd fbe38377` (the
fix pass, 23 code, data or doc files), the first check (`../2026-11-07-guides-followups-check/check.md`), the rule cards PF-19, PF-23,
KH-17, KH-18, TXH-09, TXH-11, TXK-04, TXK-17, TXK-30, SW-39, SW-40 and TXP-32. The site build in the worktree (14:28) is from
8e44fb69; the two later commits touch only `research/`, so it was served as is (`serve-build.mjs`, port 4801) and checked against the
source strings. Screens at 1440x900 and 390x844 (touch) are in this folder; `text-*.txt` is the page text they were read from.

**Verdict: fail, on one small item** (the structure-review tool now hides copies of kit pieces), plus a merge conflict with today's
main that must be resolved before landing. Every must-fix and should-fix of the first check is fixed on the built page.

## What was run

- `npm run typecheck`: exit 0. `npm run validate`: data valid (three old warnings). Targeted tests: `exit-step.test.ts`,
  `compare-scenario.test.ts`, `kit/guards.test.ts` (55 passed) and the engine's `review-r34.test.ts` (30 passed). No full build.
- `merge-review.mjs main`: one new component outside the kit (`BlockedGroups`, sections.tsx:264) and the ReadingTag's caution `Tag`.
- `git merge-tree main HEAD`: **conflict** in `site/app/components/kit/guards.test.ts` (must-fix 2).
- No horizontal scroll at 390 on any page checked (scrollWidth 390).

## The first check's items, on the built page

| Item | Fixed? | Seen |
|---|---|---|
| Must 1: ReadingTag and StrengthLabel in the gallery | Yes | `kit-strength-*.png`: each strength and the reading tag, with a uses line |
| Must 2: method F-66 names SW-40's label `reading` | Yes | docs/method.md:330, rewritten per pair |
| Should 1: self-managed records no longer cite TXK OQ10 | Yes | goal comparison, all checks open (`goal-compare-loss-row-*.png`): "חסום ל: קופת גמל להשקעה (פרטים); קרן השתלמות בניהול אישי, קופת גמל בניהול אישי". The question chip sits only beside the fund whose record names it. In exposure mode a self-managed holding is "עוד לא נבדקה" (no terms), so it never reaches that checklist (`exposure-checklist-ira-*.png`) |
| Should 2: the goal comparison shows readings | Yes | inflation typed −1%: the kupat gemel lehashkaa row carries "קריאה של האתר" under its figure (`goal-compare-infl-1-reading-*.png`); with 2% there is no tag |
| Should 3: "לכל היותר" off the study fund's switch line | Yes | `hishtalmut-switch-*.png` |
| Should 4: a test for the exit step's mark | Yes | `lib/exit-step.ts` and its test; child-savings-bank still shows its reading tags in the build |

## New Hebrew lines against their rules

- keren-hishtalmut.tsx:52: "בלי עמלה. בין מסלולים בתוך הקרן: תוך 3 ימי עסקים. לקרן השתלמות אחרת: כל היתרה, תוך 10 ימי עסקים
  מהיום שהקרן הישנה מקבלת בקשה מלאה וחתומה". True to PF-19 (reg. 5(א): from the day the request reached the transferring fund),
  PF-23, KH-18, KH-17; both figures are `N` over data records; impersonal. Nit: KH-18 lets the fund defer a switch dated in a month's
  first three business days to the fourth (rule 41יא(א)), which the line does not mention. The first check accepted dropping "לכל
  היותר" as the fix.
- ira-hishtalmut.tsx:18: "כללי מס ההכנסה והנזילות ... מושכים בפטור ממס הכנסה על הרווחים מההפקדות המוטבות ... בלי מס רווחי הון".
  True to TXH-09 (6 years, gains on the benefited deposit exempt), TXH-11 (study-fund gains are interest income, so income tax) and
  TXK-17; the tax is named; impersonal plural. Nit: "ההפקדות המוטבות" has no glossary link (older words).
- copy.ts:4095 (gallery uses line, builders only): "קריאה של האתר בנוסח רשמי" says "a reading in official wording". Meant: "קריאה
  של האתר בטקסט רשמי". gallery.tsx:384 labels `secondary` "a press article or a forum post", but nothing unofficial is cited any
  more: say "a leftover in unofficial-leftovers.json".

## Must fix

1. **merge-review.mjs hides copies of kit pieces** (research/audit/tools/merge-review.mjs:35 and :83). `inGallery(name)` is true when
   the name is any word of any `<Demo name="...">`. Every kit piece has a demo, so a new `function Button(`, `Tag`, `Card`, `Callout`,
   `Section`, `Stat` or `ProductTable` in a feature folder no longer gets "New component with a kit piece's name (likely a copy)". A new
   one-off whose name is a word in a demo title is no longer listed as "outside the kit" either. Checked with the regex against
   today's gallery: Button, Tag, Card, Callout, Section, Stat, ProductTable all come back true. What the lead sees: a clean structure
   review for exactly the case it exists to catch. Fix: exempt only names the gallery imports from `../provenance` (parse the import
   line), never a name in `kitNames` defined outside `kit/`; add the copy case to the tool's own test if it has one.
2. **Merge conflict with main in `kit/guards.test.ts`.** Main added its own guards 14 (a sheet never prints a raw English value) and
   15 (PrintedText or DoubtNote). The branch's reading guard is also "14". Fix when merging: keep both, renumber the reading guard 16,
   and update `site/app/lib/exit-step.test.ts:2` ("guard 14's regex").

## Should fix

1. **A bare `blocked` is tracked nowhere.** ira-hishtalmut.json:315 and ira-provident.json:322 mark loss offset `"blocked"`. The commit
   says a question for each "is the tax-specialist's to open". No question was opened in tax-hishtalmut.md or
   tax-pension-gemel-lekitzba.md, and no issue exists (searched). validate.ts:1036 checks only `blocked:<OQ>`, so any bare mark now
   passes the data check with no question behind it. What a reader sees: "חסום ל: ... קרן השתלמות בניהול אישי, קופת גמל בניהול
   אישי" with nothing to open and no reason given. Fix: an issue for the tax-specialist (TXH and TXP questions, then `blocked:TXH-OQn`
   and `blocked:TXP-OQn`), and a ratchet in validate listing the bare marks by name, a list that only shrinks.
2. **`openConstraintOf` ignores a bare `blocked`** (site/app/lib/compare.ts:664). The branch made a bare mark valid, and
   `blockedMarks`, exposure mode and the track page read it, but the eligibility check reads only `blocked:`. A bare mark on `minimum`
   or `eligibility` would rank the option while its checklist row says "מונע דירוג של". It is latent (no such record today). Fix:
   accept `m === "blocked"`, and let `openConstraintCode` return null for an empty code.
3. **Exposure mode silently drops blocked options on a covered row** (site/app/components/exposure-mode/result.tsx:284). When any
   option covers a dimension, the options blocked on it in their own record are not shown. The goal comparison shows them ("חסום
   ל:"). This is older than the branch, but the branch built the shared `blockedMarks` and `BlockedGroups` for exactly this. Fix:
   render `scnCompare.blockedFor <BlockedGroups groups={b.groups} … />` on covered rows, as goal-compare.tsx:240 does.
4. **The reading tag adds a block on screen when a number changes** (site/app/components/compare/rows.tsx:64 and :76). The tag row is
   rendered only when a run has a reading. Typing inflation below zero in the comparison's assumptions makes it appear under the
   kupat gemel lehashkaa figure: measured 0 tags before, 1 after (`goal-compare-infl-typed-1280.png`). The ranked card grows and
   everything below it moves (CLAUDE.md, "nothing on the screen moves"; D63). The page already moves a lot on main, so this is one
   more instance, not the cause. Fix: hold the tag line's height in the card (HoldTallest or LongestCase), or put the tag in the
   assumption-chips line that is always there.
5. **`BlockedGroups` has no structure verdict.** It is a new component in `components/guide/sections.tsx`, used by three pages. "Kept,
   beside DimensionChecklist, its only kind of consumer" is a fair verdict, but it is not recorded. Record it, or promote both into
   the kit with a gallery entry.
6. **The engine change has no finance-reviewer evidence** (packages/engine/src/variants/switching.ts, F-66 per pair, TXP-32 added).
   CLAUDE.md asks for one on engine changes. One question for it: TXK-04 says a track switch inside a kupat gemel lehashkaa rests on
   the same inference as a transfer between two of them ("no explicit sentence"). Yet only the transfer carries the `reading` label.
   No site page calls the fund-transfer path today, so nothing shows yet.

## Not this branch (seen in passing)

- **A self-managed fund's page shows the ordinary fund's checklist.** On /companies/512065202/1487 (Meitav השתלמות בניהול אישי), "מה
  לבדוק" reads the keren-hishtalmut record, because tracks take their wrapper from the regulator's classification
  (site/app/lib/data.server.ts:214). So it says "עמלת קנייה ומכירה: לא רלוונטי", "דמי ניהול פיקדון ניירות ערך: לא רלוונטי" and
  "קיזוז הפסדים: לא רלוונטי" on a fund where people trade securities (`track-ira-1487-allchecks-*.png`). The fix pass's track.tsx
  change for a bare `blocked` is never reached by any self-managed fund's page.
- Exposure mode says "סכום מינימלי … מונע דירוג של: מק"מ" and "קיזוז הפסדים … מונע דירוג של: מסלול כללי", while the same page
  lists both as "דורגה" (`text-exposure-mode-ira-*.txt`; copy.ts:1198).
- Guide-signature and holdings runs carry `reading` labels into `SiteValue.labels` (guide-signature/kit.tsx:77, holdings.ts:423), and
  nothing renders them. The widened guard looks only for `code === "secondary-source"`, so it would not see a file that drops every
  label.
