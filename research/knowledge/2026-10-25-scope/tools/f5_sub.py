#!/usr/bin/env python3
"""f5_sub.py: exact, single-occurrence replacements in rule-base files (fork F5, settling pass 2026-10-26).

Use from Python:  from f5_sub import sub, scope, block, replace_block
  sub(file, old, new)          replace one exact occurrence (fails on 0 or >1)
  scope(file, ID, line)        add '- Scope: <line>' after the Source line (and its continuation lines) of ID; fails if present
  block(file, ID)              the text of ID's block
  replace_block(file, ID, new) replace ID's whole block (heading to the line before the next ### or ##)
"""
import os, re

REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"


def _p(f):
    return f if f.startswith("/") else os.path.join(REFS, f)


def _rd(f):
    return open(_p(f), encoding="utf8").read()


def _wr(f, t):
    open(_p(f), "w", encoding="utf8").write(t)


def sub(f, old, new):
    t = _rd(f)
    n = t.count(old)
    if n != 1:
        raise SystemExit("%s: %d occurrences of %r" % (f, n, old[:80]))
    _wr(f, t.replace(old, new))


def _span(t, rid):
    m = re.search(r"^### %s\b[^\n]*\n" % re.escape(rid), t, re.M)
    if not m:
        raise SystemExit("no block " + rid)
    n = re.search(r"^(### |## )", t[m.end():], re.M)
    end = m.end() + n.start() if n else len(t)
    return m.start(), end


def block(f, rid):
    t = _rd(f)
    s, e = _span(t, rid)
    return t[s:e]


def replace_block(f, rid, new):
    t = _rd(f)
    s, e = _span(t, rid)
    if not new.endswith("\n\n"):
        new = new.rstrip("\n") + "\n\n"
    _wr(f, t[:s] + new + t[e:])


def scope(f, rid, line):
    t = _rd(f)
    s, e = _span(t, rid)
    b = t[s:e]
    if re.search(r"^- Scope:", b, re.M):
        raise SystemExit("%s already has a Scope line" % rid)
    lines = b.split("\n")
    i = next((k for k, l in enumerate(lines) if re.match(r"^- Sources?:", l)), None)
    if i is None:
        raise SystemExit("%s has no Source line" % rid)
    j = i + 1
    while j < len(lines) and lines[j].strip() and not lines[j].strip().startswith("- "):
        j += 1
    lines.insert(j, "- Scope: " + line)
    _wr(f, t[:s] + "\n".join(lines) + t[e:])
