"""P-08's unlinked-bond row: the coupon frequency is in the rule base (GOV-13), so the row no longer says it waits for GOV OQ4."""
import pathlib, json
p = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/data/parameters/exposure-holding-wrapper.json')
s = p.read_text()
pairs = [
    ('"notes": "chosen by Claude at the founder\'s request, 2026-10-24, revisable; not evaluated until the coupon frequency of a fixed-rate series is in the rule base (GOV OQ4)",',
     '"notes": "chosen by Claude at the founder\'s request, 2026-10-24, revisable; not evaluated: the engine does not run a fixed-rate unlinked series yet. Its coupon frequency, yearly, is now in the rule base (GOV-13; GOV OQ4 narrowed to the old שחר text, 2026-10-26), so whether to evaluate the row is the lead\'s call",'),
    ('"rationale_he": "אג״ח ממשלתית לא צמודה מוחזקת באותו מוצר, אבל האתר עוד לא מחשב אותה: תדירות הקופון של סדרה כזו עוד לא במאגר הכללים (שאלה פתוחה GOV OQ4)."',
     '"rationale_he": "אג״ח ממשלתית לא צמודה מוחזקת באותו מוצר, אבל האתר עוד לא מחשב אותה."'),
    ('"status": "not-evaluated",\n      "blocked_by": "GOV-OQ4",\n      "reason_he": "לא נבדקה: תדירות הקופון של סדרה לא צמודה עוד לא במאגר הכללים (GOV OQ4)."',
     '"status": "not-evaluated",\n      "reason_he": "לא נבדקה: האתר עוד לא מחשב אג״ח ממשלתית לא צמודה בריבית קבועה."'),
]
for old, new in pairs:
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, new)
json.loads(s)
p.write_text(s)
print('edited P-08')
