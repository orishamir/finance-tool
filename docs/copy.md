# Hebrew copy: voice, style guide and word choices

The rules for writing the site's words are in `guidelines/wording.md`, and they win where this file disagrees. This file
holds only what they don't: the word choices with their reasons, by topic (sections 2 to 9), the term table (10.3), and the
finer Hebrew detail the guideline leaves out (sections 1 and 10). The strings the site shows are in `site/app/copy.ts`; the
prose of the guide and exposure pages is in `site/app/content/`; names, questions and answers that belong to a record are in
its file under `data/`. Financial terms and their one-line explanations are in `docs/glossary.md`, each with its source in
the il-finance rule base. A code comment that cites an older per-screen section of this file (3.x, 6.x to 9.x) now means the
string in `copy.ts` beside it.

The founder asked Claude to settle the wording. Builders write Hebrew to `guidelines/wording.md` and section 10; fresh readers run when the founder asks. Where a choice below names the founder, it is his.

---

## 1. Voice

What the guideline's voice, sentence and word-choice rules don't already say:

- **Words that add something.** Beyond what the guideline says: not how the site checks or sources its numbers (the source and terms lines every number carries, CLAUDE.md "Every number traces to a source", are not such sentences), nothing about who made the site, and no name followed by itself in brackets. Under a result it speaks of the reader's choices (founder, 2026-11-02: "no you dont need to repeat what is written above. you need to say things about the user's choices there"; 2026-10-25: "you dont have to mention this in the actual sentence yeah?"; 2026-11-05: "remove the ()"). A line that every card or row of a list would carry is said once, above it.
- **The exact word.** Say which: income tax or capital gains tax, never a bare "מס" where either could be meant; whose money (the employer's deposit, the person's own, the gains the fund made); a percent of what; inflation (the rise of prices) or an index's rise; and, where two figures stand together, which one the calculation uses (founder, 2026-11-02: "בכל מקום תבדיל בין מס רווחי הון למס הכנסה, שיהיה ברור"; "תהיה ספציפי יותר"; 2026-11-04: "its not clear which of these is being used - 0.07 or 0.15").
- **Spelling:** ktiv maleh throughout (the list of spellings is in 10.8).
- **Names:** products, tracks and companies appear exactly as their source writes them. The site's words go beside them, never instead of them.
- **No typed numbers.** Every figure comes from the number component with its source. In this file a figure's place is shown as `{שם}`, for example `{סכום}`, `{תאריך}`, `{שנים}`. Placeholders are filled by the site with value objects, never by typed figures; one and two are words ("מסלול אחד", "שני מסלולים"), from three a number.
- **Financial terms:** the first time a term from the glossary appears on a page, it can be tapped for its one-line explanation (`docs/glossary.md`), wherever on the page that first use falls, a calculator's or chart's words and a word behind a prefix such as וכשה included (a reader met קרנות סל and מק״מ unexplained in a page's first lines while their marks sat lower, 2026-11-07; the government bond's calculator said עמלה above its mark, and a mark sat on the verb מנפיק, the same day). A term is marked where it is a term: not on a verb or an everyday word that shares its spelling. Use the official Hebrew term from the glossary, not a synonym.
- **Plural forms:** years, months and days follow Hebrew forms, not a digit plus a fixed word: שנה, שנתיים, `{n}` שנים; חודש, חודשיים, `{n}` חודשים. Build them with `Intl.PluralRules('he')`.
- **Codes:** a rule or open-question code follows its words and is never in brackets at the end of a sentence: "שאלה פתוחה: TXK OQ10". In the number sheet a formula's or flag's code stays beside its Hebrew name.
- **Isolation:** a string that holds a Latin word or a code (S&P 500, TXK OQ10, ISIN) wraps it in an isolating element.
- **Length:** labels are short on purpose: the phone width allows about 18 Hebrew characters on a segmented-control button and 30 on a chip.

---

## 2. The site, the home page and search

- **"להבין חיסכון והשקעה בישראל, עם מקור לכל מספר."** under the site name: the reader learns what the site does and the one thing that sets it apart in a single line. Rejected: "מה כל מוצר חיסכון עושה, כמה הוא עולה ואיך הוא ממוסה." (repeats the first door) and "חיסכון והשקעה בעברית פשוטה. אף אחד לא מקבל עמלה." (true, since the site has no referral or agent links, but it leads with suspicion).
- **No page speaks of a goal** (D37): the indices page, the fee page, the guides, the exposure pages and the track browser run on their own numbers (D34, D54).
- **A search row says which page it opens.** A guide's row reads **"עמוד המדריך"** under the page's own name, and **"עמוד המדריך על {שם}"** under another name it is known by, so two pages found by one name ("IRA") never show the same row. The part of a guide a question leads to is **"{שם המוצר} · {כותרת החלק}"** over **"חלק מעמוד המדריך"**; when a comparison page stands beside the guide, the group's heading is **"מדריך והשוואה"**. Rejected: "החלק במדריך שעונה על זה" (the site matched words; it does not know that the part answers the question).
- **"למי ששלח לכם את האתר"** in the search's empty state: every friend reached the site through the founder's link, so this names the right person without naming anyone.
- **The narrator is "האתר".** The site speaks of itself in the third person ("האתר לא הצליח לחשב…", "לפי הנתונים של האתר", "מוצרים שהאתר מכיר"), never "אנחנו". When it reports work in progress it speaks in the singular, as "טוען…": "בודק…", not "בודקים…".
- **A page is named for what a person would call it, or come to do there**, not by the site's category for it: "בחירת קופה ומסלול" left open which fund and which track (founder, 2026-10-30: "think about it like 'what would the page's name be?'"; 2026-10-31: "seems too generic").
- **Pages are named by their titles.** "שולחן העבודה" was a word of the documents; a sentence that points to another page quotes its title ("כל המסלולים בכל החברות"). Document ids (D11, D20), method gap codes (G-24) and developers' words ("קלט", "מוצמדים", "מנוע החישוב", "קטלוג", "סדרות", "ברשומה") stay out of what a reader sees.
- **"יתווסף בהמשך"** is the register for pending work, and only while it is still true. The guide's "האתר עוד לא מחשב את זה" line says **"יתווסף בגרסה {מספר}"**, not "מתוכנן לגרסה", because the component appends a release number; the number stays until the code drops it.

## 3. Numbers, sources and their state

