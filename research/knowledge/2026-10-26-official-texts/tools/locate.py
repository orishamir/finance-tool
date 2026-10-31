"""For every section the rule base cites from Wikisource, find it in the official copies filed in the library.

usage: python3 -I tools/locate.py <cited.json> <wiki-dir> <official.json> <library-dir> <out.json> [law-key ...]

Reads the library's own text (store/<id>.txt, one form feed between pages), so a page here is the library's
page, the number `library.mjs cite` checks. For each law and cited section:
  docs: every official file that holds a 5-word run of the Wikisource section, with hits, coverage and first page
  primary: the consolidated file if there is one, else the file with the most hits, with the page span by voting
  uncovered: Wikisource words in no official file (forward check over all files of the law)
  official_only: words in the primary (consolidated) stretch that the Wikisource page does not have anywhere
Words are Hebrew letters, digits or Latin letters; niqqud, punctuation and bidi marks are dropped.
"""
import hashlib
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

cited = json.load(open(sys.argv[1], encoding="utf-8"))
wdir = sys.argv[2]
official = json.load(open(sys.argv[3], encoding="utf-8"))
lib = sys.argv[4]
out = sys.argv[5]
only = set(sys.argv[6:])

TOK = re.compile(r"[א-ת]+|\d+|[A-Za-z]+")
N = 5
APPARATUS = {"תיקונים", "תיקון", "הצ", "עמ", "מתואם", "מתואמים", "מתואמת", "ראו", "נוסח", "פורסם", "מס"}

index = [json.loads(l) for l in open(f"{lib}/index.jsonl", encoding="utf-8")]
by_url = {d["url"]: d for d in index if d.get("url")}
by_from = {}
for d in index:
    if d.get("from"):
        by_from.setdefault(d["from"].split("/")[-1], d)


def norm(s):
    s = unicodedata.normalize("NFKC", s)
    return re.sub(r"[֑-ׇ]", lambda m: " " if m.group(0) in "־׀׃׆" else "", s)


def tokens(s):
    return TOK.findall(norm(s))


cache = {}


def load(doc_id):
    if doc_id in cache:
        return cache[doc_id]
    txt = open(f"{lib}/store/{doc_id}.txt", encoding="utf-8", errors="replace").read()
    toks, pg = [], []
    for i, p in enumerate(txt.split("\f"), 1):
        t = tokens(p)
        toks += t
        pg += [i] * len(t)
    idx = defaultdict(list)
    for i in range(len(toks) - N + 1):
        idx[tuple(toks[i:i + N])].append(i)
    cache[doc_id] = (toks, pg, idx)
    return cache[doc_id]


def runs_of(flags):
    res, i = [], 0
    while i < len(flags):
        if not flags[i]:
            j = i
            while j < len(flags) and not flags[j]:
                j += 1
            res.append((i, j))
            i = j
        else:
            i += 1
    return res


by_id = {d["id"]: d for d in index}
by_host_free = {re.sub(r"^https?://(www\.)?", "", u): d for u, d in by_url.items()}


def resolve(f, key):
    # the file actually downloaded for this law comes first: a library link can point at an older copy
    path = f"work/off/{key}/{f['name']}.pdf"
    if os.path.exists(path):
        d = by_id.get(hashlib.sha256(open(path, "rb").read()).hexdigest()[:16])
        if d:
            return d
    return by_url.get(f["url"]) or by_host_free.get(re.sub(r"^https?://(www\.)?", "", f["url"]))


