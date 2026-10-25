"""knesset_amend.py ISRAEL_LAW_ID OUT.json : every law/bill bound to an Israel law, with its gazette publication and file links."""
import json,sys,subprocess
from concurrent.futures import ThreadPoolExecutor
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
B="https://knesset.gov.il/Odata/ParliamentInfo.svc"
def get(path):
    out=subprocess.run(["curl","-sS","--max-time","60","-A",UA,B+"/"+path],capture_output=True,text=True).stdout
    try: return json.loads(out)
    except Exception: return {}
def allrows(path):
    rows=[];skip=0
    while True:
        d=get(f"{path}&$format=json&$skip={skip}")
        v=d.get('value',[]); rows+=v
        if len(v)<100: break
        skip+=len(v)
    return rows
def one(b):
    lid=b['LawID']
    if b.get('LawTypeID')==2:
        law=get(f"KNS_Bill({lid})?$format=json")
        docs=get(f"KNS_DocumentBill()?$filter=BillID%20eq%20{lid}&$format=json").get('value',[])
    else:
        law=get(f"KNS_Law({lid})?$format=json")
        docs=get(f"KNS_DocumentLaw()?$filter=LawID%20eq%20{lid}&$format=json").get('value',[])
    return dict(LawID=lid,type=b.get('LawTypeID'),binding=b.get('BindingTypeDesc'),bind_page=b.get('PageNumber'),name=law.get('Name'),pub=law.get('PublicationDate'),series=law.get('PublicationSeriesDesc'),mag=law.get('MagazineNumber'),page=law.get('PageNumber'),
                docs=[(d.get('GroupTypeDesc'),d.get('FilePath')) for d in docs if (d.get('FilePath') or '').lower().endswith('.pdf')])
israel_id=int(sys.argv[1]); out=sys.argv[2]
binds=allrows(f"KNS_LawBinding()?$filter=IsraelLawID%20eq%20{israel_id}")
with ThreadPoolExecutor(8) as ex: res=list(ex.map(one,binds))
res.sort(key=lambda x:x['pub'] or '')
json.dump(res,open(out,'w'),ensure_ascii=False,indent=0)
print(len(res), sum(1 for r in res if r['name']))