- **"הזנתם"** for a value the person entered: the key, the number sheet's line and the diff row. A chart's field says nothing of the kind: what the reader types there looks the same as its default (founder, 2026-11-08, guidelines/charts.md). It replaced "הוזן על ידך", which is second person singular masculine and broke the address rule.
- **"לפי החברה"** for a figure from a bank's or managing company's document. It replaced "מוסדי", which in Israeli finance reads as "institutional", that is, more authoritative. Its one-line explanation is unchanged.
- **One word per source strength**, the same in every place: "מקור ראשי", "לפי החברה", "מקור משני" or "משני", "שאלה פתוחה". "ראשוני" and "פתוח" are not used. A figure or rate that rests on the site's own reading of official texts (the engine's `reading` label, a rate the law sets whose reach to this product no official text states) says **"קריאה של האתר"** (`ReadingTag`), never "מקור משני": a reading is not a secondary source (2026-11-07). A copy of an official text is never a source, so no strength word names one.
- **"פרמטר של האתר"** for a value the site sets (not "ערך של האתר"), except a chart field's starting value, which is a plain number with no tag (founder, 2026-11-08), and **"התרחיש לדוגמה"** for P-05 wherever a run rests on it, as the parameters page names it; never "תרחיש הדגמה" or "התרחיש המייצג". "הרשומה המייצגת" names the instrument P-05 names, and "מסלול מייצג" its track.
- **The parameters page names each parameter and its pages in words.** A card's heading is the parameter's name, never its code ("סף תיקו", "התרחיש לדוגמה", "העובדות שהאתר מבליט", "סוגי החיסכון שבעמוד הראשון"), and **"משמש ב:"** is followed by the pages that read it, each a link by its plain name: "העמוד הראשי", "עמודי המדריך", "עמוד החוקים והכללים", "עמוד העמלות", "עמוד המדדים", "עמוד הפיקדונות". A label names an assumption in words, without its code in brackets.
- **"רשומה שנאספה"** for a hand-collected file under `data/`: "רשומה" stays only as this glossary term.
- **"עוד לא דווח"** for an empty fee field in the regulator's data, everywhere: an empty field is not zero. Not "טרם דווח". **"אין"** is shown instead where a rule allows no such fee (a deposit fee on a product that may charge only from the balance, PF-06), without a caution mark.
- **"לא נאסף" / "עוד לא נאספו"** says what the site has not collected; it never implies that a product or provider is missing or worse.
- **Claim only what is known.** A condition says what it is measured on, in the rule's own terms: the balance or the amount taken out, the whole sum or a part, the person or whoever made the deposits ("כשהיתרה בקופה לא עולה על מה שהופקד בה", not "מי שמושך לא יותר ממה שהפקיד", when the rule speaks of a lump sum at or below the deposits and a partial withdrawal is split pro rata; checker, 2026-11-07). An unknown is said as unknown, never as a fact ("מס רק במכירה" where the site does not know what happens to the tax while the fund accumulates); a value the site filled in is a starting value, never "not entered"; "רוב" only for more than half; a promise ("updated monthly", "will appear on the page …") only while the data and the site keep it (founder, 2026-11-05: "its not that its 'מס רק במכירה' its that we dont know what happens to the מס while its accumulating"; 2026-11-02: "למה כתוב שלא הזנתי אחוזים, הכל מוזן בdefault"; 2026-11-03: "says it should update monthly and wasnt updated since september").
- **A figure that looks impossible says how it can be.** A fund ahead of the index it tracks, a loss far larger than its neighbour's, a very large profit, a rate in a sentence: the words beside it say where it comes from and why it can be, or the figure is checked before it goes up (founder, 2026-10-29: "how are they achieving a higher yearly return than the index they are tracking?"; 2026-11-02: "מזה הרווח הענק הזה?", "לא ברור מה כתבת עם ה31%").
- **Say what the source gives, not only what it lacks.** Where a source does not have a value the site would show (a date, a fee, a figure), the words say what it does give in its place: the date of the part that holds the figures, a version, a date it misprints, or that it prints nothing and when the site collected it. A label that only says something is missing, in a warning colour, reads as a fault in the figures and tells the reader neither whether to trust them nor how old they are; it is plain colour unless the reader should act on it (founder, 2026-11-07: three banks and an investment house read "ללא תאריך פרסום", though their price lists date each part or print no date at all). The price list's date line is the kit's `TariffDate`.
- **"החברה קובעת"** for a figure a company sets, in the active voice, so it is not confused with the strength tag "לפי החברה".
- **"עד"** before a "worth knowing" figure that is a legal cap, so a cap never reads as the rate charged. A cap set in the fee regulations is "שבתקנות", not "שבחוק" (a scan in `kit/guards.test.ts`, guard 18, fails "התקרה שבחוק" and "התקרה בחוק" in the copy, the guide prose and the records, 2026-11-07).
- **"ריבית הבנק, בתוקף מ־{תאריך}"** for a deposit's own rate: the date is the record's `effective_from`, which can be after today; it is not a publication date.
- **No typed figure even for a fixed count:** a default reads "ברירת המחדל: החודש האחרון", paging reads "להציג עוד" with no page size, and an age, a rate or a period in a flag is its rule's figure, read through a `{ID:figure}` slot (`{ID:figure.from}` for the month it takes effect), never typed in digits or in words (D108, D111).

## 4. Laws and rules, documents and questions

