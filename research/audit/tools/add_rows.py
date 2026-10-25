#!/usr/bin/env python3
"""Apply request files (research/audit/2026-10-25-source-check/requests/*.json) to data/sources/documents.json and
publishers.json, one row per line as those files are written. Skips a document id or host that exists. Lead only."""
import glob, json, sys
docs_p, pubs_p = "data/sources/documents.json", "data/sources/publishers.json"
docs = json.load(open(docs_p)); pubs = json.load(open(pubs_p))
ids = {d["id"] for d in docs}; added = []
files = sys.argv[1:] or sorted(glob.glob("research/audit/2026-10-25-source-check/requests/*.json"))
for f in files:
    for r in json.load(open(f)):
        if r["file"] == "documents.json":
            row = r["row"]
            if row["id"] in ids: continue
            docs.append(row); ids.add(row["id"]); added.append(f"doc {row['id']}")
        elif r["file"] == "publishers.json":
            if r["host"] in pubs: continue
            pubs[r["host"]] = r["row"]; added.append(f"pub {r['host']}")
open(docs_p, "w").write("[\n" + ",\n".join("  " + json.dumps(d, ensure_ascii=False, separators=(",", ":")) for d in docs) + "\n]\n")
open(pubs_p, "w").write("{\n" + ",\n".join(f"  {json.dumps(h, ensure_ascii=False)}: " + json.dumps(v, ensure_ascii=False, separators=(", ", ": ")).replace("{", "{ ", 1)[:-1] + " }" for h, v in pubs.items()) + "\n}\n")
print("added", len(added), added)
