# Hebrew edit: the "account on your own terms" panel (2026-11-04)

Edited only `site/app/copy.ts`. Read against the screenshots in `shots-2/` (PC and phone, Leumi students adopted, Mercantile Top, Excellence). `npx vitest run site/app`: 65 files, 956 tests pass; no test pinned a changed string.

## The one sweep: מחירון → תעריפון

The panel said "מחירון" 25 times; the rest of the site says "תעריפון" (58 places, including this page's own sub-title "לפי התעריפון של כל בנק ובית השקעות"), and the style guide (section 10.3) fixes "תעריפון" for a bank's or broker's price list. A reader would meet two words for one document on one page. Every "מחירון" in copy.ts is now "תעריפון", including the three `ownAccount` sheet names from the previous commit, `pair.sourceList`, the kit gallery's PeriodStrip text and its samples.

## Sentence by sentence

| Key | Was | Now | Why |
|---|---|---|---|
| `groupPrices.ownAccount` | חשבון בתנאים שלכם | חשבון במחירים האלה | The link sits on a group's row and opens the panel with that group's prices; "בתנאים שלכם" there did not say what it would do. |
| `panel.sub` | מתחילים מהמחירון, ומשנים רק את מה שקיבלתם. כל מה שלא שיניתם… | מתחילים מהתעריפון ומשנים רק את המחירים שקיבלתם בפועל. מה שלא שיניתם נשאר כמו בתעריפון. … | "את מה שקיבלתם" had no object a reader could find: received what? |
| `panel.computing` | מחשבים… | מחשב… | Section 10.1: the site reporting work in progress is singular. |
| `panel.tileLeft` | `נשאר אחרי ${years} שנים` | same, with "שנה אחת" and "שנתיים" | "אחרי 1 שנים", "אחרי 2 שנים" (section 10.4). |
| `panel.tileDiffNote` | באותה קרן ובאותה תוכנית | באותה קרן, לפי התוכנית שלכם | Beside group names like "מרכנתיל טופ", "תוכנית" read as the bank's plan; the page calls the reader's plan "התוכנית שלכם". |
| `panel.listNone` | אין במחירון שורה… | בתעריפון אין שורה… | Term; meaning kept (silence is not zero, so no "no charge"). |
| `panel.avgBody` | מה שהלקוחות של X שילמו בממוצע מתפרסם בבורסה, לפי גודל התיק. אסור להעתיק את המספרים, ולכן הם לא כאן. | הבורסה מפרסמת כמה שילמו לקוחות X בממוצע, לפי גודל התיק. היא אוסרת להעתיק את המספרים, ולכן הם לא כאן. | Same meaning and about the same length (narrow column); now says who forbids copying, which "אסור" left open. |
| `panel.avgLink` | מחשבון העמלות של הבורסה | למחשבון העמלות של הבורסה | Section 10.5: a link to a place is ל־ + the place. |
| `panel.groupEnds` | "2 שנים", "2 חודשים", "1 חודשים" | שנתיים, חודשיים, חודש אחד | Dual and singular forms (section 10.4). |
| `panel.groupNoFund` | …ולכן המחיר הזה לא נכנס לחישוב. | …ולכן האתר לא מחשב את הקרן לפי המחיר הזה. | The button "להשתמש במחיר הזה" sits right under it; "לא נכנס לחישוב" read as final. Now it says the site does not apply it by itself, true whether or not the button shows. |
| `panel.field.placeholder` | כמו בבסיס | בלי שינוי | On a house with no group there is no "על בסיס" field on screen, so "בבסיס" pointed at nothing. Also the placeholder of the years field. |
| `panel.until.hint` | שדה ריק: כל התוכנית. בסיומן החשבון חוזר למחירון של X. | שדה ריק: נשארים בקבוצה לאורך כל התוכנית. כשיוצאים ממנה, החשבון חוזר לתעריפון של X. | "כל התוכנית" did not say what lasts the whole plan; "בסיומן" had no feminine plural to refer to. |
| `panel.until.strip` | השנים של התוכנית: מה מהמחירים מחזיק בכל תקופה | שנות התוכנית: איזה מחיר חל בכל תקופה | "מה מהמחירים מחזיק" is not Hebrew a reader says. |
| `panel.costs.title` | כמה כל עמלה עולה בתוכנית הזאת | כמה כל עמלה עולה לאורך התוכנית שלכם | Same ambiguity as the tile note. |
| `panel.costs.computed`, `pair.sourceComputed` | מחושב בחישוב של האתר | חישוב של האתר | Said "computed" twice. |
| `panel.decidesLead` | העמלה שמכריעה היא X: בכל התוכנית היא עולה | העמלה שההפרש בה הכי גדול היא X: לאורך כל התוכנית היא עולה | "מכריעה" did not say what it decides; the figure is the largest gap. |
| `panel.decidesNone` | החשבון שלכם בתנאי המחירון בדיוק, ולכן אין הפרש בין העמלות. | החשבון שלכם בדיוק בתנאי התעריפון, ולכן אין הפרש בעמלות. | Word order; term. |
| `panel.rowSame` | כמו המחירון | כמו בתעריפון | Grammar ("כמו ב־"). |
| `kit.sample.cost.fixed` | דמי טיפול | דמי ניהול חשבון | The site's word for that fee. |

Unchanged on purpose: titles, `open`, `nameField`, `startField`, `noWay`, the tiles' other words, `adoptButton`, `adopted`, `kinds`, field aria labels, `until.label`, `basedOn`, `rowMainly`, `houseGone`.

## Noticed, not mine to change

- `own-account.tsx` passes `layer.fee` (a key such as `trade`) as `name` to `adoptedAbout(name, words)`, so the sheet of an adopted figure may read "trade: …" instead of a Hebrew fee name.
- Mercantile Top's group words come from the data as "ני״ע (בלי פירוט)" inside brackets, so the cell shows nested brackets "(ני״ע (בלי פירוט))".
