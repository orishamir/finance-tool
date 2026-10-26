"""List every Wikisource citation in the il-finance rule base, by law and by rule.

usage: python3 -I tools/list_citations.py <references-dir> <out.json>

Each citation: file, line, context (rule id or "## section"), the link label, the
decoded page title, the text that follows the link up to the next source
separator (the locator), and the section numbers found in label + locator.
"""
import json
import re
import sys
import urllib.parse
from collections import OrderedDict
from pathlib import Path

ref_dir = Path(sys.argv[1])
out = Path(sys.argv[2])

RULE_RE = re.compile(r"^###\s+([A-Z0-9]+-[A-Z]?\d+[a-z]?)\b")
SEC_RE = re.compile(r"^##\s+(.*)")


def balanced_url(text, start):
    """text[start] is the '(' after ']'. Return (url, end_index)."""
    depth = 0
    i = start
    while i < len(text):
        ch = text[i]
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
            if depth == 0:
                return text[start + 1:i], i + 1
        elif ch in " \t" and depth == 1:
            return text[start + 1:i], i
        i += 1
    return text[start + 1:], len(text)


def title_of(url):
    u = urllib.parse.unquote(url)
    u = u.split("#")[0]
    m = re.search(r"title=([^&]+)", u)
    if m:
        t = m.group(1)
    elif "/api/rest_v1/page/pdf/" in u:
        t = u.split("/api/rest_v1/page/pdf/")[1]
    elif "/wiki/" in u:
        t = u.split("/wiki/")[1]
    elif "search=" in u:
        return "(search) " + u.split("search=")[1].split("&")[0]
    else:
        t = u
    t = t.split("?")[0]
    return t.replace("_", " ").strip()


TOKEN = r"\d+[A-Za-z\u05d0-\u05ea]{0,2}\d*(?:\([^)\s]{1,6}\))*"
SECTION_TOKEN = re.compile(
    r"(?:\bss?\.|\bregs?\.|\bregulations?\b|\breg\b|\bsections?\b|\u05e1\u05e2\u05d9\u05e3|\u05e1\u05e2\u05d9\u05e4\u05d9\u05dd|\u05ea\u05e7\u05e0\u05d4|\u05ea\u05e7\u05e0\u05d5\u05ea|\brules?\b|\bpara\.?)\s*"
    r"((?:" + TOKEN + r"(?:\s*(?:,|;|\band\b|\bto\b|-|\u2013)\s*(?:(?:ss?|regs?)\.\s*)?)?)+)"
)


def sections_in(s):
    seen = []
    for m in SECTION_TOKEN.finditer(s):
        for t in re.findall(TOKEN, m.group(1)):
            if t not in seen:
                seen.append(t)
    return seen


cites = []
for path in sorted(ref_dir.glob("*.md")):
    context = None
    section = None
    for ln, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        m = RULE_RE.match(line)
        if m:
            context = m.group(1)
        else:
            m2 = SEC_RE.match(line)
            if m2:
                section = m2.group(1).strip()
                context = "## " + section
        if "wikisource.org" not in line:
            continue
        pos = 0
        while True:
            i = line.find("wikisource.org", pos)
            if i < 0:
                break
            # find url start
            s = line.rfind("http", 0, i)
            label = ""
            lb = s
            angle = s >= 3 and line[s - 3:s] == "](<"
            if angle:
                e = line.find(">", s)
                url, end = line[s:e], e + 2
                s = s - 1
            if angle or (s >= 2 and line[s - 2:s] == "]("):
                if not angle:
                    url, end = balanced_url(line, s - 1)
                lb = line.rfind("[", 0, s - 2)
                # labels may contain nested brackets; take the last '[' at depth 0
                depth = 0
                j = s - 3
                while j >= 0:
                    if line[j] == "]":
                        depth += 1
                    elif line[j] == "[":
                        if depth == 0:
                            lb = j
                            break
                        depth -= 1
                    j -= 1
                label = line[lb + 1:s - 2]
            else:
                m3 = re.match(r"https?://[^\s|]+", line[s:])
                url = m3.group(0).rstrip(".,;")
                end = s + len(url)
            # locator: text after the link up to ' · ' or next link or ';'
            rest = line[end:]
            stop = len(rest)
            for sep in [" · ", " [", "; [", " | "]:
                k = rest.find(sep)
                if 0 <= k < stop:
                    stop = k
            locator = rest[:stop].strip(" ,;|")
            # for table rows with a bare URL, the row's first cell describes the law and sections
            row = ""
            if line.lstrip().startswith("|"):
                row = line.strip()
            field = ""
            mf = re.match(r"^\s*-\s*([A-Za-z /]+):", line)
            if mf:
                field = mf.group(1).strip()
            # prefix: words just before the link in the same source item (e.g. "s.120A wording: [link]")
            head = line[:(lb if (angle or label) else s)]
            cut = max(head.rfind(x) for x in [" · ", "primary. ", "; ", "Source: ", "). "])
            prefix = head[cut:].lstrip(" ·;.)") if cut >= 0 else ""
            prefix = prefix[-160:] if not prefix.strip().startswith("[") else ""
            secs = sections_in(prefix + " " + label + " " + locator + " " + (row.split("|")[1] if row else ""))
            cites.append(OrderedDict(
                file=path.name, line=ln, context=context, field=field,
                title=title_of(url), url=url, prefix=prefix.strip(), label=label, locator=locator,
                row=row[:400], sections=secs,
            ))
            pos = i + 10

by_law = OrderedDict()
for c in cites:
    by_law.setdefault(c["title"], []).append(c)

summary = []
for t, cs in sorted(by_law.items(), key=lambda kv: -len(kv[1])):
    rules = OrderedDict()
    for c in cs:
        rules.setdefault(c["context"], []).extend(x for x in c["sections"] if x not in rules.get(c["context"], []))
    summary.append(OrderedDict(title=t, citations=len(cs), rules=rules))

out.write_text(json.dumps(OrderedDict(total=len(cites), laws=summary, citations=cites), ensure_ascii=False, indent=1), encoding="utf-8")
print("total", len(cites), "titles", len(by_law))
for s in summary:
    print(s["citations"], s["title"], "| rules:", len(s["rules"]))
