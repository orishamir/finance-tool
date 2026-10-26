"""r2 (2026-10-26): copy, the P-08 reason, the ladder's payout gap, and comments that named closed questions."""
import pathlib, json
W = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite')

def edit(rel, pairs):
    p = W / rel
    s = p.read_text()
    for old, new in pairs:
        assert s.count(old) == 1, (rel, s.count(old), old[:100])
        s = s.replace(old, new)
    p.write_text(s)
    print('edited', rel)

# P-08: the coupon frequency is in the rule base (GOV-13, yearly); the row is still not run, which is the site's own state
edit('site/app/copy.ts', [
    ('p08: { gov: "לא נבדקה: תדירות הקופון של סדרה לא צמודה עוד לא במאגר החוקים והכללים. שאלה פתוחה GOV OQ4", fund:',
     'p08: { gov: "לא נבדקה: האתר עוד לא מחשב אג״ח ממשלתית לא צמודה בריבית קבועה.", govCoupon: "לפי התקנות של הסוג הזה, הקופון משולם פעם בשנה", fund:'),
    # MF OQ4 closed: the ladder no longer shows a payout-days gap
    ('      mmfPayoutDays: "כמה ימי עסקים עוברים מהוראת הפדיון עד שהכסף בחשבון עוד לא ידוע (שאלה פתוחה MF-OQ4).",\n', ''),
])
edit('site/app/components/exposure-mode/reason.tsx', [
    ('import { IdText } from "../provenance";', 'import { RuleRef } from "../provenance";'),
    ('        return <span key={i} className="block"><IdText text={r5.exposure.p08.gov} /></span>;',
     '        return (\n          <span key={i} className="block">\n            {r5.exposure.p08.gov} {r5.exposure.p08.govCoupon} <RuleRef id="GOV-13" />.\n          </span>\n        );'),
])
edit('site/app/components/guide-signature/money-market-daily.tsx', [
    ('import { Gap, type VisualProps } from "./kit";', 'import type { VisualProps } from "./kit";'),
    ('      <Gap id="mmfPayoutDays" />\n', ''),
])
edit('site/app/lib/guide-signature.server.ts', [
    ('  // MF OQ4: how many business days after the order the money is usable was not found; MF-35: the renewable fund\'s dates are chosen when buying\n  d.gaps.push("mmfPayoutDays");\n',
     '  // MF-11 (prices regulations reg. 15): when redemption money reaches the account, stated in the guide\'s prose (MF OQ4 closed 2026-10-26); MF-35: the renewable fund\'s dates are chosen when buying\n'),
])
edit('site/app/lib/guide.server.ts', [
    ('do not block the run (TXI-OQ2, TXI-OQ14, TXI-OQ3), others are not tax questions (BANK-OQ8, MF-OQ4), so the card shows them in a neutral tag.',
     'do not block the run (TXI-OQ14, TXI-OQ3), others are not tax questions (BANK-OQ8, MF-OQ3), so the card shows them in a neutral tag.'),
])

# docs/copy.md rows
edit('docs/copy.md', [
    ('| `r5.exposure.p08.gov` | לא נבדקה: תדירות הקופון של סדרה לא צמודה עוד לא במאגר הכללים. שאלה פתוחה GOV OQ4 | the unlinked government bond row of P-08. Was "…במאגר הכללים (GOV OQ4).": a code is never in brackets at the end of a sentence (section 1) |',
     '| `r5.exposure.p08.gov` | לא נבדקה: האתר עוד לא מחשב אג״ח ממשלתית לא צמודה בריבית קבועה. | the unlinked government bond row of P-08. Changed 2026-10-26 (closed-questions review): it said the coupon frequency was not in the rule base (GOV OQ4), but GOV-13 gives a yearly coupon and GOV OQ4 now asks only for the old "שחר" text |\n'
     '| `r5.exposure.p08.govCoupon` | לפי התקנות של הסוג הזה, הקופון משולם פעם בשנה | follows `p08.gov` in the row\'s reason, with the GOV-13 chip (2026-10-26) |'),
])
