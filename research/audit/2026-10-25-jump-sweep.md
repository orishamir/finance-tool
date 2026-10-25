# Controls that move or do nothing: sweep of 2026-10-25

The founder's report on the first page's question card: "בשביל מה" changed nothing except "כרית ביטחון", and "כרית ביטחון" removed the years field above the chip, so the page moved up under the pointer. Following the standing rule (one flaw means a sweep for its class), `research/audit/tools/jump-check.mjs` was written and run over the 21 main pages at 1280×900 and at 390×844 with touch, on a new device and with a saved goal. It presses every chip, switch, radio, tab, checkbox and disclosure, one at a time on a fresh load, and lists each control that is not where it was after the press, each press after which the page's text is unchanged, and each press after which the page is wider than the screen.

The first runs gave false readings from the tool itself (fixed in the tool, noted here so a later run is read correctly): a locator that found "the nth control" again after the press measured another control; the site's smooth scrolling was still gliding when the first position was read; and the site put back a saved scroll position after each load (which turned out to be a real bug, below).

## Fixed

| Where | What happened | Fix |
|---|---|---|
| First page, question card | The purpose chips sat under the fields; six of seven changed nothing on the card; "כרית ביטחון" hid two fields above itself | The purpose comes first; each purpose asks what it uses (a purchase adds its cost, a child asks the child's age, the cushion asks the sum only) and the card says how many years the comparison assumes when none are typed. "סכום גדול בלי מטרה" removed (it pressed "בלי מטרה מסוימת", the same as choosing nothing). Spec: design-spec 1a, amendment of 2026-10-25 |
| Every page, any fresh load in a tab | The scroll position saved for one page was put back on another (all fresh loads share the history key "default"): a typed address opened 2,900 px down | Positions are kept under the history entry and the address (`root.tsx`, `entryKey`) |
| Pages that keep a choice in the address (providers, funds and switch workbenches) | Pressing such a control scrolled the page to the top: the site's own scroll handler ignored the router's `preventScrollReset` | A change of the query on the same page keeps the place (`root.tsx`) |
| Goal page | The goals board appeared above the form once the first goal held anything, so typing a name or choosing a preset pushed the form down 111 px | The board is shown from the first goal on; no delete button on a lone blank goal |
| Providers workbench | "הצגה כטבלה" pushed the page wider than the screen (a plain `fr` grid column grows to its widest content) | Every two-column page grid uses `minmax(0, …)` columns: providers, funds, switch, fees, comparison, exposure result, idle cash |
| Documents page, phone | Opening "סדרות נתונים" made the page 405 px wide: a source line with a long address could not wrap | The series cards break long words, as the page's other cards did |
| Switch guide, steps | "ראשי (עותק)" sat at the end of a heading; opening it carried the chip to the next line | The line it opens wraps by itself and the chip stays |
| Switch guide, after-switch checklist | The same chip was a button that opened nothing (no host or date is passed there) | A plain tag there |
| Product guides | "סוג ההעסקה" on all 17 guides; it changes something only on the study fund's guide (the deposit tax) | Shown only there. The switch-provider page still reads the saved answer |

## Left as they are

- **Idle cash, "לדייק" closed at the bottom of the page:** the page gets shorter than the screen and the browser pulls it down; nothing above the control changes.
- **Goal form, profile answers ("שכירים", the yes/no about pension and study fund through work):** they change the comparison, not the form; a form field acting on the result is expected.
- **Idle cash, the offer's term before the balance is typed:** the result card already says "מלאו את שני המספרים."
- **Controls pressed while already chosen** (the "all" filters, the default tabs, the chosen tariff level, the chosen sort): nothing to change.
- **Documents tabs on a phone:** the tab row scrolls 13 px to show the chosen tab, on purpose.

Last run (after the fixes): one control moves (the idle-cash case above); the presses that change no text are the ones listed above; no press leaves a page wider than the screen.