- **"חוקים וכללים"** is the name of the set of records (the founder: the state's laws and everyone else's rules), and **a single record has no noun**: a card is "id · title". So "לכל החוקים והכללים", "מאגר החוקים והכללים", "החוקים והכללים ש…"; "{code}" alone, not "הכלל {code}"; "הנוסח", not "נוסח הכלל". A sentence that needed a noun for one record is rephrased: "אין תשובה על זה", "חסר במאגר החוקים והכללים", "לא נמצא מקור ש…", "שאלה פתוחה", "רקע בלבד". "חוק או כלל" appears only where nothing else reads well (the rule card's screen-reader label, a one-record count such as "נמצא חוק או כלל אחד", "לא נמצא חוק או כלל"). Words that only look alike are left alone: "בדרך כלל", "כלל הציבור", "נכלל", "כללי", the site's own fit rule ("אין כלל לסיווג הזה") and "כלל התיישנות".
- **"מאגר החוקים והכללים"** for the rule base, never "בסיס הכללים". A rule text the bundle lacks always gets the same one sentence.
- **Text a record holds is rendered from the record, never retyped**: a rule's text with its chip (a condition, a protection line, a statement field), an exposure's name (`names.he[0]`) and its one-line explanation (`one_line_he`).
- **A topic's Hebrew name, never a file name**, on the page; a file without a name in the map shows "נושא נוסף במאגר החוקים והכללים". The reader's names of the topics drop the "מס:" prefix.
- **"מראה מקום"** for a citation (the founder: "הפניה" is not the Hebrew word for it).
- **"נבדק"** followed by the date, with no colon: a sentence fragment.
- **One date, one word.** The day the site read a record (a fee record's `snapshot`) is "נאסף ב־" on every page that shows it; "נבדק ב־" promises that someone confirmed the document is still the current one, and two words for one date read as two promises (fresh readers, 2026-11-07: "נבדק" on the companies list and "נאסף" on the bank's page for the same 04.11.2026: "Is 'collected' the same as 'checked that it's still the current one'?").
- **"שאלה פתוחה"** for a rule without a source, its code after the words; its sign is **"מנעול"** ("מסומן במנעול", not "בנעילה").
- **"מי מפקח ומה מוגן"**: three parallel questions in the reader's words, not "גוף" or "רגולטור".
- **"החישובים באתר"**, not "מנוע החישוב"; **"מספר מתוך המאגר"** for a figure among the search results, not "מספר בכלל", which reads as "a number at all".
- **The common questions** (P-09, `question_he`) are spoken questions with no number inside them and no "ידעתם?"; each names who charges or which product ("כמה דמי ניהול מותר לחברה לגבות?", "הכסף בפיקדון בבנק מבוטח?"), and a question that has a rule's own title uses it ("מתי אפשר למשוך קרן השתלמות בלי מס?", TXH-09).
- **"שווה לדעת"**: its line does not promise a count of facts.
- **"עמית מוטב"** in the F-32 headline and the pension guide: the law's term (TXP-03), and it opens its one-line explanation; "מי שהפקדותיו מגיעות לסף שבחוק" was masculine and said less.
- **"כשעוברות {שנים} מההפקדה הראשונה"** for the exit after a wait: it names where the clock starts (TXH-09: from the first payment into the fund); "רק אחרי {שנים}" left the reader guessing.
- **Names of publishers** (`data/sources/publishers.json`): regulators and ministries by their official names (רשות המסים, רשות שוק ההון, ביטוח וחיסכון, רשות ניירות ערך, בנק ישראל, המוסד לביטוח לאומי, הכנסת, הלשכה המרכזית לסטטיסטיקה, הבורסה לניירות ערך בתל אביב, מאיה (מערכת ההודעות של הבורסה)); `gov.il` is "אתר הממשלה (gov.il)" because its sub-paths cannot be told apart by host, and `documents.json` names the issuing authority; `hly.gov.il` is the official "חיסכון לכל ילד" site; mirrors are ויקיטקסט and נבו; banks and managers by their Hebrew trading names as the site writes them; copies of official documents on private hosts carry "(עותק)"; Latin brand names stay Latin (S&P Dow Jones Indices, iShares, SIPC, LBMA). A host whose Hebrew name is not certain keeps its host as its name.
- **Names of documents** (`data/sources/documents.json`): laws by their official short names with the Hebrew year where it is certain (פקודת מס הכנסה; חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס״ה-2005); regulations in full with the Reshumot year (תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס״ח-2008); a regulation whose year is not certain is named without one; CMA circulars as "חוזר גופים מוסדיים {code}: {name}"; Bank of Israel directives as "הוראת ניהול בנקאי תקין {n}: {name}"; Sefer HaChukim issues as "ספר החוקים {n} ({date}): {the amending law}".

## 5. Fees and prices

- **"תעריפון"** for a provider's price list, for banks, brokers and managing companies alike: the glossary's headword and the banks' own word. Not "תעריף", and not "מחירון", which is the person's word, not the site's.
- **"דמי ניהול מחיסכון"** and **"דמי ניהול מהפקדה"**, the glossary's terms, everywhere; "מחיסכון" and "מהפקדה" alone where the column or group head already says "דמי ניהול". Never "מצבירה" or "מההפקדות" as the site's word; the holdings form shows the statement's word beside it ("מחיסכון (בדוח: מהצבירה)").
- **"הוספה"**, not "עמלת הפצה", for the schema's `load`: the law's purchase load (MF-21). The distribution fee (MF-24) is a different fee, paid by the fund manager to the bank, and is not a line the saver pays.
- **"שכר נאמן"**, not "דמי נאמנות" or "דמי נאמן": the law's and the glossary's term (MF-20).
- **"דמי ניהול משתנים"** is described by the gap between the fund and its index, which can run the other way, not by "the fund's performance" (ETF-14). **"ניכוי בפדיון"** is said to apply only where the fund agreement provides it (MF-22).
- **"מנהל הקרן"**, not "יצרן הקרן"; **"דמי ניהול של החברה המנהלת"** for an IRA manager's fee, not "של המסגרת"; **"עלויות הקרן"**, not "דמי הקרן"; **"דמי הביטוח בקרן הפנסיה"**, not "עלות ביטוח" (PEN-15), and the hint says what the cover is before it says why the site asks.
- **"הפרש עקיבה"** is the glossary's term for the gap between a fund and its index.
- **The three fee levels** (D4) are **"תעריפון · ממוצע שפורסם · ההצעה שלכם"**: "ממוצע שפורסם" covers the Bank of Israel's and TASE's averages without naming a regulator that TASE is not; "ההצעה שלכם" says whose number it is.
- **"ממוצע הרשות לכל המסלולים מהסוג {סיווג}"** names what F-68 computes: the regulator's data, averaged by the site across one classification, and says it is every track of that kind, not one fund (a reader asked "which fund is this?", 2026-11-07). One measure: the mean alone, the figure the verdict and the field use; no median beside it, which read as "the fee is normal" where it equalled the fee (2026-11-07).
- **"אין ממוצע להשוואה"** rather than "אין נתון": a number exists somewhere (the Bank's, TASE's, the ISA's); the site may not show it or has not confirmed it, and the reason says which. **"אין ממוצע שנאסף"** where the averages exist, are free to read on the publishers' pages and the site may not copy them (D20, D22).
- **The fee verdicts** (F-62): **"שווה להתמקח"**, not "כדאי לנהל משא ומתן" (the founder's own words were "which battles to fight", and P-03's rationale says "שווה שיחת טלפון"; "להתמקח" is the everyday verb and fits a tag; not "שווה שיחה", because the verdict is about the fee, not the call). **"מוצר אחר במקום גבוה יותר"** says F-62's "avoid" as the fact it rests on, and the line under it names the products (2026-11-07: fresh readers read "שווה להימנע" as "שווה להיזכר" and asked "avoid what, the fund?"); not "להחליף": the site does not tell a person to switch. **"לא שווה את הטרחה"** says the effort is not worth it, not that the fee is fair. The page says "המסקנה", not the method's "פסק הדין".
- **"תוספת משילוב עמלות החשבון"** for the interaction remainder on the indices page, **"שילוב העמלות"** where a line has no room (founder, 2026-11-08: readers could not read "העמלות זו על זו"): the name says what the part is, an addition, and where it comes from, the account's fees together; "שארית אינטראקציה" would be opaque and "השפעת השורות יחד" meant nothing beside a bar. The fee page still says **"העמלות זו על זו"** (2026-11-07: "השפעה משולבת: 0 ₪" told fresh readers nothing), with the box that opens on it: "כל עמלה מקטינה את הסכום שעליו נגבות האחרות, ואת מה שהיה צומח ממנו; החלק הזה לא שייך לעמלה אחת".
- **"אבקש הצעה"** in the negotiation text: the first person future is gender-neutral and is what the person will say; the site's voice stays out of the text, which quotes a public number and its source and commits to nothing.
- **"לפי העלות, מהזולה ליקרה"**, not "מהזולה לגבוהה".
- **Short names on the fee chart:** every fee kind has a short direct label ("ניהול מחיסכון", "קנייה ומכירה", "בתוך הקרן" …), so each label is one line and none overlaps the next (the founder's screenshot); the legend and the readout keep the full names.

## 6. Comparisons and results

- **The outcome words** (F-83): **"מוצגת, לא מדורגת"** in the singular and **"מוצגות בלי דירוג"** in the plural, rather than "לא דורגה": the option is on the page with a value and only kept out of the order (method B3). **"לא מתאימה לכם"** for "not eligible": a rule bars this person or this money, and the wording points at the fit, not at a fault. **"נפסלה לפי האילוץ שלכם"** keeps the constraint the person's own, so a result the person narrowed is not read as the site's view. **"עוד לא נבדקה"** says the site has not evaluated it, never that it is worse.
- **"שקולה"** rather than "תיקו": everyday Hebrew for "as good as", read as a statement about the goal ("למטרה הזו"), which is what D5 means.
- **"נעול עד {תאריך}"** names the date, not the years: a date is what the person will plan around (D16).
- **The headline names the option after the subject word**: "מבין {n} האפשרויות שדורגו, האפשרות שמשאירה לכם הכי הרבה כסף במועד המטרה היא {שם}." The subject "האפשרות" or "החשיפה" keeps the agreement right when the product's own name is masculine (פיקדון, מק״מ, חשבון ניירות ערך); the short state chips stay feminine by the same convention ("האפשרות דורגה").
- **"ההבדל הגדול ביותר"**, not "מכריע", for the line F-80 computes: it names the largest gap between two options, which need not favour the winner.
- **"מתהפך אם … תעבור מ־… ל־…"** follows F-81's own sentence, with both values as numbers so the size of the move is visible; "התיקו נשבר אם" when the move breaks a tie. The verb agrees with the axis: "שנים עד המטרה" and a fee named in the plural ("דמי ניהול מהפקדה", "הוצאות ישירות") take "ישתנו" ("יעברו" read as years going by; Hebrew editor, 2026-11-07). On the fee page the row's heading names what moves and the sentence never repeats it: "ב־{ערך} במקום {ערך}, המסקנה על {עמלה} עוברת מ״{הכרעה עכשיו}״ ל״{הכרעה חדשה}״.", each verdict in the badge's own words ("מתהפכת: אז לא שווה את הטרחה" read as if the card said "worth it" now when its badge said "avoid", fresh reader, 2026-11-07; and "מתהפכת אם דמי ניהול מהפקדה אחרי ההנחה, מחצי עד כפול תעבור מ־…" put the heading inside the sentence and gave "דמי ניהול" a feminine verb). A sentence built around a name a slot fills says nothing that must agree with that name in gender or number, or picks its word by the name. **A point where the conclusion changes is said as a reader means it** (fresh readers, 2026-11-07: "8.17 שנים" read as oddly precise): years whole, or halves under 3; a return whole from 3, halves from 1, tenths below; a fee in tenths of a percent; rounded away from the value now, toward the side where the conclusion has already changed, so the sentence stays true; the exact point stays in the sheet that opens on it, and a fee row rounds the multiple, so both periods of a discounted fee follow it (`readerRound` in `lib/format.ts`, on the fee page and the comparison).
- **"בכסף של היום"** for real values and **"בשקלים של העתיד"** for nominal ones, rather than "ריאלי" and "נומינלי": the reader sees the difference in the label itself; the glossary still explains ריאלי and נומינלי where they appear in tax text. The switch between them is **"אופן הצגת הסכומים"**, not "מטבע ההצגה": both modes are shekels. A headline's tail names only the parts the run has (fees, tax, or both), then the value mode (the founder: a current account has neither fees nor tax).
- **"השנים עד המטרה"**, not "האופק": "אופק" is the site's word, not the reader's; the glossary keeps it as another name.
- **"מסנן הירידה"** for D11's loss filter: a filter the person sets, not "פרופיל סיכון" or "רמת סיכון", which would read as a score; "ירידה" rather than "הפסד", because the number is a fall in value on the way, not a realised loss. The two labels **"הירידה החמורה ביותר שאתם צופים"** and **"הירידה הגדולה ביותר שתסכימו לספוג"** are long on purpose: each says whose number it is and what it measures. "לספוג" is the everyday word for taking a fall without acting; "לסבול" would be about pain, "לקבל" ambiguous. The exclusion tag sets the two numbers side by side ("צופים … מסכימים לספוג עד …"), so the person can see which to change, and "ירידה שווה למספר שלכם נשארת בהשוואה" says F-71's equal-is-kept rule in the person's terms.
- **"לפי תשואה שהזנתם: {אחוז}"** as a tag on every ranked row: an entered return must never be read as the site's view, so the basis stays next to the figure when the field has scrolled away, and the headline repeats "לפי התשואות שהזנתם". In exposure mode the site says the exposure **"מתאימה למטרה הזו"**, on the person's numbers, never that it is best.
- **"ריבית הבנק שפורסמה"** against "ריבית שהזנתם", so the row says the rate is a published one; **"אין סדרה ממקור"** says why there is none (D20) and what to do.
- **"בחרתי בזה"** in the first person singular: the one place the person speaks, not the site; the confirmation "הבחירה שלכם" returns to the site's voice.

## 7. Coverage and what the site does not cover yet

- **A page that says what the site lacks lists only what it truly lacks, in words.** Its list comes from what the site covers, never from a hand-written list or a glossary section: a term, fee or label the site explains on another page is not on it, and an entry is a kind of holding, not a fee, role, label or event of one. Every blocker is its question in words, never a bare code, and every closure says what closed. Why: a site that contradicts itself about what it knows loses the reader's trust in both pages (founder, 2026-11-07: "we dont know עמלת חליפין?", while the securities account guide explains that fee). A guard keeps it (`site/app/lib/not-covered.test.ts`).

- **The reader's words, not the workflow's.** "חסום", "סגירות", "מצב הכיסוי" and "צומצמה" are how the rule base is kept, not how a reader speaks; a fresh reader read them as "the author's to-do list" (2026-11-07). A row's one line on why it has no guide yet is **"שאלה פתוחה: {השאלה}"**, the question in its own words, or **"{מספר} שאלות עוד פתוחות"** when there are several, which the fold lists. The fold is **"מה כבר ידוע"**. An answered question is said in words, with the rules that answered it as a chip, under **"שאלות שכבר יש להן תשובה"**; with none, the fold leaves the heading out rather than saying so.
- **The list, not a lock.** The page lists what the site knows of and has no guide page for yet (D69), so the lede says that: "אפשרויות חיסכון והשקעה שהאתר מכיר, ועוד אין להן עמוד במדריך", "אפשרויות" rather than "מוצרים", since תיקון 190 is a tax rule. No banner and no "לא מחושב" lock on the rows: the site has no comparison that would compute them, and red with a lock is kept for a number an open rule blocks (guidelines/design.md). The list of what the site never covers agrees with the rows: insurance is out except savings policies and executive insurance, both listed (product D2).
- **No date of when an answer was found.** When the rule base answered a question is the work's record, not something the reader acts on; the row and its fold leave it out. A source keeps its "נבדק ב־" date, as every source on the site does.
- **"לכל השאלות יש תשובה; נותר: …"**: the good news and the remaining work are one line; "נותר" rather than "חסר", because nothing is missing from the person's side.
- **A source's title is shown whole**, never cut with "…": a cut title reads as a broken citation (2026-11-07).
- **No "when it closes" promise on the rows.** A fixed sentence "כשייסגר: יופיע ב…" on every row promised more places than the site would show each kind in. A row says what is known and what is open, nothing about the future.
- **"יש תשובה של מוסד; … לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא"** states D23 without naming it: an institution's answer computes, labelled "לפי החברה", and full coverage still waits for a primary or secondary source.

## 8. Moving to another device

- **"העברה למכשיר אחר"**, as the page title and every link to it, rather than "ייצוא וייבוא": the person's goal is the other device, not the file. "לשמור קובץ" and "לטעון קובץ" name the two halves in verbs a phone user knows; "יובא ב־{תאריך}" uses the formal verb once, as a tag.

## 9. Banks, brokers and funds

- **"אי אפשר להשוות"** rather than "חסר" for a provider the site cannot compare: the provider exists and is listed; what is missing is the comparison, and the reason sentence says what was not collected.
- **"בנקים ובתי השקעות"** as one heading: both are TASE members; the class word on each row tells them apart.
- **Brands** (D33): someone browsing the companies wants a company's products, not its legal structure, so a group's managing company, broker and fund manager are one row and one page under the name people use (`data/sources/brands.json`); the brand page's companies line names the legal companies.
- **"מספר נייר"** for the security number: the bank's order screen says "מספר נייר"; "ISIN" appears only as a record holds it.
- **A fund's payout** is shown as **"צוברת"** or **"מחלקת דיבידנד"**, each with its one-line explanation (MF-49); the glossary's headwords stay "קרן שאינה מחלקת" and "קרן מחלקת".
- **"שיעור הריבית המוצעת (נומינלי שנתי), לפני מס"** is directive 447's own label (BANK-13), kept verbatim so the row matches the bank's table a friend is looking at; the line under it says the rate is the minimum the bank publishes, not an offer.
- **The indices page** keeps the words the founder saw in the mockups: "הבחירה שלכם" beside "★ הזוג הזול ביותר לתוכנית שלכם" (or "הזוג הבא בתור" on the cheapest pair); the chosen fund's row says "הבחירה" and the others their difference from it ("לעומת הבחירה"); the cost is keyed by who takes it ("החשבון:", "הקרן:", "המדינה:"), which replaced "מה יצא בדרך", turned down by the founder.
- **A track's stock exposure** (D34) is "חשיפה בסוף {חודש שנה}", with "לא דווח" for a track that did not report the amounts and "אין נכסים" for one that reported assets of zero.

---

## 10. Style guide

Written by the Hebrew editor from section 1, the word choices above, `docs/glossary.md` and a reading of every interface string. The questions the editor left open were decided; the decisions are in 10.9 and are folded into the rules below.

### 10.1 Register — המשלב

The register, the form words and the voice are in `guidelines/wording.md`. Only what it leaves out:

- כשהאדם מדבר (טקסט להעתקה, כפתור בחירה): גוף ראשון יחיד ("אבקש הצעה", "בחרתי בזה"). זה המקום היחיד שבו יש "אני" באתר.

#### מה נשמע "מתורגם מאנגלית" כאן, מעבר לטבלה שבהנחיה
| סימן | דוגמה | תיקון |
|---|---|---|
| "ההתנהגות שלכם" (your behaviour) ככותרת קטע | כותרת קטע הפעולות בחודש והערוץ | "הפעילות שלכם" |
| "איפה ש" ליעד (where you send it) | "עובר רק איפה שאתם שולחים אותו" | "לאן שאתם שולחים אותו" |
| "X עד Y" כשני מספרים שאינם טווח | "עברה את מסנן הירידה: 20% עד 30%" | "צופים 20%, מסכימים לספוג עד 30%" |
| "סף תיקו", "מכריע", "שקולה" | — | אלה טובים: מילים של עברית מדוברת, לא תרגום. |

### 10.2 Address form — צורת הפנייה

The rule (plural imperative or impersonal, never "אתה" or "את") is in `guidelines/wording.md`. Beyond it:

- "מי ש…" + יחיד זכר סתמי בעובדות על אדם כללי מותר ("מי שההכנסה השנתית שלו עוברת סף"); זה לא פנייה לקורא. אבל צריך התאמה במספר: "למי שנחשב עמית מוטב", לא "למי שנחשבים עמית מוטב".
- ערך שהאדם הזין: "הזנתם", לא "הוזן על ידך" ("על ידך" הוא גוף שני יחיד זכר ומפר את הכלל).
- בתוויות וצ'יפים אפשר גם צורת הסתמי בלי נושא: "לא הוזן", "נבדקו 7 אפשרויות".

### 10.3 Terminology — טבלת מונחים

מונח אחד לכל מושג. השמות הרשמיים (מילון, חוק, רשות) לא משתנים; השמות של האתר לדברים שלו אחידים. העמודה "לא" מביאה את הניסוחים שהוחלפו. בדיקה ב־`kit/ratchets.test.ts` קוראת את העמודה הזו ונכשלת כשאחד מהם חוזר לאתר (חוץ ממילים שההערות מתירות במובן אחר).

| מושג | המונח הקנוני | לא | הערה |
|---|---|---|---|
| דמי ניהול מהצבירה | **דמי ניהול מחיסכון** (מילון, הרשות) | "מצבירה", "מהצבירה" | הקיצור "מחיסכון" מותר כשכותרת הקבוצה היא "דמי ניהול" |
| דמי ניהול מההפקדות | **דמי ניהול מהפקדה** | "מההפקדות" | "מהפקדה" כקיצור; במשפט רץ "מהחיסכון ומההפקדה" תקין |
| שכר הנאמן של קרן | **שכר נאמן** (חוק, מילון) | "דמי נאמן", "דמי נאמנות" | |
| רשימת המחירים של בנק, ברוקר או חברה מנהלת | **תעריפון** | "מחירון", "תעריף" | "מחירון" היא המילה של האדם, לא של האתר |
| אפשרות שעל העמוד אך מחוץ לסדר | **מוצגת, לא מדורגת** (יחיד, מילון) / **מוצגות בלי דירוג** (רבים, משפט הכיסוי) | "מוצגות, לא מדורגות", "מוצגת בלי דירוג" | |
| ספק שאין לו השוואה | **אי אפשר להשוות** | "לא ניתן להשוות" | בתוך משפט: במירכאות, "מופיע שם כ״אי אפשר להשוות״" |
| איחוד שהתקנות אוסרות | **אי אפשר לאחד** | "לא ניתן לאחד" | מול "אפשר לאחד" |
| כלל שאין לו מקור | **שאלה פתוחה** | "פתוח" | הקוד אחרי המילים: "שאלה פתוחה TXG OQ4" |
| סימן של שאלה פתוחה | **מנעול** | "נעילה" | |
| מועד מתן התוקף של נתון | **בתוקף מ־** | | |
| נתון שלא עודכן | **לא עודכן מאז** / **עוד לא דווח** | "טרם" | "אין עדיין" ו"עוד אין" שתיהן תקינות; "עוד" היא בחירת הבית |
| הערכים שהאתר קובע | **פרמטר של האתר** | "ערך של האתר" | |
| הערך שהאדם הזין | **הזנתם** / "תשואה שהזנתם" / "ההצעה שלכם" | "הוזן על ידך" | |
| מצב "לא נבדק" | **עוד לא נבדקה / עוד לא נבדקו** | | "לא נבדק: …" עם סיבה תקין |
| הערך הנשאר | **נשאר לכם** | | |
| ערכים ריאליים / נומינליים | **בכסף של היום** / **בשקלים של העתיד**; לשנה הראשונה: **בשקלים של השנה הראשונה** | | |
| הקצה של אופק המטרה | **מועד המטרה** | | "סוף התקופה" כשאין מטרה |
| הקו המקווקו | **מבוסס על תשואה שהזנתם** | | |
| עמודים של השוואה | שמות העמודים, למשל **כל המסלולים בכל החברות** | "שולחן העבודה" | מילה של המסמכים, לא של האתר |
| סוג ההעסקה | **סוג ההעסקה** (עם ה׳ הידיעה) | "סוג העסקה" | "סוג העסקה" נקרא "סוג של עִסקה" |
| איגרת חוב | **איגרות חוב** (כתיב מלא; מילון) | "אגרות חוב" | |
| תיק מנוהל דיגיטלי | **תיק השקעות דיגיטלי** (מילון) | "יועץ אוטומטי" | |
| מנהל הקרן | **מנהל הקרן** | "יצרן הקרן" | |
| פטור ממס | **פטור/פטורה ממס** | "חופשית ממס" | |
| הממוצע של הרשות | **ממוצע הרשות לכל המסלולים מהסוג {סיווג}** | | |
| הביטוח הלאומי | **הביטוח הלאומי** (עם ה׳) | "מביטוח לאומי" | |
| כיסוי ביטוחי בפנסיה | **דמי הביטוח בקרן הפנסיה**; "למקרה מוות או נכות" | "עלות ביטוח"; "למקרה מוות ונכות" | |
| המילה לפעולה בבורסה | **פעולה** (לאדם), **פקודה** (בהסבר הטכני) | | "פעולות בחודש", "כל הפקדה מתחלקת ל־3 פקודות" |
| הפער בין קרן למדד | **הפרש עקיבה** (מילון) | | |
| הנתונים של בנק ישראל | **לוח הנתונים של בנק ישראל** | "דשבורד" | |
| עמלה שמוצר במקום גבוה יותר בהשוואה לא גובה, או גובה פחות | **מוצר אחר במקום גבוה יותר**, ושמו בשורה שאחריו | "שווה להימנע" | נקרא "שווה להיזכר", ולא אמר ממה להימנע (קוראים, 2026-11-07) |
| החלק של עלות העמלות שלא שייך לעמלה אחת | **תוספת משילוב עמלות החשבון** בעמוד המדדים (**שילוב העמלות** כשאין מקום); **העמלות זו על זו** בעמוד העמלות; עם ההסבר לידו | "השפעה משולבת" | לא אמר לקוראים מה משתלב (2026-11-07); "העמלות זו על זו" לא נקרא בעמוד המדדים (2026-11-08) |

### 10.4 Punctuation and numbers — פיסוק ומספרים

What `guidelines/wording.md` (Numbers and punctuation) doesn't already say:

- **מקף** (הכלל הבסיסי בהנחיה): לפני מילה עברית אין מקף: "נכון לספטמבר 2026", "להסתיר". כשהערך שמתמלא יכול להיות גם לטיני וגם עברי (שם קרן, שם ספק), הרכיב מחליט בזמן ריצה. כך גם תאריך: חודש שמסמך מדפיס לבד נכתב במילים, ולכן "תעריפון מנובמבר 2025" אבל "תעריפון מ־01.10.2026". הכלל נאכף ברכיב, לא בטקסט: תאריך עובר דרך `When` של הקיט עם המילים שלפניו ב־`lead`, ומספר דרך `NumAfter` או `LeadTail` עם `text` (מבחן 21 ב־`kit/guards.test.ts`, 2026-11-07, אחרי "תעריפון מ־נובמבר 2025").
- **גרשיים** (הכלל הבסיסי בהנחיה): גרש (׳) בקיצור: מס׳, צ׳יפ. שם שמגיע מהנתונים (חברה, מסלול, מסמך) כתוב לרוב עם " של ASCII כמו שהמקור מדפיס אותו ("בע"מ"), ולכן כל שם כזה עובר דרך `gershayim` של הקיט במקום שבו הוא מוצג. הכלל נאכף ברכיב ובבדיקה: `scripts/hebrew-quotes.mjs` נכשל אחרי הבנייה על " חדש בין שתי אותיות עבריות בעמודים הבנויים, והשאריות רשומות בשמן ב־`hebrew-quotes-leftovers.json`, רשימה שרק מתקצרת (2026-11-07, אחרי "בע"מ" בשמות החברות).
- **מירכאות:** לא " " של ASCII ולא “ ”.
- **₪ ו־%** מגיעים מהרכיב, לא מהטקסט; בטקסט חופשי כותבים "אחוז" ("אחוז מהשווי").
- **שלוש נקודות (…):** תו אחד (U+2026), צמוד למילה, רק בדיווח על פעולה שנמשכת ("טוען…", "בודק…"). לא בסוף משפט רגיל.
- **נקודתיים** פותחות פירוט או סיבה ("חסום: שאלה פתוחה", "לא נבדק: אין מטרה שמורה"); **נקודה־פסיק** מחברת שני משפטים קצרים שהם עובדה אחת ("השאלות נסגרו; נותר: …").
- **פסיק לפני "ולכן", "אבל", "כי"** כשאחריהם משפט שלם.
- **רשימה בתוך משפט:** פסיקים, ו׳ החיבור רק לפני הפריט האחרון ("מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים").
- **הקוד של כלל/שאלה אחרי המילים**, לא בסוגריים: "שאלה פתוחה TXG OQ4". קודים של החלטות־מוצר (D11, D20) אינם משהו שהקורא יכול לפתוח ולא שייכים לממשק.
- **מספרים ומגדר:** "שני מספרים", "שתי החזקות", "עד ארבע [חשיפות] בבת אחת", "אחת־אחת". **צורת זוגי** חובה ל־2 בשנה/חודש/יום: שנתיים, חודשיים, יומיים; "{n} חודשים" צריך מסלול נפרד ל־2 (סעיף 1, Intl.PluralRules). אחד/שתיים במילים ("מסלול אחד", "שני מסלולים"), מ־3 בספרות.
- **מילה אחרי מספר:** "ב־10 שנים", "4 ימי עסקים", "12 חודשים"; לא "10 שנה".

### 10.5 Buttons, chips and labels — כפתורים, צ'יפים ותוויות

What `guidelines/wording.md` (By kind of text) doesn't already say:

- **כפתור** (שם פעולה או שם פועל, בהנחיה): הציווי שמור למשפטי הנחיה בגוף הטקסט. שתי הצורות חיות באתר זו לצד זו; הכלל: **כפתור קצר של פעולה אחת ← שם עצם; כפתור שמתאר תוצאה או כולל מושא ← שם פועל**.
- **קישור** (ל־ + היעד, בהנחיה): "לעמוד של עו״ש ופיקדון לשנה" מוביל לעמוד שמדבר על שניהם, ודלת "להבין סוג של חיסכון" לא מובילה סתם לרשימה (המייסד, 2026-10-26). עמוד שהוא חלק משלם מקשר גם לשלם (המייסד, 2026-10-24: "why is there no 'all rules' link").
- **תווית שלא אמרה כלום** (הכלל בהנחיה): "בחירה של האתר", "השפעת השורות יחד" ו"שינוי התשובה" לא אמרו לקורא כלום, ושמות של משתנים (a, b) לא מגיעים לעמוד (המייסד, 2026-11-04: "מזה 'השפעת השורות יחד'?"; 2026-11-05: "what is שינוי התשובה??").
- **קישור־שאלה בשורת פריט: שאלה קצרה + ציווי**: "קיבלתם הצעה? הזינו אותה".
- **אורך** (המגבלות בהנחיה): התוויות הארוכות שבאתר, "הירידה הגדולה ביותר שתסכימו לספוג בדרך למטרה", מוצדקות בסעיף 6 ונשארות.
- **צ'יפ מצב:** בינוני סביל נקבה, מתאים ל"אפשרות"/"חשיפה"/"קרן" ("דורגה", "נפסלה", "הושוותה"); ברבים לפי המנייה ("3 דורגו"). זכר רק כשהשם המונה זכר ("דורג 1 מתוך 7 ספקים", "מסלול: מתאים").
- **תווית של ערך:** שם עצם בלבד, בלי נקודתיים כשהערך בשורה נפרדת ("יתרה", "סיווג"); עם נקודתיים כשהערך ממשיך באותה שורה ("מפוקח: {רגולטור}", "סיווג:"). תוויות שורה בגיליון המקור הן שמות עצם, בלי מקף תלוי ("בתוקף מתאריך", "בתוקף עד").
- **לטינית בכותרות ותוויות:** כפי שהמקור כותב: S&P 500, W-8BEN, ISIN, PDF, gov.il. שמות מותגים לא מתורגמים ולא מתועתקים ("iShares"). קודים של רשויות באותיות גדולות (CMA, ISA) נשארים בקוד בלבד; על המסך השם העברי. פורמט הקובץ של קישור בא בסוף, בסוגריים ובבידוד משמאל לימין ("לתעריפון (PDF)").
- **שם לקורא מסך (לא נראה):** תיאורי ובפעולה ברורה: "להגדיל את הגיל בשנה", "עוד פעולה בחודש", "מצב ההשוואה". לא שם של אייקון.

### 10.6 Errors, empty states and hints — שגיאות, מצבים ריקים ורמזים

**שגיאת שדה** (מתחת לשדה, נקודה בסוף):
1. מה לעשות, בציווי רבים, כשיש ערך תקין להציע: "הזינו מספר.", "הזינו אחוז בין 0 ל־100.", "הזינו לפחות שנה אחת."
2. מה אסור, כהצהרה, כשהגבול הוא העובדה: "הסכום לא יכול להיות שלילי.", "המינימום לא יכול להיות גבוה מהמקסימום."
3. השוואה קצרה כשהשדה שלידו ברור: "גדול מהיתרה בעו״ש."
אין "שגיאה", אין "לא תקין" בלי לומר מה, אין סימן קריאה.

**כישלון של האתר** (לא של האדם): "האתר לא הצליח ל…" + מה לעשות: "האתר לא הצליח לחשב. רעננו את העמוד ונסו שוב." כשאין מה לעשות: "האתר לא הצליח לקרוא את הקובץ." אף הודעה של מנוע החישוב ואף קוד של כלל לבדו לא מגיעים לעמוד.

**מצב ריק:** עובדה קצרה + הדרך הלאה כקישור. "עוד אין מה לשמור." "אין קרן שמתאימה לחיפוש." כשהאתר הוא שחסר לו משהו, אומרים את זה בפירוש: "עוד אין לאתר את תנאי המוצר", "הפרטים עוד לא נאספו". לעולם לא מרמזים שהמוצר גרוע.

**חסר נתון לחישוב:** ההודעה נותנת את שם השדה כפי שהוא כתוב בתווית שלו, את כל השדות שעוד חסרים בבת אחת, ואיפה מזינים אותם ("כדי לחשב צריך עוד כמה פרטים: גיל, סוג ההעסקה ודמי הביטוח בקרן הפנסיה. אפשר להזין אותם ב״הנחות נוספות״."). עמוד לא מבקש שדה שאין בו. שדה שהחישוב לא יכול בלעדיו מסומן "(חובה)", ו"(לא חובה)" רק כשהוא באמת לא חובה; הרמז שלו אומר למה הוא חובה. חוסר של האתר (שיטה שעוד לא נקבעה, תנאים שלא נאספו) לא נכתב כבעיה של האדם: לא "בדקו את ההנחות שהזנתם" למי שלא הזין כלום. קישור מוביל רק לעמוד שיש לו תשובה (בדיקה עצמאית, 2026-11-07: עמוד העמלות של קרן פנסיה ביקש שדה שלא היה בו, וארבעה קישורים מהמדריך הובילו לעמוד בלי תוצאה).

**רמז (hint) מתחת לשדה:** משפט אחד, מה הערך ולמה האתר שואל: "בכמה המחירים עולים בשנה, בממוצע.", "מסמן בגרף גילים שבהם הכללים משתנים." כאן מותר הטון החברי: "קצת עליכם", "לדייק (לא חובה)", "שני מספרים, ותראו כמה עולה".

**הודעת "לא נבדק/לא מחושב":** המצב בנקודתיים ואז הסיבה: "לא נבדק: אין מטרה שמורה", "חסום: שאלה פתוחה PEN OQ7", "לא נכלל בחישוב: {שם}." תמיד הסיבה; לעולם לא "לא זמין".

**הבטחות ("יתווסף בהמשך"):** רק כשזה עדיין נכון.

### 10.7 Slang policy — מדיניות סלנג ודיבור

**מותר ונכון (נגיעה קלה של דיבור):** כותרות דלתות ורמזים ("כסף שיושב בעו״ש", "מה כבר יש לכם", "קצת עליכם", "לדייק"), מצבים ריקים, שמות הפסיקה על עמלה ("שווה להתמקח", "לא שווה את הטרחה"), קישורי־שאלה ("קיבלתם הצעה?"), פריטי צ'קליסט ("מי אמר", "בכתב או בטלפון"), "בחרתי בזה".

**אסור:** כל מה שמביא עובדה — כללים, מס, מקור, תאריך תוקף, נוסח של רשות, אזהרות (stale, מקור משני, חסום), הודעות על כסף של האדם, הטקסט להעתקה למוסד. שם: עברית תקנית נקייה, מונחי המילון, בלי קריצות. "המס מנוכה בפדיון", לא "המס יורד כבר בפדיון".

**קו אדום:** אין סלנג אמיתי (אחלה, סבבה, וואלה, פאק), אין אנגלית־בעברית ("אפדייט", "דיפולט", "דשבורד") כשיש מילה עברית מקובלת (עדכון, ברירת מחדל, לוח נתונים). מילים לועזיות שהמילון/הרשות משתמשים בהן נשארות: ברוקר, אינפלציה, רלוונטי, קופון, מינימום/מקסימום.

**"אמא שלכם לא תבין" מבחן:** אם משפט דורש היכרות עם המסמכים הפנימיים של האתר ("שולחן העבודה", "קלט", "D11", "רשומה") — לכתוב אותו מחדש במילים של העמוד או של הקורא. "רשומה" נשארת רק כמונח שהמילון מגדיר (רשומה שנאספה).

### 10.8 Grammar checklist — רשימת בדיקה דקדוקית

- התאמה במין ובמספר של בינוני ופועל לשם המונה המובלע: "אפשרות"/"חשיפה"/"קרן" → נקבה; "ספק"/"מסלול"/"מוצר" → זכר. כששם המוצר עצמו נקרא בכותרת ("פיקדון בנקאי היא הטובה ביותר") ההתאמה נשברת; פותרים במבנה שבו המילה המונה היא הנושא ("האפשרות הטובה ביותר … היא פיקדון בנקאי").
- "זה/זו/זאת" לפי מין השם: "זו לא הורדה", "זה לא קובץ של מקור".
- סמיכות: ה׳ הידיעה על הסומך בלבד: "סוג ההעסקה", "ממוצע הרשות", "שכר הנאמן של הקרן".
- כתיב מלא: איגרת, הכול, בסך הכול, תוכנית, ממדים (לא "מימדים"), ייתכן, אוכלוסייה, שתיים/שתי.
- "אי אפשר" (שתי מילים), "בלי" (לא "ללא" אלא בתוויות קצרות: "ללא תקרה" — תקין כתווית; "בלי תאריך מודפס" ולא "ללא תאריך פרסום", ראו סעיף 3).
- "עוד לא" ברירת המחדל לשלילת זמן; "עדיין" מותר אחרי "אין" כשהוא כבר כתוב ואין טעם לשנות; לא "טרם".
- "לאן" ליעד, "איפה" למקום: "לאן שאתם שולחים", "איפה זה בתלוש".
- "מתוך" / "מזה" לחלק מכלל: "דורג 1 מתוך 7", "מזה מס במכירה" (מקובל בטבלאות כספיות).
- לא "בכדי"; "כדי".
- אחרי "אם" בעתיד: "אם יורידו ל־", "מתהפך אם … תעבור".
- שתי הערות סמוכות שנראות כשני כללים הפוכים אומרות במה הן שונות: "תקרה כתובה נספרת" ליד "תקרה כתובה לא נספרת" נקרא כסתירה עד שכתוב מי קובע את המחיר (בית ההשקעות או גוף בחו״ל), ויוצא מן הכלל אומר למה הוא יוצא ועל מה הוא חל (קוראים חדשים, סבב 3, 7.11.2026). "סכום" ו"תקרה" לא באים יחד על אותו מחיר: סכום נקרא קבוע.
- שורה שמונה קבוצה ("כל בנק") אומרת מי בקבוצה, ומה עושה מי שכבר שם: "למי שיפתח שם" נקרא כאילו גם מי שכבר יש לו חשבון שם משלם שוב (קוראים חדשים, סבב 3).

### 10.9 Settled decisions — החלטות שנקבעו

The decisions on the questions the Hebrew editor left open:

1. **כותרות ההשוואה ומין שם המוצר.** המילה "האפשרות"/"החשיפה" היא הנושא, ושם המוצר בא אחריה ("…, האפשרות שמשאירה לכם הכי הרבה כסף במועד המטרה היא {שם}"), כי "{אפשרות} היא הטובה ביותר" נשברת כשהשם זכר (פיקדון, מק״מ, חשבון ניירות ערך, מדד S&P 500). הצ'יפים הקצרים ("דורגה", "נפסלה") נשארים בנקבה כמוסכמה ("האפשרות דורגה").
2. **"הזנתם"** במקום "הוזן על ידך", בכל מקום.
3. **"אי אפשר"** במקום "ניתן / לא ניתן", גם בתוויות הקבועות: "אי אפשר להשוות", "אי אפשר לאחד".
4. **"תעריפון"** לכל רשימת מחירים, גם של חברות מנהלות; לא "מחירון".
5. **"מוצגת, לא מדורגת"** ביחיד (צ'יפ, מילון), **"מוצגות בלי דירוג"** ברבים (כיסוי).
6. **"העברה למכשיר אחר"** גם ככותרת העמוד וגם בקישורים אליו.
7. **"שולחן העבודה"** יצא מהממשק; העמודים נקראים בשמותיהם.
8. **"הפעילות שלכם"** ככותרת הקטע של פעולות בחודש וערוץ.
9. **"ללוח הנתונים של בנק ישראל"** במקום "לדשבורד העמלות של בנק ישראל".
10. **צורת הפנייה** לא משתנה: ציווי רבים וסתמי עובדים היטב, נייטרליים־מגדר, וקרובים לאיך שישראלים כותבים הודעות לקבוצה. "את/אתה" היה דורש הכפלה או סלאשים, ושניהם גרועים מהמצב.

Decided with them: "לפי החברה" replaces "מוסדי" everywhere (legend tag, popover label, tags, the F-44 tax-base tag), because "מוסדי" reads in Israeli finance as "institutional", that is, more authoritative; the narrator is "האתר", not "אנחנו"; "החזקה" replaces "אחזקה"; document ids (D11, D20) and developers' words ("קלט") leave the text; the glossary's "הפרש עקיבה" stays.
