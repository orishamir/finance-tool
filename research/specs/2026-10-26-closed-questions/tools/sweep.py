"""Every closed open-question code (data/open-questions.json) named in site/app, data/ (but the file itself) and docs/method.md."""
import json, re, glob, sys
closed = {q["id"]: q.get("closed_on") for q in json.load(open("data/open-questions.json")) if q["status"] == "closed"}
pat = re.compile(r"\b([A-Z]{2,4}[0-9]?)[ -]OQ ?(\d+)((?:,? ?(?:and )?OQ ?\d+)*)")
files = [f for f in glob.glob("site/app/**/*.ts*", recursive=True)] + glob.glob("data/**/*.json", recursive=True) + ["docs/method.md"]
hits = {}
for f in files:
    if f.endswith("data/open-questions.json"): continue
    for i, line in enumerate(open(f, encoding="utf8"), 1):
        for m in pat.finditer(line):
            codes = [f"{m.group(1)} OQ{m.group(2)}"] + [f"{m.group(1)} OQ{n}" for n in re.findall(r"OQ ?(\d+)", m.group(3) or "")]
            for c in codes:
                if c in closed:
                    hits.setdefault(f, []).append((i, c))
only = sys.argv[1] if len(sys.argv) > 1 else ""
for f in sorted(hits):
    if only and only not in f: continue
    print(f, sorted(set(hits[f]))[:40])
print(len(hits), "files")
