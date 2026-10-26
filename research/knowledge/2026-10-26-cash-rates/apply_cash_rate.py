"""Set P-05 cash_rate to the Bank of Israel's policy rate (founder 2026-10-26: quote it), and record the D20 amendment.
usage: python3 -I apply_cash_rate.py (from the repo root)"""
import json, sys
from pathlib import Path

def edit(path, pairs):
    p = Path(path); t = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if t.count(old) != 1:
            sys.exit(f"{path}: expected one match: {old[:90]!r}")
        t = t.replace(old, new)
    p.write_text(t, encoding="utf-8")

p = Path("data/parameters/illustrative-scenario.json")
raw = p.read_text(encoding="utf-8")
indent = 1 if raw.startswith("{\n \"") else 2
d = json.loads(raw)
d["inputs"]["cash_rate"] = {
    "value": 3.25,
    "unit": "pct_per_year",
    "state": "sourced",
    "source": {
        "url": "https://www.boi.org.il/publications/pressreleases/21-10-26b/",
        "title": "בנק ישראל, הודעה לעיתונות 21.10.2026: הוועדה המוניטרית החליטה להותיר את הריבית ללא שינוי ברמה של 3.25%",
        "publisher": "Bank of Israel",
        "strength": "primary",
    },
    "checked": "2026-10-26",
    "effective_from": None,
    "effective_to": None,
    "update_rule": "market",
    "notes": "The Bank of Israel's policy rate, quoted as one published figure (D20 as amended 2026-10-26, D22). The site's assumption for cash-like options with no published rate of their own (money-market fund, makam, government bond); a daily money-market fund tracks it less its costs (MF-34). The bank deposit and the current account run on their banks' published rates. Next decision 23.11.2026 (the press release's last line); recheck then.",
    "rationale_he": "ריבית בנק ישראל, כפי שבנק ישראל פרסם בהחלטת הריבית מ־21.10.2026. זו ההנחה של האתר לקרן כספית, למק״מ ולאג״ח ממשלתית, שאין להם ריבית מפורסמת משלהם; קרן כספית יומית נעה לפי ריבית בנק ישראל בניכוי העלויות שלה. פיקדון בבנק ועו״ש מחושבים לפי הריבית שהבנק פרסם. אפשר להזין ריבית אחרת.",
}
p.write_text(json.dumps(d, ensure_ascii=False, indent=indent) + "\n", encoding="utf-8")

edit("docs/product.md", [(
    "If that changes and consent is granted, the series join the refresh (section 6) and this row is dated closed. |",
    "If that changes and consent is granted, the series join the refresh (section 6) and this row is dated closed. **Amended 2026-10-26 (founder, \"change it and quote it\"):** the policy rate itself is one figure in a press release, so it is quoted with its source and date under D22's line for a single published figure; it is the guides' cash-like rate (P-05 `cash_rate`) for money-market funds, makam and government bonds, in place of the round 3.5%. The per-bank deposit averages and the makam and bond series stay links. |",
)])
edit("docs/parameters-rationale.md", [(
    "**Reader text and the per-number lines (2026-10-25):**",
    "**Cash-like rate, changed 2026-10-26 (founder):** `cash_rate` is now the Bank of Israel's policy rate, 3.25%, quoted from its press release of 21.10.2026 (D20 as amended that day), in place of the round 3.5%. Every current figure read that day was below 3.5%: makam about 3.0% to 3.2% gross, renewing money-market funds' expected net yields 2.75% to 2.81% (`research/knowledge/2026-10-26-cash-rates/report.md`). Each product's own figure (a renewing fund's expected yield, a makam series' yield) is the next step; it needs a schema field and a method change. Recheck at each rate decision (next 23.11.2026).\n\n**Reader text and the per-number lines (2026-10-25):**",
)])
print("cash rate applied")
