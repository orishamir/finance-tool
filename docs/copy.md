# Hebrew copy: voice, style guide and word choices

This file holds what `site/app/copy.ts` cannot: the site's voice (section 1), the word choices with their reasons,
by topic (sections 2 to 9), and the Hebrew style guide (section 10). The strings the site shows are in
`site/app/copy.ts`; the prose of the guide and exposure pages is in `site/app/content/`; names, questions and answers
that belong to a record are in its file under `data/`. Financial terms and their one-line explanations are in
`docs/glossary.md`, each with its source in the il-finance rule base. A code comment that cites an older per-screen
section of this file (3.x, 6.x to 9.x) now means the string in `copy.ts` beside it.

The founder asked Claude to settle the wording. A builder's Hebrew goes through the Hebrew editor, and words meant for
readers are judged by fresh readers (CLAUDE.md). Where a choice below names the founder, it is his.

---

## 1. Voice

- **Direct and plain.** One idea per sentence. Point first, reason second. No softeners ("נשמח אם"), no exclamation marks, no "שימו לב".
- **Addressing the reader:** plural imperative ("הדביקו", "בחרו", "הקישו") or impersonal ("אפשר", "יש"). Never "אתה" or "את". This keeps every line gender-neutral.
- **Spelling:** ktiv maleh throughout. Gershayim inside acronyms (אג״ח, מק״מ, עו״ש). Maqaf between a prefix and a number or Latin word (ב־2026, ה־S&P 500).
- **Names:** products, tracks and companies appear exactly as their source writes them. The site's words go beside them, never instead of them.
- **No typed numbers.** Every figure comes from the number component with its source. In this file a figure's place is shown as `{שם}`, for example `{סכום}`, `{תאריך}`, `{שנים}`. Placeholders are filled by the site with value objects, never by typed figures; one and two are words ("מסלול אחד", "שני מסלולים"), from three a number.
- **Financial terms:** the first time a term from the glossary appears on a page, it can be tapped for its one-line explanation (`docs/glossary.md`). Use the official Hebrew term from the glossary, not a synonym.
- **Plural forms:** years, months and days follow Hebrew forms, not a digit plus a fixed word: שנה, שנתיים, `{n}` שנים; חודש, חודשיים, `{n}` חודשים. Build them with `Intl.PluralRules('he')`.
- **Codes:** a rule or open-question code follows its words and is never in brackets at the end of a sentence: "שאלה פתוחה: TXK OQ10". In the number sheet a formula's or flag's code stays beside its Hebrew name.
- **Isolation:** a string that holds a Latin word or a code (S&P 500, TXK OQ10, ISIN) wraps it in an isolating element.
- **Length:** labels are short on purpose: the phone width allows about 18 Hebrew characters on a segmented-control button and 30 on a chip.

---

## 2. The site, the home page and search

- **"להבין חיסכון והשקעה בישראל, עם מקור לכל מספר."** under the site name: the reader learns what the site does and the one thing that sets it apart in a single line. Rejected: "מה כל מוצר חיסכון עושה, כמה הוא עולה ואיך הוא ממוסה." (repeats the first door) and "חיסכון והשקעה בעברית פשוטה. אף אחד לא מקבל עמלה." (true, since the site has no referral or agent links, but it leads with suspicion).
- **The question card** on the home page uses everyday words and no finance term. Its heading is **"מה המטרה שלכם?"** (the founder: the card sets a goal, so it asks for the goal; it was "מה השאלה שלכם?"). The button is **"מה הכי מתאים"**, the result page's own title, so one phrase names the answer. The purpose chip **"כרית ביטחון"** is used on the card over the preset's own name "עתודה נזילה", which stays on the goal form.
- **Only the goal pages speak of a goal** (D37): the home page, the goal pages and the track workbench show and read the saved goal; the indices page, the fee page, the guides, the exposure pages, holdings and idle cash never do.
- **"למי ששלח לכם את האתר"** in the search's empty state: every friend reached the site through the founder's link, so this names the right person without naming anyone.
- **The narrator is "האתר".** The site speaks of itself in the third person ("האתר לא הצליח לחשב…", "לפי הנתונים של האתר", "מוצרים שהאתר מכיר"), never "אנחנו". When it reports work in progress it speaks in the singular, as "טוען…": "בודק…", not "בודקים…".
- **Pages are named by their titles.** "שולחן העבודה" was a word of the documents; a sentence that points to another page quotes its title ("כל המסלולים בכל החברות"). Document ids (D11, D20), method gap codes (G-24) and developers' words ("קלט", "מוצמדים", "מנוע החישוב", "קטלוג", "סדרות", "ברשומה") stay out of what a reader sees.
- **"יתווסף בהמשך"** is the register for pending work, and only while it is still true.

