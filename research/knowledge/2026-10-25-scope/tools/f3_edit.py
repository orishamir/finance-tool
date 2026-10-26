#!/usr/bin/env python3
"""f3_edit.py: apply exact, unique string replacements to rule-base files (fork F3, settling pass 2026-10-26).

  python3 f3_edit.py EDITS.json      EDITS = [{"file": "brokerage-account.md", "old": "...", "new": "..."}, ...]

Each `old` must occur exactly once in its file (else nothing is written for that file and the run stops).
`file` is a basename under .claude/skills/il-finance/references/.
"""
import json, os, sys

REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"


def main():
    edits = json.load(open(sys.argv[1], encoding="utf8"))
    by_file = {}
    for e in edits:
        by_file.setdefault(e["file"], []).append(e)
    for f, es in by_file.items():
        p = os.path.join(REFS, f)
        text = open(p, encoding="utf8").read()
        for e in es:
            n = text.count(e["old"])
            if n != 1:
                sys.exit("%s: old string found %d times: %r" % (f, n, e["old"][:120]))
            text = text.replace(e["old"], e["new"])
        open(p, "w", encoding="utf8").write(text)
        print("edited", f, len(es))


if __name__ == "__main__":
    main()
