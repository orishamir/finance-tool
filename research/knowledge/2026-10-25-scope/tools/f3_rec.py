#!/usr/bin/env python3
"""f3_rec.py: set whole field lines of one rule record in the rule base (fork F3, settling pass 2026-10-26).

  from f3_rec import setf, insert_after, heading
  setf("brokerage-account.md", "BRK-01", "Source", "- Source: ...")     replace the record's `- Source:` line (adds it if missing)
  setf(..., "Scope", "- Scope: general")                                 a missing Scope line goes directly after Source
  heading(file, ID, "### BRK-01 new title")                               replace the heading line
  insert_after(file, ID, block_text)                                      insert a new block after the record (a blank line between)

Fields: Rule, Conditions (the `- Conditions / exceptions:` line), Figures, Source, Scope, Dimensions, Likely.
A field line ends at the next line that starts with "- " or "**[" or a blank line; continuation lines are replaced too.
"""
import os, re

REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references"
PREFIX = {"Rule": "- Rule:", "Conditions": "- Conditions / exceptions:", "Figures": "- Figures:", "Source": "- Source:",
          "Scope": "- Scope:", "Dimensions": "- Dimensions:", "Likely": "- Likely to change:"}


def _load(f):
    return open(os.path.join(REFS, f), encoding="utf8").read()


def _save(f, t):
    open(os.path.join(REFS, f), "w", encoding="utf8").write(t)


def _span(text, rid):
    m = re.search(r"^### %s\b[^\n]*\n" % re.escape(rid), text, re.M)
    if not m:
        raise SystemExit("no block %s" % rid)
    n = re.compile(r"^(### |## )", re.M).search(text, m.end())
    return m.start(), (n.start() if n else len(text))


def _field_range(lines, prefix):
    for i, l in enumerate(lines):
        if l.startswith(prefix):
            j = i + 1
            while j < len(lines) and lines[j].strip() and not lines[j].startswith("- ") and not lines[j].startswith("**[") and not lines[j].startswith("#"):
                j += 1
            return i, j
    return None


def setf(f, rid, field, new_line):
    text = _load(f)
    a, b = _span(text, rid)
    block = text[a:b]
    lines = block.split("\n")
    prefix = PREFIX[field]
    if not new_line.startswith(prefix):
        raise SystemExit("%s %s: new line must start with %r" % (rid, field, prefix))
    r = _field_range(lines, prefix)
    if r:
        lines[r[0]:r[1]] = [new_line]
    else:
        after = {"Scope": "Source", "Figures": "Conditions", "Conditions": "Rule"}.get(field)
        ra = _field_range(lines, PREFIX[after]) if after else None
        if not ra:
            raise SystemExit("%s: no %s line to insert %s after" % (rid, after, field))
        lines[ra[1]:ra[1]] = [new_line]
    _save(f, text[:a] + "\n".join(lines) + text[b:])


def getf(f, rid, field):
    text = _load(f)
    a, b = _span(text, rid)
    lines = text[a:b].split("\n")
    r = _field_range(lines, PREFIX[field])
    return "\n".join(lines[r[0]:r[1]]) if r else None


def heading(f, rid, new_heading):
    text = _load(f)
    a, b = _span(text, rid)
    end = text.index("\n", a)
    if not new_heading.startswith("### %s " % rid):
        raise SystemExit("heading must start with ### %s" % rid)
    _save(f, text[:a] + new_heading + text[end:])


def insert_after(f, rid, block_text):
    text = _load(f)
    a, b = _span(text, rid)
    body = text[a:b].rstrip("\n")
    _save(f, text[:a] + body + "\n\n" + block_text.strip("\n") + "\n\n" + text[b:].lstrip("\n"))


def replace_in(f, rid, old, new):
    text = _load(f)
    a, b = _span(text, rid)
    block = text[a:b]
    if block.count(old) != 1:
        raise SystemExit("%s: %r found %d times" % (rid, old[:80], block.count(old)))
    _save(f, text[:a] + block.replace(old, new) + text[b:])
