# Design review of the release 1 mockups, 2026-10-23

The founder asked for a design critique and an accessibility review of every mockup screen on the canvas (https://claude.ai/artifact/T2WWNHiNhqXxSkmssTFbCS), followed by fixes. The method is the design plugin's `design-critique` and `accessibility-review` skills. Each screen was rendered at its own width with headless Chromium and checked against `docs/design-system.md` and WCAG 2.1 AA.

`CLAUDE.md` lists accessibility work as out of scope for this project. This review was run because the founder asked for it. It is a quality pass, so that friends can read and use the site on any phone; it is not a compliance audit.

Screens: guide page (phone, PC), number sheet (phone), values sheet (phone), company page (phone, PC).

---

## Design critique

### Overall impression

The dark, quiet look works, and the three number styles read clearly. The headline number and the graph draw the eye first, which is right for the guide page. The biggest gaps are noise in the body text (rule codes inside sentences) and a hard-to-scan readout under the graph.

### Usability

| # | Finding | Severity | Fix |
|---|---|---|---|
| C1 | Rule codes ("KGL-06") sit inside sentences. They break the reading flow, and on a phone they push punctuation onto its own line. | 🟡 Moderate | Rule chips go at the end of the paragraph, on one quiet line ("כללים: KGL-06 · TXK-03"), never mid-sentence. Design-system rule changed (3.2). |
| C2 | The readout under the graph runs as one wrapped line of labels, numbers and a tag, so values are hard to find. | 🟡 Moderate | The readout becomes a two-column list, label on the start side and value on the end side, one row each, with any tag after its value. |
| C3 | The sliders draw a dark box under the track (a CSS class clashed with the decoder's track rows). | 🔴 Critical (visual bug) | Renamed the slider parts (`slider-track`, `slider-fill`, `slider-thumb`). |
| C4 | On the PC company table, every fee cell wraps "עוד לא מוצג" onto two lines, a whole column of the same note. | 🟢 Minor | The fee column is left out until the regulator's fee fields are confirmed; the callout above the table already says so. |
| C5 | An open-question code in brackets at the end of a sentence ("(שאלה פתוחה PEN OQ7)") reads awkwardly and is fragile in mixed-direction text. | 🟢 Minor | No brackets around codes: "שאלה פתוחה: PEN OQ7". Added to the copy conventions. |
| C6 | Some sheet and callout copy is stiff ("שהמס הוא על הרווח הריאלי, האתר יודע…"). | 🟢 Minor | Rewritten in the copy pass (`docs/copy.md`). |
| C7 | The phone guide and decoder artboards are taller than their content, so the footer floats far below it. | 🟢 Minor | Artboard heights trimmed. |

### Visual hierarchy

- **First look:** the headline number on the guide page, then the graph. Correct.
- **Reading order:** right to left and top down, matching the section order. The PC side index sits on the right where the eye starts.
- **Emphasis:** the blue "entered by you" chip stands out from the other values as intended. The amber "מוסדי" tags are slightly louder than the text they qualify; acceptable, since they flag weaker sources.

### Consistency

| Element | Issue | Fix |
|---|---|---|
| "Show as table" | On the phone it is a row, on PC a link | Both are a disclosure button with a chevron |
| Section chips, value chips | Different heights (34 px and 36 px) | Both 44 px on a phone |

### What works well

- The three number styles are distinct without colour alone (solid, dotted, highlighted).
- Blocked and secondary-source states carry an icon and a word every time.
- Same-name tracks grouped under one banner make the founder's Meitav question answerable at a glance.
- The PC guide page's inputs-beside-graph layout keeps cause and effect in one view.

---

## Accessibility review (WCAG 2.1 AA)

**Issues found:** 11. **Critical:** 2. **Major:** 5. **Minor:** 4.

### Perceivable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| A1 | Placeholder text uses the browser default grey, about 3.9:1 on the card | 1.4.3 Contrast | 🟡 Major | `::placeholder` uses `muted-foreground` (6.77:1) |
| A2 | The graph has a text label but its values are only in the graph and the readout | 1.1.1 Non-text content | 🟢 Minor | Already covered by "הצגה כטבלה"; the table is now a real disclosure button (A8) |
| A3 | Background content behind an open sheet is still announced by screen readers | 1.3.1 Info and relationships | 🟢 Minor | Background marked `inert`; sheet marked `aria-modal="true"` |

### Operable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| A4 | Input fields remove the focus outline and nothing replaces it | 2.4.7 Focus visible | 🔴 Critical | A 2 px `ring` outline on the field box when its input has focus; a global `:focus-visible` outline |
| A5 | Tappable numbers are `span`s, so a keyboard cannot reach them or open their source | 2.1.1 Keyboard | 🔴 Critical | Numbers are `button`s with an accessible name ("1.05%, ממקור, פרטים") |
| A6 | Rule chips, section chips and the real/nominal switch are `span`s | 2.1.1 Keyboard | 🟡 Major | Rule chips and section chips are links; the switch is two buttons with `aria-pressed` |
| A7 | Section chips (34 px), value chips (36 px), rule chips (22 px), the reset link (28 px) and footer links are below the 44 px target | 2.5.5 Target size | 🟡 Major | Chips at 44 px on a phone; rule chips and inline numbers keep their visual size and get a 44 px invisible hit area; footer links padded |

### Understandable

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| A8 | "הצגה כטבלה" is a plain `div` with a chevron | 3.2.1, 4.1.2 | 🟢 Minor | A `button` with `aria-expanded` |
| A9 | Error text for inputs is specified in the briefs but not in the mockups | 3.3.1 Error identification | 🟢 Minor | Specified in `docs/copy.md` (errors); a mockup of an error state is in the values sheet |

### Robust

| # | Issue | Criterion | Severity | Fix |
|---|---|---|---|---|
| A10 | The segmented controls have no role or state | 4.1.2 Name, role, value | 🟡 Major | `role="group"` with a label, buttons with `aria-pressed` |
| A11 | Icon buttons in the background of the sheet artboards are `span`s with no name | 4.1.2 | 🟡 Major | Real buttons with `aria-label`, inside the inert background |

### Colour contrast check

Every token pair was measured when the palette was made (`docs/design-system.md` 2.2). The mockups add:

| Element | Foreground | Background | Ratio | Required | Pass |
|---|---|---|---|---|---|
| Body text | #f2f0ec | #100f0d | 16.8:1 | 4.5:1 | ✅ |
| Quiet text on the same-name group | #a19e98 | about #23180f | 6.4:1 | 4.5:1 | ✅ |
| Placeholder (before) | browser grey | #171614 | about 3.9:1 | 4.5:1 | ❌, fixed (A1) |
| Graph axis labels | #a19e98 | #171614 | 6.8:1 | 4.5:1 | ✅ |
| Blocked callout text | #fed0c9 | #400405 | 12.1:1 | 4.5:1 | ✅ |

### Keyboard navigation (after fixes)

| Element | Tab order | Enter / Space | Escape | Arrow keys |
|---|---|---|---|---|
| Header | site name, search, menu (phone) or links | open | — | — |
| Section chips | in reading order (right to left) | jump to section | — | — |
| Numbers and rule chips | in text order | open the sheet or card | close it, focus returns to the number | — |
| Values sheet | first field gets focus on open | — | close | slider: change value |
| Real/nominal switch | after the graph title | select | — | move between the two |

### Screen reader (after fixes)

| Element | Announced as |
|---|---|
| A number | "387,092.76 שקלים, מחושב, כפתור" |
| A rule chip | "כלל KGL-06, קישור" |
| The graph | "גרף: הכסף לאורך הזמן" plus the table button |
| A blocked row | "קיזוז הפסדים, חסום, שאלה פתוחה TXK OQ10" |

### Not tested

Real devices with VoiceOver and TalkBack, and 200% zoom on the built pages. The mockups have fixed widths; the built site uses the fluid layout in the design system. These go into the release 1 test pass with the qa-engineer.
