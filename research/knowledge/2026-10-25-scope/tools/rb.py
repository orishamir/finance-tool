#!/usr/bin/env python3
"""rb.py: read the rule base blocks (settling pass, 2026-10-26).

  python3 rb.py show ID [ID ...]      print each record's markdown block with its file and line
  python3 rb.py inv                   inventory: one row per review.json record (file, Scope line, review verdict, issues)
  python3 rb.py counts                scope counts over the data/rules records, from the Scope lines
  python3 rb.py noscope               data/rules records with no Scope line
  python3 rb.py ids PREFIX            the ids of a prefix in the rule base, in order, and the next free number
"""
import glob, json, os, re, sys

REPO = "/home/ori/dev/finance-tool"
REFS = os.path.join(REPO, ".claude/skills/il-finance/references")
HERE = os.path.dirname(os.path.abspath(__file__))
BLOCK_RE = re.compile(r"^### ([A-Z0-9]+(?:-[A-Z0-9]+)+)\b[^\n]*\n([\s\S]*?)(?=^### |^## |\Z)", re.M)


def blocks():
    out = {}
    for path in sorted(glob.glob(os.path.join(REFS, "*.md"))):
        text = open(path, encoding="utf8").read()
        for m in BLOCK_RE.finditer(text):
            line = text.count("\n", 0, m.start()) + 1
            out.setdefault(m.group(1), {"file": os.path.basename(path), "line": line, "text": m.group(0)})
    return out


def scope_of(block_text):
    m = re.search(r"^- Scope:\s*(.*)$", block_text, re.M)
    return m.group(1).strip() if m else None


def kind_of(scope_line):
    if scope_line is None:
        return None
    return scope_line.split(":")[0].strip()


def data_ids():
    return sorted(json.load(open(f))["id"] for f in glob.glob(os.path.join(REPO, "data/rules/*.json")))


def main():
    cmd = sys.argv[1]
    b = blocks()
    if cmd == "show":
        for i in sys.argv[2:]:
            r = b.get(i.upper())
            if not r:
                print("== %s: not in the rule base" % i)
                continue
            print("== %s  (%s:%d)" % (i.upper(), r["file"], r["line"]))
            print(r["text"].rstrip())
            print()
    elif cmd == "inv":
        rev = json.load(open(os.path.join(HERE, "..", "review.json")))
        for r in rev:
            blk = b.get(r["id"])
            sl = scope_of(blk["text"]) if blk else None
            print("\t".join([r["id"], blk["file"] if blk else "-", sl or "-", r["scope"], ", ".join(x["name"] if isinstance(x, dict) else x for x in (r.get("institutions") or [])),
                             "split" if r.get("split") else "", "issue" if r.get("text_issue") else ""]))
    elif cmd == "counts":
        ids = data_ids()
        c = {}
        for i in ids:
            k = kind_of(scope_of(b[i]["text"])) if i in b else "missing-block"
            c[k or "none"] = c.get(k or "none", 0) + 1
        print("data/rules records:", len(ids), c)
        c2 = {}
        for i, r in b.items():
            k = kind_of(scope_of(r["text"]))
            c2[k or "none"] = c2.get(k or "none", 0) + 1
        print("all rule base blocks:", len(b), c2)
    elif cmd == "noscope":
        for i in data_ids():
            if i in b and not scope_of(b[i]["text"]):
                print(i, b[i]["file"])
    elif cmd == "ids":
        pre = sys.argv[2]
        nums = sorted(int(re.match(r"%s-(\d+)" % pre, i).group(1)) for i in b if re.match(r"%s-\d+$" % pre, i))
        print(pre, nums, "next free:", "%s-%02d" % (pre, max(nums) + 1))


if __name__ == "__main__":
    main()
