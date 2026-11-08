# How to word things

How to write the words on the site, with examples. The finer Hebrew detail
and the word table are in `docs/copy.md` section 10 (it repeats nothing
here), and every financial term's wording is in `docs/glossary.md`.

## The voice

The site sounds like a friend who understands money and happens to be a
professional. Not a bank, not a blog, not a TV financial adviser.

| Not this | This |
|---|---|
| "ניתן לבצע הפקדה בכל עת" (a form) | "אפשר להפקיד מתי שרוצים" |
| "אל תפספסו! הקרן הזולה ביותר" (sales) | "הקרן הזולה מבין 12 הקרנות שנבדקו" |
| "אנחנו ממליצים" | "לפי המספרים בעמוד, …" or "האתר לא ממליץ על מדד" |

- The site speaks of itself as "האתר", in the third person, never "אנחנו".
- No padding: no "שימו לב", no "נשמח אם", no "אנא", no exclamation marks.
- No promises. The site shows a number and says where it comes from.

## Sentences

1. **Conclusion first, then the reason.** "שווה להתמקח: הורדת העמלה לממוצע
   שווה כ־1,200 ₪ ב־10 שנים." Not the reason first and the verdict at the
   end.
2. **One idea per sentence.** If a sentence has "ו" three times, split it.
3. **Talk about the reader's money**, with their amounts: "נשארים לכם
   4,875 ₪ יותר", not "הקרן משתלמת יותר".
4. **Say only what the screen doesn't already say.** Not the figure in the
   field above, not the heading again, not what the chart shows.
5. **Be as sure as the evidence.** Say what a figure depends on: "בהנחה
   שהתשואה 5% בשנה". Say where the site doesn't know: "החברה לא מפרסמת את
   העמלה הזו". Never present a complicated answer as certain.
6. **Say what can't be answered**, plainly and where the reader is: "האתר לא
   מנחש תשואה, ולכן אין כאן תחזית. מה שאפשר להשוות: העמלות והמס."

## Word choice

- **Address:** plural imperative ("הזינו", "בחרו") or impersonal ("אפשר",
  "כדי לחשב צריך"). "אתם", "שלכם" and "לכם" are fine. Never "אתה", "את" or
  "שלך".
- **Everyday words, not form words:**

  | Not | Instead |
  |---|---|
  | ניתן / לא ניתן | אפשר / אי אפשר |
  | טרם | עוד לא |
  | במידה ו | אם |
  | בכדי | כדי |
  | אינו | לא |
  | לרבות | כולל |

- **One term for one idea, across the whole site.** Use the term in the word
  table (copy.md 10.3) and the glossary. The first time a financial term
  appears on a page, it opens its explanation.
- **Full words.** No abbreviations a reader must decode, no process words
  ("Claude", test names). A code the reader needs, such as a fund's number,
  comes with words that say what it is.
- **Watch for English underneath.** Read it aloud.

  | Sounds translated | Natural Hebrew |
  |---|---|
  | "לא עדיין" | "עוד לא" |
  | "חופשי ממס" | "פטור ממס" |
  | "קלט" | "נתון" |
  | "מהזולה לגבוהה" | "מהזולה ליקרה" |
  | "זה לא הורדה" | "זו לא הורדה" |

## By kind of text

- **Page and section headings** name what the block does, in the reader's
  words: "כמה העמלות עולות לכם". A heading is a question only if the block
  answers it.
- **Buttons:** a short single action is a noun ("שמירה", "ביטול"); an action
  with an object is an infinitive ("להזין ריבית אחרת"). Up to 3 words. Not
  an imperative ("שמרו").
- **Links** start with ל־ and the destination ("לעמוד המדריך", "לכל
  הפרמטרים"), and lead only to what they promise.
- **Labels, column heads, chips:** each says what it is or does, so it is
  understood without an explanation beside it. A chip doesn't repeat the
  unit in its value ("תקופה 10 שנים", not "שנים 10 שנים"). Up to 4 words for
  a chip, 7 for a field label.
- **Field labels** name what to enter, in plain words: "סכום היום",
  "הפקדה חודשית".
- **Lines under a chart** speak about the reader's own figures (how much of
  their money is above the exemption), one or two lines.
- **Notes and caveats** are one sentence each, beside the figure they
  qualify, not collected at the bottom of the page.
- **Status words** say what happened, in the passive: "נשמר", "לא הוזן",
  "ההעתקה לא הצליחה". Ongoing work: "טוען…".
- **Missing data:** say what is missing and why: "אין נתון: הבנק לא מפרסם
  אם קרנות סל כלולות". Never a value beside "אין נתון".
- **Term explanations:** one sentence, in everyday words, with its source,
  as in the glossary.

## Numbers and punctuation

- Isolate every number, date and identifier inside Hebrew so it doesn't flip.
- Shekels after the number with a space. A whole amount never shows agorot
  (`10 ₪`, not `10.00 ₪`). Agorot depend on the kind of value: a figure set
  by law or a price from a price list keeps the agorot it prints
  (`5,645.29 ₪`, `9.90 ₪`); what the site calculates shows whole shekels
  (`952 ₪`), in tables too, except a cost under 10 ₪ (`3.20 ₪`). Percent
  attached: `0.8%`.
- Dates as `22.10.2026`; a month in words when the figure is monthly
  ("ספטמבר 2026").
- A maqaf with no spaces between a prefix and a number, code or Latin word:
  "ב־2026", "מ־1,000 ₪", "ה־ETF".
- Gershayim in acronyms: אג״ח, עו״ש, מק״מ. Quotation marks ״…״ around a
  quoted name or label.
- A range with "עד": "0% עד 10%", not a dash.
- A full stop at the end of every sentence, even two words ("לא הוזן."). No
  full stop on labels, headings, chips, buttons or list items.

## Where the words go

- Interface strings in `site/app/copy.ts`; guide prose in
  `site/app/content/guide/`. Never hard-coded in a component.

## Check it

- Read the sentence in place on the built page, with what's above and
  below it.
- Would someone understand it from the site alone, without a note in chat?
  If not, rewrite it.

## Writing to the founder

- Plain English, short, no internal codes or ids.
- Every figure carries its assumption. Keep what was read apart from what was
  inferred.
- See [working-with-the-founder.md](working-with-the-founder.md).
