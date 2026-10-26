"""Docs that said the unlinked-bond row waits for GOV OQ4: GOV-13 now gives the yearly coupon (2026-10-26)."""
import pathlib, json
W = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite')
def edit(rel, pairs):
    p = W / rel; s = p.read_text()
    for old, new in pairs:
        assert s.count(old) == 1, (rel, s.count(old), old[:90]); s = s.replace(old, new)
    if rel.endswith('.json'): json.loads(s)
    p.write_text(s); print('edited', rel)

edit('docs/method.md', [
    ("for a row that cannot run yet the open question or the missing record that stops it (the unlinked government bond: GOV OQ4; the TA-125",
     "for a row that cannot run yet the open question or the missing record that stops it (the unlinked government bond: not run, since the engine has no fixed-rate unlinked series yet; changed 2026-10-26 (closed-questions review): it waited for GOV OQ4, and GOV-13 now gives the yearly coupon; the TA-125"),
])
edit('docs/parameters-rationale.md', [
    ("the unlinked government bond in the same product but **not evaluated** until the coupon frequency of a fixed-rate series is in the rule base (GOV OQ4);",
     "the unlinked government bond in the same product but **not evaluated**: the engine does not run a fixed-rate unlinked series yet (changed 2026-10-26: it said the row waits for the coupon frequency, GOV OQ4; GOV-13 now gives a yearly coupon, so evaluating it is the lead's call);"),
])
edit('docs/glossary.md', [
    ("| **תדירות הקופון של אג״ח ממשלתית שקלית** | opened by the release 5 screens: the exposure comparison's unlinked government bond row (P-08) cannot run because the regulations for the fixed-rate shekel series were not found (GOV OQ4: face value, coupon frequency, record date).",
     "| **תדירות הקופון של אג״ח ממשלתית שקלית** | closed 2026-10-26: GOV-13 gives face value, a yearly coupon and the record date from the 2006 \"אג״ח ממשלתית\" regulations, the type today's fixed-rate series belong to (GOV OQ4 narrowed to the old \"שחר\" text); the row still reads \"לא נבדקה\", now because the engine does not run the series. Before: opened by the release 5 screens: the exposure comparison's unlinked government bond row (P-08) cannot run because the regulations for the fixed-rate shekel series were not found (GOV OQ4: face value, coupon frequency, record date)."),
    ("| **תדירות הקופון של אג״ח ממשלתית שקלית** | the regulations for the fixed-rate shekel series (face value, coupon frequency, record date) were not found (GOV OQ4),",
     "| **תדירות הקופון של אג״ח ממשלתית שקלית** | closed 2026-10-26 (GOV-13, yearly coupon; see above). Before: the regulations for the fixed-rate shekel series (face value, coupon frequency, record date) were not found (GOV OQ4),"),
])
edit('data/parameters/exposure-holding-wrapper.json', [
    ("The unlinked government bond is not evaluated yet (open question GOV OQ4).",
     "The unlinked government bond is not evaluated yet: the engine does not run a fixed-rate unlinked series (its yearly coupon is GOV-13)."),
])
edit('site/app/lib/exposure-mode.test.ts', [
    ('it("does not evaluate the unlinked bond (P-08, GOV OQ4) and makam without a yield"', 'it("does not evaluate the unlinked bond (P-08) and makam without a yield"'),
])
