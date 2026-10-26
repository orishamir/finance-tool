# Review 2 data fixes: the brokerage record's general fee rows (BRK-24), the money-market records' eligibility (BRK-01), the
# company_terms of eligibility moved to minimum (eligibility is general; the account minimum is each distributor's own), BRK-51's
# excess-cover note and figure name, BRK-52's last sentence (the joint report's "קיים פטור גורף", p.11).
import json
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
def load(p): return json.load(open(root + p, encoding="utf-8"))
def save(p, d): open(root + p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")

brk24 = load("data/rules/brk-24.json")
s0 = brk24["sources"][0]
tase_rules = {
    "url": s0["url"],
    "title": f'{s0["title_he"]}, {s0["locator_he"]}',
    "publisher": s0["publisher"],
    "strength": s0["strength"],
}
assert s0["strength"] == "primary" and brk24["scope"] == "general"
common = {"checked": s0["checked"], "effective_from": None, "effective_to": None, "tax_year": None, "update_rule": "provider-set"}
p = "data/instruments/wrappers/brokerage-account.json"
w = load(p)
caps = w["fee_caps"]
assert "fixed_period" not in caps and "distribution_handling" not in caps
fixed = {"value": None, "unit": "nis_per_month", "source": tase_rules, **common, "rule_ids": ["BRK-24", "BRK-16"], "state": "sourced",
         "notes": "No cap in law or in the exchange rules: every member reports its fees to TASE and states them in the client agreement, and no rule makes a published tariff a ceiling (BRK-24). A bank may charge only for services in the Governor's full tariff, or added with the Supervisor's approval (BRK-16, BANK-16). Whether a member charges a monthly account fee, and how much, is its own tariff (BRK-48, BRK-28, on the companies' pages)."}
dist = {"value": None, "unit": "pct", "source": tase_rules, **common, "rule_ids": ["BRK-24"], "state": "sourced",
        "notes": "No cap in law or in the exchange rules: every member reports its fees to TASE and states them in the client agreement, and no rule makes a published tariff a ceiling (BRK-24). Whether a member charges on interest, dividend and redemption payments is its own tariff (BRK-48, on the companies' pages)."}
new_caps = {}
for k, v in caps.items():
    new_caps[k] = v
    if k == "fx":
        new_caps["fixed_period"] = fixed
        new_caps["distribution_handling"] = dist
w["fee_caps"] = new_caps
assert list(new_caps) == ["trade", "custody", "fx", "fixed_period", "distribution_handling", "transfer_out"], list(new_caps)
ct = w["company_terms"]
w["company_terms"] = {k: v for k, v in ct.items() if k != "eligibility"}
save(p, w)

for f in ["money-market-fund-daily", "money-market-fund-renewable"]:
    p = f"data/instruments/wrappers/{f}.json"
    w = load(p)
    ids = w["eligibility"]["rule_ids"]
    assert "BRK-01" not in ids
    w["eligibility"]["rule_ids"] = ["BRK-01"] + ids
    dims = w["dimensions"]
    dims["eligibility"] = "covered"
    w["dimensions"] = dict(sorted(dims.items()))
    ct = w["company_terms"]
    assert ct.get("eligibility") == ["BRK-28"]
    w["company_terms"] = {"minimum": ["BRK-28"], **{k: v for k, v in ct.items() if k != "eligibility"}}
    save(p, w)

p = "data/rules/brk-51.json"
r = load(p)
ex = r["figures"]["excess_cap"]
assert "per client" in ex["notes"]
ex["notes"] = "IB's excess Lloyd's policy as IB Ireland states it: up to USD 30 million (cash USD 900,000, aggregate USD 150 million)."
assert r["figure_names_he"]["excess_cap"] == "תקרת הביטוח העודף ללקוח"
r["figure_names_he"]["excess_cap"] = "תקרת הביטוח העודף"
save(p, r)

p = "data/rules/brk-52.json"
r = load(p)
old = "הדוח לא מחייב איש; לפי מה שהוא מתאר, בפועל לקוחות של בתי השקעות כאלה פטורים בדרך כלל מדמי משמרת."
assert r["text_he"].endswith(old)
r["text_he"] = r["text_he"][: -len(old)] + "הדוח לא מחייב איש; לפי התיאור שלו, בפועל קיים פטור גורף מדמי משמרת ללקוחות של חברי בורסה שאינם בנקים."
save(p, r)
print("done")
