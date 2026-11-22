# Accessibility and right to left (research, 22.11.2026)

## Summary

The site already does most of what the evidence asks for. It isolates numbers, uses logical CSS, sets a dark first paint, has 44 px targets, a visible focus ring and reduced motion. Its text contrast is high (16.8:1). This morning's claim checks out against the paper: in the one survey of Hebrew speakers, 90% preferred a left-to-right slider. Trend graphs (91%) and year ranges (87%) scored the same way. That is preference from a self-selected, LTR-fluent sample, not measured performance. The same authors' later work finds that no direction is best everywhere, and that the design matters more than who the user is. Even so, it is the only direct evidence, and it agrees with the site's charts. So the slider line in `design.md` should change. Four gaps matter more than the rest:
- no guideline sets a contrast floor for controls, and two pairs probably fall below 3:1 (the slider's empty track, and field edges inside a sheet);
- nothing keeps a focused control from hiding under the sticky header;
- `project.md` bans "markup that serves only screen readers", but the kit already has some, and some of it does useful work;
- Israel's accessibility law states that its duties apply "whether for profit or not". Whether a personal site counts as a "public service" is a legal question I can't settle (lead only).

Dark-only costs small text the most. The research favours dark text on light, and the effect is strongest for fine detail.

**How I worked.** I read the guidelines named in the brief, `docs/design-system.md` (sections 2.2 to 2.8), `theme.css`, `app.css` and the kit's slider code, then searched in this order: W3C specifications, WCAG Understanding documents and W3C i18n articles; peer-reviewed work (extended search); WebAIM; Apple and Material; official Israeli texts. This session had no shell, so FlareSolverr was unavailable. ACM, Taylor & Francis and ScienceDirect refused the fetch (403), so for the 2023 to 2026 Goldenberg papers I read only their abstracts (Semantic Scholar, the BGU research portal), not their tables. I opened every source cited below. Lines marked **(inference)** are my own reasoning. Contrast figures marked (inference) are computed from the oklch lightness in `theme.css`: luminance is L³ for these near-greys. The same method reproduces the design-system table's 16.77 and 3.19. Nothing here touches the il-finance rule base.

## Findings, by impact

### 1. Sliders and other quantities run left to right

**The practice.** A slider, a number range, a counter and a chart of quantities run left to right for Hebrew readers. The keys follow the picture: → and ↑ raise the value. Text, layout, navigation and back buttons still mirror.

**The evidence.**
- Goldenberg & Tractinsky, CHI 2021 ([arXiv 2101.08070][gt2021]). This is an online survey of 234 Hebrew speakers, and I checked Table 1 myself. Results, each p<.01:
  - preferred left to right: slider **90%** (z=12.09), trend graph 91%, year range 87%, size range 84%, time range 80%, price range 70%, timeline 69%, bar chart 68%, numeric rating 68%, counter 65%;
  - preferred right to left: star rating (62%), and icons of objects seen side-on (bus, trolley, phone).

  Caveats from the paper:
  - participants were recruited through Facebook and WhatsApp groups, HCI professional communities among them;
  - 99.1% had "a high degree of LTR language proficiency" (any LTR language, not only English, which slightly corrects this morning's "nearly all fluent in English");
  - 129 had some HCI background, and they leaned more right to left than ordinary users;
  - it measured preference, not speed or errors.

  Kind: exploratory survey. Strength: **moderate** (large effects, weak sample).
- The authors' later work, read as abstracts only:
  - an online experiment with 1,705 Arabic and Hebrew users on 16 ambiguous items found that design factors predict how people read an item's direction better than personal or cultural ones ([IJHCS 2025][gt2025], via [BGU portal][bgu]);
  - an eye-tracking study of 30 items found "no single direction is universally best". The best direction depends on expertise and on how speed, errors and satisfaction are weighted ([CHI EA 2025][ouiid]; [IJHCI 2026][ijhci]). I could not see the slider rows of these papers.

  Strength: moderate. It tempers the 2021 result but doesn't reverse it.
- Platform guidance says the opposite: flip sliders and progress bars in right to left ([Apple HIG][hig-rtl]; [Material 1][m1]). Kind: expert guidance. Goldenberg found user preference matched the guidelines on only 3 of 7 items.
- Hebrew speakers place *time* right to left in implicit tasks ([Fuhrman & Boroditsky 2010][fb], via [Fuhrman's thesis][fuhrman]; strong for time). So "Hebrew readers think left to right" is wrong in general. The left-to-right preference covers quantities, numbers and charts, where Hebrew writes mathematics left to right. **(inference)**

**Where our guidelines stand.** In conflict: `guidelines/design.md` lines 157–159 ("It grows from the right"). The working tree on `quiet-slider` already draws the quiet slider `dir="ltr"`, with → raising the value (observed, `fields.tsx` lines 380–419).

**Proposed guideline line.** "A slider runs left to right, like the charts and the numbers in it; → and ↑ raise it. Its value shows once, in its box. A range in words keeps reading order ("0% עד 10%")."

**What it costs.** Small. The `ends` variant and its end values go, and the founder decides. A stepper, if one appears, would put − on the left and + on the right, following the counter item **(inference)**.

### 2. Controls need 3:1 against every surface they sit on

**The practice.** Text needs 4.5:1. The parts that show a control and its state (a field's edge, a slider's track and thumb, a focus ring) need 3:1 against whatever is next to them ([WCAG 1.4.11][u-1411]). A chart line needs 3:1, unless the values are written on the chart.

**The evidence.** W3C Understanding 1.4.11. Kind: standard. Strength: **strong**.

**Where our guidelines stand.** Missing from the guidelines. `design.md` has "Colour never works alone" (lines 87–88) but no contrast floor. `docs/design-system.md` lines 126–143 list pairs on `background` only for controls. Two pairs it doesn't list (inference, computed):
- the slider's unfilled track (`--slider-track`, neutral-800) on `card` is about **1.4:1**;
- the field edge (`--input`, neutral-600) on `popover`, the sheet surface, is about **2.8:1**. It is 3.19 on the background and 3.0 on a card.

The thumb and the filled part are well above 3:1, so the slider's state still reads. Once the end values go (finding 1), though, the faint track is the only sign of how far the scale runs. **(inference)**

**Proposed guideline line.** "Text 4.5:1 and a control's edges and marks 3:1 against the surface they sit on (background, card or sheet); the legibility table lists every pair, and a test holds it."

**What it costs.** A few rows in the table and a ratchet test. Possibly one step lighter for the track and for field edges in sheets.

### 3. Israel's accessibility rules: what the official texts say (a lead, not a legal opinion)

**What the texts say.**
- The law, as amended in 2005 (official [Sefer HaChukim 1995, 7.4.2005][law2005]):
  - section 19ד: the duties apply "בין אם ... הם למטרת רווח ובין שלא למטרת רווח, בין אם נגבה תשלום ... ובין שלא נגבה";
  - section 19ה defines "שירות ציבורי" as, among others, a service "המיועד לכלל הציבור או לחלק בלתי מסוים ממנו".
- The internet regulations (regulation 35 and onwards). I could read only the [Knesset committee's discussion draft of 5.9.2017][reg2017], not the final text in Reshumot:
  - a "חייב" must make its internet service accessible to Israeli Standard 5568 "ברמה AA" (35א);
  - an exempt dealer (עוסק פטור), or one whose average yearly turnover is up to 100,000 ₪, is exempt (35ו(ו));
  - a service open only to people registered in advance, with at most 500 registered, is exempt unless a person with a disability asks (35ו(ה)). The site needs no registration, so this one doesn't fit.
- IS 5568 Part 1 is in its 2023 edition, published 28.9.2023, Reshumot Y.P. 11720 ([Standards Institution][sii]). Its page doesn't say which WCAG version it follows.

**Where our guidelines stand.** `guidelines/project.md` lines 12–16: "Non-commercial: no accessibility, legal or commercial work". The law's own words say being non-profit is not by itself the test. Whether a personal site meant for a known group, but open to anyone, is a "public service" by a "חייב", and whether the turnover exemption reaches a private person with no business, the texts I read don't settle. **(inference)**

**Proposed guideline line.** None. This is the founder's question, for a lawyer or the Commission if he wants certainty.

**What it costs.** Nothing now.

### 4. A focused control is never hidden under the sticky header

**The practice.** When keyboard focus moves, the focused control must not be fully covered by sticky headers or bars ([WCAG 2.4.11][u-2411], AA). One sufficient technique is CSS `scroll-padding` (C43).

**The evidence.** W3C Understanding. Kind: standard. Strength: strong.

**Where our guidelines stand.** Missing. `project.md` line 14 counts "use by keyboard on a computer" as ordinary engineering. `app.css` lines 206–213 clear the header only for in-page anchors (`scroll-margin-top`), not for focus moved by Tab (observed). Tabbing backwards up a page can probably leave a control under the 56–64 px header, or under a phone's bottom bar. **(inference, not tested)**

**Proposed guideline line.** "The page's scroll padding clears every sticky bar, so Tab never leaves focus under one."

**What it costs.** Two CSS lines on `html`, and one check in the layout script.

### 5. Screen readers: what the site already gives them, and the `project.md` line

**The practice.** Screen readers read the DOM in logical order. Real elements, accessible names and logical text order carry most of the load. Live regions and screen-reader-only text are the extras.

**The evidence.**
- Screen-reader users ([WebAIM survey #10][webaim], Dec 2023–Jan 2024, n=1,539, self-selected; moderate):
  - on phones, 70.6% use VoiceOver and 34.7% TalkBack;
  - on computers, JAWS 40.5% and NVDA 37.7%;
  - in Africa and the Middle East (n=73), 69.9% use NVDA;
  - it has no Hebrew breakdown.
- W3C: always write text in logical order, partly because screen readers read stored text in spoken order ([W3C i18n][visual]; strong as convention).
- Status messages ([WCAG 4.1.3][u-413]) cover messages such as "18 results". The results themselves don't count.
- I found **no** authoritative source on how NVDA, VoiceOver or TalkBack speak ₪, %, dotted dates or FSI/PDI in Hebrew. Only testing on a device would tell.

**Where our guidelines stand.** Partly in conflict.
- `project.md` lines 15–16 leave out "markup that serves only screen readers". The kit has some: a visually hidden `<label>` and an `aria-valuetext` on the slider (observed, `fields.tsx` lines 332, 406).
- These do more than serve screen readers. Tests find elements "by role and words" (`code.md` lines 198–200), and voice control finds a control by its name. On the stepped slider, without `aria-valuetext` a screen reader would announce the track position (0 to 1), not the amount. **(inference)**
- `design-system.md` line 285 spells chart ticks in visual order (`₪ אלף 50`) to work around WebKit. A screen reader, a search or a copy then gets them backwards, against W3C's advice. **(inference)**

**Proposed guideline line** (for `project.md`, the founder's call). "Every control has an accessible name, since tests and voice control use it too. Text that only a screen reader hears, and live regions, are left out."

**What it costs.** Nothing, if the founder keeps the names. Fixing the ticks is a small chart change. Hiding them from the accessibility tree is one attribute, and the chart's table view holds the values.

### 6. Every drag has a tap-only way

**The practice.** Anything done by dragging can also be done with single taps or clicks ([WCAG 2.5.7][u-257], AA). For a slider, tapping the track or typing in a box counts. For a list, "move up or down" buttons count. A keyboard way alone does **not** count.

**The evidence.** W3C Understanding. Kind: standard. Strength: strong.

**Where our guidelines stand.** Done in practice but missing as a principle:
- the slider is a native range, which takes a tap on the track, beside a typed box;
- the fee page reaches every move by touch and keyboard through each row head's menu ("הזזה ימינה" and the like, `design-system.md` line 643).

`design.md` lines 163–165 cover only `touch-action`.

**Proposed guideline line.** "Whatever can be dragged can also be done by taps alone: a box to type in, or a menu with the move."

**What it costs.** Nothing today. It guards future work.

### 7. Dark only: what it costs, and where

**The practice.** Light text on dark is harder to read than dark on light, most of all for small detail. Where dark is chosen, keep text from getting small or thin.

**The evidence.**
- Piepenbrock et al., *Ergonomics* 2013 ([paper][pie2013]): dark-on-light gave better visual acuity and proofreading for younger and older adults alike. Strong for a single experiment.
- Piepenbrock's thesis ([2014][pie2014]): the advantage "is particularly pronounced when the task requires the perception of fine details", because brighter screens shrink the pupil.
- Gazit et al., *Ergonomics* 2025 ([record][gazit]; n=173): cognitive test scores were higher in light mode. Moderate.
- Exceptions: people with cloudy eye media (cataract) read 10–15% better light-on-dark ([Legge et al. 1985, as cited in Piepenbrock 2013][pie2013]).
- "Halation" for people with astigmatism, and contrast "ceilings": I found only blogs and no optical study. Lead only, weak.

**Where our guidelines stand.** Covered as the founder's choice (`design.md` line 61). Existing lines already soften it:
- the foreground is off-white, not pure white;
- body weight is 450;
- the floor is 13 px (`design.md` lines 89–91).

No guideline limits where 13 px may be used.

**Proposed guideline line** (optional). "On the dark page, 13 px is for captions, ticks and dates, never for a sentence the reader needs to choose."

**What it costs.** A review of where `text-xs` holds sentences.

### 8. Bidi of numbers, dates and mixed text

**The practice.**
- Wrap every phrase of the other direction in markup (`<bdi>`, or `dir` on its span).
- Use `dir="auto"` only where the direction is unknown. It goes by the first strong character.
- Use the Unicode isolates (FSI…PDI) only where markup can't go, such as attributes and `<title>` ([W3C inline bidi][bidi]; [W3C controls][controls]).

**The evidence.** W3C i18n articles. Kind: standard guidance. Strength: strong.

**Where our guidelines stand.** Covered:
- `wording.md` lines 112 and 121–123;
- `design.md` lines 166–167 (`dir="auto"`, "never a figure");
- `design-system.md` lines 272–293 (Intl he-IL, isolates, ranges with "עד", dates `22.10.2026`).

The code's `aria-label` uses FSI…PDI as the guideline says (observed, `fields.tsx` line 83). The one exception is the visual-order ticks (finding 5).

**What it costs.** Nothing.

### 9. What mirrors and what doesn't

**The evidence.**
- Apple: flip back and next, motion icons, and controls showing progress. Never flip the digits inside a number, clocks, checkmarks or logos ([HIG][hig-rtl]).
- Material 1: don't mirror media playback, clocks or "charts and graphs"; arrows mirror ([m1][m1]).
- Goldenberg 2021: users preferred left-to-right charts and timelines, and right-to-left side-on object icons.

Expert guidance plus one survey. Moderate.

**Where our guidelines stand.** Covered: `design-system.md` lines 297–308 (mirror chevrons and the external-link arrow; never the check, clock, search or the time axis) and `charts.md` lines 137–139 (axes left to right). A progress bar for steps done would follow reading direction, per Apple. That isn't stated, but the site has none today **(inference)**.

### 10. Hebrew type

**The evidence.** W3C's Hebrew Layout Requirements (editor's draft, [hlreq][hlreq]):
- Hebrew breaks lines at spaces; the maqaf behaves like a hyphen;
- italics are "controversial", and newspapers use bold instead;
- Hebrew *does* use letter-spacing, but for emphasis, not for body text;
- vowelled text may need a larger size and a font that draws the marks.

Apple: Hebrew next to all-caps Latin can look about 2 pt too small ([HIG][hig-rtl]).

**Where our guidelines stand.** Covered: `design.md` lines 89–91 and 197; `design-system.md` lines 206–215. The site has no nikud (observed: none in `site/app`). Acronyms such as "ETF" or "MSCI" inside Hebrew labels are worth a look at their size **(inference)**.

### 11. Reduced motion, target size, reflow, WCAG 3

- **Motion.** WCAG 2.3.3 (AAA) asks that animation triggered by interaction can be turned off ([Understanding][u-233]). Covered: `design.md` lines 204–206, and `design-system.md` line 266 (all movement zero, a short fade for charts).
- **Target size.** 2.5.8 asks for 24 px, with sentence links exempt ([Understanding][u-258]). The site's 44 px exceeds it (`design.md` line 40).
- **Reflow.** Covered by the 320 px layout check.
- **WCAG 3.** The latest Working Draft is dated **10.9.2026**. Its text-contrast requirement reads "@@[contrast measure to be determined]", and APCA is not in it ([WCAG 3.0 WD][wcag3]; [history][wcag3h]). Nothing to change. WCAG 2.2 stays the measure.

## Sources

[gt2021]: https://arxiv.org/abs/2101.08070
[gt2025]: https://www.sciencedirect.com/science/article/abs/pii/S1071581924001666
[bgu]: https://cris.bgu.ac.il/en/persons/noam-tractinsky/
[ouiid]: https://doi.org/10.1145/3706599.3720115
[ijhci]: https://www.bgu.ac.il/en/researcher/noam-tractinsky/publications/344809682/
[hig-rtl]: https://developer.apple.com/design/human-interface-guidelines/right-to-left
[m1]: https://m1.material.io/usability/bidirectionality.html
[fb]: https://doi.org/10.1111/j.1551-6709.2010.01105.x
[fuhrman]: https://purl.stanford.edu/cz142gh0899
[u-1411]: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
[u-2411]: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
[u-257]: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
[u-258]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
[u-413]: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
[u-233]: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
[law2005]: https://fs.knesset.gov.il//16/law/16_lsr_299916.pdf
[reg2017]: https://fs.knesset.gov.il/20/Committees/20_cs_bg_390611.pdf
[sii]: https://www.sii.org.il/he/lobby/standardization/standard-page?id=6751
[webaim]: https://webaim.org/projects/screenreadersurvey10/
[visual]: https://www.w3.org/International/questions/qa-visual-vs-logical
[pie2013]: https://www.psychologie.hhu.de/fileadmin/redaktion/Oeffentliche_Medien/Fakultaeten/Mathematisch-Naturwissenschaftliche_Fakultaet/Psychologie/AAP/Publikationen/2013/Piepenbrock-2013-Positive_display_polarity_is_.pdf
[pie2014]: https://docserv.uni-duesseldorf.de/servlets/DerivateServlet/Derivate-31413
[gazit]: https://eprints.whiterose.ac.uk/id/eprint/231852
[bidi]: https://www.w3.org/International/articles/inline-bidi-markup/
[controls]: https://www.w3.org/International/questions/qa-bidi-unicode-controls
[hlreq]: https://w3c.github.io/hlreq/
[wcag3]: https://www.w3.org/TR/wcag-3.0/
[wcag3h]: https://www.w3.org/standards/history/wcag-3.0

- Goldenberg & Tractinsky, CHI 2021, *Towards the Right Direction in BiDirectional User Interfaces*, doi:10.1145/3411764.3445461. https://arxiv.org/abs/2101.08070 (survey, n=234; Table 1 read in full)
- Goldenberg & Tractinsky, IJHCS 194 (2025) 103383, *Exploring amBiDiguity*. https://www.sciencedirect.com/science/article/abs/pii/S1071581924001666 (experiment, n=1,705; abstract only, the page refused the fetch). Also CHI EA 2023, doi:10.1145/3544549.3585598 (preliminary results)
- Goldenberg, Goldenberg, Borowsky & Tractinsky, CHI EA 2025, *OUIID*. https://doi.org/10.1145/3706599.3720115 and IJHCI 2026, doi:10.1080/10447318.2026.2663079, abstract at https://www.bgu.ac.il/en/researcher/noam-tractinsky/publications/344809682/ (eye-tracking, 30 items; abstracts only)
- BGU research portal, Tractinsky's publications. https://cris.bgu.ac.il/en/persons/noam-tractinsky/
- Fuhrman & Boroditsky, *Cognitive Science* 34(8), 2010. https://doi.org/10.1111/j.1551-6709.2010.01105.x (abstract via Fuhrman's Stanford thesis, https://purl.stanford.edu/cz142gh0899)
- Apple Human Interface Guidelines, Right to left. https://developer.apple.com/design/human-interface-guidelines/right-to-left (read through Apple's JSON of the same page)
- Material Design 1, Bidirectionality. https://m1.material.io/usability/bidirectionality.html
- W3C, Understanding WCAG 2.2: 1.4.11, 2.3.3, 2.4.11, 2.5.7, 2.5.8, 4.1.3 (links above)
- W3C, WCAG 3.0 Working Draft, 10.9.2026. https://www.w3.org/TR/wcag-3.0/ and publication history https://www.w3.org/standards/history/wcag-3.0
- W3C i18n: Inline markup and bidirectional text in HTML; How to use Unicode controls for bidi text; Visual vs. logical ordering of text (links above)
- W3C, Hebrew Layout Requirements, editor's draft. https://w3c.github.io/hlreq/
- WebAIM, Screen Reader User Survey #10, 2024. https://webaim.org/projects/screenreadersurvey10/
- Piepenbrock, Mayr, Mund & Buchner, *Ergonomics* 56(7), 2013, 1116–1124, doi:10.1080/00140139.2013.790485 (author's PDF above)
- Piepenbrock, doctoral thesis, Heinrich-Heine-Universität Düsseldorf, 2014. https://docserv.uni-duesseldorf.de/servlets/DerivateServlet/Derivate-31413
- Gazit et al., *Ergonomics* 69(5), 2026 (online 2025). https://eprints.whiterose.ac.uk/id/eprint/231852
- Equal Rights for Persons with Disabilities Law (Amendment 2), 2005, Sefer HaChukim 1995, 7.4.2005, sections 19ד and 19ה. https://fs.knesset.gov.il//16/law/16_lsr_299916.pdf (official publication; later amendments not checked)
- Service Accessibility Regulations (Amendment) 2017, Knesset Labour Committee discussion draft of 5.9.2017, regulations 35 to 35ו. https://fs.knesset.gov.il/20/Committees/20_cs_bg_390611.pdf (a draft, not the final Reshumot text)
- Standards Institution of Israel, IS 5568 Part 1. https://www.sii.org.il/he/lobby/standardization/standard-page?id=6751
- Leads only, not cited: Kol Zchut and Nevo on the regulations; the Wikipedia claim that the Academy of the Hebrew Language places ₪ before the number (I couldn't find it on the Academy's site); blogs on halation.
