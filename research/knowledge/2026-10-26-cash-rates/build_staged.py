"""Write the staged records of the 2026-10-26 cash-rates research into staged/ (not read by the site).
usage: python3 -I build_staged.py"""
import json
SEEN = "2026-10-26"
LEUMI = {"url": "https://www.leumi.co.il/he/savings/money-market-products",
         "title": "בנק לאומי, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447א)", "publisher": "בנק לאומי", "strength": "institution"}
DISCOUNT = {"url": "https://www.discountbank.co.il/private/savings-investments/savings-interest/",
            "title": "בנק דיסקונט, 'מוצרי שוק הכסף' (פרסום לפי הוראה 447א)", "publisher": "בנק דיסקונט", "strength": "institution"}
BOI_RATE = {"url": "https://www.boi.org.il/publications/pressreleases/21-10-26b/",
            "title": "בנק ישראל, הודעה לעיתונות 21.10.2026: הוועדה המוניטרית החליטה להותיר את הריבית ללא שינוי ברמה של 3.25%",
            "publisher": "בנק ישראל", "strength": "primary"}
BOI_MAKAM = {"url": "https://www.boi.org.il/roles/markets/monetarytools/makam/",
             "title": "בנק ישראל, מכרזי מק\"מ: תוצאות מכרזי המק\"מ", "publisher": "בנק ישראל", "strength": "primary"}

def pct(s):
    return None if s in (None, "-") else float(s.rstrip("%"))

# 1. Management fees of every money-market fund on Leumi's 447A page (fees as the managers reported them to the bank).
with open("work/leumi-mmf.jsonl", encoding="utf-8") as f, open("staged/mmf-fees-leumi.jsonl", "w", encoding="utf-8") as out:
    for line in f:
        r = json.loads(line)
        out.write(json.dumps({"tase_number": r["fund"], "name_he": r["name"], "currency": "NIS" if r["section"] == "shekel" else "FX",
                              "kind_he": r["kind"], "management_fee_pct": pct(r["fee"]), "source": LEUMI, "seen": SEEN,
                              "note": "fee as reported by the fund's manager to the bank (447A s.8: the bank is a conduit); '-' printed where none"},
                             ensure_ascii=False) + "\n")

# 2. Makam series on Leumi's 447A page, last trade 23.10.2026 (yield gross, before buy/sell fees and tax, as the page says).
makam = [("1116", "8261117", 99.91, 9, "2026-11-04", 5.35), ("1216", "8261216", 99.69, 37, "2026-12-02", 3.51),
         ("117", "8270118", 99.41, 72, "2027-01-06", 3.24), ("217", "8270217", 99.20, 100, "2027-02-03", 3.11),
         ("317", "8270316", 99.00, 128, "2027-03-03", 3.01), ("417", "8270415", 98.73, 163, "2027-04-07", 2.99),
         ("517", "8270514", 98.47, 191, "2027-05-05", 3.08), ("617", "8270613", 98.21, 219, "2027-06-02", 3.12),
         ("717", "8270712", 97.93, 254, "2027-07-07", 3.12), ("817", "8270811", 97.70, 282, "2027-08-04", 3.12),
         ("927", "8270928", 97.41, 317, "2027-09-08", 3.09), ("1017", "8271017", 97.19, 345, "2027-10-06", 3.10)]
json.dump({"as_of": "2026-10-23", "seen": SEEN, "source": LEUMI,
           "page_note_he": "התשואה המוצגת היא ברוטו ואינה כוללת עמלות קניה ומכירה ומס רווחי הון",
           "series": [{"series": s, "tase_number": n, "last_price": p, "days_to_redemption": d, "redemption": rd, "yield_to_redemption_pct": y}
                      for s, n, p, d, rd, y in makam]},
          open("staged/makam-leumi.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 3. Renewing (fixed-date) money-market funds with the manager's expected net yield, on Discount's 447A page.
json.dump({"as_of": "2026-10-26", "seen": SEEN, "source": DISCOUNT,
           "page_note_he": "שיעור התשואה הצפויה נטו (נומינלי שנתי) (נתון זה יפורסם בעת דיווחו ע\"י מנהל הקרן ויתעדכן מספר ימים לפני המועד הקבוע)",
           "funds": [{"tase_number": "1223866", "name_he": "אלטשולר שחם כספית מתחדשת חודשי לפדיון 16/11/2026", "next_date": "2026-11-16 16:00",
                      "expected_net_yield_pct": 2.81, "management_fee_pct": 0.19, "renewal_he": "מתחדשת אוטומטית, עד למתן הודעת פדיון על ידי הלקוח"},
                     {"tase_number": "1220227", "name_he": "מיטב כספית מתחדשת חודשי ב- 13/11/2026", "next_date": "2026-11-13 16:00",
                      "expected_net_yield_pct": 2.75, "management_fee_pct": 0.20, "renewal_he": "מתחדשת אוטומטית, עד למתן הודעת פדיון על ידי הלקוח"}]},
          open("staged/mmf-renewing-discount.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# 4. Bank of Israel figures, for the lead's reference only: D20 keeps Bank of Israel numbers off the site until it consents.
json.dump({"seen": SEEN, "d20": "reference only; not for the site while D20 stands",
           "policy_rate": {"value_pct": 3.25, "decided": "2026-10-21", "next_decision": "2026-11-23", "source": BOI_RATE},
           "makam_auction": {"date": "2026-10-06", "source": BOI_MAKAM, "series": [
               {"series": "1017", "closing_yield_pct": 3.23, "average_yield_pct": 3.21, "average_price": 96.8982, "redemption": "2027-10-06", "days": 364},
               {"series": "117", "closing_yield_pct": 3.13, "average_yield_pct": 3.12, "average_price": 99.2370, "redemption": "2027-01-06", "days": 91}]},
           "next_makam_issue": {"date": "2026-11-03", "series": "1117", "source": {"url": "https://www.boi.org.il/boi_files/hanpaka.pdf", "title": "בנק ישראל, מק\"מ - מועדי הנפקות עתידיים", "strength": "primary"}}},
          open("staged/boi-reference.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("written:", "staged/mmf-fees-leumi.jsonl", "staged/makam-leumi.json", "staged/mmf-renewing-discount.json", "staged/boi-reference.json")