## 3. Numbers, sources and their state

- **"הזנתם"** for a value the person entered: the key, the number sheet's line, the state of a field and the diff row. It replaced "הוזן על ידך", which is second person singular masculine and broke the address rule.
- **"לפי החברה"** for a figure from a bank's or managing company's document. It replaced "מוסדי", which in Israeli finance reads as "institutional", that is, more authoritative. Its one-line explanation is unchanged.
- **One word per source strength**, the same in every place: "מקור ראשי", "ראשי (עותק)", "לפי החברה", "מקור משני" or "משני", "ניסיון", "שאלה פתוחה". "ראשוני" and "פתוח" are not used. A primary source read on a mirror says "עותק", the plain word, not "מירור"; the popover names the host, and a law read in a copy is "נוסח החוק (עותק)".
- **"פרמטר של האתר"** for a value the site sets (not "ערך של האתר"), and **"התרחיש לדוגמה"** for P-05 wherever a run rests on it, as the parameters page names it; never "תרחיש הדגמה" or "התרחיש המייצג". "הרשומה המייצגת" names the instrument P-05 names, and "מסלול מייצג" its track.
- **"רשומה שנאספה"** for a hand-collected file under `data/`: "רשומה" stays only as this glossary term.
- **"עוד לא דווח"** for an empty fee field in the regulator's data, everywhere: an empty field is not zero. Not "טרם דווח". **"אין"** is shown instead where a rule allows no such fee (a deposit fee on a product that may charge only from the balance, PF-06), without a caution mark.
- **"לא נאסף" / "עוד לא נאספו"** says what the site has not collected; it never implies that a product or provider is missing or worse.
- **"ניסיון"** for a forum account, the rule base's own label; "ניסיון של אדם אחד, לא חוק ולא כלל" keeps it from reading as advice, and the forum reports together are "עדויות", the honest word.
- **"החברה קובעת"** for a figure a company sets, in the active voice, so it is not confused with the strength tag "לפי החברה".
- **"עד"** before a "worth knowing" figure that is a legal cap, so a cap never reads as the rate charged. A cap set in the fee regulations is "שבתקנות", not "שבחוק".
- **"ריבית הבנק, בתוקף מ־{תאריך}"** for a deposit's own rate: the date is the record's `effective_from`, which can be after today; it is not a publication date.
- **No typed figure even for a fixed count:** a default reads "ברירת המחדל: החודש האחרון", paging reads "להציג עוד" with no page size, and an age in a flag is written in words.

## 4. Laws and rules, documents and questions

