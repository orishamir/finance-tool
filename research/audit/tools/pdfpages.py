"""pdfpages.py PDF -> writes PDF.pages.json: list of normalized page texts (index 0 = file page 1)."""
import sys,subprocess,re,json
def norm(t):
    t=re.sub(r'[‎‏‪-‮⁦-⁩]','',t)
    t=t.replace('״','"').replace('״','"').replace('”','"').replace('“','"').replace('׳',"'").replace('’',"'")
    t=re.sub(r'[֑-ׇ]','',t)  # nikud
    t=re.sub(r'\s+',' ',t)
    return t
p=sys.argv[1]
n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',p],capture_output=True,text=True).stdout).group(1))
pages=[norm(subprocess.run(['pdftotext','-f',str(i),'-l',str(i),p,'-'],capture_output=True,text=True).stdout) for i in range(1,n+1)]
json.dump(pages,open(p+'.pages.json','w'),ensure_ascii=False)
print(n)
