"""Turn a Hebrew Wikisource law page (raw wikitext, the ח: templates) into plain text by section.

usage: python3 -I tools/wiki2text.py <in.wiki> <out.json>

out.json: {"preamble": "...", "boxes": [[label, title, url], ...], "sections": [{"id", "title", "amend", "text"}]}
Section ids are Wikisource's own (e.g. "125ג", "9א", "64א3"); paragraphs and schedule items use their anchor (עוגן=..., "סעיף 9.16א" becomes "9.16א").
Editor notes ({{ח:הערה|...}}) are kept in ⟦...⟧ so they can be told apart from the statute's words.
"""
import json
import re
import sys

src = open(sys.argv[1], encoding="utf-8").read()


def split_params(inner):
    """Split template params on top-level '|'."""
    parts, depth, cur = [], 0, []
    i = 0
    while i < len(inner):
        if inner.startswith("{{", i):
            depth += 1; cur.append("{{"); i += 2; continue
        if inner.startswith("}}", i):
            depth -= 1; cur.append("}}"); i += 2; continue
        if inner.startswith("[[", i):
            depth += 1; cur.append("[["); i += 2; continue
        if inner.startswith("]]", i):
            depth -= 1; cur.append("]]"); i += 2; continue
        ch = inner[i]
        if ch == "|" and depth == 0:
            parts.append("".join(cur)); cur = []
        else:
            cur.append(ch)
        i += 1
    parts.append("".join(cur))
    return parts


boxes = []
sections = []


def render(name, params):
    name = name.strip()
    pos = [p for p in params if not re.match(r"^\s*[^=\s]+\s*=", p)]
    kw = dict(p.split("=", 1) for p in params if re.match(r"^\s*[^=\s]+\s*=", p))
    kw = {k.strip(): v.strip() for k, v in kw.items()}
    if name in ("ח:סעיף", "ח:סעיף*"):
        sid = kw.get("עוגן") or (pos[0].strip() if pos else "")
        sid = re.sub(r"^(?:סעיף|תקנה|פרט|כלל)\s+", "", sid)
        title = pos[1].strip() if len(pos) > 1 else ""
        amend = pos[2].strip() if len(pos) > 2 else ""
        return f"\n\u0001SEC\u0002{sid}\u0002{title}\u0002{amend}\u0003\n"
    if re.match(r"^ח:ת+$", name):
        return " ".join(p.strip() for p in pos) + " "
    if name in ("ח:פנימי", "ח:חיצוני"):
        if len(pos) >= 2:
            return pos[1]
        return pos[0] if pos else ""
    if name == "ח:הערה":
        return "\u27e6" + (pos[0] if pos else "") + "\u27e7"
    if name == "ח:תיבה":
        boxes.append([p.strip() for p in pos])
        return ""
    if re.match(r"^ח:קטע\d$", name):
        return "\n" + (pos[1] if len(pos) > 1 else (pos[0] if pos else "")) + "\n"
    if name in ("ש",):
        return "\n"
    if name in ("=",):
        return "="
    if name in ("דוכיווני", "מוקטן"):
        return pos[0] if pos else ""
    return ""


def expand(text):
    # innermost-first expansion of {{...}}
    pat = re.compile(r"\{\{([^{}]*)\}\}")
    for _ in range(20):
        new = pat.sub(lambda m: render(split_params(m.group(1))[0], split_params(m.group(1))[1:]), text)
        if new == text:
            break
        text = new
    return text


t = re.sub(r"<ref[^>]*/>", "", src)
t = re.sub(r"<ref[^>]*>.*?</ref>", "", t, flags=re.S)
t = re.sub(r"<!--.*?-->", "", t, flags=re.S)
t = expand(t)
t = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", lambda m: m.group(1), t)
t = re.sub(r"<[^>]+>", " ", t)
t = t.replace("'''", "").replace("''", "")

parts = re.split(r"\u0001SEC\u0002", t)
pre = parts[0]
for p in parts[1:]:
    head, body = p.split("\u0003", 1)
    sid, title, amend = (head.split("\u0002") + ["", "", ""])[:3]
    sections.append({"id": sid, "title": title, "amend": amend, "text": re.sub(r"[ \t]+", " ", body).strip()})

json.dump({"preamble": pre.strip()[:5000], "boxes": boxes, "sections": sections}, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(sections), "sections,", len(boxes), "boxes")
