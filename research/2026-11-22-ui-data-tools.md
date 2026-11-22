# Interface design for data-heavy tools, phone and computer (research, 22.11.2026)

## Summary

Most of what the research says about data-heavy tools is already in our guidelines: answers in under 100 ms, no spinner for short waits, errors shown when the hand rests, a table on a computer, words in the column head, nothing that needs hover, 44 px targets, and how errors and empty states are worded. Six things are missing or weak, ranked here by how much they would help the readers. (1) **Dark only makes small text harder to read.** In controlled experiments, light text on dark was read worse than dark on light, and the gap grew as the text got smaller. Our 13 px grey hints under fields sit where that cost is highest. (2) **The site's main destinations are hidden behind a menu icon** on phones and on computer windows under 1280 px. In a 179-person study, people used hidden navigation on a computer in 27% of tasks, against 48% for visible navigation. (3) **Nothing checks the widths in between** (391 to 1439 px). That is where the layout switches and where tablets and small laptop windows fall. (4) **A starting value reads as the site's advice.** The copy already says "לדוגמה, לא תחזית", but no guideline requires it. (5) **On a computer, attention goes to the start side and the top,** so the result should sit there and stay in view. (6) **Pick a table or a chart by what the reader has to do.** I found no research on Hebrew screen type (size, line length, line height), so the Hebrew rules rest on Latin research and convention.

**How I worked.** First I read the guidelines named in the brief, `docs/design-system.md` (sections 2, 3.1 and 3.3), `docs/copy.md` 10.6, this morning's kit report, and the code behind the header (`site/app/components/shell.tsx`). Then, for each of the nine topics in the brief, I searched in a fixed order: NN/g, Baymard, peer-reviewed work (abstracts read through the Europe PMC and RePEc APIs), GOV.UK, Apple and Material/Android. This session had no shell. So I could not run FlareSolverr, open the built site or take screenshots, and PubMed, PMC and the ACM library refused direct reads. Everything marked *observed* comes from the code and the docs, not from the running pages. I list only sources I opened. Seven papers I could read only at abstract level and one only through a summary; each entry says so. Lines marked **(inference)** are my own reasoning.

---

## 1. Dark only: small grey text costs the most

**The practice.** Text on a dark background is read less well than the same text on a light background, and the smaller the text, the bigger the gap. A dark-only site makes up for it with size: whatever the reader needs in order to choose stays well above the minimum.

**The evidence.**
- *Size makes it worse.* Proofreading was better with dark text on light, and the advantage grew as the text got smaller, across 8, 10, 12 and 14 pt. The authors: "Especially with small font sizes, negative polarity displays should be avoided." Their application section names smartphones ([Piepenbrock, Mayr & Buchner 2014, *Human Factors*][pmb2014]; lab experiment; abstract only; strong for which way the effect runs).
- *All ages.* Younger and older adults both did better with dark on light, in sharpness of sight and in proofreading ([Piepenbrock et al. 2013, *Ergonomics*][pmb2013]; lab, two age groups; abstract only). Older readers are among the friends and family **(inference)**.
- *Why it happens.* With dark on light the pupil is smaller and proofreading is better ([Piepenbrock et al. 2014, *Ergonomics*][pmb2014b]; abstract only).
- *A dark room is the worst case.* For words read at a glance, light text on dark in a dark room was the least legible. Every condition in bright light, and dark text in a dark room, did better ([Dobres, Chahine & Reimer 2017, *Applied Ergonomics*][dobres]; lab; abstract only). The hard case is a phone in bed at night, not sunlight **(inference)**.
- *Size in general.* In an eye-tracking study (n=104, Wikipedia articles), readability and comprehension "improved continuously" up to 18 pt. Smaller fonts brought longer reading and lower comprehension, and line spacing made little difference ([Rello, Pielot & Marcos, CHI 2016][rello]; read through a summary that quotes the paper; moderate, one study).
- *Convention.* Apple's dark-mode guidance: "strive for a contrast ratio of 7:1, especially in small text" ([Apple HIG, Dark Mode][hig-dark]).

