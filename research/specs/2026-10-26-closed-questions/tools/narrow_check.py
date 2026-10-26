import json, re
t = json.load(open("research/knowledge/2026-10-26-open-questions/table-after.json"))
m = json.load(open("research/knowledge/2026-10-26-open-questions/merged.json"))
agree = dis = 0
bad = []
for it in t["items"]:
    if it["struck"]:
        continue
    h = bool(re.search(r"\b[Nn]arrowed\b", it["text"]))
    c = m[it["code"]]["class_after"] == "narrowed"
    if h == c: agree += 1
    else:
        dis += 1; bad.append((it["code"], h, c))
print(agree, dis); print(bad[:40])
