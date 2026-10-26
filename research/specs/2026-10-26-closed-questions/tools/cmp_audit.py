import json
d = json.load(open("data/open-questions.json"))
m = json.load(open("research/knowledge/2026-10-26-open-questions/merged.json"))
bad = []
for q in d:
    a = m[q["id"]]
    cls = "closed" if a["class_after"] == "closed-marked" else a["class_after"]
    if cls != q["status"] or (q["status"] == "closed" and a["closed_date"] != q.get("closed_on")):
        bad.append((q["id"], q["status"], q.get("closed_on"), a["class_after"], a["closed_date"]))
print(len(d), "mismatches:", bad)
