"""Compare Wikisource sections word for word with official texts (two-way word coverage).

usage: python3 -I tools/compare.py <wiki.json> <out.json> --sections "1,9*,125ג,9.16א" [--primary <pdf>] [--also <pdf> ...]

A section id is Wikisource's own id; "9*" means section 9 with its paragraphs (ids "9.x").
For each section:
  * forward check: every Wikisource word that does not sit inside a 5-word run found in an official file
    (primary or also) is listed with its context: wording the official files do not have;
  * reverse check (primary only, a consolidated text): the stretch of the primary file that matches the
    section is found by voting on shared 5-word runs; the words in that stretch that the Wikisource page does
    not have anywhere are listed, after dropping runs that look like apparatus (amendment lists, footnotes,
    "מתואם" notes): wording the official consolidation has and the mirror lacks.
Words are Hebrew letters, digits or Latin letters; niqqud, punctuation and bidi marks are dropped; the
mirror's ⟦editor notes⟧ are left out of the forward check and reported apart.
"""
import argparse
import json
import re
import subprocess
import unicodedata
from collections import Counter, defaultdict

ap = argparse.ArgumentParser()
ap.add_argument("wiki")
ap.add_argument("out")
ap.add_argument("--sections", required=True)
ap.add_argument("--primary", default=None)
ap.add_argument("--also", nargs="*", default=[])
args = ap.parse_args()

TOK = re.compile(r"[א-ת]+|\d+|[A-Za-z]+")
N = 5
APPARATUS = {"תיקונים", "תיקון", "הצ", "עמ", "מתואם", "מתואמים", "מתואמת", "ראו", "נוסח", "פורסם", "ת", "ט", "י", "פ", "ק", "ס", "ח"}


def norm(s):
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"[֑-ׇ]", lambda m: " " if m.group(0) in "־׀׃׆" else "", s)
    return s


def tokens(s):
    return TOK.findall(norm(s))


def load_pages(path):
    if path.endswith(".txt"):
        txt = open(path, encoding="utf-8").read()
    else:
        txt = subprocess.run(["pdftotext", path, "-"], capture_output=True, text=True).stdout
    toks, pg = [], []
    for i, p in enumerate(txt.split("\f"), 1):
        t = tokens(p)
        toks += t
        pg += [i] * len(t)
    return toks, pg


def ngrams(toks):
    idx = defaultdict(list)
    for i in range(len(toks) - N + 1):
        idx[tuple(toks[i:i + N])].append(i)
    return idx


def runs_of(flags):
    out, i = [], 0
    while i < len(flags):
        if not flags[i]:
            j = i
            while j < len(flags) and not flags[j]:
                j += 1
            out.append((i, j))
            i = j
        else:
            i += 1
    return out


wiki = json.load(open(args.wiki, encoding="utf-8"))
secs = wiki["sections"]
wiki_all = []
for s in secs:
    wiki_all += tokens(s["title"] + " " + re.sub(r"[⟦⟧]", " ", s["text"]))
wiki_idx = set(tuple(wiki_all[i:i + N]) for i in range(len(wiki_all) - N + 1))

docs = []
for label, path in ([("primary", args.primary)] if args.primary else []) + [("also", p) for p in args.also]:
    t, pg = load_pages(path)
    docs.append({"label": label, "path": path, "toks": t, "pages": pg, "idx": ngrams(t)})


def pick(sid):
    if sid.endswith("*"):
        base = sid[:-1]
        return [s for s in secs if s["id"] == base or s["id"].startswith(base + ".")]
    return [s for s in secs if s["id"] == sid][:1]


results = []
for sid in [x.strip() for x in args.sections.split(",") if x.strip()]:
    chosen = pick(sid)
    if not chosen:
        results.append({"section": sid, "status": "not in Wikisource page"})
        continue
    title = " / ".join(s["title"] for s in chosen if s["title"])[:200]
    text = "\n".join(s["title"] + " " + s["text"] for s in chosen)
    notes = re.findall(r"⟦([^⟧]*)⟧", text)
    W = tokens(re.sub(r"⟦[^⟧]*⟧", " ", text))
    res = {"section": sid, "title": title, "wiki_amend": "; ".join(s["amend"] for s in chosen if s["amend"])[:400],
           "wiki_words": len(W), "editor_notes": notes}
    cov = [False] * len(W)
    hits = Counter()
    for d in docs:
        for i in range(len(W) - N + 1):
            g = tuple(W[i:i + N])
            if g in d["idx"]:
                for j in range(i, i + N):
                    cov[j] = True
                hits[d["path"]] += 1
    res["coverage"] = round(sum(cov) / max(1, len(W)), 3)
    res["uncovered"] = [{"missing": " ".join(W[i:j]), "before": " ".join(W[max(0, i - 7):i]), "after": " ".join(W[j:j + 7])}
                        for i, j in runs_of(cov)]
    res["hits_by_file"] = dict(hits)
    if docs and docs[0]["label"] == "primary":
        d = docs[0]
        votes = Counter()
        for i in range(len(W) - N + 1):
            for p in d["idx"].get(tuple(W[i:i + N]), [])[:50]:
                votes[(p - i) // 50] += 1
        if votes:
            b, _ = votes.most_common(1)[0]
            # extend to neighbouring bins that also voted (long sections spread over many bins)
            lo_b = hi_b = b
            while votes.get(lo_b - 1, 0) > 0:
                lo_b -= 1
            while votes.get(hi_b + 1, 0) > 0:
                hi_b += 1
            # matched official positions inside that range
            pos = []
            for i in range(len(W) - N + 1):
                for p in d["idx"].get(tuple(W[i:i + N]), []):
                    if lo_b * 50 - 60 <= p - i <= hi_b * 50 + 60:
                        pos.append(p)
            lo, hi = min(pos), max(pos) + N
            O = d["toks"][lo:hi]
            ocov = [tuple(O[i:i + N]) in wiki_idx for i in range(len(O) - N + 1)] + [False] * (N - 1)
            flags = [False] * len(O)
            for i, c in enumerate(ocov):
                if c:
                    for j in range(i, min(len(O), i + N)):
                        flags[j] = True
            extra = []
            for i, j in runs_of(flags):
                run = O[i:j]
                if len(run) < 2:
                    continue
                if any(w in APPARATUS for w in run) and sum(w.isdigit() for w in run) >= 1:
                    continue
                if sum(w.isdigit() for w in run) * 2 >= len(run):
                    continue
                extra.append({"official_only": " ".join(run), "before": " ".join(O[max(0, i - 7):i]), "page": d["pages"][lo + i]})
            res["primary"] = {"path": d["path"], "pages": [d["pages"][lo], d["pages"][hi - 1]], "official_only": extra}
        else:
            res["primary"] = {"path": d["path"], "note": "no 5-word run of this section found in the primary file"}
    results.append(res)

json.dump(results, open(args.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for r in results:
    p = r.get("primary", {})
    print(f"{r['section']:>10} words={r.get('wiki_words')} cov={r.get('coverage')} pages={p.get('pages')} "
          f"uncovered={len(r.get('uncovered', []))} official_only={len(p.get('official_only', []))} {r.get('status', '')}{p.get('note', '')}")
