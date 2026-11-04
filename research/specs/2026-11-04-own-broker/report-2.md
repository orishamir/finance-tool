# Report 2: the panel (job 2)

Built option א of `mockups.html` (PC and 390 px): a panel over the index page's comparison that starts from one house's price list or one of its groups. Nothing committed or pushed. `npm run check` passes (typecheck, 1573 tests, validate, build). The engine and the calculation are untouched.

## What was built

- **Panel** (`site/app/components/invest/own-account.tsx`, a Sheet with `sheet-wide` on PC): name field; a "start from" select (shown when the house has groups with numeric prices); three figures through the provenance component (value left, place among the compared rows, difference against the house's own list row), gliding; an ARIA grid "fee | in the price list | what customers paid on average | yours" (list figures with a link to the price list page; the average column is one cell with words and one link to the exchange's fee calculator, no numbers; the one place numbers would go is `site/app/lib/customers-paid.ts`, returning null); an "until when" field (whole years) with a coloured year strip; two stacked cost bars on one scale; the sentence on which fee decides; add / cancel.
- **Group prices** that do not name funds: shown with their words beside the list price, with "להשתמש במחיר הזה". Adopting follows the lead's change: it is recorded on the account (`base.group.adopted`), shown as the person's choice (blue, "הזנתם") with the group's source and an undo ("לחזור למחירון"). A group price with its own end says so on its line.
- **Entry points**: a button on every priced house row (`pair.tsx`), a link on each group sub-row (`GroupPriceRows`/`GroupPriceFold` got an `own` slot; used on the index page and on the brokerage page), a button on the brokerage page beside "compare", and the address `/indices/sp500?house=..&own=..&from=list|group:N` (opens the panel once, then the address is cleaned; checked in a browser).
- **After adding**: the row stands in the comparison in blue with the "הזנתם" tag, "על בסיס <house>, <group>", the difference against the list row, and the fee that decides (`OwnTerms`). An existing entry without a base still opens the old six-field panel.
- **Kit**: `CostStack` rewritten (parts keyed by id and glided one by one with `useGlidingSeries`; a part that falls to zero shrinks in place and keeps its slot; amount written inside a part only where it fits, measured; hover or tap shows name, amount, share and where its price comes from; tap outside lets go; a sliver is drawn larger). New `PeriodStrip` (time left to right, an end label is dropped where it would collide, a stretch too narrow for its words is named under the strip). `useChartPick` gained `clear()`. Both are in the gallery (`/kit`) with a live demo (list / group / yours: a part falls to zero; source on every part).
- **Shared fix (sweep)**: a field's input now fills its box (`align-self: stretch`), so a tap anywhere in the 44 px box lands on it (it was a 27 px text line inside the box, on every field of the site); the compact field box is 44 px high (was 40; also used by the exposure-mode field).
- Support code: `own-account-panel.ts` (`startDraft`, `pointOfBroker`, `stretchesOf`) with `own-account-panel.test.ts`; `editors.tsx` (context, `useDraft`, `Actions`, `EditButton` moved out of `custom-entries.tsx` to avoid a cycle); `ownAccountPath` in `invest.ts`; `baseFrom` reads `group.adopted`.

## The lead's adopt change

Done as specified: `withAdopted(g, fee, on)` replaces `adoptGroupPrice`; `partsOf` treats adopted like `names_fund`; old entries load unchanged; the key is kept through save, load, export and import (round trip in `own-account.test.ts`). The test follows `tests/golden/expected_own_account.py` (5-year stay: trade 314.00, custody 2074.18, left 107611.82).

## What job 1's exports lacked (added)

`FeeLayers.group` now has `key`, `applied`, `adopted`, `adoptable` (replacing `adopt`). Nothing else. The panel runs a second full `buildInvest` (about 100-140 ms) once the hand has rested, because the result must come from the page's own run; the layers (list/group/yours figures) are computed synchronously on every keystroke.