**Where our guidelines stand.** In part. `guidelines/design.md:89-91` sets "No text under 13 px; body 16 px". *Observed:*
- Field hints are `text-xs muted-foreground`: 13 px grey (`docs/design-system.md:376`). So are captions, source dates and axis ticks (`docs/design-system.md:195`).
- `docs/copy.md` 10.6 says a hint tells "what the value is and why the site asks". The reader needs that, yet it is drawn at the size where the dark-background cost is highest.
- The grey's contrast was measured with the darker neutral-400 (6.77 on the card, `docs/design-system.md:131`). The neutral-300 in use is lighter, so it is higher, but no measured figure shows that it reaches 7:1.

**Proposed guideline line** (design.md, Type): "**Dark only costs small text most.** What the reader needs in order to choose, a hint or a condition included, is at least 14 px. 13 px is only for what can be missed: an axis tick, a source's date. Small grey text reaches 7:1 on its surface."

**What it costs.** Hints take a little more height, and some phone rows may wrap. Rello's study would also support 18 px guide prose on a computer, but it is one study **(inference)**. Try it on one guide page before it becomes a rule.

## 2. Show the destinations instead of hiding them

**The practice.** A site's main destinations are visible links, not hidden behind a menu icon: always on a computer, and on a phone when there are about five or fewer.

**The evidence.** NN/g's measured study (179 people, six live sites, computer and phone, 2016):
- On a computer, people used hidden navigation in 27% of tasks, against 48% for visible and 50% for partly visible.
- Hidden navigation made computer tasks at least 39% slower. On both devices it made content more than 20% less likely to be found.
- On phones, people used hidden navigation in 57% of tasks, against 86% for partly visible.

NN/g's advice: on a computer, never hide it. On a phone, show up to four or five top destinations, and where a menu must stay hidden, give it a visible word ([NN/g, hidden navigation][nn-hamb]; [phone follow-up][nn-hamb-m]; [computer follow-up][nn-hamb-d]). Moderate to strong: large and measured, but ten years old, and tested on news and shop sites.

**Where our guidelines stand.** Missing: the guidelines don't mention navigation. *Observed:*
- The five doors ("מדריך", "חברות ומסלולים", "השקעה במדד", "עמלות", "חוקים וכללים") show in the header only from 1280 px, and only when they fit (`site/app/components/shell.tsx:163`).
- Below that, an icon button with no word opens them (`shell.tsx:178`; `docs/design-system.md:327`).
- Only the first page lists the doors in the page itself.

So on every inner page, a phone reader, or a reader on a laptop window under 1280 px, sees no door to the other tools until they open the menu.

**Proposed guideline line** (design.md, Phones / Computers): "**The doors are always in sight.** On a computer every door shows in the header at every width. On a phone the doors show as a strip under the header (it may scroll sideways), and the menu holds what is behind the scenes. A menu button carries a word as well as its icon." The header is a page change, so the founder decides.

**What it costs.** About 40 px of height on a phone, or a scrolling strip that must not look cut off. On a computer between 1024 and 1279 px, the header needs shorter door names or a narrower search field.

## 3. Check the widths in between

**The practice.** Design and test for each class of window width, not only a phone and one computer. Android and Material split widths into compact (under 600), medium (600–839), expanded (840–1199), large (1200–1599) and extra-large (1600 and over). Their advice is to lay out the expanded class first, then decide what medium needs ([Android, window size classes][android-wsc]; platform convention, current).

**The evidence.** This is convention, not a user study. The real reason is our own breakpoints **(inference)**: tables become tables at 768 px, guide pages gain their side index at 1024 px, and the header changes at 1280 px (`docs/design-system.md:224`). Each switch is a place where a layout can break.

**Where our guidelines stand.** In part. `guidelines/design.md:17-21` checks "at 1440 px and 390 px", and the layout check loads 1440, 390 and 320. *Observed:* nothing loads a width between 391 and 1439 px, so none of the three switches is ever tested. A tablet held upright (about 820 px), a tablet held sideways or a small laptop (about 1024–1280 px), and a half-screen window on a computer all fall in that gap.

