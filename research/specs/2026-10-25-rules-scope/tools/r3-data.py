# Review 3 data edits: BRK-48 and BRK-24 take fee-account from their rule-base blocks; the brokerage and money-market company_terms
# name only the companies each record states the property for; BlackRock's own sites include ishares.com (the registry generator).
import json, re
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
def edit_json(path, fn):
    p = root + path
    text = open(p, encoding="utf-8").read()
    d = json.loads(text)
    fn(d)
    open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
def add_dim(d):
    if "fee-account" not in d["dimensions"]:
        i = d["dimensions"].index("fee-fx") + 1
        d["dimensions"].insert(i, "fee-account")
# rule records are written by hand plus the extraction's keys at the end: edit the dimensions list in place to keep the layout
for rid in ["brk-48", "brk-24"]:
    p = root + f"data/rules/{rid}.json"
    text = open(p, encoding="utf-8").read()
    if '"fee-account"' not in text.split('"dimensions"', 1)[1].split("]", 1)[0]:
        text = re.sub(r'("dimensions": \[[^\]]*?"fee-fx")', r'\1,\n    "fee-account"', text, count=1)
        open(p, "w", encoding="utf-8").write(text)
    assert "fee-account" in json.load(open(p))["dimensions"], rid
BRK28_MIN = {"rule": "BRK-28", "companies": ["meitav-trade", "fair"]}
def brokerage(d):
    d["company_terms"] = {"minimum": [BRK28_MIN, "BRK-42"], "fee-account": ["BRK-48"], "fee-fx": ["BRK-23", "BRK-48", "BRK-40", "BRK-42"]}
def mmf(d):
    d["company_terms"] = {"minimum": [BRK28_MIN], "fee-account": ["BRK-48"]}
for w, fn in [("brokerage-account", brokerage), ("money-market-fund-daily", mmf), ("money-market-fund-renewable", mmf)]:
    edit_json(f"data/instruments/wrappers/{w}.json", fn)
reg = root + "research/specs/2026-10-25-rules-scope/tools/make-registry.py"
s = open(reg, encoding="utf-8").read()
s = s.replace('"blackrock": ["blackrock.com"]', '"blackrock": ["blackrock.com", "ishares.com"]')
open(reg, "w", encoding="utf-8").write(s)
print("ok")