- **"חוקים וכללים"** is the name of the set of records (the founder: the state's laws and everyone else's rules), and **a single record has no noun**: a card is "id · title". So "לכל החוקים והכללים", "מאגר החוקים והכללים", "החוקים והכללים ש…"; "{code}" alone, not "הכלל {code}"; "הנוסח", not "נוסח הכלל". A sentence that needed a noun for one record is rephrased: "אין תשובה על זה", "חסר במאגר החוקים והכללים", "לא נמצא מקור ש…", "שאלה פתוחה", "רקע בלבד". "חוק או כלל" appears only where nothing else reads well (the rule card's screen-reader label, a one-record count, "עובדה שלכם, לא חוק או כלל", "ניסיון של אדם אחד, לא חוק ולא כלל"). Words that only look alike are left alone: "בדרך כלל", "כלל הציבור", "נכלל", "כללי", the site's own fit rule ("אין כלל לסיווג הזה") and "כלל התיישנות".
- **"מאגר החוקים והכללים"** for the rule base, never "בסיס הכללים". A rule text the bundle lacks always gets the same one sentence.
- **Text a record holds is rendered from the record, never retyped**: a rule's text with its chip (a condition, a protection line, a statement field), an exposure's name (`names.he[0]`) and its one-line explanation (`one_line_he`).
- **A topic's Hebrew name, never a file name**, on the page; a file without a name in the map shows "נושא נוסף במאגר החוקים והכללים". The reader's names of the topics drop the "מס:" prefix.
- **"מראה מקום"** for a citation (the founder: "הפניה" is not the Hebrew word for it).
- **No copy "for an easy read"** (the founder): a mirror copy is not offered when the rule has an official source.
- **"נבדק"** followed by the date, with no colon: a sentence fragment.
- **"שאלה פתוחה"** for a rule without a source, its code after the words; its sign is **"מנעול"** ("מסומן במנעול", not "בנעילה").
- **"מי מפקח ומה מוגן"**: three parallel questions in the reader's words, not "גוף" or "רגולטור".
- **"החישובים באתר"**, not "מנוע החישוב"; **"מספר מתוך כלל"**, not "מספר בכלל", which reads as "a number at all".
- **The common questions** (P-09, `question_he`) are spoken questions with no number inside them and no "ידעתם?"; each names who charges or which product ("כמה דמי ניהול מותר לחברה לגבות?", "הכסף בפיקדון בבנק מבוטח?"), and a question that has a rule's own title uses it ("מתי אפשר למשוך קרן השתלמות בלי מס?", TXH-09).
- **"שווה לדעת"**: its line does not promise a count of facts.
- **Names of publishers** (`data/sources/publishers.json`): regulators and ministries by their official names (רשות המסים, רשות שוק ההון, ביטוח וחיסכון, רשות ניירות ערך, בנק ישראל, המוסד לביטוח לאומי, הכנסת, הלשכה המרכזית לסטטיסטיקה, הבורסה לניירות ערך בתל אביב, מאיה (מערכת ההודעות של הבורסה)); `gov.il` is "אתר הממשלה (gov.il)" because its sub-paths cannot be told apart by host, and `documents.json` names the issuing authority; `hly.gov.il` is the official "חיסכון לכל ילד" site; mirrors are ויקיטקסט and נבו; banks and managers by their Hebrew trading names as the site writes them; copies of official documents on private hosts carry "(עותק)"; Latin brand names stay Latin (S&P Dow Jones Indices, iShares, J.P. Morgan Asset Management, SIPC, LBMA). A host whose Hebrew name is not certain keeps its host as its name.
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
- **"ממוצע הרשות למסלולי {סיווג}"** names what F-68 computes: the regulator's data, averaged by the site across one classification. "חציון" is the everyday statistics word; the glossary explains it.
- **"אין ממוצע להשוואה"** rather than "אין נתון": a number exists somewhere (the Bank's, TASE's, the ISA's); the site may not show it or has not confirmed it, and the reason says which. **"אין ממוצע שנאסף"** where the averages exist, are free to read on the publishers' pages and the site may not copy them (D20, D22).
- **The fee verdicts** (F-62): **"שווה להתמקח"**, not "כדאי לנהל משא ומתן" (the founder's own words were "which battles to fight", and P-03's rationale says "שווה שיחת טלפון"; "להתמקח" is the everyday verb and fits a tag; not "שווה שיחה", because the verdict is about the fee, not the call). **"שווה להימנע"** keeps F-62's meaning (avoid by choosing differently), and not "להחליף": the site does not tell a person to switch. **"לא שווה את הטרחה"** says the effort is not worth it, not that the fee is fair. The page says "המסקנה", not the method's "פסק הדין".
- **"השפעה משולבת"** for the interaction remainder on the fee page: the costs of fees taken one at a time do not add up to the total because they compound on each other; "שארית אינטראקציה" would be opaque. On the indices page the same part is **"העמלות זו על זו"** (the founder; "השפעת השורות יחד" meant nothing beside a bar), and the box that opens on it says "כל עמלה מקטינה את הסכום שעליו נגבות האחרות, ואת מה שהיה צומח ממנו; החלק הזה לא שייך לעמלה אחת".
- **"אבקש להוריד"** in the negotiation text: the first person future is gender-neutral and is what the person will say; the site's voice stays out of the text, which quotes a public number and its source and commits to nothing.
- **"לפי העלות, מהזולה ליקרה"**, not "מהזולה לגבוהה".
- **Short names on the fee chart:** every fee kind has a short direct label ("ניהול מחיסכון", "קנייה ומכירה", "בתוך הקרן" …), so each label is one line and none overlaps the next (the founder's screenshot); the legend and the readout keep the full names.

## 6. Comparisons and results

- **The outcome words** (F-83): **"מוצגת, לא מדורגת"** in the singular and **"מוצגות בלי דירוג"** in the plural, rather than "לא דורגה": the option is on the page with a value and only kept out of the order (method B3). **"לא מתאימה לכם"** for "not eligible": a rule bars this person or this money, and the wording points at the fit, not at a fault. **"נפסלה לפי האילוץ שלכם"** keeps the constraint the person's own, so a result the person narrowed is not read as the site's view. **"עוד לא נבדקה"** says the site has not evaluated it, never that it is worse.
- **"שקולה"** rather than "תיקו": everyday Hebrew for "as good as", read as a statement about the goal ("למטרה הזו"), which is what D5 means.
- **"נעול עד {תאריך}"** names the date, not the years: a date is what the person will plan around (D16).
- **The headline names the option after the subject word**: "מבין {n} האפשרויות שדורגו, האפשרות שמשאירה לכם הכי הרבה כסף במועד המטרה היא {שם}." The subject "האפשרות" or "החשיפה" keeps the agreement right when the product's own name is masculine (פיקדון, מק״מ, חשבון ניירות ערך); the short state chips stay feminine by the same convention ("האפשרות דורגה").
- **"ההבדל הגדול ביותר"**, not "מכריע", for the line F-80 computes: it names the largest gap between two options, which need not favour the winner.
- **"מתהפך אם … תעבור מ־… ל־…"** follows F-81's own sentence, with both values as numbers so the size of the move is visible; "התיקו נשבר אם" when the move breaks a tie.
- **"בכסף של היום"** for real values and **"בשקלים של העתיד"** for nominal ones, rather than "ריאלי" and "נומינלי": the reader sees the difference in the label itself; the glossary still explains ריאלי and נומינלי where they appear in tax text. The switch between them is **"אופן הצגת הסכומים"**, not "מטבע ההצגה": both modes are shekels. A headline's tail names only the parts the run has (fees, tax, or both), then the value mode (the founder: a current account has neither fees nor tax).
- **"השנים עד המטרה"**, not "האופק": "אופק" is the site's word, not the reader's; the glossary keeps it as another name.
- **The two comparison modes, "לפי מוצר · לפי חשיפה"**: "חשיפה" is already the site's word for what the money is invested in; not "סוג נכס". The first button says **"השוואה לפי מוצר"**, because beside "השוואה לפי חשיפה" a bare "להשוואה" did not say what it compares.
- **"מסנן הירידה"** for D11's loss filter: a filter the person sets, not "פרופיל סיכון" or "רמת סיכון", which would read as a score; "ירידה" rather than "הפסד", because the number is a fall in value on the way, not a realised loss. The two labels **"הירידה החמורה ביותר שאתם צופים"** and **"הירידה הגדולה ביותר שתסכימו לספוג"** are long on purpose: each says whose number it is and what it measures. "לספוג" is the everyday word for taking a fall without acting; "לסבול" would be about pain, "לקבל" ambiguous. The exclusion tag sets the two numbers side by side ("צופים … מסכימים לספוג עד …"), so the person can see which to change, and "ירידה שווה למספר שלכם נשארת בהשוואה" says F-71's equal-is-kept rule in the person's terms.
- **"לפי תשואה שהזנתם: {אחוז}"** as a tag on every ranked row: an entered return must never be read as the site's view, so the basis stays next to the figure when the field has scrolled away, and the headline repeats "לפי התשואות שהזנתם". In exposure mode the site says the exposure **"מתאימה למטרה הזו"**, on the person's numbers, never that it is best.
- **"ריבית הבנק שפורסמה"** against "ריבית שהזנתם", so the row says the rate is a published one; **"אין סדרה ממקור"** says why there is none (D20) and what to do.
- **"מוחזקת במוצר {מוצר}" / "להחליף מוצר"**: the exposure is held in a product, and the person can change which. "מוצר" is the site's word for a wrapper.
- **"בחרתי בזה"** in the first person singular: the one place the person speaks, not the site; the confirmation "הבחירה שלכם" returns to the site's voice.
- **Re-checking a saved comparison:** **"לבדיקה מחדש: {מה} השתנה ב־{תאריך}"** is product 3.9's sentence word for word, with the entry named when there is one; "ללא שינוי מאז {תאריך}" is its mirror, and the date says how long the decision has held. The verdict is two booleans from the engine, so it is a fixed sentence per case (**"הדירוג נשמר" / "הדירוג השתנה"**), a fact, not an opinion. **"מה זז בהשוואה"** says that numbers moved without saying that anything is wrong.

## 7. Coverage and what the site does not cover yet

- **"מצב הכיסוי"** for the status block: the page is about coverage ("מה האתר עוד לא מכסה"), and the block says how far each product is from it.
- **"חסום: {מספר} שאלות פתוחות"**: the lock is the site's sign for an open rule everywhere, and the count says whether it is one question or six.
- **"השאלות נסגרו; נותר: …"**: the good news and the remaining work are one line; "נותר" rather than "חסר", because nothing is missing from the person's side.
- **"עבר לכיסוי מלא"** rather than "שודרג" or "עלה לרמה 1": tiers are a product-doc word; a friend reads "covered in full".
- **"עוד לא נרשמו סגירות."** rather than "לא נסגר כלום": the data file may simply not exist yet, and the sentence says only what the site knows.
- **"כשייסגר: יופיע ב…"** is one fixed sentence: the path is the same for every product, so it is said once, identically, on every card.
- **"יש תשובה של מוסד; … לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא"** states D23 without naming it: an institution's answer computes, labelled "לפי החברה", and full coverage still waits for a primary or secondary source.

## 8. Holdings, consolidation and moving to another device

- **"מה כבר יש לכם"** for holdings: plain words for "what you already hold". One holding is **"החזקה"**, not "אחזקה": the Academy's word and the statements'.
- **"אפשר לאחד" / "אי אפשר לאחד"**: "לאחד" is the everyday verb; the glossary's "איחוד חשבונות" and "העברת כספים בין קופות גמל" are the formal terms and open from the card.
- **"איפה זה בדוח"** mirrors the goal form's "איפה זה בתלוש"; both show only what the rule base holds, and the site never draws a sample statement or says where on the page a field sits.
- **"מצבים שחוסמים העברה"** for PF-17's regulation 4 blocks: cases the person marks, not questions, so a noun phrase.
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

**היעד: חבר שמבין, שבמקרה גם איש מקצוע. לא בנק, לא בלוג.**

- משפט אחד, רעיון אחד. קודם המסקנה, אחר כך הסיבה.
- מילים של דיבור יומיומי משכיל: "אפשר", "אי אפשר", "עוד לא", "שווה", "כדאי", "בלי", "כמה זה עולה". לא מילות טופס: "ניתן", "אינו", "בכדי", "טרם", "לרבות", "במידה ו", "יש לציין".
- בלי ריפוד: לא "נשמח אם", לא "שימו לב", לא סימני קריאה, לא "אנא".
- בלי יועץ־פיננסי־בטלוויזיה: לא "אל תפספסו", לא "הטיפ שלנו", לא הבטחות. האתר מראה מספר ואומר מאיפה הוא.
- כשהאתר מדבר על עצמו: "האתר" בגוף שלישי ("האתר לא מנחש תשואה", "האתר לא הצליח לחשב", "לפי הנתונים של האתר"), לא "אנחנו". פעולה שנעשתה נכתבת בסביל ("השדות … מולאו", "מה שהזנתם נשמר", "ההעתקה לא הצליחה"). כשהאתר מדווח על עבודה שהוא עושה עכשיו: יחיד ("טוען…", "בודק…").
- כשהאדם מדבר (טקסט להעתקה, כפתור בחירה): גוף ראשון יחיד ("אבקש להוריד", "בחרתי בזה"). זה המקום היחיד שבו יש "אני" באתר.

#### מה נשמע "מתורגם מאנגלית" כאן, ואיך מתקנים
| סימן | דוגמה | תיקון |
|---|---|---|
| "לא עדיין" (not yet) | "לא עדיין: החשבון השני נזיל מ־…" | "עוד לא: …" |
| "חופשי ממס" (tax-free) | "העברה … חופשית ממס" | "פטורה ממס" |
| "ההתנהגות שלכם" (your behaviour) ככותרת קטע | כותרת קטע הפעולות בחודש והערוץ | "הפעילות שלכם" |
| "איפה ש" ליעד (where you send it) | "עובר רק איפה שאתם שולחים אותו" | "לאן שאתם שולחים אותו" |
| "קלט" (input) | "חסר קלט: {שדה}" | "חסר נתון: {שדה}" |
| "זה לא" + שם עצם נקבה (it's not a) | "זה לא הורדה" | "זו לא הורדה" |
| "מהזולה לגבוהה" (cheapest to highest) | כותרת טבלת הספקים | "מהזולה ליקרה" |
| "X עד Y" כשני מספרים שאינם טווח | "עברה את מסנן הירידה: 20% עד 30%" | "צופים 20%, מסכימים לספוג עד 30%" |
| "ניתן / לא ניתן" כפועל סתמי | "לא ניתן לומר", "לא ניתנים לשינוי" | "אי אפשר לומר", "אי אפשר לשנות" |
| "סף תיקו", "מכריע", "שקולה" | — | אלה טובים: מילים של עברית מדוברת, לא תרגום. |

### 10.2 Address form — צורת הפנייה

**הכלל העומד נשאר: ציווי רבים ("הזינו", "בחרו", "הקישו") או ניסוח סתמי ("אפשר", "יש", "כדי לחשב צריך"). לעולם לא "אתה"/"את", לא "אתה יכול", לא "שלך".**

- "אתם"/"שלכם"/"לכם" ברבים מותר ונכון ("התשואה שאתם מניחים", "נשאר לכם"). זהו הגוף השני של האתר, והוא נייטרלי־מגדר בפועל.
- "מי ש…" + יחיד זכר סתמי בעובדות על אדם כללי מותר ("מי שההכנסה השנתית שלו עוברת סף"); זה לא פנייה לקורא. אבל צריך התאמה במספר: "למי שנחשב עמית מוטב", לא "למי שנחשבים עמית מוטב".
- ערך שהאדם הזין: "הזנתם", לא "הוזן על ידך" ("על ידך" הוא גוף שני יחיד זכר ומפר את הכלל).
- בתוויות וצ'יפים אפשר גם צורת הסתמי בלי נושא: "לא הוזן", "נבדקו 7 אפשרויות".

### 10.3 Terminology — טבלת מונחים

מונח אחד לכל מושג. השמות הרשמיים (מילון, חוק, רשות) לא משתנים; השמות של האתר לדברים שלו אחידים. העמודה "לא" מביאה את הניסוחים שהוחלפו.

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
| הממוצע של הרשות | **ממוצע הרשות למסלולי {סיווג}** | | |
| הביטוח הלאומי | **הביטוח הלאומי** (עם ה׳) | "מביטוח לאומי" | |
| כיסוי ביטוחי בפנסיה | **דמי הביטוח בקרן הפנסיה**; "למקרה מוות או נכות" | "עלות ביטוח"; "למקרה מוות ונכות" | |
| המילה לפעולה בבורסה | **פעולה** (לאדם), **פקודה** (בהסבר הטכני) | | "פעולות בחודש", "כל הפקדה מתחלקת ל־3 פקודות" |
| הפער בין קרן למדד | **הפרש עקיבה** (מילון) | | |
| הנתונים של בנק ישראל | **לוח הנתונים של בנק ישראל** | "דשבורד" | |

### 10.4 Punctuation and numbers — פיסוק ומספרים

- **מקף (־, U+05BE maqaf) בלי רווחים** בין אות שימוש למספר, לתאריך, לקוד או למילה לטינית: ב־2026, ל־10 שנים, מ־1,000 ₪, ה־API, ב־USD, נכון ל־25.10.2026. לפני מילה עברית אין מקף: "נכון לספטמבר 2026", "להסתיר". כשהערך שמתמלא יכול להיות גם לטיני וגם עברי (שם קרן, שם ספק), הרכיב מחליט בזמן ריצה.
- **גרשיים (״) בראשי תיבות**, לפני האות האחרונה: אג״ח, מק״מ, עו״ש, ני״ע, ארה״ב, חו״ל. גרש (׳) בקיצור: מס׳, צ׳יפ.
- **מירכאות:** ״…״ (גרשיים משני הצדדים) בכל ציטוט של שם או תווית: לפי המטרה ״עתודה נזילה״, מסומן ״אי אפשר להשוות״. לא " " של ASCII ולא “ ”.
- **₪** אחרי המספר עם רווח: 1,234.50 ₪. **%** צמוד למספר: 0.8%. שני הסימנים מגיעים מהרכיב, לא מהטקסט; בטקסט חופשי כותבים "אחוז" ("אחוז מהשווי").
- **תאריכים** DD.MM.YYYY ("22.10.2026"); חודש במילים כשהנתון חודשי ("ספטמבר 2026").
- **טווח:** "0% עד 10%", "8 שנים עד 12 שנים" — במילה "עד", לא בקו מפריד. שני מספרים שאינם טווח לא נכתבים "X עד Y".
- **שלוש נקודות (…):** תו אחד (U+2026), צמוד למילה, רק בדיווח על פעולה שנמשכת ("טוען…", "בודק…"). לא בסוף משפט רגיל.
- **נקודה בסוף משפט**, גם כשהוא בן שתי מילים ("לא הוזן."). בלי נקודה: תוויות, כותרות, צ'יפים, כפתורים, שורות ברשימה של פריטים.
- **נקודתיים** פותחות פירוט או סיבה ("חסום: שאלה פתוחה", "לא נבדק: אין מטרה שמורה"); **נקודה־פסיק** מחברת שני משפטים קצרים שהם עובדה אחת ("השאלות נסגרו; נותר: …").
- **פסיק לפני "ולכן", "אבל", "כי"** כשאחריהם משפט שלם.
- **רשימה בתוך משפט:** פסיקים, ו׳ החיבור רק לפני הפריט האחרון ("מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים").
- **הקוד של כלל/שאלה אחרי המילים**, לא בסוגריים: "שאלה פתוחה TXG OQ4". קודים של החלטות־מוצר (D11, D20) אינם משהו שהקורא יכול לפתוח ולא שייכים לממשק.
- **מספרים ומגדר:** "שני מספרים", "שתי החזקות", "עד ארבע [חשיפות] בבת אחת", "אחת־אחת". **צורת זוגי** חובה ל־2 בשנה/חודש/יום: שנתיים, חודשיים, יומיים; "{n} חודשים" צריך מסלול נפרד ל־2 (סעיף 1, Intl.PluralRules). אחד/שתיים במילים ("מסלול אחד", "שני מסלולים"), מ־3 בספרות.
- **מילה אחרי מספר:** "ב־10 שנים", "4 ימי עסקים", "12 חודשים"; לא "10 שנה".

### 10.5 Buttons, chips and labels — כפתורים, צ'יפים ותוויות

- **כפתור שעושה פעולה: שם פעולה** (שם עצם) או **שם פועל** (ל־): "שמירה", "מחיקה", "העתקה", "ביטול", "לשמור את ההשוואה", "להציג עוד". לא ציווי ("שמרו") — הציווי שמור למשפטי הנחיה בגוף הטקסט. שתי הצורות חיות באתר זו לצד זו; הכלל: **כפתור קצר של פעולה אחת ← שם עצם; כפתור שמתאר תוצאה או כולל מושא ← שם פועל**.
- **קישור ליעד: ל־ + היעד**: "לתוצאה", "לטופס המטרה", "לעמוד המדריך", "לכל הפרמטרים".
- **כפתור שמכניס את האדם למצב של בחירה: שם פועל עם מושא**: "להזין ריבית אחרת", "לחזור לריבית שפורסמה", "להחליף מוצר".
- **קישור־שאלה בשורת פריט: שאלה קצרה + ציווי**: "קיבלתם הצעה? הזינו אותה".
- **אורך:** כפתור עד 3 מילים; צ'יפ עד 4; תווית שדה עד 7 (הארוכות שבאתר, "הירידה הגדולה ביותר שתסכימו לספוג בדרך למטרה", מוצדקות בסעיף 6 ונשארות).
- **צ'יפ מצב:** בינוני סביל נקבה, מתאים ל"אפשרות"/"חשיפה"/"קרן" ("דורגה", "נפסלה", "הושוותה"); ברבים לפי המנייה ("3 דורגו"). זכר רק כשהשם המונה זכר ("דורג 1 מתוך 7 ספקים", "מסלול: מתאים").
- **תווית של צ'יפ** לא חוזרת על היחידה שכבר יש בערך שלו: "תקופה 10 שנים", לא "שנים 10 שנים" (המייסד ראה את הכפילות בעמוד ההשקעה במדד; כל שורות הצ'יפים אומרות "תקופה").
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
- "אי אפשר" (שתי מילים), "בלי" (לא "ללא" אלא בתוויות קצרות: "ללא תקרה", "ללא תאריך פרסום" — תקין כתווית).
- "עוד לא" ברירת המחדל לשלילת זמן; "עדיין" מותר אחרי "אין" כשהוא כבר כתוב ואין טעם לשנות; לא "טרם".
- "לאן" ליעד, "איפה" למקום: "לאן שאתם שולחים", "איפה זה בתלוש".
- "מתוך" / "מזה" לחלק מכלל: "דורג 1 מתוך 7", "מזה מס במכירה" (מקובל בטבלאות כספיות).
- לא "בכדי"; "כדי".
- אחרי "אם" בעתיד: "אם יורידו ל־", "מתהפך אם … תעבור".

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