**Proposed guideline line** (design.md, step 4): "Check it at 1440, 1024, 820, 390 and 320 px; the layout check loads all five." If the founder prefers a principle: "at each width where the page changes its layout".

**What it costs.** Two more widths in the layout and chart checks, so `npm run check` takes longer.

## 4. A starting value reads as the site's advice

**The practice.** People read a preset value as what the designer recommends, and they mostly keep it. Where the site presets a return, a period or a chosen option, words say why that value is there.

**The evidence.**
- In four experiments, one of them on retirement saving, "people perceive the default as indicating the recommended course of action". That reading caused people to stay with the default ([McKenzie, Liersch & Finkelstein 2006, *Psychological Science*][mckenzie]; experiments; abstract only; strong).
- A meta-analysis of 58 studies (n=73,675) found a large default effect (d=0.68). It was strongest when the default is "seen as conveying what the choice architect thinks" the person should do ([Jachimowicz et al. 2019, *Behavioural Public Policy*][jach]; meta-analysis; abstract only; strong).

The money-decisions track may cover the behaviour. This finding covers only how it shows on screen.

**Where our guidelines stand.** Done in practice, missing from the guidelines. *Observed:*
- The copy already says it in five places: "הנחה של האתר, לא תחזית", "תשואה לדוגמה, לא תחזית" (`site/app/copy.ts:3373, 3652, 3708, 4812, 5565`).
- The guidelines tell a field's default to look like plain typing, with no tag (`guidelines/charts.md:119-126`).
- They ask for words only where the *reader* assumed a return (`guidelines/wording.md:118-120`).
- Nothing requires words for the site's own example, or for an option that starts chosen. A new page could leave them out and break no rule.

**Proposed guideline line** (charts.md, beside "A field's starting value is a default"): "**A default says it is an example.** A starting value that shapes the answer (a return, a period) has words beside it saying it is an example, not a forecast or advice. When a list starts with one option chosen, the page says why that one."

**What it costs.** One short line per tool, mostly already written. It pulls against the kit report's call for fewer words; one line per tool, not one per field, is the balance **(inference)**.

## 5. On a computer, the answer is at the start and stays in view

**The practice.** On a wide screen, people look mostly at the side where lines start and at the first screen. The answer goes there, and the result stays in view while the controls change it.

**The evidence.**
- On a 1920 px screen, 80% of fixations fell on the left half (eyetracking, over 120 people, over 130,000 fixations; [NN/g 2017][nn-left]).
- 57% of viewing time went to the first screenful and 74% to the first two ([NN/g 2018][nn-scroll]).
- Right to left: NN/g reports a mirrored pattern, with more attention on the right, from Arabic sessions ([NN/g, F-pattern][nn-f]). Its Israeli studies used no eyetracking ([NN/g 2010][nn-left-2010]). So the evidence is moderate for left-to-right pages and weak for Hebrew.
- Baymard's review of large screens advises keeping a summary fixed in a side column, rather than adding new content ([Baymard 2015][baymard-up]; benchmark of 50 sites; weak, old).

**Where our guidelines stand.** In part. `guidelines/design.md:42-44` says a computer page shows more side by side. `docs/design-system.md:226` puts the main thing first, which settles the order down the page. Neither says which *side* carries the answer, or that the result stays in view while the controls scroll.

**Proposed guideline line** (design.md, Computers): "The answer stands at the start (right) and at the top; what can be missed goes to the end side. On a long page whose controls change a result, the result stays in view while they change."

**What it costs.** Some pages would hold their result in a sticky column. That needs layout work and care with the stacking rules (`guidelines/design.md:189-193`). A sticky result must never cover a field on a short screen.

## 6. A table or a chart, by what the reader must do

**The practice.** When the reader needs exact figures, especially across many options, a table does as well as a chart or better. When the reader needs a relation (which part is biggest, how a sum grows, where two lines cross), a chart does better.

**The evidence.**
- Performance improved when the display matched the task, and participants "preferred to use tables rather than graphs" ([Vessey & Galletta 1991, *Information Systems Research*][vessey]; lab, n=128; abstract only; moderate, old).
- A later paper summarises the record: tables are as good or better for reading single values, graphs often better for relations. In its own experiments, graphs were faster for relations but less flexible across tasks ([Braithwaite & Goldstone 2013, *Frontiers in Psychology*][bg2013]; two experiments, n=127 and 43).

