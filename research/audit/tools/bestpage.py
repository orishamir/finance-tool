"""bestpage.py PAGES.json "text" ... : best-matching file pages for each text by 8-char shingles of Hebrew letters and digits."""
import sys,json,re
pages=json.load(open(sys.argv[1]))
sq=lambda t:re.sub(r'[^א-ת0-9]','',t)
SP=[sq(p) for p in pages]
for q in sys.argv[2:]:
    s=sq(q); sh={s[i:i+8] for i in range(max(1,len(s)-7))}
    sc=sorted(((sum(1 for x in sh if x in p)/len(sh),i+1) for i,p in enumerate(SP)),reverse=True)[:3]
    print(f"{[(pg,round(v,2)) for v,pg in sc]} :: {q[:60]}")