## Measured (production build, headless Chromium, no throttling)

- Field answer, `input` event to the next painted frame, panel open on Excellence, each of the six fields typed: 17 to 32 ms on PC (1280 px) and on a 390 px phone viewport. Under 100 ms.
- The heavy work (`useSettled` 250 ms, then `buildInvest` + result) runs once after the hand rests: one long task of 94 to 138 ms per edit, never between keystrokes.
- Nothing moves: `box-check.mjs /indices/sp500 phone,pc` reports 213 changed boxes, the same count as the run before the panel (the page's re-sorting rows, known). A panel-specific script (`scratchpad/boxes.mjs`: each field filled with 3, then 0.9, boxes of every element compared by identity) at PC and 390 px: no element changed height, none moved vertically except the empty text span inside a bar part (a part that falls to zero); the only width changes are bar parts and the width of the three tile figures (meant to follow their number). The fee rows keep their height (a state slot of 44 px is reserved under each field pair, which is why rows look tall).
- 44 px targets: every entry point 44 px high (39 on the index page, min width 138); fields 44 px boxes with the input filling them; buttons `min-h-target`; the provenance figures have their 44 px hit area (`.num::after`). Still under 44 and not mine: the sheet's close button (36 px) and the chart legend items (20 px, kit's `ChartLegend`), on PC.
- Tap shows what pointing shows: on a 390 px touch viewport, tapping a bar part shows "דמי משמרת: 3,402 ₪ (75% מהפס) / מהמחירון של לאומי"; on PC hovering shows the same box (`tip.mjs`).

## Screenshots (`research/specs/2026-11-04-own-broker/shots-2/`)