**Where our guidelines stand.** In part. `guidelines/charts.md:16-19` starts from the reader's choice and prefers a sentence or one number when there is none. `charts.md:113-114` treats "a table that only decodes the chart" as a sign of missing labels. Neither says when a table should replace a chart.

**Proposed guideline line** (charts.md, Before drawing): "Exact figures across many options go in a sorted table. A chart is for a shape: which part is biggest, how a sum grows, where lines cross."

**What it costs.** Nothing to build. It may retire a chart or two whose job is really a table's.

---

## Already covered: the evidence agrees

- **Response time.** 0.1 s feels instant, and a wait under a second needs no indicator ([Nielsen 1993, updated 2014][nn-rt]). Matches `guidelines/design.md:36-37` and `:172`.
- **Number fields.** `type="text"` with `inputmode`, never `type="number"`, and the unit outside the box ([GOV.UK text input][govuk-ti]; guidance, little research cited). Matches `design.md:136-141`.
- **Tables.** Freeze the heads, put a readable name first, and help the eye keep its row ([NN/g, data tables, 2022][nn-tables]). Matches `design.md:215-245` and the sticky heads in design-system 2.5.
- **Errors and empty states.** `docs/copy.md` 10.6 already says what went wrong and what to do.
- **Steppers.** NN/g advises that on a computer the arrow keys step a number ([NN/g 2018][nn-step]; expert guidance, weak). *Observed:* `FigureField` already steps with ↑ and ↓ (`site/app/components/kit/figure-field.tsx:375`), and the kit's `NumberField` does not. That is a small kit change, not a guideline.
- **Hebrew letter spacing.** I found no study against "no letter-spacing on Hebrew". The Hebrew spacing research is about children and dyslexia.

**Noticed in passing.** `docs/design-system.md:493` says numbers in a table have "₪ to their left". Section 2.7 (`:293`) puts the sign on the number's right. One of them is wrong: check the page.

**Gaps.** I found no Hebrew study of screen font size, line length or line height. The 38rem measure and the 1.7 line height rest on Latin research and convention. Nothing here touches the il-finance rule base.

## Sources

[pmb2014]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:25141597&resultType=core&format=json
[pmb2013]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:23654206&resultType=core&format=json
[pmb2014b]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:25135324&resultType=core&format=json
[dobres]: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:28166901&resultType=core&format=json
[rello]: https://editingresearch.byu.edu/?p=10398
[hig-dark]: https://developer.apple.com/design/human-interface-guidelines/dark-mode
[nn-hamb]: https://www.nngroup.com/articles/hamburger-menus/
[nn-hamb-m]: https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/
[nn-hamb-d]: https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/
[android-wsc]: https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
[mckenzie]: https://researchconnect.stonybrook.edu/en/publications/recommendations-implicit-in-policy-defaults/
[jach]: https://ideas.repec.org/a/cup/bpubpo/v3y2019i02p159-186_00.html
[nn-left]: https://www.nngroup.com/articles/horizontal-attention-leans-left/
[nn-left-2010]: https://www.nngroup.com/articles/horizontal-attention-original-research/
[nn-scroll]: https://www.nngroup.com/articles/scrolling-and-attention/
[nn-f]: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
[baymard-up]: https://baymard.com/blog/responsive-upscaling
[vessey]: https://ideas.repec.org/a/inm/orisre/v2y1991i1p63-84.html
[bg2013]: https://www.frontiersin.org/articles/10.3389/fpsyg.2013.00980/full
[nn-rt]: https://www.nngroup.com/articles/response-times-3-important-limits/
[govuk-ti]: https://design-system.service.gov.uk/components/text-input/
[nn-tables]: https://www.nngroup.com/articles/data-tables/
[nn-step]: https://www.nngroup.com/articles/input-steppers/

