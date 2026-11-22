# Presenting money decisions: what the evidence says, checked against our guidelines (research, 22.11.2026)

## Summary

Most of what the guidelines already ask for is backed by evidence. That includes showing every option at once in a sorted list, writing a difference as a difference, putting notes beside the figure they qualify, never using a placeholder, and keeping figures in whole shekels with the assumption said in words. The biggest gap is the opposite of hiding something: the starting values. A starting value is read as the site's advice. In a meta-analysis of 58 studies, defaults moved choices strongly, and most strongly when people took them as an endorsement. A precise total (say 84,184 ₪) anchors more than a round one. On the index page the 7% example return produces such a total, and the caption under it does not name the return. The sentence "not a forecast, and the order holds from 0% to 10%" sits behind a "?", which most people never open. Three cheap changes would help readers most:
- Say the return beside every total that rests on it, and show the total at the low and high ends of the range too.
- Stop calling an example "הבחירה של האתר".
- Show where a fee stands among all companies, in shekels where the reader has a plan.

The evidence for these is strong to moderate. It comes from regulators' randomised tests (FCA, the SEC's Office of the Investor Advocate, the European Commission's tests of the key information document, the KID) and from meta-analyses.

## How I worked

- **Read first:** the guidelines (README, project, research, design, charts, wording), the decisions in `docs/product.md` (D5, D9, D28, D35, D36, D54, D104, D112), the parameters behind the starting values (`data/parameters/illustrative-scenario.json`, `sensitivity-bounds.json`, `tie-threshold.json`), and the strings and components that show them (`site/app/copy.ts`, `site/app/components/invest/plan-card.tsx`, `foot.tsx`).
- **Kept out of duplication:** I read the user lab's evidence reports (`research/user-lab/evidence/2026-11-05-*.md`, `behaviour-guide.md`) and today's `research/2026-11-22-kit-ux.md`, so as not to repeat them. Where I rely on a source they used, I opened it again myself.
- **Searched topic by topic, in your order:** framing, defaults and anchoring, uncertainty, comparing many options, fees, trust, terms, disclosure, neutrality. Within each topic I looked for meta-analyses first, then regulators' tests, then single peer-reviewed studies. I searched once in Hebrew for anything from Israel's Capital Market Authority or the Bank of Israel.
- **Opened every source I cite.** Where I could read only the abstract, the source list says so.
- **What I could not do.** This session had no shell, so I could not run `free -g`, `shot.mjs` or FlareSolverr. What I call **observed** comes from the code and strings, not from the screen. The user-research and research-synthesis skills you named are not installed here, so I followed their aims by hand.
- My own reasoning is marked **(inference)**. Nothing here states a tax or financial rule.

---

## 1. A total that rests on an assumed return: say the return beside it, and show the ends

**The practice.** Wherever a big figure depends on a return the reader didn't choose, say the return in words right beside it. Show what the figure would be at a low and a high return too. Keep the sentence that says the comparison holds whatever the return in plain sight.