`{pc,phone}-list-{top,bottom}.png` (Excellence, from the price list, a bar part picked), `{pc,phone}-leumi-students-adopt-{top,bottom}.png` (Leumi students, both prices adopted, 5-year stay, a part picked), `{pc,phone}-mercantile-top-{top,bottom}.png` (Mercantile Top, group's words and "use this price"), `{pc,phone}-saved-row.png` (the blue row in the comparison), `{pc,phone}-gallery-coststack.png`, `{pc,phone}-gallery-periodstrip.png`. I looked at them; fixed what they showed: stacked compact fields, clipped amounts in tiny parts, a select narrower than the name field, colliding strip end labels ("היום" over "שנה 1"), an unnamed first stretch.

## Structure review (`merge-review.mjs HEAD <working tree>`, 43 files incl. job 1's; 24 code or docs)

New kit piece: `PeriodStrip` (gallery entry added, name in `kit.test.ts`). Components outside the kit, judged:
- `Groups` (brokerage-card), `CustomEntriesHost`: existing, only changed. Kept.
- `Actions`, `EditButton` (editors.tsx): moved from custom-entries.tsx, unchanged in look. Kept.
- `Figures`, `GroupNote`, `YoursCell`, `ListCell`, `Bar`, `OwnAccountPanel`, `OwnAccountButton`, `OwnTerms`, `SourceLink` (own-account.tsx): one-offs of this panel built from kit pieces (`Num`, `CostStack`, `NumberField`, `Button`, `DocLink`, `StatTile`). Kept; `SourceLink` is a one-line wrapper of `DocLink` and could be inlined. `Bar` (label, stack, figure on one row) is the one a second page would reuse; promote when a second use appears.
- Hand-styled pills/cards/literal colours: none reported.

## Open or noticed

- Fee rows are tall (the reserved state line); a denser grid is possible if the founder accepts rows that change height.
- The tip of a bar part can cover the strip's end labels while open (transient).
- The stay must be whole years because the engine refuses a stay that is not on a custody charge boundary.

## Every new string (`site/app/copy.ts`)

```
  /** The link on a sub-row that opens the account panel with this group's prices in the person's column (2026-11-04). */
  ownAccount: "חשבון בתנאים שלכם",
    /** The button on a house's row in the comparison, and the link on a house's page (2026-11-04). */
    open: (house: string) => `חשבון בתנאים שלכם, על בסיס ${house}`,
    panel: {
      title: (house: string) => `${house}, בתנאים שלכם`,
      nameDefault: (house: string) => `${house}, בתנאים שלכם`,
      sub: "מתחילים מהמחירון, ומשנים רק את מה שקיבלתם. כל מה שלא שיניתם נשאר כמו במחירון. החשבון נשמר רק במכשיר הזה ומושווה כמו כל חשבון אחר בעמוד.",
      nameField: "השם של השורה בהשוואה",
      startField: "להתחיל מ",
      startList: (house: string) => `המחירון של ${house}`,
      noWay: (house: string) => `ל${house} אין מחיר לקרן במדד הזה, ולכן אי אפשר לחשב חשבון על בסיסו כאן.`,
      computing: "מחשבים…",
      tileLeft: (years: number) => `נשאר אחרי ${years} שנים`,
      tileLeftNote: "בכסף של היום, אחרי דמי ניהול ומס",
      tilePlace: "המקום בהשוואה",
      tilePlaceValue: (rank: number, of: number) => `${rank} מתוך ${of}`,
      tilePlaceNote: "לפי מה שנשאר בסוף",
      tileDiff: (house: string) => `לעומת המחירון של ${house}`,
      tileDiffNote: "באותה קרן ובאותה תוכנית",
      gridLabel: "העמלות של החשבון: המחירון, מה שהלקוחות שילמו בממוצע, והתנאים שלכם",
      head: { fee: "עמלה", list: "במחירון", avg: "מה שהלקוחות שילמו בממוצע", yours: "שלכם" },
      listLabel: "במחירון",
      yoursLabel: "שלכם",
      listNone: "אין במחירון שורה לסוג הזה של קרן",
      listWord: "המחירון",
      avgBody: (house: string) => `מה שהלקוחות של ${house} שילמו בממוצע מתפרסם בבורסה, לפי גודל התיק. אסור להעתיק את המספרים, ולכן הם לא כאן.`,
      avgLink: "מחשבון העמלות של הבורסה",
      sameAsList: "כמו במחירון",
      fromGroup: (name: string) => `לפי ${name}`,
      groupDoc: "המסמך",
      groupEnds: (months: number) => (months % 12 === 0 ? (months === 12 ? "שנה אחת" : `${months / 12} שנים`) : `${months} חודשים`),
      groupFor: (period: string) => `תקף ${period} מההצטרפות`,
      groupSide: { buy: "בקנייה בלבד", sell: "במכירה בלבד" },
      groupNoFund: "המסמך של הקבוצה לא מזכיר קרנות, ולכן המחיר הזה לא נכנס לחישוב.",
      kinds: { rate: "", exempt: "", discount: "הנחה של", floor: "לא פחות מ", flat: "מחיר קבוע", flat_up_to: "עד", per_share: "לכל מניה", min: "מינימום", max: "מקסימום" } as Record<string, string>,
      cannot: "אי אפשר לחשב חשבון בתנאים האלה.",
      groupWords: (words: string) => `בקבוצה: ${words}`,
      adoptButton: "להשתמש במחיר הזה",
      adoptUndo: "לחזור למחירון",
      adopted: "בחרתם להשתמש במחיר של הקבוצה",
      adoptedAbout: (name: string, words: string) => `${name}: ${words}, לפי בחירתכם`,
      exempt: "פטור",
      field: {
        tradePct: "קנייה ומכירה, אחוז",
        tradeMin: "קנייה ומכירה, מינימום לפעולה",
        custodyPct: "דמי משמרת, אחוז לשנה",
        custodyMin: "דמי משמרת, מינימום לחודש",
        monthlyFee: "דמי ניהול חשבון, ₪ לחודש",
        fxPct: "המרת מטבע, אחוז",
        placeholder: "כמו בבסיס",
      },
      until: {
        label: "כמה שנים נשארים בקבוצה",
        hint: (house: string) => `שדה ריק: כל התוכנית. בסיומן החשבון חוזר למחירון של ${house}.`,
        error: "הזינו מספר שלם של שנים.",
        strip: "השנים של התוכנית: מה מהמחירים מחזיק בכל תקופה",
        today: "היום",
        year: (y: number) => `שנה ${y}`,
        allGroup: "מחירי הקבוצה",
        someGroup: (what: string) => `${what}, במחיר הקבוצה`,
        afterGroup: "המחירון",
      },
      costs: {
        title: "כמה כל עמלה עולה בתוכנית הזאת",
        list: "לפי המחירון",
        yours: "בתנאים שלכם",
        fromList: (house: string) => `מהמחירון של ${house}`,
        fromGroup: (name: string) => `מהמסמך של ${name}`,
        fromYours: "מה שהזנתם",
        computed: "מחושב בחישוב של האתר",
        total: (who: string) => `${who}: סך העמלות של החשבון`,
      },
      decidesLead: (line: string) => `העמלה שמכריעה היא ${line}: בכל התוכנית היא עולה`,
      decidesLess: "פחות בחשבון שלכם מאשר לפי המחירון.",
      decidesMore: "יותר בחשבון שלכם מאשר לפי המחירון.",
      decidesNone: "החשבון שלכם בתנאי המחירון בדיוק, ולכן אין הפרש בין העמלות.",
      add: "הוספה להשוואה",
      basedOn: (house: string, group: string | null) => (group ? `על בסיס ${house}, ${group}` : `על בסיס ${house}`),
      rowDiff: (more: boolean) => (more ? "יותר מהמחירון" : "פחות מהמחירון"),
      rowMainly: (line: string) => `בעיקר מ${line}`,
      houseGone: (house: string) => `${house} כבר לא באתר: השורה שומרת רק את מה שהזנתם.`,
    },
    /** Where a part of a cost bar's price comes from, said in the box that opens on pointing at it or tapping it (2026-11-04). */
    sourceList: (house: string) => `מהמחירון של ${house}`,
    sourceEntered: "מה שהזנתם",
    sourceFund: "מדמי הניהול של הקרן",
    sourceTax: "מחושב לפי כללי המס",
    sourceComputed: "מחושב בחישוב של האתר",
      cost: { trade: "קנייה ומכירה", custody: "דמי משמרת", fixed: "דמי טיפול", fromList: "מהמחירון של בית השקעות לדוגמה", fromGroup: "מהמסמך של קבוצה לדוגמה", fromYours: "מה שהזנתם", states: { list: "המחירון", group: "קבוצה", yours: "שלכם" } as Record<string, string>, stateLabel: "מחירים לדוגמה" },
      strip: { label: "השנים של התוכנית, לדוגמה", first: "מחירי הקבוצה", middle: "קנייה בלבד במחיר הקבוצה", after: "המחירון", today: "היום", year: (y: number) => `שנה ${y}` },
```

Also changed: the gallery text of `uses.CostStack` (extended) and `uses.PeriodStrip` (new).

## Structure review: the lead's verdict (2026-11-04)

About 25 code files, under the threshold for an independent reviewer. Kept: `PeriodStrip` promoted to the kit with its gallery entry; `CostStack` improved in the kit itself, so the indices page's existing bars gain gliding and tap; the panel's own pieces (`Figures`, `GroupNote`, `YoursCell`, `ListCell`, `Bar`, `OwnAccountPanel`, `OwnAccountButton`, `OwnTerms`) are one-offs built from kit pieces; `SourceLink` kept as a one-line wrapper. Nothing sent back. Screenshots compared with the mockup's option א: the lead fixed the group words showing the researcher's reading in brackets, the start label ("על בסיס"), and a saved row reading "0 ₪ פחות מהמחירון" (now "כמו המחירון").