- Piepenbrock, Mayr & Buchner 2014, "Positive display polarity is particularly advantageous for small character sizes", *Human Factors* 56(5):942–951, doi:10.1177/0018720813515509. Abstract via Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:25141597&resultType=core&format=json (lab experiment; abstract only)
- Piepenbrock, Mayr, Mund & Buchner 2013, "Positive display polarity is advantageous for both younger and older adults", *Ergonomics*, doi:10.1080/00140139.2013.790485. https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:23654206&resultType=core&format=json (lab, two age groups; abstract only)
- Piepenbrock, Mayr & Buchner 2014, "Smaller pupil size and better proofreading performance with positive than with negative polarity displays", *Ergonomics*, doi:10.1080/00140139.2014.948496. https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:25135324&resultType=core&format=json (abstract only)
- Dobres, Chahine & Reimer 2017, "Effects of ambient illumination, contrast polarity, and letter size on text legibility under glance-like reading", *Applied Ergonomics* 60:68–73. https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:28166901&resultType=core&format=json (lab; abstract only)
- Rello, Pielot & Marcos 2016, "Make it big! The effect of font size and line spacing on online readability", CHI 2016, doi:10.1145/2858036.2858204. Read through BYU Editing Research's summary, which quotes p. 3646: https://editingresearch.byu.edu/?p=10398 (eye tracking, n=104)
- Apple Human Interface Guidelines, Dark Mode (current): https://developer.apple.com/design/human-interface-guidelines/dark-mode (read through its JSON data)
- NN/g, Pernice & Budiu 2016, "Hamburger menus and hidden navigation hurt UX metrics": https://www.nngroup.com/articles/hamburger-menus/ (measured remote study, n=179, 6 sites). Follow-ups: https://www.nngroup.com/articles/find-navigation-mobile-even-hamburger/ and https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/
- Android Developers, "Use window size classes" (current): https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes (platform convention)
- McKenzie, Liersch & Finkelstein 2006, "Recommendations implicit in policy defaults", *Psychological Science* 17(5):414–420: https://researchconnect.stonybrook.edu/en/publications/recommendations-implicit-in-policy-defaults/ (four experiments; abstract only)
- Jachimowicz, Duncan, Weber & Johnson 2019, "When and why defaults influence decisions: a meta-analysis of default effects", *Behavioural Public Policy* 3(2):159–186: https://ideas.repec.org/a/cup/bpubpo/v3y2019i02p159-186_00.html (meta-analysis, 58 studies, n=73,675; abstract only)
- NN/g, Fessenden 2017, "Horizontal attention leans left": https://www.nngroup.com/articles/horizontal-attention-leans-left/ (eyetracking, over 120 people). Nielsen 2010, the original research: https://www.nngroup.com/articles/horizontal-attention-original-research/
- NN/g, Fessenden 2018, "Scrolling and attention": https://www.nngroup.com/articles/scrolling-and-attention/ (eyetracking, 120 people)
- NN/g, Pernice 2017 (reviewed 2026), "F-shaped pattern of reading on the web": https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- Baymard, Holst 2015, "Responsive upscaling": https://baymard.com/blog/responsive-upscaling (benchmark, 50 sites)
- Vessey & Galletta 1991, "Cognitive fit: an empirical study of information acquisition", *Information Systems Research* 2(1):63–84: https://ideas.repec.org/a/inm/orisre/v2y1991i1p63-84.html (lab, n=128; abstract only)
- Braithwaite & Goldstone 2013, "Flexibility in data interpretation: effects of representational format", *Frontiers in Psychology* 4:980: https://www.frontiersin.org/articles/10.3389/fpsyg.2013.00980/full (two experiments, n=127 and 43)
- Nielsen 1993, updated 2014, "Response times: the 3 important limits": https://www.nngroup.com/articles/response-times-3-important-limits/
- GOV.UK Design System, Text input (current): https://design-system.service.gov.uk/components/text-input/
- NN/g, Laubheimer 2022, "Data tables: four major user tasks": https://www.nngroup.com/articles/data-tables/
- NN/g, Zhou 2018, "Design guidelines for input steppers": https://www.nngroup.com/articles/input-steppers/ (expert guidance)