result = {}
for key, law in cited.items():
    if only and key not in only:
        continue
    try:
        wiki = json.load(open(f"{wdir}/{key}.json", encoding="utf-8"))
    except FileNotFoundError:
        result[key] = {"title": law["title"], "error": "no wiki json"}
        continue
    secs = wiki["sections"]
    wiki_all = []
    for s in secs:
        wiki_all += tokens(s["title"] + " " + re.sub(r"[⟦⟧]", " ", s["text"]))
    wiki_idx = set(tuple(wiki_all[i:i + N]) for i in range(len(wiki_all) - N + 1))
    files = list(official.get(key, {}).get("files", []))
    seen = {f["url"] for f in files}
    # every gazette the Wikisource page itself links, when the library holds it (official hosts only)
    for b in wiki.get("boxes", []):
        u = b[2] if len(b) > 2 else ""
        if u and u not in seen and re.search(r"fs\.knesset\.gov\.il|free-justice|gov\.il/BlobFolder|boi\.org\.il", u):
            seen.add(u)
            files.append({"name": key + "-box-" + re.sub(r"\W+", "", u.split("/")[-1])[-24:], "url": u, "kind": "gazette", "date": b[0], "covers": b[1]})
    docs = []
    for f in files:
        d = resolve(f, key)
        if not d:
            continue
        if d.get("text") == "none":
            continue
        docs.append({"f": f, "id": d["id"], "pages": d.get("pages"), "text": d.get("text"), "url": d.get("url") or f["url"]})
    entry = {"title": law["title"], "files": [{"name": x["f"]["name"], "kind": x["f"].get("kind"), "date": x["f"].get("date"), "id": x["id"], "pages": x["pages"], "text": x["text"], "url": x["url"]} for x in docs],
             "unmatched_files": [f["name"] for f in files if not resolve(f, key)], "sections": {}, "no_section": law.get("no_section", []), "unresolved": law.get("unresolved", [])}
    for sid, contexts in law["sections"].items():
        base = sid[:-1] if sid.endswith("*") else None
        chosen = [s for s in secs if base and (s["id"] == base or s["id"].startswith(base + "."))] or [s for s in secs if s["id"] == sid][:1]
        if not chosen:
            entry["sections"][sid] = {"contexts": contexts, "status": "not in Wikisource page"}
            continue
        text = "\n".join(s["title"] + " " + s["text"] for s in chosen)
        W = tokens(re.sub(r"⟦[^⟧]*⟧", " ", text))
        res = {"contexts": contexts, "title": " / ".join(s["title"] for s in chosen if s["title"])[:160], "amend": "; ".join(s["amend"] for s in chosen if s["amend"])[:300],
               "notes": re.findall(r"⟦([^⟧]*)⟧", text), "words": len(W), "docs": []}
        cov = [False] * len(W)
        for x in docs:
            toks, pg, idx = load(x["id"])
            hits, pages, dcov = 0, Counter(), [False] * len(W)
            for i in range(len(W) - N + 1):
                ps = idx.get(tuple(W[i:i + N]))
                if ps:
                    hits += 1
                    for j in range(i, i + N):
                        cov[j] = True
                        dcov[j] = True
                    for p in ps[:30]:
                        pages[pg[p]] += 1
            if hits:
                res["docs"].append({"name": x["f"]["name"], "id": x["id"], "kind": x["f"].get("kind"), "hits": hits, "cov": round(sum(dcov) / max(1, len(W)), 3), "pages": pages.most_common(8)})
        res["coverage"] = round(sum(cov) / max(1, len(W)), 3)
        res["uncovered"] = [{"missing": " ".join(W[i:j]), "before": " ".join(W[max(0, i - 6):i]), "after": " ".join(W[j:j + 6])} for i, j in runs_of(cov)]
        cons = [y for y in res["docs"] if y["kind"] == "consolidated"]
        prim = (cons[0] if cons and cons[0]["cov"] > 0.5 else max(cons or res["docs"], key=lambda y: y["hits"])) if res["docs"] else None
        if prim:
            toks, pg, idx = load(prim["id"])
            votes = Counter()
            for i in range(len(W) - N + 1):
                for p in idx.get(tuple(W[i:i + N]), [])[:50]:
                    votes[(p - i) // 50] += 1
            b, _ = votes.most_common(1)[0]
            lo_b = hi_b = b
            while votes.get(lo_b - 1, 0) > 0:
                lo_b -= 1
            while votes.get(hi_b + 1, 0) > 0:
                hi_b += 1
            pos = []
            first_i = None
            for i in range(len(W) - N + 1):
                for p in idx.get(tuple(W[i:i + N]), []):
                    if lo_b * 50 - 60 <= p - i <= hi_b * 50 + 60:
                        pos.append(p)
                        if first_i is None:
                            first_i = (i, p)
            lo, hi = min(pos), max(pos) + N
            O = toks[lo:hi]
            flags = [False] * len(O)
            for i in range(len(O) - N + 1):
                if tuple(O[i:i + N]) in wiki_idx:
                    for j in range(i, i + N):
                        flags[j] = True
            extra = []
            for i, j in runs_of(flags):
                run = O[i:j]
                if len(run) < 2 or (any(w in APPARATUS for w in run) and any(w.isdigit() for w in run)) or sum(w.isdigit() for w in run) * 2 >= len(run):
                    continue
                extra.append({"official_only": " ".join(run), "before": " ".join(O[max(0, i - 6):i]), "page": pg[lo + i]})
            res["primary"] = {"name": prim["name"], "id": prim["id"], "kind": prim["kind"], "cov": prim["cov"], "first": pg[lo], "last": pg[hi - 1], "official_only": extra}
        entry["sections"][sid] = res
    result[key] = entry
    cache.clear()
json.dump(result, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for key, e in result.items():
    ss = e.get("sections", {})
    print(key, "files", len(e.get("files", [])), "unmatched", len(e.get("unmatched_files", [])), "sections", len(ss), "cov>=.97", sum(1 for s in ss.values() if s.get("coverage", 0) >= 0.97), "nodoc", sum(1 for s in ss.values() if not s.get("docs")))
