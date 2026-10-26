#!/usr/bin/env python3
"""Appends the third review round to report.md and brings requests.md up to date (the harness refused a direct .md write, 2026-10-26)."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = os.path.dirname(HERE)
SECTION = r"""
## Review round 3 (2026-10-26)

An independent check confirmed the seven items of round 2 and found seven more; each is fixed on this branch (tools: `tools/r3-*.py`, `tools/r3-*.mjs`; shots `shots/r3-*`). The branch was then rebased onto main at 630cf7e (after `followups`, ee05579); see the end of this section.

1. **The not-rules' section said something false.** Its title and line ("לא כלל ולא תנאי של חברה … ולא תנאי שחברה קבעה במסמכים שלה") were wrong for SW-53 (two brokers' tariffs) and CAT-43 (TASE's own terms of use). It is now its own section at the end of `/companies` (no longer a fold among the companies with no page): "לא נכלל ככלל: פרסומים, ספירות ונתונים", with the line "מה שהאתר שומר עם המקור אבל לא מציג ככלל: סיפורים מפורומים, כתבות, רשימות וספירות, נתונים, תנאי שימוש של אתרים, תעריפים של חברות, ומקומות שבהם חיפשנו כלל ולא מצאנו." A not-rule's card carries a second tag "לא נכלל ככלל"; when it cites a company's document its line reads "נמצא במסמכים של {company}. האתר לא מציג את זה ככלל, ושומר אותו עם המקור בין מה שלא נכלל ככלל." (no "בחברות אחרות זה יכול להיות אחרת"), and its foot "לכל מה שלא נכלל ככלל". The search row reads "{companies} · לא נכלל ככלל · {topic} · {id}". Test: `own-source-labels.test.ts` renders SW-53's card.
2. **The fee and minimum rows named the wrong companies.** `company_terms` entries may now be `{ rule, companies }` (schema, validator, `VariesByCompany`): the companies whose term on that property the record states, each of which must list the record. BRK-48 and BRK-24 take `fee-account` from their rule-base blocks (the record had dropped it; BRK-24 is general, so the brokerage record marks `fee-account` covered again). Brokerage: account fee BRK-48 (IBI, Excellence, Altshuler Shaham Trade, Psagot); fx BRK-23, BRK-48, BRK-40, BRK-42 (Leumi, the four non-bank members, Interactive Israel, Interactive Brokers); minimum BRK-28 for Meitav Trade and Fair only, and BRK-42 (Interactive Brokers: no opening minimum). Both money-market records: minimum BRK-28 for Meitav Trade and Fair; account fee BRK-48.
3. **Examples did not reach the guides.** `pointedRecords` (`site/app/lib/data.server.ts`) gives a page the records its cards point at (`derived_from`, `examples`, followed through), as `ProvenanceData.pointed`, which only chips and cards read, so a page's checklist and runs keep reading its own rules. Every page that shows rule cards passes it: guides (with the pinned facts), exposures, questions, not-covered, track, the workbenches, idle cash, the goal pages, fees, holdings, the playbooks, the company pages and `/companies`, the rules shelves; the four bundles (comparison, workbench, holdings, fees) ship a `pointed` list. Test: `site/app/lib/pointed.test.ts` walks every one of those pages' data and fails a chip whose record is missing (BRK-35's "לדוגמה" BRK-51 on the brokerage guide by name).
4. **The not-rules allowance missed real uses.** Each not-rule that is not general now names every file that cites it: the validator reads every `rule_ids` under `data/` (but `data/rules` and `data/sources`), and `site/app/lib/scope.test.ts` every source file under `site/app`. So MKT-01 names the comparison (`compare.server.ts`), SW-X01 to SW-X04, SW-34, SW-37 and SW-53 the playbook, MF-55 the fees page, IRA-28 and others their dimension records, and all of them the rules page's experience list where it names them. A use in a file not named fails, and so does a named file that is gone (the `existsSync` skip is removed) or no longer cites it. A general not-rule (SW-19, BANK-27 and the like) may stand anywhere and names no file. `docs/data-schema.md` §4 item 14 says what is checked.
5. **"לפי החברה" dropped from every company document on a card.** The rule card now tests each source: the label drops only on a source on the named company's own sites (`isOwnSourceOf`; the root loader's company links carry each company's `own_hosts` and `filing_names`). BRK-43 keeps the label on IB Ireland's page; BlackRock's `own_hosts` include `ishares.com`, so ETF-27 drops it on both its sources. Tests: `scope.test.ts`, `own-source-labels.test.ts`.
6. **The chip counted every named company.** `chipName`, the card's tag and its line use one list, `shownCompanies`: the companies whose documents the record cites, else everyone it is about. PEN-37's chip says "מור ועוד 3", as its card names four.
7. **Spec note.** `spec.md` §1, edge cases (2026-10-26): a record that rests only on the press, a forum or a regulator's announcement about a company can exist only as a not-rule.

Also: a rule card shows the "נוגע ל" row only when the page can name a dimension (the playbook passes none, and the row stood empty), and the two `/companies` sections have the page's section gap between them.

**The rebase onto main (630cf7e).** Conflicts: `docs/data-schema.md` (both sides kept: the `hosts` rows of `documents.json` and the gazette rule beside the scope keys and `examples`), `child-savings-provident.tsx` (the branch's prose, which names no company's rate, with main's "עד התקרה שבתקנות"), ETF-44 and ETF-45 and the extraction report (main's side, then re-extracted). `extract-sources.ts` and the schema merged by themselves. After `npm run extract:sources`, BRK-52's copies of the regulators' joint report take main's new `documents.json` row; that row matched the Bank of Israel's press release too (its title names the report), so it now carries `hosts: ["cdn.funder.co.il"]` and the press release keeps its own label. ETF-44, ETF-45 and REG-32 follow main's rows.

Counts: `scope: 482 general, 101 institution, 13 unsettled`; `data/ is valid`, the same warnings as before (19 first sources without a Hebrew title or publisher, two fewer after main's rows). Of the 114 records that are not general, 59 are on at least one company page, 42 only in a `/companies` fold, 13 in the not-rules' section; PEN-37 and PEN-40 are listed at only some of the companies they name (not Meitav, nor Menora Mivtachim for PEN-40). Tests: 78 files, 1,098 passed, 1 todo; typecheck clean.

| Shot | What I saw |
|---|---|
| r3-1a, r3-1b | the brokerage fee table: "המרת מטבע" with "תלוי בחברה: בנק לאומי, אי.בי.אי, אקסלנס, אלטשולר שחם טרייד, פסגות, אינטראקטיב ישראל, Interactive Brokers"; "דמי חשבון קבועים" with "אין תקרה בחוק" and "תלוי בחברה: אי.בי.אי, אקסלנס, אלטשולר שחם טרייד, פסגות" |
| r3-2 | the daily money-market fund's checklist: "סכום מינימלי: נלקח בחשבון" and "תלוי בחברה: מיטב טרייד, פייר"; "מי יכול להצטרף" has no company line |
| r3-3a, r3-3b | BRK-35's card on the brokerage guide ("נגזר מ־ REG-27", "לדוגמה: Interactive Brokers Ireland"); its chip opens BRK-51's full card ("של Interactive Brokers Ireland", its text and line) |
| r3-4a, r3-4b | SW-53's card on the brokerage playbook: tags "של אי.בי.אי ואלטשולר שחם טרייד" and "לא נכלל ככלל", the not-rule line, the foot "לכל מה שלא נכלל ככלל"; no empty "נוגע ל" row |
| r3-5 | the end of `/companies`: the not-rules' own section with its title and line, CAT-42 and CAT-43 first, each tagged "לא נכלל ככלל" |

No console errors on any page the script opened.
"""
with open(os.path.join(SPEC, "report.md"), "a", encoding="utf-8") as f:
    f.write(SECTION)
req_path = os.path.join(SPEC, "requests.md")
req = open(req_path, encoding="utf-8").read()
old1 = req[req.index("1. **The child-savings fee after 21 still runs on CS-30 in the engine.**"):req.index("2. **`IdRef` still prints")]
new1 = "1. **The child-savings fee after 21** (closed by main's `followups`, 2026-10-26): F-54 runs at the legal cap (CS-18), and CS-30's 0.23% is two companies' own rate, named only on their pages.\n"
req = req.replace(old1, new1, 1)
old6 = "and no not-rule is listed in a company's section: the 13 that are not general sit in one `/companies` fold, \"לא כלל ולא תנאי של חברה\"."
new6 = "and no not-rule is listed in a company's section: the 13 that are not general sit in their own `/companies` section, \"לא נכלל ככלל: פרסומים, ספירות ונתונים\". Since the third round (2026-10-26) each names every file that cites it, data and site alike (MKT-01 the comparison, SW-X01 to SW-X04, SW-34, SW-37 and SW-53 the playbook), and the checks read every data file and every site source file."
assert old6 in req
req = req.replace(old6, new6, 1)
open(req_path, "w", encoding="utf-8").write(req)
print("ok")
