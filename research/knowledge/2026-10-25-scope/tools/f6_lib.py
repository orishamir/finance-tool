#!/usr/bin/env python3
"""f6_lib.py: block-level and open-question edits for the rule base (F6, settling pass 2026-10-26).

  in_block(path, rid, old, new)       replace `old` (exactly once) inside the `### rid` block
  insert_after_block(path, rid, text) insert a new block (text ends with a newline) after the `### rid` block
  oq_append(path, n, text)            append text to open question n's line
  oq_replace(path, n, line)           replace open question n's whole line
Each call reads and writes the file; a failed match raises, so nothing half-applied is written for that call.
"""
import re

REFS = "/home/ori/dev/finance-tool/.claude/skills/il-finance/references/"


def _read(path):
    return open(REFS + path, encoding="utf8").read()


def _write(path, text):
    open(REFS + path, "w", encoding="utf8").write(text)


def _block_span(text, rid):
    m = re.search(r"^### %s\b[^\n]*\n" % re.escape(rid), text, re.M)
    if not m:
        raise SystemExit("no block %s" % rid)
    nxt = re.compile(r"^(### |## )", re.M).search(text, m.end())
    return m.start(), (nxt.start() if nxt else len(text))


def in_block(path, rid, old, new):
    text = _read(path)
    a, b = _block_span(text, rid)
    block = text[a:b]
    n = block.count(old)
    if n != 1:
        raise SystemExit("%s %s: %d occurrences of %r" % (path, rid, n, old[:90]))
    _write(path, text[:a] + block.replace(old, new) + text[b:])
    print("ok", rid, old[:50].replace("\n", " "))


def insert_after_block(path, rid, new_block):
    text = _read(path)
    a, b = _block_span(text, rid)
    block = text[a:b]
    sep = "" if block.endswith("\n\n") else "\n"
    _write(path, text[:b].rstrip("\n") + "\n\n" + new_block.rstrip("\n") + "\n\n" + text[b:].lstrip("\n"))
    print("inserted after", rid)


def _oq_line(text, n):
    s = text.find("\n## Open questions")
    if s < 0:
        raise SystemExit("no Open questions section")
    e = text.find("\n## ", s + 5)
    e = len(text) if e < 0 else e
    m = re.compile(r"^%d\. [^\n]*$" % n, re.M).search(text, s, e)
    if not m:
        raise SystemExit("no open question %d" % n)
    return m.start(), m.end()


def oq_append(path, n, add):
    text = _read(path)
    a, b = _oq_line(text, n)
    _write(path, text[:b] + " " + add + text[b:])
    print("oq append", path, n)


def oq_replace(path, n, line):
    text = _read(path)
    a, b = _oq_line(text, n)
    _write(path, text[:a] + line + text[b:])
    print("oq replace", path, n)