**The evidence.**
- *A default reads as advice.* Defaults change choices a lot, and most when people take them as an endorsement or as the status quo. This comes from a meta-analysis of 58 studies with 73,675 people, d = 0.68 ([Jachimowicz et al. 2019][jach]; strong). The endorsement mechanism was shown directly in four experiments that included retirement saving ([McKenzie et al. 2006][mck]; abstract only; moderate).
- *A precise figure anchors more.* People adjust less from a precise anchor than from a round one. The original had five studies, and the Open Science Collaboration's replication recorded the main effect as successful ([FORRT record][forrt]; moderate to strong). A total like 84,184 ₪ is a precise anchor.
- *"About" does not signal doubt, but a numeric range does, at little cost to trust.* Five experiments with 5,780 people, including a field test on BBC News, found that stated uncertainty was noticed and trust fell only slightly, mostly for verbal hedges ([van der Bles et al. 2020][vdb]; strong). In a pension test with 452 people, a point estimate, a narrow range and a wide range were compared. Ranges were judged more positively, and perceived uncertainty did not change ([Festjens 2025][fest]; preregistered conference paper; weak to moderate).
- *Keep it simple: what-if numbers, not probabilities.* The European Commission tested the KID with 7,684 people in five countries. Only about 10% understood the probabilistic scenario information. The versions with the most elements did worse ([DevStat for the EC 2020][ec], pp. 3, 67–68, 74; strong, regulator's randomised test).
- *What sits behind a pop-up is mostly not seen.* In the FCA's test with 1,049 investors, people made 54% of their choices without opening the pop-up pages that held the comparison chart ([FCA OP32][fca], p. 5; strong).

**Where our guidelines stand.**
- *Covered in principle.* `guidelines/wording.md` lines 116–119 say a figure that rests on an assumed return says so in words ("בהנחה שהתשואה 5% בשנה"), not by rounding. Rule 5 at lines 32–34 says the same.
- *Not met on the index page* **(observed in code)**. The receipt's caption under "נשאר לכם" reads "בעוד N שנים, בכסף של היום." It does not mention the return (`site/app/copy.ts` line 3972). "תשואה לדוגמה, לא תחזית" and "הסדר נשמר בכל תשואה בין 0% ל־10%" appear only inside the "?" beside the return (`copy.ts` lines 4812–4814; `plan-card.tsx` line 36).
- *In conflict with design.md.* `guidelines/design.md` lines 224–226 say a "?" never holds a fact the choice needs. That the order doesn't depend on the guessed return is the fact that makes the comparison worth trusting **(inference)**.
- *Missing.* No guideline asks for the low and high ends. `guidelines/charts.md` line 77 only dashes the series.

**Proposed guideline lines** (charts.md, "Labels"):
- "A total that rests on a return the reader didn't type says the return beside it in words, and the total at the low and high ends of the site's range ('בתשואה של 0% עד 10%: 61 עד 92 אלף ₪')."
- "Whether the order holds at other returns is said in the answer's card, never only behind a '?'."

**What it costs.** About two strings and one line under the total. The index page already computes the order at P-02's bounds, which is what the "holds or flips" sentence uses (`foot.tsx`), so the two end totals are probably one extra call **(inference)**. A fresh-reader check should ask "how much will you have in 10 years?" and count how many readers repeat the 7% total as a promise.

## 2. Defaults and examples read as the site's advice: name them as examples

**The practice.** Never call a starting value, or the record an example runs on, the site's choice or pick. Say what it is: an example, worked out on one named record.

**The evidence.** This rests on the same defaults research as finding 1: defaults work largely through implied endorsement ([Jachimowicz et al. 2019][jach]; [McKenzie et al. 2006][mck]). Showing a fund's fee against the spread of similar funds did *not* raise perceived endorsement in the SEC's preregistered test ([Scholl et al. 2023][sec], p. 424). So stating facts about the market isn't read as steering, while calling something "chosen" is **(inference from both)**.

**Where our guidelines stand.**
- *Partly covered.* `guidelines/wording.md` line 16 bans "אנחנו ממליצים". `guidelines/design.md` line 151 bans placeholders because "it reads as a value", which is the same mechanism. `guidelines/charts.md` lines 119–126 keep a field's default as a plain number with no site-parameter tag.
- *Missing* **(observed in code)**. The guide timelines open with "הבחירה של האתר: מבין … התעריפון הזה משאיר לכם הכי הרבה כסף בתוכנית לדוגמה" (`copy.ts` lines 1309 and 1315).
- The code's own comment at `copy.ts` line 3857 says "בחירת האתר" reads as a recommendation beside "האתר לא ממליץ על מדד". So the risk is already known in one place and not yet applied in the other.
- D5 (`docs/product.md`) lets the site name a best option for a goal. That is the founder's decision. This finding is about the word "בחירה", not about naming the cheapest.

**Proposed guideline line** (wording.md, "Word choice"): "A starting value, or the record an example runs on, is named for what it is ('הדוגמה מחושבת לפי התעריפון של …, שמשאיר הכי הרבה בתוכנית לדוגמה'), never as the site's choice or pick."

**What it costs.** Two strings, plus a quick sweep for "בחירה של האתר" and "בחירת האתר".

## 3. Fees: shekels over the reader's years, and where the fee stands among the others

**The practice.** A percent fee hides what's at stake. Show its cost in shekels over the years of the reader's own plan. Where no plan exists, show where the fee stands among all comparable products.

**The evidence.**
- *The SEC study.* The SEC's Office of the Investor Advocate ran three experiments, two on incentivised national samples (N = 4,588), with a choice among S&P 500 index funds. Visuals that placed each fund's fee within the spread of similar funds cut fees paid by 19% to 25% against the legal disclosure. In the third study the visual cut fees by 13.6% more than simply showing every fee in percent. It helped people of every knowledge level ([Scholl et al. 2023][sec], pp. 422–425; strong). The authors expect the effect to be *larger* when a single product is looked at alone (p. 426).
- *The FCA study.* In the FCA's test, a chart of a small fee difference's effect over time raised cheaper choices by 7.8 points. A review screen at the moment of choice raised them by 10.5 points ([FCA OP32][fca], pp. 4–5; strong).
- *Size matters both ways.* Percentages are hard to grasp, and small differences in money are written off as "peanuts". Fees in money helped people investing large sums; for small sums, showing the return in money helped more ([Newall & Love 2015][nl]; two experiments, about 2,000 people; moderate).
- *Israeli investors do respond.* Israeli mutual fund investors react to fee changes, new money more than money already invested, and investors in high-fee funds much less ([Mugerman & Steinberg, Bank of Israel 2024][boi]; field data on daily flows; strong for Israel).

**Where our guidelines stand.**
- *Covered on the index page.* The receipt splits what each party takes, in shekels over the plan's years (D28, D104). `guidelines/wording.md` line 28 says to talk about the reader's money.
- *A deliberate gap on company and track pages.* D35 bans any figure computed over other companies on a company page, and D36 keeps the track table's fees in percent with no example sum. D36's reason is sound: an example sum would be read as the reader's own (finding 2). But a fee shown alone, in percent, is exactly the setting where the SEC's authors expect the most harm.
- *The fee page states no total, by design* (D112).

**Proposed guideline line** (for the founder to weigh against D35; design.md, "Lists of products"): "Where a fee stands alone, a link says where it stands among all comparable tracks ('איפה דמי הניהול האלה ביחס לכל המסלולים') and opens the track list sorted by that fee, with this track marked." This keeps D35's letter, since the page computes nothing over others.

**What it costs.** One link per fee block, plus a "marked row" state in the track list. A visual of where the fee sits would be a larger kit piece, and the founder's call.

## 4. Plain words beat a glossary tap

**The practice.** Where an everyday phrase says it, use the phrase. Keep the term for its explanation, or for where the reader will meet it in a bank's or fund's documents.

**The evidence.** In a randomised test with 650 US adults, jargon made text harder to process, raised resistance to it and lowered support for its message. Hover definitions of the same terms did not remove the effect: definitions had no main effect and no interaction (F = 0.37 and 0.17). Swapping the jargon for plain words did remove it ([Bullock et al. 2019][bull], pp. 4–6; moderate: one study, science topics).

**Where our guidelines stand.**
- *Partly covered.* `guidelines/wording.md` lines 53–62 and 67–69 ask for everyday and full words.
- *Missing.* Lines 64–66 say the first time a term appears it opens its explanation. That is the definitions approach the study found doesn't restore ease of reading.

**Proposed guideline line** (wording.md, after line 66): "Prefer the plain phrase to the term. A term stays where the reader will meet it in documents or at the bank; then it opens its explanation."

**What it costs.** A copy sweep, best done page by page with fresh readers. It also eases the strings' load **(inference)**.

## 5. A difference in shekels or points, never "X% cheaper"

**The practice.** Say a difference as an amount ("פחות 1,524 ₪", "0.3 נקודות אחוז פחות"), never relative to another figure ("40% זול יותר").

**The evidence.** A Cochrane review of 35 studies (83 comparisons) found that a relative change looks bigger (SMD 0.41) and persuades more (SMD 0.66) than the same change in absolute terms, with no better understanding (SMD 0.02). The authors warn it "could lead to misinterpretation" ([Akl et al. 2011][akl]; strong as a review, though from health).

**Where our guidelines stand.** *Missing as a rule, met in practice* **(observed)**. The index page writes "פחות X ₪" and "עוד X ₪" (D104). `guidelines/charts.md` lines 49–53 ask for amounts in words.

**Proposed guideline line** (wording.md, "Numbers"): "A difference is an amount or percentage points, never a percent of another figure."

**What it costs.** Nothing now. It guards future pages.

## 6. Past returns: the general warning doesn't stop the inference

**The practice.** Don't rely on "past returns don't predict" to undo what a column of past returns suggests. Keep past returns out of order, emphasis and the first glance, and say their years and what they include.

**The evidence.**
- In the EC's KID test, about two thirds of people agreed that "the future can differ from the past". Yet only 27% to 32% answered correctly that several positive years don't mean an above-average chance of a gain, and 23% to 25% that last year's return isn't more likely to repeat ([DevStat for the EC 2020][ec], p. 72, Table 71; strong).
- Returns since a fund's start, shown beside fees, raised fees paid, and fee visuals reduced the weight people gave them ([Scholl et al. 2023][sec], pp. 419, 423; strong).

**Where our guidelines stand.** *Covered for the track browser by decision* (D54): the column is labelled "תשואת עבר" with "לפני דמי ניהול ומס", it is never a sort key, and "אין 3 שנים" is shown for young tracks. *Missing in the guidelines* for any other page.

**Proposed guideline line** (design.md, "Lists of products"): "A past return says its years and what it is before; it is never a sort key, never emphasised, and never the first figure of a row."

**What it costs.** Nothing now. It carries D54 to future pages.

## 7. Disclosure that works: at the moment of choice, few, and the procedure before the data

**The practice.** Put the one caveat that changes the choice in the answer itself. Explain *how* a figure was worked out in a sentence first, and put the raw inputs one step further away.

**The evidence.**
- Mandated disclosure and warnings, including short and "simplified" ones, were often ineffective and sometimes backfired ([ASIC and AFM, Report 632, 2019][asic]; regulators' review of their own trials; strong).
- What everyone had to see at the moment of choice worked best ([FCA OP32][fca]).
- In a field experiment with 103 learners, a short explanation of the procedure restored trust among people whose result disappointed them. Adding the raw data on top erased that gain ([Kizilcec 2016][kiz], p. 2392; weak to moderate: small, one setting).

**Where our guidelines stand.** *Mostly covered.*
- `guidelines/wording.md` lines 100–101 put notes beside the figure they qualify.
- `guidelines/design.md` lines 224–226 keep facts out of a "?".
- D106's "לא נכלל במחיר" line sits in the receipt itself.

The exception is finding 1. *Missing:* nothing says which comes first in a computed figure's sheet.

**Proposed guideline line** (design.md, "A sheet"): "A computed figure's sheet opens with one sentence on how it was worked out, then the inputs."

**What it costs.** A review of the provenance sheet's order. Small.

## 8. Costs over the plan's years and per year, never per day or month

**The practice.** Show deposits in the unit people pay them (monthly). Show costs as a total over the plan's years and per year, never per day or per month.

**The evidence.** In a field experiment with thousands of new users of a savings app, "$5 a day" quadrupled sign-ups against "$150 a month", and removed the gap between incomes ([Hershfield, Shu & Benartzi 2020][hsb]; strong for deposits). The authors' explanation, that small units feel less painful, implies a cost per day would look trivial **(inference)**.

**Where our guidelines stand.** *Missing.* The site already does this on the index page **(observed)**. `copy.ts` line 1303 even prints a custody rate per its own period, from the price list, which is right.

**Proposed guideline line** (wording.md, "Numbers"): "A cost the site computes is shown over the plan's years and per year, never per day or per month; a price keeps the period its price list prints."

**What it costs.** Nothing now.

## 9. Already right, and now backed

- **Every option at once, sorted by what it leaves, with what the list is sorted by** (`guidelines/design.md` lines 55 and 243–245). Ordering by performance halved wrong choices among 15 plans, from 43.1% to 22.1% over three choices ([Hibbard et al. 2002][hib]; moderate).
- **A difference written against the reader's pick** (D104; `guidelines/charts.md` lines 49–54). Explicit +/− changes raised good choices from 61% to 75% ([Hibbard et al. 2002][hib]).
- **Whole shekels, with the assumption said in words** (`guidelines/wording.md` lines 112–119). Rounding is not read as doubt ([van der Bles et al. 2020][vdb]), so words are the right carrier. Precise figures anchor ([FORRT record][forrt]), so the words must sit beside the figure (finding 1).
- **No equity return as a sourced number** (D9). Probabilistic scenarios are poorly understood ([DevStat for the EC 2020][ec]), so a stated assumption with its ends is the better tool.

## For the fresh readers (a brief to plan, not run)

Show three readers the index page at the starting values on a phone. Ask:
1. "How much will you have, and how sure is that?"
2. "Does the site think one of these is best? Which, and why?"
3. On a guide page with a timeline: "Who chose this bank?"

Count the readers who repeat the total as a promise, and those who say "the site chose". Give them the brief only, with nothing from this report.

## Rule base

Nothing I found is a tax or financial rule, and I found nothing wrong or missing in the rule base.

---

## Sources

| Source | Kind, size | What I opened |
|---|---|---|
| [Jachimowicz, Duncan, Weber, Johnson 2019, *Behavioural Public Policy*][jach] | Meta-analysis, 58 studies, 73,675 people | Abstract |
| [McKenzie, Liersch, Finkelstein 2006, *Psychological Science*][mck] | Four experiments | Abstract (publisher page 403) |
| [Janiszewski & Uy 2008, *Psychological Science*, replication record][forrt] | Five studies; OSC 2015 replication | FORRT replication record (PubMed blocked) |
| [van der Bles et al. 2020, *PNAS*][vdb] | Five experiments, 5,780 people | Repository abstract |
| [Festjens 2025, Netspar Pension Day][fest] | Preregistered experiment, 452 people | Full text, pp. 1–6 |
| [DevStat for the European Commission 2020, PRIIPs KID consumer test][ec] | Online test, 7,684 people, 5 countries | Full text, pp. 3, 61–74 |
| [Hayes, Lee, Thakrar 2018, FCA Occasional Paper 32][fca] | Randomised online test, 1,049 investors | Full text, pp. 2–5 |
| [Scholl, Craig, Chin 2023, *Journal of the Association for Consumer Research* (SEC Office of the Investor Advocate)][sec] | Three experiments, 4,588 national plus 301 | Full text, pp. 416–426 |
| [Newall & Love 2015, *Decision*][nl] | Two experiments | Accepted manuscript, abstract and introduction |
| [Mugerman & Steinberg 2024, Bank of Israel Discussion Paper 2024.12][boi] | Israeli fund flows, daily, field | Abstract, Hebrew and English |
| [Bullock, Colón Amill, Shulman, Dixon 2019, *Public Understanding of Science*][bull] | Randomised 2×2, 650 adults | Full text, pp. 1–6 |
| [Akl et al. 2011, Cochrane review CD006776][akl] | Systematic review, 35 studies | Cochrane plain-language summary with results |
| [ASIC and AFM 2019, Report 632][asic] | Regulators' review of trials | Report page summary |
| [Kizilcec 2016, CHI][kiz] | Field experiment, 103 learners | Full text |
| [Hershfield, Shu, Benartzi, working paper 2018, published *Marketing Science* 2020][hsb] | Field experiment, thousands of app users | Abstract and introduction |
| [Hibbard, Slovic, Peters, Finucane 2002, *Health Services Research*][hib] | Four experiments, 162 employees | Full text (PMC) |

Leads only, not cited for any claim:
- The OECD/IOPS paper on pension projections. The PDF would not extract.
- Kaufmann, Weber & Haisley 2013, *Management Science*. Abstract only, on showing risk by sampling.
- Newall & Parker 2019. Not opened; known from the project's earlier report.
- The CMA comparison-tools study. Not opened this session.

[jach]: https://ideas.repec.org/a/cup/bpubpo/v3y2019i02p159-186_00.html
[mck]: https://researchconnect.stonybrook.edu/en/publications/recommendations-implicit-in-policy-defaults/
[forrt]: https://forrt.org/flora-replication-atlas/doi/10.1111/j.1467-9280.2008.02057.x/
[vdb]: https://www.repository.cam.ac.uk/handle/1810/304699
[fest]: https://www.netspar.nl/wp-content/uploads/gravity_forms/429-08688e63a69b1fa0132d97715fee501c/2025/08/PensionDay_Festjens.pdf
[ec]: https://finance.ec.europa.eu/system/files/2020-02/200227-consumer-testing-services-report_en.pdf
[fca]: https://www.fca.org.uk/publication/occasional-papers/occasional-paper-32.pdf
[sec]: https://www.sec.gov/files/visual-aids-2022-02.pdf
[nl]: https://discovery.ucl.ac.uk/id/eprint/1473283/7/Love_Newall_nudgingInvestorsManuscriptREVISIONS%20doc.pdf
[boi]: https://boi.org.il/media/eowlwjcw/dp202412h.pdf
[bull]: https://comm.osu.edu/sites/comm.osu.edu/files/PUS%202019-%20Bullock%20et%20al..pdf
[akl]: https://www.cochrane.org/CD006776/COMMUN_using-alternative-statistical-formats-presenting-risks-and-risk-reductions
[asic]: https://asic.gov.au/regulatory-resources/find-a-document/reports/rep-632-disclosure-why-it-shouldn-t-be-the-default
[kiz]: https://www.cs.mcgill.ca/~jeromew/data/COMP766/CHI2016/p2390-kizilcec.pdf
[hsb]: https://anderson-review.ucla.edu/wp-content/uploads/2021/03/Hershfield_Shu_Benartzi_2018_SSRN-id3097468.pdf
[hib]: https://pmc.ncbi.nlm.nih.gov/articles/PMC1430368/
